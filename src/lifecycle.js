import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom";
import { patch } from "./vdom/patch";


export function initLifeCycle(Vue) {
    // 将vnode转化成真实dom
    Vue.prototype._update = function (vnode) {
        const vm = this
        const el = vm.$el
        const preVnode = vm._vnode
        vm._vnode = vnode //把组件第一次产生的虚拟节点保存到_vnodea上 
        if(preVnode){ // 之前渲染过
            vm.$el = patch(preVnode,vnode)
        }else{ //之前没渲染过,传入真实DOM,在patch里面会直接创建新的虚拟ODM
            vm.$el = patch(el, vnode)
        }   
    }

    // _c('div',{},...children)
    Vue.prototype._c = function () {
        return createElementVNode(this, ...arguments)
    }
    // _v(text)
    Vue.prototype._v = function () {
        return createTextVNode(this, ...arguments)
    }
    Vue.prototype._s = function (value) {
        if (typeof value !== 'object') return value
        return JSON.stringify(value) //底层的JSON.stringfy返回完整的对象.
    }


    Vue.prototype._render = function () {
        // 渲染时候会去实例取值,就将属性和视图绑定在一起
        return this.$options.render.call(this); // 通过ast语法转义后生成的render方法
    }
}



//挂载
export function mountComponent(vm, el) {
    vm.$el = el // 这里的el 是通过querySelector选择处理过的,我们要挂载到的位置

    // 1.调用render方法产生虚拟节点 虚拟DOM
    const updateComponent = () => {
        vm._update(vm._render());
    }
    new Watcher(vm, updateComponent, true) //true用于标识是一个渲染watcher

    // 2.根据虚拟DOM产生真实DOM

    // 3.插入到el元素中

}
// vue核心流程 1） 创造了响应式数据  2） 模板转换成ast语法树  
// 3) 将ast语法树转换了render函数 4) 后续每次数据更新可以只执行render函数 (无需再次执行ast转化的过程)
// render函数会去产生虚拟节点（使用响应式数据）
// 根据生成的虚拟节点创造真实的DOM

export function callHook(vm, hook) { //调用钩子函数
    const handlers = vm.$options[hook]
    if (handlers) {
        handlers.forEach(handlers => handlers.call(vm))
    }
}