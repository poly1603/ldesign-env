<template>
  <div>
    <n-card title="环境管理">
      <template #header-extra>
        <n-button type="primary" @click="showCreateModal = true">创建环境</n-button>
      </template>

      <n-data-table :columns="columns" :data="environments" :pagination="false" />
    </n-card>

    <!-- 创建环境对话框 -->
    <n-modal v-model:show="showCreateModal" preset="dialog" title="创建环境">
      <n-form ref="formRef" :model="formData">
        <n-form-item label="环境名称" path="name" required>
          <n-input v-model:value="formData.name" placeholder="例如: staging" />
        </n-form-item>
        <n-form-item label="描述" path="description">
          <n-input v-model:value="formData.description" type="textarea" />
        </n-form-item>
        <n-form-item label="克隆自" path="source">
          <n-select v-model:value="formData.source" :options="envOptions" clearable />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space>
          <n-button @click="showCreateModal = false">取消</n-button>
          <n-button type="primary" @click="handleCreate">创建</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed, onMounted } from 'vue'
import {
  NCard,
  NButton,
  NDataTable,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSpace,
  NTag,
  useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { environmentsApi } from '@/api/environments'

const message = useMessage()

const environments = ref<any[]>([])
const showCreateModal = ref(false)
const formData = ref({
  name: '',
  description: '',
  source: null as string | null
})

const envOptions = computed(() => 
  environments.value.map(env => ({ label: env.name, value: env.name }))
)

const columns: DataTableColumns<any> = [
  {
    title: '环境名称',
    key: 'name',
    render: (row) => h(NTag, { type: row.isCurrent ? 'success' : 'default' }, { default: () => row.name })
  },
  {
    title: '描述',
    key: 'description'
  },
  {
    title: '父环境',
    key: 'parent'
  },
  {
    title: '创建时间',
    key: 'createdAt'
  },
  {
    title: '操作',
    key: 'actions',
    render: (row) => h(NSpace, null, {
      default: () => [
        !row.isCurrent && h(NButton, { size: 'small', onClick: () => activateEnv(row.name) }, { default: () => '激活' }),
        h(NButton, { size: 'small', onClick: () => cloneEnv(row.name) }, { default: () => '克隆' })
      ]
    })
  }
]

async function loadEnvironments() {
  try {
    const res = await environmentsApi.list()
    environments.value = res.data
  } catch (error) {
    message.error('加载失败: ' + (error as Error).message)
  }
}

async function activateEnv(name: string) {
  try {
    await environmentsApi.activate(name)
    message.success(`已激活 ${name}`)
    await loadEnvironments()
  } catch (error) {
    message.error('激活失败: ' + (error as Error).message)
  }
}

async function cloneEnv(name: string) {
  formData.value.source = name
  showCreateModal.value = true
}

async function handleCreate() {
  if (!formData.value.name) {
    message.error('请输入环境名称')
    return
  }

  try {
    if (formData.value.source) {
      await environmentsApi.clone(formData.value.source, formData.value.name, formData.value.description)
    }
    message.success('创建成功')
    showCreateModal.value = false
    formData.value = { name: '', description: '', source: null }
    await loadEnvironments()
  } catch (error) {
    message.error('创建失败: ' + (error as Error).message)
  }
}

onMounted(() => {
  loadEnvironments()
})
</script>

