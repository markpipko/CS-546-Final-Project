const express = require("express");
const router = express.Router();
const data = require("../data");
const { giveRecommendation } = require("../data/stocks");
const stocksData = data.stocks;
const userMetrics = data.userMetrics;
const historyData = data.buySellHistory;

router.get("/", async (req, res) => {
	res.redirect("/private/home");
});

router.get('/home', async (req, res) => {
	//TODO: uncomment later
	//const metrics = await userMetrics.update(req.session.user.email)
	let userStocks = req.session.user.stocksPurchased;
	let recList = [];
	if (userStocks.length != 0) {
		recList = await stocksData.giveRecommendation(userStocks);
	}
	else {
		recList.push("AAPL");
		recList.push("T");
	}
    res.render("home", { title: "Home", name: req.session.user.firstName, recList: recList/*, totalReturn: metrics.totalReturn, percentGrowth: metrics.percentGrowth, volatility: metrics.volatility*/});
});

router.get('/update', async (req,res) => {
	const metrics = await userMetrics.update(req.session.user.email)
	res.json({totalReturn: metrics.totalReturn, percentGrowth: metrics.percentGrowth, volatility: metrics.volatility})
})

router.get("/stockHistory", async (req, res) => {
	const trade = await historyData.getHistoryByEmail(req.session.user.email);
    res.render("stockHistory", {title: "History", trade: trade.history})
})

router.post("/find", async (req, res) => {
	let ticker = req.body["stock_ticker"];
	if (!ticker) {
		return res.json({ error: "Please input a ticker" });
	}
	ticker = ticker.trim();
	if (!ticker) {
		return res.json({ error: "Please input a ticker" });
	}

	try {
		const stockInfo = await stocksData.getStock(ticker);
		res.json({ stock: stockInfo });
	} catch (e) {
		return res.json({ error: "Ticker not found" });
	}
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
		const rec = await stocksData.buyOrSell(ticker);
		res.render('stock', {
			title: ticker.toUpperCase(),
			stock: stockInfo,
			recommendation: rec,
		});
	} catch (e) {
		return res.render("home", {
			title: "Home",
			hasErrors: true,
			error: "Ticker not found",
		});
	}
});

module.exports = router;
