let MongoClient = require('mongodb').MongoClient;  
let url = "mongodb://localhost:27017/ZwazStocks";  
MongoClient.connect(url, function(err, db) {  
    if (err) throw err;  
    let dbase = db.db('ZwazStocks');
    dbase.createCollection("employees", function(err, res) {  
        if (err) throw err;  
        console.log("Collection is created!");  
        db.close();  
    });  
});  