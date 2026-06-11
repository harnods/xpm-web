<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — My claims › Request reimbursement
  Source: Figma My-Claims — nodes 1908-116192 (base), 7347-145764 (subcategory flow),
          7347-153327 (Add item drawer, filled)
  Token mode: Pixel 2.4
  Patterns used: layout-shell, form-view, data-table, upload-flow, filter (multi-select popover), drawer
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  BEHAVIOR:
    - Transaction date defaults to today
    - Pick a Claim category →
        · category WITHOUT subcategories → simple fields (Amount, Vendor, Receipt, Description)
        · category WITH subcategories    → Reimbursement item table + Add item drawer
    - BOTH variants keep the Additional details section
    - Document arrival/Document dates seeded coherently off today (never a hardcoded year)

  OPEN ITEMS:
    - Implements the `reimbursement` type only. `cash-advance` / `reimbursement-upload`
      route here too but are out of scope for this screen.
-->
<script setup lang="ts">
import {
  MpFlex, MpText,
  MpButton,
  MpFormControl, MpFormLabel, MpFormHelpText,
  MpInput, MpInputGroup, MpInputLeftAddon, MpTextarea,
  MpSelect, MpAutocomplete, MpRadio, MpCheckbox,
  MpDatePicker,
  MpUpload, MpUploadList,
  MpBanner, MpBannerIcon, MpBannerDescription,
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
  MpDrawer, MpDrawerOverlay, MpDrawerContent, MpDrawerHeader, MpDrawerCloseButton,
  MpDrawerBody, MpDrawerFooter,
  css,
  toast,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Request reimbursement',
  breadcrumbParent: { label: 'My claims', path: '/my-claims' },
})

const router = useRouter()

// ─── Copy constants ───────────────────────────────────────────────
const RECEIPT_HELP   = 'Files must be in JPG, JPEG, PNG, PDF, CSV, XLS, XLSX with a max size of 5MB. You can upload up to 5 files.'
const REF_HELP       = 'Reference number can be document number'
const CODE_NAME_HELP = 'Code name connector from procurement'
const ITEM_INFO      = 'Some item details are not shown in this table. Select the view icon on each item to see full details.'
const ITEM_DESC      = 'Add the expense details, including description, vendor, amount, and attach receipts for reimbursement.'
const ACCEPT         = '.jpg,.jpeg,.png,.pdf,.csv,.xls,.xlsx'

// ─── Types ────────────────────────────────────────────────────────
interface ClaimCategory {
  id: string; name: string
  type: 'international' | 'domestic'
  currencies: string[]
  subcategories: string[]
  weeklyLimit: number
}
interface UploadFile    { name: string; size: string }
interface ReimbursementItem {
  subcategory: string; vendor: string; amount: string; currency: string; description: string
  attachments: UploadFile[]
  codeNameConnector: string; variant: string
}
interface BankAccount {
  id: string; currency: string; country: string
  accountHolder: string; accountNumber: string
  bsbCode?: string; accountType?: 'business' | 'individual'; nationality?: string
}

// ─── Mock data ────────────────────────────────────────────────────
const ALL_CURRENCIES = [
  { code: 'AUD', name: 'Australian dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British pound' },
  { code: 'SGD', name: 'Singapore dollar' },
  { code: 'USD', name: 'US dollar' },
]
const DOMESTIC_CURRENCY = 'Rp'

function getCurrencyLabel(code: string): string {
  if (code === DOMESTIC_CURRENCY) return 'Rp - Indonesian rupiah'
  const c = ALL_CURRENCIES.find(c => c.code === code)
  return c ? `${code} - ${c.name}` : code
}

const CLAIM_CATEGORIES: ClaimCategory[] = [
  { id: 'transportation',  name: 'Transportation',  type: 'international', currencies: ['AUD', 'USD', 'SGD'], subcategories: ['Car Rentals', 'Parking', 'Fuel', 'Public Transport', 'Toll Fee'], weeklyLimit: 5_000_000 },
  { id: 'entertainment',   name: 'Entertainment',   type: 'domestic',      currencies: [],                   subcategories: ['Client Dinner', 'Team Outing', 'Event Tickets'],                  weeklyLimit: 3_000_000 },
  { id: 'equipment',       name: 'Equipment',       type: 'international', currencies: ['USD', 'EUR', 'GBP'], subcategories: [], weeklyLimit: 10_000_000 },
  { id: 'office-supplies', name: 'Office Supplies', type: 'domestic',      currencies: [],                   subcategories: [], weeklyLimit: 2_000_000 },
  { id: 'software',        name: 'Software',        type: 'domestic',      currencies: [],                   subcategories: [], weeklyLimit: 10_000_000 },
]

const MOCK_BANK_ACCOUNTS: BankAccount[] = [
  { id: 'ba-1', currency: 'AUD', country: 'Australia', accountHolder: 'Rizal Candra',  accountNumber: '1234567890', bsbCode: '062-000', accountType: 'individual', nationality: 'Indonesia' },
  { id: 'ba-2', currency: 'AUD', country: 'Australia', accountHolder: 'Bayu Ferdian',  accountNumber: '9876543210', bsbCode: '062-001', accountType: 'business' },
  { id: 'ba-3', currency: 'USD', country: 'USA',        accountHolder: 'Citra Purnama', accountNumber: '1122334455' },
  { id: 'ba-4', currency: 'SGD', country: 'Singapore',  accountHolder: 'Rizal Candra',  accountNumber: '5544332211' },
]

const BANK_COUNTRIES = ['Australia', 'USA', 'Singapore', 'United Kingdom', 'Germany']

