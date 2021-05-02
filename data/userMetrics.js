const mongoCollections = require("../config/mongoCollections");
const UserMetrics = mongoCollections.userMetrics;
const users = require('./users');
const buySell = require('./buySellHistory');
//const stocks = mongoCollections.stocks;
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
	try {
		checkStr(email);
	} catch (e) {
		throw e;
	}
	if (!totalReturn && totalReturn != 0) {
		throw "Total return was not provided";
	}
	if (!percentGrowth && percentGrowth != 0) {
		throw "Percent growth was not provided";
	}
	if (!volatility && volatility != 0) {
		throw "Volatility was not provided";
	}

	if (isNaN(totalReturn) || isNaN(percentGrowth) || isNaN(volatility)) {
		throw "Must be of type number";
	}

	const metricsCollection = await UserMetrics();

	let newMetric = {
		email: email,
		totalReturn: totalReturn,
		percentGrowth: percentGrowth,
		volatility: volatility
	};

	const insertInfo = await metricsCollection.insertOne(newMetric);
	if (insertInfo.insertedCount === 0) throw "Could not add metric";

	const metric = await get(email);

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
	if(stocksPurchased.length == 0){
		return 0
	}
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

		var dailyReturns = [];
		var j = 0
		for (var k = 1; k < prices.length; k++) {
			if(prices[k].adjclose != undefined){
				dailyReturns[j] =
					(prices[k].adjclose - prices[k - 1].adjclose) / prices[k - 1].adjclose;
				j++
			}
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
	const user = await users.getUserByEmail(email);
	const person = await buySell.getHistoryByEmail(email);
	//const stockList = await stocks();

	//let bshData = await buySellHistory.find({}).toArray();

	// let person;
	// for (var i = 0; i < bshData.length; i++) {
	// 	if (email == bshData[i].email) {
	// 		person = bshData[i];
	// 	}
	// }

	//TODO: Delete this later
	// person = {}; //For testing
	// person.history = []; //For testing

	let bought = 0;
	let sold = 0;
	let owned = 0;

	for (var i = 0; i < person.history.length; i++) {
		if (person.history[i].transaction == "BUY") {
			bought += person.history[i].value * person.history[i].amount;
		}
		if (person.history[i].transaction == "SOLD") {
			sold += person.history[i].value * person.history[i].amount;
		}
	}

	for (var i = 0; i < user.stocksPurchased.length; i++) {
		let ticker = user.stocksPurchased[i].ticker;
		const data = await yahooStockPrices.getCurrentPrice(ticker);
		owned += data * user.stocksPurchased[i].amount;
	}

	if(bought == 0 && sold == 0){
		return [0,0,0]
	}

	let volatility = await getVolatility(user.stocksPurchased);

	let totalReturn = sold + owned - bought;
	let percentGrowth = (totalReturn / bought) * 100;
	
	return [totalReturn.toFixed(2), percentGrowth.toFixed(2), volatility.toFixed(2)];
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

	// if (.modifiedCount === 0) {
	// 	throw "Could not update metrics";
	// }

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
