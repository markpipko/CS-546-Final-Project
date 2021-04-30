const finvizor = require("finvizor");
const yahooStockPrices = require("yahoo-stock-prices");
const axios = require("axios");

function getMean(arr){
	let sum = 0
	for(var i = 0; i < arr.length; i++){
		sum += arr[i]
	}
	return sum/arr.length
}

function getSD(arr){
	var sd = 0
	let mean = getMean(arr)
	for(var i = 0; i < arr.length; i++){
		sd += Math.pow(arr[i] - mean, 2)
	}
	sd = Math.sqrt(sd/dailyReturns.length) 
	return sd
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

	async buyOrSell(ticker){
		var today = new Date()
		const prices = await yahooStockPrices.getHistoricalPrices(today.getMonth(), today.getDate(), today.getFullYear()-1, today.getMonth(), today.getDate(), today.getFullYear(), ticker, '1d');
		
		var closingPrices
		var movingAverage
		for(var i = 0; i < prices.length; i++){
			closingPrices[i] = prices[i].close
			movingAverage[i] = getMean(closingPrices)
		}
		var sd = getSD(closingPrices)

		var upperBand
		var lowerBand
		for(var i = 0; i < closingPrices.length; i++){
			upperBand[i] = closingPrices[i] + sd*2
			lowerBand[i] = closingPrices[i] - sd*2
		}
		const data = await finvizor.stock(ticker);
		const yahoo_data = await yahooStockPrices.getCurrentPrice(ticker);
		var rsi = data.rsi

		if(upperBand[upperBand.length-1] <= yahoo_data && rsi >= 70){
			return "Strong Sell"
		}
		if(lowerBand[lowerBand.length-1] >= yahoo_data && rsi <= 30){
			return "Strong Buy"
		}
		if((upperBand[upperBand.length-1] <= yahoo_data  && !(rsi <= 30) || rsi >= 70 && !(lowerBand[lowerBand.length-1] >= yahoo_data))){
			return "Sell"
		}
		if((lowerBand[lowerBand.length-1] >= yahoo_data  && !(rsi >= 70) || rsi <= 30 && !(upperBand[upperBand.length-1] <= yahoo_data))){
			return "Buy"
		}
		return "Hold"
	},

	async giveRecommendation(myStocks) {
		let sp500 = await axios.get("https://pkgstore.datahub.io/core/s-and-p-500-companies/constituents_json/data/8caaa9cecf5b6d60a147e15c20eee688/constituents_json.json");
		
		//TODO: make this for multiple stocks rather than just the first
		let myStockData = await finvizor.stock(myStocks[0]);

		//let myStockPrice = await yahooStockPrices.getCurrentPrice(myStock);

		let recommendationList = [];
		for (let i = 0; i < sp500.data.length; i++) {
			if (!myStocks.includes(sp500.data[i].Symbol)
					&& (sp500.data[i].Sector.includes(myStockData.sector) || myStockData.sector.includes(sp500.data[i].Sector))) {
				recommendationList.push(sp500.data[i].Symbol);
			}
		}

		//TODO: implement a faster solution for comparing prices as well

		/*for (let i = recommendationList.length - 1; i >= 0; i--) {
			let recStockPrice = await yahooStockPrices.getCurrentPrice(recommendationList[i]);
			if (Math.abs(myStockPrice - recStockPrice) > 50) {
				recommendationList.splice(i, 1);
			}
		}

		let fullRecList = [];
		for (let i = 0; i < recommendationList.length; i++) {
			fullRecList.push(await finvizor.stock(recommendationList[i]));
		}

		//Sort recommendation list by roi or some other ratio/factor?
		fullRecList.sort((a, b) => (a.roi > b.roi) ? -1 : 1);*/


		//Select first 3-5 (or less) to return
		if (recommendationList.length >= 3)
			return recommendationList.slice(0, 3);
		else if (recommendationList.length != 0)
			return recommendationList.slice(0, recommendationList.length);
		else
			return recommendationList;
	}
};

module.exports = exportedMethods;
