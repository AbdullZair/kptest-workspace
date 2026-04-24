/**
 * Audit log entity for tracking system events
 */
export interface AuditLogEntity {
  id: string
  user_id: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT'
  entity_type: string
  entity_id?: string
  old_value?: string
  new_value?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

/**
 * System log entity for application events
 */
export interface SystemLogEntity {
  id: string
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  message: string
  stack_trace?: string
  source_class?: string
  source_method?: string
  created_at: string
}
