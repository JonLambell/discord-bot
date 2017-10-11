import presences from './presences';

let timer;

export const GetRandomPresence = () => {
    return presences[Math.floor(Math.random()*presences.length)];
}

export const SetPresence = (presence = GetRandomPresence(), client) => {
    console.log(`Setting presence to: ${presence}`);
    client.user.setPresence({
        game: {
            type: '',
            name: presence
        }
    });
}

export const PresenceOff = () => {
    client.user.setPresence();
}

export const StartPresenceCycler = (minutes, client) => {
    SetPresence(GetRandomPresence(), client);

    timer = setInterval(() => {
        SetPresence(GetRandomPresence(), client);
    }, (minutes * 60) * 1000);
}

export const StopPresenceCycler = () => {
    clearInterval(timer);
}

export default StartPresenceCycler;
