module.exports = {
    createEmbedFactory: function (shard, seasons) {

        var fields = [];
    
        if (shard === "steam") {fields = createEmbedSteam(seasons)}
        else if (shard === "psn") {fields = createEmbedPsn(seasons)}
        else if (shard === "xbox") {fields = createEmbedXbox(seasons)}
        else if (shard === "stadia") {fields = createEmbedStadia(seasons)}
        else if (shard === "kakao") {fields = createEmbedKakao(seasons)}
        else {} 
    
        var embed = {
            color: 0xda8501,
            title: `Season id's for ${shard}`,
            description: "Copy & Paste the season id when looking up stats for players for a particular season",
            fields: fields
        }
    
        return embed;
    }
}

    
    
function createEmbedSteam(seasons) {

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

    return fields;
}

function createEmbedXbox(seasons) {
    var fields = [{name: "Xbox Seasons"}]
    var values = [];
    seasons.forEach(season => {
        if (season.id.includes("xbox") || season.id.includes("console")) {
            values.push(season.id + "\n")
        }
    })

    fields[0].value = values.join("")
    return fields;
}

function createEmbedPsn(seasons) {
    var fields = [{name: "Playstation Seasons"}]
    var values = [];
    seasons.forEach(season => {
        if (season.id.includes("playstation") || season.id.includes("console")) {
            values.push(season.id + "\n")
        }
    })

    fields[0].value = values.join("")
    return fields;
}

function createEmbedStadia(seasons) {
    var fields = [{name: "Stadia Seasons"}]
    var values = [];
    seasons.forEach(season => {
        if (season.id.includes("console")) {
            values.push(season.id + "\n")
        }
    })

    fields[0].value = values.join("")
    return fields;
}

function createEmbedKakao(seasons) {
    return createEmbedSteam(seasons)
}