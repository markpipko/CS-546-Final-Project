const express = require("express");
const app = express();
const configRoutes = require("./routes");
const static = express.static(__dirname + "/public");
const exphbs = require("express-handlebars");
const session = require("express-session");
const Handlebars = require("handlebars");

app.use("/public", static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
	return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

app.use(
	session({
		name: "PaperTradingApp",
		secret: "This is a secret",
		saveUninitialized: true,
		resave: false,
		// Cookie was expiring way too quickly, maybe increase the duration since it's currently at a minute
		// Or just not let it expire until logout
		// cookie: { maxAge: 60000 },
	})
);

app.use("/private", (req, res, next) => {
	//console.log(req.session.id);
	if (!req.session.user) {
		return res.redirect("/");
	} else {
		next();
	}
});

app.use("/login", (req, res, next) => {
	if (req.session.user) {
		return res.redirect("/private");
	} else {
		req.method = "POST";
		next();
	}
});

configRoutes(app);

app.listen(3000, () => {
	console.log("We've now got a server!");
	console.log("Your routes will be running on http://localhost:3000");
});
