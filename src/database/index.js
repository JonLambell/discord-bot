import { MongoClient } from 'mongodb';

export const insertMany = (collectionName, items) => {
    MongoClient.connect(process.env.MONGODB_URI, (err, db) => {
        if (err) {
            console.error(err);
            return;
        }
        
        const collection = db.collection(collectionName);

        collection.insertMany(items, (err, result) => {
            if(err) {
                console.error(err);
                disconnect();
                return;
            }
    
            console.log(result);
            return result;
        });

        disconnect();
    });
};
