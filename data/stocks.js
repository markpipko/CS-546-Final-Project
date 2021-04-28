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
};

module.exports = exportedMethods;
