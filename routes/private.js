const express = require('express');
const router = express.Router();
const data = require("../data");
const stocksData = data.stocks;

router.get('/', async (req, res) => {
    res.redirect("/private/home");
});

router.get('/home', async (req, res) => {
    res.render("home", { title: "Home", name: req.session.user.firstName });
});

//Taken from routes/stocks.js 
//TODO: routes/stocks.js can be deleted
router.post("/stocks", async (req, res) => {
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

		res.render("stock", { title: ticker.toUpperCase(), stock: stockInfo });
	} catch (e) {
		return res.render("home", {
			title: "Home",
			hasErrors: true,
			error: "Ticker not found",
		});
	}
});

module.exports = router;