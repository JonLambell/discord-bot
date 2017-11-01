import Discord from 'discord.js';
import fs from 'fs';
import { LoadConfig, UpdateConfig } from './config';
import { FormattedTeams, GenerateTeams } from './teamgenerator';
import { StartPresenceCycler, StopPresenceCycler, SetPresence, PresenceOff } from './presence';
import { DeleteMessage, GetChannelUsers, GetVoiceChannel, SendMessage, GetRoleID } from './utils';
import { getMembershipId } from './destiny';

const client = new Discord.Client();
const OwnerID = '146532794162479105';
getMembershipId('Largoh%232928', '4');

LoadConfig().then((config) => {

  let CommandCooldown = false;

  client.on("ready", () => {
    console.log("I am ready!");

    if (config.randompresence) {
      StartPresenceCycler(config.presencecycletime, client);
    }
  });

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
      const isOwner = (message.member.id == OwnerID);
      const isAdmin = message.channel.permissionsFor(message.member).has("ADMINISTRATOR");
      const isUser = message.member.roles.has(GetRoleID(message.guild, config.rolename));

      if (
        !message.content.startsWith(config.prefix) ||
        message.author.bot ||
        CommandCooldown ||
        (config.restrictusage && (!isUser || !isAdmin || !isOwner))
      ) {
        return;
      }

      if (command === 'teams') {
        SetCMDCooldown();
        const numberOfTeams = parseInt(args.shift(), 10);

        let playerList;

        if (args.length < 1) {
          try {
            playerList = GetChannelUsers(GetVoiceChannel(message));
          } catch (e) {
            SendMessage(message, 'You need to be in a voice channel, idiot...', config.autocleanup);
            SendMessage(message, 'Or you can send a list of names (seperated by a space) i.e. !teams 2 Player1 Player2 Player3', config.autocleanup);
            return;
          }
        } else {
          playerList = args;
        }



        const Teams = FormattedTeams(
          GenerateTeams(numberOfTeams || 2, playerList),
          'string'
        );

        SendMessage(message, Teams, config.autocleanup);
      }

      if (command === 'dumpconfig' && isOwner) {
        SetCMDCooldown();
        console.log(config);
      }

      if (command === 'config' && isAdmin) {
        SetCMDCooldown();
        if (args.length == 2) {
          UpdateConfig(args[0], args[1]);
          SendMessage(message, `Updated ${args[0]} to ${args[1]}.`, config.autocleanup);
        }
      }

      if (command === 'loot' || command === 'graveh') {
        SetCMDCooldown();
        SendMessage(message, `*sprints and loots ${args.join(' ') || 'everything'} before ${message.author.toString()} can get there*`);
      }

      if(command === 'presence' && isOwner) {
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
            DeleteMessage(message, config.autocleanup, config.debuginchat);
          }
        }
      }

      if (command === 'ping') {
        SetCMDCooldown();
        SendMessage(message, 'pong!', config.autocleanup, config.debuginchat);
      }

      if (command === 'test') {
        getMembershipId(args[0], args[1]);
      }

    } catch(e) {
      console.log(e);
      return;
    }
  });

  client.login(process.env.TOKEN);

});
