module.exports = {

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
    }
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
