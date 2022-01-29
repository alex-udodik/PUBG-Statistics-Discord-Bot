const { MessageEmbed } = require('discord.js');

class EmbedBuilder {
    constructor() {
        this.embed = new MessageEmbed;
    }
}

module.exports = EmbedBuilder;