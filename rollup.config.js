// 默认导出对象，作为打包的配置文件
import babel from 'rollup-plugin-babel'
export default {
    input:'./src/index.js', //入口
    output:{
        file:'./dist/vue.js', //出口
        name:'Vue',
        format:'umd', // esm es6模块 commonjs模块 iife自执行函数 umd
        sourcemap:true, // 希望可以调试源代码
    },
    Plugin:[
        babel({
            exclude:'node_modules/**', //排除node_modules所有文件
        })
    ]
}