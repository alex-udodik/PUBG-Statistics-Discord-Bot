const commandExecuteController = require("../runCommandController");

module.exports = {

    data: ""
    ,
    async execute(interaction) {
        await interaction.deferReply({ephemeral: true});
        const commandExecuteController = require('../runCommandController')
        await commandExecuteController.runCommand(interaction)
        await interaction.editReply("test")

    }
}