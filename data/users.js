const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
let { ObjectId } = require("mongodb");

async function getAllUsers() {
	const userCollection = await users();
	return await userCollection.find({}).toArray();
}

async function getUserById(id) {
	if (!id || typeof id !== "object" || Array.isArray(id))
		throw "Invalid ID parameter";

	const userCollection = await users();
	const user = await userCollection.findOne({ _id: id });

	if (!user) throw "User not found";
	return user;
}

async function getUserByEmail(email) {
	if (!email) {
		throw "Email not provided";
	}
	if (typeof email !== "string") {
		throw "Email not of type string";
	}
	email = email.trim();
	if (!email) {
		throw "Email is empty";
	}

	const userCollection = await users();
	const user = await userCollection.findOne({ email: email });

	if (!user) throw "User not found";
	return user;
}

async function addUser(
	firstName,
	lastName,
	email,
	age,
	password,
	cash,
	stocksPurchased,
	favorites
) {
	if (
		!firstName ||
		!lastName ||
		!email ||
		!age ||
		!password ||
		!cash ||
		!stocksPurchased ||
		!favorites
	)
		throw "Missing parameters";
	if (
		typeof firstName !== "string" ||
		typeof lastName !== "string" ||
		typeof email !== "string" ||
		typeof password !== "string"
	)
		throw "Invalid string parameters";
	if (typeof age != "number" || age % 1 != 0) throw "Age is invalid";
	if (typeof cash != "number") throw "Cash is invalid";
	if (!Array.isArray(stocksPurchased)) throw "StocksPurchased is invalid";
	if (!Array.isArray(favorites)) throw "Favorites is invalid";

	let lowerCaseEmail = email.toLowerCase();
	const userCollection = await users();
	let newUser = {
		_id: new ObjectId(),
		firstName: firstName,
		lastName: lastName,
		email: lowerCaseEmail,
		age: age,
		password: password,
		cash: cash,
		stocksPurchased: stocksPurchased,
		favorites: favorites,
	};

	const newInsertInformation = await userCollection.insertOne(newUser);
	if (newInsertInformation === 0) throw "Insert failed";

	return getUserById(newInsertInformation.insertedId);
}

async function removeUser(id) {
	if (!id || typeof id !== "object") throw "Invalid ID parameter";

	const userCollection = await users();
	let user = null;
	try {
		user = await getUserById(id);
	} catch (e) {
		return;
	}

	const deletionInfo = await userCollection.removeOne({ _id: id });
	if (deletionInfo.deletedCount === 0)
		throw "Could not delete user " + id.toString();

	return true;
}

async function updateUser(id, updatedUser) {
	if (!id || typeof id !== "object") throw "Invalid ID parameter";
	if (!updatedUser || typeof updatedUser !== "object")
		throw "Invalid updatedUser parameter";

	const userCollection = await users();
	const updateUserData = {};

	if (updatedUser.firstName) updateUserData.firstName = updatedUser.firstName;
	if (updatedUser.lastName) updateUserData.lastName = updatedUser.lastName;
	if (updatedUser.email) updateUserData.email = updatedUser.email;
	if (updatedUser.age) updateUserData.age = updatedUser.age;
	if (updatedUser.password) updateUserData.password = updatedUser.password;
	if (updatedUser.cash) updateUserData.cash = updatedUser.cash;
	if (updatedUser.stocksPurchased)
		updateUserData.stocksPurchased = updatedUser.stocksPurchased;
	if (updatedUser.favorites) updateUserData.favorites = updatedUser.favorites;

	await userCollection.updateOne({ _id: id }, { $set: updateUserData });

	return await getUserById(id);
}

module.exports = {
	getAllUsers,
	getUserById,
	getUserByEmail,
	addUser,
	removeUser,
	updateUser,
};
