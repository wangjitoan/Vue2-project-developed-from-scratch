export function createElement(vm, tag, data = {}, ...children) {  
    return vnode(vm,tag,data,...children,data?.attrs?.key,undefined)

}
export function createText(vm,text) { 
    return vnode(vm, undefined, undefined, undefined, undefined, text);
}

export function vnode(vm, tag, data, children, key, text) { 
    
    return {
        vm,
        tag,
        data,
        children,
        key,
        text
    }
}
export function isSameVnode(oldVnode, newVnode) {  
    // debugger
    return oldVnode?.tag===newVnode?.tag && oldVnode.key===newVnode.key
}