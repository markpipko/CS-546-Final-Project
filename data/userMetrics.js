const mongoCollections = require("../config/mongoCollections");
const UserMetrics = mongoCollections.UserMetrics;
const users = mongoCollections.users;
const buySell = mongoCollections.BuySellHistory;
const stocks = mongoCollections.Stocks;
var yahooStockPrices = require("yahoo-stock-prices");
var finviz = require("finvizor");
//let { ObjectId } = require('mongodb');

function checkStr(str) {
	if (str == undefined) {
		throw "All fields need to have valid values";
	}
	if (typeof str != "string") {
		throw "Input must be string";
	}
	let empty = true;
	for (var i of str) {
		if (i != " ") {
			empty = false;
			break;
		}
	}
	if (empty) {
		throw "Input cannot be empty string";
	}
}

const create = async function create(
	email,
	totalReturn,
	percentGrowth,
	volatility
) {
	checkStr(email);
	if (!totalReturn || !percentGrowth || !volatility) {
		throw "Input is undefined";
	}

	if (isNaN(totalReturn) || isNaN(percentGrowth) || isNaN(volatility)) {
		throw "Must be of type number";
	}

	const metricsCollection = await UserMetrics();

	let newMetric = {
		email: email,
		totalReturn: totalReturn,
		percentGrowth: percentGrowth,
		volatility: volatility,
	};

	const insertInfo = await UserMetrics.insertOne(newMetric);
	if (insertInfo.insertedCount === 0) throw "Could not add metric";

	const newId = insertInfo.insertedId;

	const metric = await get(newId.toString());
	metric._id = metric._id.toString();
	return metric;
};

const get = async function get(email) {
	checkStr(email);
	const metricsCollection = await UserMetrics();
	const metric = await metricsCollection.findOne({ email: email });
	return metric;
};

function getDate(date) {
	return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate() + 1}`;
}

async function getVolatility(stocksPurchased) {
	var stocksOwned = 0;
	var totalVolatility = 0;
	for (var i = 0; i < stocksPurchased.length; i++) {
		let ticker = stocksPurchased[i].ticker;
		let date = stocksPurchased[i].datePurchased;
		stocksOwned += stocksPurchased[i].amount;
		let today = new Date();
		const prices = await yahooStockPrices.getHistoricalPrices(
			date.getMonth(),
			date.getDate(),
			date.getFullYear(),
			today.getMonth(),
			today.getDate(),
			today.getFullYear(),
			ticker,
			"1d"
		);

		var dailyReturns;
		for (var k = 1; k < prices.length; k++) {
			dailyReturns[k - 1] = (prices[k] - prices[k - 1]) / prices[k - 1];
		}

		var mean = 0;
		for (var k = 0; k < dailyReturns.length; k++) {
			mean += dailyReturns[k];
		}
		mean = mean / dailyReturns.length;

		var sd = 0;
		for (var k = 0; k < dailyReturns.length; k++) {
			sd += Math.pow(dailyReturns[k] - mean, 2);
		}
		sd = Math.sqrt(sd / dailyReturns.length);
		sd = sd * Math.sqrt(dailyReturns.length);

		totalVolatility += sd * stocksPurchased[i].amount;
	}
	return totalVolatility / stocksOwned;
}

async function getReturns(email) {
	const userList = await users();
	const buySellHistory = await buySell();
	const stockList = await stocks();

	let person;
	for (var i = 0; i < buySellHistory.length; i++) {
		if (email == buySellHistory[i].email) {
			person = buySellHistory[i];
		}
	}

	let bought = 0;
	let sold = 0;
	let owned = 0;
	for (var i = 0; i < person.history.length; i++) {
		if (person.history.transaction == "BUY") {
			bought += person.history.value * person.history.amount;
		}
		if (history.transaction == "SOLD") {
			sold += history.value * history.amount;
		}
	}

	for (var i = 0; i < userList.length; i++) {
		if ((userList[i].email = email)) {
			person = userList[i];
			for (var j = 0; j < person.stocksPurchased.length; j++) {
				let ticker = person.stocksPurchased[j].ticker;
				const data = await yahooStockPrices.getCurrentPrice(ticker);
				owned += data * person.stocksPurchased[j].amount;
			}
		}
	}

	let volatility = getVolatility(person.stocksPurchased);

	let totalReturn = sold + owned - bought;
	let percentGrowth = (totalReturn / bought) * 100;
	return [totalReturn, percentGrowth, volatility];
}

const update = async function update(email) {
	checkStr(email);
	const metricsCollection = await UserMetrics();

	returns = await getReturns(email);
	let totalReturn = returns[0];
	let percentGrowth = returns[1];
	let volatility = returns[2];

	let metric = await get(email);
	let newMetric = {
		email: metric.email,
		totalReturn: totalReturn,
		percentGrowth: percentGrowth,
		volatility: volatility,
	};

	const updatedInfo = await metricsCollection.updateOne(
		{ email: email },
		{ $set: newMetric }
	);

	if (updatedInfo.modifiedCount === 0) {
		throw "Could not update metrics";
	}

	newMetric = await get(email);
	newMetric._id = newMetric._id.toString();
	return newMetric;
};

const remove = async function remove(email) {
	checkStr(email);
	const metricsCollection = await UserMetrics();
	const deletionInfo = await metricsCollection.deleteOne({ email: email });

	if (deletionInfo.deletedCount === 0) {
		throw "No metric with that email";
	}

	return;
};

module.exports = {
	create,
	get,
	update,
	remove,
};
