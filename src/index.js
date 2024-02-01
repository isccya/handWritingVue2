import { initGlobalAPI } from "./GlobalAPI";
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";


// 根据用户选项创建不同的Vue!还有根据用户选项创建不同的子组件!
function Vue(options) { //options就是用户的选项,包括data,computed等等
    this._init(options)
}

initMixin(Vue) //给vue对象扩展了init方法
initLifeCycle(Vue); //添加vue的生命周期
initGlobalAPI(Vue) // 添加vue的全局方法
initStateMixin(Vue) //实现了nextTick $watch

export default Vue