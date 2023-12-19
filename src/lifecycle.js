import { createElementVNode, createTextVNode } from "./vdom";

// 创建真实DOM
function createElm(vnode){
    let {tag,data,children,text} = vnode;
    if(typeof tag == 'string'){ //元素节点
        vnode.el = document.createElement(tag)
        patchProps(vnode.el,data);
        children.forEach(child => {
            vnode.el.appendChild(createElm(child))
        });
    }else{ //文本节点
        vnode.el = document.createTextNode(text)
    }
    return vnode.el;
}
// 创建真实DOM中的元素节点时候添加元素属性
function patchProps(el,props){
    for(let key in props){
        if(key === 'style'){
            for(let styleName in props.style){
                el.style[styleName] = props.style[styleName]
            }
        }else{
            el.setAttribute(key,props[key])
        }
    }
}

function patch(oldVnode,vnode){
    // 写的是初渲染过程
    const isRealElement = oldVnode.nodeType
    if(isRealElement){
        const elm = oldVnode; //获取真实DOM
        const parentElm = elm.parentNode //拿到父元素
        const newElm = createElm(vnode) //创建新DOM
        parentElm.insertBefore(newElm,elm.nextSibling) //替换
        parentElm.removeChild(elm) //删除老节点

        return newElm
    }else{
        // diff算法
    }
}

export function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) { // 将vnode转化成真实dom
        const vm = this
        const el = vm.$el
    //既有初始化功能,又有更新的功能 
    vm.$el = patch(el,vnode)
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
        return JSON.stringify(value)
    }


    Vue.prototype._render = function () {
        // 渲染时候会去实例取值,就将属性和视图绑定在一起
        const vm = this;
        return this.$options.render.call(this); // 通过ast语法转义后生成的render方法
    }
}

export function mountComponent(vm, el) { //挂载
    vm.$el = el // 这里的el 是通过querySelector处理过的
    // 1.调用render方法产生虚拟节点 虚拟DOM
    vm._update(vm._render());

    // 2.根据虚拟DOM产生真实DOM 

    // 3.插入到el元素中

}
// vue核心流程 1） 创造了响应式数据  2） 模板转换成ast语法树  
// 3) 将ast语法树转换了render函数 4) 后续每次数据更新可以只执行render函数 (无需再次执行ast转化的过程)
// render函数会去产生虚拟节点（使用响应式数据）
// 根据生成的虚拟节点创造真实的DOM

