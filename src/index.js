import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle";
import { nextTick } from "./observe/watcher";


function Vue(options){ //options就是用户的选项,包括data,computed等等
    this._init(options)
}
        
initMixin(Vue) //给vue对象扩展了init方法
initLifeCycle(Vue);
Vue.prototype.$nextTick = nextTick


export default Vue