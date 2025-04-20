function myNew(obj, ...args){
    const newObj = {}
    newObj.__proto__ = obj.prototype
    const res = newObj.call(obj,...args)
    return typeof res === 'object' ? res : obj 
}