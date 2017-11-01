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

export const getRecord = async (collectionName, record = {}) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(process.env.MONGODB_URI, (err, db) => {
            if (err) {
                db.close();
                return reject(err);
            }
            
            const collection = db.collection(collectionName);
    
            collection.findOne(record, {limit: 1}, (err, data) => {
                if (err) {
                    db.close();
                    return reject(err);
                }
                db.close();
                return resolve(data)
            });
        });
    });
};

export const updateRecord = async (collectionName, record, value) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(process.env.MONGODB_URI, (err, db) => {
            if (err) {
                db.close();
                return reject(err);
            }
            
            const collection = db.collection(collectionName);
    
            collection.updateOne(record, value, {upsert:true, w: 1}, (err, data) => {
                if (err) {
                    db.close();
                    return reject(err);
                }
                db.close();
                return resolve(data)
            });
        });
    });
};
