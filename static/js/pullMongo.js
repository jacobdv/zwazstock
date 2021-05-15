import { MongoClient } from 'mongodb';
const url = 'mongodb://localhost:27017';

MongoClient.connect(url, { useNewUrlParser: true }, (err, mDB) => {
    if (err) throw err;

    const db = mDB.db("ZwazStocks");

    // All collections in database...
    db.listCollections().toArray().then((collections) => {
        // For each collection...
        collections.forEach((c) => {
            // Pull all the docs...
            db.collection(c.name).find({}).toArray().then((docs) => {
                // For each doc...
                docs.forEach(doc => {
                    // Create a js object array to represent the collection.
                    let collectionObject = {
                        'symbol': doc.meta.symbol,
                        'prices': {
                            'open': doc.prices.open,
                            'current': doc.prices.current,
                            'high': doc.prices.high,
                            'low': doc.prices.low,
                            'previousClose': doc.prices.previousClose
                        },
                        'date': doc.date,
                    }
                    // Console log the ticker symbol.
                    console.log(collectionObject);
                })
            });
        });
    }).catch((err) => {
        console.log(err);
    }).finally(() => {
        mDB.close();
    });
});
