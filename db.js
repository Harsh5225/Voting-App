const mongoose=require('mongoose')
require('dotenv').config();

const mongoURL=process.env.MONGO_DB_LocalUrl;

mongoose.connect(mongoURL)
.then(()=>{
    console.log('Connected to  mongodb');
})
.catch((err)=>{
    console.log('MongoDb  connection error :',err);
})

const db=mongoose.connection;

db.on('disconnected',()=>{
    console.log('Connection to Mongodb server lost');
})

module.exports=db;
