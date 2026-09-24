const mongodb = require('mongodb');
let mongoose = require('mongoose');
const { bookMovieSchema } = require('./schema');

const mongoURI = "mongodb+srv://janhavibhandare2022_db_user:MovieApp123@cluster0.xvnrfaa.mongodb.net/?retryWrites=true&w=majority";


mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
})
.then(() => {
    console.log("connection established with mongodb server online");
})
.catch((err) => {
    console.log("error while connection", err);
});

let collection_connection = mongoose.model('bookmovitckets', bookMovieSchema);

exports.connection = collection_connection;