const express = require("express");
const router = express.Router();
const data = require("../data");
const { giveRecommendation } = require("../data/stocks");
const stocksData = data.stocks;
const userMetrics = data.userMetrics;
const users = data.users;
const historyData = data.buySellHistory;
const yahooStockPrices = require("yahoo-stock-prices");
const xss = require("xss");

router.get("/", async (req, res) => {
	res.redirect("/private/home");
});

router.get("/home", async (req, res) => {
	try {
		const metrics = await userMetrics.update(xss(req.session.user.email));
		const user = await users.getUserByEmail(xss(req.session.user.email));

		let userStocks = user.stocksPurchased;

		var totalValue = await stocksData.getTotalValue(userStocks);
		var cash = await user.cash;
		for (var i = 0; i < userStocks.length; i++) {
			userStocks[i].value = await yahooStockPrices.getCurrentPrice(
				userStocks[i].ticker
			);
		}

		res.render("home", {
			title: "Home",
			name: xss(req.session.user.firstName),
			stocks: userStocks,
			isEmpty: user.stocksPurchased.length == 0 ? true : false,
			pValue: totalValue.toFixed(2),
			cash: cash.toFixed(2),
		});
	} catch (e) {
		res.render("login", { hasErrors: true, error: e });
	}
});

router.post("/update", async (req, res) => {
	const metrics = await userMetrics.update(xss(req.session.user.email));
	res.json({
		totalReturn: metrics.totalReturn,
		percentGrowth: metrics.percentGrowth,
		volatility: metrics.volatility,
	});
});

router.post("/userGraph", async (req, res) => {
	const user = await users.getUserByEmail(xss(req.session.user.email));
	var data = await stocksData.getTotalValue(user.stocksPurchased);
	var cash = await user.cash;
	res.json({
		totalValue: (data + cash).toFixed(2),
		pValue: data.toFixed(2),
	});
});

router.post("/graph", async (req, res) => {
	let ticker = xss(req.body["ticker"]);
	let subtract = xss(req.body["subtract"]);
	const data = await stocksData.getGraphData(ticker, subtract);
	res.json({ chart: data });
});

router.get("/stockHistory", async (req, res) => {
	const metrics = await userMetrics.update(xss(req.session.user.email));
	const trade = await historyData.getHistoryByEmail(
		xss(req.session.user.email)
	);
	res.render("stockHistory", {
		title: "History",
		trades: trade.history.reverse(),
		totalReturn: metrics.totalReturn,
		percentGrowth: metrics.percentGrowth,
		volatility: metrics.volatility,
	});
});

// router.get("/recommendations", async (req, res) => {
// 	const user = await users.getUserByEmail(xss(req.session.user.email));
// 	let userStocks = user.stocksPurchased;
// 	let recList = await stocksData.giveRecommendation(userStocks);
// 	res.render("recommendations", {
// 		title: "Recommendations",
// 		recList: recList,
// 	});
// });

router.get("/favorites", async (req, res) => {
	const user = await users.getUserByEmail(xss(req.session.user.email));
	let userStocks = user.stocksPurchased;
	let recList = await stocksData.giveRecommendation(userStocks);
	res.render("favorites", { title: "Favorites", recList: recList });
});

router.post("/getFavorites", async (req, res) => {
	const user = await users.getUserByEmail(xss(req.session.user.email));
	res.json({ favList: user.favorites });
});

router.post("/favorites/:id", async (req, res) => {
	let ticker = xss(req.params.id);
	const user = await users.getUserByEmail(xss(req.session.user.email));
	let favList = user.favorites;
	if (favList.length == 0 || !favList.includes(ticker)) {
		favList.push(ticker);
		const updatedFavList = await users.updateUser(user._id, {
			favorites: favList,
		});
	}
});

router.delete("/favorites/:id", async (req, res) => {
	let ticker = xss(req.params.id);
	const user = await users.getUserByEmail(xss(req.session.user.email));
	let favList = user.favorites;

	for (let i = 0; i < favList.length; i++) {
		if (favList[i] == ticker) {
			favList.splice(i, 1);
			break;
		}
	}

	const updatedFavList = await users.updateUser(user._id, {
		favorites: favList,
	});
	res.json({});
	// res.render("favorites", { title: "Favorites", favList: favList });
});

