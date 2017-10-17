const GetVoiceChannel = (message) => {
    let voiceChannel;
    let playerFoundInVoice = false;
    message.guild.channels.forEach(channel => {
        if (channel.type === 'voice') {
        channel.members.forEach(member => {
            if (member.id == message.author.id) {
            playerFoundInVoice = true;
            voiceChannel = channel;
            }
        })
        }
    });

    if (!playerFoundInVoice) {
        throw new Error('Did not find player in voice');
    }

    return voiceChannel;
};

export default GetVoiceChannel;
