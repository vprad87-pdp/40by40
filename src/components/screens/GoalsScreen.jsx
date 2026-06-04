// src/screens/GoalsScreen.jsx
import { useState, useMemo, useEffect, useCallback } from "react";
import { CATEGORIES, ALL_GOALS, TOTAL_GOALS } from "../../constants/goals";
import { useMilestones } from "../../hooks/useMilestones";
import { useDailyLogs } from "../../hooks/useDailyLogs";
import { supabase } from '../../supabase'

import BottomSheet from "../layout/BottomSheet";
import CategoryView from "../goals/CategoryView";
import MilestoneItem from "../goals/MilestoneItem";

// ─── Bucket display config ────────────────────────────────────────────────────

const BUCKET_META = {
  achieved:  { label: 'Achieved',  emoji: '🏆', color: '#15803d' },
  on_target: { label: 'On Target', emoji: '🎯', color: '#1d4ed8' },
  behind:    { label: 'Behind',    emoji: '⚠️',  color: '#b45309' },
  dreadful:  { label: 'Dreadful',  emoji: '🔴', color: '#b91c1c' },
}

// ─── Bucket filter sheet ──────────────────────────────────────────────────────

function BucketFilterSheet({
  isOpen, onClose, bucketKey, goals,
  milestones, cumulativeMap, summaryMap,
  onToggle, onSaveFuzzy, onNavigate,
}) {
  const meta = BUCKET_META[bucketKey] || {}
  if (!goals?.length && !isOpen) return null

  const grouped = CATEGORIES.map(cat => ({
    cat,
    goals: (goals || []).filter(g => g.categoryId === cat.id),
  })).filter(g => g.goals.length > 0)

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`${meta.emoji} ${meta.label}`}
      accentColor={meta.color}
    >
      <div style={{ paddingBottom: 80 }}>
        <div style={{ padding: '10px 16px', background: '#F7F9F7', borderBottom: '1px solid #E8F0E8', fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#7A8F7A' }}>
          {(goals || []).length} goal{(goals || []).length !== 1 ? 's' : ''} in this bucket
        </div>

        {grouped.map(({ cat, goals: catGoals }) => (
          <div key={cat.id}>
            <div style={{ padding: '10px 16px 6px', background: cat.colorLight, borderBottom: `1px solid ${cat.colorBorder}`, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>{cat.emoji}</span>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 11, fontWeight: 600, color: cat.color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {cat.label}
              </span>
            </div>
            {catGoals.map(goal => (
              <MilestoneItem
                key={goal.id}
                goal={goal}
                milestone={milestones[goal.id]}
                cumulativeVal={cumulativeMap[goal.id] ?? 0}
                summaryMap={summaryMap}
                onToggle={onToggle}
                onSaveFuzzy={onSaveFuzzy}
                onTapTracked={() => { onClose(); onNavigate?.(goal.id) }}
                accentColor={cat.color}
              />
            ))}
          </div>
        ))}

        {grouped.length === 0 && (
          <div style={{ padding: '40px 16px', textAlign: 'center', fontFamily: 'Outfit, sans-serif', fontSize: 14, color: '#7A8F7A' }}>
            No goals in this bucket yet.
          </div>
        )}
      </div>
    </BottomSheet>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function GoalsScreen({
  goalFilter,
  onBucketClose,   // NEW — called when bucket sheet closes, stays on Goals tab
  onNavigate,
  user,
  buckets,         // NEW — passed from App.jsx via useHomeData, single source of truth
  onRegisterRefresh,
}) {
  const { milestones, loading, toggleMilestone, saveFuzzyProgress, refetch } = useMilestones(user);
  const { fetchAll } = useDailyLogs(user?.id);

  const [activeCategory, setActiveCategory] = useState(null);
  const [activeBucket,   setActiveBucket]   = useState(null);
  const [allLogs,        setAllLogs]         = useState([]);
  const [cumulativeMap,  setCumulativeMap]   = useState({});
  const [latestWeight,   setLatestWeight]    = useState(null);

  // Fetch latest weight
  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('monthly_checkins')
      .select('weight_kg')
      .eq('user_id', user.id)
      .not('weight_kg', 'is', null)
      .order('checkin_month', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data?.weight_kg) setLatestWeight(data.weight_kg) })
  }, [user?.id])

  // Fetch all daily logs (for averages)
  useEffect(() => {
    if (user?.id) fetchAll().then(setAllLogs);
  }, [user?.id]);

  // Fetch all cumulatives
  const fetchCumulatives = useCallback(async () => {
    if (!user?.id) return

    const { data: walkLogs } = await supabase
      .from('daily_logs').select('walk_km').eq('user_id', user.id).not('walk_km', 'is', null)
    const walkTotal = walkLogs?.reduce((sum, r) => sum + (parseFloat(r.walk_km) || 0), 0) ?? 0

    const { data: books }    = await supabase.from('books').select('id, is_tamil').eq('user_id', user.id)
    const { data: articles } = await supabase.from('articles').select('id').eq('user_id', user.id)
    const { data: projects } = await supabase.from('projects').select('id').eq('user_id', user.id)

   const { data: checkins } = await supabase
      .from('monthly_checkins')
      .select('savings_inr, charity_inr, friends_met, notes_sent, zero_social_weeks, vaibhav_inr, checkin_month')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('checkin_month', { ascending: false })

    const sum    = (field) => checkins?.reduce((acc, row) => acc + (row[field] || 0), 0) ?? 0
    const latest = checkins?.[0] ?? {}   // most recent completed month

    setCumulativeMap({
      walking:           Math.round(walkTotal * 10) / 10,
      books:             books?.length ?? 0,
      articles:          articles?.length ?? 0,
      savings:           latest.savings_inr ?? 0,   // snapshot — NOT summed
      charity:           sum('charity_inr'),
      best_friends:      sum('friends_met'),
      thankyou_notes:    sum('notes_sent'),
      zero_social_weeks: sum('zero_social_weeks'),
      tech_projects:     projects?.length ?? 0,
      vaibhav_savings:   sum('vaibhav_inr'),
    })
  }, [user?.id])

  useEffect(() => { fetchCumulatives() }, [fetchCumulatives])

  useEffect(() => {
    if (onRegisterRefresh) onRegisterRefresh(fetchCumulatives)
  }, [onRegisterRefresh, fetchCumulatives])

  // Open bucket sheet when goalFilter arrives from Home tap
  useEffect(() => {
    if (goalFilter && BUCKET_META[goalFilter]) {
      setActiveBucket(goalFilter)
    } else {
      setActiveBucket(null)
    }
  }, [goalFilter])

  const handleCategoryOpen = async (cat) => {
    await refetch();
    setActiveCategory(cat);
  }

  const dailyAverages = useMemo(() => {
    if (!allLogs.length) return { mobile_mins: null, social_mins: null };
    const withMobile = allLogs.filter(l => l.mobile_mins !== null);
    const withSocial = allLogs.filter(l => l.social_mins !== null);
    return {
      mobile_mins: withMobile.length ? Math.round(withMobile.reduce((s, l) => s + l.mobile_mins, 0) / withMobile.length) : null,
      social_mins: withSocial.length ? Math.round(withSocial.reduce((s, l) => s + l.social_mins, 0) / withSocial.length) : null,
    };
  }, [allLogs]);

  const formatMins = (mins) => {
    if (mins === null) return "No data yet";
    if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    return `${mins}m`;
  };

  const summaryMap = useMemo(() => ({
    mobile_usage: dailyAverages.mobile_mins !== null ? `Avg ${formatMins(dailyAverages.mobile_mins)} / day` : "No data yet",
    social_media: dailyAverages.social_mins !== null ? `Avg ${formatMins(dailyAverages.social_mins)} / day` : "No data yet",
    weight: latestWeight !== null ? `Current: ${latestWeight} kg` : "Not logged yet",
  }), [dailyAverages, latestWeight]);

  const categoryStats = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const milestoneGoals = cat.goals.filter((g) => g.type === "milestone");
      const doneMilestones = milestoneGoals.filter((g) => milestones[g.id]?.is_done).length;
      const pct = cat.goals.length > 0 ? Math.round((doneMilestones / cat.goals.length) * 100) : 0;
      return { id: cat.id, doneMilestones, pct };
    });
  }, [milestones]);

  const statsMap = useMemo(() => {
    const map = {};
    categoryStats.forEach((s) => { map[s.id] = s; });
    return map;
  }, [categoryStats]);

  const totalMilestoneDone = useMemo(() => {
    return ALL_GOALS.filter((g) => g.type === "milestone" && milestones[g.id]?.is_done).length;
  }, [milestones]);

  const handleToggle = async (goalId, isDone) => {
    await toggleMilestone(goalId, isDone);
  };

  // Goals for the active bucket — directly from the buckets prop (same data as Home)
  const bucketGoals = useMemo(() => {
    if (!activeBucket || !buckets) return []
    return buckets[activeBucket] || []
  }, [activeBucket, buckets])

  // Handle bucket sheet close — stay on Goals, clear filter in App
  function handleBucketSheetClose() {
    setActiveBucket(null)
    onBucketClose?.()
  }

  return (
    <div style={{ minHeight: "100%", background: "#F0F4F0", fontFamily: "Outfit, sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #D8E4D8", padding: "48px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 20 }}>🎯</span>
          <h1 style={{ fontFamily: "Lora, serif", fontSize: 22, fontWeight: 600, color: "#3D2B1F", margin: 0 }}>Goals</h1>
        </div>
        <p style={{ fontSize: 13, color: "#7A8F7A", margin: 0 }}>
          {TOTAL_GOALS} goals · 7 categories
          {!loading && totalMilestoneDone > 0 && <span style={{ color: "#2E7D52" }}>{" "}· {totalMilestoneDone} done</span>}
        </p>
      </div>

      {/* Category grid */}
      <div style={{ padding: "16px 16px 100px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {CATEGORIES.map((cat) => {
            const stats   = statsMap[cat.id];
            const pct     = stats?.pct ?? 0;
            const done    = stats?.doneMilestones ?? 0;
            const total   = cat.goals.length;
            const isLarge = cat.id === "legacy";
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryOpen(cat)}
                style={{
                  gridColumn: isLarge ? "1 / -1" : "auto", textAlign: "left",
                  background: cat.colorLight, border: `1.5px solid ${cat.colorBorder}`,
                  borderRadius: 16, padding: "14px 14px 12px", cursor: "pointer",
                  transition: "transform 0.15s", outline: "none", WebkitTapHighlightColor: "transparent",
                }}
                onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"}
                onMouseUp={e   => e.currentTarget.style.transform = "scale(1)"}
                onTouchStart={e => e.currentTarget.style.transform = "scale(0.96)"}
                onTouchEnd={e   => e.currentTarget.style.transform = "scale(1)"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontSize: 24, lineHeight: 1 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: cat.colorBorder, color: cat.color, fontFamily: "Outfit, sans-serif" }}>
                    {total}
                  </span>
                </div>
                <p style={{ fontFamily: "Lora, serif", fontSize: 13, fontWeight: 600, color: "#3D2B1F", margin: "0 0 10px", lineHeight: 1.3 }}>
                  {cat.label}
                </p>
                <div style={{ height: 5, borderRadius: 5, background: cat.colorBorder, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ height: "100%", borderRadius: 5, background: cat.color, width: `${pct}%`, transition: "width 0.7s ease", minWidth: pct > 0 ? 4 : 0 }} />
                </div>
                <p style={{ fontSize: 11, color: "#7A8F7A", margin: 0, fontFamily: "Outfit, sans-serif" }}>
                  {loading ? "Loading…" : done > 0 ? `${done} done · ${total} goals` : `${total} goals`}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category bottom sheet */}
      <BottomSheet
        isOpen={!!activeCategory}
        onClose={() => setActiveCategory(null)}
        title={activeCategory?.label ?? ""}
        emoji={activeCategory?.emoji}
        accentColor={activeCategory?.color}
      >
        {activeCategory && (
          <CategoryView
            category={activeCategory}
            milestones={milestones}
            cumulativeMap={cumulativeMap}
            summaryMap={summaryMap}
            onToggle={handleToggle}
            onSaveFuzzy={saveFuzzyProgress}
            onTapTracked={(goal) => { setActiveCategory(null); onNavigate?.(goal.id); }}
          />
        )}
      </BottomSheet>

      {/* Bucket filter bottom sheet */}
      <BucketFilterSheet
        isOpen={!!activeBucket}
        onClose={handleBucketSheetClose}
        bucketKey={activeBucket}
        goals={bucketGoals}
        milestones={milestones}
        cumulativeMap={cumulativeMap}
        summaryMap={summaryMap}
        onToggle={handleToggle}
        onSaveFuzzy={saveFuzzyProgress}
        onNavigate={(id) => { handleBucketSheetClose(); onNavigate?.(id) }}
      />
    </div>
  );
}
