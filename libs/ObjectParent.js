/**
 * Caracteristicas comunes para objetos JSON 
 */
const ObjectParent = {
    color: '',
    red: '\x1b[31m%s\x1b[0m',
    green: '\x1b[32m%s\x1b[0m',
    newObject: {},
    /**
     * Copia los objetos 
     * @param {json} value se añade a la copia
     * @returns copia del objeto
     */

    clone(_obj = null) {
        var newObject = {}
        let obj = null
        if(_obj == null) {
            obj = this
            newObject = {}
        } else obj = _obj
        
        Object.keys(obj).forEach((key) =>{ newObject[key] = this.clone(obj[key]); });
        return newObject;
    }
}
module.exports = ObjectParent
