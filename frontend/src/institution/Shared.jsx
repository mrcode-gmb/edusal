import { Card, Chip, LinearProgress, Box } from '@mui/material'

export function Panel({ children, sx = {}, className = '' }) {
  return (
    <Card
      className={`p-6 ${className}`}
      sx={{ border: '1px solid', borderColor: 'border.main', borderRadius: '15px', boxShadow: 'var(--shadow-card)', ...sx }}
    >
      {children}
    </Card>
  )
}

export function PanelHead({ title, sub, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-bold text-charcoal">{title}</h3>
        {sub && <p className="mt-0.5 text-sm text-charcoal-faint">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({ icon: Icon, value, label, sub, chip }) {
  return (
    <Card
      className="flex items-start gap-4 p-5"
      sx={{
        border: '1px solid',
        borderColor: 'border.main',
        borderRadius: '15px',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-primary-soft">
        <Icon sx={{ fontSize: 22, color: 'primary.main' }} />
      </span>
      <div className="min-w-0">
        <p className="text-2xl leading-none font-extrabold text-charcoal">{value}</p>
        <p className="mt-1.5 text-sm font-semibold text-charcoal">{label}</p>
        <p className="mt-0.5 text-xs text-charcoal-faint">{sub}</p>
        {chip && (
          <Chip
            label={chip}
            size="small"
            sx={{
              mt: 1.5,
              bgcolor: 'primary.soft',
              color: 'primary.main',
              fontWeight: 700,
            }}
          />
        )}
      </div>
    </Card>
  )
}

export function Meter({ value, label, hint }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-charcoal">{label}</span>
        <span className="text-sm font-bold text-primary">{value}%</span>
      </div>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 8,
          borderRadius: 99,
          bgcolor: 'primary.soft',
          '& .MuiLinearProgress-bar': { borderRadius: 99, bgcolor: 'primary.main' },
        }}
      />
      {hint && <p className="mt-1.5 text-xs text-charcoal-faint">{hint}</p>}
    </div>
  )
}

export function PageHead({ eyebrow, title, sub, actions }) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-2xl text-charcoal md:text-[1.9rem]">{title}</h1>
        {sub && <p className="mt-1.5 max-w-2xl text-sm text-charcoal-faint">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  )
}

export function Badge({ children, color = 'primary.main', bg = 'primary.soft' }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold"
      sx={{ color, bgcolor: bg }}
      style={{ color, backgroundColor: bg }}
    >
      {children}
    </span>
  )
}

export function Ring({ value, label, size = 150 }) {
  const r = (size - 16) / 2
  const c = 2 * Math.PI * r
  return (
    <Box sx={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#E6F2EC"
          strokeWidth="12"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#146B4A"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * value) / 100}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span className="text-2xl font-extrabold text-charcoal">{value}%</span>
        <span className="text-center text-xs font-semibold text-charcoal-faint">{label}</span>
      </div>
    </Box>
  )
}
