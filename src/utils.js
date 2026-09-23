export function isFunction(val) {
  return typeof val === "function";
}
export function isObject(val) {
  return typeof val === "object";
}
export function isArray(val) { 
  return Array.isArray(val)
}
export function nextTick(fn) {  
  callBacks.push(fn)
  if (!waiting) { 
    Promise.resolve().then(flushsCallbacks);
    waiting = true
  }
}
// 回调函数数组统一排队
let callBacks=[]
let waiting = false
// 执行
function flushsCallbacks() { 
  callBacks.forEach(item => item())
  callBacks = []
  waiting=false
}