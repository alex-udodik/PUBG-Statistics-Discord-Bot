module.exports = {

    getSimplifiedSeasonName(shard, seasonId) {

        if (shard === "steam") { return steam(seasonId)}
        else if (shard === "xbox") {return xbox(seasonId)}
        else if (shard === "psn") {return psn(seasonId)}
        else if (shard === "stadia") {return stadia(seasonId)}
        else if (shard === "kakao") {return kakao(seasonId)}
    }
}

const steam = (seasonId) => {

    const data = {};

    data["division.bro.official.pc-2018-01"] = "Season 1"

    if (!(seasonId in data)) {
        if (seasonId.includes("division.bro.official.pc-2018-")) {
            const num = seasonId.slice(-2);
            return {seasonId: seasonId, name: `Season ${num}`}
        }
    }
    else {
        return {seasonId: seasonId, name: data[seasonId]}
    }
    return undefined;

}
const xbox = (seasonId) => {
    const data = {};

    data["division.bro.official.xbox-01"] = "Season 1"
    data["division.bro.official.xbox-02"] = "Season 2"
    data["division.bro.official.console-03"] = "Season 3"
    data["division.bro.official.console-04"] = "Season 4"
    data["division.bro.official.console-05"] = "Season 5"
    data["division.bro.official.console-06"] = "Season 6"
    data["division.bro.official.console-07"] = "Season 7"
    data["division.bro.official.console-08"] = "Season 8"
    data["division.bro.official.console-09"] = "Season 9"

    if (!(seasonId in data)) {
        if (seasonId.includes("division.bro.official.console-")) {
            const num = seasonId.slice(-2);
            return {seasonId: seasonId, name: `Season ${num}`}
        }
    }
    else {
        return {seasonId: seasonId, name: data[seasonId]}
    }
    return undefined;
}
const psn = (seasonId) => {
    const data = {};

    data["division.bro.official.playstation-01"] = "Season 1"
    data["division.bro.official.playstation-02"] = "Season 2"
    data["division.bro.official.console-03"] = "Season 3"
    data["division.bro.official.console-04"] = "Season 4"
    data["division.bro.official.console-05"] = "Season 5"
    data["division.bro.official.console-06"] = "Season 6"
    data["division.bro.official.console-07"] = "Season 7"
    data["division.bro.official.console-08"] = "Season 8"
    data["division.bro.official.console-09"] = "Season 9"

    if (!(seasonId in data)) {
        if (seasonId.includes("division.bro.official.console-")) {
            const num = seasonId.slice(-2);
            return {seasonId: seasonId, name: `Season ${num}`}
        }
    }
    else {
        return {seasonId: seasonId, name: data[seasonId]}
    }
    return undefined;
}
const stadia = (seasonId) => {
    const data = {};

    data["division.bro.official.console-07"] = "Season 7"
    data["division.bro.official.console-08"] = "Season 8"
    data["division.bro.official.console-09"] = "Season 9"

    if (!(seasonId in data)) {
        if (seasonId.includes("division.bro.official.console-")) {
            const num = seasonId.slice(-2);
            return {seasonId: seasonId, name: `Season ${num}`}
        }
    }
    else {
        return {seasonId: seasonId, name: data[seasonId]}
    }
    return undefined;
}
const kakao = (seasonId) => {
    return steam(seasonId)
}
