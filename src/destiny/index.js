import Traveler from 'the-traveler';
import { ComponentType } from 'the-traveler/build/enums';
import { updateRecord } from '../database';

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

export const registerPlayer = async (discordId, displayName, platform) => {
    return new Promise((resolve, reject) => {
        traveler.searchDestinyPlayer(
            platform.toString(),
            encodeURIComponent(displayName)
        )
        .then(player => {
            if (!player.Response.length) {
                return reject('Player not found')
            }
            updateRecord('DestinyPlayers', {user: discordId}, {$set: {membershipId: player.Response[0].membershipId}})
                .then((data, err) => {
                    if (err) {
                        console.log("Error writing item", err);
                        return;
                    }
        
                    console.log("Written player to database", data);
                    return data;
                });
            return resolve(player.Response[0].membershipId);
        })
        .catch(err => {
            if(err.ErrorCode == 2101) {
                console.error('There was a problem with your request: ', err);
            }
            console.error(err);
            return reject('There was a problem with your request.');
        });
    });
}

