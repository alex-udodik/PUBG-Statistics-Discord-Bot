const {SlashCommandBuilder} = require('@discordjs/builders');
const AccountVerificationHandler = require('../commands-helper/account-verification');
const statsParser = require('../commands-helper/stats-parser');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ratcheck-lifetime')
        .setDescription('Shows the rat rating for lifetime stats of a pubg player')
        .addStringOption(option =>
            option
                .setName('names')
                .setDescription('Case-sensitive for 1st-time names! Max 10 names. Ex: DallasCowboy TGLTN shroud')
                .setRequired(true)
        ),

    async execute(interaction) {

        await interaction.deferReply({ephemeral: true});

        const fail_message = "Accounts failed fetch from API (DNE or missing upper/lower case):";
        const pubg_name = interaction.options.getString('names');
        const names = pubg_name.split(/[ ,]+/)

        if (names.length > 10) {
            await interaction.editReply(`Exceeded number of names. (Max 10)`)
            return;
        }

        var accountVerification = new AccountVerificationHandler(names);
        const verifiedAccounts = await accountVerification.getAccounts();

        var namesThatFailedLookUp = [];
        var fields = [];
        var footer = [fail_message];
        var embed = {title: "",fields: "", footer: {text: ""}}

        if ('APIError' in verifiedAccounts) {
            const details = verifiedAccounts.details;
            await interaction.editReply(`There was an error involving ${details}`)
            return;
        }
        if (verifiedAccounts.accounts.length > 0) {
            const namesWithStats = await statsParser.addStats(verifiedAccounts.accounts, "lifetime", "squad-fpp", false);
            if ('APIError' in namesWithStats) {
                const details = namesWithStats.details;
                await interaction.editReply(`There was an error involving ${details}`)
                return;
            }
            namesWithStats.forEach(account => {
                var item = [];
                for (const [key, value] of Object.entries(account.calcedStats)) {
                    item.push(`${key}: ${value}\n`);
                }
                const value = item.join("");
                const field = {name: account.name, value: value, inline: true}
                fields.push(field);
            })
        }
        if (verifiedAccounts.accountsFailedAPILookUp.length > 0) {
            verifiedAccounts.accountsFailedAPILookUp.forEach(name => {
                namesThatFailedLookUp.push(`\n\u2022${name}`);
            })
        }

        if (namesThatFailedLookUp.length > 0 && verifiedAccounts.accounts < 1) {
            embed.title = "Accounts failed:";
            embed.description = namesThatFailedLookUp.join("");
        }
        else {
            embed.title = "Lifetime stats";
            embed.fields = fields;
            if (namesThatFailedLookUp.length < 1) {embed.footer.text = "";}
            else {
                footer.push.apply(footer, namesThatFailedLookUp)
                embed.footer.text = footer.join("");
            }
        }

        await interaction.editReply(
            {embeds: [embed]}
        )
    }
}