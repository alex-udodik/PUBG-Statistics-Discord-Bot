const api = require('../utility/api')

module.exports = {
    async execute(guild) {
        const id = guild.id;

        const body = {_id: id}
        const result = await api.fetchData(`http://localhost:3000/discord/guildCommands`, 7500, body, "DELETE")

        if (result.message === "Success") {
            console.log(`Guild id ${id} kicked bot and mongo deletion completed.`);
        }
        else {console.log(`Guild id ${id} kicked bot but delete from mongo failed.`);}
    }
}