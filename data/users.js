const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
let { ObjectId } = require("mongodb");

async function getUserById(id) {
    if (!id || typeof id !== "object") throw "Invalid ID parameter";

    const userCollection = await users();
    const user = await userCollection.findOne({ _id: id });

    if (!user) throw "User not found";
    return user;
}

async function addUser(firstName, lastName, email, age, password, cash, stocksPurchased) {
    if (!firstName || !lastName || !email || !age || !password || !cash || !stocksPurchased)
        throw "Missing parameters";
    if (typeof firstName !== "string" || typeof lastName !== "string" || typeof email !== "string") 
        throw "Invalid string parameters";
    if (typeof age != "number" || age % 1 != 0) throw "Age is invalid";
    if (typeof cash != "number") throw "Cash is invalid";
    if (!Array.isArray(stocksPurchased)) throw "StocksPurchased is invalid";
    if (typeof password !== "string" || !isHashed(password)) throw "Password is invalid";

    const userCollection = await users();
    let newUser = {
        _id: new ObjectId(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        age: age,
        password: password,
        cash: cash,
        stocksPurchased: stocksPurchased
    };

    const newInsertInformation = await userCollection.insertOne(newUser);
    if (newInsertInformation === 0) throw "Insert failed";

    return getUserById(newInsertInformation.insertedId);
}

function isHashed(password) {
    //TODO: implement hashing for passwords
    return true;
}

function isValidEmail(email) {
    //TODO: check if email is valid
}

module.exports = {
    getUserById,
    addUser
};