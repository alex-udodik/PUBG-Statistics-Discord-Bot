const commandExecuteController = require("../runCommandController");
module.exports = {

    data: null
    ,
    async execute(interaction) {
        await interaction.deferReply({ephemeral: true});
        const commandExecuteController = require('../runCommandController')
        const embed = await commandExecuteController.runCommand(interaction)
        await interaction.editReply({embeds: [embed]})

    }
}