import presences from './presences';

let timer;
let CurrentIndex = 0;

export const GetRandomPresence = () => {
    let newIndex;
    
    do {
        newIndex = Math.floor(Math.random()*presences.length);
    } while(CurrentIndex == newIndex)
    
    CurrentIndex = newIndex;
    
    return presences[CurrentIndex];
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
