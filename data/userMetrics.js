const mongoCollections = require("../config/mongoCollections");
const UserMetrics = mongoCollections.userMetrics;
const users = mongoCollections.users;
const buySell = mongoCollections.buySellHistory;
const stocks = mongoCollections.stocks;
var yahooStockPrices = require("yahoo-stock-prices");
var finviz = require("finvizor");
let { ObjectId } = require('mongodb');

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
	if (stocksPurchased.length == 0) {
		return 0;
	}

	var stocksOwned = 0;
	var totalVolatility = 0;
	for (var i = 0; i < stocksPurchased.length; i++) {
		let ticker = stocksPurchased[i].ticker;
		let date = new Date(stocksPurchased[i].datePurchased);
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
		for (var k = 1; k < prices.length; k++) {
			dailyReturns.push((prices[k].adjclose - prices[k - 1].adjclose) / prices[k - 1].adjclose);
		}

		var mean = 0;
		if (dailyReturns.length != 0) {
			for (var k = 0; k < dailyReturns.length; k++) {
				mean += dailyReturns[k];
			}
			mean = mean / dailyReturns.length;
		}

		var sd = 0;
		if (dailyReturns.length != 0) {
			for (var k = 0; k < dailyReturns.length; k++) {
				sd += Math.pow(dailyReturns[k] - mean, 2);
			}
			sd = Math.sqrt(sd / dailyReturns.length);
			sd = sd * Math.sqrt(dailyReturns.length);
		}
		
		totalVolatility += sd * stocksPurchased[i].amount;
	}
	return totalVolatility / stocksOwned;
}

async function getReturns(email) {
	const userCollection = await users();
	let userList = await userCollection.find({}).toArray();

	const buySellHistory = await buySell();
	const stockList = await stocks();

	let bshData = await buySellHistory.find({}).toArray();

	let person;
	for (var i = 0; i < bshData.length; i++) {
		if (email == bshData[i].email) {
			person = bshData[i];
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
		if (userList[i].email == email) {
			person = userList[i];
			for (var j = 0; j < person.stocksPurchased.length; j++) {
				let ticker = person.stocksPurchased[j].ticker;
				const data = await yahooStockPrices.getCurrentPrice(ticker);
				owned += data * person.stocksPurchased[j].amount;
			}
		}
	}

	let volatility = await getVolatility(person.stocksPurchased);

	let totalReturn = sold + owned - bought;

	let percentGrowth;
	if (bought == 0) {
		percentGrowth = 0;
	}
	else {
		percentGrowth = (totalReturn / bought) * 100;
	}
	
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

	if (metric.totalReturn != totalReturn || metric.percentGrowth != percentGrowth || metric.volatility != volatility) {
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
	}
	else {
		return metric;
	}	
};

const updateEmail = async function updateEmail(id, email) {
	if (!id || typeof id !== "string") throw "Invalid ID Parameter";
	if (!email || typeof email !== "object" || !email.email || typeof email.email !== "string" || email.email.trim() == "")
        throw "Invalid email";

	const metricsCollection = await UserMetrics();

	const updatedInfo = await metricsCollection.updateOne(
		{ _id: ObjectId(id) },
		{ $set: email }
	);

	if (updatedInfo.modifiedCount === 0) {
		throw "Could not update email";
	}

	let newMetric = await get(email.email);
	newMetric._id = newMetric._id.toString();
	return newMetric;
}

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
	updateEmail,
	remove,
};
