const mongoose = require('mongoose');


const saveIpMongo = new mongoose.Schema({
    ipAdress: String,
    host: String,
    count: Number,
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    
});



module.exports = saveIpMongo;