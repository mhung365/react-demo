export interface FormData {
  name: string
  email: string
  role: string
}

export const INITIAL_FORM_DATA: FormData = {
  name: '',
  email: '',
  role: 'viewer',
}
