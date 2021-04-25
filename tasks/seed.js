const dbConnection = require("../config/mongoConnection");
const data = require("../data");
const users = data.users;

async function main() {
    const db = await dbConnection();
    await db.dropDatabase();

    const user = {
        firstName: "Edward",
        lastname: "Yaroslavsky",
        email: "some@email.com",
        age: 20,
        password: "password",
        cash: 17.38,
        stocksPurchased: []
    };

    const myUser = await users.addUser(user.firstName, user.lastname, user.email, user.age, user.password, user.cash, user.stocksPurchased);

    console.log('Done seeding database');

    await db.serverConfig.close();
}

main().catch((error) => {
    console.error(error);
    return dbConnection().then((db) => {
      return db.serverConfig.close();
    });
});