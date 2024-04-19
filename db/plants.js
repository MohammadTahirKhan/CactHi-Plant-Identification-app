const mongoose = require('mongoose');
const mongoDB = "mongodb://localhost:27017/plants"
let connection;

mongoose.Promise = global.Promise;

mongoose.connect(mongoDB, {
    family: 4
}).then(result => {
    connection = result.connection;
    console.log('Connected to MongoDB');
}).catch(err => {
    console.log('Error connecting to MongoDB');
    console.log(err);
});
