import { initState } from './state' 
import { compileToFunction } from './compiler';
export function initMixin(Vue){ //给Vue添加init方法
    Vue.prototype._init = function(options){ //初始化操作
        const vm = this;
        vm.$options = options; //将用户选项挂载到实例上

        // 初始化状态
        initState(vm)
        if(options.el){
            vm.$mount(options.el) //实现数据的挂载
        }
    }
    Vue.prototype.$mount = function(el){
        const vm = this
        el = document.querySelector(el)
        let ops = vm.$options
        // render==>template==>el.outerHTML
        if(!ops.render){ //先查找一下有没有写render函数
            let template; //没有render看一下是否写了template,没写template采用外部的template
            if(!ops.template && el){ //没有写模板,但写了el
                template = el.outerHTML
            }else{
                if(el){
                    template = ops.template //如果有el,则采用模板内容
                }
            }
            // 写了template就用写了的template
            if(template){
                // 这里需要对模板进行编译
                const render = compileToFunction(template);
                ops.render = render
            }        
        }
        mountComponent(vm,el); //组件的挂载

    }
}
