const mongoCollections = require('../config/mongoCollections');
const UserMetrics = mongoCollections.UserMetrics;
const users = mongoCollections.users;
const buySell = mongoCollections.BuySellHistory;
const stocks = mongoCollections.Stocks;
let { ObjectId } = require('mongodb');

const create = async function create(email, totalReturn, percentGrowth, volatility){
    const metricsCollection = await UserMetrics()

    let newMetric = {
        email: email,
        totalReturn: totalReturn,
        percentGrowth: percentGrowth,
        volatility: volatility
    }

    const insertInfo = await UserMetrics.insertOne(newMetric)
    if (insertInfo.insertedCount === 0) throw 'Could not add metric'

    const newId = insertInfo.insertedId;

    const metric = await get(newId.toString());
    metric._id = metric._id.toString()
    return metric;
}

function getTotalReturn(email){

}

const update = async function update(email){
    totalReturn = await getTotalReturn(email);
}


module.exports = {
    create
};