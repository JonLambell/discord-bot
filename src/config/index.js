import Heroku from 'heroku-client';
import defaultConfig from './config.default.json';

let config;

const LoadHerokuConfig = () => {
    const heroku_client = new Heroku({ token: process.env.HEROKU_TOKEN });

    heroku_client.get('/apps/config-vars').then(config_vars => {
        console.log(config_vars);
    });
    console.log('Config...yay');
    config = defaultConfig;
};

export const LoadConfig = () => {
    let heroku_config;

    if (defaultConfig.heroku_config.enabled && process.env.HEROKU_TOKEN) {
        LoadHerokuConfig();
    } else {
        config = defaultConfig;
    }

    return config;
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
