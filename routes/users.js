const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const saltRounds = 16;
const data = require("../data");
const { buySellHistory } = require("../data");
//const { userMetrics } = require('../config/mongoCollections'); Do we need this?
const users = data.users;
const userMetrics = data.userMetrics;
const buySell = data.buySellHistory

router.get("/", async (req, res) => {
	res.render("login", { title: "Login" });
});

router.post("/", async (req, res) => {
	res.redirect("/login");
});

router.get("/signup", async (req, res) => {
	res.render("signup", { title: "Sign Up" });
});

router.post("/signup", async (req, res) => {
	const { firstName, lastName, email, password, age, cash } = req.body;

	const allUsers = await users.getAllUsers();
	for (let i = 0; i < allUsers.length; i++) {
		if (allUsers[i].email == email) {
			res.render("signup", { title: "Sign Up", hasErrors: true, error: "Email already in use" });
			return;
		}
	}

	const hash = await bcrypt.hash(password, saltRounds);
	try {
		let user = await users.addUser(
			firstName,
			lastName,
			email,
			parseInt(age),
			hash,
			Number(cash),
			[]
		);
		let userMetricsCreate = await userMetrics.create(email, 0, 0, 0);
    	let historyCreate = await buySell.create(email, [])
		req.session.user = { email: email, firstName: firstName, stocksPurchased: [] };
		res.redirect("/private");
	} catch (e) {
		console.log(e);
	}
});

router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	let allUsers = await users.getAllUsers();
	let match = false;

	for (let i = 0; i < allUsers.length; i++) {
		if (email == allUsers[i].email) {
			match = await bcrypt.compare(password, allUsers[i].password);
			if (match) {
				req.session.user = {
					email: req.body.email,
					firstName: allUsers[i].firstName,
					stocksPurchased: allUsers[i].stocksPurchased,
				};
				res.redirect("/private");
			}
			break;
		}
	}

	if (!match) {
		res.render("login", {
			title: "Login",
			hasErrors: true,
			error: "Invalid Login",
		});
	}
});

router.get("/updateUser", async (req, res) => {
	res.render("updateUser", { title: "Edit Account" });
});

router.post("/updateUser", async (req, res) => {
	const { firstName, lastName, email, password, passwordConfirm, age, cash } = req.body;

	if (password != passwordConfirm) {
		res.render("updateUser", { title: "Edit Account", hasErrors: true, error: "Passwords do not match" });
		return;
	}

	const hash = await bcrypt.hash(password, saltRounds);

	let updatedUser = {
		firstName: firstName,
		lastName: lastName,
		email: email,
		password: hash,
		age: age,
		cash: cash
	};

	let user = await users.getUserByEmail(req.session.user.email);
	let updatedReturnUser = await users.updateUser(user._id, updatedUser);

	if (email != user.email) {
		let updatedUserMetrics = {
			email: email
		};
		let userMetricsReturn = await userMetrics.get(req.session.user.email);
		let updatedReturnUserMetrics = await userMetrics.updateEmail(userMetricsReturn._id.toString(), updatedUserMetrics);

		let updatedBSH = {
			email: email
		};
		let bshReturn = await userBSH.getHistoryByEmail(req.session.user.email);
		let updatedReturnBSH = await userBSH.updateEmail(bshReturn._id.toString(), updatedBSH);

		req.session.user.email = email;
	}

	

	res.redirect("/private");
});

router.get("/logout", async (req, res) => {
	req.session.destroy();
	res.redirect("/");
});

router.get("/deleteAccount", async (req, res) => {
	res.render("deleteAccount", { title: "Delete Account" });
});

router.post("/deleteAccount", async (req, res) => {
	if (req.body.deleteUser == "yes") {
		let user = await users.getUserByEmail(req.session.user.email);
		let deleted = await users.removeUser(user._id);
    	deleted = await userMetrics.remove(user.email)
    	deleted = await buySell.remove(user.email)
		req.session.destroy();
		res.redirect("/");
	}
	else {
		res.redirect("/private");
	}
});

module.exports = router;
