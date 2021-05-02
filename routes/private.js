const express = require("express");
const router = express.Router();
const data = require("../data");
const { giveRecommendation } = require("../data/stocks");
const stocksData = data.stocks;
const userMetrics = data.userMetrics;
const users = data.users;
const historyData = data.buySellHistory;

router.get("/", async (req, res) => {
	res.redirect("/private/home");
});

router.get("/home", async (req, res) => {
	//TODO: uncomment later
	//const metrics = await userMetrics.update(req.session.user.email)
	try {
		const user = await users.getUserByEmail(req.session.user.email); //should be getUserByEmail
		let userStocks = req.session.user.stocksPurchased;
		let recList = [];

		//if (userStocks.length != 0) {
		// 	recList = await stocksData.giveRecommendation(userStocks);
		// } else {
		// 	recList.push("AAPL");
		// 	recList.push("T");
		// }
		res.render("home", {
			title: "Home",
			name: req.session.user.firstName,
			recList: recList /*, totalReturn: metrics.totalReturn, percentGrowth: metrics.percentGrowth, volatility: metrics.volatility, stocks: user.stocksPurchased .*/,
		});
	} catch (e) {
		res.render("login", { hasErrors: true, error: e });
	}
});

router.post("/update", async (req, res) => {
	const metrics = await userMetrics.update(req.session.user.email);
	res.json({
		totalReturn: metrics.totalReturn,
		percentGrowth: metrics.percentGrowth,
		volatility: metrics.volatility,
	});
});

router.post("/graph", async (req, res) => {
	let ticker = req.body["ticker"];
	let subtract = req.body["subtract"];
	// console.log(ticker, subtract);
	const data = await stocksData.getGraphData(ticker, subtract);
	res.json({ chart: data });
});

router.get("/stockHistory", async (req, res) => {
	const trade = await historyData.getHistoryByEmail(req.session.user.email);
	res.render("stockHistory", { title: "History", trade: trade.history });
});

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
		const rec = await stocksData.buyOrSell(ticker);
		let status = 0;
		if (stockInfo.price > stockInfo.prevClose) {
			status = 1;
		} else if (stockInfo.price < stockInfo.prevClose) {
			status = -1;
		} else {
			status = 0;
		}
		res.json({ stock: stockInfo, recommendation: rec, status: status });
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
		let status = 0;

		if (stockInfo.price > stockInfo.prevClose) {
			status = 1;
		} else if (stockInfo.price < stockInfo.prevClose) {
			status = -1;
		} else {
			status = 0;
		}
		res.render("stock", {
			title: ticker.toUpperCase(),
			stock: stockInfo,
			recommendation: rec,
			status: status,
		});
	} catch (e) {
		console.log(e);
		return res.render("home", {
			title: "Home",
			hasErrors: true,
			error: "Ticker not found",
		});
	}
});

router.post("/transaction", async (req, res) => {
	let transaction = req.body["transaction"];
	let quantity = req.body["quantity"];
	let ticker = req.body["stock_ticker"];

	if (!transaction || !quantity || !ticker) {
		return res.json({ error: "One or more inputs were not provided" });
	}
	transaction = transaction.trim();
	quantity = quantity.trim();
	ticker = ticker.trim();

	if (!transaction || !quantity || !ticker) {
		return res.json({ error: "One or more inputs were not provided" });
	}

	let user = req.session.user;
	if (transaction == "buy") {
		try {
			let status = await stocksData.buy(user.email, ticker, quantity);
			return res.json({ success: true, ticker: ticker, quantity: quantity });
		} catch (e) {
			return res.json({ error: e });
		}
	} else {
	}
});

module.exports = router;
