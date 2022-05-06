const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Binance = require("node-binance-api");
const binance = new Binance().options({
    APIKEY: process.env.BINANCEAPIKEY || process.env.BINANCEAPIKEY,
    APISECRET: process.env.BINANCEAPIKEYSECRET || process.env.BINANCEAPIKEYSECRET
});

let socket = null

let symbol = 'LTCUSDT'
let temp = '1m'

let closeTime = null
let time = null

const subDate = (date, temp) => {
    switch (temp) {
        case ('1m'):
            date.setMinutes(date.getMinutes() - 1)
            return date
    }
}

const addDate = (date, temp) => {
    switch (temp) {
        case ('1m'):
            date.setMinutes(date.getMinutes() + 1)
            return date
    }
}

app.use(express.static(__dirname + '/public'))
app.use('/', express.static(__dirname));

function sendTrades(value) {
    let data = []
    if (Array.isArray(value)) {

        for (let d of value) {
            if (d.qty > 100) {
                // Object: null prototype] {
                //   id: 505719489,
                //   price: '102.35',
                //   qty: '0.353',
                //   quoteQty: '36.12',
                //   time: 1651659929384,
                //   isBuyerMaker: false
                let value1 = parseInt(d.time)
                let value2 = parseFloat(d.price)
                let value3 = parseFloat(d.qty / 10)
                data.push({
                    x: value1,
                    y: value2,
                    r: value3
                })
            }
        }
    }
    socket.emit('getTrades', data)
}

function createData(d) {
    let value1 = parseInt(d.time)
    let value2 = [parseFloat(d.open), parseFloat(d.close)]
    let value3 = [parseFloat(d.high), parseFloat(d.low)]
    let value4 = d.close >= d.open ? 'green' : 'red'
    return ({
        timeClose: parseInt(d.closeTime),
        price: parseFloat(d.close),
        body: {
            x: value1,
            y: value2
        },
        tail: {
            x: value1,
            y: value3
        },
        color: value4
    })
}

function setCongig(s = symbol, t = temp) {
    symbol = s
    temp = t
    socket.emit('setCongig', {
        s: s,
        t: t
    })
}
io.on('connection', sock => {
    console.log('a user connected');
    socket = sock
    setCongig()
    let isFirst = true
    binance.futuresChart(symbol, temp, async (a, b, c) => {
        //time: 1651218420000,
        //closeTime: 1651218479999,
        //open: '102.70',
        //high: '102.77',
        //low: '102.70',
        //close: '102.73',
        //volume: '257.569',
        //quoteVolume: '26465.87814',
        //takerBuyBaseVolume: '248.153',
        //takerBuyQuoteVolume: '25498.59099',
        //trades: 91,
        //isFinal: false
        let data = []
        if (isFirst) {
            isFirst = false
            for (let i in c) {
                data.push(createData(c[i]))
            }

            //binance.websockets.trades(symbol, trades => {
            //    sendTrades(trades)
            //})
        } else {
            let last = c[Object.keys(c)[Object.keys(c).length - 1]];
            data.push(createData(last))
        }
        socket.emit('getdata', data)
        let trades = await binance.futuresHistoricalTrades(symbol)
        sendTrades(trades)

    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

console.log("localhost: " + port);
server.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`)
});