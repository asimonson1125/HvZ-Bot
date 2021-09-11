import { getJSON } from './APIhandler.js'
import { getPlayer, saveScoreboard } from './DB.js';
import { MessageEmbed } from 'discord.js';
// import { playerStatus } from './asyncHandler.js'

export function binarySearch(array, pred) {
    let lo = -1, hi = array.length;
    while (1 + lo < hi) {
        const mi = lo + ((hi - lo) >> 1);
        if (pred(array[mi])) {
            hi = mi;
        } else {
            lo = mi;
        }
    }
    return hi;
}

export async function statusByDiscord(msg, user) {
    let name = await getPlayer(user);
    if (name == "User does not have a player link") {
        msg.reply(name + ".");
        return;
    }
    playerStatus(msg, name);
}

export async function fetchAllPlayers() {
    let players = await getJSON("https://hvz.rit.edu/api/v2/status/players");
    let mods = await getJSON("https://hvz.rit.edu/api/v2/status/moderators");
    return (players.players.concat(mods.players));
}

export async function playerStatus(msg, user) {
    let players = await fetchAllPlayers();
    for (let i = 0; i < players.length; i++) {
        if (players[i].name == user) {
            let embedColor = "";
            let embedDescription = 'Team: ' + players[i].team + '\nTags: ' + players[i].humansTagged + ' \nBadges: ' + players[i].badges;
            let embedFooter = 'ID# ' + players[i].id;
            if (players[i].team.startsWith("human")) {
                embedColor = '#E51400'
            } else {
                embedColor = '#60A917'
            }
            const playerStatusEmbed = new MessageEmbed()
                .setColor(embedColor)
                .setTitle(user)
                .setURL('https://hvz.rit.edu/players/' + players[i].id)
                .setAuthor('Player Status')
                .setDescription(embedDescription)
                .setImage('https://www.hvz.rit.edu/api/v2/avatar/' + players[i].id)
                .setFooter(embedFooter)
                .setTimestamp()
            msg.reply({ embeds: [playerStatusEmbed] });
            return;
        }
    }
    msg.reply(`Player ${user} not found!`);
}


function hexFromPercent(valNum) {
    var decimalValue = Math.round(valNum * 255 / 100);

    if (valNum < 7) {
        var hexValue = "0" + decimalValue.toString(16).toUpperCase();
    }
    else {
        var hexValue = decimalValue.toString(16).toUpperCase();
    }
    return (hexValue);
}



export async function setScoreboard(msg,time,score){
    let endDate = new Date(time.end);
    let embedFooter = `Ending on: ${endDate}`;
    let embedDescription = `Humans: ${score.humans}\nZombies: ${score.zombies}\n`;
    let humanPercentage = score.humans / (score.humans + score.zombies);
    let embedColor = `#${hexFromPercent(humanPercentage * 100)}${hexFromPercent((1 - humanPercentage) * 100)}00`
    for(let i = 0; i<Math.round(humanPercentage*10); i++){
        embedDescription += "🟥"
    }
    for(let i = 0; i<10-Math.round(humanPercentage*10); i++){
        embedDescription += "🟩"
    }
    let scoreEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setTitle("Game Status")
        .setURL('https://hvz.rit.edu/')
        .setAuthor(`Game Status`)
        .setDescription(embedDescription)
        .setFooter(embedFooter)
        .setTimestamp()
    msg.edit("​​​​");
    msg.edit({ embeds: [scoreEmbed]})
}
export async function createScoreboard(msg) {
    let responder = await msg.channel.send("Setting up...");
    await saveScoreboard(responder);
    let score = await getJSON("https://hvz.rit.edu/api/v2/status/score");
    let time = await getJSON("https://hvz.rit.edu/api/v2/status/dates");
    setScoreboard(responder,time,score);
}

export async function updateBoards(){
    let boards = await syncScoreboards(client);
    let score = await getJSON("https://hvz.rit.edu/api/v2/status/score");
    let time = await getJSON("https://hvz.rit.edu/api/v2/status/dates");
    boards.forEach(function(x){
       setScoreboard(x,time,score);
    })
 }