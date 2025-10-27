<template>
  <div>
    <n-card title="设置">
      <n-space vertical>
        <n-form-item label="项目目录">
          <n-input value="当前工作目录" readonly />
        </n-form-item>

        <n-form-item label="Schema 路径">
          <n-input value=".env.schema.json" readonly />
        </n-form-item>

        <n-divider />

        <n-space>
          <n-button>导出配置</n-button>
          <n-button>导入配置</n-button>
          <n-button type="error">清除缓存</n-button>
        </n-space>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import {
  NCard,
  NSpace,
  NFormItem,
  NInput,
  NDivider,
  NButton
} from 'naive-ui'
</script>

