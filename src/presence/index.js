import presences from './presences';

export const GetRandomPresence = () => {
    return presences[Math.floor(Math.random()*presences.length)];
}

export const SetPresence = (presence = GetRandomPresence(), client) => {
    client.user.setPresence({
        game: {
            type: '',
            name: presence
        }
    });
}

export const StartPresenceCycler = (minutes, client) => {
    SetPresence(GetRandomPresence(), client);
    
    setInterval(() => {
        SetPresence(GetRandomPresence(), client);
    }, (minutes * 60) * 1000);
}

export default StartPresenceCycler;
