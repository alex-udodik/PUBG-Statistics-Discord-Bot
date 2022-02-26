const fraggerChart = require("./fragger-chart");


module.exports = {


    async getChart(type, object) {
        if (type === "fragger") {
            const fraggerChart = require('./fragger-chart')
            return await fraggerChart.generateChartUrl(object)
        }
        else if (type === "revives") {
            const revivesChart = require('./revives-chart')
            return await revivesChart.generateChartUrl(object)
        }
    }

}