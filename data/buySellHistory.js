const mongoCollections = require("../config/mongoCollections");
const BuySellHistory = mongoCollections.buySellHistory;
let { ObjectId } = require("mongodb");

//show the history
async function getHistoryByEmail(email) {
     if (!email || typeof email !== "object") throw "Invalid Email parameter";

     const historyCollection = await BuySellHistory();
     const userHistory = await historyCollection.find({ email: email });

     if (!userHistory) throw "User History not found";
     return userHistory;
 }

// 
// buy stocks function - route goes to here
// should ticker be stock info instead?
async function addTransaction(email, ticker, type, amount, date ){
    if (!email || typeof email !== "object") throw "Invalid Email parameter";
    if (!ticker) throw "Invalid ticker parameter";
    if (!type) throw "Enter the type of transaction (buy/sell)";
    if (!amount) throw "Enter number of shares of transaction";
    if (!date) throw "Enter date of Transaction"; // should this be some date object
    
    const historyCollection = await history();
    let newTransaction = {
        email: email,
        ticker: ticker,
        type: type,
        amount: amount,
        date: Date

    };
    // should this find the users individual history first by email and then add to it?
    const insertInfo = await historyCollection.insertOne(newTransaction);
    if(insertInfo.insertedCount=== 0) throw "Could not add transaction";
    
    // IS BELOW NECESSARY?????
    const newId = insertInfo.insertedId;
    const transaction = await this.getTransactionById(newId);
    return transaction;

}



module.exports = {
    getHistoryByEmail,
    addTransaction
};


