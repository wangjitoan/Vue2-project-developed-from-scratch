import { nextTick} from '../utils'
let queue = []
let has = {}
let pending=false
export function queueWatcher(watcher) { 
    let id = watcher.id
    if (!has[id]) {
        has[id] = true
        queue.push(watcher)
        if (!pending) { 
            nextTick(flushschedulerQueue);
            pending=true
        }
     }
}
function flushschedulerQueue() {
     queue.forEach((watcher) => watcher.run());
     queue = [];
     pending = false;
     has = {};
 }