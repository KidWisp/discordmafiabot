if (isHost() && playerList.length >= 3) {
  for (var i = 0; i < playerList.length; i++)
  {
    playerList[i].isVoting = false;
    playerList[i].numVotes = 0;
    playerList[i].curVote = " ";
  }

  isDay = true;
  isNight = false;

  var dayend = new Date().getTime() + (args[1]*60*1000);
  day = args[0];

  var timeLeft = setInterval(function () {
    var now = new Date().getTime();
    var distance = dayend - now;

    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    var milliseconds = Math.floor((distance / 1000));

    timer = (`Time Left || ${hours}:${minutes}:${seconds}`);
    if (distance < 0 || !isDay) {
      clearInterval(timeLeft);
      if (distance < 0)
      {
          isDay = false;
          message.channel.send(`Day ${day} is over, you may continue to talk while the host prepares the EoD post...`);
      }
    }
  }, 1000);

  if (cmd === `${prefix}vote`) {
    //check for maj
    var current = findPlayer(message.member.displayName);
    var vote = args[0];
    if (isDay)
    {
      if (isPlayer(current.name)){
        if (current.isVoting){
          for (var i = 0; i < playerList.length; i++)
          {
            if (current.curVote == playerList[i].name)
            {
              playerList[i].numVotes -= 1;
            }
          }

          current.curVote = vote;
          current.isVoting = true;

          for (var j = 0; j < playerList.length; j++)
          {
            if (current.curVote == playerList[j].name)
            {
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
              playerList[k].numVotes += 1;
            }
          }
        }
      }
    }
  }

  if (cmd === `${prefix}testvote`) {
    //check for maj
    var current = findPlayer(args[0]);
    var vote = args[1];
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
          console.log(`${current.name} voted ${args[1]}`);
      }
    }
  }

  if (cmd === `${prefix}testunvote`)
  {
    unvote(findPlayer(args[0]));
  }
