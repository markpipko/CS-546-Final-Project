const mongoCollections = require("../config/mongoCollections");
const UserMetrics = mongoCollections.userMetrics;
const users = require("./users");
const buySell = require("./buySellHistory");
//const stocks = mongoCollections.stocks;
var yahooStockPrices = require("yahoo-stock-prices");
var finviz = require("finvizor");
let { ObjectId } = require("mongodb");

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
		volatility: volatility,
	};

	const insertInfo = await metricsCollection.insertOne(newMetric);
	if (insertInfo.insertedCount === 0) throw "Could not add metric";

	const metric = await get(email);

	metric._id = metric._id.toString();
	return metric;
};

const get = async function get(email) {
	try {
		checkStr(email);
	} catch (e) {
		throw e;
	}
	const metricsCollection = await UserMetrics();
	const metric = await metricsCollection.findOne({ email: email });
	return metric;
};

function clean(arr) {
	if (!arr || !Array.isArray(arr)) {
		throw "Array not provided or not of proper type";
	}
	var newArr = [];
	var k = 0;
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].adjclose != undefined) {
			newArr[k] = arr[i];
			k++;
		}
	}
	return newArr;
}

async function getVolatility(stocksPurchased) {
	if (!stocksPurchased || !Array.isArray(stocksPurchased)) {
		throw "Array not provided or not of type array";
	}

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
		var yearAgo = new Date();
		yearAgo.setDate(yearAgo.getDate() - 365);

		var prices = await yahooStockPrices.getHistoricalPrices(
			yearAgo.getMonth(),
			yearAgo.getDate(),
			yearAgo.getFullYear(),
			today.getMonth(),
			today.getDate(),
			today.getFullYear(),
			ticker,
			"1d"
		);
		if (!prices) {
			throw "Error with fetching data";
		}
		try {
			prices = clean(prices);
		} catch (e) {
			throw e;
		}

		var dailyReturns = [];

		for (var k = 1; k < prices.length; k++) {
			dailyReturns.push(
				(prices[k].adjclose - prices[k - 1].adjclose) / prices[k - 1].adjclose
			);
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
	try {
		checkStr(email);
	} catch (e) {
		throw e;
	}
	const user = await users.getUserByEmail(email);
	if (!user) {
		throw "User not found";
	}
	const person = await buySell.getHistoryByEmail(email);
	if (!person) {
		throw "History not found";
	}

	let bought = 0;
	let sold = 0;
	let owned = 0;

	for (var i = 0; i < person.history.length; i++) {
		if (person.history[i].transaction == "BUY") {
			bought += person.history[i].value * person.history[i].amount;
		}
		if (person.history[i].transaction == "SELL") {
			sold += person.history[i].value * person.history[i].amount;
		}
	}

	for (var i = 0; i < user.stocksPurchased.length; i++) {
		let ticker = user.stocksPurchased[i].ticker;
		let data = await yahooStockPrices.getCurrentPrice(ticker);
		if (!data) {
			data = 0;
		}
		owned += data * user.stocksPurchased[i].amount;
	}

	if (bought == 0 && sold == 0) {
		return [0, 0, 0];
	}

	try {
		let volatility = await getVolatility(user.stocksPurchased);

		let totalReturn = sold + owned - bought;
		let percentGrowth = (totalReturn / bought) * 100;

		return [
			totalReturn.toFixed(2),
			percentGrowth.toFixed(2),
			volatility.toFixed(2),
		];
	} catch (e) {
		throw e;
	}
}

const update = async function update(email) {
	try {
		checkStr(email);
	} catch (e) {
		throw e;
	}
	const metricsCollection = await UserMetrics();

	returns = [0, 0, 0];
	try {
		returns = await getReturns(email);
	} catch (e) {
		throw e;
	}
	let totalReturn = returns[0];
	let percentGrowth = returns[1];
	let volatility = returns[2];

	let metric = await get(email);

	if (
		metric.totalReturn != totalReturn ||
		metric.percentGrowth != percentGrowth ||
		metric.volatility != volatility
	) {
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
	} else {
		return metric;
	}
};

const updateEmail = async function updateEmail(id, email) {
	if (!id || typeof id !== "string") throw "Invalid ID Parameter";
	if (
		!email ||
		typeof email !== "object" ||
		!email.email ||
		typeof email.email !== "string" ||
		email.email.trim() == ""
	)
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
};

const remove = async function remove(email) {
	try {
		checkStr(email);
	} catch (e) {
		throw e;
	}
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
