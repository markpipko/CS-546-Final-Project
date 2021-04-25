const stocksRoutes = require("./stocks");

const buyRoutes = require("./buysell"); //import the file buysRoute
const historyRoutes = require("./stockHistory");

const constructorMethods = (app) => {
	app.get("/", (req, res) => {
		res.render("home", { title: "Home" });
	});

	//buy/sell form path here
	app.get("/buysell", (req, res) => {
		res.render("buysell", { title: "Buy/Sell" });
	});

	//history form path here (handlebar)
	app.get("/stockHistory", (req, res) => {
		res.render("stockHistory", { title: "History" });
	});

	app.use("/stocks", stocksRoutes);

	
	app.use("/buysell",  buyRoutes);
	//add stockhistory route linked to stockHistory.js file
	app.use("/stockHistory", historyRoutes);

	app.use("*", (req, res) => {
		res.sendStatus(404);
	});
};

module.exports = constructorMethods;
