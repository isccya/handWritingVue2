let id = 0
/**
 * dep每个属性都有,目的是收集watcher
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
    nodify() {
        this.subs.forEach(watcher => watcher.update()) //告诉watcher要更新了
    }
}

Dep.target = null


export default Dep;