import { parseHTML } from "./parse";

export function compileToFunction(template) {

    // 1.将template转换为AST语法树
    let ast = parseHTML(template)
    console.log(ast);
    // 2.生成render方法(render方法执行后返回的是虚拟DOM)
}