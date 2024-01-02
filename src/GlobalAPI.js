import { mergeOptions } from "./utils";

export function initGlobalAPI(Vue) {
   

    Vue.options = {
        _base : Vue
    } //上面是合并后的配置

    Vue.mixin = function (mixin) {
        // 将用户mixin的选项和全局options进行合并(这里this就是构造函数Vue)
        this.options = mergeOptions(this.options, mixin)
        return this
    }

    Vue.extend = function(options){
        // 根据用户参数返回一个Vue的子类的构造函数.(extend时候可以传参数)
        function Sub(options = {}){ //最终使用一个组件,就是new一个实例
            this._init(options) //默认对子类初始化操作
        }
        Sub.prototype = Object.create(Vue.prototype) // VueComponent.prototype.__proto__ === Vue.prototype,让组件实例对象（vc）可以访问到 Vue 原型上的属性、方法
        Sub.prototype.constructor = Sub

        // 将用户传递的参数和全局Vue.options来合并
        Sub.options = mergeOptions(Vue.options,options) //保存用户的选项到组件实例上
        return Sub;
    }


    Vue.options.components ={} // 全局组件存储的位置.
    Vue.component = function (id,definition){ //创建全局组件

        // 如果definition已经是一个函数,证明用户自己调用了Vue.extend

        definition = typeof definition === 'function' ? definition : Vue.extend(definition)
        Vue.options.components[id] = definition
    }
}