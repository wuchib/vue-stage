import { observe } from "./observe/index";
function initState(vm){
    const opts = vm.$options;
    if(opts.data){
        initData(vm)
    }
}

function proxy(vm,target,key){
    Object.defineProperty(vm,key,{
        get(){
            return vm[target][key]
        },
        set(newVal){
            vm[target][key] = newVal
        }
    })
} 

function initData(vm){
    let data = vm.$options.data; // 可能是函数可能是对象
    data = typeof data === 'function' ? data.call(vm) : data
    vm._data = data
    //  对数据进行劫持 vue2 里采用了 defineProperty
    observe(data)

    // 将vm._data 用vm来代理就可以了
    for(let key in data){
        proxy(vm,'_data',key)
    }
}

export default initState