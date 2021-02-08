const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
client.commands = new Discord.Collection();

const prefix = '$';
const token = 'Nzc2ODYxMjc1OTM4NDg4MzQw.X67CcQ.z25BiTd_03iqDFj-H0iOEzy-p7Q';
const daanbot_channel = '777976029992976414';

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

const tom_id = '111410966037573632'
const wouter_id = '237207052550799360'
const ludo_id = '239136238718681089'
const daan_id = '198724528606674944'


const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('Bot is online');
});


client.on('message', async message =>{
    return
    // Als het niet met de prefix start of als de bot het zelf heeft gestuurd
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
                    const channel = client.channels.cache.get(daanbot_channel);
                    channel.send('.join').then( msg => {
                        msg.delete({ timeout: 500});
                    });
                }
                let audiofile = ""

                switch(newVoiceState.member.id) {
                    case tom_id:
                        audiofile = './weg_sfeer.mp3'
                        break;
                    case wouter_id:
                        audiofile = './Wouter-Bezeikt.mp3'
                        break;
                    case ludo_id:
                        audiofile = './Vermijl-marnick.mp3'
                        break;
                    default:
                        audiofile = './hallo.mp3'
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
                    const channel = client.channels.cache.get(daanbot_channel);
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

//summoner("uwmoeke")

//Altijd op het laatste
client.login(token);
