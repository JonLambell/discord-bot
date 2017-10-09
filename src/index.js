import Discord from 'discord.js';
import config from './config.json';
import TeamGen from './teamgenerator';

const client = new Discord.Client();

client.on("ready", () => {
  console.log("I am ready!");
});

client.on("message", (message) => {
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if(!message.content.startsWith(config.prefix) || message.author.bot) return;

  if (command === 'teams') {
    const numberOfTeams = parseInt(args.shift(), 10);

    console.log(args);
    /* let Teams;

    Teams = GenerateTeams(2);*/

    console.log(TeamGen.GenerateTeams(numberOfTeams));
    
    message.channel.send("pong!");
  }
});

client.login(config.token);
