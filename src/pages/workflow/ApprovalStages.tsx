import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '../../components/Layout'
import { Async } from '../../components/states'
import { Badge, Card } from '../../components/ui'
import { money } from '../../data/format'
import { userName } from '../../data/lifecycle'
import { useStore } from '../../data/store'
import { useApi } from '../../lib/useApi'

const subj = { Contract: 'العقود', Amendment: 'الملاحق', Termination: 'الإنهاء' } as const

/** Read-only preview of the Elsa stage rules (editing arrives with settings-access, spec W5 / X4). */
export default function ApprovalStages() {
  const { db } = useStore()
  const api = useApi(() => db.stageRules)
  return (
    <div>
      <PageHeader crumbs={[{ label: 'مراحل الاعتماد' }]} title="مراحل الاعتماد (Elsa)" />
      <div className="mb-3 rounded-md bg-sky-50 px-3 py-2 text-xs text-sky-800">في النظام الحقيقي تُضبط هذه المسارات في مصمم سير عمل Elsa ويربطها المسؤول بكيان «العقد» عبر إعداد يدوي؛ العرض هنا للقراءة. الحدود المالية توضيحية وقابلة للتعديل.</div>
      <Async state={api}>
        {(rules) => (
          <div className="space-y-3">
            {rules.map((r) => (
              <Card key={r.id} title={r.name} actions={<span className="flex items-center gap-2"><Badge tone="blue">{subj[r.subjectType]}</Badge>{r.isActive ? <Badge tone="green">فعّال</Badge> : <Badge tone="gray">معطّل</Badge>}</span>}>
                <div className="mb-3 text-xs text-gray-500">القيمة (بالدينار): من {money(r.minValueIQD)} {r.maxValueIQD ? `إلى أقل من ${money(r.maxValueIQD)}` : 'فما فوق'}{r.typeId ? ` — نوع: ${db.contractTypes.find((t) => t.id === r.typeId)?.name}` : ''}</div>
                <ol className="flex flex-wrap items-center gap-2 text-sm">
                  {r.stages.map((s, i) => (
                    <li key={s.no} className="flex items-center gap-2">
                      <span className={`rounded-md border px-3 py-1.5 ${s.isLegalReview ? 'border-amber-300 bg-amber-50' : 'border-line bg-white'}`}>
                        <span className="text-[11px] text-gray-400">{s.no}.</span> {s.label}<span className="block text-[11px] text-gray-500">{userName(db, s.userId)}{s.isLegalReview ? ' · مراجعة قانونية' : ''}</span>
                      </span>
                      {i < r.stages.length - 1 && <ArrowLeft className="h-4 w-4 text-gray-300" />}
                    </li>
                  ))}
                </ol>
              </Card>
            ))}
          </div>
        )}
      </Async>
    </div>
  )
}
