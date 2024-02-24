const backend = require("../api");

module.exports = {
    async createSeasonName(shard, seasonNum, ranked) {
        var url = `http://localhost:3000/api/shard/${shard}/seasons`
        const seasons = await backend.fetchData(url, 6500, null, "GET")
        const size = seasons.length;

        //check if number
        if (isNumeric(seasonNum) && (seasonNum >= 0 && seasonNum <= size)) {

            // Number constructor
            number = Number(seasonNum);
            if (shard === "steam" || shard === "kakao") {
                return `division.bro.official.pc-2018-${processZeroInFront(number)}`
            } else if (shard === "xbox" || shard === "psn" || shard === "stadia") {
                return `division.bro.official.console-${processZeroInFront(number)}`
            }
        }
        else {
            return [-1, size];
        }
    },

    getSimplifiedSeasonName(shard, seasonId, ranked) {

        if (shard === "steam") {
            return steam(seasonId, ranked)
        } else if (shard === "xbox") {
            return xbox(seasonId, ranked)
        } else if (shard === "psn") {
            return psn(seasonId, ranked)
        } else if (shard === "stadia") {
            return stadia(seasonId, ranked)
        } else if (shard === "kakao") {
            return kakao(seasonId, ranked)
        }
    },
}

const processZeroInFront = (num) => {
    if (num > 0 && num < 10) {
        return `0${num}`
    }
    else {
        return num;
    }
}

const isNumeric = (str) => {
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

const steam = (seasonId, ranked) => {
    if (seasonId.includes("division.bro.official.pc-2018-")) {
        const num = parseInt(seasonId.slice(-2));
        if (!ranked) {
            return {seasonId: seasonId, name: `Season ${num}`}
        } else {
            if (num >= 7) {
                return {seasonId: seasonId, name: `Season ${num}`}
            }
        }
    }
    if (seasonId === "lifetime") {
        return {seasonId: "lifetime", name: "Lifetime"}
    }
    return undefined;
}
const xbox = (seasonId, ranked) => {
    if (seasonId.includes("division.bro.official.console-") || seasonId.includes("division.bro.official.xbox-")) {
        const num = parseInt(seasonId.slice(-2));
        if (!ranked) {
            return {seasonId: seasonId, name: `Season ${num}`}
        } else {
            if (num >= 7) {
                return {seasonId: seasonId, name: `Season ${num}`}
            }
        }
    }
    if (seasonId === "lifetime") {
        return {seasonId: "lifetime", name: "Lifetime"}
    }
    return undefined;
}
const psn = (seasonId, ranked) => {

    if (seasonId.includes("division.bro.official.console-") || seasonId.includes("division.bro.official.playstation-")) {
        const num = parseInt(seasonId.slice(-2));
        if (!ranked) {
            return {seasonId: seasonId, name: `Season ${num}`}
        } else {
            if (num >= 7) {
                return {seasonId: seasonId, name: `Season ${num}`}
            }
        }
    }
    if (seasonId === "lifetime") {
        return {seasonId: "lifetime", name: "Lifetime"}
    }
    return undefined;
}
const stadia = (seasonId, ranked) => {

    if (seasonId.includes("division.bro.official.console-")) {
        const num = parseInt(seasonId.slice(-2));
        return {seasonId: seasonId, name: `Season ${num}`}
    }
    if (seasonId === "lifetime") {
        return {seasonId: "lifetime", name: "Lifetime"}
    }
    return undefined;
}
const kakao = (seasonId, ranked) => {
    return steam(seasonId, ranked)
}
