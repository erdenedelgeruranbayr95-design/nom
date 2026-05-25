const accentStyles = {
  rose: 'from-rose-100 via-white to-pink-100 text-rose-600',
  peach: 'from-amber-50 via-white to-rose-100 text-amber-600',
  blush: 'from-fuchsia-50 via-white to-rose-100 text-fuchsia-600',
}

function StatCard({ label, value, accent = 'rose' }) {
  return (
    <div
      className={`rounded-[1.5rem] border border-white/80 bg-gradient-to-br ${accentStyles[accent]} p-4 shadow-[0_14px_38px_rgba(154,90,120,0.08)]`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-current/70">{label}</p>
      <p className="mt-3 font-['Georgia'] text-3xl font-semibold text-rose-950">{value}</p>
    </div>
  )
}

export default StatCard
