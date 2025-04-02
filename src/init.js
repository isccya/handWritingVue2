import { initState } from './state'
import { compileToFunction } from './compiler';
import { callHook, mountComponent } from './lifecycle'
import { mergeOptions } from './utils';

export function initMixin(Vue) { //给Vue添加init方法
    Vue.prototype._init = function (options) { //初始化操作
        const vm = this;
        vm.$options = mergeOptions(this.constructor.options, options); //将用户选项挂载到实例上(mixin方法可能添加了全局的选项)
        // 初始化状态
        callHook(vm, 'beforeCreate')
        initState(vm)
        callHook(vm, 'created')
        if (options.el) { // 先判断用户有无传入el,传入el的话在new实例化时候会立即进入编辑状态.否则需要$mount手动挂载.
            vm.$mount(options.el) //实现数据的挂载
        }
    }
    Vue.prototype.$mount = function (el) {
        const vm = this
        el = document.querySelector(el)
        let ops = vm.$options
        /**
         * 
         * 
         * render==>template==>el.outerHTML
         * 
         * 
         * */
        if (!ops.render) { //先查找一下有没有写render函数
            let template; //没有render看一下是否写了template,没写template采用外部的template
            if (!ops.template && el) { //没有写template,拿$mount挂载的元素.
                template = el.outerHTML
            } else {
                template = ops.template //写了template
            }
            if (template) { //有模板就挂载
                // 这里需要对模板进行编译,即生成AST树,根据AST树代码生成渲染函数.
                const render = compileToFunction(template);
                ops.render = render
            }
        }
        mountComponent(vm, el); //组件的挂载

    }
}
