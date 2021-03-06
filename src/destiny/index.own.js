import fetch from 'node-fetch';

const config = {
    baseUrl: 'https://www.bungie.net/Platform/Destiny2',
    options: {
        headers: {
            'X-API-Key': process.env.BUNGIE_API_KEY,
            'User-Agent': 'GFX / 1.0.0'
        }
    }
};

export const getMembershipId = (displayName, platform) => {
    let membershipId;
    console.log(`${config.baseUrl}/SearchDestinyPlayer/${platform.toString()}/${encodeURIComponent(displayName)}/`);
    fetch(`${config.baseUrl}/SearchDestinyPlayer/${platform.toString()}/${encodeURIComponent(displayName)}/`, config.options)
    .then(res => res.json())
    .then(player => {
        console.log(player);
        //membershipId = player.Response[0].membershipId;
    })
    .catch(err => console.error);

    return membershipId;
}
