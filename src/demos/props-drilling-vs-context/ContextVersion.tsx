import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from 'react'
import { useRenderLog } from './useRenderLog'
import { INITIAL_FORM_DATA, type FormData } from './types'
import './props-drilling-demo.css'

/**
 * CONTEXT VERSION: Same form, but formData and setField in FormContext.
 *
 * - Readability: Components use useContext(FormContext). You don't see what they receive in the signature — you have to open the Provider to know.
 * - Traceability: Where is formData set? Search for FormProvider. Where is it read? Search for useContext(FormContext). Multiple files, implicit flow.
 * - Re-renders: When context value changes, EVERY consumer re-renders. FormLayout, FormSection, FieldGroup, FormSummary all use context — all re-render on every keystroke (same count as props in this tree, but the COST of understanding is higher).
 * - Unnecessary complexity: For 4 levels, we added Provider, context type, useContext in every component. No real benefit over props drilling; harder to trace and debug.
 */

interface FormContextValue {
  formData: FormData
  setField: (field: keyof FormData, value: string) => void
}

const FormContext = createContext<FormContextValue | null>(null)

function useFormContext(): FormContextValue {
  const ctx = useContext(FormContext)
  if (!ctx) throw new Error('Missing FormProvider')
  return ctx
}

function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  useRenderLog('FormProvider (context)', { formDataKeys: Object.keys(formData) })

  const setField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const value = useMemo(() => ({ formData, setField }), [formData])

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  )
}

function FormLayoutContext({ children }: { children: ReactNode }) {
  const { formData } = useFormContext()
  useRenderLog('FormLayout (context)', { keys: Object.keys(formData) })

  return (
    <div className="drill-demo__layout">
      <p className="drill-demo__hint drill-demo__hint--wrong">
        useContext(FormContext) — where does formData come from? Find FormProvider.
      </p>
      {children}
    </div>
  )
}

function FormSectionContext({ title, children }: { title: string; children: ReactNode }) {
  useFormContext() // subscribe to re-renders
  useRenderLog('FormSection (context)', { title })

  return (
    <fieldset className="drill-demo__section">
      <legend>{title}</legend>
      {children}
    </fieldset>
  )
}

function FieldGroupContext({ field, label }: { field: keyof FormData; label: string }) {
  const { formData, setField } = useFormContext()
  useRenderLog('FieldGroup (context)', { field })

  return (
    <div className="drill-demo__field">
      <label>
        {label}
        <input
          type={field === 'email' ? 'email' : 'text'}
          value={formData[field]}
          onChange={(e) => setField(field, e.target.value)}
        />
      </label>
    </div>
  )
}

function FormSummaryContext() {
  const { formData } = useFormContext()
  useRenderLog('FormSummary (context)', {})

  const filledCount = (Object.keys(formData) as (keyof FormData)[]).filter(
    (k) => formData[k] !== '' && formData[k] !== 'viewer'
  ).length

  return (
    <div className="drill-demo__summary">
      <p>Fields filled: {filledCount}/3</p>
      <p className="drill-demo__hint drill-demo__hint--wrong">
        useContext — re-renders on every keystroke. No explicit prop; trace via Provider.
      </p>
    </div>
  )
}

export function ContextVersion() {
  return (
    <section className="drill-demo drill-demo--context">
      <header className="drill-demo__section-header">
        <h2>Context: unnecessary complexity for this depth</h2>
        <p>
          Same form with FormContext. <strong>Readability:</strong> components use useContext — you don&apos;t see formData/setField in the signature. <strong>Traceability:</strong> to find where formData is set, search for FormProvider; to see who reads it, search for useContext(FormContext). <strong>Re-renders:</strong> every consumer re-renders when value changes (check console — same path re-renders, but data flow is implicit). For 4 levels, Context adds Provider + context type + useContext in every component with no benefit over props drilling.
        </p>
      </header>
      <FormProvider>
        <div className="drill-demo__grid">
          <FormLayoutContext>
            <FormSectionContext title="Personal">
              <FieldGroupContext field="name" label="Name: " />
              <FieldGroupContext field="email" label="Email: " />
              <FieldGroupContext field="role" label="Role: " />
            </FormSectionContext>
          </FormLayoutContext>
          <FormSummaryContext />
        </div>
      </FormProvider>
    </section>
  )
}
