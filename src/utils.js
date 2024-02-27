 // 静态方法 
 const strats = {};
 const LIFECYCLE = [
     'beforeCreate',
     'created'
 ]
//  生命周期的策略模式.返回一个数组,父的在前.
 LIFECYCLE.forEach(hook => {
     strats[hook] = function (p, c) {
         if (c) {
             if (p) { //如果儿子有,父亲有,拼在一起
                 return p.concat(c)
             } else {
                 return [c]
             }
         } else {
             return p //如果没有儿子,则用父亲的即可
         }
     }
 })

// 组件的策略模式.也是优先使用孩子组件,通过原型访问父组件.
 strats.components = function(parentVal,childVal){
    const res = Object.create(parentVal)
    if(childVal){
        for(let key in childVal){
            res[key] = childVal[key] //返回的是构造的对象,可以拿到父亲原型上的属性,并且将儿子拷贝到对象上.(!!组件会形成原型的层层嵌套!!)
        }
    }
    return res
 }

export function mergeOptions(parent, child) {
    const options = {}
    for (let key in parent) {
        mergeField(key)
    }
    for (let key in child) {
        if (!parent.hasOwnProperty(key)) {
            mergeField(key)
        }
    }
    // mergeField优先使用孩子属性.
    function mergeField(key) {
        // 用策略模式减少if else
        if (strats[key]) {
            options[key] = strats[key](parent[key], child[key])
        } else {
            options[key] = child[key] || parent[key]
        }
    }
    return options
}
