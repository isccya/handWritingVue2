import Dep from "./dep";
/**
 * 每个组件对应一个watcher,页面渲染的逻辑放到watcher里
 * 每个属性有一个dep (属性是被观察者), watcher是观察者(属性变化了会通知观察者来更新)
 * 
 * 需要给每个数据增加一个dep,目的就是收集watcher
    一个组件有多个数据(n个数据对应一个视图) n个dep对应一个watcher
    一个数据对应多个组件
    多对多 
 * */


/**
 *  nextTick原理???
 * 1.数据更新后不会立刻更新页面,而是异步更新.
 * 2.数据更新会触发依赖这个数据的组件的watcher进行更新,会用一个队列缓冲一个事件循环中所有变更的数据,保存对应的watcher
 * 3.nexttick会把队列中watcher的更新操作放到异步任务中,采用了优雅降级的方式,
 * 原生的Promise.then、MutationObserver和setImmediate，上述三个都不支持最后使用setTimeout
 * 4.异步任务执行完后,清空队列.如果要在页面更新后访问DOM的话,也要用nextTick方法,相当于在watcher更新的异步任务后面排一个异步任务
 * 
 * */ 
let id = 0




class Watcher { //不同组件有不同的watcher ,目前只有根组件有
    constructor(vm, fn, options) {
        this.id = id++
        this.renderWatcher = options //是一个渲染过程
        this.getter = fn; // getter意味着调用这个函数可以发生取值操作
        this.deps = []; // 后续 我们实现计算属性,和一些清理工作需要
        this.depsId = new Set(); //
        this.get()
    }
    addDep(dep) { // 一个组件对应多个属性 重复的属性也不用记录
        let id = dep.id
        if (!this.depsId.has(id)) {
            this.deps.push(id)
            this.depsId.add(id)
            dep.addSub(this) //watcher已经记住dep并且去重,此时让dep记住watcher
        }
    }
    get() {
        // 用不到的数据就不会收集
        Dep.target = this //把当前渲染组件的watcher放在全局上,组件渲染会访问数据,数据里get方法会把把该组件添加到自己的dep中
        this.getter() //会去vm上取值 vm._update(vm._render) 取name 和age
        Dep.target = null // 渲染完之后清空
    }
    update() {
        queueWatcher(this) //把当前watcher暂存,避免一个数据修改就更新整个页面
        // this.get()
    }
    run() {
        this.get()
    }
}

let queue = []
let has = {} //用对象去重watcher
let pending = false //防抖

function flushSchedulerQueue() {
    let flushQueue = queue.slice(0);
    queue = [];
    has = {};
    pending = false;
    flushQueue.forEach(q => q.run()); // 在刷新的过程中可能还有新的watcher，重新放到queue中
}

function queueWatcher(watcher) {
    const id = watcher.id
    if (!has[id]) {
        queue.push(watcher)
        has[id] = true
        // 不管update执行多少次,但是最终只刷新一轮
        if (!pending) {
            nextTick(flushSchedulerQueue, 0) //同步任务里面最后一次赋值(同步前面可能赋值多次)后,异步任务再执行更新,所以是批处理
            pending = true
        }
    }
}
// 又来一次这种方法,多个执行合成一个:一个变量,开个异步
// 控制更新顺序
let callbacks = []
let waiting = false
function flushCallbacks() {
    let cbs = callbacks.slice(0)
    waiting = false
    callbacks = []
    cbs.forEach(cb => cb())
}
// nextTick不是创建了异步任务,而是将异步任务维护到队列中
export function nextTick(cb) {
    callbacks.push(cb)
    if (!waiting) {
        Promise.resolve().then(flushCallbacks)
        waiting = true
    }
}


export default Watcher

