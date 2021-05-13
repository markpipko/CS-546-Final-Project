const mongoCollections = require("../config/mongoCollections");
const BuySellHistory = mongoCollections.buySellHistory;
let { ObjectId } = require("mongodb");

// Gets user buy and sell history by email
async function getHistoryByEmail(email) {
	if (!email || typeof email !== "string") throw "Invalid Email parameter";
	email = email.trim();
	if (!email) {
		throw "Email is empty";
	}
	email = email.toLowerCase();
	const historyCollection = await BuySellHistory();
	const userHistory = await historyCollection.findOne({ email: email });

	if (!userHistory) throw "User History not found";
	return userHistory;
}

async function create(email, history) {
	if (!email || typeof email !== "string") throw "Invalid Email parameter";
	email = email.trim();
	if (!email) {
		throw "Email is empty";
	}
	email = email.toLowerCase();
	if (!history || !Array.isArray(history)) throw "Invalid history parameter";

	const historyCollection = await BuySellHistory();
	let newUser = {
		email: email,
		history: history,
	};

	const insertInfo = await historyCollection.insertOne(newUser);
	if (insertInfo.insertedCount === 0) throw "Could not add user history";

	//const newId = insertInfo.insertedId;
	const transaction = await this.getHistoryByEmail(email);
	return transaction;
}

async function addHistory(email, transaction, ticker, value, amount, date) {
	if (!email || typeof email !== "string") throw "Invalid Email parameter";
	if (!transaction || typeof transaction !== "string")
		throw "Invalid transaction parameter";
	if (!ticker || typeof ticker !== "string") throw "Invalid ticker parameter";
	if (!value || typeof value !== "number") throw "Invalid value parameter";
	if (!amount || typeof amount !== "number") throw "Invalid amount parameter";
	if (!date || typeof date !== "object" || Array.isArray(date))
		throw "Invalid date parameter";

	email = email.trim();
	transaction = transaction.trim();
	ticker = ticker.trim();
	if (!email || !transaction || !ticker || !date) {
		throw "One or more parameters are empty";
	}
	const historyCollection = await BuySellHistory();
	let user = await getHistoryByEmail(email);
	if (!user) {
		throw "User could not be found";
	}

	let newTransaction = {
		_id: ObjectId(),
		transaction: transaction,
		ticker: ticker,
		value: value,
		amount: amount,
		date: date,
	};

	const updateInfo = await historyCollection.updateOne(
		{ _id: user._id },
		{ $addToSet: { history: newTransaction } }
	);

	if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
		throw "Could not add transaction";

	let updatedHistory = await getHistoryByEmail(email);

	return updatedHistory;
}

const updateEmail = async function updateEmail(id, email) {
	if (!id || typeof id !== "string") throw "Invalid ID Parameter";
	if (
		!email ||
		typeof email !== "object" ||
		!email.email ||
		typeof email.email !== "string" ||
		email.email.trim() == ""
	)
		throw "Invalid email";

	const bshCollection = await BuySellHistory();

	const updatedInfo = await bshCollection.updateOne(
		{ _id: ObjectId(id) },
		{ $set: email }
	);

	if (updatedInfo.modifiedCount === 0) {
		throw "Could not update email";
	}

	let newBSH = await getHistoryByEmail(email.email);
	newBSH._id = newBSH._id.toString();
	return newBSH;
};

const remove = async function remove(email) {
	if (!email || typeof email !== "string") {
		throw "Invalid email parameter";
	}
	email = email.trim();
	if (!email) {
		throw "Email is empty";
	}
	const historyCollection = await BuySellHistory();
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
	updateEmail,
	remove,
};
