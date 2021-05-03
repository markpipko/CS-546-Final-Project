const finvizor = require("finvizor");
const yahooStockPrices = require("yahoo-stock-prices");
const axios = require("axios");
const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
let { ObjectId } = require("mongodb");
const historyData = require('./buySellHistory');

function getMean(arr) {
	if (!arr) {
		throw "Input not provided";
	}
	if (!Array.isArray(arr)) {
		throw "Input is not of type array";
	}
	if (arr.length == 0) {
		return 0;
	}
	let sum = 0;
	for (var i = 0; i < arr.length; i++) {
		sum += arr[i];
	}
	//console.log(sum/arr.length, arr)
	return sum / arr.length;
}

function getSD(arr) {
	if (!arr) {
		throw "Input not provided";
	}
	if (!Array.isArray(arr)) {
		throw "Input is not of type array";
	}
	if (arr.length == 0) {
		return 0;
	}
	var sd = 0;
	let mean = getMean(arr);
	for (var i = 0; i < arr.length; i++) {
		sd += Math.pow(arr[i] - mean, 2);
	}
	sd = Math.sqrt(sd / arr.length);
	return sd;
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

const exportedMethods = {
	async getStock(ticker) {
		if (!ticker) {
			throw "Ticker not provided";
		}
		if (typeof ticker != "string") {
			throw "Ticker not of type string";
		}
		ticker = ticker.trim();
		if (!ticker) {
			throw "Ticker is just spaces";
		}
		ticker = ticker.toUpperCase();
		const data = await finvizor.stock(ticker);
		if (!data) {
			throw "Ticker not found";
		}
		let yahoo_data = await yahooStockPrices.getCurrentPrice(ticker);
		if (!yahoo_data) {
			throw "Ticker not found";
		}
		let string_price = 0;
		string_price = yahoo_data.toFixed(2);
		let if_error = {
			ticker: ticker,
			price: string_price,
			exchange: "N/A",
			industry: "N/A",
			range52W: {
				low: "N/A",
				high: "N/A",
			},
			volume: "N/A",
		};
		if (data.error) {
			return if_error;
		}
		data.price = string_price;
		return data;
	},

	async buy(email, ticker, quantity) {
		if (!email) {
			throw "Email not provided";
		}
		if (typeof email != "string") {
			throw "Email not of type string";
		}
		email = email.trim();
		if (!email) {
			throw "Email is empty";
		}

		if (!ticker) {
			throw "Ticker not provided";
		}
		if (typeof ticker != "string") {
			throw "Ticker not of type string";
		}
		ticker = ticker.trim();
		if (!ticker) {
			throw "Ticker is just spaces";
		}
		ticker = ticker.toUpperCase();

		if (!quantity) {
			throw "Quantity not provided";
		}
		if (typeof quantity != "string") {
			throw "Quantity not of type string";
		}
		quantity = quantity.trim();
		if (!quantity) {
			throw "Email is empty";
		}
		const userCollection = await users();
		const user = await userCollection.findOne({ email: email });

		if (!user) {
			throw "User not found";
		}

		const price = await yahooStockPrices.getCurrentPrice(ticker);
		if (!price) {
			throw "Ticker not found";
		}
		let total_amount = parseFloat(price.toFixed(2)) * parseInt(quantity);
		if (user.cash < total_amount) {
			throw "Not enough cash available";
		}
		let stocksPurchased = user.stocksPurchased;
		if (!stocksPurchased) {
			throw "Stocks purchases could not be found";
		}
		let transactionDetails = {};
		let index = 0;
		for (let i = 0; i < stocksPurchased.length; i++) {
			if (stocksPurchased[i]["ticker"] == ticker) {
				index = i;
				transactionDetails = stocksPurchased[i];
			}
		}
		if (Object.keys(transactionDetails) != 0) {
			let sum =
				parseFloat(transactionDetails.purchaseValue) *
					parseInt(transactionDetails.amount) +
				total_amount;
			let updatedValue =
				sum / (transactionDetails.amount + parseInt(quantity)).toFixed(2);

			let updatedAmount =
				parseInt(quantity) + parseInt(transactionDetails.amount);

			let updatedTransaction = {
				_id: transactionDetails._id,
				ticker: ticker,
				amount: updatedAmount,
				purchaseValue: updatedValue,
				datePurchased: transactionDetails.datePurchased,
			};
			let newUser = user;
			newUser.cash -= total_amount.toFixed(2);
			newUser.stocksPurchased[index] = updatedTransaction;

			let updateInfo = await userCollection.updateOne(
				{ email: email },
				{ $set: newUser }
			);

			let updateHistory = await historyData.addHistory(email, 
				'BUY', 
				ticker, 
				parseInt(transactionDetails.purchaseValue), 
				parseInt(transactionDetails.amount), 
				new Date())

			if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
				throw "Transaction could not be processed";
			}
			return 1;
		} else {
			transactionDetails = {
				_id: new ObjectId(),
				ticker: ticker,
				amount: parseInt(quantity),
				purchaseValue: parseFloat(price.toFixed(2)),
				datePurchased: new Date(),
			};
			let newUser = user;
			newUser.cash -= total_amount.toFixed(2);
			newUser.stocksPurchased.push(transactionDetails);
			let updateInfo = await userCollection.updateOne(
				{ email: email },
				{ $set: newUser }
			);

			let updateHistory = await historyData.addHistory(email, 
				'BUY', 
				ticker, 
				parseFloat(price.toFixed(2)), 
				parseInt(quantity), 
				new Date())

			if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
				throw "Transaction could not be processed";
			}
			return 1;
		}
	},
	async buyOrSell(ticker) {
		if (!ticker) {
			throw "Ticker not provided";
		}
		if (typeof ticker != "string") {
			throw "Ticker not of type string";
		}
		ticker = ticker.trim();
		if (!ticker) {
			throw "Ticker is just spaces";
		}
		ticker = ticker.toUpperCase();

		var today = new Date();
		var tewntyDayPeriod = new Date();
		tewntyDayPeriod.setDate(today.getDate() - 20)
		const prices = await yahooStockPrices.getHistoricalPrices(
			tewntyDayPeriod.getMonth(),
			tewntyDayPeriod.getDate(),
			tewntyDayPeriod.getFullYear(),
			today.getMonth(),
			today.getDate(),
			today.getFullYear(),
			ticker,
			"1d"
		);
		if (!prices) {
			throw "Error with fetching data";
		}

		var closingPrices = [];
		var movingAverage = [];
		let k = 0
		for (var i = 0; i < prices.length; i++) {
			if(prices[i].adjclose != undefined){
				closingPrices[k] = prices[i].adjclose;
				movingAverage[k] = getMean(closingPrices);
				k++
			}
		}
		var sd = getSD(closingPrices);

		var upperBand = [];
		var lowerBand = [];
		for (var i = 0; i < movingAverage.length; i++) {
			upperBand[i] = movingAverage[i] + sd * 2;
			lowerBand[i] = movingAverage[i] - sd * 2;
		}
		const data = await finvizor.stock(ticker);
		if (!data) {
			throw "Error with fetching data from finvizor";
		}
		const yahoo_data = await yahooStockPrices.getCurrentPrice(ticker);
		if (!yahoo_data) {
			throw "Error with feching data from yahooStockPrices";
		}
		var rsi = data.rsi;

		if (upperBand[upperBand.length - 1] <= yahoo_data && rsi >= 70) {
			return "Strong Sell";
		}
		if (lowerBand[lowerBand.length - 1] >= yahoo_data && rsi <= 30) {
			return "Strong Buy";
		}
		if (
			(upperBand[upperBand.length - 1] <= yahoo_data && !(rsi <= 30)) ||
			(rsi >= 70 && !(lowerBand[lowerBand.length - 1] >= yahoo_data))
		) {
			return "Sell";
		}
		if (
			(lowerBand[lowerBand.length - 1] >= yahoo_data && !(rsi >= 70)) ||
			(rsi <= 30 && !(upperBand[upperBand.length - 1] <= yahoo_data))
		) {
			return "Buy";
		}
		//console.log(sd, upperBand[upperBand.length - 1], lowerBand[lowerBand.length - 1], rsi, yahoo_data)
		return "Hold";
	},

	async giveRecommendation(userStocks) {
		let sp500 = await axios.get(
			"https://pkgstore.datahub.io/core/s-and-p-500-companies/constituents_json/data/8caaa9cecf5b6d60a147e15c20eee688/constituents_json.json"
		);

		let myStocks = userStocks.slice();

		myStockTickers = [];
		for (let i = 0; i < myStocks.length; i++) {
			myStockTickers.push(myStocks[i].ticker);
		}

		let myStockData = [];
		let stockRecsNum = 0;
		while (stockRecsNum < 5 && myStocks.length != 0) {
			let randomIndex = Math.floor(Math.random() * myStocks.length);
			myStockData.push(await finvizor.stock(myStocks[randomIndex].ticker));
			stockRecsNum++;
			myStocks.splice(randomIndex, 1);
		}

		let recommendationList = [];
		for (let i = 0; i < myStockData.length; i++) {
			for (let j = 0; j < sp500.data.length; j++) {
				if (!myStockTickers.includes(sp500.data[j].Symbol) && !recommendationList.includes(sp500.data[j].Symbol) &&
						(myStockData[i].sector.includes(sp500.data[j].Sector) || sp500.data[j].Sector.includes(myStockData[i].sector))) {

					recommendationList.push(sp500.data[j].Symbol);
				}
			}
		}

		recommendationList = shuffle(recommendationList);

		//Select first 3-5 (or less) to return
		if (recommendationList.length >= 3) return recommendationList.slice(0, 3);
		else if (recommendationList.length != 0)
			return recommendationList.slice(0, recommendationList.length);
		else return recommendationList;
	},

	async getGraphData(ticker, subtract) {
		var prices = []; //y-axis
		var dates = []; //x-axis
		var today = new Date();
		var monthAgo = new Date();
		monthAgo.setDate(today.getDate() - subtract);
		const stocksData = await yahooStockPrices.getHistoricalPrices(
			monthAgo.getMonth(),
			monthAgo.getDate(),
			monthAgo.getFullYear(),
			today.getMonth(),
			today.getDate(),
			today.getFullYear(), 
			ticker, 
			'1d');
		let k = 0
		let reversedData = stocksData.reverse();
		for(var i = 0; i < stocksData.length; i++){
			if(stocksData[i].adjclose != undefined){
				prices[k] = stocksData[i].adjclose
				let utcseconds = reversedData[i].date;
				let d = new Date(0);
				d.setUTCSeconds(utcseconds);
				dates[i] = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
				k++
			}
		}
		var trace = {
			x: dates,
			y: prices,
			mode: "lines",
		};
		var data = [trace];
		return data;
	},
};

module.exports = exportedMethods;
