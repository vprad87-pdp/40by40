// src/components/modals/MonthlyCheckin.jsx
import { useState, useEffect } from 'react'
import BottomSheet from '../layout/BottomSheet'

const monthName = () =>
  new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, visible }) {
  if (!visible) return null
  return (
    <div style={{
      position:      'fixed',
      top:           '50%',
      left:          '50%',
      transform:     'translate(-50%, -50%)',
      background:    '#1C2B1C',
      color:         '#fff',
      fontFamily:    'Outfit, sans-serif',
      fontSize:      '14px',
      fontWeight:    500,
      padding:       '12px 24px',
      borderRadius:  '12px',
      zIndex:        9999,
      boxShadow:     '0 4px 20px rgba(0,0,0,0.25)',
      pointerEvents: 'none',
      whiteSpace:    'nowrap',
    }}>
      {message}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionLabel = ({ children }) => (
  <p style={{
    fontFamily:    'Outfit, sans-serif',
    color:         '#7A9E7E',
    fontSize:      '11px',
    fontWeight:    600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom:  '12px',
    marginTop:     '20px',
  }}>
    {children}
  </p>
)

const FieldRow = ({ label, sub, total, children }) => (
  <div style={{ marginBottom: '16px' }}>
    <div style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ flex: 1, paddingRight: '12px' }}>
        <span style={{
          fontFamily: 'Outfit, sans-serif',
          color:      '#1C2B1C',
          fontSize:   '14px',
          display:    'block',
        }}>
          {label}
        </span>
        {sub && (
          <span style={{
            fontFamily: 'Outfit, sans-serif',
            color:      '#7A8F7A',
            fontSize:   '11px',
            display:    'block',
            marginTop:  '2px',
          }}>
            {sub}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {children}
      </div>
    </div>
    {total !== undefined && (
      <div style={{
        marginTop:    '6px',
        display:      'flex',
        justifyContent: 'flex-end',
      }}>
        <span style={{
          fontFamily:   'Outfit, sans-serif',
          fontSize:     '11px',
          color:        '#2E7D52',
          background:   '#f0fdf4',
          border:       '1px solid #86efac',
          borderRadius: '20px',
          padding:      '2px 10px',
        }}>
          Total so far: {total}
        </span>
      </div>
    )}
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
      background:   '#F7F9F7',
      border:       '1px solid #D8E4D8',
      color:        '#1C2B1C',
      fontFamily:   'Outfit, sans-serif',
      borderRadius: '8px',
      width:        '100px',
      padding:      '6px 10px',
      fontSize:     '14px',
      textAlign:    'right',
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
            fontFamily:   'Outfit, sans-serif',
            fontSize:     '13px',
            borderRadius: '20px',
            padding:      '5px 14px',
            border:       `1px solid ${active ? '#2E7D52' : '#D8E4D8'}`,
            background:   active ? '#2E7D52' : '#F7F9F7',
            color:        active ? '#fff' : '#7A8F7A',
            cursor:       'pointer',
            transition:   'all 0.15s',
          }}
        >
          {opt}
        </button>
      )
    })}
  </div>
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toStr(val) {
  return val !== null && val !== undefined ? String(val) : ''
}

function seedForm(checkin) {
  if (!checkin) return {
    weight_kg:         '',
    played_sport:      null,
    savings_inr:       '',
    charity_inr:       '',
    friends_met:       '',
    notes_sent:        '',
    skincare_done:     null,
    zero_social_weeks: '',
  }
  return {
    weight_kg:         toStr(checkin.weight_kg),
    played_sport:      checkin.played_sport      ?? null,
    savings_inr:       toStr(checkin.savings_inr),
    charity_inr:       toStr(checkin.charity_inr),
    friends_met:       toStr(checkin.friends_met),
    notes_sent:        toStr(checkin.notes_sent),
    skincare_done:     checkin.skincare_done     ?? null,
    zero_social_weeks: toStr(checkin.zero_social_weeks),
  }
}

