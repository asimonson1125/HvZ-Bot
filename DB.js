import Sequelize from 'sequelize';
import { SQLUser, SQLPass } from './auth.js'
import { getJSON } from './APIhandler.js'

let accLink;

export function DB_init() {
    const sequelize = new Sequelize('database', SQLUser, SQLPass, {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        // SQLite only
        storage: 'accLink.sqlite',
    });

    accLink = sequelize.define('accLink', {
        discordID: Sequelize.STRING,
        playerName: Sequelize.STRING
    });
}


export async function addLink(msg, user, name) {
    let response = null;
    let players = await getJSON("https://hvz.rit.edu/api/v2/status/players");
    let preCheck = await getPlayer(user.id);
    if(preCheck != "User does not have a player link"){
        msg.reply(`User is already linked to player "${preCheck}"`);
        return;
    }
    for (let i = 0; i < players.players.length; i++) {
        if (players.players[i].name == name) {
            response = await msg.reply("player found in database, adding link");
            break;
        }
    }
    if (response == null) {
        msg.reply("Could not find a player with that name in HvZ database!");
        return;
    }
    await accLink.sync();
    try {
        let link = await accLink.create({
            discordID: user.id,
            playerName: name
        });
    }
    catch (e) {
        response.edit(`Error while adding to local database: ${e}`)
        return;
    }
    response.edit(`Player "${name}" successfully linked to user ${user.username}!`)

}

export async function getPlayer(userID) {
    let DBread;
    await accLink.sync();
    DBread = await accLink.findAll();
    for (let i = 0; i < DBread.length; i++) {
        if (DBread[i].discordID == userID) {
            return (DBread[i].playerName);
        }
    }
    return ("User does not have a player link");
}

export async function getUser(name){
    let DBread;
    await accLink.sync();
    DBread = await accLink.findAll();
    for (let i = 0; i < DBread.length; i++) {
        if (DBread[i].playerName == name) {
            return (DBread[i].discordID);
        }
    }
    return ("Player does not have a discord link");
}

export async function deleteLink(msg, user){
    let player = await getPlayer(user.id);
    if(player == "User does not have a player link"){
        msg.reply(`${user.username} is not linked to a player.`);
        return;
    }
    try{
    accLink.destroy({where: {discordID: user.id}});
    }
    catch(e){
        msg.reply(`Error: ${e}`);
        return;
    }
    msg.reply(`Successfully unlinked ${user.username} from ${player}.`);
}


export async function whoIs(msg){
    if(msg.content.length < 8){
        msg.reply("Need a mention or name parameter");
        return;
    }
    try{
        let user = msg.mentions.members.first();
        let response = await getPlayer(user.id);
        msg.reply(`${user.toString()} is connected to ${response}`);
     }
     catch(e){
        let name = msg.content.substring(7);
        let response = await getUser(name);
        if(response == "Player does not have a discord link"){
            msg.reply(response + ".");
            return;
        }
        response = await msg.guild.members.fetch(response);
        msg.reply(`${msg.content.substring(7)} is connected to ${response.toString()}.`);
     }
}
