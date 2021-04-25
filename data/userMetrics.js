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

const get = async function get(email){
    const metricsCollection = await UserMetrics()
    const metric = await metricsCollection.findOne({ email: email});
    return metric
}

async function getReturns(email){
    const userList = await users()
    const buySellHistory = await buySell()
    const stockList = await stocks()

    let person
    for(var i = 0; i < buySellHistory.length; i++){
        if(email == buySellHistory[i].email){
            person = buySellHistory[i]
        }
    }

    let bought = 0
    let sold = 0
    let owned = 0
    for(var i = 0; i < person.history.length; i++){
        if(person.history.transaction == "BUY"){
            bought += person.history.value * person.history.amount
        }
        if(history.transaction == "SOLD"){
            sold += history.value * history.amount
        }
    }

    for(var i = 0; i < userList.length; i++){
        let ticker = userList[i].stocksPurchased.ticker
        for(var k = 0; k < stocks.length; k++){
            if(ticker == stocks[k].ticker){
                owned += stocks[k].value * person.stocksPurchased[i].amount
            }
        }
    }

    let totalReturn = (sold + owned) - bought
    let percentGrowth = totalReturn / bought * 100
    return [totalReturn, percentGrowth]
}

const update = async function update(email){
    const metricsCollection = await UserMetrics()

    returns =  await getReturns(email);
    let totalReturn = returns[0]
    let percentGrowth = returns[1]

    let metric = await get(email)
    let newMetric = {
        email: metric.email,
        totalReturn: totalReturn,
        percentGrowth: percentGrowth
    }

    const updatedInfo = await metricsCollection.updateOne(
        {email: email},
        {$set: newMetric}
    )

    if (updatedInfo.modifiedCount === 0) {
        throw 'Could not update metrics';
    }

    newMetric = await get(email)
    newMetric._id = newMetric._id.toString()
    return newMetric
}

const remove = async function remove(email){
    const metricsCollection = await UserMetrics()
    const deletionInfo  = await metricsCollection.deleteOne({ email: email });

    if (deletionInfo.deletedCount === 0) {
      throw 'No metric with that email';
    }

    return 
}


module.exports = {
    create,
    get,
    update,
    remove
};