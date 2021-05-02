const mongoCollections = require("../config/mongoCollections");
const BuySellHistory = mongoCollections.buySellHistory;
let { ObjectId } = require("mongodb");

//show the history
async function getHistoryByEmail(email) {
     if (!email || typeof email !== "string") throw "Invalid Email parameter";

     const historyCollection = await BuySellHistory();
     const userHistory = await historyCollection.findOne({ email: email });

     if (!userHistory) throw "User History not found";
     return userHistory;
 }

async function create(email, history){
    if (!email || typeof email !== "string") throw "Invalid Email parameter";
    if (!history || !Array.isArray(history)) throw "Invalid history parameter";
    
    const historyCollection = await BuySellHistory();
    let newUser = {
        email: email,
        history: history
    };

    const insertInfo = await historyCollection.insertOne(newUser);
    if(insertInfo.insertedCount=== 0) throw "Could not add user history";
    
    //const newId = insertInfo.insertedId;
    const transaction = await this.getHistoryByEmail(email);
    return transaction;
}

async function addHistory(email, transaction, ticker, value, amount, date){
    if (!email || typeof email !== "string") throw "Invalid Email parameter";
    if (!transaction) throw "Invalid transaction parameter";
    if (!ticker) throw "Invalid ticker parameter";
    if (!value) throw "Enter value of shares of transaction";
    if (!amount) throw "Enter number of shares of transaction";
    if (!date) throw "Enter date of Transaction"; // should this be some date object

    const historyCollection = await BuySellHistory()
    let user = await getHistoryByEmail(email)

    let newTransaction = {
        _id: ObjectId(),
        transaction: transaction,
        ticker: ticker,
        value: value,
        amount: amount,
        date: date,
    }

    const updateInfo = await historyCollection.updateOne(
        { _id: user._id },
        { $addToSet: {history: newTransaction} }
      );
  
      if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
        throw 'Could not add transaction';

    user = await getHistoryByEmail(email)

    return user
}

const remove = async function remove(email) {
	const historyCollection = await BuySellHistory()
	const deletionInfo = await historyCollection.deleteOne({ email: email });

	if (deletionInfo.deletedCount === 0) {
		throw "No user with that email";
	}

	return;
};



module.exports = {
    getHistoryByEmail,
    create,
    addHistory,
    remove
};