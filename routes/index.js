const stocksRoutes = require("./stocks");

const constructorMethods = (app) => {
	app.get("/", (req, res) => {
		res.render("home", { title: "Home" });
	});
	app.use("/stocks", stocksRoutes);
	app.use("*", (req, res) => {
		res.sendStatus(404);
	});
};

module.exports = constructorMethods;
