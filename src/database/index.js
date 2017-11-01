import { MongoClient } from 'mongodb';

export const connectTest = () => {
    MongoClient.connect(process.env.MONGO_URL, (err, db) => {
        if (err) {
            console.log(err);
        }
    
        console.log(db);
        db.close();
    });
}
