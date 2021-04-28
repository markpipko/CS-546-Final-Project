const finvizor = require("finvizor");
const yahooStockPrices = require("yahoo-stock-prices");

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
		const yahoo_data = await yahooStockPrices.getCurrentPrice(ticker);
		if (!yahoo_data) {
			throw "Ticker not found";
		}

		data.price = yahoo_data;
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
	}
};

module.exports = exportedMethods;
