import client from './client'

export const configApi = {
  // 获取配置值
  get(environment: string, key: string): Promise<{ success: boolean; data: { key: string; value: any } }> {
    return client.get(`/config/${environment}/${key}`)
  },

  // 设置配置值
  set(environment: string, key: string, value: any, encrypt = false): Promise<{ success: boolean }> {
    return client.put(`/config/${environment}/${key}`, { value, encrypt })
  },

  // 删除配置值
  delete(environment: string, key: string): Promise<{ success: boolean }> {
    return client.delete(`/config/${environment}/${key}`)
  },

  // 批量更新
  batchUpdate(environment: string, updates: Record<string, any>): Promise<{ success: boolean }> {
    return client.post(`/config/${environment}/batch`, { updates })
  },

  // 验证配置
  validate(environment: string): Promise<{ success: boolean; data: any }> {
    return client.post(`/config/${environment}/validate`)
  },

  // 获取历史
  getHistory(environment: string, limit = 50): Promise<{ success: boolean; data: any[] }> {
    return client.get(`/config/${environment}/history`, { params: { limit } })
  }
}

