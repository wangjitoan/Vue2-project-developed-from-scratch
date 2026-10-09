import { nextTick } from '../utils'
import { callHook} from '../lifecycle'
let queue = []
let has = {}
let pending=false
export function queueWatcher(watcher) { 
    let id = watcher.id
    if (!has[id]) {
        has[id] = true
        queue.push(watcher)
        if (!pending) { 
            debugger
            nextTick(flushschedulerQueue);
            pending=true
        }
     }
}
function flushschedulerQueue() {  
  // callHook('beforeUpdate')
  queue.forEach((watcher) => watcher.run());
  queue = [];
  pending = false;
  has = {};
  // callHook('updated')
}