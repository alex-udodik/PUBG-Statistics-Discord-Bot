const {MessageAttachment, MessageEmbed} = require("discord.js");
module.exports = {
    createEmbedFactory: function (shard, seasons) {

        if (shard === "steam") {return createEmbedSteam(shard, seasons)}
        else if (shard === "psn") {return createEmbedPsn(shard, seasons)}
        else if (shard === "xbox") {return createEmbedXbox(shard, seasons)}
        else if (shard === "stadia") {return createEmbedStadia(shard, seasons)}
        else if (shard === "kakao") {return createEmbedKakao(shard, seasons)}
        else {}
    }
}

function createEmbedSteam(shard, seasons) {

    var count = 0;
    var fields = [{ name: "PC 2018 Seasons" }, { name: "PC Survivor Seasons" }, { name: "PC Ranked Seasons" }];

    var valuesSeason2018 = [];
    var valuesSurvivor = [];
    var valuesRanked = [];

    seasons.forEach(season => {
        if (season.id.includes("division.bro.official.2018-")) {
            valuesSeason2018.push(season.id + "\n");
        }
        else if (season.id.includes("division.bro.official.pc-2018-") && count >= 25) {
            valuesRanked.push(season.id + "\n");
        }
        else if (season.id.includes("division.bro.official.pc-2018-")) {
            valuesSurvivor.push(season.id + "\n");
        }
        else { }
        count++;
    });

    fields[0].value = valuesSeason2018.join("");
    fields[1].value = valuesSurvivor.join("");
    fields[2].value = valuesRanked.join("");

    var attachment = new MessageAttachment("assets/shards/steam.png");
    var embed = new MessageEmbed();
    embed.setTitle(`Season ids for PUBG ${shard}`)
    embed.setDescription("Copy & Paste the season id when looking up stats for players for a particular season")
    embed.setThumbnail(`attachment://steam.png`);
    embed.setFields(fields)
    embed.setColor("#0F2556")
    return {embeds: [embed], files: [attachment]};
}

function createEmbedXbox(shard, seasons) {
    var fields = [{name: "Xbox Seasons"}]
    var values = [];
    seasons.forEach(season => {
        if (season.id.includes("xbox") || season.id.includes("console")) {
            values.push(season.id + "\n")
        }
    })

    fields[0].value = values.join("")
    var attachment = new MessageAttachment("assets/shards/xbox.png");
    var embed = new MessageEmbed();
    embed.setTitle(`Season ids for PUBG ${shard}`)
    embed.setDescription("Copy & Paste the season id when looking up stats for players for a particular season")
    embed.setThumbnail(`attachment://xbox.png`);
    embed.setFields(fields)
    embed.setColor("#107C10")
    return {embeds: [embed], files: [attachment]};
}

function createEmbedPsn(shard, seasons) {
    var fields = [{name: "Playstation Seasons"}]
    var values = [];
    seasons.forEach(season => {
        if (season.id.includes("playstation") || season.id.includes("console")) {
            values.push(season.id + "\n")
        }
    })

    fields[0].value = values.join("")
    var attachment = new MessageAttachment("assets/shards/playstation.png");
    var embed = new MessageEmbed();
    embed.setTitle(`Season ids for PUBG ${shard}`)
    embed.setDescription("Copy & Paste the season id when looking up stats for players for a particular season")
    embed.setThumbnail(`attachment://playstation.png`);
    embed.setFields(fields)
    embed.setColor("#2376B9")
    return {embeds: [embed], files: [attachment]};
}

function createEmbedStadia(shard, seasons) {
    var fields = [{name: "Stadia Seasons"}]
    var values = [];
    seasons.forEach(season => {
        if (season.id.includes("console")) {
            values.push(season.id + "\n")
        }
    })

    fields[0].value = values.join("")
    var attachment = new MessageAttachment("assets/shards/stadia.png");
    var embed = new MessageEmbed();
    embed.setTitle(`Season ids for PUBG ${shard}`)
    embed.setDescription("Copy & Paste the season id when looking up stats for players for a particular season")
    embed.setThumbnail(`attachment://stadia.png`);
    embed.setFields(fields)
    embed.setColor("#D72D39")
    return {embeds: [embed], files: [attachment]};
}

function createEmbedKakao(shard, seasons) {
    var count = 0;
    var fields = [{ name: "Kakao 2018 Seasons" }, { name: "Kakao Survivor Seasons" }, { name: "Kakao Ranked Seasons" }];

    var valuesSeason2018 = [];
    var valuesSurvivor = [];
    var valuesRanked = [];

    seasons.forEach(season => {
        if (season.id.includes("division.bro.official.2018-")) {
            valuesSeason2018.push(season.id + "\n");
        }
        else if (season.id.includes("division.bro.official.pc-2018-") && count >= 25) {
            valuesRanked.push(season.id + "\n");
        }
        else if (season.id.includes("division.bro.official.pc-2018-")) {
            valuesSurvivor.push(season.id + "\n");
        }
        else { }
        count++;
    });

    fields[0].value = valuesSeason2018.join("");
    fields[1].value = valuesSurvivor.join("");
    fields[2].value = valuesRanked.join("");

    var attachment = new MessageAttachment("assets/shards/kakao.png");
    var embed = new MessageEmbed();
    embed.setTitle(`Season ids for PUBG ${shard}`)
    embed.setDescription("Copy & Paste the season id when looking up stats for players for a particular season")
    embed.setThumbnail(`attachment://kakao.png`);
    embed.setFields(fields)
    embed.setColor("#F5E20B")
    return {embeds: [embed], files: [attachment]};
}