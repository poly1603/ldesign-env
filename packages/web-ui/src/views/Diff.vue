<template>
  <div>
    <n-card title="环境差异对比">
      <n-space vertical>
        <n-space>
          <n-select v-model:value="envA" :options="envOptions" placeholder="选择环境 A" style="width: 200px" />
          <n-select v-model:value="envB" :options="envOptions" placeholder="选择环境 B" style="width: 200px" />
          <n-button type="primary" @click="loadDiff" :disabled="!envA || !envB">对比</n-button>
        </n-space>

        <n-divider />

        <div v-if="diff">
          <n-space vertical>
            <n-alert v-if="diff.added.length > 0" type="success" title="新增配置">
              {{ diff.added.join(', ') }}
            </n-alert>

            <n-alert v-if="diff.removed.length > 0" type="error" title="删除配置">
              {{ diff.removed.join(', ') }}
            </n-alert>

            <n-alert v-if="diff.modified.length > 0" type="warning" title="修改配置">
              <n-space vertical>
                <div v-for="item in diff.modified" :key="item.key">
                  <strong>{{ item.key }}:</strong>
                  <br />
                  <span style="color: red">- {{ item.from }}</span>
                  <br />
                  <span style="color: green">+ {{ item.to }}</span>
                </div>
              </n-space>
            </n-alert>

            <n-alert v-if="isIdentical" type="info" title="配置相同">
              两个环境的配置完全相同
            </n-alert>
          </n-space>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  NCard,
  NSpace,
  NSelect,
  NButton,
  NDivider,
  NAlert,
  useMessage
} from 'naive-ui'
import { environmentsApi } from '@/api/environments'

const message = useMessage()

const environments = ref<any[]>([])
const envA = ref<string>()
const envB = ref<string>()
const diff = ref<any>(null)

const envOptions = computed(() =>
  environments.value.map(env => ({ label: env.name, value: env.name }))
)

const isIdentical = computed(() => {
  if (!diff.value) return false
  return (
    diff.value.added.length === 0 &&
    diff.value.removed.length === 0 &&
    diff.value.modified.length === 0
  )
})

async function loadEnvironments() {
  try {
    const res = await environmentsApi.list()
    environments.value = res.data
  } catch (error) {
    message.error('加载环境失败: ' + (error as Error).message)
  }
}

async function loadDiff() {
  if (!envA.value || !envB.value) return

  try {
    const res = await environmentsApi.diff(envA.value, envB.value)
    diff.value = res.data
  } catch (error) {
    message.error('对比失败: ' + (error as Error).message)
  }
}

onMounted(() => {
  loadEnvironments()
})
</script>

