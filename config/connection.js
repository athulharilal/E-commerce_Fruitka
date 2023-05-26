//connection of mongodb
const mongoClient = require('mongodb').MongoClient

//creatinf object for mongodb state
const state={
    db:null //initial state of db is null
}

//function for connecting 
module.exports.connect=function (done) {
    const url='mongodb://0.0.0.0:27017'//default port of mongob
    const dbname = 'Fruitka'//database name
    mongoClient.connect(url,(err,data)=>{//creating a connection 
        if (err) return done(err)//if error, thow an error to callback
        state.db=data.db(dbname)//else :data and databse made connection. Now assigning data and database name to state 
        done() //callback
    })
    //now connection is established
}

//to access database
module.exports.get=function () {
    return state.db//returning initial state of db
}