import { getJSON } from './APIhandler.js'
import { token } from './auth.js'
import { Client, Intents } from 'discord.js';
import { DB_init, whoIs, addLink, deleteLink } from './DB.js';
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

/* ------------------------------------------------------------
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
RENEW YOUR DAMN CERTIFICATE!!!!!!!!!!!!!!!!
   ------------------------------------------------------------ */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
/* ------------------------------------------------------------
DO IT NOOOWWW!!!!!!!!!!!!!!!!!!!!
   ------------------------------------------------------------ */

DB_init()

client.on('ready', () => {
   console.log(`Logged in as ${client.user.tag}!`);
   client.user.setActivity('the apocalypse', { type: 'WATCHING' });
   client.user.setStatus('idle');
});

client.on('messageCreate', msg => {
   if (msg.author.bot || !msg.guild) return;

   if (msg.content.startsWith("~status ")) {
      let name = msg.content.substring(msg.content.indexOf('"') + 1, msg.content.length - 1);
      playerStatus(msg, name);
   }

   else if (msg.content.startsWith("~link ")) {
      let name = msg.content.substring(6, msg.content.length);
      addLink(msg, msg.author, name);
   }

else if (msg.content.startsWith("~unlink")){
   if(msg.content.indexOf("<") != -1){
      deleteLink(msg, msg.content.mentions[0]);
   }
   else{ //Unlink self
      deleteLink(msg, msg.author);
   }
}

   else if (msg.content.startsWith("~whoIs ")) {
      whoIs(msg);
   }
});

async function playerStatus(msg, user) {
   let players = await getJSON("https://hvz.rit.edu/api/v2/status/players");
   for (let i = 0; i < players.players.length; i++) {
      if (players.players[i].name == user) {
         msg.reply(user + " is part of team " + players.players[i].team);
         break;
      }
   }
}


client.login(token);