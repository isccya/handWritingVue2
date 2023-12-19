import Dep from "./dep";
/**
 * 每个组件对应一个watcher,页面渲染的逻辑放到watcher里
 * 每个属性有一个dep (属性是被观察者), watcher是观察者(属性变化了会通知观察者来更新)
 * 
 * 
 * */ 
let id = 0




class Watcher{ //不同组件有不同的watcher ,目前只有根组件有
    constructor(vm,fn,options){
        this.id = id++
        this.renderWatcher = options //是一个渲染过程
        this.getter = fn; // getter意味着调用这个函数可以发生取值操作
        this.deps = []; // 后续 我们实现计算属性,和一些清理工作需要
        this.depsId = new Set(); //
        this.get()
    }
    addDep(dep){ // 一个组件对应多个属性 重复的属性也不用记录
        let id = dep.id
        if(!this.depsId.has(id)){
            this.deps.push(id)
            this.depsId.add(id)
            dep.addSub(this) //watcher已经记住dep并且去重,此时让dep记住watcher
        }
    }
    get(){
        // 用不到的数据就不会收集
        Dep.target = this //把当前渲染组件的watcher放在全局上,组件渲染会访问数据,数据里get方法会把把该组件添加到自己的dep中
        this.getter() //会去vm上取值 vm._update(vm._render) 取name 和age
        Dep.target = null // 渲染完之后清空
    }
    update(){
        this.get()
    }
}

// 需要给每个属性增加一个dep,目的就是收集watcher

// 一个组件有多个属性(n个属性对应一个视图) n个dep对应一个watcher
// 一个属性对应多个组件
// 多对多 

export default Watcher

