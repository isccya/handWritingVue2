// 我们希望重写数组上的方法



let oldArrayProto = Array.prototype //获取数组的原型

export let newArrayProto = Object.create(oldArrayProto)

let methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice',
]

methods.forEach((method) => {
    newArrayProto[method] = function (...args) { //这里重写了数组的方法
        console.log(method);
        const result = oldArrayProto[method].call(this, ...args) //内部调用原来的方法
        let inserted ;
        let ob = this.__ob__;
        switch(method){
            case 'push' :
            case 'unshift' :
                inserted = args
                break;
            case 'splice' :
                inserted = args.slice(2)
            default:
                break;
        }
        if(inserted){
            ob.observeArray(inserted);
        }

        return result
    }
})
console.log(newArrayProto);