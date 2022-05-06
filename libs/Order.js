const Binance = require("node-binance-api");
const binance = new Binance().options({APIKEY: process.env.BINANCEAPIKEY, APISECRET: process.env.BINANCEAPIKEYSECRET});
global.BUY = "LONG";
global.SELL = "SHORT";
global.LONG = "LONG";
global.SHORT = "SHORT";

class Order { /**
     * Ordenes de apertura de la posición
     * @param {timestamp} time Hora de apertura
     * @param {float} price Precio
     * @param {float} amount Cantidad
     * @param {integer} side Tipo de apertura 
     */
    constructor(symbol, amount, side, isTest = true, id = 0) {
        this.id = null;
        this.symbol = symbol
        this.isTest = isTest
        this.side = side
        this.open = {
            time: null,
            localtime: null,
            price: null,
            candle: null,
        }
        this.amount = {
            units: parseFloat(amount),
            percent: 0
        }
        this.close = {
            time: null,
            price: null,
            side: this.side == BUY ? SELL : BUY,
            candle: null
        }
        this.result = {
            diff: 0.0,
            percent: 0.0
        }
        this.profit = {
            free: 0.0,
            total: 0.0,
            percent: 0.0
        }
        this._periods = {
            length: 0,
            db: []
        }
        this.fee = {
            index: 0.036,
            value: 0
        }
        this._stoploss = {
            id: null,
            value: null
        }
        this._takeprofit = {
            id: null,
            value: null
        }
        this.config = {
            log: false
        }
    }
    get stoploss(){
        return this._stoploss.value
    }
    /**
     * estable una orden de apertura 
     * @param {float} price 
     */
    async setOpenPosition(price){
        if (this.open.time == null) {   
            this.open.price = price  
            /**
             * Calcula el porcentaje de lo adquirido por el precio
             */
            let a = this.amount.units
            let p = this.open.price
            this.amount.percent = a / p * 100

            this.addFee()
            if (!this.isTest) {
                let o = await binance.futuresMarketBuy(this.symbol, this.amount.units)
                this.id = o.orderId
            } else {
                this.id = this.id = Math.floor(Math.floor((Math.random() * 1000) + 1))
            }
        }else{
            console.error('No se pueden establecer dos ordenes de apertura')
        }

    }
    /**
     * Abre una posición 
     * Si se pasa open.time se abre a precio mercado 
     * en caso contrario se estable una orden de apertura 
     * @param {float} price 
     * @param {*} timestamp 
     * @return {bool} 
     */
    async openPosition(price, timestamp = null) {
        if (this.open.time == null) {
            if (price != null) 
                this.open.price = price           

            if (timestamp != null) {
                this.open.time = timestamp
                this.open.localtime = new Date(timestamp).toLocaleString()
                this.log('purple', 'Abriendo posicion...', this.open.localtime, this.side, price = false)
            }
            /**
             * Calcula el porcentaje de lo adquirido por el precio
             */
            let a = this.amount.units
            let p = this.open.price
            this.amount.percent = a / p * 100

            this.addFee()

            if (!this.isTest) {
                let o = await binance.futuresMarketBuy(this.symbol, this.amount.units)
                this.id = o.orderId
            } else {
                this.id = this.id = Math.floor(Math.floor((Math.random() * 1000) + 1))
            }
       

            this.log('green', 'Estableciendo apertura...', price, this.side, price = false)
            return true
        }
        return false
    }
    addFee() {
        this.fee.value += this.amount.units * this.fee.index / 100
    }
    /**
     * establece un seguimiento y hace saltar los stoploss y takeprofits
     * @param {*} price 
     * @param {*} time 
     */
    watching(high, low, time) {
        let sl = this._stoploss.value
        let tp = this._takeprofit.value
        let op = this.open.price
        let ot = this.open.time

        if (!this.isOpen()) {
            if (high > op && low < op) 
                this.openPosition(null, time)
                return true
        } else {
            if (sl != null && high > sl && low < sl) {
                this.closePosition(this._stoploss.value, time)
                return true
            }

            if (tp != null && high > tp && low < tp){
                this.closePosition(this._takeprofit.value, time)
                return true
            } 

        }
        return false
    }
    /**
     * Getter Setter del cierre 
     * Calcula las diferencias con la apertura
     * @param {timestamp} time  hora del cierre
     * @param {float} price precio del cierre
     */
    async closePosition(price = null, time = null) {
        if (time == null || price == null) throw new Error('Missing parameters')
            if (this.close.time == null) {
                
                this.close.time = time
                this.close.localtime = new Date(time).toLocaleString()
                this.close.price = price

                // Cálculo de los resultados
                let sign = this.side == BUY ? 1 : -1
    
                this.result.diff = (this.close.price - this.open.price) * sign
                this.result.percent = this.result.diff * 100 / this.open.price
                this.profit.percent = this.result.diff * 100 / this.amount.units
                
                this.profit.free = this.result.diff * this.amount.units / this.open.price
                this.addFee()
                this.profit.total = this.profit.free - this.fee.value
                
      
                /*         
        if (!this.isTest) {
            let o =  await binance.futuresOrder( this.close.side, this.symbol, this.amount.units, null, {type: "MARKET", reduceOnly: true})
            if (o.code != undefined) this.log('red', 'close=>', o.msg)
        } 
        */

                this.log('yellow', 'Cerrando posición...', this.id, price, this.profit.total)
            }else{
                this.log('LA POSICION ESTA CERRADA')
            }
        

        return this.close
    }
    toJSON() {
        return {
            id: this.id,
            side: this.side,
            open: {
                time: new Date(this.open.time).toLocaleString(),
                price: this.open.price.toFixed(2)
            },
            close: {
                time: new Date(this.close.time).toLocaleString(),
                price: this.close.price.toFixed(2)
            },
            amount: {
                units: this.amount.unitse.toFixed(2),
                percent: this.amount.percent.toFixed(2)
            },
            result: {
                diff: this.result.diff.toFixed(2),
                percent: this.result.percent.toFixed(2)
            },
            profit: {
                total: this.profit.total.toFixed(2),
                percent: this.profit.percent.toFixed(2)
            },
            periods: this._periods.length
        }
    }
    // Setters and Getters
    /**
      * Setter del atributo periodo
      * @param {array} value arreglo con todos los periodos del movimiento
      */
    set periods(value) {
        this._periods.db = value
        this._periods.length = value.length
    }
    async setStoploss(value = null) {
        if (value != null && this.open.time != null) { // Cancela el anterior stop loss
            if (this._stoploss.id != null) {
                let o = {}
                if (!this.isTest) 
                    o = await binance.futuresCancel(this.symbol, {orderId: this._stoploss.id})

                
                if (o.code != undefined) 
                    this.log('red', 'stop=>', o.mns)

                
                this.log('yellow', 'Cancelando stop loss...', this._stoploss.id, o)
                this._stoploss.id = null
            }
            // Crea nuevo stoploss
            if (!this.isTest) {
                let o = await binance.futuresOrder(this.close.side, this.symbol, this.amount.units, value, {
                    type: "STOP",
                    stopPrice: value.toFixed(2)
                })
                if (o.code != undefined) 
                    this.log('red', 'new stop=>', o.mns) && console.log(o)

                this._stoploss.id = o.orderId
            } else {
                this._stoploss.id = Math.floor(Math.random() * 999999);
            }

            this.log(null, 'Creando stop loss...', this._stoploss.id, value)

            this._stoploss.value = value
        }
        return this._stoploss
    }
    getPeriod(value) {
        if (value < 0) 
            return this._periods.db[this._periods.length + value]
         else 
            return this._periods.db[value]

    }
    getPeriods() {
        return this._periods.db
    }
    isOpen(){
        return this.open.time != null
    }
    log(col, ...args) {
        if (this.config.log) {
            let color = (col == null || col == undefined) ? 'default' : col;

            let c = (color == 'default') ? '\x1b[29m%s\x1b[0m' : (color == 'red') ? '\x1b[31m%s\x1b[0m' : (color == 'green') ? '\x1b[32m%s\x1b[0m' : (color == 'purple') ? '\x1b[34m%s\x1b[0m' : (color == 'yellow') ? '\x1b[33m%s\x1b[0m' : '\x1b[28m%s\x1b[0m'

            console.log(c, args)
        }
    }
}
module.exports = {
    Order
}
