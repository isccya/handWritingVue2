import { mergeOptions } from "./utils";

export function initGlobalAPI(Vue) {
   

    Vue.options = {} //上面是合并后的配置

    Vue.mixin = function (mixin) {
        // 将用户的选项和全局options进行合并
        this.options = mergeOptions(this.options, mixin)
        return this
    }
}