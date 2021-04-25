const express = require("express");
const router = express.Router();
const data = require("../data");
const historyData = data.buySellHistory;



router.post("/buysell", async (req, res) => {
	//write logix
	//call buy sell history
    let ticker = req.body["stock_ticker"];
    let type = req.body["transaction_type"];
    let amount = req.body["amount"];
    let date = req.body["date"];

// should this be home?
    if (!ticker || !type || !amount) {
		return res.render("home", {
			title: "Home",
			hasErrors: true,
			error: "Please input all parametes",
		});
	}
	ticker = ticker.trim();
	try {
        //call function to buy stock
		res.render("buysell", { title: type.toUpperCase(), isSuccessful: true,  });
	} catch (e) {
		return res.render("buysell", { title: type.toUpperCase(), isSuccessful: false,  });
	}

// need stock price at purchase 

})

module.exports = router;