function formatINR(amount) {
  if (!amount) return '₹0'
  return '₹' + Number(amount).toLocaleString('en-IN')
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MonthlyCheckin({
  isOpen,
  onClose,
  onSave,
  onSnooze,
  thisMonthCheckin,
  totalCharity,
  totalNotes,
}) {
  const [form, setForm]     = useState(seedForm(null))
  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState(false)

  useEffect(() => {
    if (isOpen) setForm(seedForm(thisMonthCheckin))
  }, [isOpen, thisMonthCheckin])

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }))

  function showToast() {
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      weight_kg:         form.weight_kg         !== '' ? parseFloat(form.weight_kg)         : null,
      played_sport:      form.played_sport,
      savings_inr:       form.savings_inr       !== '' ? parseInt(form.savings_inr)         : null,
      charity_inr:       form.charity_inr       !== '' ? parseInt(form.charity_inr)         : null,
      friends_met:       form.friends_met       !== '' ? parseInt(form.friends_met)         : null,
      notes_sent:        form.notes_sent        !== '' ? parseInt(form.notes_sent)          : null,
      skincare_done:     form.skincare_done,
      zero_social_weeks: form.zero_social_weeks !== '' ? parseInt(form.zero_social_weeks)   : null,
    }
    const ok = await onSave(payload)
    setSaving(false)
    if (ok) {
      showToast()
      setTimeout(() => onClose(), 2600)
    }
  }

  async function handleSnooze() {
    await onSnooze()
    onClose()
  }

  // Running totals include this month's current input live
  const liveCharityTotal = totalCharity || 0
const liveNotesTotal   = totalNotes   || 0

  return (
    <>
      <Toast message="✓ Check-in saved!" visible={toast} />

      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        footer={
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display:      'block',
                width:        '100%',
                background:   '#2E7D52',
                color:        '#fff',
                fontFamily:   'Outfit, sans-serif',
                fontSize:     '15px',
                fontWeight:   600,
                padding:      '13px',
                borderRadius: '12px',
                border:       'none',
                cursor:       saving ? 'not-allowed' : 'pointer',
                opacity:      saving ? 0.7 : 1,
                marginBottom: '10px',
              }}
            >
              {saving ? 'Saving…' : 'Save Check-in'}
            </button>
            <button
              onClick={handleSnooze}
              style={{
                display:   'block',
                width:     '100%',
                background:'none',
                border:    'none',
                color:     '#7A8F7A',
                fontFamily:'Outfit, sans-serif',
                fontSize:  '13px',
                cursor:    'pointer',
                padding:   '4px',
                textAlign: 'center',
              }}
            >
              Remind me tomorrow
            </button>
          </>
        }
      >
        <div style={{ padding: '0 16px 24px' }}>

          <p style={{
            fontFamily:    'Outfit, sans-serif',
            color:         '#7A9E7E',
            fontSize:      '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom:  '4px',
            marginTop:     '4px',
          }}>
            Monthly Check-in
          </p>
          <h2 style={{
            fontFamily:   'Lora, serif',
            color:        '#3D2B1F',
            fontSize:     '20px',
            fontWeight:   600,
            marginBottom: '2px',
          }}>
            {monthName()}
          </h2>
          <p style={{
            fontFamily:   'Outfit, sans-serif',
            color:        '#7A8F7A',
            fontSize:     '13px',
            marginBottom: '8px',
          }}>
            {thisMonthCheckin
              ? 'You have a saved entry — update if needed.'
              : 'A quick snapshot of how the month went.'}
          </p>

          <SectionLabel>Health</SectionLabel>
          <FieldRow label="Current weight (kg)">
            <NumberInput value={form.weight_kg} onChange={set('weight_kg')} placeholder="70.0" />
          </FieldRow>
          <FieldRow label="Played sport at least twice?">
            <Toggle value={form.played_sport} onChange={set('played_sport')} />
          </FieldRow>

          <SectionLabel>Finance</SectionLabel>
          <FieldRow
            label="Current savings (₹)"
            sub="Your total savings balance today"
          >
            <NumberInput value={form.savings_inr} onChange={set('savings_inr')} placeholder="0" />
          </FieldRow>
          <FieldRow
            label="Donated this month (₹)"
            sub="This month only — we'll add it up"
            total={formatINR(liveCharityTotal)}
          >
            <NumberInput value={form.charity_inr} onChange={set('charity_inr')} placeholder="0" />
          </FieldRow>

          <SectionLabel>Relationships</SectionLabel>
          <FieldRow
            label="Best friends met (total)"
            sub="Running total, target 4"
          >
            <NumberInput value={form.friends_met} onChange={set('friends_met')} placeholder="0" />
          </FieldRow>
          <FieldRow
            label="Notes sent this month"
            sub="This month only — we'll add it up"
            total={`${liveNotesTotal} of 14`}
          >
            <NumberInput value={form.notes_sent} onChange={set('notes_sent')} placeholder="0" />
          </FieldRow>

          <SectionLabel>Digital &amp; Lifestyle</SectionLabel>
          <FieldRow label="Maintained skincare routine?">
            <Toggle value={form.skincare_done} onChange={set('skincare_done')} />
          </FieldRow>
          <FieldRow
            label="Zero social media weeks (total)"
            sub="Running total, target 4"
          >
            <NumberInput value={form.zero_social_weeks} onChange={set('zero_social_weeks')} placeholder="0" />
          </FieldRow>

        </div>
      </BottomSheet>
    </>
  )
}