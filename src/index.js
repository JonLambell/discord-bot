import Discord from 'discord.js';
import fs from 'fs';
import configFile from './config.json';
import TeamGen from './teamgenerator';

const client = new Discord.Client();
let config = configFile;

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

const SendToChannel = (originalMessage, data, autoDeleteable = false) => {
  const responseMessage = originalMessage.channel.send(data);
  responseMessage.then((message) => {
    if (config.autocleanup > 0 && autoDeleteable) {
      message.delete(config.autocleanup*1000).catch((error) => {
        originalMessage.channel.send(`I can't delete a message: ${error}`);
      });
      originalMessage.delete(config.autocleanup*1000).catch((error) => {
        originalMessage.channel.send(`I can't delete a message: ${error}`);
      });
    }
  });
};

const UpdateConfig = (newConfig) => {
  config = newConfig;
  fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);
}

client.on("message", (message) => {
  try {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const isAdmin = message.channel.permissionsFor(message.member).hasPermission("ADMINISTRATOR");
    const isUser = message.member.roles.has(config.rolename);

    if(!message.content.startsWith(config.prefix) || message.author.bot || (!isUser && config.restrictusage)) return;

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

      SendToChannel(message, TeamsToString(Teams), true);
    }

    if (command === 'config' && isAdmin) {
      let newConfig = config;

      switch(args[0]) {
        case 'prefix': {
          newConfig.prefix = args[1];
          break;
        }
        case 'autocleanup': {
          newConfig.autocleanup = args[1];
          break;
        }
        case 'rolename': {
          newConfig.rolename = args[1];
          break;
        }
        case 'restrictusage': {
          newConfig.restrictusage = args[1];
          break;
        }

        default: {}
      }
      UpdateConfig(newConfig);
      SendToChannel(message, `Updated ${args[0]} to ${args[1]}.`, true);
    }

    if (command === 'loot' || command === 'graveh') {
      SendToChannel(message, `*sprints and loots ${args[0] || 'everything'} before ${message.author.toString} can get there*`);
    }


  } catch(e) {
    return;
  }
});

client.login(process.env.TOKEN);
