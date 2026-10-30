// Foundation types shared by every module. Module-specific entities are added to DB by each module step.

export type RoleId = 'requester' | 'approver' | 'manager' | 'legal' | 'sales' | 'procurement' | 'finance' | 'admin'

export type Perm =
  | 'Contracts.View' | 'Contracts.Create' | 'Contracts.Edit' | 'Contracts.Delete' | 'Contracts.Submit' | 'Contracts.Approve'
  | 'Contracts.Reject' | 'Contracts.Activate' | 'Contracts.Suspend' | 'Contracts.Terminate' | 'Contracts.Cancel'
  | 'Contracts.Amend' | 'Contracts.Renew' | 'Contracts.ViewConfidential' | 'Contracts.Export'
  | 'Attachments.View' | 'Attachments.Upload' | 'Attachments.Download' | 'Attachments.Delete'
  | 'Fulfillment.Recalculate' | 'ContractTypes.Manage' | 'Templates.Manage' | 'Clauses.Manage'
  | 'Obligations.Manage' | 'Obligations.Complete' | 'Obligations.Accept' | 'ApprovalDelegations.Manage'
  | 'Reports.View' | 'Settings.Manage'

export type CurrencyCode = 'IQD' | 'USD'

export interface Organization { id: string; code: string; name: string; city: string }
export interface AppUser { id: string; name: string; title: string; role: RoleId; orgId: string; employeeId?: string }
export interface Employee { id: string; name: string; title: string; department: string; orgId: string }
export interface Partner {
  id: string; code: string; name: string; kind: 'customer' | 'vendor'; city: string; contact: string; phone: string; email: string
  paymentTermId: string; currency: CurrencyCode
}
export interface Currency { code: CurrencyCode; name: string; decimals: number; symbol: string }
/** Rate = IQD per 1 unit of `code`, effective from `date` (used by ActivationRate / DocumentDateRate). */
export interface ExchangeRate { code: CurrencyCode; date: string; rate: number }
export interface Uom { id: string; code: string; name: string }
export interface Category { id: string; code: string; name: string; parentId?: string }
export interface Item { id: string; code: string; name: string; categoryId: string; uomId: string; basePrice: number; currency: CurrencyCode }
export interface PaymentTerm { id: string; code: string; name: string; days: number }
export interface CostCenter { id: string; code: string; name: string }
export interface Project { id: string; code: string; name: string }

/** Append-only audit row written by every state-changing action. */
export interface AuditRow { id: string; at: string; userId: string; entity: string; entityId: string; action: string; detail: string }

export type SettingKey =
  | 'Agreements.EnforcementMode' | 'Agreements.FulfillmentBasis' | 'Agreements.ReturnsRestoreCommitment'
  | 'Agreements.OnFulfillmentFailure' | 'Currency.ConversionRateSource'
  | 'Reminder.Days' | 'Reminder.NoticeDays' | 'Renewal.GraceDays' | 'Approval.ReminderDays' | 'Approval.AllowCreatorApproval'
  | 'Feature.Obligations' | 'Feature.Templates' | 'Feature.Service' | 'Feature.ESignature' | 'Feature.RecurringBilling'
export type SettingValue = string | number | boolean

export interface Notice { id: string; at: string; text: string; tone: 'info' | 'warn' | 'danger'; seen: boolean }

export interface DB {
  /** Current role and user (role switcher). */
  role: RoleId
  userId: string
  /** Demo "today" (YYYY-MM-DD). Business logic reads it through asof.ts. */
  asOf: string
  /** When true, mockApi calls fail (to show error states). */
  simulateError: boolean
  settings: Record<SettingKey, SettingValue>
  rolePerms: Record<RoleId, Perm[]>
  organizations: Organization[]
  users: AppUser[]
  employees: Employee[]
  partners: Partner[]
  currencies: Currency[]
  rates: ExchangeRate[]
  uoms: Uom[]
  categories: Category[]
  items: Item[]
  paymentTerms: PaymentTerm[]
  costCenters: CostCenter[]
  projects: Project[]
  audit: AuditRow[]
  notices: Notice[]
}
