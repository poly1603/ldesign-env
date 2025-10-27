import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue')
    },
    {
      path: '/environments',
      name: 'Environments',
      component: () => import('../views/Environments.vue')
    },
    {
      path: '/config',
      name: 'Config',
      component: () => import('../views/ConfigEditor.vue')
    },
    {
      path: '/diff',
      name: 'Diff',
      component: () => import('../views/Diff.vue')
    },
    {
      path: '/keys',
      name: 'Keys',
      component: () => import('../views/KeyManagement.vue')
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/Settings.vue')
    }
  ]
})

export default router

