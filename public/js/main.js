window.addEventListener("load", function() {
    socket = io.connect('http://localhost:8000', {
        'forceNew': true
    })
    socket.on('setCongig', d => {
        document.getElementById("symbol").innerHTML = d.s || 'N/A';
        document.getElementById("temp").innerHTML = d.t || 'N/A';
    })
    let lastCloseTime = 0
    socket.on('getTrades', data => {
        chart1.data.datasets[2].data = data
        chart1.update()
    })
    socket.on('getdata', data => {
        if (data.length > 1) {
            console.log(data)
            let arrColor = data.map(d => d.color)
            let arrBody = data.map(d => d.body)
            let arrTail = data.map(d => d.tail)
            chart1.data.datasets[0].data = arrBody
            chart1.data.datasets[0].backgroundColor = arrColor
            chart1.data.datasets[1].data = arrTail
            chart1.data.datasets[1].backgroundColor = arrColor
            chart1.options.scales.y.max = Math.max(...arrBody.map(d => d.y[0] + 1))
            chart1.options.scales.y.min = Math.min(...arrBody.map(d => d.y[1] - 1))

            //chart1.data.datasets[1].data = data.map(d => [d.high, d.low])
            //chart1.data.datasets[1].backgroundColor = data.map(d => d.high >= d.low ? 'green' : 'red')

        } else {
            let d = data[0]
            console.log(data)
            let time = d.x[0]
            let closeTime = d.closeTime

            if (lastCloseTime < time) {
                lastCloseTime = closeTime
            } else {
                chart1.data.labels.pop()
                chart1.data.datasets[0].data.pop()
                chart1.data.datasets[0].backgroundColor.pop()
                chart1.data.datasets[1].data.pop()
                chart1.data.datasets[1].backgroundColor.pop()
            }
            chart1.data.datasets[0].data.push(d.body)
            chart1.data.datasets[0].backgroundColor.push(d.color)
            chart1.data.datasets[1].data.push(d.tail)
            chart1.data.datasets[1].backgroundColor.push(d.color)

            if (data.candle)
                document.getElementById('messages').innerHTML = close
        }

        chart1.update()
    })
})