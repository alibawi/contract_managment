// Referential-integrity checks over the seed/DB. Used by scripts/integrity-check.ts (npm run check) and the /health screen.
// Module steps append their own checks (ledger = balances, version continuity, ...).
import type { DB } from './types'

export function checkFoundation(db: DB): string[] {
  const errs: string[] = []
  const ids = (a: { id: string }[]) => new Set(a.map((x) => x.id))
  const dup = (name: string, a: { id: string }[]) => { if (ids(a).size !== a.length) errs.push(`${name}: duplicate ids`) }
  ;(['organizations', 'users', 'employees', 'partners', 'uoms', 'categories', 'items', 'paymentTerms', 'costCenters', 'projects'] as const).forEach((k) => dup(k, db[k]))

  const org = ids(db.organizations), emp = ids(db.employees), uom = ids(db.uoms), cat = ids(db.categories), pt = ids(db.paymentTerms)
  db.users.forEach((u) => {
    if (!org.has(u.orgId)) errs.push(`user ${u.id}: unknown org ${u.orgId}`)
    if (u.employeeId && !emp.has(u.employeeId)) errs.push(`user ${u.id}: unknown employee ${u.employeeId}`)
  })
  db.employees.forEach((e) => { if (!org.has(e.orgId)) errs.push(`employee ${e.id}: unknown org`) })
  db.partners.forEach((p) => { if (!pt.has(p.paymentTermId)) errs.push(`partner ${p.id}: unknown payment term`) })
  db.categories.forEach((c) => { if (c.parentId && !cat.has(c.parentId)) errs.push(`category ${c.id}: unknown parent`) })
  db.items.forEach((i) => {
    if (!cat.has(i.categoryId)) errs.push(`item ${i.id}: unknown category`)
    if (!uom.has(i.uomId)) errs.push(`item ${i.id}: unknown uom`)
  })
  if (!db.users.some((u) => u.id === db.userId && u.role === db.role)) errs.push('current user does not match current role')
  const roles = new Set(db.users.map((u) => u.role))
  Object.keys(db.rolePerms).forEach((r) => { if (!roles.has(r as never)) errs.push(`no user has role ${r}`) })
  return errs
}
