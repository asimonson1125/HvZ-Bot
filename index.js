import { getJSON } from './APIhandler.js'
import { token } from './auth.js'
import { Client, Intents } from 'discord.js';
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

/* ------------------------------------------------------------
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
RENEW YOUR DAMN CERTIFICATE!!!!!!!!!!!!!!!!
   ------------------------------------------------------------ */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
/* ------------------------------------------------------------
DO IT NOOOWWW!!!!!!!!!!!!!!!!!!!!
   ------------------------------------------------------------ */

client.on('ready', () => {
   console.log(`Logged in as ${client.user.tag}!`);
   client.user.setActivity('the apocalypse', { type: 'WATCHING' });
   client.user.setStatus('idle');
});

client.on('messageCreate', msg => {
   if (msg.author.bot || !msg.guild) return;

   if(msg.content.startsWith("~status ")){
      let str = msg.content.substring(msg.content.indexOf('"')+1, msg.content.length-1)
      playerStatus(msg, str);
   }
});

async function playerStatus(msg, user){
   let players = await getJSON("https://hvz.rit.edu/api/v2/status/players");
   for(let i = 0; i < players.players.length; i++){
      if(players.players[i].name == user){
         msg.reply(user + " is part of team " + players.players[i].team);
         break;
      }
   }
}

async function test() {
   let players = await getJSON("https://hvz.rit.edu/api/v2/status/players");
   players.players.forEach(function (x) {
      if (x.name == "Andrew Saridakis") {
         console.log(x.team);
      }
   })
}

client.login(token);