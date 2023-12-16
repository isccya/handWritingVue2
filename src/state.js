import { observe } from './observe/index.js'
export function initState(vm) {
    const opts = vm.$options;
    if (opts.data) {
        initData(vm);
    }
}

// 解决访问vm属性要vm_data.name这种写法,直接vm.name
function proxy(vm,target, key) {
    Object.defineProperty(vm,key,{ //vm.name
        get(){
            return vm[target][key] //vm._data.name
        },
        set(newValue){
            vm[target][key] = newValue
        }
    })
}

function initData(vm) {
    let data = vm.$options.data; //data可能是函数,也可能是对象
    typeof data === 'function' ? data.call(vm) : data //data是用户返回的对象

    vm._data = data //将返回的对象放到了_data上
    // 对数据进行劫持 vue2里采用了一个api defineProperty
    observe(data)

    for (let key in data) {
        proxy(vm, '_data', key)
    }
}