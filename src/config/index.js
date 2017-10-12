import defaultConfig from './config.default.json';
import Redis from 'ioredis';

let config;
let redis;

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
    const redis = new Redis(process.env.REDIS_URL);
    redis.set('foo', 'bar');
    redis.get('foo', function (err, result) {
      console.log(result);
    });
    return defaultConfig;
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
