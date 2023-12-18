import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle";


function Vue(options){ //options就是用户的选项,包括data,computed等等
    this._init(options)
}
        
initMixin(Vue) //给vue对象扩展了init方法
initLifeCycle(Vue);


export default Vue