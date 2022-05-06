class Candle {
    constructor(data) {
        if (typeof(data) == 'object') {
            this._time = new Date(data.time)
            this._closeTime = new Date(data.closeTime)
            this._open = parseFloat(data.open) || null
            this._high = parseFloat(data.high) || null
            this._low = parseFloat(data.low) || null
            this._close = parseFloat(data.close) || null
            this._volume = parseFloat(data.volume) || null
            this._quoteVolume = parseFloat(data.quoteVolume) || null
            this._takerBuyBaseVolume = parseFloat(data.takerBuyBaseVolume) || null
            this._takerBuyQuoteVolume = parseFloat(data.takerBuyQuoteVolume) || null
            this._takerSellBaseVolume = this._volume - this._takerBuyBaseVolume
            this._delta = this._takerBuyBaseVolume - this._takerSellBaseVolume
            this._takerSellQuoteVolume = this._quoteVolume - this._takerBuyQuoteVolume
            
            this._trades = parseInt(data.trades)
            this._price = (this._high + this.close) / 2
            this._pp = (data.high + data.low + data.price) / 3 || null
            this._R1 = (this.pp * 2) - data.low
            this._S1 = (this.pp * 2) - data.high
            this._R2 = this.pp + (this.R1 - this.S1)
            this._S2 = this.pp -(this.R1 - this.S1)
        } else {
            console.log(data)
            throw new Error("No ha introducido los datos necesarios para crear la vel:")
        }
    }
    get delta(){
        return this._delta
    }
    get S2() {
        return this._S2
    }
    get R2() {
        return this._R2
    }
    get S1() {
        return this._S1
    }
    get R1() {
        return this._R1
    }
    get pp() {
        return this._pp
    }
    get closeTime() {
        return this._closeTime.valueOf()
    }
    get price() {
        return this._price
    }
    get open() {
        return this._open
    }
    get high() {
        return this._high
    }
    get low() {
        return this._low
    }
    get close() {
        return this._close
    }
    get time() {
        return this._time.valueOf()
    }
    get datetime() {
        return this._time.toLocaleString()
    }
    get timestamp() {
        return this._time.getTime()
    }
    get volume() {
        return this._volume
    }
    set time(value) {
        this._time = new Date(value)
    }
    set open(value) {
        this._open = parseFloat(value)
    }
    set high(value) {
        this._high = parseFloat(value)
    }
    set low(value) {
        this._low = parseFloat(value)
    }
    set close(value) {
        this._close = parseFloat(value)
    }
    set price(value) {
        this._price = parseFloat(value)
    }

    print() {
        console.log(`
            time:                   ${
            this._time.toLocaleString()
        }
            closeTime:              ${
            this._closeTime.toLocaleString()
        }
            open:                   ${
            this._open
        }
            high:                   ${
            this._high
        }
            low:                    ${
            this._low
        }
            close:                  ${
            this._close
        }
            volume:                 ${
            this._volume
        }
            quoteVolume:            ${
            this._quoteVolume
        }
            takerBuyBaseVolume:     ${
            this._takerBuyBaseVolume
        }
            takerBuyQuoteVolume:    ${
            this._takerBuyQuoteVolume
        }
            takerSellBaseVolume:    ${
            this._takerSellBaseVolume
        }
            takerSellQuoteVolume:   ${
            this._takerSellQuoteVolume
        }
            trades:                 ${
            this._trades
        }
            `)
    }
    toJSON() {
        if (arguments.length > 0) {
            let json = {}
            for (let arg of arguments) {
                json[arg] = this[arg]
            }
            return json
        } else {
            return {
                time: this.timestamp,
                closeTime: this._closeTime.getTime(),
                datetime: this.datetime,
                open: this._open,
                high: this._high,
                low: this._low,
                close: this._close,
                volume: this._volume,
                delta: this._delta, 
                quoteVolume: this._quoteVolume,
                takerBuyBaseVolume: this._takerBuyBaseVolume,
                takerBuyQuoteVolume: this._takerBuyQuoteVolume,
                takerSellBaseVolume: this._takerSellBaseVolume,
                takerSellQuoteVolume: this._takerSellQuoteVolume,
                trades: this._trades,
                price: this._price,
                PP: this._pp,
                R1: this._R1,
                S1: this._S1,
                R2: this._R2,
                S2: this._S2
            }
        }

    }
}
module.exports = Candle
