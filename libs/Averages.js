const Data = require("./Data.js");
const math = require("mathjs");

class Ma{
    constructor(period, factor){
        this.period = period
        this.factor = factor
        this.data = new Data(20)
        this.values = new Data(10)
        this.val = null
        this.acc = null
        this.dist = null

    }
    mediaAverange(value){
        if (Array.isArray(value)) this.data.replace(value)
        else this.data.push(value);
    }
    calculate(value, value2=0){
        this.val = this.mediaAverange(value)
        this.dist = (value2 - this.val) * 100 / this.val
        let data = this.data.slice(-10)

        if(data && data[0] != null) {
            this.variance = math.variance(data)
            this.std = math.std(data)
        }

        if (this.data.last(3) != null){
            this.acc = ((this.val - this.data.last(3))/ 2 )
        }
        return this
    }
}
/**
 * Media ponderada
 */
class WMA extends Ma{
    constructor(period, factor){
        super(period, factor)
    }
    mediaAverange(value){
        super.mediaAverange(value)

        let slice = this.data.get(this.period)
        let num = 0, den = 0, pon = 0
        for(let s of slice){
            num += s * ++pon
            den += pon
        }
        let result = num/den
        this.values.push(result);
        return result
    }
    static calculate(value=[]){
        if (!Array.isArray(value)) 
            throw Error('El argumento tiene que ser un array')
        let num = 0, den = 0, pon = 0
        for(let s of value){
            num += s * ++pon
            den += pon
        }

       return num/den
    }
}
/**
 * Media extendida
 */
class EMA extends Ma{
    constructor(period, factor = 2){
        super(period, factor)
    }
    mediaAverange(value){
        super.mediaAverange(value)
        let ema = null 
        if (this.data.len() >= this.period) { 
            let last = this.values.last();
            if (last == null) {
                let slice = this.data.get(this.period);
                ema = SMA.calculate(slice);
            } else {
                let value = this.data.last()
                let fa = this.factor / (this.period + 1);
                //EMA = Precio(t) × k + EMA (y) × (1 − k)
                ema = last + fa * (value - last);
            }
        }
        this.values.push(ema);
        return ema;
    }
}
/**
 * Media simple
 */
class SMA extends Ma{
    constructor (period){
        super(period, 0)
    }
    mediaAverange(value){
        super.mediaAverange(value)

        let slice = this.data.get(this.period)
        let num = 0
        for(let val of slice){
            num += val 
        }
        
        let result = num/value.length
        this.values.push(result);
        return result
    }
    static calculate(value=[]){
        if (!Array.isArray(value)) 
            throw Error('El argumento tiene que ser un array')
        let num = 0
        for(let val of value){
            num += val 
        }
        
       return num/value.length
    }
}
module.exports = {EMA,SMA,WMA}