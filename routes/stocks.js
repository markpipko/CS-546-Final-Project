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

		res.render("stock", { title: ticker, stock: ticker, price: stockInfo });
	} catch (e) {
		return res.render("home", {
			title: "Home",
			hasErrors: true,
			error: "Ticker not found",
		});
	}
});

module.exports = router;
