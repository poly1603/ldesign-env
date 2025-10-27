<template>
  <div>
    <n-card title="密钥管理">
      <n-space vertical>
        <n-alert type="warning" title="安全提示">
          加密密钥用于保护敏感配置，请妥善保管，不要提交到版本控制系统。
        </n-alert>

        <n-divider />

        <n-space vertical>
          <n-button type="primary" @click="generateKey">生成新密钥</n-button>

          <n-input
            v-if="generatedKey"
            v-model:value="generatedKey"
            type="textarea"
            :rows="3"
            readonly
            placeholder="生成的密钥"
          />

          <n-button v-if="generatedKey" @click="copyKey">复制密钥</n-button>
        </n-space>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  NCard,
  NSpace,
  NAlert,
  NDivider,
  NButton,
  NInput,
  useMessage
} from 'naive-ui'
import client from '@/api/client'

const message = useMessage()

const generatedKey = ref<string>()

async function generateKey() {
  try {
    const res: any = await client.post('/crypto/generate-key')
    generatedKey.value = res.data.key
    message.success('密钥已生成')
  } catch (error) {
    message.error('生成失败: ' + (error as Error).message)
  }
}

async function copyKey() {
  if (!generatedKey.value) return

  try {
    await navigator.clipboard.writeText(generatedKey.value)
    message.success('已复制到剪贴板')
  } catch (error) {
    message.error('复制失败')
  }
}
</script>

