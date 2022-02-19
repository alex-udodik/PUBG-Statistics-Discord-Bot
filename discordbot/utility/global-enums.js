module.exports = {
    Shard: Object.freeze({
            STEAM: "steam",
            XBOX: "xbox",
            PSN: "psn",
            STADIA: "stadia",
            KAKAO: "kakao"
        }
    ),

    GameMode: Object.freeze({
        RANKED: "GameModeRanked",
        UNRANKED: "GameModeUnranked"
    }),

    PlayerCount: Object.freeze({
        RANKED: "PlayerCountRanked",
        UNRANKED: "PlayerCountUnranked"
    }),

    Seasons: Object.freeze({
        STEAM: this.Shard.STEAM,
        XBOX: this.Shard.XBOX,
        PSN: this.Shard.PSN,
        STADIA: this.Shard.STADIA,
        KAKAO: this.Shard.KAKAO,
    }),

    GameType: Object.freeze({
        RANKED: "GameTypeRanked",
        UNRANKED: "GameTypeUnranked"
    })
}