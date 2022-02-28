const api = require("../utility/api");
const statsParser = require("../commands-helper/stats-parser");
const {MessageEmbed, MessageAttachment} = require("discord.js");
const rankedIconGetter = require("../commands-helper/ranked-icon-getter");
const enums = require("../utility/global-enums");
const seasonConverter = require("../utility/pubg/season-names-simplified");
const constants = require("../utility/global-enums");
const numberToWord = require("../utility/number-to-word");

module.exports = {
    async runCommand(interaction) {

        if (interaction.options._subcommand.includes("graph")) {
            const graphCommandController = require('../commands/graphCommandController')
            return await graphCommandController.runCommand(interaction)
        }
        else {
            const group = interaction.options._group;
            const shard = interaction.commandName.replace("stats-", "")
            const season = interaction.options.getString("season")
            const gameMode = interaction.options.getString("game-mode")
            const names = interaction.options.getString("names").split(/[ ,]+/)


            let ranked = false

            const bundle = {
                group: group,
                shard: shard,
                season: season,
                gameMode: gameMode,
                ranked: ranked
            }

            if (group === "unranked") {
                if (names.length > 10) {
                    return "Exceeded number of names for unranked (Max 10)"
                }
            } else if (group === "ranked") {
                if (names.length > 1) {
                    return "Exceeded number of names for ranked (Max 1)"
                }
                ranked = true
            }

            //build url
            const urlPreJoin = [`http://localhost:3000/api/seasonStats/shard/${shard}/seasons/${season}/gameMode/${gameMode}/ranked/${ranked}/players?array=`];
            names.forEach(name => {
                urlPreJoin.push(`${name},`)
            })
            var urlComma = urlPreJoin.join("");
            const url = urlComma.slice(0, -1);

            //build simple interaction object;
            const payload = {
                applicationId: String(interaction.applicationId),
                guildId: String(interaction.guildId),
                channelId: String(interaction.channelId),
                userId: String(interaction.user.id),
                commandId: String(interaction.commandId),
                commandName: String(interaction.commandName),
                subCommandName: String(interaction.options._subcommand),
                options: interaction.options._hoistedOptions,
                date: interaction.createdAt,
            }

            //query backend using the url that was previously constructed
            let response = await api.fetchData(url, 20000, payload, "POST");

            //check if we got an error from the backend request
            if (response.statusCode !== 200) {
                return response.message;
            }

            response = calculatedStats(response, ranked)
            return generateEmbed(response, ranked, bundle)
        }
    }
}

const calculatedStats = (response, ranked) => {
    if (response.validAccounts.length > 0) {
        if (!ranked) {
            response.validAccounts.forEach(account => {
                account.calcedStats = statsParser.getCalculatedStats(account.rawStats);
            })
        } else {
            response.validAccounts.forEach(account => {
                account.calcedStats = (account.rawStats !== null ?
                    statsParser.getCalculatedStatsRanked(account.rawStats) :
                    statsParser.getDummyDataRanked());
            })
        }
    }

    return response
}

const generateEmbed = async (response, ranked, bundle) => {

    var embed = new MessageEmbed();

    const seasonConverter = require('../utility/pubg/season-names-simplified')
    const constants = require('../utility/global-enums')
    const shardPretty = constants[bundle.shard]
    const seasonName = seasonConverter.getSimplifiedSeasonName(bundle.shard, bundle.season, bundle.ranked)
    const gameModePretty = constants[(bundle.gameMode).replace("-", "")]

    const description = response.validAccounts.length === 1 && response.invalidAccounts.length === 0 ?
        `${shardPretty}\n${gameModePretty}` :
        `${shardPretty}\n${gameModePretty}\n${seasonName.name}`
    embed.setDescription(description)

    const numberToWord = require('../utility/number-to-word')

    if (!ranked) {
        if (response.validAccounts.length > 0) {
            response.validAccounts.forEach(account => {
                var item = [];
                for (const [key, value] of Object.entries(account.calcedStats)) {
                    const enums = require('../utility/global-enums')
                    const label = enums[key]
                    item.push(`${label}: ${value}\n`);
                }
                const value = item.join("");
                const fieldHeader = response.validAccounts.length === 1 && response.invalidAccounts.length === 0 ? seasonName.name : account.displayName
                const field = {name: fieldHeader, value: value, inline: true}
                embed.addFields(field);
            })
        }

        const fail_message = "Accounts failed fetch from API (DNE or missing upper/lower case):";
        var namesThatFailedLookUp = [];

        if (response.validAccounts.length > 0 && response.invalidAccounts.length === 0) {
            if (response.validAccounts.length === 1) {
                embed.setTitle(`Unranked Stats for ${response.validAccounts[0].displayName}`);
                embed.setColor(stringToColour(response.validAccounts[0].displayName))
            } else {
                embed.setTitle("Unranked Stats")
                embed.setColor(stringToColour(numberToWord.toWordsconvert((seasonName.name).slice(-2))))
            }
        } else if (response.validAccounts.length > 0 && response.invalidAccounts.length > 0) {
            var footer = [fail_message];

            response.invalidAccounts.forEach(name_ => {
                namesThatFailedLookUp.push(`\n\u2022${name_.name}`);
            })

            footer.push.apply(footer, namesThatFailedLookUp);
            embed.setFooter({text: footer.join("")});
            embed.setTitle("Unranked Stats");
            embed.setColor(stringToColour(numberToWord.toWordsconvert((seasonName.name).slice(-2))))
        } else {
            response.invalidAccounts.forEach(name_ => {
                namesThatFailedLookUp.push(`\n\u2022${name_.name}`);
            })
            embed.setTitle(fail_message);
            embed.setDescription(namesThatFailedLookUp.join(""));
            embed.setColor('#960018')
        }

        return {embeds: [embed]}
    } else {
        var attachment;
        if (response.validAccounts.length > 0) {
            await Promise.all(response.validAccounts.map(async account => {

                var item = [];
                for (const [key, value] of Object.entries(account.calcedStats)) {
                    const enums = require('../utility/global-enums')
                    const label = enums[key]
                    item.push(`${label}: ${value}\n`);
                }

                const value = item.join("");
                const field = {name: seasonName.name, value: value, inline: true}

                const filePath = await rankedIconGetter.get(account.calcedStats.currentRankPoint)
                attachment = new MessageAttachment(filePath);
                const pathSplit = String(filePath).split("/")
                const img = pathSplit[pathSplit.length - 1]

                embed.setTitle(`Ranked stats for ${account.displayName}`)
                embed.setDescription(`${shardPretty}\n${gameModePretty}`);
                embed.setThumbnail(`attachment://${img}`);
                embed.setColor(stringToColour(account.displayName))
                embed.addFields(field);
            }))
        } else {
            const fail_message = "Account failed fetch from API (DNE or missing upper/lower case):";
            namesThatFailedLookUp = [];
            response.invalidAccounts.forEach(name_ => {
                namesThatFailedLookUp.push(`\n\u2022${name_.name}`);
            })
            embed.setTitle(fail_message);
            embed.setDescription(namesThatFailedLookUp.join(""));

            return {embeds: [embed]}
        }
        return {embeds: [embed], files: [attachment]}
    }
}

const stringToColour = (str) => {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var color = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}
