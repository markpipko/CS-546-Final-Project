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
	let pattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;

	if (!pattern.test(lowerCaseEmail)) {
		res.render("signup", {
			title: "Sign Up",
			hasErrors: true,
			error: "Invalid email.",
			firstName: firstName,
			lastName: lastName,
			email: email,
			age: age,
			cash: cash,
		});
		return;
	}
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
		// console.log(e);
		res.render("signup", {
			title: "Sign Up",
			hasErrors: true,
			firstName: firstName,
			lastName: lastName,
			email: lowerCaseEmail,
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
	let firstName = xss(req.body.firstName);
	let lastName = xss(req.body.lastName);
	let email = xss(req.body.email);
	let password = xss(req.body.password);
	let passwordConfirm = xss(req.body.passwordConfirm);
	let age = xss(req.body.age);
	let cash = xss(req.body.cash);

	const updatedUser = {};
	if (firstName) {
		if (typeof firstName !== "string") {
			res.render("updateUser", {
				title: "Edit Account",
				hasErrors: true,
				error: "First name not of type string",
			});
			return;
		}
		firstName = firstName.trim();
		if (!firstName) {
			res.render("updateUser", {
				title: "Edit Account",
				hasErrors: true,
				error: "First name is just spaces",
			});
			return;
		}
		updatedUser.firstName = firstName;
	}
	if (lastName) {
		if (typeof lastName !== "string") {
			res.render("updateUser", {
				title: "Edit Account",
				hasErrors: true,
				error: "Last name not of type string",
			});
			return;
		}
		lastName = lastName.trim();
		if (!lastName) {
			res.render("updateUser", {
				title: "Edit Account",
				hasErrors: true,
				error: "Last name is just spaces",
			});
			return;
		}
		updatedUser.lastName = lastName;
	}
	if (email) {
		if (typeof email !== "string") {
			res.render("updateUser", {
				title: "Edit Account",
				hasErrors: true,
				error: "Email not of type string",
			});
			return;
		}
		email = email.trim();
		if (!email) {
			res.render("updateUser", {
				title: "Edit Account",
				hasErrors: true,
				error: "Email is just spaces",
			});
			return;
		}
		email = email.toLowerCase();
		let pattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;
		if (!pattern.test(email)) {
			res.render("updateUser", {
				title: "Edit Account",
				hasErrors: true,
				error: "Invalid email",
			});
			return;
		}
		updatedUser.email = email;
	}
	if (password) {
		if (!(password && passwordConfirm)) {
			res.render("updateUser", {
				title: "Edit Account",
				hasErrors: true,
				error: "Both password and confirmed password must be inputted",
			});
			return;
		}
		if (typeof password !== "string" || typeof passwordConfirm !== "string") {
			res.render("updateUser", {
				title: "Edit Account",
				hasErrors: true,
				error: "Password or confirmed password not of type string",
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
		updatedUser.password = hash;
	}

	if (age) {
		if (isNaN(age) || Number(age) % 1 != 0) {
			res.render("updateUser", {
				title: "Edit Account",
				hasErrors: true,
				error: "Invalid age",
			});
			return;
		}
		updatedUser.age = parseInt(age);
	}
	if (cash) {
		if (isNaN(cash)) {
			res.render("updateUser", {
				title: "Edit Account",
				hasErrors: true,
				error: "Invalid cash amount",
			});
			return;
		}
		updatedUser.cash = Number(cash);
	}
	if (Object.keys(updatedUser).length == 0) {
		res.render("updateUser", {
			title: "Edit Account",
			hasErrors: true,
			error: "All fields are empty",
		});
		return;
	}

	try {
		let oldEmail = xss(req.session.user.email);
		let user = await users.getUserByEmail(oldEmail);
		let updatedReturnUser = await users.updateUser(user._id, updatedUser);
		if (email) {
			if (email != oldEmail) {
				let updatedUserMetrics = {
					email: email,
				};
				let userMetricsReturn = await userMetrics.get(
					xss(req.session.user.email)
				);
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
		}
	} catch (e) {
		// console.log(e);
		return res.render("updateUser", {
			title: "Edit Account",
			hasErrors: true,
			error: "Error with updating info",
		});
	}
	res.render("updateUser", {
		title: "Edit Account",
		hasErrors: false,
		success: true,
	});
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
