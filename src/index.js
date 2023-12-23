import { initGlobalAPI } from "./GlobalAPI";
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle";
import Watcher, { nextTick } from "./observe/watcher";


function Vue(options) { //options就是用户的选项,包括data,computed等等
    this._init(options)
}

Vue.prototype.$nextTick = nextTick
initMixin(Vue) //给vue对象扩展了init方法
initLifeCycle(Vue); //添加vue的生命周期
initGlobalAPI(Vue) // 添加vue的全局方法

Vue.prototype.$watch = function (exprOrFn, cb, options = {}) {
    // firstname值变化,执行cb函数即可
    new Watcher(this, exprOrFn,{user:true},cb)
}

export default Vue