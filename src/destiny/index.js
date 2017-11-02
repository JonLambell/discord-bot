import Traveler from 'the-traveler';
import Manifest from 'the-traveler/build/Manifest';
import fetch from 'node-fetch';
import { ComponentType } from 'the-traveler/build/enums';
import { updateRecord, getRecord } from '../database';

const traveler = new Traveler({
    apikey: process.env.BUNGIE_API_KEY,
    userAgent: 'LargohBot / v1.2.0'
});

let ManifestFile;

export const downloadManifest = () => {
    traveler.getDestinyManifest().then(result => {
        traveler.downloadManifest(result.Response.mobileWorldContentPaths.en, './manifest.content').then(filepath => {
            ManifestFile = filepath;
        });
    });
}

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

export const getCharacters = async (discordMemberId) => {
    console.log('Getting...');
    let player;
    await getRecord('DestinyPlayers', {user: discordMemberId}).then(record => {
        player = record
    });

    await traveler.getProfile(
        player.platform,
        destinyMemberhsipId,
        { components: [
            ComponentType.Characters
        ]}
    ).then((data) => {
        // console.log(data.Response.characters.data);
        for (let [characterId, character] of Object.entries(data.Response.characters.data)) {
            console.log('heres one: ', character);
        }

        const manifest = new Manifest(ManifestFile);
        manifest.queryManifest('SELECT name FROM sqlite_master WHERE type="table"').then(queryResult => {
            console.log(queryResult);
        }).catch(err => {
            console.log(err);
        });
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
            updateRecord('DestinyPlayers', {user: discordId}, {$set: {membershipId: player.Response[0].membershipId, platform: platform, displayName: displayName}})
                .then((data, err) => {
                    if (err) {
                        console.log("Error writing item", err);
                        return;
                    }
        
                    console.log("Written player to database");
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

const getStoredPlayer = async (discordMemberId) => {
    let player;
    await getRecord('DestinyPlayers', {user: discordMemberId}).then(record => {
        player = record
    });

    return player;
}

export const tmpDestinyCommand = async (args, discordMemberId) => {
    let queryString;
    if (args.length < 2) {
        const player = await getStoredPlayer(discordMemberId);
        queryString = encodeURIComponent(`${args[0]} ${player.displayName} ${player.platform}`);
    } else {
        queryString = encodeURIComponent(`${args[0]} ${args[1]}${args.length > 2 ? ` ${args[2]}` : ''}`)
    }
console.log(queryString);
    return new Promise((resolve, reject) => {
        fetch(`https://destinycommand.com/live/api/command?query=${queryString}&token=15096086011922971859&default_console=pc`)
        .then(res => res.text())
        .then(data => {
            console.log('Data: ', data);
        })
    });
}

