let Players = [];

const SetPlayers = (players) => Players = players;

const GetRandomPlayer = (removeOnGet = true) => {
	const player = Players[Math.floor(Math.random()*Players.length)];
  
  if (removeOnGet) {
  	Players.splice(Players.indexOf(player), 1);
  }
  
  return player;
};

const PlayersLeft = () => !!Players.length;

let Teams = {};
const SetTeams = (numberOfTeams, maxPlayers = 4) => {
	for(let i = 0; i < numberOfTeams; i+=1) {
  	Teams[`Team${i+1}`] = {
    	players: [],
      maxPlayers
    };
  }
};

const IsTeamFull = (team) => (Teams[`Team${team}`].players.length >= Teams[`Team${team}`].maxPlayers);

const AddPlayerToTeam = (player, team) => {
	Teams[`Team${team}`].players.push(player);
}

const GenerateTeams = (
	numberOfTeams,
    users
) => {
	Teams = {};
	SetPlayers(users);
  SetTeams(numberOfTeams, Math.ceil(Players.length/numberOfTeams))

	const maxLoops = 1000;
  let currentLoops = 0;
  
  let currentTeam = 1;
  
  while (PlayersLeft() && currentLoops < maxLoops) {
  	currentLoops+=1;
    if (currentLoops >= maxLoops) {
    	throw new Error('Aborting due to potential infinate loop...');
    }

    AddPlayerToTeam(GetRandomPlayer(), currentTeam);
    
    if (IsTeamFull(currentTeam) || !PlayersLeft()) {
    	currentTeam += 1;
    }
  }

  return Teams;
}

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

  message = `${message}*Time for some Chicken Dinner!*`;

  return message;
}

const GetTeamsEmbed = (teams, client) => {
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

const FormattedTeams = (teams, style = 'embed', client = null) => {
  if (style === 'embed' || client == null) {
    return TeamsToString(teams);
  }

  return GetTeamsEmbed(teams, client);
}

export default {
    GenerateTeams,
    FormattedTeams
};
