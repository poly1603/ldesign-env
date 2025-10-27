<template>
  <n-config-provider :theme="darkTheme">
    <n-message-provider>
      <n-dialog-provider>
        <n-layout style="height: 100vh">
          <n-layout-header bordered style="height: 64px; padding: 0 24px; display: flex; align-items: center">
            <div style="display: flex; align-items: center; gap: 12px">
              <h2 style="margin: 0; font-size: 20px">🔧 LDesign Env</h2>
              <n-tag size="small" type="info">v1.0.0</n-tag>
            </div>
            <div style="flex: 1"></div>
            <n-space>
              <n-button text @click="toggleTheme">
                <template #icon>
                  <n-icon><moon-icon v-if="!isDark" /><sun-icon v-else /></n-icon>
                </template>
              </n-button>
            </n-space>
          </n-layout-header>

          <n-layout has-sider style="height: calc(100vh - 64px)">
            <n-layout-sider
              bordered
              :width="240"
              :collapsed-width="64"
              :collapsed="collapsed"
              show-trigger
              @collapse="collapsed = true"
              @expand="collapsed = false"
            >
              <n-menu
                :value="activeKey"
                :options="menuOptions"
                :collapsed="collapsed"
                :collapsed-width="64"
                :collapsed-icon-size="22"
                @update:value="handleMenuSelect"
              />
            </n-layout-sider>

            <n-layout-content style="padding: 24px">
              <router-view />
            </n-layout-content>
          </n-layout>
        </n-layout>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NConfigProvider,
  NLayout,
  NLayoutHeader,
  NLayoutSider,
  NLayoutContent,
  NMenu,
  NSpace,
  NButton,
  NIcon,
  NTag,
  NMessageProvider,
  NDialogProvider,
  darkTheme
} from 'naive-ui'
import {
  Home as HomeIcon,
  Settings as SettingsIcon,
  List as ListIcon,
  Code as CodeIcon,
  Compare as CompareIcon,
  Key as KeyIcon,
  Moon as MoonIcon,
  Sun as SunIcon
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()

const collapsed = ref(false)
const isDark = ref(true)
const activeKey = computed(() => route.path)

const menuOptions = [
  {
    label: '概览',
    key: '/',
    icon: () => h(NIcon, null, { default: () => h(HomeIcon) })
  },
  {
    label: '环境管理',
    key: '/environments',
    icon: () => h(NIcon, null, { default: () => h(ListIcon) })
  },
  {
    label: '配置编辑',
    key: '/config',
    icon: () => h(NIcon, null, { default: () => h(CodeIcon) })
  },
  {
    label: '差异对比',
    key: '/diff',
    icon: () => h(NIcon, null, { default: () => h(CompareIcon) })
  },
  {
    label: '密钥管理',
    key: '/keys',
    icon: () => h(NIcon, null, { default: () => h(KeyIcon) })
  },
  {
    label: '设置',
    key: '/settings',
    icon: () => h(NIcon, null, { default: () => h(SettingsIcon) })
  }
]

function handleMenuSelect(key: string) {
  router.push(key)
}

function toggleTheme() {
  isDark.value = !isDark.value
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
}

#app {
  width: 100%;
  height: 100vh;
}
</style>

