import Dep from './observe/dep.js';
import { observe } from './observe/index.js'
import Watcher from './observe/watcher.js';
export function initState(vm) {
    const opts = vm.$options;
    if (opts.data) {
        initData(vm);
    }
    if (opts.computed) {
        initComputed(vm)
    }
    if (opts.watch) {
        initWatch(vm)
    }
}

function initWatch(vm) {
    let watch = vm.$options.watch;
    for (let key in watch) {
        const handler = watch[key]//字符串 数组 函数
        if (Array.isArray(handler)) {
            for (let i = 0; i < handler.length; i++) {
                createWatcher(vm, key,handler[i])
            }
        }else{
            createWatcher(vm, key,handler)
        }
    }
}

function createWatcher(vm, key,handler) {
    //字符串 函数 (对象不考虑)
    if(typeof handler === 'string'){
        handler = vm[handler]
    }
    return vm.$watch(key,handler)
}

// 解决访问vm属性要vm_data.name这种写法,直接vm.name
function proxy(vm, target, key) {
    Object.defineProperty(vm, key, { //vm.name
        get() {
            return vm[target][key] //vm._data.name
        },
        set(newValue) {
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

function initComputed(vm) {
    const computed = vm.$options.computed; //获取用户传入的computed
    let watchers = vm._computedWachers = {} //将计算属性watcher保存到vm,因为后续还要访问属性的watcher
    for (let key in computed) {
        let userDef = computed[key]
        // 需要监控 计算属性中get的变化
        let fn = typeof userDef === 'function' ? userDef : userDef.get

        // 每一个计算属性创建一个watcher,fn不立刻执行(lazy为true),并将所有属性watcher放到对象中,对象放到组件实例上
        watchers[key] = new Watcher(vm, fn, { lazy: true }) //第一次设置为true,不会立即执行计算
        defineComputed(vm, key, userDef) //是vm,模板解析计算属性时候还是去实例身上取值,所以要把值defineProperty到vm上
    }
}

function defineComputed(target, key, userDef) {
    const setter = userDef.set || (() => { })
    Object.defineProperty(target, key, {
        get: createComputedGetter(key),
        set: setter
    })
}

// 计算属性不会收集依赖,只会让自己的依赖属性去收集依赖
function createComputedGetter(key) {//计算属性的getter方法
    // 我们要检测是否要执行这个getter
    return function () {
        const watcher = this._computedWachers[key] //获取到对应属性的watcher
        if (watcher.dirty) {//如果是脏,就去执行用户传入的参数
            watcher.evaluate() //求值后dirty变为false,下次就用缓存的值
        }
        if (Dep.target) { //计算属性watcher出栈后 计算属性里面的属性还要上一层让渲染watcher更新
            watcher.depend()
        }
        return watcher.value
    }
}
