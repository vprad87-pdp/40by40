// src/components/modals/MonthlyCheckin.jsx
import { useState } from 'react'
import BottomSheet from '../layout/BottomSheet'

const monthName = () =>
  new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })

const SectionLabel = ({ children }) => (
  <p style={{
    fontFamily: 'Outfit, sans-serif',
    color: 'var(--sage)',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '12px',
    marginTop: '20px',
  }}>
    {children}
  </p>
)

const FieldRow = ({ label, children }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  }}>
    <span style={{
      fontFamily: 'Outfit, sans-serif',
      color: 'var(--text)',
      fontSize: '14px',
      flex: 1,
      paddingRight: '12px',
    }}>
      {label}
    </span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {children}
    </div>
  </div>
)

const NumberInput = ({ value, onChange, placeholder = '0' }) => (
  <input
    type="number"
    inputMode="decimal"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      color: 'var(--text)',
      fontFamily: 'Outfit, sans-serif',
      borderRadius: '8px',
      width: '100px',
      padding: '6px 10px',
      fontSize: '14px',
      textAlign: 'right',
    }}
  />
)

const Toggle = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: '8px' }}>
    {['Yes', 'No'].map((opt) => {
      const active = value === (opt === 'Yes')
      return (
        <button
          key={opt}
          onClick={() => onChange(opt === 'Yes')}
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '13px',
            borderRadius: '20px',
            padding: '5px 14px',
            border: `1px solid ${active ? 'var(--green)' : 'var(--border)'}`,
            background: active ? 'var(--green)' : 'var(--surface2)',
            color: active ? '#fff' : 'var(--muted)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {opt}
        </button>
      )
    })}
  </div>
)

export default function MonthlyCheckin({ isOpen, onClose, onSave, onSnooze }) {
  const [form, setForm] = useState({
    weight_kg: '',
    played_sport: null,
    savings_inr: '',
    charity_inr: '',
    friends_met: '',
    notes_sent: '',
    skincare_done: null,
    zero_social_weeks: '',
  })
  const [saving, setSaving] = useState(false)

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }))

  async function handleSave() {
    setSaving(true)
    const payload = {
      weight_kg: form.weight_kg !== '' ? parseFloat(form.weight_kg) : null,
      played_sport: form.played_sport,
      savings_inr: form.savings_inr !== '' ? parseInt(form.savings_inr) : null,
      charity_inr: form.charity_inr !== '' ? parseInt(form.charity_inr) : null,
      friends_met: form.friends_met !== '' ? parseInt(form.friends_met) : null,
      notes_sent: form.notes_sent !== '' ? parseInt(form.notes_sent) : null,
      skincare_done: form.skincare_done,
      zero_social_weeks:
        form.zero_social_weeks !== '' ? parseInt(form.zero_social_weeks) : null,
    }
    const ok = await onSave(payload)
    setSaving(false)
    if (ok) onClose()
  }

  async function handleSnooze() {
    await onSnooze()
    onClose()
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'block',
              width: '100%',
              background: 'var(--green)',
              color: '#fff',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '15px',
              fontWeight: 600,
              padding: '13px',
              borderRadius: '12px',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              marginBottom: '10px',
            }}
          >
            {saving ? 'Saving…' : 'Save Check-in'}
          </button>
          <button
            onClick={handleSnooze}
            style={{
              display: 'block',
              width: '100%',
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '13px',
              cursor: 'pointer',
              padding: '4px',
              textAlign: 'center',
            }}
          >
            Remind me tomorrow
          </button>
        </>
      }
    >
      <div style={{ padding: '0 16px 16px' }}>

        <p style={{
          fontFamily: 'Outfit, sans-serif',
          color: 'var(--sage)',
          fontSize: '11px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '4px',
          marginTop: '4px',
        }}>
          Monthly Check-in
        </p>
        <h2 style={{
          fontFamily: 'Lora, serif',
          color: 'var(--brown)',
          fontSize: '20px',
          fontWeight: 600,
          marginBottom: '2px',
        }}>
          {monthName()}
        </h2>
        <p style={{
          fontFamily: 'Outfit, sans-serif',
          color: 'var(--muted)',
          fontSize: '13px',
          marginBottom: '8px',
        }}>
          A quick snapshot of how the month went.
        </p>

        <SectionLabel>Health</SectionLabel>
        <FieldRow label="Current weight (kg)">
          <NumberInput value={form.weight_kg} onChange={set('weight_kg')} placeholder="70.0" />
        </FieldRow>
        <FieldRow label="Played sport at least twice?">
          <Toggle value={form.played_sport} onChange={set('played_sport')} />
        </FieldRow>

        <SectionLabel>Finance</SectionLabel>
        <FieldRow label="Current savings (₹)">
          <NumberInput value={form.savings_inr} onChange={set('savings_inr')} placeholder="0" />
        </FieldRow>
        <FieldRow label="Donated this month (₹)">
          <NumberInput value={form.charity_inr} onChange={set('charity_inr')} placeholder="0" />
        </FieldRow>

        <SectionLabel>Relationships</SectionLabel>
        <FieldRow label="Best friends met (total)">
          <NumberInput value={form.friends_met} onChange={set('friends_met')} placeholder="0" />
        </FieldRow>
        <FieldRow label="Handwritten notes sent (total)">
          <NumberInput value={form.notes_sent} onChange={set('notes_sent')} placeholder="0" />
        </FieldRow>

        <SectionLabel>Digital &amp; Lifestyle</SectionLabel>
        <FieldRow label="Maintained skincare routine?">
          <Toggle value={form.skincare_done} onChange={set('skincare_done')} />
        </FieldRow>
        <FieldRow label="Zero social media weeks (total)">
          <NumberInput value={form.zero_social_weeks} onChange={set('zero_social_weeks')} placeholder="0" />
        </FieldRow>

      </div>
    </BottomSheet>
  )
}