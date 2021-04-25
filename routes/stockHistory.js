const express = require("express");
const router = express.Router();
const data = require("../data");
const historyData = data.buySellHistory;

router.post("/stockHistory", async (req, res) => {
	//check email
	let email = req.body["user_email"];			// user enters in form from History.handlebars

    if (!email) {
		return res.render("history", {			// does this render home?? or should it render buysell?
			title: "History",
			hasErrors: true,
			error: "Please input your Email",
		});
	}

	try {
		//call getHistoryByEmail
		const transactionInfo = await historyData.getHistoryByEmail(email);
		
		res.render("stockHistory", { title: email, isSuccessful: true,  });			// what is this supposed to be rendering
	} catch (e) {
		return res.render("stockHistory", { title: type.toUpperCase(), isSuccessful: false,  });
	}


})

module.exports = router;