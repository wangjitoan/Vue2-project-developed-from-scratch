const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`);
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
// 匹配属性（索引 1 为属性 key、索引 3、4、5 其中一直为属性值）：aaa="xxx"、aaa='xxx'、aaa=xxx
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
// 匹配结束标签：>
const startTagClose = /^\s*(\/?)>/;
// 匹配结束标签，如： </div>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
export function parserHTML(html) {
  console.log("parserHTML-html : " + html);
  let root = null;
  let stack = [];
  function createAstElement(tag, attrs, parent) {
    return {
      tag, // 标签名
      type: 1, // 元素类型为 1
      children: [], // 儿子
      parent, // 父亲
      attrs, // 属性
    };
  }
  function start(name, attrs) {
    console.log(
      "发射匹配到的开始标签-start,tag = " +
        name +
        ",attrs = " +
        JSON.stringify(attrs),
    );
    const parent = stack[stack.length - 1];
 
    let element = createAstElement(name, attrs, parent);
      if (parent) {
        // element.parent = parent
        parent.children.push(element);
       
    }
    if (root === null) {
      // console.log("设置root为", element,JSON.parse(JSON.stringify(element)));
      root = element;
    }
    stack.push(element);
  }
  function end(name) {
    // console.log("发射匹配到的结束标签-end,tagName = " + name);
    const node = stack.pop();
    if (node.tag !== name) console.log("标签不匹配");
  }
  function text(chars) {
    // console.log("发射匹配到的文本-text,chars = " + chars);
    let parent = stack[stack.length - 1];
    chars = chars.replace(/\s/g, ""); // 将空格替换为空，即删除空格
    if (chars) {
      parent.children.push({
        type: 2, // 文本类型为 2
        text: chars,
      });
    }
  }
  function advance(len) {
    html = html.substring(len);
  }
  function parseStartTag() {
    let start = html.match(startTagOpen);
    if (start) {
      const match = {
        tag: start[1],
        attrs: [],
      };
      advance(start[0].length);
      // 处理属性
      let end;
      let attr;
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5],
        }); 
        advance(attr[0].length);
      }
      // 处理>标签
      if (end) {
        advance(end[0].length);
      } 
      return match;
    }
    return false;
  }
  while (html) {
    let index = html.indexOf("<");
    if (index === 0) {
      // 开始和结束标签的情况
      const startTagMatch = parseStartTag();
      if (startTagMatch) { 
        start(startTagMatch.tag, startTagMatch.attrs); 
        continue;
      }
      // 结束情况
      let endTagMatch;
      if ((endTagMatch = html.match(endTag))) {
        end(endTagMatch[1]);
        advance(endTagMatch[0].length);
        continue;
      }
    } else if (index > 0) {
      let chart = html.substring(0, index);
      text(chart);
      advance(chart.length);
    }
  }
  return root;
}

export function generate(ast) {
  console.log("parserHTML-ast : ", ast);
  let children = genChildren(ast); 
  let code = `_c( "${ast.tag}",  {attrs:${ast.attrs.length ? genProps(ast.attrs) : undefined}}, ${children ? children : ''}   )`;
  return code
}
/**
 * 生成属性字符串的函数
 * @param {Array} attrs - 属性数组，每个元素是一个包含name和value属性的对象
 * @returns {String} 返回格式化后的属性字符串
 */
function genProps(attrs) {
  let str = ''  // 用于拼接属性字符串的变量
  for (let i = 0; i < attrs.length; i++) {    // 遍历属性数组
    if (attrs[i].name === 'style') {  // 如果是style属性
      let styles = {};
      // 正则解析： 中间以分号隔开，两测不能有冒号(分割)和分号(结尾)
      attrs[i].value.replace(/([^;:]+):([^;:]+)/g, function () {
        // key：arguments[1]、value：arguments[2]
        styles[arguments[1]] = arguments[2];
      });  
      attrs[i].value = styles;
    }
    str += `${attrs[i].name}:${JSON.stringify(attrs[i].value)},`
     
  }
  
  return `{${str.slice(0,-1)}}`
}
function genChildren(el) {
  const children = el.children
  if (children?.length) { 
    let res = children.map(item => gen(item)).join(',')
    return res
  } 
  return false
  
}
function gen(el) {
  // 标签类型
  if (el.type === 1) {
    return generate(el)
  } else if (el.type === 2) {
    // 文本类型
    const text = el.text  
    if (!defaultTagRE.test(text)) {
      // 思索：既然是字符串化，为什么要使用JSON.stringify 而不使用String,区别在源码转义
      // 静态文本要包装成合法 JS 字符串字面量
      // String(val) 是类型转换：把任意值转成内存里的 JS 字符串，不是生成源码字面量。
      return `_v(${JSON.stringify(text)})`;
    } else { 
      let token=[]
      let index = defaultTagRE.lastIndex = 0
      let match  
      while (match = defaultTagRE.exec(text)) { 
        if (index < match.index) { 
          token.push( `${JSON.stringify(text.slice(index, match.index))}`)
        }
        token.push(`_s(${match[1]})`)
        index = match.index + match[0].length
      }
      if (index < text.length) { 
        token.push( `${JSON.stringify(text.slice(index, text.length))}`)
      }
      return  `_v(${token.join('+')})`
    }
   
    return el.text
  } else { 
    return false
  }
 }