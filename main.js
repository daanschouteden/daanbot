const Discord = require('discord.js');
require("dotenv").config();
import 'dotenv/config'
import express from 'express'

const client = new Discord.Client();
client.commands = new Discord.Collection();

const prefix = '$';
const token = process.env.DISCORD_TOKEN;

const fetch = require("node-fetch");
const API_KEY = '?api_key=RGAPI-2ff3a84e-6780-4035-87bb-f85abe1e0333'
const RIOT_URI = 'https://euw1.api.riotgames.com'
const SUMMONER_API = '/lol/summoner/v4/summoners/by-name/'

const AFK_channel = 'AFK'

var Bottons_active = false

const bots = new Map ([
    ["Baron", '240482527695994880'],
    ["Botify", '483377420494176258'],
    ["Bottons", '530188321884995594'],
    ["DaanBot", '776861275938488340'],
    ["Groovy", '234395307759108106'],
    ["MEE6", '159985870458322944'],
    ["Redditor", '557580985646972928']
])

const members = new Map ([
    ["tom", '111410966037573632'],
    ["wouter", '237207052550799360'],
    ["ludo", '239136238718681089'],
    ["daan", '198724528606674944'],
    ["lotte1", '703664222814339122'],
    ["lotte2", '771858071869194281'],
    ["sven", '183235915106353152'],
    ["martijn", '526474165537210378']
])

const channels = new Map ([
    ["leutig", '774630085814255626'],
    ["daanbot", '777976029992976414']
])

/*
const fs = require('fs');
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}
*/

client.once('ready', () => {
    console.log('Bot is online');
});


client.on('message', async message =>{
    
    if (message.channel.id === channels.get('leutig')) {
        message.react('😂');
    }

    if (message.content === "W" && message.channel.id !== channels.get('leutig')) {
        authorVoicechannel = message.member.voice;
        if (authorVoicechannel.channelID) {
            authorVoicechannel.channel.join().then(connection => {

                let audiofile = "./sounds/Tyler - Winnable.mp3";

                const player = connection.play(audiofile);
                player.on('finish', end => {
                    authorVoicechannel.channel.leave();
                });
            })
        }
        message.delete({timeout: 1500})
    }

    if (message.content.startsWith('$delete') && message.member.id === members.get('daan')) {
        number = parseInt(message.content.split(' ')[1]);
        if (number) {
            deleteAmount = Math.min(number, 100);

            message.channel.messages.fetch({ limit: deleteAmount }).then(messages => {
                message.channel.bulkDelete(messages).then(deleted => {
                    message.reply(`${deleted.size} messages deleted!`).then(msg => msg.delete({ timeout: 2000 })).catch(function(e){console.log(e)});
                })
              }).catch(function(e) {
                  console.log(e);
              })
        }
    }
    /* Als het niet met de prefix start of als de bot het zelf heeft gestuurd
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    

    if(command == 'ping') {
        message.channel.send('pong!');
    }
    else {
        resp = await summoner(command)
        message.channel.send(resp);
    }
    */
})

client.on('voiceStateUpdate', async (oldVoiceState, newVoiceState) => {  
    const newChannel = newVoiceState.channel
    const oldChannel = oldVoiceState.channel
     // The member connected
    if (newChannel) {
        // From disconnected to connected or from afk to another
        if (oldChannel === null || (oldChannel && oldChannel.name === AFK_channel)) {
            // A bot joined
            if (newVoiceState.member.roles.cache.find(r => r.name === "Bot")){ // Array.from(bots.values()).includes(newVoiceState.id)
                if (newVoiceState.member.user.id === bots.get('Bottons')) {
                    Bottons_active = true
                }
                return
            }
            // Entered the AFK channel
            if (newChannel.name === AFK_channel) {
                return
            }
            console.log(`${newVoiceState.member.user.tag} connected to ${newChannel.name}.`);

            newChannel.join().then(connection => {
                // Activate Bottons
                if (!Bottons_active) {
                    const channel = client.channels.cache.get(channels.get('daanbot'));
                    channel.send('.join').then( msg => {
                        msg.delete({ timeout: 500});
                    });
                }
                let audiofile = ""

                switch(newVoiceState.member.id) {
                    case members.get('daan'):
                        audiofile = './sounds/Hans_Teeuwen-Ik_heb_talent.mp3'
                        break;
                    case members.get('tom'):
                        audiofile = './sounds/weg_sfeer.mp3'
                        break;
                    case members.get('wouter'):
                        audiofile = './sounds/Wouter-Bezeikt.mp3'
                        break;
                    case members.get('ludo'):
                        audiofile = './sounds/Vermijl-marnick.mp3'
                        break;
                    case members.get('lotte1'):
                    case members.get('lotte2'):
                        audiofile = './sounds/Wouter-Jipla.mp3'
                        break;
                    case members.get('sven'):
                        audiofile = './sounds/Sven-Lekker_pik.mp3'
                        break;
                    case members.get('martijn'):
                        audiofile = './sounds/Liefdeskapitein.mp3'
                        break;
                    default:
                        audiofile = './sounds/hallo.mp3'
                }

                const player = connection.play(audiofile);
                player.on('finish', end => {
                    newChannel.leave();
                });
            })
        }
    }
    // The member disconnected
    else if (oldChannel && newChannel === null) {
        if (oldVoiceState.member.user.id === bots.get('Bottons')) {
            if (oldVoiceState.channel.members.size >= 1) {
                console.log("Bottons has to stay")
                oldChannel.join().then(connection => {
                    // Activate Bottons
                    const channel = client.channels.cache.get(channels.get('daanbot'));
                    channel.send('.join').then( msg => {
                        msg.delete({ timeout: 500});
                    }).then( () => {
                        oldChannel.leave()
                    })
                })
            }
            else {
                Bottons_active = false
            }
        }
        else if (oldVoiceState.member.user.id === members.get('wouter') ||
                oldVoiceState.member.user.id === members.get('lotte1') ||
                oldVoiceState.member.user.id === members.get('lotte2')) {
            oldChannel.join().then(connection => {
                let audiofile = "./sounds/Hans Teeuwen - Doei.mp3"

                const player = connection.play(audiofile);
                player.on('finish', end => {
                    oldChannel.leave();
                });
            })
        }

        console.log(`${oldVoiceState.member.user.tag} disconnected from ${oldChannel.name}.`);

    }
})

async function summoner(summonerName) {
    uri = RIOT_URI + SUMMONER_API + summonerName + API_KEY
    const response = await fetch(uri)
    const data = await response.json();
    console.log(data)
    console.log("Level = " + data['summonerLevel'])
    message = "Summoner Level = " + data['summonerLevel']
    return message
}

// summoner("uwmoeke")

// Altijd op het laatste
client.login(token);
