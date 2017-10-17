import defaultConfig from './config.default.json';
import AWS from 'aws-sdk';

let config = defaultConfig;
let redis;

const baseAWSParams = {
    TableName: process.env.AWS_TABLE_NAME
};

const ddb = new AWS.DynamoDB({
    region: 'eu-west-1'
});

const UpdateAWSConfig = async () => {
    const promise = ddb.updateItem(
        Object.assign(
            {},
            baseAWSParams,
            {
                Key: {
                    'id': {
                        S: '1'
                    }
                },
                UpdateExpression: "set config = :c",
                ExpressionAttributeValues:{
                    ":c": JSON.stringify(config)
                },
                ReturnValues:"UPDATED_NEW"
            }
        )
    ).promise();
    
    return await promise.then((data, err) => {
            if (err) {
                console.log("Error updating config in DB", err);
            } else {
               console.log("Config updated in AWS");
            }
        }
    );
};

const GetAWSConfig = async () => {
    const getPromise = ddb.getItem(
        Object.assign(
            {},
            baseAWSParams,
            {
                Key: {
                    'id': {
                        S: '1'
                    }
                }
            }
        )
    ).promise();

    return await getPromise.then((data, err) => {
        if (!err && data.Item && data.Item.config) {
            return JSON.parse(data.Item.config.S);
        }

        if (err) {
            console.log("Error", err);
        }

        SaveAWSConfig();
        return config;
    });
};

const SaveAWSConfig = async () => {
    const promise = ddb.putItem(
        Object.assign(
            {},
            baseAWSParams,
            {
                Item: {
                    'id': {
                        S: '1'
                    },
                    'config': {
                        S: JSON.stringify(config)
                    }
                }
            }
        )
    ).promise();

    return await promise.then((data, err) => {
        if (err) {
            console.log("Error writing new item", err);
            return;
        } else {
            console.log("Written config to database", data);
            return data;
        }
    });
};

export const LoadConfig = async () => {
    await GetAWSConfig().then((data) => {
        if (data) {
            config = data;
        }
    });
    console.log('Config fetched from AWS: ', config);

    return config;
};

const ConvertToType = (value) => {
    if (value.toLowerCase() === 'true') {
        return true;
    }

    if (value.toLowerCase() === 'false') {
        return false;
    }

    if (!isNaN(value)) {
        return parseInt(value, 10);
    }

    return value;
}

export const UpdateConfig = (prop, value) => {
    let convertVal = value;

    if (value.toLowerCase() === 'false') {
        convertVal = false;
    } else if (value.toLowerCase() === 'true') {
        convertVal = true;
    } else if (!isNaN(value)) {
        convertVal = parseInt(value, 10);
    }

    config[prop] = ConvertToType(value);
    SaveAWSConfig(config);
};