const PRIORITIES = [
  { id: 'p1', name: 'P1 - High' },
  { id: 'p2', name: 'P2 - Medium' },
  { id: 'p3', name: 'P3 - Low' },
]
const PICS = [
  { id: 'bayu-ferdian',  name: 'Bayu Ferdian' },
  { id: 'rizal-candra',  name: 'Rizal Candra' },
  { id: 'citra-purnama', name: 'Citra Purnama' },
]
const CLIENT_INDUSTRIES = [
  { id: 'agriculture',   name: 'Agriculture, Food, and Forestry' },
  { id: 'energy-mining', name: 'Energy and Mining' },
  { id: 'manufacturing', name: 'Manufacturing' },
  { id: 'retail',        name: 'Retail' },
  { id: 'technology',    name: 'Technology' },
]
const RELATIONS = [
  { id: 'self', name: 'Self' }, { id: 'spouse', name: 'Spouse' }, { id: 'child', name: 'Child' },
  { id: 'parents', name: 'Parents' }, { id: 'grand-parents', name: 'Grand Parents' },
]
const COMPANIONS = [
  { id: 'spouse', name: 'Spouse' }, { id: 'child', name: 'Child' }, { id: '2-children', name: '2 Children' },
  { id: 'parents', name: 'Parents' }, { id: 'grand-parents', name: 'Grand Parents' },
]

// ─── Helpers ──────────────────────────────────────────────────────
function formatThousands(val: string): string {
  const digits = String(val).replace(/\D/g, '')
  return digits ? Number(digits).toLocaleString('id-ID') : ''
}
function parseAmount(s: string): number { return Number(String(s).replace(/\D/g, '')) || 0 }
function formatRp(n: number): string { return 'Rp' + n.toLocaleString('id-ID') }
function formatAmount(n: number, currency: string): string {
  const formatted = n.toLocaleString('id-ID')
  return currency === DOMESTIC_CURRENCY ? `${DOMESTIC_CURRENCY}${formatted}` : `${currency} ${formatted}`
}
function addDays(d: Date, days: number): Date { const r = new Date(d); r.setDate(r.getDate() + days); return r }

// ─── Top-level form state ─────────────────────────────────────────
const today = new Date()

const categoryId      = ref('')
const transactionDate = ref<Date>(new Date(today))

const selectedCategory  = computed(() => CLAIM_CATEGORIES.find(c => c.id === categoryId.value))
const hasSubcategories  = computed(() => (selectedCategory.value?.subcategories.length ?? 0) > 0)
const weeklyLimit       = computed(() => selectedCategory.value?.weeklyLimit ?? 10_000_000)
const isInternational   = computed(() => selectedCategory.value?.type === 'international')
const categoryCurrencies = computed(() =>
  isInternational.value ? (selectedCategory.value?.currencies ?? []) : [DOMESTIC_CURRENCY]
)

// ─── Currency (shared state for both variants) ────────────────────
const selectedCurrency = ref('')
const lockedCurrency   = ref('')   // locked after first item saved (Variant B)
const displayCurrency  = computed(() =>
  isInternational.value ? (selectedCurrency.value || categoryCurrencies.value[0] || DOMESTIC_CURRENCY) : DOMESTIC_CURRENCY
)

// ─── Bank account ─────────────────────────────────────────────────
const selectedBankAccountId = ref('')
const filteredBankAccounts  = computed(() =>
  MOCK_BANK_ACCOUNTS.filter(b => b.currency === displayCurrency.value)
)
const isAddBankDrawerOpen = ref(false)
const bankDraft = ref({
  country: '', accountType: 'individual' as 'business' | 'individual',
  nationality: '', bsbCode: '', accountNumber: '', accountHolder: '',
})

function openAddBankDrawer() {
  bankDraft.value = { country: '', accountType: 'individual', nationality: '', bsbCode: '', accountNumber: '', accountHolder: '' }
  isAddBankDrawerOpen.value = true
}
function saveBankAccount() {
  const newAccount: BankAccount = {
    id: `ba-${Date.now()}`,
    currency: displayCurrency.value,
    country: bankDraft.value.country,
    accountHolder: bankDraft.value.accountHolder,
    accountNumber: bankDraft.value.accountNumber,
    ...(bankDraft.value.bsbCode ? { bsbCode: bankDraft.value.bsbCode } : {}),
    accountType: bankDraft.value.accountType,
    ...(bankDraft.value.accountType === 'individual' && bankDraft.value.nationality ? { nationality: bankDraft.value.nationality } : {}),
  }
  MOCK_BANK_ACCOUNTS.push(newAccount)
  selectedBankAccountId.value = newAccount.id
  isAddBankDrawerOpen.value = false
  toast.notify({ variant: 'success', title: 'Bank account added', position: 'top-center' })
}

// ─── Variant A — simple fields (empty until a category is chosen) ──
const amount        = ref('')
const vendor        = ref('')
const receiptFiles  = ref<UploadFile[]>([])
const description   = ref('')

// ─── Variant B — reimbursement items (empty until a subcategory category is chosen) ──
const items = ref([] as ReimbursementItem[])
const totalAmount = computed(() => items.value.reduce((s, it) => s + parseAmount(it.amount), 0))

// ─── Add item drawer ──────────────────────────────────────────────
const blankDraft = (): ReimbursementItem => ({
  subcategory: '', vendor: '', amount: '', currency: '', description: '', attachments: [], codeNameConnector: '', variant: '',
})
const drawerOpen     = ref(false)
const drawerReadOnly = ref(false)
const editIndex      = ref<number | null>(null)
const draft          = ref<ReimbursementItem>(blankDraft())

function openAddItem() {
  editIndex.value = null
  drawerReadOnly.value = false
  draft.value = {
    ...blankDraft(),
    currency: lockedCurrency.value || categoryCurrencies.value[0] || DOMESTIC_CURRENCY,
  }
  drawerOpen.value = true
}
function openItem(i: number, readOnly: boolean) {
  editIndex.value = i
  drawerReadOnly.value = readOnly
  const it = items.value[i]
  draft.value = { ...it, attachments: it.attachments.map(a => ({ ...a })) }
  drawerOpen.value = true
}
function removeItem(i: number) { items.value.splice(i, 1) }
function saveItem() {
  if (!lockedCurrency.value && isInternational.value) {
    lockedCurrency.value = draft.value.currency || categoryCurrencies.value[0] || DOMESTIC_CURRENCY
  }
  const payload: ReimbursementItem = { ...draft.value, attachments: draft.value.attachments.map(a => ({ ...a })) }
  if (editIndex.value === null) items.value.push(payload)
  else items.value[editIndex.value] = payload
  drawerOpen.value = false
}

