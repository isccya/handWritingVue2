// rollup默认可以导出一个配置对象,作为打包的配置文件
import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'

export default {
    input: './src/index.js', //入口
    output: {
        file: './dist/vue.js',//出口
        name: "Vue", //global上添加一个属性为Vue
        format: "umd", //支持commonjs和amd
        sourcemap: true,//希望可以调试源代码
    },
    plugins:[
        babel({
            exclude:"node_modules/**" //排除node_modules所有文件,不用再将其转换为js
        }),
        resolve()
    ]
}