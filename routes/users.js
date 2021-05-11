const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const saltRounds = 16;
const data = require("../data");
const { buySellHistory } = require("../data");
const users = data.users;
const userMetrics = data.userMetrics;
const buySell = data.buySellHistory;
const xss = require("xss");

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
	const firstName = xss(req.body.firstName);
	const lastName = xss(req.body.lastName);
	const email = xss(req.body.email);
	const password = xss(req.body.password);
	const age = xss(req.body.age);
	const cash = xss(req.body.cash);

	if (!firstName || !lastName || !email || !password || !age || !cash) {
		res.render("signup", {
			title: "Sign Up",
			hasErrors: true,
			error: "One or more fields are blank.",
			firstName: firstName,
			lastName: lastName,
			email: email,
			age: age,
			cash: cash,
		});
		return;
	}
	if (
		typeof firstName !== "string" ||
		typeof lastName !== "string" ||
		typeof email !== "string" ||
		typeof password !== "string"
	) {
		res.render("signup", {
			title: "Sign Up",
			hasErrors: true,
			error: "Invalid string parameters.",
			firstName: firstName,
			lastName: lastName,
			email: email,
			age: age,
			cash: cash,
		});
		return;
	}
	if (
		firstName.trim() == "" ||
		lastName.trim() == "" ||
		email.trim() == "" ||
		password.trim() == ""
	) {
		res.render("signup", {
			title: "Sign Up",
			hasErrors: true,
			error: "Parameters cannot be empty.",
			firstName: firstName,
			lastName: lastName,
			email: email,
			age: age,
			cash: cash,
		});
		return;
	}
	if (isNaN(age) || Number(age) % 1 != 0 || isNaN(cash)) {
		res.render("signup", {
			title: "Sign Up",
			hasErrors: true,
			error: "Invalid number parameters.",
			firstName: firstName,
			lastName: lastName,
			email: email,
			age: age,
			cash: cash,
		});
		return;
	}
	let lowerCaseEmail = email.toLowerCase();

	const allUsers = await users.getAllUsers();
	for (let i = 0; i < allUsers.length; i++) {
		if (allUsers[i].email == lowerCaseEmail) {
			res.render("signup", {
				title: "Sign Up",
				hasErrors: true,
				firstName: firstName,
				lastName: lastName,
				age: age,
				cash: cash,
				error: "Email already in use. Please enter another email.",
			});
			return;
		}
	}

	const hash = await bcrypt.hash(password, saltRounds);
	try {
		let user = await users.addUser(
			firstName,
			lastName,
			lowerCaseEmail,
			parseInt(age),
			hash,
			Number(cash),
			[],
			[]
		);
		let userMetricsCreate = await userMetrics.create(email, 0, 0, 0);
		let historyCreate = await buySell.create(email, []);
		req.session.user = {
			email: lowerCaseEmail,
			firstName: firstName,
			stocksPurchased: [],
			favList: [],
		};
		res.redirect("/private");
	} catch (e) {
		res.render("signup", {
			title: "Sign Up",
			hasErrors: true,
			firstName: firstName,
			lastName: lastName,
			email: email,
			age: age,
			cash: cash,
			error: "Error with creating user.",
		});
	}
});

router.post("/login", async (req, res) => {
	const email = xss(req.body.email);
	const password = xss(req.body.password);

	if (!email || typeof email !== "string" || email.trim() == "") {
		res.render("login", {
			title: "Login",
			hasErrors: true,
			error: "Invalid email",
		});
		return;
	}
	if (!password || typeof password !== "string" || password.trim() == "") {
		res.render("login", {
			title: "Login",
			hasErrors: true,
			error: "Invalid password",
		});
		return;
	}

	let allUsers = await users.getAllUsers();
	let match = false;

	for (let i = 0; i < allUsers.length; i++) {
		if (email == allUsers[i].email) {
			match = await bcrypt.compare(password, allUsers[i].password);
			if (match) {
				req.session.user = {
					email: xss(req.body.email),
					firstName: allUsers[i].firstName,
					stocksPurchased: allUsers[i].stocksPurchased,
					favorites: allUsers[i].favorites,
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
	const firstName = xss(req.body.firstName);
	const lastName = xss(req.body.lastName);
	const email = xss(req.body.email);
	const password = xss(req.body.password);
	const passwordConfirm = xss(req.body.passwordConfirm);
	const age = xss(req.body.age);
	const cash = xss(req.body.cash);

	if (
		!firstName ||
		!lastName ||
		!email ||
		!password ||
		!passwordConfirm ||
		!age ||
		!cash
	) {
		res.render("updateUser", {
			title: "Edit Account",
			hasErrors: true,
			error: "Parameters cannot be blank",
		});
		return;
	}
	if (
		typeof firstName !== "string" ||
		typeof lastName !== "string" ||
		typeof email !== "string" ||
		typeof password !== "string" ||
		typeof passwordConfirm !== "string"
	) {
		res.render("updateUser", {
			title: "Edit Account",
			hasErrors: true,
			error: "Invalid string parameters",
		});
		return;
	}
	if (
		firstName.trim() == "" ||
		lastName.trim() == "" ||
		email.trim() == "" ||
		password.trim() == "" ||
		passwordConfirm.trim() == ""
	) {
		res.render("updateUser", {
			title: "Edit Account",
			hasErrors: true,
			error: "Parameters cannot be empty",
		});
		return;
	}
	if (isNaN(age) || Number(age) % 1 != 0 || isNaN(cash)) {
		res.render("updateUser", {
			title: "Edit Account",
			hasErrors: true,
			error: "Invalid number parameters",
		});
		return;
	}

	if (password != passwordConfirm) {
		res.render("updateUser", {
			title: "Edit Account",
			hasErrors: true,
			error: "Passwords do not match",
		});
		return;
	}

	const hash = await bcrypt.hash(password, saltRounds);

	let updatedUser = {
		firstName: firstName,
		lastName: lastName,
		email: email,
		password: hash,
		age: parseInt(age),
		cash: Number(cash),
	};

	let user = await users.getUserByEmail(xss(req.session.user.email));
	let updatedReturnUser = await users.updateUser(user._id, updatedUser);

	if (email != user.email) {
		let updatedUserMetrics = {
			email: email,
		};
		let userMetricsReturn = await userMetrics.get(xss(req.session.user.email));
		let updatedReturnUserMetrics = await userMetrics.updateEmail(
			userMetricsReturn._id.toString(),
			updatedUserMetrics
		);

		let updatedBSH = {
			email: email,
		};
		let bshReturn = await buySell.getHistoryByEmail(
			xss(req.session.user.email)
		);
		let updatedReturnBSH = await buySell.updateEmail(
			bshReturn._id.toString(),
			updatedBSH
		);

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
	if (xss(req.body.deleteUser) == "yes") {
		let user = await users.getUserByEmail(xss(req.session.user.email));
		let deleted = await users.removeUser(user._id);
		deleted = await userMetrics.remove(user.email);
		deleted = await buySell.remove(user.email);
		req.session.destroy();
		res.redirect("/");
	} else {
		res.redirect("/private");
	}
});

module.exports = router;
