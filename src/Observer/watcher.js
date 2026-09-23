import Dep from './Dep'
class Watcher { 
    constructor(vm, fn, cb, options) {
        this.vm = vm
        this.fn = fn
        this.cb=cb
        this.getter = fn
        this.get()

    }
    get() { 
        Dep.target=this.vm
        this.getter()
        Dep.target=null
    }
}
export default Watcher