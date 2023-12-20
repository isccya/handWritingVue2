import { newArrayProto } from "./array"
import Dep from "./dep"

class Observer {
    constructor(data) {
        // Object,defineProperty只能劫持已经存在的属性
        Object.defineProperty(data,'__ob__',{//给数据添加了一个标识,如果数据上有_ob_说明这个数据被观测过了
            value:this,
            enumerable:false,//将下划线ob变成不可枚举(循环时候无法获取)
        })
        // data._ob_ = this; 
        if (Array.isArray(data)) { //如果代理的数据是数组,不能给数组每一个索引都作响应式,很少有arr[876]这样的需求,只对数组方法里面做响应式,还有数组里面的对象作响应式
            data.__proto__ = newArrayProto //保留数组原有的特性,并且可以重写部分方法
            this.observeArray(data) //如果数组中存放的是对象,可以监测到对象的变化
        } else {
            this.walk(data)
        }   
    }
    walk(data) { // 循环对象,对属性依次劫持
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
    }
    observeArray(data) {
        data.forEach(item => observe(item)) //把数组里的对象都变成响应式
    }
}

// !!!最终定义对象属性为响应式的方法!!!
export function defineReactive(target, key, value) { //闭包 属性劫持
    observe(value) //递归,值是对象,也对对象内部的值做劫持
    let dep = new Dep() //每一个属性都有dep
    Object.defineProperty(target, key, {
        // ***在数据的get方法进行依赖收集,访问了数据===>组件依赖这些数据***
        get() {
            if(Dep.target){
                dep.depend();//让这个属性记住当前的watcher
            }
            return value
        },
        // ***在数据的set方法进行依赖追踪,数据修改===>组件更新***
        set(newValue) {
            if (newValue === value) return
            observe(newValue)
            value = newValue
            dep.nodify() //通知更新
        }
    })
}

export function observe(data) {
    // 对这个对象劫持
    if (typeof data !== 'object' || data === null) {
        return; //只对对象劫持
    }
    if(data._ob_ instanceof Observer){//说明这个对象被代理过了
        return data._ob_  
    } 
    return new Observer(data);
}