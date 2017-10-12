import Discord from 'discord.js';
import fs from 'fs';
import configFile from './config.json';
import TeamGen from './teamgenerator';
import { StartPresenceCycler, StopPresenceCycler, SetPresence, PresenceOff } from './presence';

const client = new Discord.Client();
let config = configFile;

let CommandCooldown = false;

client.on("ready", () => {
  console.log("I am ready!");

  if (config.randompresence) {
    StartPresenceCycler(config.presencecycletime, client);
  }
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

const CleanUpMessage = (message) => {
  message.delete(config.autocleanup*1000).catch((error) => {
    if (config.debuginchat) {
      message.channel.send(`I can't delete a message: ${error}`);
    }
  });
}

const SendToChannel = (originalMessage, data, autoDeleteable = false) => {
  const responseMessage = originalMessage.channel.send(data);
  responseMessage.then((message) => {
    if (config.autocleanup > 0 && autoDeleteable) {
      CleanUpMessage(message);
      CleanUpMessage(originalMessage);
    }
  });
};

const GetRoleID = (guild, roleName) => {
  const role = guild.roles.find("name", roleName);

  if (role) {
    return role.id;
  } else {
    return false;
  }
};

const UpdateConfig = (prop, value) => {
  let convertVal = value;

  if (value.toLowerCase() === 'false') {
    convertVal = false;
  } else if (value.toLowerCase() === 'true') {
    convertVal = true;
  } else if (!isNaN(value)) {
    convertVal = parseInt(value, 10);
  }

  config[prop] = convertVal;
  fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);
};

const SetCMDCooldown = () => {
  CommandCooldown = true;
  setTimeout(() => {
    CommandCooldown = false;
  }, config.commandcooldowntime * 1000);
}

client.on("message", (message) => {
  try {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const isAdmin = message.channel.permissionsFor(message.member).has("ADMINISTRATOR");
    const isUser = message.member.roles.has(GetRoleID(message.guild, config.rolename));

    if (
      !message.content.startsWith(config.prefix) ||
      message.author.bot ||
      CommandCooldown ||
      (config.restrictusage && (!isUser || !isAdmin))
    ) {
      return;
    }

    if (command === 'teams') {
      SetCMDCooldown();
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

    if (command === 'dumpconfig' && isAdmin) {
      SetCMDCooldown();
      console.log(config);
    }

    if (command === 'config' && isAdmin) {
      SetCMDCooldown();
      if (args.length == 2) {
        UpdateConfig(args[0], args[1]);
        SendToChannel(message, `Updated ${args[0]} to ${args[1]}.`, true);
      }
    }

    if (command === 'loot' || command === 'graveh') {
      SetCMDCooldown();
      SendToChannel(message, `*sprints and loots ${args.join(' ') || 'everything'} before ${message.author.toString()} can get there*`);
    }

    if(command === 'presence' && isAdmin) {
      SetCMDCooldown();

      if (args.length > 0) {
        switch (args[0]) {
          case 'start' : {
            StartPresenceCycler(config.presencecycletime, client);
            break;
          }
          case 'stop': {
            StopPresenceCycler();
            PresenceOff(client);
            break;
          }
          case 'pause': {
            StopPresenceCycler();
            break;
          }
          case 'next': {
            StopPresenceCycler();
            StartPresenceCycler(config.presencecycletime, client);
          }
          default: {
            StopPresenceCycler();
            SetPresence(args.join(' '), client);
          }
        }

        if (config.autocleanup > 0) {
          CleanUpMessage(message);
        }
      }
    }

    if (command === 'ping') {
      SetCMDCooldown();
      SendToChannel(message, 'pong!', true);
    }


  } catch(e) {
    console.log(e);
    return;
  }
});

client.login(process.env.TOKEN);
