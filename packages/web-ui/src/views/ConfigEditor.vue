<template>
  <div>
    <n-card title="配置编辑器">
      <template #header-extra>
        <n-space>
          <n-select v-model:value="selectedEnv" :options="envOptions" style="width: 200px" @update:value="loadConfig" />
          <n-button type="primary" @click="handleSave">保存</n-button>
          <n-button @click="handleValidate">验证</n-button>
        </n-space>
      </template>

      <n-space vertical>
        <n-form v-if="config" :model="config" label-placement="left" label-width="200px">
          <n-form-item v-for="(value, key) in config" :key="key" :label="String(key)">
            <n-input v-model:value="config[key]" :type="isSecret(String(key)) ? 'password' : 'text'" />
          </n-form-item>
        </n-form>

        <n-empty v-else description="请选择环境" />
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
  NForm,
  NFormItem,
  NInput,
  NEmpty,
  useMessage
} from 'naive-ui'
import { environmentsApi } from '@/api/environments'
import { configApi } from '@/api/config'

const message = useMessage()

const environments = ref<any[]>([])
const selectedEnv = ref<string>()
const config = ref<Record<string, any> | null>(null)
const schema = ref<any>(null)

const envOptions = computed(() =>
  environments.value.map(env => ({ label: env.name, value: env.name }))
)

function isSecret(key: string): boolean {
  if (!schema.value) return false
  return schema.value[key]?.secret === true
}

async function loadEnvironments() {
  try {
    const res = await environmentsApi.list()
    environments.value = res.data
    if (res.current) {
      selectedEnv.value = res.current
      await loadConfig()
    }
  } catch (error) {
    message.error('加载环境失败: ' + (error as Error).message)
  }
}

async function loadConfig() {
  if (!selectedEnv.value) return

  try {
    const res = await environmentsApi.get(selectedEnv.value)
    config.value = res.data.config
    schema.value = res.data.schema
  } catch (error) {
    message.error('加载配置失败: ' + (error as Error).message)
  }
}

async function handleSave() {
  if (!selectedEnv.value || !config.value) return

  try {
    await configApi.batchUpdate(selectedEnv.value, config.value)
    message.success('保存成功')
  } catch (error) {
    message.error('保存失败: ' + (error as Error).message)
  }
}

async function handleValidate() {
  if (!selectedEnv.value) return

  try {
    const res = await configApi.validate(selectedEnv.value)
    if (res.data.valid) {
      message.success('验证通过')
    } else {
      message.error(`验证失败: ${res.data.errors.length} 个错误`)
    }
  } catch (error) {
    message.error('验证失败: ' + (error as Error).message)
  }
}

onMounted(() => {
  loadEnvironments()
})
</script>

