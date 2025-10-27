import client from './client'

export interface Environment {
  name: string
  isCurrent: boolean
  description?: string
  parent?: string
  createdAt?: string
  updatedAt?: string
}

export const environmentsApi = {
  // 获取所有环境
  list(): Promise<{ success: boolean; data: Environment[]; current?: string }> {
    return client.get('/environments')
  },

  // 获取指定环境
  get(name: string): Promise<{ success: boolean; data: any }> {
    return client.get(`/environments/${name}`)
  },

  // 切换环境
  activate(name: string): Promise<{ success: boolean; message: string }> {
    return client.post(`/environments/${name}/activate`)
  },

  // 对比环境
  diff(envA: string, envB: string): Promise<{ success: boolean; data: any }> {
    return client.get(`/environments/${envA}/diff/${envB}`)
  },

  // 克隆环境
  clone(source: string, target: string, description?: string): Promise<{ success: boolean }> {
    return client.post(`/environments/${source}/clone`, { target, description })
  },

  // 更新元数据
  updateMetadata(name: string, data: { description?: string; parent?: string }): Promise<{ success: boolean }> {
    return client.patch(`/environments/${name}`, data)
  }
}

