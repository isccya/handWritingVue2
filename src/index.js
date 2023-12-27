import { initGlobalAPI } from "./GlobalAPI";
import { compileToFunction } from "./compiler";
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";
import { createElm, patch } from "./vdom/patch";


function Vue(options) { //options就是用户的选项,包括data,computed等等
    this._init(options)
}

initMixin(Vue) //给vue对象扩展了init方法
initLifeCycle(Vue); //添加vue的生命周期
initGlobalAPI(Vue) // 添加vue的全局方法
initStateMixin(Vue) //实现了nextTick $watch






// ----------------测试---------------
let render1 = compileToFunction(`<ul style="color:blue" a="1" key="hi">
<li key="a">a</li>
<li key="b">b</li>
<li key="c">c</li>
<li key="d">d</li>
</ul>`)
let vm1 = new Vue({data:{name:'cc'}})
let preVnode = render1.call(vm1)
let el = createElm(preVnode)
document.body.appendChild(el)


let render2 = compileToFunction(`<ul style="background-color:red"  a="2" b="1" key="hi">
<li key="b">b</li>
<li key="m">m</li>
<li key="a">a</li>
<li key="p">p</li>
<li key="c">c</li>
<li key="q">q</li>
</ul>`)
let vm2 = new Vue({data:{name:'lzb'}})
let nextVnode = render2.call(vm2)

setTimeout(()=>{
    patch(preVnode,nextVnode)
    // let newEl = createElm(nextVnode)
    // el.parentNode.replaceChild(newEl,el)
},1000)



export default Vue