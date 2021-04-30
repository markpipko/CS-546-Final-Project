const express = require("express");
const router = express.Router();
const data = require("../data");
const historyData = data.buySellHistory;

router.get("/stockHistory", async (req, res) => {
	if(!req.session.user){
        res.render("login", { title: "Login" });
        return
    }

	const trade = await historyData.getHistoryByEmail(req.session.user.email);

    res.render("stockHistory", {title: "History", trade: trade.history})

})

module.exports = router;