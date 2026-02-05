import { useState, useMemo } from 'react'
import { useRenderLog } from './useRenderLog'
import { INITIAL_FORM_DATA, type FormData } from './types'
import './props-drilling-demo.css'

/**
 * PROPS DRILLING: Form data and setField passed explicitly through 4 levels.
 *
 * - Readability: Each component's props show exactly what it receives. formData, setField — no guessing.
 * - Traceability: To find where formData is set, follow the tree: Dashboard → FormLayout → FormSection → FieldGroup → Input. One path.
 * - Re-renders: When formData changes, Dashboard re-renders → entire path re-renders (same as Context). But the DATA FLOW is explicit in every signature.
 * - No Provider, no useContext, no "where does this come from?" — just props.
 */

function FormLayout({
  formData,
  setField,
}: {
  formData: FormData
  setField: (field: keyof FormData, value: string) => void
}) {
  useRenderLog('FormLayout (props)', { keys: Object.keys(formData) })

  return (
    <div className="drill-demo__layout">
      <p className="drill-demo__hint drill-demo__hint--correct">
        Props: formData, setField — explicit. Traceability: parent passes them; we pass to FormSection.
      </p>
      <FormSection formData={formData} setField={setField} title="Personal">
        <FieldGroup formData={formData} setField={setField} field="name" label="Name: " />
        <FieldGroup formData={formData} setField={setField} field="email" label="Email: " />
        <FieldGroup formData={formData} setField={setField} field="role" label="Role: " />
      </FormSection>
    </div>
  )
}

function FormSection({
  formData,
  setField,
  title,
  children,
}: {
  formData: FormData
  setField: (field: keyof FormData, value: string) => void
  title: string
  children: React.ReactNode
}) {
  useRenderLog('FormSection (props)', { title })

  return (
    <fieldset className="drill-demo__section">
      <legend>{title}</legend>
      {children}
    </fieldset>
  )
}

function FieldGroup({
  formData,
  setField,
  field,
  label,
}: {
  formData: FormData
  setField: (field: keyof FormData, value: string) => void
  field: keyof FormData
  label: string
}) {
  useRenderLog('FieldGroup (props)', { field })

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

function FormSummary({ filledCount }: { filledCount: number }) {
  useRenderLog('FormSummary (props)', { filledCount })

  return (
    <div className="drill-demo__summary">
      <p>Fields filled: {filledCount}/3</p>
      <p className="drill-demo__hint">Receives only filledCount — explicit prop.</p>
    </div>
  )
}

export function PropsDrillingVersion() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  useRenderLog('FormDashboard (props)', { formDataKeys: Object.keys(formData) })

  const setField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const filledCount = useMemo(
    () =>
      (Object.keys(formData) as (keyof FormData)[]).filter(
        (k) => formData[k] !== '' && formData[k] !== 'viewer'
      ).length,
    [formData]
  )

  return (
    <section className="drill-demo drill-demo--props">
      <header className="drill-demo__section-header">
        <h2>Props drilling: simple and clear</h2>
        <p>
          formData and setField passed explicitly through FormLayout → FormSection → FieldGroup → Input. <strong>Readability:</strong> each component&apos;s signature shows what it receives. <strong>Traceability:</strong> follow the tree upward to find where state lives. <strong>No Context</strong> — no Provider, no useContext, no &quot;where does this come from?&quot; Type in a field and check console: path re-renders; data flow is explicit.
        </p>
      </header>
      <div className="drill-demo__grid">
        <FormLayout formData={formData} setField={setField} />
        <FormSummary filledCount={filledCount} />
      </div>
    </section>
  )
}
