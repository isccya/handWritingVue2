let id = 0
/**
 * dep每个属性都有,目的是收集watcher,是在闭包上的私有属性.无法手动访问dep对象
 * 每个对象也有,在对象__ob__上,这个属性就是observe实例.dep是在observe实例上
 * 
 * */
class Dep {
    constructor() {
        this.id = id++ //属性的dep收集watcher
        this.subs = [] //存放属性对应的watcher有哪些
    }
    depend() {
        // 不希望重复记录watcher
        Dep.target.addDep(this) //让watcher记住dep

        // dep和watcher是一个多对多关系
    }
    addSub(watcher) {
        this.subs.push(watcher)
    }
    notify() {
        this.subs.forEach(watcher => watcher.update()) //告诉watcher要更新了
    }
}

// 对外暴露全局变量,可以让响应式数据收集watcher.
Dep.target = null
let stack = []
export function pushTarget(watcher){ 
    stack.push(watcher)
    Dep.target = watcher
} 
export function popTarget(watcher){
    stack.pop()
     Dep.target = stack[stack.length - 1]
}


export default Dep;