import { BarChart3, ClipboardCheck, FileText, Files, Handshake, ListChecks, Settings2, FilePen, Wrench } from 'lucide-react'
import { KPICard, ModuleScreensGrid } from '../components/display'
import { PageHeader } from '../components/Layout'
import { Card } from '../components/ui'
import { useStore } from '../data/store'

/** Foundation landing. Replaced by the executive dashboard in the analytics module. */
export default function Home() {
  const { db } = useStore()
  return (
    <div>
      <PageHeader crumbs={[{ label: 'لوحة المؤشرات' }]} title="إدارة العقود" />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPICard label="الأطراف (عملاء وموردون)" value={db.partners.length} icon={Handshake} />
        <KPICard label="الأصناف" value={db.items.length} icon={Files} />
        <KPICard label="المنشآت" value={db.organizations.length} icon={Settings2} />
        <KPICard label="المستخدمون" value={db.users.length} icon={ClipboardCheck} />
      </div>
      <Card title="وحدات النموذج التجريبي (تُفعَّل تباعاً)">
        <ModuleScreensGrid screens={[
          { to: '/contracts', title: 'العقود', hint: 'القائمة، البطاقة، الدورة، الأطراف والمرفقات', icon: FileText, soon: true },
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
