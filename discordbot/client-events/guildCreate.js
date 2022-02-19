const api = require("../utility/api");

module.exports = {
    async execute(guild) {
        const id = guild.id;

        console.log(`Bot joined guild id ${id}`);
        const document = {
            _id: id,
            steam: false,
            xbox: false,
            psn: false,
            stadia: false,
            kakao: false
        }

        const result = await api.fetchData(`http://localhost:3000/discord/guildCommands`, 7500, document, "POST")
        if (result.message === "Success") {
            console.log("Guild commands initialized in database");
        }
        else {
            console.log("Fail to initialize commands in database");
        }
    }
}