 // 静态方法 
 const strats = {};
 const LIFECYCLE = [
     'beforeCreate',
     'created'
 ]
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
