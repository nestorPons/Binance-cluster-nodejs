const zoomOptions = {
    pan: {
        enabled: true,
        mode: 'xy',
    },
    zoom: {
        wheel: {
            enabled: true,
        },
        pinch: {
            enabled: true
        },
        mode: 'xy',
        onZoomComplete({
            chart
        }) {
            // This update is needed to display up to date zoom level in the title.
            // Without this, previous zoom level is displayed.
            // The reason is: title uses the same beforeUpdate hook, and is evaluated before zoom.
            chart.update('none');
        }
    }
};

const chartOptions = {
    type: 'scatter',
    scales: {
        y: {
            stacked: false
        },
        x: {
            type: 'timeseries',
            stacked: true,
            time: {
                unit: 'minute',
                displayFormats: {
                    quarter: 'hh:mm'
                }
            }
        },
    },
    crosshair: {
        line: {
            color: "#F66", // crosshair line color
            width: 1, // crosshair line width
        },
        sync: {
            enabled: true, // enable trace line syncing with other charts
            group: 1, // chart group
            suppressTooltips: true, // suppress tooltips when showing a synced tracer
        },
        zoom: {
            enabled: false,
        },
    },
    elements: {
        point: {
            radius: 0,
        },
        tooltip: {
            mode: "interpolate",
            intersect: false,
        },
    },
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
        crosshair: {
            sync: {
                enabled: true,
            },
        },
        tooltip: {
            mode: "interpolate",
            intersect: true,
        },
        zoom: zoomOptions
    },
};

const ctx1 = document.getElementById("chart1").getContext("2d");

var chart1 = new Chart(ctx1, {
    type: "bar",
    data: {
        labels: [],
        datasets: [{
                label: "Cuerpo",
                type: "bar",
                data: [],
                backgroundColor: [],
                stack: 'combined',
            },
            {
                label: "Colas",
                type: "bar",
                data: [],
                backgroundColor: [],
                maxBarThickness: 1,
                stack: 'combined',
            },
            {
                label: "BigTrades",
                type: "bubble",
                data: [],
                backgroundColor: 'rgba(0,0,250,0.2)',
                stack: 'combined',
            },

        ],
    },
    options: chartOptions,
});

document
    .getElementById("chart1")
    .addEventListener("dblclick", chart1.resetZoom);