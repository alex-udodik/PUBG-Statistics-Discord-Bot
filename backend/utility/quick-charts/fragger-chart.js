const QuickChart = require('quickchart-js');
const statsCalc = require('../../../discordbot/utility/pubg/stats')

module.exports = {

    async generateChartUrl(object) {
        const chart = new QuickChart();

        chart.setWidth(500)
        chart.setHeight(300)
        chart.setBackgroundColor("#2F3136")

        var labels_ = [];
        var fraggerRatings = [];
        var roundsPlayed = [];
        let i = 1;

        for (const seasonStats of object.seasonsWithStats) {
            labels_.push(i.toString())
            i++;
            const rounds = seasonStats.stats.roundsPlayed;
            roundsPlayed.push(rounds)

            const winRatio = statsCalc.getWinPercent(seasonStats.stats.wins, rounds);
            const timeSurivedRaw = statsCalc.getTimeSurvived(seasonStats.stats.timeSurvived, rounds, "m");
            const adrRaw = statsCalc.getAdr(seasonStats.stats.damageDealt, rounds);
            const hsRatioRaw = statsCalc.getWinPercent(seasonStats.stats.wins, rounds);
            const old_rating = parseFloat(statsCalc.getOldFraggerRating(adrRaw, hsRatioRaw, winRatio, timeSurivedRaw)).toFixed(1);
            fraggerRatings.push(old_rating)
        }

        chart.setConfig({
            type: 'line',
            data: {
                labels: labels_,
                datasets: [{
                    label: 'Fragger Rating',
                    data: fraggerRatings,
                    fill: false,
                    yAxisID: "y1",
                    borderColor: "#DC9A01",
                    backgroundColor: "#DC9A01"
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
                    text: `${object.displayName} Fragger Rating Over Seasons (${object.gameMode_})`,
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
                                labelString: 'Fragger Rating',
                                fontColor: "#DC9A01"
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