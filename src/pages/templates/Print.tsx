import { Printer } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/Layout'
import { EmptyBlock } from '../../components/states'
import { fmtDate, money, num } from '../../data/format'
import { committedValue, netPrice } from '../../data/fulfillment'
import { canSee, partnerName, typeOf, userName } from '../../data/lifecycle'
import { useStore } from '../../data/store'
import { designTemplate, isDraftPrint, logPrint, printCount, resolveText, termsOf } from '../../data/templates'
import { fmtUnits, lineTarget } from '../agreements/shared'

/** T7 — A4 Arabic print preview from the (mock) CONTRACT_AR_A4 design template. Printing is logged; Draft shows a watermark (BR-T-06). */
export default function Print() {
  const { id } = useParams()
  const { db, run, can } = useStore()
  const c = db.contracts.find((x) => x.id === id)
  if (!c || !canSee(db, c)) return <EmptyBlock title="العقد غير موجود أو لا تملك صلاحية عرضه" />
  const t = typeOf(db, c)
  const org = db.organizations.find((o) => o.id === c.organizationId)
  const terms = termsOf(db, c.id).filter((x) => x.isIncluded)
  const lines = db.lines.filter((l) => l.contractId === c.id)
  const parties = db.parties.filter((p) => p.contractId === c.id)
  const draft = isDraftPrint(c)
  const company = db.users.find((u) => u.id === 'u-gm')
  const counterparty = parties.find((p) => p.isPrimary)
  const print = () => { run((d) => logPrint(d, c.id)); window.setTimeout(() => window.print(), 50) }
  const sigs = db.signatures.filter((s) => s.contractId === c.id)
  return (
    <div>
      <div className="no-print">
        <PageHeader crumbs={[{ label: 'العقود', to: '/contracts' }, { label: c.number, to: `/contracts/${c.id}` }, { label: 'الطباعة' }]} title={`معاينة الطباعة — ${c.number}`}
          actions={<><span className="text-xs text-gray-500">قالب التصميم: {designTemplate.code} · طُبع {printCount(db, c.id)} مرة</span><Link className="btn" to={`/contracts/${c.id}`}>رجوع</Link>
            <button type="button" className="btn btn-primary" disabled={!can('Contracts.View')} onClick={print}><Printer className="h-4 w-4" />طباعة</button></>} />
        {draft && <div className="mb-3 rounded bg-amber-50 px-3 py-2 text-xs text-amber-800">العقد مسودة: ستظهر على الصفحة علامة «مسودة» المائية. {terms.length === 0 && 'لا بنود قانونية — أضف قالباً أو بنوداً من تبويب «البنود القانونية».'}</div>}
      </div>
      <div className="print-sheet relative mx-auto min-h-[297mm] w-full max-w-[210mm] overflow-hidden bg-white p-[16mm] text-[13px] leading-7 text-gray-900 shadow-md">
        {draft && <div className="pointer-events-none absolute inset-0 grid place-items-center"><span className="-rotate-[28deg] select-none text-[120px] font-bold tracking-widest text-gray-200/70">مسودة</span></div>}
        <div className="relative">
          <header className="mb-6 flex items-start justify-between border-b-2 border-navy pb-3">
            <div><div className="text-lg font-bold text-navy">{org?.name}</div><div className="text-xs text-gray-500">{org?.city}</div></div>
            <div className="text-end text-xs text-gray-600"><div>رقم العقد: <b dir="ltr">{c.number}</b></div><div>التاريخ: {fmtDate(c.startDate)}</div><div>{t.name}</div></div>
          </header>
          <h1 className="mb-1 text-center text-xl font-bold">{c.title}</h1>
          <p className="mb-5 text-center text-xs text-gray-500">{t.name} — الإصدار {c.versionNo ? `v${c.versionNo}` : 'غير مفعّل'}</p>

          <section className="mb-5">
            <h2 className="mb-1 font-bold">أطراف العقد</h2>
            <p>الطرف الأول: <b>{org?.name}</b>، ويمثله {company?.name} ({company?.title}).</p>
            <p>الطرف الثاني: <b>{partnerName(db, c)}</b>{counterparty ? `، ويمثله ${counterparty.contactName || '…………'} (${counterparty.signatoryTitle})` : ''}.</p>
            {parties.filter((p) => !p.isPrimary).map((p) => <p key={p.id}>{p.name} — {p.contactName} ({p.signatoryTitle}).</p>)}
            <p className="text-xs text-gray-500">المدة: {fmtDate(c.startDate)} ← {c.endDate ? fmtDate(c.endDate) : 'مفتوح'} — القيمة: {c.contractValue ? money(c.contractValue, c.currency) : 'غير محددة'}</p>
          </section>

          {lines.length > 0 && (
            <section className="mb-5">
              <h2 className="mb-1 font-bold">جدول البنود المتعاقد عليها</h2>
              <table className="w-full border-collapse text-xs">
                <thead><tr className="bg-gray-100">{['#', 'الصنف / التصنيف', 'الكمية', 'سعر الوحدة', 'خصم %', 'القيمة'].map((h) => <th key={h} className="border border-gray-300 px-2 py-1 text-start">{h}</th>)}</tr></thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.id}><td className="border border-gray-300 px-2 py-1">{l.lineNum}</td><td className="border border-gray-300 px-2 py-1">{lineTarget(db, l)}</td>
                      <td className="border border-gray-300 px-2 py-1">{l.commitmentType === 'Quantity' ? fmtUnits(db, c, l, l.agreedQuantity ?? 0) : 'التزام بالقيمة'}</td>
                      <td className="border border-gray-300 px-2 py-1">{l.commitmentType === 'Quantity' ? num(netPrice(l) / (1 - l.discountPercent / 100)) : '—'}</td>
                      <td className="border border-gray-300 px-2 py-1">{l.discountPercent || '—'}</td><td className="border border-gray-300 px-2 py-1">{money(committedValue(l), c.currency)}</td></tr>))}
                </tbody>
                <tfoot><tr className="bg-gray-50 font-semibold"><td colSpan={5} className="border border-gray-300 px-2 py-1">الإجمالي</td><td className="border border-gray-300 px-2 py-1">{money(lines.reduce((s, l) => s + committedValue(l), 0), c.currency)}</td></tr></tfoot>
              </table>
            </section>)}

          <section className="mb-8">
            <h2 className="mb-2 font-bold">الشروط والأحكام</h2>
            {terms.length === 0 ? <p className="text-gray-400">…………………………………………………………</p> : (
              <ol className="space-y-3">
                {terms.map((x, i) => <li key={x.id}><b>المادة ({i + 1}) — {x.title}</b><p>{resolveText(db, c, x.body)}</p></li>)}
              </ol>)}
          </section>

          <section className="mt-10 grid grid-cols-2 gap-8 text-center">
            {[{ role: 'الطرف الأول', name: company?.name, title: company?.title, sig: sigs.find((s) => s.role === 'Company') }, { role: 'الطرف الثاني', name: counterparty?.contactName || partnerName(db, c), title: counterparty?.signatoryTitle, sig: sigs.find((s) => s.role === 'Counterparty') }].map((b) => (
              <div key={b.role}>
                <div className="font-bold">{b.role}</div><div className="mt-1 text-xs text-gray-600">{b.name}{b.title ? ` — ${b.title}` : ''}</div>
                <div className="mx-auto mt-10 h-px w-48 bg-gray-400" /><div className="mt-1 text-[11px] text-gray-500">{b.sig ? `وُقّع بتاريخ ${fmtDate(b.sig.signedOn)}` : 'التوقيع والختم'}</div>
              </div>))}
          </section>
          <footer className="mt-10 border-t border-gray-300 pt-2 text-center text-[10px] text-gray-400">{c.number} · {userName(db, c.ownerUserId)} · {designTemplate.name}</footer>
        </div>
      </div>
    </div>
  )
}
