import { AlarmClock, BarChart3, BellRing, CalendarClock, ClipboardCheck, FileText, Files, FilePen, FileSignature, Handshake, ListChecks, Settings2, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { KPICard, ModuleScreensGrid } from '../components/display'
import { PageHeader } from '../components/Layout'
import { Async } from '../components/states'
import { Card } from '../components/ui'
import { alertsForUser } from '../data/alerts'
import { statusLabel, statusOrder } from '../data/contractMeta'
import { daysTo, fmtDate, money } from '../data/format'
import { canSee, partnerName, typeOf } from '../data/lifecycle'
import { useStore } from '../data/store'
import type { ContractStatus } from '../data/types'
import { useApi } from '../lib/useApi'

const color: Record<ContractStatus, string> = {
  Draft: '#9ca3af', PendingApproval: '#f59e0b', Approved: '#38bdf8', PendingSignature: '#fbbf24', Active: '#10b981', OnHold: '#fb923c', Expired: '#ef4444', Terminated: '#b91c1c', Cancelled: '#d1d5db', Closed: '#6366f1',
}

/** Donut by status — plain SVG, no chart library (brief). */
function Donut({ data }: { data: { key: string; label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  let acc = 0
  const r = 42, c = 2 * Math.PI * r
  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 110 110" className="h-36 w-36 -rotate-90">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#f3f4f6" strokeWidth="16" />
        {data.filter((d) => d.value).map((d) => {
          const len = (d.value / total) * c
          const el = <circle key={d.key} cx="55" cy="55" r={r} fill="none" stroke={d.color} strokeWidth="16" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc} />
          acc += len
          return el
        })}
        <text x="55" y="55" transform="rotate(90 55 55)" textAnchor="middle" dominantBaseline="middle" className="fill-gray-800 text-[18px] font-bold">{total}</text>
      </svg>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
        {data.filter((d) => d.value).map((d) => <li key={d.key} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />{d.label}<span className="ms-auto font-semibold tabular-nums">{d.value}</span></li>)}
      </ul>
    </div>
  )
}

/** Landing: module KPIs computed from the store (replaced by the executive dashboard in the analytics module). */
export default function Home() {
  const { db } = useStore()
  const api = useApi(() => {
    const visible = db.contracts.filter((c) => canSee(db, c))
    const by = (s: ContractStatus) => visible.filter((c) => c.status === s)
    const active = by('Active')
    const value = (cur: 'IQD' | 'USD') => active.filter((c) => c.currency === cur).reduce((s, c) => s + (c.contractValue ?? 0), 0)
    const expiring = visible.filter((c) => ['Active', 'OnHold'].includes(c.status) && c.endDate && daysTo(c.endDate) >= 0 && daysTo(c.endDate) <= 30).sort((a, b) => a.endDate!.localeCompare(b.endDate!))
    const types = db.contractTypes.map((t) => ({ name: t.name, n: visible.filter((c) => c.typeId === t.id).length })).filter((x) => x.n).sort((a, b) => b.n - a.n)
    return { visible, by, active, iqd: value('IQD'), usd: value('USD'), expiring, types, alerts: alertsForUser(db).length }
  })
  return (
    <div>
      <PageHeader crumbs={[{ label: 'لوحة المؤشرات' }]} title="إدارة العقود" />
      <Async state={api}>
        {(d) => (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <KPICard label="عقود سارية" value={d.active.length} icon={FileSignature} tone="green" to="/contracts" hint={`${money(d.iqd, 'IQD')} + ${money(d.usd, 'USD')}`} />
              <KPICard label="تنتهي خلال 30 يوماً" value={d.expiring.length} icon={AlarmClock} tone={d.expiring.length ? 'amber' : 'gray'} to="/contracts" />
              <KPICard label="بانتظار الاعتماد" value={d.by('PendingApproval').length} icon={ClipboardCheck} tone="amber" to="/contracts" />
              <KPICard label="بانتظار التوقيع" value={d.by('PendingSignature').length} icon={FilePen} tone="amber" to="/contracts" />
              <KPICard label="منتهية تنتظر التجديد" value={d.by('Expired').length} icon={CalendarClock} tone={d.by('Expired').length ? 'red' : 'gray'} to="/contracts" />
              <KPICard label="تنبيهات لك" value={d.alerts} icon={BellRing} tone={d.alerts ? 'red' : 'gray'} to="/alerts" />
            </div>
            <div className="mb-4 grid gap-4 lg:grid-cols-3">
              <Card title="العقود حسب الحالة">
                <Donut data={statusOrder.map((s) => ({ key: s, label: statusLabel[s], value: d.by(s).length, color: color[s] }))} />
              </Card>
              <Card title="العقود حسب النوع">
                <ul className="space-y-2 text-xs">
                  {d.types.map((t) => (
                    <li key={t.name}><div className="mb-0.5 flex justify-between"><span>{t.name}</span><span className="font-semibold tabular-nums">{t.n}</span></div>
                      <div className="h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full bg-navy" style={{ width: `${(t.n / d.types[0].n) * 100}%` }} /></div></li>
                  ))}
                </ul>
              </Card>
              <Card title="تنتهي قريباً" actions={<Link to="/contracts" className="text-xs text-navy underline">الكل</Link>}>
                {d.expiring.length === 0 ? <div className="py-6 text-center text-sm text-gray-400">لا عقود تنتهي خلال 30 يوماً</div> : (
                  <ul className="divide-y divide-gray-100 text-sm">
                    {d.expiring.slice(0, 6).map((c) => (
                      <li key={c.id}><Link to={`/contracts/${c.id}`} className="flex items-center justify-between gap-2 py-2 hover:text-navy">
                        <span className="min-w-0"><span className="block truncate font-medium">{c.title}</span><span className="text-[11px] text-gray-500">{partnerName(db, c)} · {typeOf(db, c).name}</span></span>
                        <span className={`shrink-0 text-xs font-semibold ${daysTo(c.endDate!) <= 15 ? 'text-red-600' : 'text-amber-600'}`}>{daysTo(c.endDate!)} يوم<span className="block font-normal text-gray-400">{fmtDate(c.endDate)}</span></span>
                      </Link></li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </>
        )}
      </Async>
      <Card title="وحدات النموذج التجريبي (تُفعَّل تباعاً)">
        <ModuleScreensGrid screens={[
          { to: '/contracts', title: 'العقود', hint: 'القائمة، البطاقة، الدورة، الأطراف والمرفقات، التنبيهات', icon: FileText },
          { to: '/tasks', title: 'الاعتماد والتوقيع', hint: 'مراحل Elsa، المهام، التفويض، التوقيع الإلكتروني', icon: ClipboardCheck, soon: true },
          { to: '/agreements', title: 'الاتفاقيات والتنفيذ', hint: 'بنود الالتزام ودفتر التنفيذ وتحويل العملات', icon: Handshake, soon: true },
          { to: '/amendments', title: 'الملاحق والنسخ والتجديد', hint: 'ملاحق بتاريخ سريان، مقارنة النسخ، التجديد', icon: FilePen, soon: true },
          { to: '/obligations', title: 'الالتزامات والمالية', hint: 'المراحل والغرامات وجدول الدفعات والملخص المالي', icon: ListChecks, soon: true },
          { to: '/templates', title: 'القوالب والطباعة', hint: 'القوالب، مكتبة البنود، معاينة الطباعة', icon: Files, soon: true },
          { to: '/service', title: 'عقود الخدمة', hint: 'التغطية ومستوى الخدمة والاستهلاك', icon: Wrench, soon: true },
          { to: '/settings', title: 'الإعدادات والصلاحيات', hint: 'إعدادات النظام ومصفوفة الصلاحيات والترقيم', icon: Settings2, soon: true },
          { to: '/reports', title: 'التقارير', hint: 'لوحة المؤشرات التنفيذية والتقارير R-01…R-17', icon: BarChart3, soon: true },
        ]} />
      </Card>
    </div>
  )
}
