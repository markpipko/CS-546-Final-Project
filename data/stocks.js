const finvizor = require("finvizor");
const yahooStockPrices = require("yahoo-stock-prices");
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
};

module.exports = exportedMethods;
