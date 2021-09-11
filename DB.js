import Sequelize from 'sequelize';
import { SQLUser, SQLPass } from './auth.js'
import { getJSON } from './APIhandler.js'
import { fetchAllPlayers, playerStatus, setScoreboard } from './asyncHandler.js';

let accLink;
let guilds;
let scoreboards;

export function DB_init() {
    const linkSequelize = new Sequelize('database', SQLUser, SQLPass, {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        // SQLite only
        storage: 'accLink.sqlite',
    });

    accLink = linkSequelize.define('accLink', {
        discordID: Sequelize.STRING,
        playerName: Sequelize.STRING
    });

    const guildSequelize = new Sequelize('database', SQLUser, SQLPass, {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        // SQLite only
        storage: 'guilds.sqlite',
    });

    guilds = guildSequelize.define('accLink', {
        guildID: Sequelize.STRING,
        roles: Sequelize.STRING
    });

    const scoreSequelize = new Sequelize('database', SQLUser, SQLPass, {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        // SQLite only
        storage: 'scoreboards.sqlite',
    });

    scoreboards = scoreSequelize.define('scoreboards', {
        guildID: Sequelize.STRING,
        channelID: Sequelize.STRING,
        messageID: Sequelize.STRING
    });
}


export async function addLink(msg, user, name) {
    let response = null;
    let combined = await fetchAllPlayers();
    let preCheck = await getPlayer(user.id);
    if (preCheck != "User does not have a player link") {
        msg.reply(`User is already linked to player "${preCheck}"`);
        return;
    }
    for (let i = 0; i < combined.length; i++) {
        if (combined[i].name == name) {
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

export async function getUser(name) {
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

export async function deleteLink(msg, user) {
    let player = await getPlayer(user.id);
    if (player == "User does not have a player link") {
        msg.reply(`${user.username} is not linked to a player.`);
        return;
    }
    try {
        accLink.destroy({ where: { discordID: user.id } });
    }
    catch (e) {
        msg.reply(`Error: ${e}`);
        return;
    }
    msg.reply(`Successfully unlinked ${user.username} from ${player}.`);
}


export async function whoIs(msg) {
    if (msg.content.length < 8) {
        msg.reply("Need a mention or name parameter");
        return;
    }
    try {
        let user = msg.mentions.members.first();
        let response = await getPlayer(user.id);
        if (response == "User does not have a player link") {
            msg.reply(response + ".");
            return;
        }
        msg.reply(`${user.toString()} is connected to ${response}`);
    }
    catch (e) {
        let name = msg.content.substring(7);
        let response = await getUser(name);
        if (response == "Player does not have a discord link") {
            msg.reply(response + ".");
            return;
        }
        response = await msg.guild.members.fetch(response);
        msg.reply(`${msg.content.substring(7)} is connected to ${response.toString()}.`);
    }
}

export async function getGuildRoles(guildID) {
    let DBread;
    await guilds.sync();
    DBread = await guilds.findAll();
    for (let i = 0; i < DBread.length; i++) {
        if (DBread[i].guildID == guildID) {
            return (DBread[i].roles);
        }
    }
    return ("Server has not set HvZ roles");
}

export async function deleteGuildDB(guildID) {
    let response = await getGuildRoles(guildID);
    if (response == "Server has not set HvZ roles") { return; }
    try {
        guilds.destroy({ where: { guildID: guildID } });
    }
    catch (e) {
        return;
    }
}

export async function setRoles(msg, words) {
    let role;
    let roleIDs = "";
    for (let i = 1; i < words.length; i++) {
        try {
            role = await msg.guild.roles.cache.find(r => r.name == words[i])
        }
        catch (e) {
            msg.reply(`Role "${words[i]}" not found.`);
            return;
        }
        roleIDs += words[i] + "&";
    }
    await guilds.sync();
    await deleteGuildDB(msg.guild.id);
    let line = await guilds.create({
        guildID: msg.guild.id,
        roles: roleIDs
    });
    msg.reply(`Successfully set server HvZ Human (${words[1]}) and HvZ Zombie (${words[2]}) roles.`);
}

export async function printGuildRoles(msg) {
    let response = await getGuildRoles(msg.guild.id);
    if (response == "Server has not set HvZ roles") {
        msg.reply(response + ".");
        return;
    }
    response = response.split("&");
    msg.reply(`Roles for server "${msg.guild.name}":\nHumans role: ${response[0]}\nZombies role: ${response[1]}`);
}

export async function updateRole(msg, user) {
    let responder = await msg.reply("On it.");
    let name = await getPlayer(user.id);
    if (name == "User does not have a player link") {
        responder.edit(name + ".");
        return;
    }
    let guildRoles = await getGuildRoles(msg.guild.id);
    if (guildRoles == "Server has not set HvZ roles") {
        responder.edit(name + ".");
        return;
    }
    guildRoles = guildRoles.split("&");
    let toGet = null;
    let players = await fetchAllPlayers();
    for (let i = 0; i < players.length; i++) {
        if (players[i].name == name) {
            toGet = players[i].team;
            break;
        }
    }
    let role = false;
    let toDelete = false;
    if (toGet == 'zombie') {
        role = await msg.guild.roles.cache.find(r => r.name == guildRoles[1]);
        toDelete = await msg.guild.roles.cache.find(r => r.name == guildRoles[0]);
    }
    else if (toGet == 'human') {
        role = await msg.guild.roles.cache.find(r => r.name == guildRoles[0]);
        toDelete = await msg.guild.roles.cache.find(r => r.name == guildRoles[1]);
    }
    if (user.roles.cache.find(r => r == toDelete)) {
        await user.roles.remove(toDelete);
    }
    if (role) {
        try {
            if (!user.roles.cache.find(r => r == role)) {
                await user.roles.add(role);
            }
        }
        catch (e) {
            responder.edit(`Error while assigning role '${role}': ${e}`)
            return;
        }
        responder.edit("Your roles have been updated!");
    }
    else {
        responder.edit(`Role '${guildRoles}' not found.`);
    }
}

export async function updateAllRoles(msg) {
    let responder = await msg.reply("On it.");
    let guildRoles = await getGuildRoles(msg.guild.id);
    if (guildRoles == "Server has not set HvZ roles") {
        responder.edit(name + ".");
        return;
    }
    guildRoles = guildRoles.split("&");
    let toGet = null;
    let players = await fetchAllPlayers();
    let user;
    let toUpdate = [];
    for (let i = 0; i < players.length; i++) {
        user = await getUser(players[i].name);
        if (user != "Player does not have a discord link") {
            user = await msg.guild.members.fetch(user);
            if (user != false) {
                toUpdate.push([user, players[i]]);
            }
        }
    }
    let role, toDelete;
    for (let i = 0; i < toUpdate.length; i++) {
        role = false;
        toDelete = false;
        if (toUpdate[i][1].team == 'zombie') {
            role = await msg.guild.roles.cache.find(r => r.name == guildRoles[1]);
            toDelete = await msg.guild.roles.cache.find(r => r.name == guildRoles[0]);
        }
        else if (toUpdate[i][1].team == 'human') {
            role = await msg.guild.roles.cache.find(r => r.name == guildRoles[0]);
            toDelete = await msg.guild.roles.cache.find(r => r.name == guildRoles[1]);
        }
        if (toUpdate[i][0].roles.cache.find(r => r == toDelete)) {
            await toUpdate[i][0].roles.remove(toDelete);
        }
        if (role) {
            try {
                if (!toUpdate[i][0].roles.cache.find(r => r == role)) {
                    await toUpdate[i][0].roles.add(role);
                }
            }
            catch (e) {
                responder.edit(`Error while assigning role '${role}': ${e}`)
                return;
            }
        }
        else {
            responder.edit(`Role '${guildRoles}' not found.`);
        }
    }
    responder.edit("Roles updated!");
}

export async function saveScoreboard(msg) {
    await scoreboards.sync();
    let tracker = await scoreboards.create({
        guildID: msg.guild.id,
        channelID: msg.channel.id,
        messageID: msg.id
    });
}

export async function syncScoreboards(client) {
    let msg, guild, channel;
    let boards = [];
    await scoreboards.sync();
    let DBread = await scoreboards.findAll();
    for (let i = 0; i < DBread.length; i++) {
        guild = await client.guilds.cache.get(DBread[i].get('guildID'));
        channel = await guild.channels.cache.get(DBread[i].get('channelID'));
        try {
            msg = await channel.messages.fetch(DBread[i].get('messageID'));
        } catch (e) {
            console.log("Invalid message id: " + DBread[i].get('messageID'));
        }
        boards.push(msg);
    }
    return(boards);
}