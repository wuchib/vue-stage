import initState from "./state";
export function initMixin(Vue){
    Vue.prototype._init = function (options){
        // vue  vm.$options 获取用户的配置
        const vm = this;  //保留this
        vm.$options = options //将选项挂载在vue实例上的$options

        // 初始化状态
        initState(vm)

    }
}
