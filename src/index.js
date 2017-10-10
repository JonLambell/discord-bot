import Discord from 'discord.js';
import config from './config.json';
import TeamGen from './teamgenerator';

const client = new Discord.Client();

client.on("ready", () => {
  console.log("I am ready!");

  client.user.setPresence({
    game: {
      type: '',
      name: 'with your beard'
    }
  });
});

const TeamsToFields = (teams) => {
  const fields = [];
  
  for (const key of Object.keys(teams)) {
    let players = '';

    teams[key].players.forEach((player) => {
      players = `${players}${player}\n`;
    });

    const field = {
      name: key,
      value: players
    }

    fields.push(field);
  }

  return fields;
};

const TeamsToString = (teams) => {
  let message = '';

  for (const key of Object.keys(teams)) {
    let players = '';

    teams[key].players.forEach((player) => {
      players = `${players}${player}\n`;
    });

    message = `${message}**${key}**\n${players}\n\n`;
  }

  message = `${message}*Now go forth..and multiply!*`;

  return message;
}

const GetTeamsEmbed = (teams) => {
  return {
    embed: {
      color: 3447003,
      author: {
        name: client.user.username,
        icon_url: client.user.avatarURL
      },
      title: "The teams are...",
      fields: TeamsToFields(teams),
      timestamp: new Date(),
      footer: {
        icon_url: client.user.avatarURL,
        text: "© GFX Mofa phuka"
      }
    }
  }
};

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

const GetVoicePlayers = (message) => {
  
  const PlayerList = [];
  try {
    const voiceChannel = GetVoiceChannel(message);
    voiceChannel.members.forEach(member => {
      PlayerList.push(member.user.toString());
    });

    return PlayerList;
  } catch(e) {
    throw new Error('No voice channel');
  }
};

const SendToChannel = (channel, data, originalCommand = null) => {
  console.log(channel);
  const responseMessage = channel.send(data);
  
  if (config.autocleanup > 0) {
    setTimeout(function () {
      console.log(responseMessage);
      console.log(originalCommand);
    }, config.autocleanup*1000);
  }
};

client.on("message", (message) => {
  try {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(!message.content.startsWith(config.prefix) || message.author.bot) return;

    if (command === 'teams') {
      const numberOfTeams = parseInt(args.shift(), 10);

      let playerList;

      if (args.length < 1) {
        try {
          playerList = GetVoicePlayers(message)
        } catch (e) {
          message.channel.send('You need to be in a voice channel, idiot...');
          message.channel.send('Or you can send a list of names (seperated by a space) i.e. !teams 2 Player1 Player2 Player3');

          return;
        }
      } else {
        playerList = args;
      }



      const Teams = TeamGen.GenerateTeams(
        numberOfTeams || 2,
        playerList
      );
      console.log('sending message');
      SendToChannel(message.channel, TeamsToString(Teams), message.id);
      // message.channel.send(TeamsToString(Teams));
    }

    if (command === 'test') {

      const numberOfTeams = parseInt(args.shift(), 10);
      const Teams = TeamGen.GenerateTeams(
        numberOfTeams || 2,
        GetVoicePlayers(message)
      );
      message.channel.send(TeamsToString(Teams));
    }
  } catch(e) {
    return;
  }
});

client.login(config.token);
