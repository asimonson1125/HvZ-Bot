import { token } from './auth.js'
import { DB_init, whoIs, addLink, deleteLink, setRoles, printGuildRoles, updateRole, updateAllRoles } from './DB.js';
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

         else if (msg.content.startsWith("~unlink ") && msg.content.indexOf("<") != -1) {
            deleteLink(msg, msg.mentions.members.first().user);
            return;
         }

         else if (msg.content.startsWith("~set ")) {
            let words = msg.content.split("-");
            setRoles(msg, words);
            return;
         }

         else if (msg.content.startsWith("~updateAll")) {
            updateAllRoles(msg);
            return;
         }

         else if (msg.content.startsWith("~printRoles")) {
            printGuildRoles(msg);
            return;
         }

         else if (msg.content.startsWith("~score")) {
            createScoreboard(msg);
         }

         else if (msg.content.startsWith("~adminHelp")) {
            const helpEmbed = new MessageEmbed()
               .setColor('#FFFFFF')
               .setTitle("Admin Help:")
               .addFields(
                  { name: "~link @tag [name]", value: "Links a user's discord account to a registered HvZ player." },
                  { name: "~unlink @tag", value: "Removes link between your a user's account and their registered HvZ player" },
                  { name: "~set -[HumansRoleName]-[ZombiesRoleName]", value: "Sets the HvZ roles for the server. ie. `~set -Human-Zombie`" },
                  { name: "~printRoles", value: "Replys with this server's set HvZ roles.  If role names are changed, you will need to ~set them again." },
                  { name: "~updateAll", value: "Updates discord roles for all users with linked HvZ players based on their HvZ player status (human or zombie)." },
                  { name: "~score", value: "Responds with a game status feed that is automatically updated every 15 minutes." }
               )
               .setFooter("RIT_HvZ bot by Andrew Simonson and [bok]")
            msg.reply({ embeds: [helpEmbed] });
         }
      }

      if (msg.content.startsWith("~status")) {
         if (msg.content.indexOf('<') != -1) {
            statusByDiscord(msg, msg.mentions.members.first());
         }
         else if (msg.content.length < 10) {
            statusByDiscord(msg, msg.author);
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

      else if (msg.content.substring(0, 7) == "~update") {
         updateRole(msg, msg.member);
      }

      else if (msg.content.substring(0, 11) == "~impossible") {
         msg.channel.send("​​​​");
      }

      else if (msg.content.startsWith("ping")) {
         msg.reply("Pong!");
      }

      else if (msg.content.startsWith("~help")) {
         const helpEmbed = new MessageEmbed()
            .setColor('#000000')
            .setTitle("Help:")
            .addFields(
               { name: "~link [name]", value: "Links your discord account to a registered HvZ player." },
               { name: "~unlink", value: "Removes link between your discord account and your registered HvZ player" },
               { name: "~status", value: "Displays your linked player status.  Optional param: (@user or registered name)" },
               { name: "~whoIs", value: "Takes @tag or player name as parameter, returns player-discord link." },
               { name: "~update", value: "Updates your discord roles based on your HvZ player status (human or zombie)." }
            )
            .setFooter("RIT_HvZ bot by Andrew Simonson and [bok]")
         msg.reply({ embeds: [helpEmbed] });
      }
   }
   catch (e) {
      msg.reply(`UNCAUGHT ERROR: ${e}`);
   }
});



client.login(token);