router.post("/find", async (req, res) => {
	let ticker = xss(req.body["stock_ticker"]);
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

router.get("/stocks/:id", async (req, res) => {
	let ticker = xss(req.params.id);
	let x = xss(req.body["stock_ticker"]);

	if (!ticker || !ticker.trim()) {
		const metrics = await userMetrics.update(xss(req.session.user.email));
		const user = await users.getUserByEmail(xss(req.session.user.email));
		let userStocks = user.stocksPurchased;

		var totalValue = await stocksData.getTotalValue(userStocks);
		var cash = await user.cash;
		for (var i = 0; i < userStocks.length; i++) {
			userStocks[i].value = await yahooStockPrices.getCurrentPrice(
				userStocks[i].ticker
			);
		}

		return res.render("home", {
			title: "Home",
			hasErrors: true,
			error: "Please input a ticker",
			name: xss(req.session.user.firstName),
			totalReturn: metrics.totalReturn,
			percentGrowth: metrics.percentGrowth,
			volatility: metrics.volatility,
			stocks: userStocks,
			isEmpty: user.stocksPurchased.length == 0 ? true : false,
			pValue: totalValue.toFixed(2),
			cash: cash.toFixed(2),
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

		const metrics = await userMetrics.update(xss(req.session.user.email));
		const user = await users.getUserByEmail(xss(req.session.user.email));
		let userStocks = user.stocksPurchased;

		var totalValue = await stocksData.getTotalValue(userStocks);
		var cash = await user.cash;
		for (var i = 0; i < userStocks.length; i++) {
			userStocks[i].value = await yahooStockPrices.getCurrentPrice(
				userStocks[i].ticker
			);
		}

		return res.render("home", {
			title: "Home",
			hasErrors: true,
			error: "Ticker not found",
			name: xss(req.session.user.firstName),
			totalReturn: metrics.totalReturn,
			percentGrowth: metrics.percentGrowth,
			volatility: metrics.volatility,
			stocks: userStocks,
			isEmpty: user.stocksPurchased.length == 0 ? true : false,
			pValue: totalValue.toFixed(2),
			cash: cash.toFixed(2),
		});
	}
});

router.get("/stock", async (req, res) => {
	let ticker = req.body["stock_ticker"];
	if (!ticker) {
		try {
			let { stock_ticker } = req.query;
			ticker = stock_ticker;
		} catch (e) {
			const metrics = await userMetrics.update(xss(req.session.user.email));
			const user = await users.getUserByEmail(xss(req.session.user.email));

			return res.render("stock", {
				title: "Home",
				hasErrors: true,
				error: "Please input a ticker",
				name: xss(req.session.user.firstName),
				totalReturn: metrics.totalReturn,
				percentGrowth: metrics.percentGrowth,
				volatility: metrics.volatility,
				stocks: user.stocksPurchased,
				isEmpty: user.stocksPurchased.length == 0 ? true : false,
			});
		}
	}
	if (!ticker || !ticker.trim()) {
		return res.render("stock", {
			title: "Error",
			hasErrors: true,
			error: "Please input a ticker",
		});
	}
	ticker = ticker.toUpperCase();
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
		return res.render("stock", {
			title: "Error",
			hasErrors: true,
			error: "Ticker not found",
		});
	}
});

router.get("/stocks", async (req, res) => {
	let ticker = xss(req.body["stock_ticker"]);
	if (!ticker) {
		try {
			let { stock_ticker } = req.query;
			ticker = stock_ticker;
		} catch (e) {
			const metrics = await userMetrics.update(xss(req.session.user.email));
			const user = await users.getUserByEmail(xss(req.session.user.email));

			return res.render("home", {
				title: "Home",
				hasErrors: true,
				error: "Please input a ticker",
				name: xss(req.session.user.firstName),
				totalReturn: metrics.totalReturn,
				percentGrowth: metrics.percentGrowth,
				volatility: metrics.volatility,
				stocks: user.stocksPurchased,
				isEmpty: user.stocksPurchased.length == 0 ? true : false,
			});
		}
	}
	if (!ticker.trim()) {
		const metrics = await userMetrics.update(xss(req.session.user.email));
		const user = await users.getUserByEmail(xss(req.session.user.email));

		return res.render("home", {
			title: "Home",
			hasErrors: true,
			error: "Please input a ticker",
			name: xss(req.session.user.firstName),
			totalReturn: metrics.totalReturn,
			percentGrowth: metrics.percentGrowth,
			volatility: metrics.volatility,
			stocks: user.stocksPurchased,
			isEmpty: user.stocksPurchased.length == 0 ? true : false,
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

		const metrics = await userMetrics.update(xss(req.session.user.email));
		const user = await users.getUserByEmail(xss(req.session.user.email));

		return res.render("home", {
			title: "Home",
			hasErrors: true,
			error: "Ticker not found",
			name: xss(req.session.user.firstName),
			totalReturn: metrics.totalReturn,
			percentGrowth: metrics.percentGrowth,
			volatility: metrics.volatility,
			stocks: user.stocksPurchased,
			isEmpty: user.stocksPurchased.length == 0 ? true : false,
		});
	}
});

router.get("/stockListings", async (req, res) => {
	return res.render("stockListings", { title: "SP500" });
});

router.post("/transaction", async (req, res) => {
	let transaction = xss(req.body["transaction"]);
	let quantity = xss(req.body["quantity"]);
	let ticker = xss(req.body["stock_ticker"]);
	let choice = xss(req.body["investOption"]);

	if (choice == "dollars") {
		quantity = parseFloat(quantity);
		const yahoo_data = await yahooStockPrices.getCurrentPrice(ticker);
		quantity = quantity / yahoo_data;
		quantity = quantity.toString();
	} else {
		quantity = quantity.trim();
	}

	if (!transaction || !quantity || !ticker) {
		return res.json({ error: "One or more inputs were not provided" });
	}
	transaction = transaction.trim();
	ticker = ticker.trim();

	if (!transaction || !quantity || !ticker) {
		return res.json({ error: "One or more inputs were not provided" });
	}

	let email = xss(req.session.user.email);
	if (transaction == "buy") {
		try {
			let status = await stocksData.buy(email, ticker, quantity);
			return res.json({ success: true, ticker: ticker, quantity: quantity });
		} catch (e) {
			console.log(e);
			return res.json({ error: e });
		}
	} else {
		try {
			let status = await stocksData.sell(email, ticker, quantity);
			return res.json({ success: true, ticker: ticker, quantity: quantity });
		} catch (e) {
			return res.json({ error: e });
		}
	}
});

module.exports = router;
