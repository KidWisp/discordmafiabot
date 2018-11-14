const Discord = require('discord.js');
const client = new Discord.Client();
var info = require('./package.json');
var config = require('./botconfig.json');
var playerList = [];
var gameSize = 0;
var game = false;
var gameName = "";
var timer;
var votes = [,];
var votecount = "";
var gameHost = "";
var isDay = false;
var isNight = false;
var timer;
var day = 1;
var night = 0;
var timeLeft;
var majority = 0;
var isMaj = 0;
var isFlipless = 0;
var highestVote = "";


client.on('ready', async () => {
    console.log(`${client.user.username} is online!`);
});

client.on('message', async message  => {

  let prefix = "!";
	let messageArray = message.content.split(" ");

  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  //let messageArray = message.content;
  //let prefix = messageArray[0];
  //let cmd = messageArray.substr(1, messageArray.indexOf(' '));
  //let args = messageArray.substr(messageArray.indexOf(' ') + 1);
  //args = args.split(',');

  if (cmd === `${prefix}botinfo`)
  {
    let botembed = new Discord.RichEmbed()
    .setDescription("Bot Information")
    .setColor("#15f153")
    .addField("Bot Name: ", client.user.username)
    .addField("Bot Author: ", info.author)
    .setThumbnail(client.user.displayAvatarURL);

    return message.channel.send(botembed);
  }

  if (cmd === `${prefix}commands`)
  {
    let commands = new Discord.RichEmbed()
    .setDescription("Bot Commands")
    .setColor("#15f153")
    .addField("!create or !c", "E.G !create \"game name\", the host is able to add commands like flipless or maj or plurality, defaults to MAJ = on and flipless = off")
    .addField("!add or !a", "E.G !add \"name\" or add multiple names with a space inbetween")
    .addField("!players", "lists all the current players in the game")
    .addField("!remove or !r", "E.G !remove \"name\" or remove multiple names with a space inbetween")
    .addField("!end", "Ends the game")
    .addField("!startday or !daystart", "E.G !startday 7, starts day 1 with 7 minutes on the clock, the day phases automatically increment")
    .addField("!startnight or !nightstart", "This command exists to reset the day phase time, you may add a number to dictate the length of the night phase, E.G. !startnight 7")
    .addField("!vote or !v", "E.G !vote \"name\"")
    .addField("!unvote or !uv", "E.G !unvote \"name\"")
    .addField("!votecount or !vc", "E.G !votecount posts the current votecount")
    .addField("!alignment ", "allows host to add an alignment to a player");

    return message.channel.send(commands);
  }

  if (cmd === `${prefix}create` || cmd === `${prefix}c` && message.member.roles.has("422952591060893696"))
  {
    if (game){
      return message.reply("There is already a game in session...")
    }

    if (args.length > 1)
    {
      for (var i = 0; i < args.length; i++) {
        if (args[i] == 'maj' || args[i] == 'majority') {
          isMaj = 1;
        }

        if (args[i] == 'flipless') {
          isFlipless = 1;
        }

        if (args[i] == 'plurality') {
          isMaj = 0;
        }
      }
    }
    else {
      isMaj = 1;
      isFlipless = 0;
    }

    gameSize = 0;
    game = true;
    gameHost = `${message.member.displayName}`;

    for (var i = 0; i < args.length; i++)
    {
      gameName += args[i];
      gameName += " ";
    }


    let gameinfo = `**Mafia Game: ${gameName}has been created...\n*Please be patient while the host sets up the game... \n`+
      `*When using the add command, add players via their display name, not ID, aka dont @ them \n`+
        `*Currently players can not change their display name while in game..., therefore players should avoid changing  their server nickname during the game \n` +
        `*No Lynch is viable voting option (!vote nolynch)...**`;

    message.channel.send(gameinfo);
  }

  if (game)
  {
    let successful = "";
    let unsuccessful = "";
      if (cmd === `${prefix}add` || cmd === `${prefix}a`)
      {
        if (isHost()) {
          if (args.length == 0)
          {
            return message.reply("Requires a name after the command, or you can add multiple players at once using a space " +
            "E.G !add name1 name2 name3 etc...");
          }
          else {
            for (var i = 0; i < args.length; i++)
            {
              if (!isPlayer(args[i])) {
                gameSize++;
                if (gameSize == 2)
                {
                  majority = 2;
                }
                else if (gameSize % 2 == 0)
                {
                  majority = (gameSize / 2) + 1;
                }
                else {
                  majority = Math.round(gameSize / 2);
                }
                playerList.push({name: `${args[i]}`,
                                 curVote: " ",
                                 votedBy: [],
                                 numVotes: 0,
                                 isVoting: false,
                                 role: " ",
                                 alignment: " "});
                successful += `${args[i]} has been successfully added to the game\n`;
              }
              else {
                unsuccessful += `Adding ${args[i]} was unsuccessful because they already in the game\n`;
              }
            }

          }
        }
        else {
          message.channel.send(`The command: ${message.content}, can only be used by the host`);
        }
        message.channel.send(`${successful}\n${unsuccessful}`);
      }

      if (cmd === `${prefix}players`)
      {
          message.channel.send(players());
      }

      if (cmd === `${prefix}remove` || cmd === `${prefix}r`) {
        if (isHost() || message.member.displayName == client.user.username) {
          if (isPlayer(args[0])) {
            remove();
          }
        }
        else {
          message.channel.send(`The command: ${cmd}, can only be used by the host`);
        }
      }
      if (cmd === `${prefix}alignment`) {
        if (isHost())
        {
          for (var k = 0; k < args.length - 1; k++) {
            if (isPlayer(args[k]) && (args[args.length - 1] == 'mafia' || args[args.length - 1] == 'town' || args[args.length - 1] == 'tpr'))
            {

              let temp = findPlayer(args[k]);

              for (var i = 0; i < playerList.length; i++)
              {
                if (playerList[i].name == temp.name)
                {
                  playerList[i].alignment = args[args.length - 1];
                  message.channel.send(`${playerList[i].name}: was successfully given the alignment, ${playerList[i].alignment}`);
                }
              }
            }
          }
        }
      }
      if (cmd === `${prefix}startday` || cmd === `${prefix}daystart`) {
        let length = true;
        let ishost = true;
        let daycheck = true;

        if ((ishost = isHost()) && (length = playerList.length >= 3) && (daycheck = !isDay) && checkAlignments()) {
          if (!isNaN(args[0]))
          {
            if (!checkState()) {
              message.channel.send("The game is now over, mafia has overrun town");

              message.channel.send("Setup: ");
              for (let k = 0; k < playerList.length; k++) {
                message.channel.send(`${playerList[k].name}: ${playerList[k].alignment}`);
              }
              message.channel.send("Please properly end the game by typing !end");
            }
            else {
              for (var i = 0; i < playerList.length; i++)
              {
                playerList[i].isVoting = false;
                playerList[i].numVotes = 0;
                playerList[i].curVote = " ";
              }

                playerList.push({name: "nolynch",
                             curVote: " ",
                             votedBy: [],
                             numVotes: 0,
                             isVoting: false});
                isDay = true;
                isNight = false;
                let dayend = new Date().getTime() + (args[0]*60*1000);

                let timeLeft = setInterval(function () {
                let now = new Date().getTime();
                let distance = dayend - now;

                let days = Math.floor(distance / (1000 * 60 * 60 * 24));
                let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                let seconds = Math.floor((distance % (1000 * 60)) / 1000);
                let milliseconds = Math.floor((distance / 1000));

                let timer = fixtime(hours,minutes,seconds);


                  if (majority == highestVote.numVotes && isMaj)
                  {
                    isDay = false;
                    clearInterval(timeLeft);
                    message.channel.send(`Day ${day} is over, majority has been reached...`);
                    message.channel.send(`Final Vote Count: `);
                    getVoteCount();
                    if (!isFlipless) {
                      message.channel.send(`${highestVote.name} has been lynched, he was ${highestVote.alignment}`);
                    }
                    else {
                      message.channel.send(`${highestVote.name} has been lynched`);
                    }

                  }


                if (distance < 0 || !isDay ) {
                  clearInterval(timeLeft);
                  if (distance < 0)
                  {
                      isDay = false;
                      message.channel.send(`Day ${day} is over...`);
                      message.channel.send(`Final Vote Count: `);
                      getVoteCount();
                      if (!isFlipless) {
                        message.channel.send(`\`\`\`${highestVote.name} has been lynched, he was ${highestVote.alignment}\`\`\``);
                      }
                      else {
                        message.channel.send(`\`\`\`${highestVote.name} has been lynched\`\`\``);
                      }
                  }
                }


              }, 1000);
              let mes = "";
              mes += `\`\`\`Day ${day} has started...\n`;
              mes += `${players()}\n`;
              if (isMaj) {
                mes += `It takes ${majority} to lynch...\n`;
              }
              mes += `${args[0]} minutes remaining...\`\`\``;

              message.channel.send(mes);

            }
          }
          else {
              message.channel.send(`Invalid day length was entered!`);
          }

        }
        else {
          if (!ishost) {
            message.channel.send(`The command: ${cmd}, can only be used by the host...`);
          }
          if (!length) {
            message.channel.send(`There must be a minimum of 3 players in the game to start...`);
          }

          if (!daycheck) {
            message.channel.send(`The day phase is already ongoing...`);
          }

          if (!checkAlignments()) {
            message.channel.send(`Please make sure all players have alignments before starting the day phase`);
          }
        }

      }


      if (cmd === `${prefix}startnight` || cmd === `${prefix}nightstart`) {
        if (isHost()) {
          if (!isNaN(args[0])) {
            day++;
            night++;
            isNight = true;
            isDay = false;
            clear();

            let nighttime = args[0];

            message.channel.send(`It is now Night ${night}, you may not talk...`);
            message.channel.send(`You have ${nighttime} mins to send your night actions to the host...`);

            let nightend = new Date().getTime() + (args[0]*60*1000);

            let timeLeft = setInterval(function () {
              let now = new Date().getTime();
              let distance = nightend - now;

              let days = Math.floor(distance / (1000 * 60 * 60 * 24));
              let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
              let seconds = Math.floor((distance % (1000 * 60)) / 1000);
              let milliseconds = Math.floor((distance / 1000));

              let timer = fixtime(hours,minutes,seconds);

              if (distance < 0) {
                clearInterval(timeLeft);
                if (distance < 0)
                {
                    isnight = false;
                    message.channel.send(`Night ${night} is over, Day ${day} will start in a moment, please do not talk...`);
                }
              }
            }, 1000);
          }
          else {
            message.channel.send(`Invalid night length was entered!`);
          }
        }
        else {
          message.channel.send(`The command: ${cmd}, can only be used by the host`);
        }
      }

      if (cmd === `${prefix}vote` || cmd === `${prefix}v`) {
        //check for maj
        var current = findPlayer(message.member.displayName);
        var vote = args[0];
        if (isDay)
        {
          if (isPlayer(current.name) && isPlayer(vote) && current.curVote != vote) {
            if (current.isVoting){
              for (var i = 0; i < playerList.length; i++)
              {
                if (current.curVote == playerList[i].name)
                {
                  removeVote(playerList[i], current.name);
                }
              }

              current.curVote = vote;
              current.isVoting = true;

              for (var j = 0; j < playerList.length; j++)
              {
                if (current.curVote == playerList[j].name)
                {
                  playerList[j].votedBy.push(current);
                  playerList[j].numVotes += 1;
                }
              }
            }
            else {
              current.curVote = vote;
              current.isVoting = true;
              for (var k = 0; k < playerList.length; k++)
              {
                if (current.curVote == playerList[k].name)
                {
                  playerList[k].votedBy.push(current);
                  playerList[k].numVotes += 1;
                }
              }
            }
              console.log(`${current.name} voted ${args[0]}`);
          }
        }
        setHighestVote();
      }

      if (cmd === `${prefix}unvote` || cmd === `${prefix}uv`)
      {
        unvote(findPlayer(message.member.displayName));
        setHighestVote();
      }

      if (cmd === `${prefix}votecount` || cmd === `${prefix}vc`) {
        if (isDay)
        {
          getVoteCount();
        }
      }
  }

  if (cmd === `${prefix}end`)
  {
    if (game) {
      if (isHost())
      {
        game = false;
        gameSize = 0;
        playerList = [];
        gameName = "";
        gameOwner = "";
        isDay = false;
        isNight = false;
        day = 1;
        night = 0;
        isMaj = 0;
        isFlipless = 0;
        message.channel.send("The current game has been successfully ended!");
      }
      else {
        message.channel.send(`The command: ${cmd}, can only be used by the host`);
      }
    }
    else {
      message.channel.send("There is no game in session!");
    }

  }

  if (cmd === `${prefix}clearvotes`)
  {
    clear();
  }

  function findPlayer(player) {
    for (var i = 0; i < playerList.length; i++)
    {
      if (playerList[i].name == player)
      {
        return playerList[i];
      }
    }
  }

  function setHighestVote()
  {
    var temp = playerList.slice(0);
    temp = selectionSort(temp);
    highestVote = temp[0];
  }

  function players() {
    var string = "Current Players: \n";
    for (var i = 0; i < playerList.length; i++)
    {
      if (playerList[i].name != "nolynch")
      {
        string += (`${i + 1}. ${playerList[i].name}\n`);
      }
    }
    return string;
  }

  function getVoteCount() {
    var clone = playerList.slice(0);
    clone = selectionSort(clone);
    votecount = `\`\`\`Day ${day} \n`;

    for (var i = 0; i < clone.length; i++)
    {
      if (clone[i].numVotes > 0)
      {
        votecount += `${clone[i].name} (${clone[i].numVotes}): `;
        for (var j = 0; j < clone[i].numVotes;j++) {
          votecount += `${clone[i].votedBy[j].name}, `;
        }
        votecount += '\n';
      }
    }

    votecount += 'Not Voting: ';
    for (var k = 0; k < clone.length; k++)
    {
      if (!(clone[k].isVoting))
      {
        if (clone[k].name != "nolynch") {
          votecount += `${clone[k].name}, `;
        }
      }
    }

    votecount += '\n';
    if (isMaj) {
      votecount += `It takes ${majority} to lynch...\n`
    }
    votecount += `${timer}\`\`\``;
    message.channel.send(votecount);
  }

  function isPlayer(player) {
    var isPlayer = false;
    for (var i = 0; i < playerList.length; i++)
    {
      if (playerList[i].name == player) {
        isPlayer = true;
      }
    }
    return isPlayer;
  }

  function checkAlignment()
  {

  }

  function checkAlignments()
  {
    let check = 1;
    for (let i = 0; i < playerList.length; i++)
    {
      if (playerList[i].alignment == " ")
      {
        check = 0
      }
    }
    console.log(check);
    return check;
  }

  function isHost() {
    if (message.member.displayName == gameHost) {
      return true;
    }
    else {
      return false;
    }
  }

  function selectionSort(arr){
    var max, temp,
    len = arr.length;
    for(var i = 0; i < len; i++){
      max = i;
      for(var  j = i+1; j<len; j++){
        if(arr[j].numVotes > arr[max].numVotes){
            max = j;
       }
    }
    temp = arr[i];
    arr[i] = arr[max];
    arr[max] = temp;
    }
    return arr;
  }

  function checkState()
  {
    let mafia = 0;
    let town = 0;
    for (let i = 0; i < playerList.length; i++)
    {
      if (playerList[i].alignment == "mafia")
      {
        mafia++;
      }
      else if (playerList[i].alignment == "town"){
        town++;
      }
    }

    if  (mafia >= town)
    {
      return 0;
    }
    else {
      return 1;
    }
  }
  function clear () {
    for (var i = 0; i < playerList.length; i++)
    {
      playerList[i].numVotes = 0;
      playerList[i].curVote = " ";
      playerList[i].votedBy = [];
      playerList[i].isVoting = false;
    }
  }

  function unvote(player) {
    let unvote = "";
    var current = player;
    if (isDay)
    {
      if (isPlayer(current.name))
      {
        if (current.isVoting)
        {
          for (var i = 0; i < playerList.length; i++)
          {
            if (current.curVote == playerList[i].name)
            {
                removeVote(playerList[i], current.name);
                unvote = playerList[i].name;
            }
          }
          current.curVote = " ";
          current.isVoting = false;
          console.log(`${current.name} unvoted ${unvote}`)
        }
        else {
          message.channel.send(`${current.name}, You are not voting anyone`);
        }

      }
    }
  }
  function removeVote(player, vote) {
    for (var i = 0; i < player.numVotes; i++)
    {
      if (player.votedBy[i].name == vote)
      {
        player.votedBy.splice(i, 1);
        player.numVotes -= 1;
      }
    }
  }

  function remove() {
    let current;
    let removed = false;
    if (args.length == 0)
    {
        return message.reply("Error: no name(s) specified...")
    }
    if (isHost()) {

      for (var i = 0; i < args.length; i++)
      {
        removed = false;
        if (current = findPlayer(args[i]))
        {
          removed = true;
          if (current.isVoting && current.votedBy.length > 0) {
            for (var m = 0; m < current.votedBy.length; m++)
            {
              unvote(current.votedBy[m]);
            }
            unvote(current);
          }
          else {
            if (current.votedBy.length > 0) {
              for (var k = 0; k < current.votedBy.length; k++)
              {
                unvote(current.votedBy[k]);
              }
            }

            if (current.isVoting)  {
                unvote(current);
            }
          }

          message.channel.send(`${current.name} was removed from the game`);
          gameSize--;

          if (gameSize == 2)
          {
            majority = 2;
          }
          else if (gameSize % 2 == 0)
          {
            majority = (gameSize / 2) + 1;
          }
          else {
            majority = Math.round(gameSize / 2);
          }

          playerList.splice(playerList.indexOf(current), 1);
        }

        if (!removed)
        {
          message.reply(`${args[i]} is not in the game`);
        }
      }
    }
    else {
      message.channel.send(`The command: ${cmd}, can only be used by the host`);
    }
  }

  function fixtime(hours,minutes,seconds) {
    if (seconds % 10 == 0 && minutes < 10) {
      timer = (`Time Left || 0${hours}:0${minutes}:${seconds}`);
    }
    else if (seconds % 10 == 0 && minutes % 10) {
      timer = (`Time Left || 0${hours}:0${minutes}0:${seconds}`);
    }
    else if (seconds < 10 && minutes % 10) {
      timer = (`Time Left || 0${hours}:0${minutes}0:0${seconds}`);
    }
    else if (seconds < 10 && minutes < 10) {
      timer = (`Time Left || 0${hours}:0${minutes}:0${seconds}`);
    }
    if (seconds < 10) {
      timer = (`Time Left || 0${hours}:${minutes}:0${seconds}`);
    }
    else if (seconds % 10 == 0)
    {
      timer = (`Time Left || 0${hours}:0${minutes}:${seconds}`);
    }
    else if (minutes < 10) {
      timer = (`Time Left || 0${hours}:0${minutes}:${seconds}`);
    }
    else if (minutes % 10 == 0) {
      timer = (`Time Left || 0${hours}:0${minutes}0:${seconds}`);
    }
    else {
      timer = (`Time Left || 0${hours}:${minutes}:${seconds}`);
    }

    return timer;
  }
});


client.login(config.token);
