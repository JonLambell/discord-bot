import Heroku from 'heroku-client';
import defaultConfig from './config.default.json';

let config;
let heroku_client;

const LoadHerokuConfig = async () => {
    heroku_client = new Heroku({ token: process.env.HEROKU_TOKEN });

    return await heroku_client.get(`/apps/${defaultConfig.heroku_config.app_name}/config-vars`).then(config_vars => {
        let filteredConfig = Object.keys(config_vars)
        .filter(key => key.startsWith('LBCONFIG_'))
        .reduce((obj, key) => {
            delete obj[key]; 
            obj[key.replace('LBCONFIG_', '').toLowerCase()] = ConvertToType(config_vars[key]);
            return obj;
        }, {});

        return filteredConfig;
    });
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

export const LoadConfig = async () => {
    let heroku_config;

    if (defaultConfig.heroku_config.enabled && process.env.HEROKU_TOKEN) {
        await LoadHerokuConfig().then((newConfig) => {
            config = Object.assign({}, defaultConfig, newConfig);
        });
    } else {
        config = defaultConfig;
    }
    console.log(config);

    SaveConfig(config);
    return config;
};

export const SaveConfig = async (config) => {
    console.log('Saving config');
    return await heroku_client.patch(`/apps/${defaultConfig.heroku_config.app_name}/config-vars`,
    {
        body: {
            LBCONFIG_AUTOCLEANUP: 20
        }
    }).then((data) => data);
};

export const UpdateConfig = (prop, value) => {
    let convertVal = value;

    if (value.toLowerCase() === 'false') {
        convertVal = false;
    } else if (value.toLowerCase() === 'true') {
        convertVal = true;
    } else if (!isNaN(value)) {
        convertVal = parseInt(value, 10);
    }

    config[prop] = convertVal;
    fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);
};
