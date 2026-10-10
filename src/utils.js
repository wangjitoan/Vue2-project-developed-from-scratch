export function isFunction(val) {
  return typeof val === "function";
}
export function isObject(val) {
  // 数组 对象都是该类型
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
export function mergeOptions(parentVal, childVal) { 
  let options = {}
  // 先合并老的
  for (let key in parentVal) { 
    mergeFiled(key)
  }
  for (let key in childVal) { 
    if (!parentVal.hasOwnProperty(key)) { 
      mergeFiled(key)
    }
  }
  
  function mergeFiled(key) {
    // 合并策略决定mixin会将data\methods\components覆盖
    // 生命周期不会被覆盖
    if (strats[key]) {
      options[key] = strats[key](parentVal[key], childVal[key]);
    }
    else { options[key] = parentVal[key] || childVal[key]; }
  }
  return options
}

  // 生命周期策略
let strats = {};  
let lifeCycle = ['beforeCreate', 'created', 'beforeMount',
  'mounted', 'beforeUpdate', 'updated',
  'beforeDestroy', 'destroyed']
lifeCycle.forEach(hook => { 
  strats[hook] = function (parentVal, childVal) { 
    if (childVal) { 
      if (parentVal) { 
        // 父有值，必是数组
        return parentVal.concat(childVal)
      } else {
        if (isArray(childVal)) {
          return childVal
        } else { 
          return [childVal]
        }
      }
    }
    else return parentVal
  }
})