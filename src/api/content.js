import { apiClient } from './client'

export function getHomeContent() {
  return apiClient.get('/content/home')
}
