import {
  Archive, Bell, BellRing, Boxes, Building2, CalendarClock, ChevronDown, ChevronLeft, FileSignature, Factory, FolderKanban, Globe, Handshake, Landmark,
  Languages, Menu, Monitor, Plus, RotateCcw, Search, Settings, Shield, ShoppingBag, ShoppingCart, Store, TrendingUp, Truck, UserCog, Users, ZapOff,
  type LucideIcon,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { addDays, today } from '../data/asof'
import { featureOn } from '../data/admin'
import { fmtDate } from '../data/format'
import { roleLabel } from '../data/permissions'
import { DATA_VERSION, useStore } from '../data/store'
import { contractNav } from '../lib/navigation'
import { useClickAway } from '../lib/useClickAway'
import { Confirm } from './ui'

const otherModules: [string, LucideIcon][] = [
  ['الإدارة', Building2], ['إدارة الشحن', Truck], ['نقاط البيع', Store], ['المبيعات', ShoppingCart], ['السوق', Globe],
  ['إدارة المخزون', Boxes], ['إدارة الموارد البشرية', Users], ['المالية', Landmark], ['أمان', Shield],
  ['المشتريات', ShoppingBag], ['الأرشيف', Archive], ['الاستثمارات', TrendingUp], ['إدارة علاقات العملاء', Handshake],
  ['إدارة المشاريع', FolderKanban], ['التصنيع', Factory],
]

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { toast, can, db } = useStore()
  const [open, setOpen] = useState(true)
  const outOfScope = () => toast('هذه الوحدة خارج نطاق النموذج التجريبي')
  const item = 'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-gray-700 hover:bg-gray-100'
  const nav = contractNav.filter((n) => (n.module !== 'analytics' || can('Reports.View')) && (!n.feature || featureOn(db, n.feature)) && (n.module !== 'settings-access' || n.to === '/settings/approval-stages' || can('Settings.Manage')))

  return (
    <aside className={`flex shrink-0 flex-col border-s border-line bg-white transition-all ${collapsed ? 'w-[60px]' : 'w-[240px]'}`}>
      <div className="flex h-14 items-center justify-between border-b border-line px-3">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-navy to-sky-700 text-xs font-bold text-white ring-2 ring-navy/10">E</div>
            <span className="text-base font-bold tracking-wide text-navy" dir="ltr">ENKI ERP</span>
          </div>
        )}
        <button type="button" onClick={onToggle} className="rounded p-1.5 text-gray-500 hover:bg-gray-100"><Menu className="h-5 w-5" /></button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        <div className="rounded-md bg-navy-50">
          <button type="button" onClick={() => setOpen((o) => !o)} className={`${item} font-semibold text-navy hover:bg-navy-50`} title="إدارة العقود">
            <FileSignature className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <><span className="flex-1 text-start">إدارة العقود</span><ChevronLeft className={`h-3.5 w-3.5 transition ${open ? '-rotate-90' : ''}`} /></>}
          </button>
          {open && (
            <div className="space-y-0.5 pb-1.5">
              {nav.map(({ to, label, icon: Icon, section, soon }) => (
                <div key={to}>
                  {section && !collapsed && <div className="pe-2 ps-7 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{section}</div>}
                  {soon ? (
                    <div title={`${label} — قريباً`} className={`flex items-center gap-2 rounded-md py-1.5 text-[13px] text-gray-400 ${collapsed ? 'justify-center px-2' : 'pe-2 ps-7'}`}>
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <><span className="flex-1">{label}</span><span className="rounded bg-gray-100 px-1.5 text-[10px] text-gray-400">قريباً</span></>}
                    </div>
                  ) : (
                    <NavLink to={to} end={to === '/' || to === '/reports' || to === '/service' || to === '/agreements'} title={label}
                      className={({ isActive }) => `flex items-center gap-2 rounded-md py-1.5 text-[13px] ${collapsed ? 'justify-center px-2' : 'pe-2 ps-7'} ${isActive ? 'bg-white font-semibold text-navy shadow-sm' : 'text-gray-600 hover:text-navy'}`}>
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && label}
                    </NavLink>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {otherModules.map(([label, Icon]) => (
          <button key={label} type="button" onClick={outOfScope} className={item} title={label}>
            <Icon className="h-[18px] w-[18px] shrink-0 text-gray-500" />
            {!collapsed && <><span className="flex-1 text-start">{label}</span><ChevronLeft className="h-3.5 w-3.5 text-gray-400" /></>}
          </button>
        ))}
        <button type="button" onClick={outOfScope} className={item} title="الإشعارات">
          <Bell className="h-[18px] w-[18px] shrink-0 text-gray-500" />
          {!collapsed && <><span className="flex-1 text-start">الإشعارات</span><ChevronLeft className="h-3.5 w-3.5 text-gray-400" /></>}
        </button>
      </nav>

      <div className="space-y-0.5 border-t border-line p-2">
        {([['الإعدادات', Settings], ['اللغة', Languages], ['الاشعارات', BellRing]] as [string, LucideIcon][]).map(([label, Icon]) => (
          <button key={label} type="button" onClick={outOfScope} className={item} title={label}>
            <Icon className="h-[18px] w-[18px] shrink-0 text-gray-500" />
            {!collapsed && <span className="flex-1 text-start">{label}</span>}
          </button>
        ))}
      </div>
    </aside>
  )
}

/** Demo "today" control: lets the presenter move time forward to trigger expiry, reminders and overdue states. */
function DemoDate() {
  const { setAsOf, db } = useStore()
  const [open, setOpen] = useState(false)
  const shift = (n: number) => setAsOf(addDays(today(), n))
  const ref = useClickAway<HTMLDivElement>(() => setOpen(false))
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-[12px] text-gray-600 hover:bg-gray-50" title="التاريخ التجريبي">
        <CalendarClock className="h-4 w-4" />
        <span className="hidden sm:inline">اليوم التجريبي:</span><span className="font-semibold text-navy">{fmtDate(db.asOf)}</span>
      </button>
      {open && (
        <div className="absolute end-0 top-10 z-40 w-64 rounded-md border border-line bg-white p-3 shadow-lg">
          <div className="mb-2 text-[11px] font-semibold text-gray-400">تقديم التاريخ التجريبي</div>
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 7, 30, 90].map((n) => <button key={n} type="button" className="btn justify-center px-0" onClick={() => shift(n)}>+{n}</button>)}
          </div>
          <input type="date" dir="ltr" className="inp mt-2" value={db.asOf} onChange={(e) => e.target.value && setAsOf(e.target.value)} />
          <button type="button" className="btn mt-2 w-full justify-center" onClick={() => setAsOf('2026-10-30')}>العودة إلى 2026-10-30</button>
          <p className="mt-2 text-[10px] leading-relaxed text-gray-400">يؤثر على الانتهاء والتنبيهات والتأخر والتجديد التلقائي.</p>
        </div>
      )}
    </div>
  )
}

function RoleMenu() {
  const { db, user, setUser, run, reset, toast } = useStore()
  const [open, setOpen] = useState(false)
  const [ask, setAsk] = useState(false)
  const initials = user.name.split(' ').slice(0, 2).map((w) => w[0]).join('')
  const ref = useClickAway<HTMLDivElement>(() => setOpen(false))
  return (
    <div className="relative ms-2 border-s border-line ps-3" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-md p-1 hover:bg-gray-50">
        <div className="relative">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">{initials}</div>
          <span className="absolute bottom-0 end-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
        </div>
        <div className="hidden text-start leading-tight md:block">
          <div className="text-[13px] font-semibold">{user.name}</div>
          <div className="text-[11px] text-gray-500">{roleLabel[db.role]}</div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </button>
      {open && (
        <div className="absolute end-0 top-11 z-40 w-64 rounded-md border border-line bg-white py-1 shadow-lg">
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-gray-400"><UserCog className="h-3.5 w-3.5" />العمل كمستخدم (يغيّر الدور والأزرار)</div>
          <div className="max-h-72 overflow-y-auto">
            {db.users.map((u) => (
              <button key={u.id} type="button" onClick={() => { setUser(u.id); setOpen(false) }}
                className={`block w-full px-3 py-1.5 text-start hover:bg-gray-50 ${db.userId === u.id ? 'bg-navy-50 font-semibold text-navy' : 'text-gray-700'}`}>
                <span className="block text-sm">{u.name}</span><span className="text-[11px] text-gray-500">{roleLabel[u.role]} — {u.title}</span>
              </button>
            ))}
          </div>
          <div className="my-1 border-t border-line" />
          <button type="button" onClick={() => run((d) => { d.simulateError = !d.simulateError }, db.simulateError ? 'تم إيقاف محاكاة الخطأ' : 'محاكاة خطأ الخادم مفعّلة — أعد تحميل الشاشة')}
            className="flex w-full items-center gap-1.5 px-3 py-1.5 text-start text-sm text-gray-700 hover:bg-gray-50">
            <ZapOff className="h-3.5 w-3.5" />{db.simulateError ? 'إيقاف محاكاة الخطأ' : 'محاكاة خطأ في الخادم'}
          </button>
          <button type="button" onClick={() => { setOpen(false); setAsk(true) }} className="flex w-full items-center gap-1.5 px-3 py-1.5 text-start text-sm text-red-600 hover:bg-red-50">
            <RotateCcw className="h-3.5 w-3.5" />إعادة تعيين البيانات التجريبية
          </button>
          <div className="px-3 pb-1 text-[10px] text-gray-400" dir="ltr">data v{DATA_VERSION}</div>
        </div>
      )}
      {ask && (
        <Confirm danger title="إعادة تعيين البيانات التجريبية" text="سيتم حذف كل التعديلات وإرجاع بيانات العرض الأصلية." onClose={() => setAsk(false)}
          onYes={() => { reset(); toast('تمت إعادة تعيين البيانات التجريبية'); window.location.hash = '#/' }} />
      )}
    </div>
  )
}

function Topbar() {
  const nav = useNavigate()
  const { can } = useStore()
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line bg-white px-4">
      <div className="flex items-center gap-2">
        {can('Contracts.Create') && (
          <button type="button" className="btn h-8 w-8 justify-center px-0" title="عقد جديد" onClick={() => nav('/contracts/new')}><Plus className="h-4 w-4" /></button>
        )}
        <div className="relative hidden lg:block">
          <Search className="absolute start-2.5 top-2 h-4 w-4 text-gray-400" />
          <input className="inp w-72 ps-8" placeholder="بحث في العقود والأطراف والمستندات..." onKeyDown={(e) => { if (e.key === 'Enter' && e.currentTarget.value.trim()) { nav(`/search?q=${encodeURIComponent(e.currentTarget.value.trim())}`); e.currentTarget.value = '' } }} />
          <kbd className="absolute end-2 top-1.5 rounded border border-line bg-gray-50 px-1.5 text-[10px] text-gray-500" dir="ltr">⌘K</kbd>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <DemoDate />
        {[Monitor, Languages, Bell].map((I, i) => (
          <button key={i} type="button" className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100">
            <I className="h-[18px] w-[18px]" />
          </button>
        ))}
        <RoleMenu />
      </div>
    </header>
  )
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 900)
  return (
    <div className="flex h-full">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  )
}

export function PageHeader({ crumbs, title, actions, summary, badge }: {
  crumbs: { label: string; to?: string }[]; title: string; actions?: ReactNode
  summary?: { label: string; value: string }; badge?: ReactNode
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <nav className="mb-1 flex items-center gap-1 text-xs text-gray-500">
          {[{ label: 'إدارة العقود', to: '/' }, ...crumbs].map((c, i, arr) => (
            <span key={i} className="flex items-center gap-1">
              {c.to && i < arr.length - 1 ? <Link to={c.to} className="hover:text-navy">{c.label}</Link> : <span className="text-gray-700">{c.label}</span>}
              {i < arr.length - 1 && <ChevronLeft className="h-3 w-3" />}
            </span>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {badge}
        </div>
      </div>
      <div className="no-print flex flex-wrap items-center gap-2">
        {actions}
        {summary && (
          <div className="ms-2 border-s border-line ps-3 text-end leading-tight">
            <div className="text-[11px] text-gray-500">{summary.label}</div>
            <div className="text-sm font-bold tabular-nums text-navy" dir="ltr">{summary.value}</div>
          </div>
        )}
      </div>
    </div>
  )
}
