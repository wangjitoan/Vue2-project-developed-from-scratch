import { parserHTML, generate } from "./parse.js";
export function compileToFunction(template) {
    const ast = parserHTML(template)
    let code = generate(ast);
}