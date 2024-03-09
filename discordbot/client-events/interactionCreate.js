
const folderDeletion = require('../utility/folder-deletion');

module.exports = {
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;
        console.log(command);

        try {
            await command.execute(interaction);
        } catch (err) {
            if (err) console.error(err);

            await interaction.editReply({
                content: "An error occured while executing the command.",
                ephemeral: true
            });
        }


        //TODO: clear /assets/temp/ folder
        folderDeletion.clearFolder("../assets/temp/");

    }
}