// ─── Additional details (empty until a category is chosen) ──
const referenceNumber           = ref('')
const additionalReferenceNumber = ref('')
const documentArrivalDate       = ref<Date | null>(null)
const documentDate              = ref<Date | null>(null)
const priority                  = ref('')
const pic                       = ref('')
const clientIndustries          = ref<string[]>([])
const relation                  = ref('')
const companions                = ref<string[]>([])
const approvalFiles             = ref<UploadFile[]>([])
const purpose = ref('')
const notes   = ref('')

// ─── Sample data — fills when a category is chosen, clears when removed ──
function seedItems(): ReimbursementItem[] {
  return [
    {
      subcategory: 'Car Rentals', vendor: 'Silverbird', amount: '2.700.000', currency: 'AUD',
      description: 'Car rental costs covered under reimbursement policy',
      attachments: [
        { name: 'Invoice-perjalanan-1.jpg', size: '200kb' },
        { name: 'Invoice-perjalanan-2.jpg', size: '200kb' },
      ],
      codeNameConnector: 'SQ1947', variant: 'Langsung sampai',
    },
    {
      subcategory: 'Parking', vendor: 'ISS Parking', amount: '11.000', currency: 'AUD',
      description: '4 Hours parking', attachments: [],
      codeNameConnector: 'SQ1948', variant: '',
    },
  ]
}

function fillSampleData(cat: ClaimCategory) {
  if (cat.subcategories.length) {
    items.value = seedItems()
    // Lock currency to the first item's currency when seeding
    if (cat.type === 'international') lockedCurrency.value = cat.currencies[0] ?? ''
    amount.value = ''; vendor.value = ''; receiptFiles.value = []; description.value = ''
  } else {
    amount.value = '5.000.000'
    vendor.value = 'Bluebird'
    receiptFiles.value = [
      { name: 'Invoice-perjalanan-1.jpg', size: '200kb' },
      { name: 'Invoice-perjalanan-2.jpg', size: '200kb' },
    ]
    description.value = 'Perjalanan dinas akhir tahun'
    items.value = []
  }
  // Prefill bank account for international categories
  if (cat.type === 'international') {
    const firstCur = cat.currencies[0]
    const match = MOCK_BANK_ACCOUNTS.find(b => b.currency === firstCur)
    selectedBankAccountId.value = match?.id ?? ''
  }
  // Shared additional details
  referenceNumber.value = 'RF02145938'
  additionalReferenceNumber.value = 'PD21173245'
  documentArrivalDate.value = addDays(today, -1)
  documentDate.value = new Date(today)
  priority.value = 'p1'
  pic.value = 'bayu-ferdian'
  clientIndustries.value = ['agriculture', 'energy-mining', 'manufacturing', 'retail']
  relation.value = 'self'
  companions.value = ['spouse', 'child', '2-children']
  approvalFiles.value = [
    { name: 'Documentation-1895', size: '253 KB' },
    { name: 'Documentation-1895', size: '253 KB' },
    { name: 'Documentation-1895', size: '253 KB' },
  ]
  purpose.value = 'Funds required for local transportation during project X'
}

function clearSampleData() {
  amount.value = ''; vendor.value = ''; receiptFiles.value = []; description.value = ''
  items.value = []; lockedCurrency.value = ''; selectedBankAccountId.value = ''
  referenceNumber.value = ''; additionalReferenceNumber.value = ''
  documentArrivalDate.value = null; documentDate.value = null
  priority.value = ''; pic.value = ''
  clientIndustries.value = []; relation.value = ''; companions.value = []
  approvalFiles.value = []; purpose.value = ''; notes.value = ''
}

watch(categoryId, (id) => {
  const cat = CLAIM_CATEGORIES.find(c => c.id === id)
  selectedCurrency.value = cat?.type === 'international' ? (cat.currencies[0] ?? '') : ''
  lockedCurrency.value   = ''
  selectedBankAccountId.value = ''
  if (cat) fillSampleData(cat)
  else clearSampleData()
})

const clientIndustryLabel = computed(() =>
  clientIndustries.value.length ? `Selected (${clientIndustries.value.length})` : 'Select client industry',
)
const clientIndustryHint = computed(() => {
  const names = clientIndustries.value
    .map(id => CLIENT_INDUSTRIES.find(c => c.id === id)?.name)
    .filter(Boolean) as string[]
  if (!names.length) return ''
  const shown = names.slice(0, 3)
  const more = names.length - shown.length
  return 'including ' + shown.join(', ') + (more > 0 ? `, +${more} more` : '')
})
function toggleIndustry(id: string) {
  const i = clientIndustries.value.indexOf(id)
  if (i >= 0) clientIndustries.value.splice(i, 1)
  else clientIndustries.value.push(id)
}

// ─── Upload handling (prototype: track name + size only) ──────────
function onUploadChange(e: Event, target: UploadFile[]) {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  for (const f of Array.from(input.files)) {
    target.push({ name: f.name, size: `${Math.max(1, Math.round(f.size / 1024))} KB` })
  }
  input.value = ''
}

// ─── Submit ───────────────────────────────────────────────────────
const submitting = ref(false)
function cancel() { router.push('/my-claims') }
async function submit() {
  submitting.value = true
  await new Promise(r => setTimeout(r, 600))
  submitting.value = false
  toast.notify({ variant: 'success', title: 'Reimbursement request submitted', position: 'top-center' })
  router.push('/my-claims')
}

// ─── Styles ───────────────────────────────────────────────────────
const page    = css({ maxWidth: '780px' })
const field   = css({ maxWidth: '360px' })
const twoCol  = css({ display: 'grid', gridTemplateColumns: 'minmax(0,360px) minmax(0,360px)', gap: '4' })
const wide    = css({ maxWidth: '736px' })

const stickyFooter = css({
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
  gap: 'var(--mp-spacing-3)', paddingTop: 'var(--mp-spacing-6)',
  paddingBottom: 'var(--mp-spacing-8)', width: '100%',
})

// Currency chip inside the amount left addon
const currencyTrigger = css({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: '1', border: 'none', outline: 'none', background: 'transparent',
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default',
  cursor: 'pointer', paddingX: '2', paddingY: '0',
})

