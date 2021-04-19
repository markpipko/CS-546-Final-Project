const finvizor = require("finvizor");
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
		const data = await finvizor.stock(ticker);
		if (!data) {
			throw "Ticker not found";
		}
		return data;
	},
};

module.exports = exportedMethods;
