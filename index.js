import { token } from './auth.js'
import { DB_init, whoIs, addLink, deleteLink, setRoles, printGuildRoles } from './DB.js';
import { statusByDiscord, playerStatus, createScoreboard } from './asyncHandler.js'
import { Client, Intents, MessageEmbed } from 'discord.js';
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
   try {
      if (msg.author.bot || !msg.guild) return;
      if (msg.member.permissionsIn(msg.channel).has("ADMINISTRATOR")) {
         if (msg.content.startsWith("~link ") && msg.content.indexOf("<") != -1) { //input MUST have name exactly one space after mention.  Could fix, too lazy.
            try {
               addLink(msg, msg.mentions.members.first().user, msg.content.substring(msg.content.indexOf(">") + 2));
            }
            catch (e) {
               msg.reply(`Error: ${e}`);
            }   
            return;
         }

         if (msg.content.startsWith("~unlink ") && msg.content.indexOf("<") != -1) {
            deleteLink(msg, msg.mentions.members.first().user);
            return;
         }

         if(msg.content.startsWith("~set ")){
            let words = msg.content.split("-");
            setRoles(msg, words);
            return;
         }

         if(msg.content.startsWith("~printRoles")){
            printGuildRoles(msg);
            return;
         }

         if(msg.content.startsWith("~score")){
            createScoreboard(msg);
         }
      }

      if (msg.content.startsWith("~status ")) {
         if (msg.content.indexOf('<') != -1) {
            statusByDiscord(msg, msg.mentions.members.first());
         }
         else {
            let name = msg.content.substring(8);
            playerStatus(msg, name);
         }
      }

      else if (msg.content.startsWith("~link ")) {
         let name = msg.content.substring(6);
         addLink(msg, msg.author, name);
      }

      else if (msg.content.startsWith("~unlink")) {  //Unlink self
         deleteLink(msg, msg.author);
      }

      else if (msg.content.startsWith("~whoIs ")) {
         whoIs(msg);
      }

      else if (msg.content.substring(0, 11) == "~impossible") {
         msg.channel.send("​​​​");
      }

      if (msg.content.startsWith("ping")) {
         msg.reply("Pong!");
      }
   }
   catch (e) {
      msg.reply(`UNCAUGHT ERROR: ${e}`);
   }
});



client.login(token);