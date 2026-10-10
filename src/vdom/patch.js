import { isSameVnode} from './index'
// 兼容创建和更新的情况
export function patch(oldVnode, vnode) {
    const isRealNode=oldVnode.nodeType
    if (isRealNode) {
        // 创建
        const dom = createElm(vnode);
        console.log("createElm", vnode );
        console.log(oldVnode.parentNode, "el");
        const parentNode = oldVnode.parentNode;
        const last = oldVnode.nextElementSibling;
        parentNode.insertBefore(dom, last);
        parentNode.removeChild(oldVnode);
        return dom;
    } else { 
        // 更新
        //  是同一个节点
        if (isSameVnode(oldVnode, vnode)) {
            // dom节点复用
            const el=vnode.el=oldVnode.el
            // 文本类型
            if (!oldVnode.tag) {
                 if (oldVnode.text !== vnode.text) {
                   return (el.textContent = vnode.text);
                 } else {
                   return;
                 }
            }  
            updateProperties(vnode, oldVnode?.data?.attrs); 
            console.log(vnode,"22222222")
            
        } else { 
            // 不是同一个节点
            // console.log("不是同一个节点", oldVnode)
            // 返回被替换的旧节点
            return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
        }
    }
}
export function createElm(vnode) { 
    const { vm, tag, data, children, key, text } = vnode;
    if (typeof tag === 'string') {
        // 将真实节点和虚拟节点做映射
        vnode.el = document.createElement(tag);
        // 挂载属性
        updateProperties(vnode,data?.attrs)
        if (children.length) {  
            children.forEach((item) => vnode.el.appendChild(createElm(item)));
            
        }
        
    } else { 
        vnode.el = document.createTextNode(text); 
    }
    return vnode.el;
}

export function updateProperties(vnode, oldProps = {}) {
  // 初次渲染和更新渲染情况
  const el = vnode.el;
  const newProps = vnode?.data?.attrs || {}
    const newStyle = newProps.style || {}
    const oldStyle = oldProps.style || {};
    for (let key in oldStyle) { 
        if (!newStyle[key]) { 
            el.style[key]=''
        }
    }
    for (let key in newProps) {
        if (key === 'style') {
            for (let styleKey in newStyle) { 
                el.style[styleKey]=newStyle[styleKey]
            }
         }
        else {
            let value = newProps[key];
            el.setAttribute(key, value);
        }
      
    }

  for (let key in oldProps) { 
        if (!newProps[key]) { 
            el.removeAttribute(key);
        }
    }
}