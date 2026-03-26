import { useState, useEffect, useCallback } from 'react';
import { useDailyLogs } from '../../hooks/useDailyLogs';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Get today's date in IST as YYYY-MM-DD */
function todayIST() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

/** Convert total minutes → { h, m } */
function minsToHM(mins) {
  if (mins === null || mins === undefined || mins === '') return { h: '', m: '' };
  const total = Number(mins);
  return { h: String(Math.floor(total / 60)), m: String(total % 60) };
}

/** Convert { h, m } strings → total integer minutes or null */
function hmToMins(h, m) {
  const hours = parseInt(h || '0', 10);
  const mins  = parseInt(m || '0', 10);
  if (isNaN(hours) && isNaN(mins)) return null;
  return (isNaN(hours) ? 0 : hours) * 60 + (isNaN(mins) ? 0 : mins);
}

/** Colour class for a time-based value vs target */
function timeColour(totalMins, targetMins) {
  if (totalMins === null || totalMins === '') return '';
  const v = Number(totalMins);
  if (v <= targetMins)                    return 'good';
  if (v <= targetMins * 1.15)             return 'warn';
  return 'bad';
}

// ─── Targets (mins) ──────────────────────────────────────────────────────────
const TARGET_MOBILE = 120; // 2 hours
const TARGET_SOCIAL = 30;  // 30 minutes

// ─── Sub-components ───────────────────────────────────────────────────────────

function TimeInput({ label, icon, hVal, mVal, onHChange, onMChange, colour }) {
  const colourMap = {
    good: { border: '#2E7D52', bg: '#f0faf4', badge: '#2E7D52' },
    warn: { border: '#B8860B', bg: '#fdfaf0', badge: '#B8860B' },
    bad:  { border: '#C0392B', bg: '#fdf0f0', badge: '#C0392B' },
    '':   { border: '#D8E4D8', bg: '#F7F9F7', badge: '#7A8F7A' },
  };
  const c = colourMap[colour] || colourMap[''];
  const total = hmToMins(hVal, mVal);
  const totalLabel = (total !== null && hVal !== '' || mVal !== '')
    ? `${Math.floor((total || 0) / 60)}h ${(total || 0) % 60}m`
    : null;

  return (
    <div className="field-group" style={{ '--field-border': c.border, '--field-bg': c.bg }}>
      <label className="field-label">
        <span className="field-icon">{icon}</span>
        {label}
        {totalLabel && (
          <span className="field-badge" style={{ background: c.badge }}>
            {totalLabel}
          </span>
        )}
      </label>
      <div className="time-inputs">
        <div className="time-unit">
          <input
            type="number"
            min="0"
            max="23"
            placeholder="0"
            value={hVal}
            onChange={e => onHChange(e.target.value)}
            className="time-field"
          />
          <span className="time-unit-label">h</span>
        </div>
        <span className="time-sep">:</span>
        <div className="time-unit">
          <input
            type="number"
            min="0"
            max="59"
            placeholder="0"
            value={mVal}
            onChange={e => onMChange(e.target.value)}
            className="time-field"
          />
          <span className="time-unit-label">m</span>
        </div>
      </div>
    </div>
  );
}

