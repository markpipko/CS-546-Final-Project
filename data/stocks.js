const finvizor = require("finvizor");
const yahooStockPrices = require("yahoo-stock-prices");
const axios = require("axios");
const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
let { ObjectId } = require("mongodb");
const historyData = require("./buySellHistory");

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
	if (!a || !Array.isArray(a)) {
		throw "Array is undefined or not an array";
	}
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
		if (data.error) {
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
			throw "Quantity is empty";
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
		let total_amount = parseFloat(
			(parseFloat(price.toFixed(2)) * parseFloat(quantity)).toFixed(2)
		);
		if (user.cash < total_amount) {
			throw "Not enough cash available.";
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
					parseFloat(transactionDetails.amount) +
				total_amount;
			let updatedValue = (
				sum /
				(transactionDetails.amount + parseFloat(quantity))
			).toFixed(2);

			let updatedAmount =
				parseFloat(quantity) + parseFloat(transactionDetails.amount);

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

			let updateHistory = await historyData.addHistory(
				email,
				"BUY",
				ticker,
				parseFloat(price.toFixed(2)),
				parseFloat(quantity),
				new Date()
			);

			if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
				throw "Transaction could not be processed";
			}
			return 1;
		} else {
			transactionDetails = {
				_id: new ObjectId(),
				ticker: ticker,
				amount: parseFloat(quantity),
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

			if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
				throw "User information could not be updated";
			}

			try {
				let updateHistory = await historyData.addHistory(
					email,
					"BUY",
					ticker,
					parseFloat(price.toFixed(2)),
					parseFloat(quantity),
					new Date()
				);
			} catch (e) {
				throw "Transaction could not be added to user history";
			}

			return 1;
		}
	},

	async sell(email, ticker, quantity) {
		if (!email) {
			throw "Email not provided";
		}
		if (typeof email !== "string") {
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

		let stocksPurchased = user.stocksPurchased;
		let index = -1;
		for (let i = 0; i < stocksPurchased.length; i++) {
			if (stocksPurchased[i]["ticker"] == ticker) {
				index = i;
				transactionDetails = stocksPurchased[i];
			}
		}
		if (index == -1) {
			throw `You do not own any shares of ${ticker}.`;
		}
		if (quantity > transactionDetails.amount) {
			throw `The quantity you have specified exceeds the amount of ${ticker} you currently own.`;
		} else {
			const price = await yahooStockPrices.getCurrentPrice(ticker);
			if (!price) {
				throw "Ticker not found";
			}
			let sum = parseFloat((price * parseFloat(quantity)).toFixed(2));
			let updatedAmount = transactionDetails.amount - parseFloat(quantity);
			let updatedTransaction = {};
			let newUser = user;
			newUser.cash += sum;
			if (updatedAmount == 0) {
				stocksPurchased.splice(index, 1);
			} else {
				let updatedValue = transactionDetails.purchaseValue;

				updatedTransaction = {
					_id: transactionDetails._id,
					ticker: ticker,
					amount: updatedAmount,
					purchaseValue: updatedValue,
					datePurchased: transactionDetails.datePurchased,
				};
				newUser.stocksPurchased[index] = updatedTransaction;
			}

			let updateInfo = await userCollection.updateOne(
				{ email: email },
				{ $set: newUser }
			);

			if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
				throw "User information could not be updated";
			}

			try {
				let updateHistory = await historyData.addHistory(
					email,
					"SELL",
					ticker,
					parseFloat(price.toFixed(2)),
					parseFloat(quantity),
					new Date()
				);
			} catch (e) {
				throw "Transaction could not be added to user history";
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
		tewntyDayPeriod.setDate(today.getDate() - 20);
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
		let k = 0;
		for (var i = 0; i < prices.length; i++) {
			if (prices[i].adjclose != undefined) {
				closingPrices[k] = prices[i].adjclose;
				movingAverage[k] = getMean(closingPrices);
				k++;
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
		if (!userStocks) {
			throw "User stocks not provided";
		}
		let sp500 = {};
		try {
			sp500 = await axios.get(
				"https://pkgstore.datahub.io/core/s-and-p-500-companies/constituents_json/data/8caaa9cecf5b6d60a147e15c20eee688/constituents_json.json"
			);
			if (!sp500) {
				throw "Error getting SP500 data";
			}
		} catch (e) {
			throw "Error getting SP500 data";
		}

		let myStocks = userStocks.slice();
		let myStockTickers = [];
		let potentialRecommendationList = [];
		if (myStocks.length != 0) {
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
			for (let i = 0; i < myStockData.length; i++) {
				for (let j = 0; j < sp500.data.length; j++) {
					if (
						!(myStockData[i] == sp500.data[j].Symbol) &&
						!potentialRecommendationList.includes(sp500.data[j].Symbol) &&
						(myStockData[i].sector.includes(sp500.data[j].Sector) ||
							sp500.data[j].Sector.includes(myStockData[i].sector))
					) {
						potentialRecommendationList.push(sp500.data[j].Symbol);
					}
				}
			}
		} else {
			for (let i = 0; i < sp500.data.length; i++) {
				potentialRecommendationList.push(sp500.data[i].Symbol);
			}
		}

		potentialRecommendationList = shuffle(potentialRecommendationList);
		let recommendationList = [];
		for (let i = 0; i < potentialRecommendationList.length; i++) {
			try {
				let rec = await this.buyOrSell(potentialRecommendationList[i]);
				recommendationList.push({
					ticker: potentialRecommendationList[i],
					recommendation: rec,
				});

				if (recommendationList.length >= 2) {
					break;
				}
			} catch (e) {
				continue;
			}
		}

		//Select first 2 (or less) to return
		if (recommendationList.length >= 2) return recommendationList.slice(0, 2);
		else if (recommendationList.length != 0)
			return recommendationList.slice(0, recommendationList.length);
		else return recommendationList;
	},

	async getGraphData(ticker, subtract) {
		if (!ticker || typeof ticker != "string" || !ticker.trim()) {
			throw "Ticker not provided or not of proper type";
		}
		if (!subtract || typeof subtract != "string" || !subtract.trim()) {
			throw "Subtract not provided or not of proper type";
		}
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
			"1d"
		);
		let k = 0;
		let reversedData = stocksData.reverse();
		for (var i = 0; i < stocksData.length; i++) {
			if (stocksData[i].adjclose != undefined) {
				prices[k] = stocksData[i].adjclose;
				let utcseconds = reversedData[i].date;
				let d = new Date(0);
				d.setUTCSeconds(utcseconds);
				dates[i] = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
				k++;
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

	async getTotalValue(stocksOwned) {
		if (!stocksOwned || !Array.isArray(stocksOwned)) {
			throw "StocksOwned is undefined or not of proper type";
		}
		var totalValue = 0;
		for (var i = 0; i < stocksOwned.length; i++) {
			let ticker = stocksOwned[i].ticker;
			const data = await yahooStockPrices.getCurrentPrice(ticker);
			totalValue += data * stocksOwned[i].amount;
		}
		return totalValue;
	},
};

module.exports = exportedMethods;
