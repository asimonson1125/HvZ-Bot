import { getJSON } from './APIhandler.js'
import { getPlayer } from './DB.js';
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

export async function statusByDiscord(msg, user){
    let name = await getPlayer(user);
    playerStatus(msg, name);
}

export async function playerStatus(msg, user) {
    let players = await getJSON("https://hvz.rit.edu/api/v2/status/players");
    for (let i = 0; i < players.players.length; i++) {
        if (players.players[i].name == user) {
            let embedColor = "";
            let embedDescription = 'Team: '+players.players[i].team+'\nTags: '+players.players[i].humansTagged+' \nBadges: '+players.players[i].badges;
            let embedFooter = 'ID# '+players.players[i].id;
            if(players.players[i].team.startsWith("human")) {
                embedColor = '#E51400'
            } else {
                embedColor = '#60A917'
            }
            const playerStatusEmbed = new MessageEmbed()
            .setColor(embedColor)
            .setTitle(user)
            .setURL('https://hvz.rit.edu/players/', players.players[i].id)
            .setAuthor('Player Status')
            .setDescription(embedDescription)
            .setFooter(embedFooter)
            .setTimestamp()
            msg.channel.send({ embeds: [playerStatusEmbed] });
            break;
       }
    }
 }
