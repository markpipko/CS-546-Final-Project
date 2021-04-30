const mongoCollection = require("../config/mongoCollections");
const buySellHistory = mongoCollection.buySellHistory;

async function getAllBuySellHistory() {
    const bshCollection = await buySellHistory();
    return await bshCollection.find({}).toArray();
}