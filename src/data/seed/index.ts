import { DEFAULT_TODAY } from '../asof'
import { defaultRolePerms } from '../permissions'
import { defaultSettings } from '../settings'
import type { DB } from '../types'
import * as s from './shared'

/** Fresh demo database. Module seeds (contracts, agreements, ...) are merged here by each module step. */
export function seed(): DB {
  return {
    role: 'admin',
    userId: 'u-adm',
    asOf: DEFAULT_TODAY,
    simulateError: false,
    settings: defaultSettings(),
    rolePerms: structuredClone(defaultRolePerms),
    organizations: s.organizations,
    users: s.users,
    employees: s.employees,
    partners: s.partners,
    currencies: s.currencies,
    rates: s.rates,
    uoms: s.uoms,
    categories: s.categories,
    items: s.items,
    paymentTerms: s.paymentTerms,
    costCenters: s.costCenters,
    projects: s.projects,
    audit: [],
    notices: [],
  }
}
