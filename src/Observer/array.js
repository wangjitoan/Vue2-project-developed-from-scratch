let oldArrayPrototype = Array.prototype;
export let newArrayMethods=Object.create(oldArrayPrototype)
let methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];
methods.forEach(method => {
    
    newArrayMethods[method] = function (...args) { 
         
        oldArrayPrototype[method].call(this, ...args)
        let ob=this.__ob__
        let inserters = null
        switch (method) { 
            case 'splice':
                inserters=args.splice(2)
            case 'push':
            case 'unshift':
                inserters = args
            break
        }
        
        // console.log(`重写${method}方法`, inserters)
        if (inserters)ob.objectArray(inserters)
    }
})