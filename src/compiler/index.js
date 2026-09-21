import { parserHTML, generate } from "./parse.js";
export function compileToFunction(template) {
    const ast = parserHTML(template) 
    let code = generate(ast);
    console.log('ast', code);
    const render = new Function(`with(this){return  ${code} }`)
    console.log(render.toString())
}