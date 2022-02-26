const QuickChart = require('quickchart-js');
const statsCalc = require('../../../discordbot/utility/pubg/stats')

module.exports = {

    async generateChartUrl(object) {
        const chart = new QuickChart();

        chart.setWidth(500)
        chart.setHeight(300)
        chart.setBackgroundColor("#2F3136")

        var labels_ = [];
        var revivesPerMinArray = [];
        var roundsPlayed = [];
        let i = 1;

        for (const seasonStats of object.seasonsWithStats) {
            labels_.push(i.toString())
            i++;
            const rounds = seasonStats.stats.roundsPlayed;
            roundsPlayed.push(rounds)

            const timeSurivedRaw = seasonStats.stats.timeSurvived / 60
            const revives = seasonStats.stats.revives
            const revivesPerMin = statsCalc.getRevivesPerMin(revives, timeSurivedRaw)
            revivesPerMinArray.push(revivesPerMin)
        }

        chart.setConfig({
            type: 'line',
            data: {
                labels: labels_,
                datasets: [{
                    label: 'Revives Per Min',
                    data: revivesPerMinArray,
                    fill: false,
                    yAxisID: "y1",
                    borderColor: "#889E55",
                    backgroundColor: "#889E55"
                },
                    {
                        label: 'Rounds Played',
                        data: roundsPlayed,
                        fill: false,
                        yAxisID: "y2",
                        borderColor: "#4E79A7",
                        backgroundColor: "#4E79A7"
                    }]
            },
            options: {
                title: {
                    display: true,
                    text: `${object.displayName} Revives Per Min Over Seasons`,
                    fontColor: "#DCDCDC"
                },
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [
                        {
                            scaleLabel: {
                                display: true,
                                labelString: 'Season',
                                fontStyle: 'bold',
                                fontColor: "#979798"
                            }
                        }
                    ],
                    yAxes: [
                        {
                            scaleLabel: {
                                display: true,
                                labelString: 'Revives Per Min Rating',
                                fontColor: "#889E55"
                            },
                            fontStyle: 'bold',
                            id: "y1",
                            position: "left"

                        },
                        {
                            scaleLabel: {
                                display: true,
                                labelString: 'Rounds Played',
                                fontColor: "#4E79A7"
                            },
                            fontStyle: 'bold',
                            id: "y2",
                            position: "right",
                            gridLines: {
                                "drawOnChartArea": false
                            }
                        }
                    ]
                }
            },
        });

        const url = chart.getUrl();
        return url;
    }
}