// Multi-select trigger (matches MpInput outline)
const selectTrigger = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  width: 'full', minHeight: '40px',
  border: '1px solid var(--mp-colors-border-form, rgba(29,31,36,.16))',
  borderRadius: '6px', paddingX: '3',
  fontFamily: 'body', fontSize: 'md', color: 'dark',
  background: 'transparent', cursor: 'pointer', outline: 'none',
  _focusVisible: { boxShadow: 'focus', borderColor: 'border.focused' },
})
const selectLabel = css({
  flex: '1', minWidth: '0', textAlign: 'left',
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
})

// Item table
const th = css({
  bg: 'gray.25', fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold',
  lineHeight: 'lg', color: 'dark', paddingLeft: '3', paddingRight: '4', paddingBlock: '3',
  borderBottom: '1px solid', borderBottomColor: 'gray.100',
  textAlign: 'left', whiteSpace: 'nowrap', verticalAlign: 'middle',
})
const td = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'dark',
  paddingLeft: '3', paddingRight: '4', paddingBlock: '3',
  borderBottom: '1px solid', borderBottomColor: 'gray.100', verticalAlign: 'middle',
})
const tdRight = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'dark',
  paddingLeft: '3', paddingRight: '4', paddingBlock: '3',
  borderBottom: '1px solid', borderBottomColor: 'gray.100',
  verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap',
})
</script>

