import defaultConfig from './config.default.json';
import { getRecord, updateRecord } from '../database';

let config = defaultConfig;

const SaveConfig = async () => {
    return new Promise((resolve, reject) => {
        updateRecord('config', {}, config).then((data, err) => {
            if (err) {
                console.log("Error writing item", err);
                return;
            }

            console.log("Written config to database", data);
            return data;
        });
    });
};

export const LoadConfig = async () => {
    await getRecord('config')
        .then((data) => {
            if (data) {
                config = data;
                console.log('Config fetched from MongoDB: ', config);
            } else {
                console.log('Loaded default config: ', config);
                SaveConfig();
                console.log('Storing config to database');
            }
        });

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
    SaveConfig();
};
