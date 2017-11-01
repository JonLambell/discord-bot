import Traveler from 'the-traveler';
import { ComponentType } from 'the-traveler/build/enums';

const traveler = new Traveler({
    apikey: process.env.BUNGIE_API_KEY,
    userAgent: 'LargohBot / v1.2.0'
});

export const getMembershipId = (displayName, platform) => {
    traveler.searchDestinyPlayer(
        platform.toString(),
        displayName
    )
    .then(player => {
        console.log(player);
    })
    .catch(err => {
        if(err.ErrorCode == 2101) {
            console.error('There was a problem with your request: ', err);
        }
        console.error(err);
    });
}

