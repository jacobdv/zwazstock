let MongoClient = require('mongodb').MongoClient;
// const url = 'mongodb://localhost:27017/ZwazStocks';

// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     console.log('Database Created!');
//     db.close();
// });

MongoClient.connect('mongodb://localhost:27017/ZwazStock', function(err, db) {
    let collection = db.collection('Test');
});