import { isSameVnode} from './index'
// 兼容创建和更新的情况
export function patch(oldVnode, vnode) {
    const isRealNode = oldVnode.nodeType
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
          const el = (vnode.el = oldVnode.el);
          // 文本类型
          if (!oldVnode.tag) {
            if (oldVnode.text !== vnode.text) {
              return (el.textContent = vnode.text);
            } else {
              return;
            }
          }
          updateProperties(vnode, oldVnode?.data?.attrs);
          // 处理子节点的diff策略
            let oldChildren = oldVnode.children || [];
            let newChildren = vnode.children || [];
            if (oldChildren.length === 0 && newChildren.length > 0) {
                newChildren.forEach(child => {
                    let childElm = createElm(child)
                    el.appendChild(childElm)
                })
            } else if (oldChildren.length > 0 && newChildren.length === 0) {
                el.innerHTML = ''
            } else {  
                // 新老节点都有儿子
                 updateChildren(el, oldChildren, newChildren); 
            }
        } else { 
            // 不是同一个节点
            // console.log("不是同一个节点", oldVnode)
            // TODO 返回被替换的旧节点，后续操作
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
export function updateChildren(el, oldChildren, newChildren) {
    function makeKeyByIndex(oldChildren) {
          let map = {};
          oldChildren.forEach((children, index) => {
            map[children.key] = index;
          });
          return map;
    }
    let mapping = makeKeyByIndex(oldChildren);
    let oldStartIndex = 0
    let oldEndIndex = oldChildren.length - 1
    let oldStartVnode = oldChildren[0]
    let oldEndVnode = oldChildren[oldEndIndex  ]
    
    let newStartIndex = 0
    let newEndIndex = newChildren.length - 1 
    let newStartVnode = newChildren[0] 
    let newEndVnode = newChildren[newEndIndex  ] 
    while (oldStartIndex < oldEndIndex && newStartIndex < newEndIndex) {  
            // 循环开始，优先处理 oldStartVnode 和 oldEndVnode 为空的情况
            // 原因：之前节点被移走时，原始位置被置空为undefined，处理时需要跳过
            if (!oldStartVnode) {
                oldStartVnode
                    = oldChildren[++oldStartIndex];
            } else if (!oldEndVnode) {
                oldEndVnode = oldChildren[--oldEndIndex]
            } else if(isSameVnode(oldStartVnode, newStartVnode)) {
            patch(oldStartVnode, newStartVnode);
            oldStartVnode = oldChildren[++oldStartIndex];
            newStartVnode = newChildren[++newStartIndex];
        } else if (isSameVnode(oldEndVnode, newEndVnode)) {
            patch(oldEndVnode, newEndVnode);
            oldEndVnode = oldChildren[--oldEndIndex];
            newEndVnode = newChildren[--newEndIndex];
        } else if (isSameVnode(newStartVnode, oldEndVnode)) {
            // 新头和旧尾相同 
            patch(oldEndVnode, newStartVnode);
            el.insertBefore(oldEndVnode.el, oldStartVnode.el); // 将尾部插入到头部
            newStartVnode = newChildren[++newStartIndex];
            oldEndVnode = oldChildren[--oldEndIndex];
        } else if (isSameVnode(oldStartVnode, newEndVnode)) {
            // 新尾和旧头相同
            patch(oldStartVnode, newEndVnode);
            el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
            newEndVnode = newChildren[--newEndIndex];
            oldStartVnode = oldChildren[++oldStartIndex];
        } else { 
            // 以上四种情况不符合，进行乱序排序
            // debugger
            let moveIndex = mapping[newStartVnode.key]
            if (!moveIndex) {
                // 没有可复用的老节点 
                el.insertBefore(createElm(newStartVnode), oldStartVnode.el)
            } else { 
                // debugger
                let moveVnode = oldChildren[moveIndex];
                  
                el.insertBefore(moveVnode.el, oldStartVnode.el);
                patch(moveVnode,newStartVnode);
                oldChildren[moveIndex]=undefined

                }
                
                newStartVnode = newChildren[++newStartIndex]
                
        }

    }  
    if (newStartIndex <= newEndIndex) {
        let anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null
        for (let i = newStartIndex; i <= newEndIndex; i++) {
             el.insertBefore(createElm(newChildren[i]), anchor)
        }
    } 
    if (oldStartIndex <= oldEndIndex) {
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {  
             oldChildren[i]&&el.removeChild(oldChildren[i].el);
        }
     }

 }