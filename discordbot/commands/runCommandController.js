const api = require("../utility/api");
const statsParser = require("../commands-helper/stats-parser");
const {MessageEmbed} = require("discord.js");

module.exports = {
    async runCommand(interaction) {

        const group = interaction.options._group;
        const shard = interaction.commandName.replace("stats-", "")
        const season = interaction.options.getString("season")
        const gameMode = interaction.options.getString("game-mode")
        const names = interaction.options.getString("names").split(/[ ,]+/)
        let ranked = false

        if (group === "unranked") {
            if (names.length > 10) { return "Exceeded number of names for unranked (Max 10)" }
        }
        else if (group === "ranked") {
            if (names.length > 1) { return "Exceeded number of names for ranked (Max 1)"}
            ranked = true
        }

        //build url
        const urlPreJoin = [`http://localhost:3000/api/seasonStats/shard/${shard}/seasons/${season}/gameMode/${gameMode}/ranked/${false}/players?array=`];
        names.forEach(name => {urlPreJoin.push(`${name},`)})
        var urlComma = urlPreJoin.join("");
        const url = urlComma.slice(0, -1);

        //query backend with GET using the url that was previously constructed
        let response = await api.fetchData(url, 7500, null,"GET");

        //check if we got an error from the backend request
        if (response.statusCode !== 200) {
            if (response.statusCode === 429) {
                //isRateLimited = true;
            }

            return response.message;
        }

        response = calculatedStats(response, ranked)
        return generateEmbed(response, ranked)
    }

}

const calculatedStats = (response, ranked) => {
    if (response.validAccounts.length > 0) {
        if (!ranked) {
            response.validAccounts.forEach(account => {
                account.calcedStats = statsParser.getCalculatedStats(account.rawStats);
            })
        }
        else {
            response.validAccounts.forEach(account => {
                account.calcedStats = statsParser.getCalculatedStatsRanked(account.rawStats);
            })
        }
    }

    return response
}

const generateEmbed = (response, ranked) => {

    var embed = new MessageEmbed();

    if (!ranked) {
        if (response.validAccounts.length > 0) {
            response.validAccounts.forEach(account => {
                var item = [];
                for (const [key, value] of Object.entries(account.calcedStats)) {
                    item.push(`${key}: ${value}\n`);
                }
                const value = item.join("");
                const field = { name: account.name, value: value, inline: true }
                embed.addFields(field);
            })
        }

        const fail_message = "Accounts failed fetch from API (DNE or missing upper/lower case):";
        var namesThatFailedLookUp = [];

        if (response.validAccounts.length > 0 && response.invalidAccounts.length === 0) {
            embed.setTitle("Stats");
        }
        else if (response.validAccounts.length > 0 && response.invalidAccounts.length > 0) {
            var footer = [fail_message];

            response.invalidAccounts.forEach(name_ => {
                namesThatFailedLookUp.push(`\n\u2022${name_.name}`);
            })

            footer.push.apply(footer, namesThatFailedLookUp);
            embed.setFooter({ text: footer.join("") });
            embed.setTitle("Stats");
        }
        else {
            response.invalidAccounts.forEach(name_ => {
                namesThatFailedLookUp.push(`\n\u2022${name_.name}`);
            })
            embed.setTitle(fail_message);
            embed.setDescription(namesThatFailedLookUp.join(""));
        }
    }
    else {

    }

    return embed;
}