function WalkInput({ value, onChange }) {
  return (
    <div className="field-group">
      <label className="field-label">
        <span className="field-icon">🚶</span>
        Walk Distance
      </label>
      <div className="walk-input-row">
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          placeholder="0.00"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="walk-field"
        />
        <span className="walk-unit">km</span>
      </div>
    </div>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LogScreen({ user, onOpenCheckin }) {
  const { fetchByDate, saveLog, loading, error } = useDailyLogs(user?.id);

  const [selectedDate, setSelectedDate] = useState(todayIST());
  const [isExisting,   setIsExisting]   = useState(false);
  const [fetchDone,    setFetchDone]    = useState(false);
  const [saved,        setSaved]        = useState(false);

  // Form state
  const [mobileH, setMobileH] = useState('');
  const [mobileM, setMobileM] = useState('');
  const [socialH, setSocialH] = useState('');
  const [socialM, setSocialM] = useState('');
  const [walkKm,  setWalkKm]  = useState('');

  // Load existing data when date changes
  const loadDate = useCallback(async (date) => {
    setFetchDone(false);
    setSaved(false);
    const row = await fetchByDate(date);
    if (row) {
      setIsExisting(true);
      const mob = minsToHM(row.mobile_mins);
      const soc = minsToHM(row.social_mins);
      setMobileH(mob.h); setMobileM(mob.m);
      setSocialH(soc.h); setSocialM(soc.m);
      setWalkKm(row.walk_km !== null ? String(row.walk_km) : '');
    } else {
      setIsExisting(false);
      setMobileH(''); setMobileM('');
      setSocialH(''); setSocialM('');
      setWalkKm('');
    }
    setFetchDone(true);
  }, [fetchByDate]);

useEffect(() => {
  if (!user?.id) {
    setFetchDone(true)
    return
  }
  loadDate(selectedDate);
}, [selectedDate, loadDate, user?.id]);

  const mobileMins = (mobileH !== '' || mobileM !== '') ? hmToMins(mobileH, mobileM) : null;
  const socialMins = (socialH !== '' || socialM !== '') ? hmToMins(socialH, socialM) : null;
  const mobileColour = mobileMins !== null ? timeColour(mobileMins, TARGET_MOBILE) : '';
  const socialColour = socialMins !== null ? timeColour(socialMins, TARGET_SOCIAL) : '';

  const handleSave = async () => {
    const result = await saveLog({
      log_date:    selectedDate,
      mobile_mins: mobileMins,
      social_mins: socialMins,
      walk_km:     walkKm !== '' ? walkKm : null,
    });
    if (result) {
      setIsExisting(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const isEmpty = mobileH === '' && mobileM === '' &&
                  socialH === '' && socialM === '' &&
                  walkKm === '';

  return (
    <>
      <style>{`
        .log-screen {
          min-height: 100dvh;
          background: var(--bg, #F0F4F0);
          padding: 0 0 100px;
          font-family: 'Outfit', sans-serif;
        }

        /* ── Header ── */
        .log-header {
          background: var(--surface, #fff);
          border-bottom: 1px solid var(--border, #D8E4D8);
          padding: 52px 20px 16px;
        }
        .log-eyebrow {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--sage, #7A9E7E);
          margin-bottom: 4px;
        }
        .log-title {
          font-family: 'Lora', serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--brown, #3D2B1F);
          margin: 0;
        }

        /* ── Date picker ── */
        .date-strip {
          background: var(--surface, #fff);
          padding: 12px 20px 14px;
          border-bottom: 1px solid var(--border, #D8E4D8);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .date-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--muted, #7A8F7A);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .date-input {
          flex: 1;
          border: 1px solid var(--border, #D8E4D8);
          border-radius: 8px;
          padding: 7px 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: var(--text, #1C2B1C);
          background: var(--surface2, #F7F9F7);
          outline: none;
          max-width: 180px;
        }
        .date-input:focus {
          border-color: var(--sage, #7A9E7E);
          box-shadow: 0 0 0 3px rgba(122,158,126,0.15);
        }
        .date-status {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          flex-shrink: 0;
        }
        .date-status.new      { background: #e8f5ef; color: #2E7D52; }
        .date-status.existing { background: #fdf6e3; color: #B8860B; }

        /* ── Form body ── */
        .log-body {
          padding: 20px 20px 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .field-group {
          background: var(--field-bg, var(--surface2, #F7F9F7));
          border: 1.5px solid var(--field-border, var(--border, #D8E4D8));
          border-radius: 12px;
          padding: 14px 16px;
          transition: border-color 0.2s, background 0.2s;
        }
        .field-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--muted, #7A8F7A);
          margin-bottom: 10px;
        }
        .field-icon { font-size: 14px; }
        .field-badge {
          margin-left: auto;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          letter-spacing: 0.03em;
        }

        /* Time inputs */
        .time-inputs {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .time-unit {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
        }
        .time-field {
          width: 100%;
          border: 1.5px solid var(--border, #D8E4D8);
          border-radius: 8px;
          padding: 10px 12px;
          font-family: 'Lora', serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--text, #1C2B1C);
          background: var(--surface, #fff);
          text-align: center;
          outline: none;
          -moz-appearance: textfield;
        }
        .time-field::-webkit-outer-spin-button,
        .time-field::-webkit-inner-spin-button { -webkit-appearance: none; }
        .time-field:focus {
          border-color: var(--sage, #7A9E7E);
          box-shadow: 0 0 0 3px rgba(122,158,126,0.15);
        }
        .time-unit-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--muted, #7A8F7A);
        }
        .time-sep {
          font-size: 22px;
          font-weight: 300;
          color: var(--border, #D8E4D8);
          line-height: 1;
        }

        /* Walk input */
        .walk-input-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .walk-field {
          flex: 1;
          border: 1.5px solid var(--border, #D8E4D8);
          border-radius: 8px;
          padding: 10px 12px;
          font-family: 'Lora', serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--text, #1C2B1C);
          background: var(--surface, #fff);
          text-align: center;
          outline: none;
          -moz-appearance: textfield;
        }
        .walk-field::-webkit-outer-spin-button,
        .walk-field::-webkit-inner-spin-button { -webkit-appearance: none; }
        .walk-field:focus {
          border-color: var(--sage, #7A9E7E);
          box-shadow: 0 0 0 3px rgba(122,158,126,0.15);
        }
        .walk-unit {
          font-size: 16px;
          font-weight: 700;
          color: var(--muted, #7A8F7A);
          width: 32px;
        }

        /* Targets hint */
        .targets-hint {
          display: flex;
          gap: 8px;
          padding: 0 2px;
        }
        .hint-chip {
          font-size: 11px;
          color: var(--muted, #7A8F7A);
          background: var(--surface, #fff);
          border: 1px solid var(--border, #D8E4D8);
          border-radius: 20px;
          padding: 3px 10px;
        }

        /* Save button */
        .log-footer {
          padding: 20px;
        }
        .save-btn {
          width: 100%;
          padding: 15px;
          border-radius: 12px;
          border: none;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
          letter-spacing: 0.04em;
        }
        .save-btn:active { transform: scale(0.98); }
        .save-btn.primary {
          background: var(--green, #2E7D52);
          color: #fff;
        }
        .save-btn.update {
          background: var(--gold, #B8860B);
          color: #fff;
        }
        .save-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* Success toast */
        .toast {
          position: fixed;
          bottom: 84px;
          left: 50%;
          transform: translateX(-50%) translateY(0);
          background: var(--text, #1C2B1C);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 24px;
          white-space: nowrap;
          opacity: 1;
          transition: opacity 0.3s;
          pointer-events: none;
          z-index: 100;
        }
        .toast.hidden { opacity: 0; }

        /* Error */
        .log-error {
          margin: 0 20px;
          background: #fdf0f0;
          border: 1px solid #C0392B;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: #C0392B;
        }

        /* Skeleton / loading */
        .skeleton {
          background: linear-gradient(90deg, #e8ede8 25%, #f0f4f0 50%, #e8ede8 75%);
          background-size: 200%;
          animation: shimmer 1.2s infinite;
          border-radius: 8px;
          height: 56px;
        }
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>

      <div className="log-screen">
        {/* Header */}
        <div className="log-header">
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
    <div>
      <p className="log-eyebrow">Daily Entry</p>
      <h1 className="log-title">Log Your Day</h1>
    </div>
    {onOpenCheckin && (
      <button
        onClick={onOpenCheckin}
        style={{
          marginTop:    '6px',
          background:   '#fff',
          border:       '1.5px solid #D8E4D8',
          borderRadius: '20px',
          padding:      '6px 12px',
          fontSize:     '12px',
          fontWeight:   600,
          fontFamily:   'Outfit, sans-serif',
          color:        '#7A8F7A',
          cursor:       'pointer',
          whiteSpace:   'nowrap',
        }}
      >
        📋 Monthly
      </button>
    )}
  </div>
</div>

        {/* Date picker */}
        <div className="date-strip">
          <span className="date-label">Date</span>
          <input
            type="date"
            className="date-input"
            value={selectedDate}
            max={todayIST()}
            onChange={e => setSelectedDate(e.target.value)}
          />
          {fetchDone && (
            <span className={`date-status ${isExisting ? 'existing' : 'new'}`}>
              {isExisting ? '✏️ Update' : '✨ New'}
            </span>
          )}
        </div>

        {/* Error */}
        {error && <p className="log-error">⚠️ {error}</p>}

        {/* Form */}
        <div className="log-body">
          {!fetchDone ? (
            <>
              <div className="skeleton" />
              <div className="skeleton" />
              <div className="skeleton" />
            </>
          ) : (
            <>
              <TimeInput
                label="Mobile Time"
                icon="📱"
                hVal={mobileH} mVal={mobileM}
                onHChange={setMobileH} onMChange={setMobileM}
                colour={mobileColour}
              />
              <TimeInput
                label="Social Media"
                icon="🌐"
                hVal={socialH} mVal={socialM}
                onHChange={setSocialH} onMChange={setSocialM}
                colour={socialColour}
              />
              <WalkInput value={walkKm} onChange={setWalkKm} />

              <div className="targets-hint">
                <span className="hint-chip">📱 Target ≤ 2h</span>
                <span className="hint-chip">🌐 Target ≤ 30m</span>
              </div>
            </>
          )}
        </div>

        {/* Save */}
        <div className="log-footer">
          <button
            className={`save-btn ${isExisting ? 'update' : 'primary'}`}
            onClick={handleSave}
            disabled={loading || isEmpty || !fetchDone}
          >
            {loading ? 'Saving…' : isExisting ? 'Update Log' : 'Save Log'}
          </button>
        </div>
      </div>

      {/* Toast */}
      <div className={`toast ${saved ? '' : 'hidden'}`}>
        {isExisting ? '✅ Log updated' : '✅ Log saved'}
      </div>
    </>
  );
}
