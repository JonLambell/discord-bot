import Heroku from 'heroku-client';
import defaultConfig from './config.default.json';

let config;

const LoadHerokuConfig = async () => {
    const heroku_client = new Heroku({ token: process.env.HEROKU_TOKEN });

    await heroku_client.get(`/apps/${defaultConfig.heroku_config.app_name}/config-vars`).then(config_vars => {
        let filteredConfig = Object.keys(config_vars)
        .filter(key => key.startsWith('LBCONFIG_'))
        .reduce((obj, key) => {
          obj[key] = config_vars[key];
          return obj;
        }, {});
        console.log(filteredConfig);

        return filteredConfig;
    });
    console.log('Config...yay');
};

export const LoadConfig = async () => {
    let heroku_config;
    console.log(defaultConfig);

    if (defaultConfig.heroku_config.enabled && process.env.HEROKU_TOKEN) {
        await LoadHerokuConfig().then((newConfig) => {
            config = Object.assign({}, defaultConfig, newConfig);
            console.log(newConfig);
        });
    } else {
        config = defaultConfig;
    }
    console.log(config);

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
