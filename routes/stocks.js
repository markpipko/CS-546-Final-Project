const express = require("express");
const router = express.Router();
const data = require("../data");
const stocksData = data.stocks;

router.post("/", async (req, res) => {
	let ticker = req.body["stock_ticker"];
	if (!ticker) {
		return res.render("home", {
			title: "Home",
			hasErrors: true,
			error: "Please input a ticker",
		});
	}
	ticker = ticker.trim();
	if (!ticker) {
		return res.render("home", {
			title: "Home",
			hasErrors: true,
			error: "Please input a ticker",
		});
	}

	try {
		const stockInfo = await stocksData.getStock(ticker);
		const rec = await stocksData.buyOrSell(ticker);
		res.render("stock", { title: ticker.toUpperCase(), stock: stockInfo, recommendation: rec});
	} catch (e) {
		return res.render("home", {
			title: "Home",
			hasErrors: true,
			error: "Ticker not found",
		});
	}
});

module.exports = router;
