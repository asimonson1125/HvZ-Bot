import { getJSON } from './APIhandler.js'
import { getPlayer } from './DB.js';
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
          msg.reply(user + " is part of team " + players.players[i].team);
          break;
       }
    }
 }