<template>
  <div :class="page">

    <!-- ═════ Basic fields ═════ -->
    <MpFlex direction="column" gap="5" :style="{ marginBottom: hasSubcategories ? 'var(--mp-spacing-8)' : 'var(--mp-spacing-5)' }">
      <!-- Claim category -->
      <MpFormControl id="claim-category" isRequired :class="field">
        <MpFormLabel>Claim category</MpFormLabel>
        <MpAutocomplete
          id="autocomplete-category"
          v-model="categoryId"
          :data="CLAIM_CATEGORIES"
          label-prop="name"
          value-prop="id"
          placeholder="Select claim category"
          is-searchable
          is-clearable
          use-portal
        />
      </MpFormControl>

      <!-- Transaction date (defaults to today) -->
      <MpFormControl id="transaction-date" isRequired :class="field">
        <MpFormLabel>Transaction date</MpFormLabel>
        <MpDatePicker
          id="datepicker-transaction"
          v-model="transactionDate"
          format="ddd, DD MMM YYYY"
          value-type="date"
          placeholder="Select date"
          :use-portal="true"
        />
      </MpFormControl>
    </MpFlex>

    <!-- Default = non-subcategory form (always visible, prefilled);
         the item table replaces the simple fields only when the chosen category has subcategories -->

      <!-- ═════ Variant B — Reimbursement item table ═════ -->
      <MpFlex v-if="hasSubcategories" direction="column" gap="4" marginBottom="8">
        <MpFlex direction="column" gap="1">
          <MpText size="h2" weight="semiBold" color="dark">Reimbursement item</MpText>
          <MpText size="body" color="gray.600">{{ ITEM_DESC }}</MpText>
        </MpFlex>

        <MpBanner variant="info" is-inline>
          <MpBannerIcon id="banner-item-icon" />
          <MpBannerDescription id="banner-item-desc">{{ ITEM_INFO }}</MpBannerDescription>
        </MpBanner>

        <div style="overflow-x:auto;">
          <table style="width:100%; min-width:720px; border-collapse:collapse;">
            <thead>
              <tr>
                <th :class="th">Subcategory</th>
                <th :class="th">Vendor</th>
                <th :class="th">Attachment</th>
                <th :class="th">Description</th>
                <th :class="th" style="text-align:right;">Amount</th>
                <th :class="th" style="width:120px;" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="(it, i) in items" :key="i">
                <td :class="td">{{ it.subcategory }}</td>
                <td :class="td">{{ it.vendor }}</td>
                <td :class="td">
                  <MpButton v-if="it.attachments.length" variant="textLink" size="sm" @click="openItem(i, true)">
                    View attachment
                  </MpButton>
                  <MpText v-else size="body" color="gray.400">—</MpText>
                </td>
                <td :class="td">{{ it.description || '—' }}</td>
                <td :class="tdRight">{{ formatAmount(parseAmount(it.amount), it.currency || lockedCurrency || displayCurrency) }}</td>
                <td :class="tdRight">
                  <MpFlex align="center" gap="1" justify="flex-end">
                    <MpButton variant="ghost" size="sm" left-icon="show" aria-label="View item" @click="openItem(i, true)" />
                    <MpButton variant="ghost" size="sm" left-icon="edit" aria-label="Edit item" @click="openItem(i, false)" />
                    <MpButton variant="ghost" size="sm" left-icon="minus-circular" aria-label="Remove item" @click="removeItem(i)" />
                  </MpFlex>
                </td>
              </tr>
              <!-- Total row -->
              <tr>
                <td :class="td" colspan="4">
                  <MpText size="body" weight="semiBold" color="dark">Total reimbursement amount</MpText>
                  <MpText size="body-small" color="gray.600">
                    Remaining balance for this week: {{ formatAmount(weeklyLimit, lockedCurrency || displayCurrency) }}
                  </MpText>
                </td>
                <td :class="tdRight">
                  <MpText size="body" weight="semiBold" color="dark">{{ formatAmount(totalAmount, lockedCurrency || displayCurrency) }}</MpText>
                </td>
                <td :class="td" />
              </tr>
            </tbody>
          </table>
        </div>

        <MpButton variant="secondary" size="md" left-icon="add" style="align-self:flex-start;" @click="openAddItem">
          Add item
        </MpButton>

        <!-- Bank account details (international only) -->
        <template v-if="isInternational">
          <MpFlex direction="column" gap="4">
            <MpFlex direction="column" gap="1">
              <MpText as="h2" size="h2" weight="semiBold" color="dark">Bank account details</MpText>
              <MpText size="body" color="gray.600">Select the bank account for this reimbursement. Make sure the account matches the selected currency.</MpText>
            </MpFlex>
            <MpFormControl id="bank-account-b" isRequired :class="field">
              <MpFormLabel>Bank account</MpFormLabel>
              <MpAutocomplete
                id="autocomplete-bank-account-b"
                v-model="selectedBankAccountId"
                :data="filteredBankAccounts"
                label-prop="accountHolder"
                value-prop="id"
                placeholder="Select bank account"
                is-searchable
                is-show-button-action
                is-clearable
                use-portal
                @button-action="openAddBankDrawer"
              >
                <template #default="{ item }">
                  <div style="display:flex;flex-direction:column;gap:2px;padding:2px 0;">
                    <div style="font-size:var(--mp-fontSizes-sm);color:var(--mp-colors-gray-600);line-height:1.4;">{{ item.currency }} — {{ item.country }}</div>
                    <div style="font-size:var(--mp-fontSizes-md);color:var(--mp-colors-dark);line-height:1.4;">{{ item.accountHolder }}</div>
                    <div style="font-size:var(--mp-fontSizes-sm);color:var(--mp-colors-gray-600);line-height:1.4;">{{ item.accountNumber }}</div>
                  </div>
                </template>
                <template #buttonAction>+ New bank account</template>
              </MpAutocomplete>
            </MpFormControl>
          </MpFlex>
        </template>
      </MpFlex>

      <!-- ═════ Variant A — simple fields ═════ -->
      <MpFlex v-else direction="column" gap="5" marginBottom="8">
        <!-- Amount -->
        <MpFormControl id="amount" isRequired :class="field">
          <MpFormLabel>Amount</MpFormLabel>

          <!-- International → currency dropdown in left addon -->
          <template v-if="isInternational">
            <MpPopover id="amount-currency-popover" is-close-on-select use-portal is-adaptive-width placement="bottom-start">
              <MpPopoverTrigger>
                <MpInputGroup style="width:100%;">
                  <MpInputLeftAddon has-background>
                    <button :class="currencyTrigger">
                      {{ displayCurrency }}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                  </MpInputLeftAddon>
                  <MpInput :modelValue="amount" placeholder="0" :isFullWidth="true"
                    @click.stop
                    @input="(e: Event) => (amount = formatThousands((e.target as HTMLInputElement).value))" />
                </MpInputGroup>
              </MpPopoverTrigger>
              <MpPopoverContent :class="css({ marginTop: '2px' })">
                <MpPopoverList>
                  <MpPopoverListItem v-for="code in categoryCurrencies" :key="code"
                    :is-active="displayCurrency === code"
                    @click="selectedCurrency = code; selectedBankAccountId = ''">
                    {{ getCurrencyLabel(code) }}
                  </MpPopoverListItem>
                </MpPopoverList>
              </MpPopoverContent>
            </MpPopover>
          </template>

          <!-- Domestic → fixed Rp -->
          <template v-else>
            <MpInputGroup style="width:100%;">
              <MpInputLeftAddon has-background><MpText size="body" weight="semiBold">Rp</MpText></MpInputLeftAddon>
              <MpInput :modelValue="amount" placeholder="0" :isFullWidth="true"
                @input="(e: Event) => (amount = formatThousands((e.target as HTMLInputElement).value))" />
            </MpInputGroup>
          </template>

          <MpFormHelpText v-if="selectedCategory">Available limit: {{ formatAmount(weeklyLimit, displayCurrency) }}</MpFormHelpText>
        </MpFormControl>

        <!-- Vendor -->
        <MpFormControl id="vendor" isRequired :class="field">
          <MpFormLabel>Vendor</MpFormLabel>
          <MpInput id="input-vendor" v-model="vendor" placeholder="Enter vendor" :isFullWidth="true" />
        </MpFormControl>

        <!-- Receipt -->
        <MpFormControl id="receipt" isRequired :class="wide">
          <MpFormLabel>Receipt</MpFormLabel>
          <div :class="field">
            <MpUpload
              button-text="Browse file"
              :is-multiple="true"
              :accept="ACCEPT"
              :placeholder="receiptFiles.length ? `${receiptFiles.length} files selected` : 'No file selected'"
              @change="(e: Event) => onUploadChange(e, receiptFiles)"
            />
          </div>
          <MpFormHelpText>{{ RECEIPT_HELP }}</MpFormHelpText>
          <MpFlex direction="column" gap="2" marginTop="3" :class="field">
            <MpUploadList
              v-for="(f, i) in receiptFiles" :id="`receipt-file-${i}`" :key="i"
              :title="f.name" :subtitle="f.size" status="success" icon-name="doc" icon-variant="outline"
              :is-show-remove-button="true" @remove="receiptFiles.splice(i, 1)"
            />
          </MpFlex>
        </MpFormControl>

        <!-- Description -->
        <MpFormControl id="description" :class="wide">
          <MpFlex justify="space-between" align="flex-end">
            <MpFormLabel>Description</MpFormLabel>
            <MpText size="body-small" color="gray.400">{{ description.length }} / 600</MpText>
          </MpFlex>
          <MpTextarea id="textarea-description" v-model="description" placeholder="Enter description" :isFullWidth="true" maxlength="600" />
        </MpFormControl>

        <!-- Bank account details (international only) -->
        <template v-if="isInternational">
          <MpFlex direction="column" gap="4">
            <MpFlex direction="column" gap="1">
              <MpText as="h2" size="h2" weight="semiBold" color="dark">Bank account details</MpText>
              <MpText size="body" color="gray.600">Select the bank account for this reimbursement. Make sure the account matches the selected currency.</MpText>
            </MpFlex>
            <MpFormControl id="bank-account" isRequired :class="field">
              <MpFormLabel>Bank account</MpFormLabel>
              <MpAutocomplete
                id="autocomplete-bank-account"
                v-model="selectedBankAccountId"
                :data="filteredBankAccounts"
                label-prop="accountHolder"
                value-prop="id"
                placeholder="Select bank account"
                is-searchable
                is-show-button-action
                is-clearable
                use-portal
                @button-action="openAddBankDrawer"
              >
                <template #default="{ item }">
                  <div style="display:flex;flex-direction:column;gap:2px;padding:2px 0;">
                    <div style="font-size:var(--mp-fontSizes-sm);color:var(--mp-colors-gray-600);line-height:1.4;">{{ item.currency }} — {{ item.country }}</div>
                    <div style="font-size:var(--mp-fontSizes-md);color:var(--mp-colors-dark);line-height:1.4;">{{ item.accountHolder }}</div>
                    <div style="font-size:var(--mp-fontSizes-sm);color:var(--mp-colors-gray-600);line-height:1.4;">{{ item.accountNumber }}</div>
                  </div>
                </template>
                <template #buttonAction>+ New bank account</template>
              </MpAutocomplete>
            </MpFormControl>
          </MpFlex>
        </template>
      </MpFlex>

      <!-- ═════ Additional details (both variants) ═════ -->
      <MpFlex direction="column" gap="5" marginBottom="8">
        <MpText size="h2" weight="semiBold" color="dark">Additional details</MpText>

        <!-- Reference numbers -->
        <div :class="twoCol">
          <MpFormControl id="reference-number" isRequired>
            <MpFlex justify="space-between" align="flex-end">
              <MpFormLabel>Reference number</MpFormLabel>
              <MpText size="body-small" color="gray.400">{{ referenceNumber.length }} / 60</MpText>
            </MpFlex>
            <MpInput id="input-ref" v-model="referenceNumber" placeholder="Enter reference number" :isFullWidth="true" maxlength="60" />
            <MpFormHelpText>{{ REF_HELP }}</MpFormHelpText>
          </MpFormControl>

          <MpFormControl id="additional-reference-number">
            <MpFlex justify="space-between" align="flex-end">
              <MpFormLabel>Additional reference number</MpFormLabel>
              <MpText size="body-small" color="gray.400">{{ additionalReferenceNumber.length }} / 60</MpText>
            </MpFlex>
            <MpInput id="input-add-ref" v-model="additionalReferenceNumber" placeholder="Enter reference number" :isFullWidth="true" maxlength="60" />
          </MpFormControl>
        </div>

        <!-- Dates -->
        <div :class="twoCol">
          <MpFormControl id="document-arrival-date" isRequired>
            <MpFormLabel>Document arrival date</MpFormLabel>
            <MpDatePicker id="datepicker-arrival" v-model="documentArrivalDate" format="DD MMM YYYY" value-type="date" placeholder="Select date" :use-portal="true" />
          </MpFormControl>
          <MpFormControl id="document-date" isRequired>
            <MpFormLabel>Document date</MpFormLabel>
            <MpDatePicker id="datepicker-document" v-model="documentDate" format="DD MMM YYYY" value-type="date" placeholder="Select date" :use-portal="true" />
          </MpFormControl>
        </div>

        <!-- Priority + PIC -->
        <div :class="twoCol">
          <MpFormControl id="priority" isRequired>
            <MpFormLabel>Priority</MpFormLabel>
            <MpSelect id="select-priority" v-model="priority" placeholder="Select priority" :is-full-width="true">
              <option v-for="p in PRIORITIES" :key="p.id" :value="p.id">{{ p.name }}</option>
            </MpSelect>
          </MpFormControl>
          <MpFormControl id="pic" isRequired>
            <MpFormLabel>PIC</MpFormLabel>
            <MpSelect id="select-pic" v-model="pic" placeholder="Select pic" :is-full-width="true">
              <option v-for="p in PICS" :key="p.id" :value="p.id">{{ p.name }}</option>
            </MpSelect>
          </MpFormControl>
        </div>

        <!-- Client industry (multi-select) -->
        <MpFormControl id="client-industry" :class="field">
          <MpFormLabel>Client industry</MpFormLabel>
          <MpPopover id="client-industry-popover" use-portal placement="bottom-start">
            <MpPopoverTrigger>
              <button :class="selectTrigger">
                <span :class="selectLabel" :style="clientIndustries.length ? '' : 'color:var(--mp-colors-gray-400)'">
                  {{ clientIndustryLabel }}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </MpPopoverTrigger>
            <MpPopoverContent :class="css({ marginTop: '2px', minWidth: '320px' })">
              <MpPopoverList>
                <MpPopoverListItem v-for="c in CLIENT_INDUSTRIES" :key="c.id" @click="toggleIndustry(c.id)">
                  <span style="display:inline-flex;align-items:center;gap:8px;">
                    <span :style="`width:16px;height:16px;border-radius:4px;flex-shrink:0;pointer-events:none;display:flex;align-items:center;justify-content:center;border:1.5px solid ${clientIndustries.includes(c.id) ? 'var(--mp-colors-indigo-700,#4338CA)' : 'var(--mp-colors-gray-300,#D1D5DB)'};background:${clientIndustries.includes(c.id) ? 'var(--mp-colors-indigo-700,#4338CA)' : 'transparent'};`">
                      <svg v-if="clientIndustries.includes(c.id)" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    </span>
                    {{ c.name }}
                  </span>
                </MpPopoverListItem>
              </MpPopoverList>
            </MpPopoverContent>
          </MpPopover>
          <MpFormHelpText v-if="clientIndustryHint">{{ clientIndustryHint }}</MpFormHelpText>
        </MpFormControl>

        <!-- Relation -->
        <MpFormControl id="relation">
          <MpFormLabel>Relation</MpFormLabel>
          <MpFlex direction="column" gap="2" marginTop="1">
            <MpRadio v-for="r in RELATIONS" :id="`relation-${r.id}`" :key="r.id" name="relation" :value="r.id" v-model="relation">{{ r.name }}</MpRadio>
          </MpFlex>
        </MpFormControl>

        <!-- Companion -->
        <MpFormControl id="companion">
          <MpFormLabel>Companion</MpFormLabel>
          <MpFlex direction="column" gap="2" marginTop="1">
            <MpCheckbox v-for="c in COMPANIONS" :id="`companion-${c.id}`" :key="c.id" :value="c.id" v-model="companions">{{ c.name }}</MpCheckbox>
          </MpFlex>
        </MpFormControl>

        <!-- Approval documentation -->
        <MpFormControl id="approval-documentation" isRequired :class="wide">
          <MpFormLabel>Approval documentation</MpFormLabel>
          <div :class="field">
            <MpUpload
              button-text="Browse file"
              :is-multiple="true"
              :accept="ACCEPT"
              :placeholder="approvalFiles.length ? `${approvalFiles.length} files selected` : 'No file selected'"
              @change="(e: Event) => onUploadChange(e, approvalFiles)"
            />
          </div>
          <MpFlex direction="column" gap="2" marginTop="3" :class="field">
            <MpUploadList
              v-for="(f, i) in approvalFiles" :id="`approval-file-${i}`" :key="i"
              :title="f.name" :subtitle="f.size" status="success" icon-name="doc" icon-variant="outline"
              :is-show-remove-button="true" @remove="approvalFiles.splice(i, 1)"
            />
          </MpFlex>
        </MpFormControl>

        <!-- Purpose/reason -->
        <MpFormControl id="purpose" :class="wide">
          <MpFlex justify="space-between" align="flex-end">
            <MpFormLabel>Purpose/reason</MpFormLabel>
            <MpText size="body-small" color="gray.400">{{ purpose.length }} / 200</MpText>
          </MpFlex>
          <MpTextarea id="textarea-purpose" v-model="purpose" placeholder="Enter purpose or reason" :isFullWidth="true" maxlength="200" />
        </MpFormControl>

        <!-- Notes -->
        <MpFormControl id="notes" :class="wide">
          <MpFlex justify="space-between" align="flex-end">
            <MpFormLabel>Notes</MpFormLabel>
            <MpText size="body-small" color="gray.400">{{ notes.length }} / 200</MpText>
          </MpFlex>
          <MpTextarea id="textarea-notes" v-model="notes" placeholder="Enter notes" :isFullWidth="true" maxlength="200" />
        </MpFormControl>
      </MpFlex>
  </div>

  <!-- ═════ Footer ═════ -->
  <div :class="stickyFooter">
    <MpButton variant="ghost" size="md" @click="cancel">Cancel</MpButton>
    <MpButton variant="primary" size="md" :isLoading="submitting" @click="submit">Submit</MpButton>
  </div>

  <!-- ═════ Add bank account drawer ═════ -->
  <MpDrawer id="add-bank-drawer" :is-open="isAddBankDrawerOpen" size="md" placement="right" is-block-scroll-on-mount @close="isAddBankDrawerOpen = false">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <MpText size="h2" weight="semiBold" color="dark">Add bank account</MpText>
        <MpDrawerCloseButton />
      </MpDrawerHeader>

      <MpDrawerBody>
        <MpFlex direction="column" gap="5">

          <!-- Country -->
          <MpFormControl id="bank-country" isRequired>
            <MpFormLabel>Country</MpFormLabel>
            <MpSelect id="select-bank-country" v-model="bankDraft.country" placeholder="Select country" :is-full-width="true">
              <option v-for="c in BANK_COUNTRIES" :key="c" :value="c">{{ c }}</option>
            </MpSelect>
          </MpFormControl>

          <!-- Account type -->
          <MpFormControl id="bank-account-type" isRequired>
            <MpFormLabel>Account type</MpFormLabel>
            <MpFlex gap="6" marginTop="1">
              <MpRadio id="bank-type-business" name="bank-account-type" value="business" v-model="bankDraft.accountType">Business</MpRadio>
              <MpRadio id="bank-type-individual" name="bank-account-type" value="individual" v-model="bankDraft.accountType">Individual</MpRadio>
            </MpFlex>
          </MpFormControl>

          <!-- Nationality (individual only) -->
          <MpFormControl v-if="bankDraft.accountType === 'individual'" id="bank-nationality" isRequired>
            <MpFormLabel>Nationality</MpFormLabel>
            <MpInput id="input-bank-nationality" v-model="bankDraft.nationality" placeholder="Enter nationality" :isFullWidth="true" />
          </MpFormControl>

          <!-- BSB code (AUD / Australia) -->
          <MpFormControl v-if="displayCurrency === 'AUD' || bankDraft.country === 'Australia'" id="bank-bsb" isRequired>
            <MpFormLabel>BSB code</MpFormLabel>
            <MpInput id="input-bank-bsb" v-model="bankDraft.bsbCode" placeholder="e.g. 062-000" :isFullWidth="true" />
          </MpFormControl>

          <!-- Account number -->
          <MpFormControl id="bank-account-number" isRequired>
            <MpFormLabel>Account number</MpFormLabel>
            <MpInput id="input-bank-account-number" v-model="bankDraft.accountNumber" placeholder="Enter account number" :isFullWidth="true" />
          </MpFormControl>

          <!-- Account holder -->
          <MpFormControl id="bank-account-holder" isRequired>
            <MpFormLabel>Account holder</MpFormLabel>
            <MpInput id="input-bank-account-holder" v-model="bankDraft.accountHolder" placeholder="Enter account holder name" :isFullWidth="true" />
          </MpFormControl>

        </MpFlex>
      </MpDrawerBody>

      <MpDrawerFooter>
        <MpFlex align="center" justify="flex-end" gap="3" width="full">
          <MpButton variant="ghost" size="md" @click="isAddBankDrawerOpen = false">Cancel</MpButton>
          <MpButton variant="primary" size="md" @click="saveBankAccount">Save</MpButton>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>

  <!-- ═════ Add item drawer ═════ -->
  <MpDrawer id="add-item-drawer" :is-open="drawerOpen" size="md" placement="right" is-block-scroll-on-mount @close="drawerOpen = false">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <MpText size="h2" weight="semiBold" color="dark">{{ drawerReadOnly ? 'Item detail' : (editIndex === null ? 'Add item' : 'Edit item') }}</MpText>
        <MpDrawerCloseButton />
      </MpDrawerHeader>

      <MpDrawerBody>
        <MpFlex direction="column" gap="5">
          <!-- Subcategory -->
          <MpFormControl id="draft-subcategory" isRequired>
            <MpFormLabel>Subcategory</MpFormLabel>
            <MpSelect id="select-subcategory" v-model="draft.subcategory" placeholder="Select subcategory" :is-full-width="true" :is-disabled="drawerReadOnly">
              <option v-for="s in (selectedCategory?.subcategories ?? [])" :key="s" :value="s">{{ s }}</option>
            </MpSelect>
          </MpFormControl>

          <!-- Vendor -->
          <MpFormControl id="draft-vendor" isRequired>
            <MpFormLabel>Vendor</MpFormLabel>
            <MpInput id="input-draft-vendor" v-model="draft.vendor" placeholder="Enter vendor" :isFullWidth="true" :is-read-only="drawerReadOnly" />
          </MpFormControl>

          <!-- Amount -->
          <MpFormControl id="draft-amount" isRequired>
            <MpFormLabel>Amount</MpFormLabel>

            <!-- International + first item → currency picker enabled -->
            <template v-if="isInternational && !lockedCurrency && editIndex === null && !drawerReadOnly">
              <MpPopover id="draft-currency-popover" is-close-on-select use-portal is-adaptive-width placement="bottom-start">
                <MpPopoverTrigger>
                  <MpInputGroup style="width:100%;">
                    <MpInputLeftAddon has-background>
                      <button :class="currencyTrigger">
                        {{ draft.currency || categoryCurrencies[0] }}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </button>
                    </MpInputLeftAddon>
                    <MpInput :modelValue="draft.amount" placeholder="0" :isFullWidth="true"
                      @click.stop
                      @input="(e: Event) => (draft.amount = formatThousands((e.target as HTMLInputElement).value))" />
                  </MpInputGroup>
                </MpPopoverTrigger>
                <MpPopoverContent :class="css({ marginTop: '2px' })">
                  <MpPopoverList>
                    <MpPopoverListItem v-for="code in categoryCurrencies" :key="code"
                      :is-active="(draft.currency || categoryCurrencies[0]) === code"
                      @click="draft.currency = code">
                      {{ getCurrencyLabel(code) }}
                    </MpPopoverListItem>
                  </MpPopoverList>
                </MpPopoverContent>
              </MpPopover>
            </template>

            <!-- International + locked currency (subsequent items) or read-only -->
            <template v-else-if="isInternational">
              <MpInputGroup style="width:100%;">
                <MpInputLeftAddon has-background>
                  <MpText size="body" weight="semiBold">{{ lockedCurrency || draft.currency || displayCurrency }}</MpText>
                </MpInputLeftAddon>
                <MpInput :modelValue="draft.amount" placeholder="0" :isFullWidth="true"
                  :is-read-only="drawerReadOnly"
                  @input="(e: Event) => (draft.amount = formatThousands((e.target as HTMLInputElement).value))" />
              </MpInputGroup>
            </template>

            <!-- Domestic → fixed Rp -->
            <template v-else>
              <MpInputGroup style="width:100%;">
                <MpInputLeftAddon has-background><MpText size="body" weight="semiBold">Rp</MpText></MpInputLeftAddon>
                <MpInput :modelValue="draft.amount" placeholder="0" :isFullWidth="true"
                  :is-read-only="drawerReadOnly"
                  @input="(e: Event) => (draft.amount = formatThousands((e.target as HTMLInputElement).value))" />
              </MpInputGroup>
            </template>
          </MpFormControl>

          <!-- Description -->
          <MpFormControl id="draft-description">
            <MpFlex justify="space-between" align="flex-end">
              <MpFormLabel>Description</MpFormLabel>
              <MpText size="body-small" color="gray.400">{{ draft.description.length }} / 600</MpText>
            </MpFlex>
            <MpTextarea id="textarea-draft-description" v-model="draft.description" placeholder="Enter description" :isFullWidth="true" maxlength="600" :is-read-only="drawerReadOnly" />
          </MpFormControl>

          <!-- Attachment -->
          <MpFormControl id="draft-attachment" isRequired>
            <MpFormLabel>Attachment</MpFormLabel>
            <MpUpload
              v-if="!drawerReadOnly"
              button-text="Browse file"
              :is-multiple="true"
              :accept="ACCEPT"
              :placeholder="draft.attachments.length ? `${draft.attachments.length} files selected` : 'No file selected'"
              @change="(e: Event) => onUploadChange(e, draft.attachments)"
            />
            <MpFormHelpText>{{ RECEIPT_HELP }}</MpFormHelpText>
            <MpFlex direction="column" gap="2" marginTop="3">
              <MpUploadList
                v-for="(f, i) in draft.attachments" :id="`draft-file-${i}`" :key="i"
                :title="f.name" :subtitle="f.size" status="success" icon-name="doc" icon-variant="outline"
                :is-show-remove-button="!drawerReadOnly" @remove="draft.attachments.splice(i, 1)"
              />
            </MpFlex>
          </MpFormControl>

          <!-- Drawer additional details -->
          <MpText size="h2" weight="semiBold" color="dark">Additional details</MpText>

          <MpFormControl id="draft-code-name" isRequired>
            <MpFlex justify="space-between" align="flex-end">
              <MpFormLabel>Code name connector</MpFormLabel>
              <MpText size="body-small" color="gray.400">{{ draft.codeNameConnector.length }} / 60</MpText>
            </MpFlex>
            <MpInput id="input-draft-code" v-model="draft.codeNameConnector" placeholder="Enter code name connector" :isFullWidth="true" maxlength="60" :is-read-only="drawerReadOnly" />
            <MpFormHelpText>{{ CODE_NAME_HELP }}</MpFormHelpText>
          </MpFormControl>

          <MpFormControl id="draft-variant">
            <MpFlex justify="space-between" align="flex-end">
              <MpFormLabel>Variant</MpFormLabel>
              <MpText size="body-small" color="gray.400">{{ draft.variant.length }} / 60</MpText>
            </MpFlex>
            <MpInput id="input-draft-variant" v-model="draft.variant" placeholder="Enter variant" :isFullWidth="true" maxlength="60" :is-read-only="drawerReadOnly" />
          </MpFormControl>
        </MpFlex>
      </MpDrawerBody>

      <MpDrawerFooter>
        <MpFlex align="center" justify="flex-end" gap="3" width="full">
          <MpButton variant="ghost" size="md" @click="drawerOpen = false">{{ drawerReadOnly ? 'Close' : 'Cancel' }}</MpButton>
          <MpButton v-if="!drawerReadOnly" variant="primary" size="md" @click="saveItem">Save</MpButton>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>
</template>
