// 我们希望重写数组上的方法



let oldArrayProto = Array.prototype //获取数组的原型,其实是保留数组其他方法

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
        // console.log(method);
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

        ob.dep.notify(); //数组变化了,通知对应的watcher实现更新逻辑
        return result
    }
})
console.log(newArrayProto);