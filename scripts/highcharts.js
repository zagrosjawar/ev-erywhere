const ranges = [
  [0, 2],
  [0, 2],
  [0, 3],
  [0, 3],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 4],
  [1, 5],
  [3, 7],
  [3, 7],
  [2, 6],
  [3, 7], // 12:00
  [1, 5],
  [1, 5],
  [0, 4],
  [2, 6],
  [5, 7],
  [4, 6],
  [5, 7],
  [3, 7],
  [2, 6],
  [1, 5],
  [0, 3],
  // Most to least stations
];
averages = [
  [0],
  [0],
  [1],
  [1],
  [0],
  [1],
  [2],
  [2],
  [3],
  [5],
  [5],
  [4],
  [5], // 12:00
  [3],
  [3],
  [2],
  [4],
  [7],
  [6],
  [7],
  [5],
  [4],
  [3],
  [1],
];

// Begynner med å fetche api-en som e lagd
fetch("https://api.npoint.io/8fb38d349fb095d412e2")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json(); // tar json inn og returnerer promise
  })
  .then((data) => {
    // jobber videre med json, skjer når response er returnert
    updateHighChart(data);
  })
  .catch((error) => {
    console.error("There has been a problem with your fetch operation:", error); // legger inn feilmelding
  });

function updateHighChart(data) {
  //funksjon for å oppdatere Highchartsen etter api-en
  Highcharts.chart("stats", {
    title: {
      text: "Circle K Dale",
      align: "left",
    },

    subtitle: {},

    xAxis: {
      type: "datetime",
      dateTimeLabelFormats: {
        hour: "%H:%M",
      },
      tickInterval: 3600 * 1000, // 1 hour in milliseconds
      labels: {
        format: "{value:%H:%M}", // Display hours and minutes on the x-axis labels
      },
    },

    yAxis: {
      title: {
        text: null,
      },
    },

    tooltip: {
      crosshairs: true,
      shared: true,
    },

    plotOptions: {
      series: {
        pointStart: Date.UTC(2022, 6, 1, 0, 0, 0), // Start at midnight
        pointInterval: 3600 * 1000, // 1 hour in milliseconds
      },
    },

    series: [
      {
        name: "Gjennomsnittlig strømforbruk i kWh",
        data: data.data.averages,
        zIndex: 1,
        marker: {
          fillColor: "white",
          lineWidth: 2,
          lineColor: Highcharts.getOptions().colors[9],
        },
      },
      {
        name: "Minimum og maksimum strømforbruk i kWh",
        data: data.data.ranges,
        type: "arearange",
        lineWidth: 0,
        linkedTo: ":previous",
        color: Highcharts.getOptions().colors[0],
        fillOpacity: 0.3,
        zIndex: 0,
        marker: {
          enabled: false,
        },
      },
    ],
  });
}
