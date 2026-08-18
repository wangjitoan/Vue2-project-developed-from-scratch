const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`);
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
      console.log("设置root为", element,JSON.parse(JSON.stringify(element)));
      root = element;
    }
    stack.push(element);
  }
  function end(name) {
    console.log("发射匹配到的结束标签-end,tagName = " + name);
    const node = stack.pop();
    if (node.tag !== name) console.log("标签不匹配");
  }
  function text(chars) {
    console.log("发射匹配到的文本-text,chars = " + chars);
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
  console.log("parserHTML-ast : "  , ast);
}
