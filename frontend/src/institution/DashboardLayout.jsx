import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  Chip,
  Drawer,
  IconButton,
  Tooltip,
} from '@mui/material'
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountTree as AccountTreeIcon,
  MenuBook as MenuBookIcon,
  Group as GroupIcon,
  NotificationsNone as NotificationsIcon,
  ArrowForward as ArrowForwardIcon,
  Logout as LogoutIcon,
  Public as PublicIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material'

const NavSections = [
  {
    label: 'Overview',
    items: [
      { to: '/portal/institution/governance-pulse', label: 'Governance Pulse', icon: DashboardIcon },
    ],
  },
  {
    label: 'Institution',
    items: [
      { to: '/portal/institution/hierarchy-explorer', label: '4-Tier Hierarchy Explorer', icon: AccountTreeIcon },
    ],
  },
  {
    label: 'Knowledge',
    items: [
      { to: '/portal/institution/knowledge-base', label: 'Knowledge Base & Citation Tester', icon: MenuBookIcon },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/portal/institution/staff-evaluators', label: 'Staff & Evaluators', icon: GroupIcon },
    ],
  },
]

function SidebarContent({ onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-charcoal">
<div className="flex h-16 items-center px-6">
        <img src="/logo-white.png" alt="Nexus Edutech Consult Ltd" className="h-9 w-auto" />
      </div>

      <div className="mx-4 mt-2 rounded-[15px] bg-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-white">
            PR
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">
              Prof. Mohammed Bashir
            </p>
            <p className="truncate text-xs text-white/60">
              Institution Superadmin
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Chip
            size="small"
            icon={<VerifiedIcon sx={{ fontSize: 13, color: '#7FB69A' }} />}
            label="NUC Regulated"
            sx={{
              bgcolor: 'rgba(255,255,255,0.08)',
              color: '#E6F2EC',
              '& .MuiChip-label': { fontSize: 11, fontWeight: 700 },
            }}
          />
          <Chip
            size="small"
            label="Founding Charter Member"
            sx={{
              bgcolor: 'rgba(20,107,74,0.55)',
              color: '#fff',
              '& .MuiChip-label': { fontSize: 11, fontWeight: 700 },
            }}
          />
        </div>
      </div>

      <nav className="mt-5 flex-1 overflow-y-auto px-4 pb-6">
        {NavSections.map((s) => (
          <div key={s.label} className="mb-5">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
              {s.label}
            </p>
            <div className="space-y-1">
              {s.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-[15px] px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-white/65 hover:bg-white/[0.06] hover:text-white'
                      }`
                    }
                  >
                    <Icon sx={{ fontSize: 18 }} />
                    {item.label}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <Link
          to="/"
          className="flex items-center justify-between rounded-[15px] px-3 py-2.5 text-[13px] font-semibold text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <span className="flex items-center gap-3">
            <PublicIcon sx={{ fontSize: 18 }} />
            Back to website
          </span>
          <ArrowForwardIcon sx={{ fontSize: 15 }} />
        </Link>
        <button
          type="button"
          className="mt-1 flex w-full items-center gap-3 rounded-[15px] px-3 py-2.5 text-[13px] font-semibold text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <LogoutIcon sx={{ fontSize: 18 }} />
          Sign out
        </button>
      </div>
    </div>
  )
}

function DashboardTheme({ children }) {
  const base = useTheme()
  const dash = createTheme(base, {
    components: {
      MuiButton: {
        styleOverrides: { root: { borderRadius: 15 } },
      },
      MuiOutlinedInput: {
        styleOverrides: { root: { borderRadius: 15 } },
      },
    },
  })
  return <ThemeProvider theme={dash}>{children}</ThemeProvider>
}

export default function DashboardLayout() {
  const [open, setOpen] = useState(false)

  return (
    <DashboardTheme>
      <div className="min-h-screen bg-bgsoft">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
        <SidebarContent />
      </aside>

      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 288 } }}
      >
        <SidebarContent onNavigate={() => setOpen(false)} />
      </Drawer>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-white/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <IconButton
              className="lg:hidden"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <div className="hidden items-center gap-1.5 text-sm text-charcoal-faint sm:flex">
              <span className="font-semibold text-charcoal">FUT Minna</span>
              <span>/</span>
              <span className="font-semibold text-primary">Institution Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Tooltip title="Nigeria · Tier-2 Native: SCHOOL">
              <span className="hidden items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold text-primary md:inline-flex">
                <PublicIcon sx={{ fontSize: 13 }} />
                Niger State, Nigeria
              </span>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton aria-label="Notifications">
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
            <button
              type="button"
              className="flex items-center gap-2.5 rounded-full border border-line bg-white py-1.5 pr-3 pl-1.5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white">
                PR
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-bold text-charcoal">
                  Prof. Mohammed Bashir
                </span>
                <span className="block text-[11px] text-charcoal-faint">
                  Institution Superadmin
                </span>
              </span>
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      </div>
    </DashboardTheme>
  )
}
