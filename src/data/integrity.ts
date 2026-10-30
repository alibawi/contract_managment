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
  errs.push(...checkContracts(db))
  return errs
}

/** Module 1: contracts, parties, signatures, history, lines, numbering. */
export function checkContracts(db: DB): string[] {
  const errs: string[] = []
  const ct = new Set(db.contractTypes.map((t) => t.id)), cs = new Set(db.contracts.map((c) => c.id))
  const partner = new Set(db.partners.map((p) => p.id)), user = new Set([...db.users.map((u) => u.id), 'system'])
  const numbers = new Set<string>()
  db.contracts.forEach((c) => {
    if (!ct.has(c.typeId)) errs.push(`contract ${c.id}: unknown type`)
    if (c.counterpartyId && !partner.has(c.counterpartyId)) errs.push(`contract ${c.id}: unknown partner`)
    if (!user.has(c.ownerUserId)) errs.push(`contract ${c.id}: unknown owner`)
    if (c.renewedFromContractId && !cs.has(c.renewedFromContractId)) errs.push(`contract ${c.id}: unknown renewedFrom`)
    if (numbers.has(c.number)) errs.push(`contract ${c.id}: duplicate number ${c.number}`)
    numbers.add(c.number)
    if (c.endDate && c.endDate < c.startDate) errs.push(`contract ${c.id}: end before start`)
    const last = db.history.filter((h) => h.contractId === c.id).sort((a, b) => a.at.localeCompare(b.at)).pop()
    if (!last) errs.push(`contract ${c.id}: no history`)
    else if (last.to !== c.status) errs.push(`contract ${c.id}: last history ${last.to} != status ${c.status}`)
    if (c.profile === 'Agreement' && !['Cancelled'].includes(c.status) && !db.lines.some((l) => l.contractId === c.id)) errs.push(`agreement ${c.id}: no lines`)
  })
  db.parties.forEach((p) => { if (!cs.has(p.contractId)) errs.push(`party ${p.id}: unknown contract`) })
  db.lines.forEach((l) => { if (!cs.has(l.contractId)) errs.push(`line ${l.id}: unknown contract`) })
  db.signatures.forEach((s) => { if (!cs.has(s.contractId)) errs.push(`signature ${s.id}: unknown contract`) })
  db.attachments.forEach((a) => { if (!cs.has(a.ownerId)) errs.push(`attachment ${a.id}: unknown contract`) })
  db.links.forEach((l) => { if (!cs.has(l.contractId)) errs.push(`link ${l.id}: unknown contract`) })
  const types = new Map(db.contractTypes.map((t) => [t.id, t]))
  db.contracts.filter((c) => ['Active', 'OnHold', 'Expired', 'Terminated', 'Closed'].includes(c.status)).forEach((c) => {
    const t = types.get(c.typeId)
    if (t?.requiresSignature) {
      const have = new Set(db.signatures.filter((s) => s.contractId === c.id).map((s) => s.role))
      t.requiredSignatureRoles.forEach((r) => { if (!have.has(r)) errs.push(`contract ${c.id}: missing signature ${r}`) })
    }
  })
  return errs
}
