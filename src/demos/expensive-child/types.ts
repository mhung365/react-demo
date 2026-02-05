/**
 * Config passed from parent to expensive child.
 * When parent uses inline object: config={{ theme: 'dark' }}, a NEW object
 * is created every render → new reference → React.memo sees "props changed".
 */
export interface ChildConfig {
  theme: string
  pageSize: number
}
