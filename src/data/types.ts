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

// ───────────── Module 1: contracts ─────────────
export type ContractStatus =
  | 'Draft' | 'PendingApproval' | 'Approved' | 'PendingSignature' | 'Active' | 'OnHold' | 'Expired' | 'Terminated' | 'Cancelled' | 'Closed'
export type ContractProfile = 'General' | 'Agreement' | 'Service'
export type Direction = 'Outgoing' | 'Incoming' | 'Internal'
export type Confidentiality = 'Normal' | 'Confidential' | 'Restricted'
export type RenewalPolicy = 'None' | 'Manual' | 'Auto'
export type TypeCategory = 'Sales' | 'Procurement' | 'Service' | 'Legal' | 'Lease' | 'Project' | 'Other'
export type PartyRole = 'Counterparty' | 'Guarantor' | 'Witness' | 'Subcontractor' | 'Beneficiary' | 'Other'
export type SignatureMethod = 'Wet' | 'Uploaded' | 'ExternalProvider'
export type ClosureReason = 'Completed' | 'Renewed' | 'Archived'
export type LinkType = 'Source' | 'Release' | 'Fulfillment' | 'Invoice' | 'Related'

export interface ContractType {
  id: string; code: string; prefix: string; name: string; category: TypeCategory; profile: ContractProfile; defaultDirection: Direction
  requiresSignature: boolean; requiredSignatureRoles: string[]; requiresApproval: boolean
  renewalPolicyDefault: RenewalPolicy; defaultDurationMonths?: number; noticePeriodDaysDefault?: number
  renewalGraceDays?: number; reminderDaysDefault?: string
  /** Nullable overrides of the system settings (null = use the setting). */
  enforcementMode?: 'None' | 'Warn' | 'Block'; fulfillmentBasis?: 'Order' | 'Delivery' | 'Invoice'; returnsRestoreCommitment?: boolean
  isOpenEnded: boolean; requiresContractValue: boolean; requiresPaymentTerm: boolean; defaultConfidentiality: Confidentiality
  allowManualNumber: boolean; isActive: boolean
}

export interface Contract {
  id: string; number: string; title: string; typeId: string; profile: ContractProfile; direction: Direction; status: ContractStatus; versionNo: number
  counterpartyId?: string; counterpartyName?: string; ownerUserId: string; responsibleEmployeeId?: string; organizationId: string
  projectId?: string; costCenterId?: string; currency: CurrencyCode; exchangeRate?: number; contractValue?: number
  paymentTermId?: string; deliveryTerms?: string
  startDate: string; endDate?: string; signatureDate?: string; effectiveDate?: string; terminationDate?: string
  renewalPolicy: RenewalPolicy; noticePeriodDays?: number; autoRenewTermMonths?: number; reminderDaysOverride?: string
  confidentiality: Confidentiality; language: 'ar'; externalReference?: string
  parentContractId?: string; renewedFromContractId?: string
  agreementMode?: 'Specific' | 'General'; overridesPrices: boolean
  closureReason?: ClosureReason; activatedOn?: string; activatedBy?: string
  description: string; internalNotes: string; createdBy: string; createdAt: string
}

export interface ContractParty {
  id: string; contractId: string; role: PartyRole; partnerId?: string; name: string; contactName: string; email: string; phone: string
  signatoryTitle: string; isPrimary: boolean
}
export interface ContractSignature {
  id: string; contractId: string; partyId?: string; role: string; signerName: string; signerTitle: string; signedOn: string
  method: SignatureMethod; attachmentId?: string; externalSignatureId?: string
}
export interface StatusHistory {
  id: string; contractId: string; from?: ContractStatus; to: ContractStatus; byUserId: string; at: string; reason?: string
}
export interface DocumentLink { id: string; contractId: string; linkType: LinkType; docType: string; docId: string; docRef: string; docDate: string }

/** Agreement/Service commitment line (full engine in module 3). */
export interface ContractLine {
  id: string; contractId: string; lineNum: number; itemId?: string; categoryId?: string; includeSubcategories?: boolean; description: string; uomId?: string
  commitmentType: 'Quantity' | 'Value'; agreedQuantity?: number; agreedValue?: number; unitPrice: number; discountPercent: number
  priceFixed: boolean; enforceMax: boolean; minRelease?: number; maxRelease?: number; validFrom?: string; validTo?: string
  status: 'Open' | 'Closed'; notes: string
}

export interface ContractAttachmentRow {
  id: string; ownerType: 'contract'; ownerId: string; subType: 'Draft' | 'Signed' | 'Appendix' | 'Other'
  fileName: string; size: number; contentType: string; uploadedBy: string; uploadedAt: string; version: number
}

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
  contractTypes: ContractType[]
  contracts: Contract[]
  parties: ContractParty[]
  signatures: ContractSignature[]
  history: StatusHistory[]
  links: DocumentLink[]
  lines: ContractLine[]
  attachments: ContractAttachmentRow[]
  /** Alert keys the current user marked as read. */
  alertsSeen: string[]
  /** Per-type sequence counters for contract numbers. */
  numbering: Record<string, number>
}
