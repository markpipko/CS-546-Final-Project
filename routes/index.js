const privateRoutes = require("./private");
const userRoutes = require("./users");

const constructorMethods = (app) => {
	app.use("/", userRoutes);
	app.use("/private", privateRoutes);

	app.use("*", (req, res) => {
		res.sendStatus(404);
	});
};

module.exports = constructorMethods;
