import { token } from './auth.js'
import { DB_init, whoIs, addLink, deleteLink, getPlayer } from './DB.js';
import { statusByDiscord, playerStatus } from './asyncHandler.js'
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

DB_init()

client.on('ready', () => {
   console.log(`Logged in as ${client.user.tag}!`);
   client.user.setActivity('the apocalypse', { type: 'WATCHING' });
   client.user.setStatus('idle');
});

client.on('messageCreate', msg => {
   if (msg.author.bot || !msg.guild) return;

   if (msg.content.startsWith("~status ")) {
      if (msg.content.indexOf('<') != -1) {
         statusByDiscord(msg, msg.mentions.members.first());
      }
      else {
         let name = msg.content.substring(msg.content.substring(8));
         playerStatus(msg, name);
      }
   }

   else if (msg.content.startsWith("~link ")) {
      let name = msg.content.substring(6);
      addLink(msg, msg.author, name);
   }

   else if (msg.content.startsWith("~unlink")) {
      if (msg.content.indexOf("<") != -1) {
         deleteLink(msg, msg.content.mentions[0]);
      }
      else { //Unlink self
         deleteLink(msg, msg.author);
      }
   }

   else if (msg.content.startsWith("~whoIs ")) {
      whoIs(msg);
   }

   if (msg.content.substring(0, 11) == "~impossible") {
      msg.channel.send("​​​​");
   }
});



client.login(token);