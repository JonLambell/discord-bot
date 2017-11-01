import { MongoClient } from 'mongodb';

let database;
let isConnected = false;

const connect = () => {
    MongoClient.connect(process.env.MONGODB_URI, (err, db) => {
        if (err) {
            console.error(err);
            return;
        }
        
        database = db;
        isConnected = true;
    });
}

const disconnect = () => {
    database.close();
    isConnected = false;
    database = null;
}

export const insertMany = async (collection, items) => {
    await connect();
    const collection = database.collection(collection);
    collection.insertMany(items, (err, result) => {
        if(err) {
            console.error(err);
            disconnect();
            return;
        }

        disconnect();
        return result;
    });
}
