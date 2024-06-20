import Vue from 'vue'
import store from '@js/store'
import Router from 'vue-router'
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
import layout from '@com/layout'
import cart from '@/components/cart/cart'

const imp = ((path,url) =>{
    if(url){
        return () =>import('@com/'+path)
    }else{
        return () =>import('@pon/'+path)
    }
})

Vue.use(Router)

const routes = [
    {path: '/login',name: '登录',component: imp('login',1),meta:{r: true}},
    {path: '/register',name: '注册',component: imp('register',1),meta:{r: true}},
    {
        component: layout,
        path: '/home',
        children: [
            {path: '/home',name: '海鲜市场',component: imp('home',1)},
            {path: '/cart',name: '我的购物车',component: imp('cart/cart')},
            {path: '/order',name: '我的订单',component: imp('order/order')},
            {path: '/manage',name: '后台管理',component: imp('manage')},
            {path: '/manage/order',name: '订单管理',component: imp('manage/order')},
            {path: '/manage/seafood',name: '海鲜管理',component: imp('manage/seafood')},
            {path: '/manage/user',name: '用户管理',component: imp('manage/user')}
        ]
    },

    {path: '*/', redirect: '/home'}

]

const router = new Router({
    routes,
    linkActiveClass: 'active',
    linkExactActiveClass: 'active'
})

router.beforeEach((to, from, next) => {
    if(!to.meta.r){
        if(store.getters.getInfo){
            next();
        }else{
            next({path: '/login'})
        }
    }else{
        next();
    }
    if(to.name){
        document.title = to.name + '-' + '海鲜市场批发交易系统'
    }
})

export default router