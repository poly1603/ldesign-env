<template>
  <div>
    <n-space vertical :size="24">
      <n-card title="🎯 快速概览">
        <n-space vertical>
          <n-statistic label="当前环境" :value="currentEnv || '未设置'" />
          <n-statistic label="环境总数" :value="environments.length" />
          <n-statistic label="配置项数" :value="configCount" />
        </n-space>
      </n-card>

      <n-card title="📋 环境列表">
        <n-space vertical>
          <n-space v-for="env in environments" :key="env.name">
            <n-tag :type="env.isCurrent ? 'success' : 'default'" size="large">
              {{ env.name }}
            </n-tag>
            <n-button v-if="!env.isCurrent" size="small" @click="switchEnv(env.name)">
              切换
            </n-button>
          </n-space>
        </n-space>
      </n-card>

      <n-card title="⚡ 快速操作">
        <n-space>
          <n-button type="primary" @click="$router.push('/config')">编辑配置</n-button>
          <n-button @click="$router.push('/diff')">对比环境</n-button>
          <n-button @click="$router.push('/environments')">管理环境</n-button>
        </n-space>
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NCard, NSpace, NStatistic, NTag, NButton, useMessage } from 'naive-ui'
import { environmentsApi } from '@/api/environments'

const message = useMessage()

const environments = ref<any[]>([])
const currentEnv = ref<string>()
const configCount = ref(0)

async function loadData() {
  try {
    const res = await environmentsApi.list()
    environments.value = res.data
    currentEnv.value = res.current

    if (currentEnv.value) {
      const envData = await environmentsApi.get(currentEnv.value)
      configCount.value = Object.keys(envData.data.config || {}).length
    }
  } catch (error) {
    message.error('加载数据失败: ' + (error as Error).message)
  }
}

async function switchEnv(name: string) {
  try {
    await environmentsApi.activate(name)
    message.success(`已切换到 ${name} 环境`)
    await loadData()
  } catch (error) {
    message.error('切换失败: ' + (error as Error).message)
  }
}

onMounted(() => {
  loadData()
})
</script>

