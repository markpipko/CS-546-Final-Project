const express = require("express");
const app = express();
const configRoutes = require("./routes");
const static = express.static(__dirname + "/public");
const exphbs = require("express-handlebars");
const session = require("express-session");

app.use("/public", static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(
	session({
		name: "PaperTradingApp",
		secret: "This is a secret",
		saveUninitialized: true,
		resave: false,
		cookie: { maxAge: 60000 },
	})
);

app.use("/private", (req, res, next) => {
    //console.log(req.session.id);
    if (!req.session.user) {
        return res.redirect("/");
    }
    else {
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
