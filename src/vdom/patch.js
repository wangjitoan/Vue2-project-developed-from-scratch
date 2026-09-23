export function patch(el, vnode) {
    // 创建
    const dom = createElement(vnode)
    console.log('createElement', vnode)
    console.log(el.parentNode, "el");
    const parentNode = el.parentNode;
    const last = el.nextElementSibling
    parentNode.insertBefore(dom, last);
    parentNode.removeChild(el);
    return dom
}
function createElement(vnode) { 
    const { vm, tag, data, children, key, text } = vnode;
    if (typeof tag === 'string') {
        // 将真实节点和虚拟节点做映射
        vnode.el = document.createElement(tag);
        // 挂载属性
        updateProperties(vnode.el,data?.attrs)
        if (children.length) {  
            children.forEach((item) => vnode.el.appendChild(createElement(item)));
            
        }
        
    } else { 
        vnode.el = document.createTextNode(text); 
    }
    return vnode.el;
}

export function updateProperties(el, props = {}) {
    for (let key in props) { 
        let value = props[key];
        if (key === 'style') { 
            value=JSON.stringify(props[key])
        }
        el.setAttribute(key,value)
    }
    
}