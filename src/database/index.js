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
                return;
            }
    
            console.log(result);
            return result;
        });

        db.close();
    });
};

export const getRecord = async (collectionName) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(process.env.MONGODB_URI, (err, db) => {
            if (err) {
                reject(err);
                return;
            }
            
            const collection = db.collection(collectionName);
            let record;
    
            collection.findOne({}, {limit: 1}, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(record)
            });
            db.close();
            return;
        });
    });
}
