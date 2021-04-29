const stocksRoutes = require("./stocks");
const privateRoutes = require("./private");
const userRoutes = require("./users");
const historyRoutes = require("./stockHistory");

const constructorMethods = (app) => {
	app.use("/", userRoutes);
	app.use("/private", privateRoutes);

	//No need for this since these are under the private route now
	/*app.get("/home", (req, res) => {
		res.render("home", { title: "Home" });
	});*/
	app.use("/stocks", stocksRoutes);

	app.use("/history", historyRoutes);

	app.use("*", (req, res) => {
		res.sendStatus(404);
	});
};

module.exports = constructorMethods;
