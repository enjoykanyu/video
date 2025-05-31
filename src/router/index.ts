import { createRouter, createWebHistory } from 'vue-router'
// import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/VideoApp.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../components/auth/LoginRegister.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/live',
      name: 'live',
      component: () => import('../components/live/LiveStream.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/shop',
      name: 'shop',
      component: () => import('../components/shop/ShopHome.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/music',
      name: 'music',
      component: () => import('../components/music/MusicPlayer.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// // 全局前置守卫
// router.beforeEach((to, from, next) => {
//   const authStore = useAuthStore()
//   const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
//
//   if (requiresAuth && !authStore.isLoggedIn()) {
//     // 需要登录但未登录，重定向到登录页
//     next({
//       path: '/auth',
//       query: { redirect: to.fullPath }
//     })
//   } else if (to.path === '/auth' && authStore.isLoggedIn()) {
//     // 已登录但访问登录页，重定向到首页
//     next({ path: '/' })
//   } else {
//     next()
//   }
// })

export default router
