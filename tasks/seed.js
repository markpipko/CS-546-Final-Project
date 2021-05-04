const { ObjectId } = require("mongodb");
const dbConnection = require("../config/mongoConnection");
const data = require("../data");
const users = data.users;
const userMetrics = data.userMetrics;
const userBSH = data.buySellHistory;

async function main() {
    const db = await dbConnection();
    await db.dropDatabase();

    const user1 = {
        firstName: "Edward",
        lastname: "Yaroslavsky",
        email: "ed@yar.com",
        age: 20,
        password: "$2a$16$BaeX2kVugx8V0dYmMfXYWeorss96qNo7nQmqmJesxT2HkTjRRNWmO",
        cash: 1000,
        stocksPurchased: [
            {
                _id: new ObjectId(),
                ticker: "AAPL",
                amount: 3,
                purchaseValue: 132.54,
                datePurchased: new Date("2021-05-04")
            },
            {
                _id: new ObjectId(),
                ticker: "T",
                amount: 2,
                purchaseValue: 32.02,
                datePurchased: new Date("2021-05-04")
            }
        ]
    };

    const userMetrics1 = {
        email: "ed@yar.com",
        totalReturn: 0,
        percentGrowth: 0,
        volatility: 0
    };

    const userBSH1 = {
        email: "ed@yar.com",
        history: [
            {
                _id: new ObjectId(),
                transaction: "BUY",
                ticker: "AAPL",
                value: 132.54,
                amount: 3,
                date: new Date("2021-05-04")
            },
            {
                _id: new ObjectId(),
                transaction: "BUY",
                ticker: "T",
                value: 32.02,
                amount: 2,
                date: new Date("2021-05-04")
            }
        ]
    }

    const myUser1 = await users.addUser(user1.firstName, user1.lastname, user1.email, user1.age, user1.password, user1.cash, user1.stocksPurchased);
    const myUserMetrics1 = await userMetrics.create(userMetrics1.email, userMetrics1.totalReturn, userMetrics1.percentGrowth, userMetrics1.volatility);
    const myUserBSH1 = await userBSH.create(userBSH1.email, userBSH1.history);


    const user2 = {
        firstName: "Mark",
        lastname: "Pipko",
        email: "mark@pipko.com",
        age: 21,
        password: "$2a$16$WXAVCbzEoz054eOuV4pI2OChcysosUOJe91vPw8u.sfmWXr.KjjdS",
        cash: 1000,
        stocksPurchased: [
            {
                _id: new ObjectId(),
                ticker: "FB",
                amount: 1,
                purchaseValue: 318.36,
                datePurchased: new Date("2021-05-04")
            },
            {
                _id: new ObjectId(),
                ticker: "DAL",
                amount: 4,
                purchaseValue: 44.66,
                datePurchased: new Date("2021-05-04")
            }
        ]
    };

    const userMetrics2 = {
        email: "mark@pipko.com",
        totalReturn: 0,
        percentGrowth: 0,
        volatility: 0
    };

    const userBSH2 = {
        email: "mark@pipko.com",
        history: [
            {
                _id: new ObjectId(),
                transaction: "BUY",
                ticker: "FB",
                value: 318.36,
                amount: 1,
                date: new Date("2021-05-04")
            },
            {
                _id: new ObjectId(),
                transaction: "BUY",
                ticker: "DAL",
                value: 44.66,
                amount: 4,
                date: new Date("2021-05-04")
            }
        ]
    }

    const myUser2 = await users.addUser(user2.firstName, user2.lastname, user2.email, user2.age, user2.password, user2.cash, user2.stocksPurchased);
    const myUserMetrics2 = await userMetrics.create(userMetrics2.email, userMetrics2.totalReturn, userMetrics2.percentGrowth, userMetrics2.volatility);
    const myUserBSH2 = await userBSH.create(userBSH2.email, userBSH2.history);


    const user3 = {
        firstName: "Chris",
        lastname: "Moon",
        email: "chris@moon.com",
        age: 21,
        password: "$2a$16$Y8Sv4dI0uKhvKA7RyKYiIeF0cj6V22dIGjEr0qWTwsL2t.peZyG1W",
        cash: 1000,
        stocksPurchased: [
            {
                _id: new ObjectId(),
                ticker: "KO",
                amount: 3,
                purchaseValue: 54.14,
                datePurchased: new Date("2021-05-04")
            },
            {
                _id: new ObjectId(),
                ticker: "NFLX",
                amount: 1,
                purchaseValue: 503.18,
                datePurchased: new Date("2021-05-04")
            }
        ]
    };

    const userMetrics3 = {
        email: "chris@moon.com",
        totalReturn: 0,
        percentGrowth: 0,
        volatility: 0
    };

    const userBSH3 = {
        email: "chris@moon.com",
        history: [
            {
                _id: new ObjectId(),
                transaction: "BUY",
                ticker: "KO",
                value: 54.14,
                amount: 3,
                date: new Date("2021-05-04")
            },
            {
                _id: new ObjectId(),
                transaction: "BUY",
                ticker: "NFLX",
                value: 503.18,
                amount: 1,
                date: new Date("2021-05-04")
            }
        ]
    }

    const myUser3 = await users.addUser(user3.firstName, user3.lastname, user3.email, user3.age, user3.password, user3.cash, user3.stocksPurchased);
    const myUserMetrics3 = await userMetrics.create(userMetrics3.email, userMetrics3.totalReturn, userMetrics3.percentGrowth, userMetrics3.volatility);
    const myUserBSH3 = await userBSH.create(userBSH3.email, userBSH3.history);

    console.log('Done seeding database');

    await db.serverConfig.close();
}

main().catch((error) => {
    console.error(error);
    return dbConnection().then((db) => {
      return db.serverConfig.close();
    });
});