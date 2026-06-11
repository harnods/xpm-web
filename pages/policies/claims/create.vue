<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Policies › Claims › Create category
  Source : Figma z9nzcdQ9jpiGqafP4vvHed · node 4284-17171
  Skill  : implement-to-pixel (Branch B)
  Tokens : Pixel 2.4 · @mekari/pixel3 ^1.0.12
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  All component APIs verified via Pixel MCP (get-component):

  MpBanner       → <MpBanner variant="info"><MpBannerIcon id/><MpBannerDescription id/></MpBanner>
  MpFormControl  → id on control; MpFormLabel as direct child; MpFormHelpText AFTER field
  MpFormLabel    → label in default slot; no isRequired (lives on MpFormControl)
  MpFormHelpText → AFTER the input field (standard Pixel pattern)
  MpInput        → v-model, placeholder, :is-full-width
  MpInputGroup   → size prop; children: MpInputLeftAddon + MpInput
  MpInputLeftAddon → has-background prop; default slot for addon content
  MpTextarea     → v-model, placeholder, :is-full-width
  MpSelect       → v-model, placeholder, :is-full-width; <option> children
  MpRadio        → v-model + value + name + id; label in default slot
  MpCheckbox     → group: v-model Array + value; single: :is-checked + @change(boolean)
  MpButton       → variant, size, left-icon, right-icon (kebab-case); is-loading
  MpText         → as, size, weight, color props
  MpDivider      → default horizontal
  toast.notify   → variant:"success", title, position
-->
<script setup lang="ts">
import {
  MpFlex, MpText, MpDivider,
  MpButton,
  MpBanner, MpBannerIcon, MpBannerDescription,
  MpFormControl, MpFormLabel, MpFormHelpText,
  MpInput, MpInputGroup, MpInputLeftAddon, MpInputRightAddon, MpTextarea,
  MpCheckbox, MpRadio,
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
  MpTable, MpTableHead, MpTableBody, MpTableRow, MpTableCell,
  MpDrawer, MpDrawerContent, MpDrawerHeader, MpDrawerCloseButton,
  MpDrawerBody, MpDrawerFooter, MpDrawerOverlay,
  css,
  toast,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Create category',
  breadcrumbParent: { label: 'Claims', path: '/policies/claims' },
})
const router = useRouter()
const route  = useRoute()

const isEditMode = computed(() => route.query.mode === 'edit')

// Keep H1 in sync with mode
watchEffect(() => {
  route.meta.title = isEditMode.value ? 'Edit category' : 'Create category'
})

// ─── Types ────────────────────────────────────────────────────────
interface LimitRule { currency: string; amount: string; frequency: string }

// ─── Form state ───────────────────────────────────────────────────
const name           = ref('Office Tools')
const description    = ref('All office tools')
const categoryType   = ref('international')
const ruleType       = ref('with-limit')
const hasLimitPerTx  = ref(false)
// ─── Members & add member drawer ─────────────────────────────────
interface Employee {
  id: string; name: string; position: string
  organization: string; branch: string; level: string; grade: string
}
const ALL_EMPLOYEES: Employee[] = [
  { id: 'EMP001', name: 'Admin LMS In House',     position: 'CEO',                organization: 'IT Division',                branch: 'Pusat',           level: 'C-Level',    grade: 'Grade 9' },
  { id: 'EMP002', name: 'Employee LMS In House',  position: 'Staff GA',           organization: 'HRD & GA',                   branch: 'Pusat',           level: 'Staff',      grade: 'Grade 3' },
  { id: 'EMP003', name: 'Nando Yoga',             position: 'CEO',                organization: 'Board of Director (BOD) HQ', branch: 'Pusat',           level: 'C-Level',    grade: 'Grade 9' },
  { id: 'EMP004', name: 'Brian Wijaya',           position: 'Manager HRD & GA',   organization: 'HRD & GA',                   branch: 'Pusat',           level: 'Manager',    grade: 'Grade 6' },
  { id: 'EMP005', name: 'Gille Cripowi',          position: 'Manager HRD & GA',   organization: 'HRD & GA',                   branch: 'Pusat',           level: 'Manager',    grade: 'Grade 6' },
  { id: 'EMP006', name: 'Andi Wijaya',            position: 'Staff Finance',      organization: 'Finance',                    branch: 'Jakarta HQ',      level: 'Staff',      grade: 'Grade 3' },
  { id: 'EMP007', name: 'Budi Santoso',           position: 'Supervisor Finance', organization: 'Finance',                    branch: 'Jakarta HQ',      level: 'Supervisor', grade: 'Grade 5' },
  { id: 'EMP008', name: 'Citra Lestari',          position: 'Manager Finance',    organization: 'Finance',                    branch: 'Jakarta HQ',      level: 'Manager',    grade: 'Grade 6' },
  { id: 'EMP009', name: 'Dewi Anggraini',         position: 'Staff Marketing',    organization: 'Marketing',                  branch: 'Surabaya Office', level: 'Staff',      grade: 'Grade 3' },
  { id: 'EMP010', name: 'Eko Prasetyo',           position: 'Lead Engineer',      organization: 'Engineering',                branch: 'Bandung Office',  level: 'Lead',       grade: 'Grade 7' },
  { id: 'EMP011', name: 'Fitri Handayani',        position: 'Staff Engineering',  organization: 'Engineering',                branch: 'Bandung Office',  level: 'Staff',      grade: 'Grade 4' },
  { id: 'EMP012', name: 'Galih Pratama',          position: 'Manager Operations', organization: 'Operations',                 branch: 'Surabaya Office', level: 'Manager',    grade: 'Grade 6' },
  { id: 'EMP013', name: 'Hana Permata',           position: 'Supervisor Ops',     organization: 'Operations',                 branch: 'Surabaya Office', level: 'Supervisor', grade: 'Grade 5' },
  { id: 'EMP014', name: 'Indra Kusuma',           position: 'Staff IT',           organization: 'IT Division',                branch: 'Pusat',           level: 'Staff',      grade: 'Grade 4' },
  { id: 'EMP015', name: 'Joko Susilo',            position: 'Director Sales',     organization: 'Sales',                      branch: 'Jakarta HQ',      level: 'Director',   grade: 'Grade 8' },
  { id: 'EMP016', name: 'Kartika Sari',           position: 'Staff Sales',        organization: 'Sales',                      branch: 'Medan Office',    level: 'Staff',      grade: 'Grade 3' },
  { id: 'EMP017', name: 'Lukman Hakim',           position: 'Manager Sales',      organization: 'Sales',                      branch: 'Medan Office',    level: 'Manager',    grade: 'Grade 6' },
  { id: 'EMP018', name: 'Maya Putri',             position: 'Staff HRD',          organization: 'HRD & GA',                   branch: 'Bali Office',     level: 'Staff',      grade: 'Grade 3' },
  { id: 'EMP019', name: 'Nugroho Adi',            position: 'Supervisor IT',      organization: 'IT Division',                branch: 'Pusat',           level: 'Supervisor', grade: 'Grade 5' },
  { id: 'EMP020', name: 'Oka Mahendra',           position: 'Staff Operations',   organization: 'Operations',                 branch: 'Bali Office',     level: 'Staff',      grade: 'Grade 4' },
  { id: 'EMP021', name: 'Putri Rahmawati',        position: 'Lead Marketing',     organization: 'Marketing',                  branch: 'Jakarta HQ',      level: 'Lead',       grade: 'Grade 7' },
  { id: 'EMP022', name: 'Rizky Maulana',          position: 'Staff Finance',      organization: 'Finance',                    branch: 'Surabaya Office', level: 'Staff',      grade: 'Grade 3' },
  { id: 'EMP023', name: 'Siti Aminah',            position: 'Manager Engineering',organization: 'Engineering',                branch: 'Bandung Office',  level: 'Manager',    grade: 'Grade 6' },
  { id: 'EMP024', name: 'Taufik Hidayat',         position: 'Director Operations',organization: 'Operations',                 branch: 'Pusat',           level: 'Director',   grade: 'Grade 8' },
]

const selectedEmployees = ref<Employee[]>([])
function removeEmployee(id: string) {
  const i = selectedEmployees.value.findIndex(e => e.id === id)
  if (i >= 0) selectedEmployees.value.splice(i, 1)
}

// Member scope & add-by mode
const memberScope = ref<'all' | 'specific'>('all')
const addMemberBy = ref<'employee' | 'org-branch'>('employee')

// Org & Branch mode
const selectedOrg      = ref('')
const orgSearch        = ref('')
const selectedBranches = ref<string[]>([])

const uniq = (arr: string[]) => [...new Set(arr)].sort()
const orgSearchOptions = computed(() => {
  const q = orgSearch.value.trim().toLowerCase()
  const all = uniq(ALL_EMPLOYEES.map(e => e.organization))
  return q ? all.filter(o => o.toLowerCase().includes(q)) : all
})
const filteredBranchOptions = computed(() => {
  if (!selectedOrg.value) return uniq(ALL_EMPLOYEES.map(e => e.branch))
  return uniq(ALL_EMPLOYEES.filter(e => e.organization === selectedOrg.value).map(e => e.branch))
})
const selectedBranchesLabel = computed(() =>
  selectedBranches.value.length ? `Selected (${selectedBranches.value.length})` : 'Select branch',
)
const selectedBranchesHint = computed(() =>
  selectedBranches.value.length ? `including ${selectedBranches.value.join(', ')}` : '',
)
function toggleBranch(b: string) {
  const idx = selectedBranches.value.indexOf(b)
  if (idx >= 0) selectedBranches.value.splice(idx, 1)
  else selectedBranches.value.push(b)
}
function clearOrg() {
  selectedOrg.value = ''
  orgSearch.value = ''
  selectedBranches.value = []
}

// Add member drawer
const memberDrawerOpen  = ref(false)
const draftSelectedIds  = ref<string[]>([])
const memberSearch      = ref('')
const filterOrg         = ref<string[]>([])
const filterBranch      = ref<string[]>([])
const filterLevel       = ref<string[]>([])
const filterGrade       = ref<string[]>([])
const memberPage        = ref(1)
const memberRowsPerPage = ref(10)
const memberSort = ref<{ key: keyof Employee; dir: 'asc' | 'desc' }>({ key: 'name', dir: 'asc' })

const orgOptions    = computed(() => uniq(ALL_EMPLOYEES.map(e => e.organization)))
const branchOptions = computed(() => uniq(ALL_EMPLOYEES.map(e => e.branch)))
const levelOptions  = computed(() => uniq(ALL_EMPLOYEES.map(e => e.level)))
const gradeOptions  = computed(() => uniq(ALL_EMPLOYEES.map(e => e.grade)))

function toggleMemberFilter(arr: string[], val: string, allOptions: string[]) {
  const idx = arr.indexOf(val)
  if (idx >= 0) arr.splice(idx, 1)
  else {
    arr.push(val)
    if (arr.length === allOptions.length) arr.splice(0)
  }
}
function filterLabel(arr: string[], allLabel: string) {
  return arr.length ? `Selected (${arr.length})` : allLabel
}

const filteredEmployees = computed(() => {
  const q = memberSearch.value.trim().toLowerCase()
  const list = ALL_EMPLOYEES.filter(e =>
    (!filterOrg.value.length    || filterOrg.value.includes(e.organization)) &&
    (!filterBranch.value.length || filterBranch.value.includes(e.branch)) &&
    (!filterLevel.value.length  || filterLevel.value.includes(e.level)) &&
    (!filterGrade.value.length  || filterGrade.value.includes(e.grade)) &&
    (!q || e.name.toLowerCase().includes(q)),
  )
  const { key, dir } = memberSort.value
  return [...list].sort((a, b) => {
    const cmp = String(a[key]).localeCompare(String(b[key]))
    return dir === 'asc' ? cmp : -cmp
  })
})

function openMemberDrawer() {
  draftSelectedIds.value = selectedEmployees.value.map(e => e.id)
  memberSearch.value = ''
  filterOrg.value = []; filterBranch.value = []; filterLevel.value = []; filterGrade.value = []
  memberPage.value = 1
  memberDrawerOpen.value = true
}
function isDraftSelected(id: string) { return draftSelectedIds.value.includes(id) }
function toggleDraft(id: string) {
  const i = draftSelectedIds.value.indexOf(id)
  if (i >= 0) draftSelectedIds.value.splice(i, 1)
  else draftSelectedIds.value.push(id)
}
const pagedEmployees = computed(() => {
  const start = (memberPage.value - 1) * memberRowsPerPage.value
  return filteredEmployees.value.slice(start, start + memberRowsPerPage.value)
})
watch([filterOrg, filterBranch, filterLevel, filterGrade, memberSearch, memberRowsPerPage],
  () => { memberPage.value = 1 }, { deep: true })
const pageAllSelected = computed(() =>
  pagedEmployees.value.length > 0 && pagedEmployees.value.every(e => draftSelectedIds.value.includes(e.id)),
)
function togglePageAll(v: boolean) {
  const ids = pagedEmployees.value.map(e => e.id)
  if (v) draftSelectedIds.value = [...new Set([...draftSelectedIds.value, ...ids])]
  else draftSelectedIds.value = draftSelectedIds.value.filter(id => !ids.includes(id))
}
function resetDraft() { draftSelectedIds.value = [] }
function sortBy(key: keyof Employee) {
  if (memberSort.value.key === key) memberSort.value.dir = memberSort.value.dir === 'asc' ? 'desc' : 'asc'
  else memberSort.value = { key, dir: 'asc' }
}
function confirmMembers() {
  selectedEmployees.value = ALL_EMPLOYEES.filter(e => draftSelectedIds.value.includes(e.id))
  memberDrawerOpen.value = false
}

// Category usage — array v-model (correct Pixel checkbox-group pattern)
const usageSelected = ref(['reimbursement','cash-advance','virtual-card','physical-card'])

// ─── Currency picker ──────────────────────────────────────────────
const ALL_CURRENCIES = [
  { code: 'AUD', name: 'Australian dollar' },
  { code: 'CAD', name: 'Canadian dollar' },
  { code: 'CNY', name: 'Renminbi' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British pound' },
  { code: 'HKD', name: 'Hong Kong dollar' },
  { code: 'JPY', name: 'Japanese yen' },
  { code: 'MYR', name: 'Malaysian ringgit' },
  { code: 'SGD', name: 'Singapore dollar' },
  { code: 'USD', name: 'US dollar' },
]
const MAX_CURRENCIES = 5
const selectedCurrencies = ref<string[]>(['HKD', 'MYR', 'JPY', 'SGD', 'USD'])
const currencySearch     = ref('')
const currencyPickerOpen = ref(false)

const filteredCurrencies = computed(() =>
  ALL_CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(currencySearch.value.toLowerCase()) ||
    c.name.toLowerCase().includes(currencySearch.value.toLowerCase())
  )
)
const currencyHelpText = computed(() =>
  selectedCurrencies.value.length
    ? `including ${selectedCurrencies.value.join(', ')}`
    : 'No currencies selected'
)

function toggleCurrency(code: string) {
  const idx = selectedCurrencies.value.indexOf(code)
  if (idx >= 0) selectedCurrencies.value.splice(idx, 1)
  else if (selectedCurrencies.value.length < MAX_CURRENCIES) selectedCurrencies.value.push(code)
}

const pickerRef = ref<HTMLElement | null>(null)

// ─── Edit mode — mock data ────────────────────────────────────────
const MOCK_CATEGORIES = [
  { id: 1, name: 'Office Tools',        description: 'All office tools',                                                categoryType: 'international', currencies: ['HKD','MYR','JPY','SGD','USD'], usage: ['reimbursement','cash-advance','virtual-card','physical-card'] },
  { id: 2, name: 'Entertainment Claim', description: 'For reimbursement of costs from business-related entertainment.', categoryType: 'international', currencies: ['IDR','USD'],                    usage: ['reimbursement','cash-advance','virtual-card','physical-card'] },
  { id: 3, name: 'Office Supplies',     description: 'All office supplies',                                             categoryType: 'domestic',      currencies: [],                               usage: ['reimbursement','cash-advance'] },
  { id: 4, name: 'Entertainment Claim', description: 'For reimbursement of costs from business-related entertainment.', categoryType: 'domestic',      currencies: [],                               usage: ['reimbursement','cash-advance'] },
]

onMounted(() => {
  document.addEventListener('mousedown', (e) => {
    if (pickerRef.value && !pickerRef.value.contains(e.target as Node))
      currencyPickerOpen.value = false
  })

  // Hydrate form fields when editing an existing category
  if (isEditMode.value) {
    const id  = Number(route.query.id)
    const cat = MOCK_CATEGORIES.find(c => c.id === id)
    if (cat) {
      name.value             = cat.name
      description.value      = cat.description
      categoryType.value     = cat.categoryType
      usageSelected.value    = [...cat.usage]
      selectedCurrencies.value = cat.categoryType === 'international' ? [...cat.currencies] : ['HKD','MYR','JPY','SGD','USD']
    }
  }
})

// ─── Per-transaction limits ───────────────────────────────────────

function formatThousands(val: string): string {
  const digits = val.replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('id-ID')
}

interface PerTxLimit { currency: string; amount: string }
const perTxLimits = ref<PerTxLimit[]>([])

function availablePerTxCurrencies(excludeIdx: number): string[] {
  const taken = new Set(perTxLimits.value.filter((_, i) => i !== excludeIdx).map(r => r.currency))
  return selectedCurrencies.value.filter(c => !taken.has(c))
}

const unusedPerTxCurrencies = computed(() => {
  const used = new Set(perTxLimits.value.map(r => r.currency))
  return selectedCurrencies.value.filter(c => !used.has(c))
})

function onLimitPerTxChange(v: boolean) {
  hasLimitPerTx.value = v
  if (v && perTxLimits.value.length === 0 && selectedCurrencies.value.length > 0)
    perTxLimits.value.push({ currency: selectedCurrencies.value[0], amount: '' })
  if (!v) perTxLimits.value = []
}

// Sync rule rows when selected currencies change
watch(selectedCurrencies, (next) => {
  for (const list of [branchRules.value, orgRules.value, employeeRules.value])
    for (const rule of list)
      if (!next.includes(rule.currency)) rule.currency = next[0] ?? ''
  // Keep perTxLimits in sync — remove rows whose currency was deselected
  perTxLimits.value = perTxLimits.value.filter(r => next.includes(r.currency))
  if (hasLimitPerTx.value && perTxLimits.value.length === 0 && next.length > 0)
    perTxLimits.value.push({ currency: next[0], amount: '' })
})

// ─── Limit rules ──────────────────────────────────────────────────
const branchRules = ref<LimitRule[]>([
  { currency: 'JPY', amount: '60.000', frequency: 'per-year'  },
  { currency: 'JPY', amount: '50.000', frequency: 'per-month' },
  { currency: 'JPY', amount: '12.500', frequency: 'per-week'  },
])
const orgRules = ref<LimitRule[]>([
  { currency: 'JPY', amount: '6.000', frequency: 'per-year'  },
  { currency: 'JPY', amount: '5.000', frequency: 'per-month' },
  { currency: 'JPY', amount: '1.250', frequency: 'per-week'  },
])
const employeeRules = ref<LimitRule[]>([
  { currency: 'JPY', amount: '600', frequency: 'per-year'  },
  { currency: 'JPY', amount: '500', frequency: 'per-month' },
  { currency: 'JPY', amount: '125', frequency: 'per-week'  },
])

const ALL_FREQUENCIES = ['per-year', 'per-month', 'per-week']
const FREQ_LABELS: Record<string, string> = {
  'per-year': 'Per year', 'per-month': 'Per month', 'per-week': 'Per week',
}
const DOMESTIC_CURRENCY = 'Rp'

// Returns frequencies not yet taken by another row with the same currency
function getCurrencyLabel(code: string): string {
  const c = ALL_CURRENCIES.find(c => c.code === code)
  return c ? `${code} - ${c.name}` : code
}

function availableFrequencies(list: LimitRule[], currency: string, excludeIdx: number): string[] {
  const used = new Set(
    list.filter((_, i) => i !== excludeIdx && list[i].currency === currency).map(r => r.frequency)
  )
  return ALL_FREQUENCIES.filter(f => !used.has(f))
}

// Currencies that still have ≥1 free frequency slot — always keeps the current row's own currency
function availableCurrencies(list: LimitRule[], excludeIdx: number): string[] {
  const current = list[excludeIdx]?.currency
  return selectedCurrencies.value.filter(code =>
    code === current || availableFrequencies(list, code, excludeIdx).length > 0
  )
}

function hasDuplicate(list: LimitRule[]): boolean {
  const seen = new Set<string>()
  return list.some(r => {
    const key = `${r.currency}:${r.frequency}`
    if (seen.has(key)) return true
    seen.add(key); return false
  })
}

function allRulesUsed(list: LimitRule[]): boolean {
  const maxSlots = categoryType.value === 'domestic'
    ? ALL_FREQUENCIES.length
    : selectedCurrencies.value.length * ALL_FREQUENCIES.length
  return list.length >= maxSlots
}

function addRule(list: LimitRule[]) {
  if (categoryType.value === 'domestic') {
    const freq = availableFrequencies(list, DOMESTIC_CURRENCY, list.length)[0] ?? 'per-year'
    list.push({ currency: DOMESTIC_CURRENCY, amount: '', frequency: freq })
    return
  }
  // Pick the first currency+frequency pair that has an open slot
  const currency = selectedCurrencies.value.find(code =>
    availableFrequencies(list, code, list.length).length > 0
  ) ?? selectedCurrencies.value[0] ?? 'JPY'
  const frequency = availableFrequencies(list, currency, list.length)[0] ?? 'per-year'
  list.push({ currency, amount: '', frequency })
}

// Reset rules to domestic/international defaults when category type changes
watch(categoryType, (type) => {
  const defaultCurrency = type === 'domestic' ? DOMESTIC_CURRENCY : (selectedCurrencies.value[0] ?? 'JPY')
  for (const list of [branchRules.value, orgRules.value, employeeRules.value])
    for (const rule of list) rule.currency = defaultCurrency
})
function removeRule(list: LimitRule[], i: number) {
  list.splice(i, 1)
}

// ─── Submit ───────────────────────────────────────────────────────
const saving = ref(false)
function cancel() { router.push('/policies/claims') }
async function save() {
  saving.value = true
  await new Promise(r => setTimeout(r, 600))
  saving.value = false
  toast.notify({ variant: 'success', title: isEditMode.value ? 'Category saved' : 'Category created', position: 'top-center' })
  router.push('/policies/claims')
}

// ─── Styles — css() only for non-Pixel structural needs ───────────
const page = css({ maxWidth: '780px' })

const currencyDropdown = css({
  position: 'absolute', top: 'calc(100% + 4px)', left: '0', zIndex: 50,
  width: '280px', background: 'white',
  borderRadius: 'var(--Radius-pxl-radius-md, 8px)',
  boxShadow: 'var(--Shadow-pxl-shadow-md, 0 4px 16px rgba(0,0,0,.12))',
  border: '1px solid var(--Color-pxl-border-subtle, #E4E7EC)',
  padding: 'var(--Spacing-pxl-space-xs, 8px) 0',
})

const currencyItem = css({
  display: 'flex', width: '100%', boxSizing: 'border-box',
  padding: 'var(--Spacing-pxl-space-xs, 8px) var(--Spacing-pxl-space-sm, 12px)',
  alignItems: 'center', gap: 'var(--Spacing-pxl-space-xs, 8px)',
  cursor: 'pointer', borderRadius: '0',
  _hover: { background: 'var(--Color-pxl-bg-subtle, #F5F6F8)' },
})

// Figma 4320:6859 — Label/Semibold + chevron, naturally sized, neutral-subtle bg via MpInputLeftAddon
const currencyTrigger = css({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: '1', border: 'none', outline: 'none', background: 'transparent',
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default',
  cursor: 'pointer', paddingX: '2', paddingY: '0',
})

// Frequency trigger — styled to match MpInput outline appearance
const frequencyTrigger = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  width: 'full', minHeight: '40px',
  border: '1px solid var(--mp-colors-border-form, rgba(29,31,36,.16))',
  borderRadius: '6px', paddingX: '3',
  fontFamily: 'body', fontSize: 'md', color: 'dark',
  background: 'transparent', cursor: 'pointer', outline: 'none',
  _focusVisible: { boxShadow: 'focus', borderColor: 'border.focused' },
})


const stickyFooter = css({
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
  gap: 'var(--mp-spacing-3)', paddingTop: 'var(--mp-spacing-6)',
  paddingBottom: 'var(--mp-spacing-8)', width: '100%',
})

const subcategoryGrid = css({
  display: 'grid', gridTemplateColumns: '1fr 1fr',
  gap: '0.5', margin: '0', padding: '0', listStyle: 'none',
})

// Filter dropdown trigger (drawer)
const filterTrigger = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  gap: '2', minWidth: '170px', minHeight: '40px',
  border: '1px solid var(--mp-colors-border-form, rgba(29,31,36,.16))',
  borderRadius: '6px', paddingX: '3',
  fontFamily: 'body', fontSize: 'md', color: 'dark',
  background: 'white', cursor: 'pointer', outline: 'none',
  _focusVisible: { boxShadow: 'focus', borderColor: 'border.focused' },
})
const selectedBar = css({
  background: 'blue.50', borderRadius: 'md', paddingX: '4', paddingY: '3',
})
const sortHeader = css({
  display: 'inline-flex', alignItems: 'center', gap: '1',
  background: 'transparent', border: 'none', cursor: 'pointer', padding: '0',
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'dark',
})
const sortCaret = css({ color: 'gray.400', fontSize: 'sm' })

// Org & Branch mode triggers
const orgTrigger = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  width: 'full', maxWidth: '360px', minHeight: '40px', gap: '2', minWidth: '0',
  border: '1px solid var(--mp-colors-border-form, rgba(29,31,36,.16))',
  borderRadius: '6px', paddingX: '3',
  fontFamily: 'body', fontSize: 'md', color: 'dark',
  background: 'transparent', cursor: 'pointer', outline: 'none',
  _focusVisible: { boxShadow: 'focus', borderColor: 'border.focused' },
})
const orgClearBtn = css({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '20px', height: '20px', borderRadius: 'full',
  border: 'none', background: 'gray.200', cursor: 'pointer', padding: '0',
  color: 'gray.500', flexShrink: '0',
  _hover: { background: 'gray.300' },
})
// Inline select trigger for "Add member by" dropdown
const selectLabel = css({
  flex: '1', minWidth: '0', textAlign: 'left',
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
})
</script>

<template>
  <Teleport to="#layout-header-actions"><span /></Teleport>

  <div :class="page">

    <!-- Info banner -->
    <MpBanner variant="info" marginBottom="6">
      <MpBannerIcon id="banner-info-icon" />
      <MpBannerDescription id="banner-info-desc">
        Purchases and card transactions will not be affected by the details in this category.
      </MpBannerDescription>
    </MpBanner>

    <!-- ══ 1. Basic information ══ -->
    <MpFlex direction="column" gap="5" marginBottom="16" paddingTop="6">
      <MpText size="h2" weight="semiBold" color="dark">Basic information</MpText>

      <!-- Claim category name -->
      <MpFormControl id="cat-name" isRequired>
        <MpFlex justify="space-between" align="flex-end">
          <MpFormLabel>Claim category name</MpFormLabel>
          <MpText size="body-small" color="gray.400">{{ name.length }} / 40</MpText>
        </MpFlex>
        <MpInput id="input-cat-name" v-model="name"
                 placeholder="Enter category name" :isFullWidth="true" maxlength="40" />
      </MpFormControl>

      <!-- Description -->
      <MpFormControl id="cat-desc" isRequired>
        <MpFlex justify="space-between" align="flex-end">
          <MpFormLabel>Description</MpFormLabel>
          <MpText size="body-small" color="gray.400">{{ description.length }} / 200</MpText>
        </MpFlex>
        <MpTextarea id="textarea-desc" v-model="description"
                    placeholder="Enter description" :isFullWidth="true" />
      </MpFormControl>

      <!-- Category type — MpRadio: label in default slot, v-model + value + name -->
      <MpFormControl id="cat-type">
        <MpFormLabel>Category type</MpFormLabel>
        <MpFlex gap="6" marginTop="1">
          <MpRadio id="type-domestic"      name="categoryType" value="domestic"      v-model="categoryType" :isDisabled="isEditMode">Domestic</MpRadio>
          <MpRadio id="type-international" name="categoryType" value="international" v-model="categoryType" :isDisabled="isEditMode">International</MpRadio>
        </MpFlex>
      </MpFormControl>

      <!-- Currencies — only shown for international; domestic is always Rp -->
      <MpFormControl v-if="categoryType === 'international'" id="cat-currencies" isRequired>
        <MpFormLabel>Currencies</MpFormLabel>
        <MpFormHelpText>{{ currencyHelpText }}</MpFormHelpText>
        <div ref="pickerRef" style="position:relative; width:280px; margin-top:4px;">
          <MpInputGroup @click="currencyPickerOpen = !currencyPickerOpen" style="cursor:pointer;">
            <MpInput
              :modelValue="selectedCurrencies.length ? `Selected (${selectedCurrencies.length})` : ''"
              placeholder="Select currencies"
              isReadOnly
              :isFullWidth="true"
              style="cursor:pointer;"
            />
            <MpInputRightAddon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="color:inherit;">
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </MpInputRightAddon>
          </MpInputGroup>
          <div v-if="currencyPickerOpen" :class="currencyDropdown">
            <div style="padding:0 8px 8px;">
              <MpInput v-model="currencySearch" placeholder="Search..." :isFullWidth="true" />
            </div>
            <div style="max-height:220px; overflow-y:auto; display:flex; flex-direction:column;">
              <div
                v-for="c in filteredCurrencies" :key="c.code"
                :class="currencyItem"
              >
                <MpCheckbox
                  :id="`cur-${c.code}`"
                  :isChecked="selectedCurrencies.includes(c.code)"
                  :isDisabled="!selectedCurrencies.includes(c.code) && selectedCurrencies.length >= MAX_CURRENCIES"
                  @change="toggleCurrency(c.code)"
                >({{ c.code }}) {{ c.name }}</MpCheckbox>
              </div>
            </div>
          </div>
        </div>
      </MpFormControl>

      <!-- Category usage — checkbox group (array v-model + value) -->
      <MpFormControl id="cat-usage" isRequired>
        <MpFormLabel>Category usage</MpFormLabel>
        <MpFlex direction="column" gap="2" marginTop="1">
          <MpCheckbox id="usage-reimb"     value="reimbursement" v-model="usageSelected">Reimbursement</MpCheckbox>
          <MpCheckbox id="usage-cash"      value="cash-advance"  v-model="usageSelected">Cash advance</MpCheckbox>
          <MpCheckbox id="usage-virtual"   value="virtual-card"  v-model="usageSelected" :isDisabled="categoryType === 'international'">Virtual card</MpCheckbox>
          <MpCheckbox id="usage-physical"  value="physical-card" v-model="usageSelected" :isDisabled="categoryType === 'international'">Physical card</MpCheckbox>
        </MpFlex>
      </MpFormControl>
    </MpFlex>

    <!-- ══ 2. Subcategory ══ -->
    <MpFlex direction="column" gap="3" marginBottom="16">
      <MpText size="h2" weight="semiBold" color="dark">Subcategory</MpText>
      <MpText size="body" color="gray.600">
        Employees can choose a subcategory within this claim category to specify their requests.
      </MpText>
      <ul :class="subcategoryGrid">
        <li v-for="s in ['Chair','Desk','Pens','Printer','Sofa','Stamps','Stapler','Table']" :key="s">
          <MpFlex align="center" gap="1">
            <MpText size="body" color="gray.600">•</MpText>
            <MpText size="body" color="dark">{{ s }}</MpText>
          </MpFlex>
        </li>
      </ul>
      <MpButton variant="secondary" size="md">Manage subcategory</MpButton>
    </MpFlex>

    <!-- ══ 3. Category limitation ══ -->
    <MpFlex direction="column" gap="5" marginBottom="16">
      <MpFlex direction="column" gap="1">
        <MpText size="h2" weight="semiBold" color="dark">Category limitation</MpText>
        <MpText size="body" color="gray.600">You can set the rules that will be applied to this category.</MpText>
      </MpFlex>

      <MpBanner variant="info" is-inline>
        <MpBannerIcon id="banner-limit-icon" />
        <MpBannerDescription id="banner-limit-title">Each currency can only have one limit per frequency.</MpBannerDescription>
      </MpBanner>

      <!-- Rule type — MpRadio with v-model -->
      <MpFormControl id="rule-type">
        <MpFormLabel>Rule type</MpFormLabel>
        <MpFlex gap="6" marginTop="1">
          <MpRadio id="rule-with"    name="ruleType" value="with-limit" v-model="ruleType">With limit</MpRadio>
          <MpRadio id="rule-without" name="ruleType" value="no-limit"   v-model="ruleType">No limit</MpRadio>
        </MpFlex>
      </MpFormControl>

      <template v-if="ruleType === 'with-limit'">

        <!-- Branch -->
        <MpFlex direction="column" gap="3">
          <MpFlex direction="column" gap="1">
            <MpText size="body" weight="semiBold" color="dark">Branch</MpText>
            <MpText size="body" color="gray.600">Set the rules that will apply to the branches.</MpText>
          </MpFlex>
          <MpTable :is-hoverable="false" style="table-layout:fixed; width:100%;">
            <MpTableHead>
              <MpTableRow>
                <MpTableCell as="th" scope="col" style="width:calc(50% - 20px);">Max amount</MpTableCell>
                <MpTableCell as="th" scope="col" style="width:calc(50% - 20px);">Frequency</MpTableCell>
                <MpTableCell as="th" scope="col" style="width:40px;" />
              </MpTableRow>
            </MpTableHead>
            <MpTableBody is-narrowed>
              <MpTableRow v-for="(rule, ri) in branchRules" :key="ri">
                <!-- Max amount — popover wraps full input group so adaptive-width = column width -->
                <MpTableCell as="td" scope="row">
                  <template v-if="categoryType === 'international'">
                    <MpPopover :id="`branch-cur-${ri}`" is-close-on-select use-portal is-adaptive-width placement="bottom-start">
                      <MpPopoverTrigger>
                        <MpInputGroup style="width:100%;">
                          <MpInputLeftAddon has-background>
                            <button :class="currencyTrigger">{{ rule.currency }}<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                          </MpInputLeftAddon>
                          <MpInput v-model="rule.amount" placeholder="0" :isFullWidth="true" @click.stop />
                        </MpInputGroup>
                      </MpPopoverTrigger>
                      <MpPopoverContent :class="css({ marginTop: '2px' })">
                        <MpPopoverList>
                          <MpPopoverListItem v-for="code in availableCurrencies(branchRules, ri)" :key="code" :is-active="rule.currency === code" @click="rule.currency = code">{{ getCurrencyLabel(code) }}</MpPopoverListItem>
                        </MpPopoverList>
                      </MpPopoverContent>
                    </MpPopover>
                  </template>
                  <MpInputGroup v-else style="width:100%;">
                    <MpInputLeftAddon has-background><MpText size="body" weight="semiBold">{{ DOMESTIC_CURRENCY }}</MpText></MpInputLeftAddon>
                    <MpInput v-model="rule.amount" placeholder="0" :isFullWidth="true" />
                  </MpInputGroup>
                </MpTableCell>
                <!-- Frequency popover -->
                <MpTableCell as="td" scope="row">
                  <MpPopover :id="`branch-freq-${ri}`" is-close-on-select use-portal is-adaptive-width placement="bottom-start">
                    <MpPopoverTrigger>
                      <button :class="frequencyTrigger">
                        {{ FREQ_LABELS[rule.frequency] }}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </button>
                    </MpPopoverTrigger>
                    <MpPopoverContent :class="css({ marginTop: '2px' })">
                      <MpPopoverList>
                        <MpPopoverListItem v-for="f in availableFrequencies(branchRules, rule.currency, ri)" :key="f" :is-active="rule.frequency === f" @click="rule.frequency = f">{{ FREQ_LABELS[f] }}</MpPopoverListItem>
                      </MpPopoverList>
                    </MpPopoverContent>
                  </MpPopover>
                </MpTableCell>
                <MpTableCell as="td" scope="row">
                  <MpButton variant="ghost" size="sm" left-icon="minus-circular" aria-label="Remove" @click="removeRule(branchRules, ri)" />
                </MpTableCell>
              </MpTableRow>
            </MpTableBody>
          </MpTable>
          <MpButton v-if="!allRulesUsed(branchRules)" variant="secondary" size="md" left-icon="add" @click="addRule(branchRules)">Add rule</MpButton>
        </MpFlex>

        <!-- Organization -->
        <MpFlex direction="column" gap="3">
          <MpFlex direction="column" gap="1">
            <MpText size="body" weight="semiBold" color="dark">Organization</MpText>
            <MpText size="body" color="gray.600">Set the rules that will apply to the organizations.</MpText>
          </MpFlex>
          <MpTable :is-hoverable="false" style="table-layout:fixed; width:100%;">
            <MpTableHead>
              <MpTableRow>
                <MpTableCell as="th" scope="col" style="width:calc(50% - 20px);">Max amount</MpTableCell>
                <MpTableCell as="th" scope="col" style="width:calc(50% - 20px);">Frequency</MpTableCell>
                <MpTableCell as="th" scope="col" style="width:40px;" />
              </MpTableRow>
            </MpTableHead>
            <MpTableBody is-narrowed>
              <MpTableRow v-for="(rule, ri) in orgRules" :key="ri">
                <MpTableCell as="td" scope="row">
                  <template v-if="categoryType === 'international'">
                    <MpPopover :id="`org-cur-${ri}`" is-close-on-select use-portal is-adaptive-width placement="bottom-start">
                      <MpPopoverTrigger>
                        <MpInputGroup style="width:100%;">
                          <MpInputLeftAddon has-background>
                            <button :class="currencyTrigger">{{ rule.currency }}<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                          </MpInputLeftAddon>
                          <MpInput v-model="rule.amount" placeholder="0" :isFullWidth="true" @click.stop />
                        </MpInputGroup>
                      </MpPopoverTrigger>
                      <MpPopoverContent :class="css({ marginTop: '2px' })">
                        <MpPopoverList>
                          <MpPopoverListItem v-for="code in availableCurrencies(orgRules, ri)" :key="code" :is-active="rule.currency === code" @click="rule.currency = code">{{ getCurrencyLabel(code) }}</MpPopoverListItem>
                        </MpPopoverList>
                      </MpPopoverContent>
                    </MpPopover>
                  </template>
                  <MpInputGroup v-else style="width:100%;">
                    <MpInputLeftAddon has-background><MpText size="body" weight="semiBold">{{ DOMESTIC_CURRENCY }}</MpText></MpInputLeftAddon>
                    <MpInput v-model="rule.amount" placeholder="0" :isFullWidth="true" />
                  </MpInputGroup>
                </MpTableCell>
                <MpTableCell as="td" scope="row">
                  <MpPopover :id="`org-freq-${ri}`" is-close-on-select use-portal is-adaptive-width placement="bottom-start">
                    <MpPopoverTrigger>
                      <button :class="frequencyTrigger">
                        {{ FREQ_LABELS[rule.frequency] }}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </button>
                    </MpPopoverTrigger>
                    <MpPopoverContent :class="css({ marginTop: '2px' })">
                      <MpPopoverList>
                        <MpPopoverListItem v-for="f in availableFrequencies(orgRules, rule.currency, ri)" :key="f" :is-active="rule.frequency === f" @click="rule.frequency = f">{{ FREQ_LABELS[f] }}</MpPopoverListItem>
                      </MpPopoverList>
                    </MpPopoverContent>
                  </MpPopover>
                </MpTableCell>
                <MpTableCell as="td" scope="row">
                  <MpButton variant="ghost" size="sm" left-icon="minus-circular" aria-label="Remove" @click="removeRule(orgRules, ri)" />
                </MpTableCell>
              </MpTableRow>
            </MpTableBody>
          </MpTable>
          <MpButton v-if="!allRulesUsed(orgRules)" variant="secondary" size="md" left-icon="add" @click="addRule(orgRules)">Add rule</MpButton>
        </MpFlex>

        <!-- Employee -->
        <MpFlex direction="column" gap="3">
          <MpFlex direction="column" gap="1">
            <MpText size="body" weight="semiBold" color="dark">Employee</MpText>
            <MpText size="body" color="gray.600">Set the rules that will apply to the employees.</MpText>
          </MpFlex>
          <MpTable :is-hoverable="false" style="table-layout:fixed; width:100%;">
            <MpTableHead>
              <MpTableRow>
                <MpTableCell as="th" scope="col" style="width:calc(50% - 20px);">Max amount</MpTableCell>
                <MpTableCell as="th" scope="col" style="width:calc(50% - 20px);">Frequency</MpTableCell>
                <MpTableCell as="th" scope="col" style="width:40px;" />
              </MpTableRow>
            </MpTableHead>
            <MpTableBody is-narrowed>
              <MpTableRow v-for="(rule, ri) in employeeRules" :key="ri">
                <MpTableCell as="td" scope="row">
                  <template v-if="categoryType === 'international'">
                    <MpPopover :id="`emp-cur-${ri}`" is-close-on-select use-portal is-adaptive-width placement="bottom-start">
                      <MpPopoverTrigger>
                        <MpInputGroup style="width:100%;">
                          <MpInputLeftAddon has-background>
                            <button :class="currencyTrigger">{{ rule.currency }}<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                          </MpInputLeftAddon>
                          <MpInput v-model="rule.amount" placeholder="0" :isFullWidth="true" @click.stop />
                        </MpInputGroup>
                      </MpPopoverTrigger>
                      <MpPopoverContent :class="css({ marginTop: '2px' })">
                        <MpPopoverList>
                          <MpPopoverListItem v-for="code in availableCurrencies(employeeRules, ri)" :key="code" :is-active="rule.currency === code" @click="rule.currency = code">{{ getCurrencyLabel(code) }}</MpPopoverListItem>
                        </MpPopoverList>
                      </MpPopoverContent>
                    </MpPopover>
                  </template>
                  <MpInputGroup v-else style="width:100%;">
                    <MpInputLeftAddon has-background><MpText size="body" weight="semiBold">{{ DOMESTIC_CURRENCY }}</MpText></MpInputLeftAddon>
                    <MpInput v-model="rule.amount" placeholder="0" :isFullWidth="true" />
                  </MpInputGroup>
                </MpTableCell>
                <MpTableCell as="td" scope="row">
                  <MpPopover :id="`emp-freq-${ri}`" is-close-on-select use-portal is-adaptive-width placement="bottom-start">
                    <MpPopoverTrigger>
                      <button :class="frequencyTrigger">
                        {{ FREQ_LABELS[rule.frequency] }}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </button>
                    </MpPopoverTrigger>
                    <MpPopoverContent :class="css({ marginTop: '2px' })">
                      <MpPopoverList>
                        <MpPopoverListItem v-for="f in availableFrequencies(employeeRules, rule.currency, ri)" :key="f" :is-active="rule.frequency === f" @click="rule.frequency = f">{{ FREQ_LABELS[f] }}</MpPopoverListItem>
                      </MpPopoverList>
                    </MpPopoverContent>
                  </MpPopover>
                </MpTableCell>
                <MpTableCell as="td" scope="row">
                  <MpButton variant="ghost" size="sm" left-icon="minus-circular" aria-label="Remove" @click="removeRule(employeeRules, ri)" />
                </MpTableCell>
              </MpTableRow>
            </MpTableBody>
          </MpTable>
          <MpButton v-if="!allRulesUsed(employeeRules)" variant="secondary" size="md" left-icon="add" @click="addRule(employeeRules)">Add rule</MpButton>
        </MpFlex>

      </template>

      <!-- No limit message -->
      <template v-else>
        <MpText size="body" color="dark">Members assigned to this category have no spending limit for any frequency.</MpText>
      </template>
    </MpFlex>

    <!-- ══ 4. Additional rules ══ -->
    <MpFlex direction="column" gap="3" marginBottom="16">
      <MpFlex direction="column" gap="1">
        <MpText size="h2" weight="semiBold" color="dark">Additional rules</MpText>
        <MpText size="body" color="gray.600">Additional rule that will limit amount per transaction.</MpText>
      </MpFlex>

      <MpCheckbox
        id="limit-tx"
        :isChecked="hasLimitPerTx"
        @change="onLimitPerTxChange"
      >This category has limit per transaction</MpCheckbox>

      <!-- Constrained column: shrinks to button width (flex-start), children stretch to match -->
      <div v-if="hasLimitPerTx" style="display:flex; flex-direction:column; gap:8px; align-self:flex-start; align-items:stretch;">
        <!-- One input row per perTxLimits entry -->
        <MpFlex v-for="(row, i) in perTxLimits" :key="i" align="center" gap="2">
          <!-- flex:1 so input fills the row width left after the remove button -->
          <div style="flex:1; min-width:0;">
            <MpPopover
              :id="`pertx-cur-${i}`"
              is-close-on-select
              use-portal
              is-adaptive-width
              placement="bottom-start"
            >
              <MpPopoverTrigger>
                <MpInputGroup style="width:100%;">
                  <MpInputLeftAddon has-background>
                    <button :class="currencyTrigger">{{ row.currency }}<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                  </MpInputLeftAddon>
                  <MpInput
                    :modelValue="row.amount"
                    placeholder="0"
                    :isFullWidth="true"
                    @click.stop
                    @input="(e: Event) => (row.amount = formatThousands((e.target as HTMLInputElement).value))"
                  />
                </MpInputGroup>
              </MpPopoverTrigger>
              <MpPopoverContent :class="css({ marginTop: '2px' })">
                <MpPopoverList>
                  <MpPopoverListItem
                    v-for="code in availablePerTxCurrencies(i)"
                    :key="code"
                    :is-active="row.currency === code"
                    @click="row.currency = code"
                  >{{ getCurrencyLabel(code) }}</MpPopoverListItem>
                </MpPopoverList>
              </MpPopoverContent>
            </MpPopover>
          </div>

          <!-- Remove — only when more than 1 row -->
          <MpButton
            v-if="perTxLimits.length > 1"
            variant="ghost"
            size="sm"
            left-icon="minus-circular"
            aria-label="Remove"
            @click="perTxLimits.splice(i, 1)"
          />
        </MpFlex>

        <!-- Add more — secondary + chevrons-down; opens popover showing unused currencies -->
        <MpPopover
          v-if="unusedPerTxCurrencies.length > 0"
          id="pertx-add-more"
          is-close-on-select
          use-portal
          placement="bottom-start"
        >
          <MpPopoverTrigger>
            <MpButton variant="secondary" size="md" right-icon="chevrons-down" style="width:100%;">
              Add more limit per transaction
            </MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent :class="css({ marginTop: '2px' })">
            <MpPopoverList>
              <MpPopoverListItem
                v-for="code in unusedPerTxCurrencies"
                :key="code"
                @click="perTxLimits.push({ currency: code, amount: '' })"
              >{{ getCurrencyLabel(code) }}</MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </MpPopover>
      </div>
    </MpFlex>

    <!-- ══ 5. Member for this category ══ -->
    <MpFlex direction="column" gap="4" marginBottom="8">
      <MpFlex direction="column" gap="1">
        <MpText size="h2" weight="semiBold" color="dark">Member for this category</MpText>
        <MpText size="body" color="gray.600">
          You can select which organization and branch that will have access to this category. Please add at least one member.
        </MpText>
      </MpFlex>

      <!-- Category member radio -->
      <MpFlex direction="column" gap="2">
        <MpText size="body" weight="semiBold" color="dark">Category member</MpText>
        <MpFlex align="center" gap="6">
          <span style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;" @click="memberScope = 'all'">
            <span :style="`width:18px;height:18px;border-radius:50%;border:2px solid ${memberScope==='all' ? 'var(--mp-colors-indigo-700,#4338CA)' : 'var(--mp-colors-gray-300,#D1D5DB)'};background:${memberScope==='all' ? 'var(--mp-colors-indigo-700,#4338CA)' : 'white'};display:flex;align-items:center;justify-content:center;flex-shrink:0;`">
              <span v-if="memberScope==='all'" style="width:6px;height:6px;border-radius:50%;background:white;"></span>
            </span>
            <MpText size="body" color="dark">All members</MpText>
          </span>
          <span style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;" @click="memberScope = 'specific'">
            <span :style="`width:18px;height:18px;border-radius:50%;border:2px solid ${memberScope==='specific' ? 'var(--mp-colors-indigo-700,#4338CA)' : 'var(--mp-colors-gray-300,#D1D5DB)'};background:${memberScope==='specific' ? 'var(--mp-colors-indigo-700,#4338CA)' : 'white'};display:flex;align-items:center;justify-content:center;flex-shrink:0;`">
              <span v-if="memberScope==='specific'" style="width:6px;height:6px;border-radius:50%;background:white;"></span>
            </span>
            <MpText size="body" color="dark">Specific members</MpText>
          </span>
        </MpFlex>
      </MpFlex>

      <!-- Specific members content -->
      <template v-if="memberScope === 'specific'">

        <!-- Add member by -->
        <MpFlex direction="column" gap="2">
          <MpText size="body" weight="semiBold" color="dark">Add member by</MpText>
          <MpPopover id="std-add-member-by" is-close-on-select use-portal placement="bottom-start">
            <MpPopoverTrigger>
              <button :class="frequencyTrigger" style="max-width:360px;">
                <span :class="selectLabel">{{ addMemberBy === 'employee' ? 'Employee' : 'Organization & Branch' }}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </MpPopoverTrigger>
            <MpPopoverContent :class="css({ marginTop: '2px', minWidth: '200px' })">
              <MpPopoverList>
                <MpPopoverListItem :is-active="addMemberBy === 'employee'"   @click="addMemberBy = 'employee'">Employee</MpPopoverListItem>
                <MpPopoverListItem :is-active="addMemberBy === 'org-branch'" @click="addMemberBy = 'org-branch'">Organization &amp; Branch</MpPopoverListItem>
              </MpPopoverList>
            </MpPopoverContent>
          </MpPopover>
        </MpFlex>

        <!-- ── Employee mode ── -->
        <template v-if="addMemberBy === 'employee'">
          <div v-if="selectedEmployees.length" style="width:100%; overflow-x:auto;">
            <MpTable :is-hoverable="false" style="width:100%; min-width:720px;">
              <MpTableHead>
                <MpTableRow>
                  <MpTableCell as="th" scope="col">Name</MpTableCell>
                  <MpTableCell as="th" scope="col">Job position</MpTableCell>
                  <MpTableCell as="th" scope="col">Job level</MpTableCell>
                  <MpTableCell as="th" scope="col">Job grade</MpTableCell>
                  <MpTableCell as="th" scope="col">Organization</MpTableCell>
                  <MpTableCell as="th" scope="col">Branch</MpTableCell>
                  <MpTableCell as="th" scope="col" style="width:48px;" />
                </MpTableRow>
              </MpTableHead>
              <MpTableBody is-narrowed>
                <MpTableRow v-for="e in selectedEmployees" :key="e.id">
                  <MpTableCell as="td" scope="row"><MpText size="body" color="dark">{{ e.name }}</MpText></MpTableCell>
                  <MpTableCell as="td" scope="row"><MpText size="body" color="dark">{{ e.position }}</MpText></MpTableCell>
                  <MpTableCell as="td" scope="row"><MpText size="body" color="dark">{{ e.level }}</MpText></MpTableCell>
                  <MpTableCell as="td" scope="row"><MpText size="body" color="dark">{{ e.grade }}</MpText></MpTableCell>
                  <MpTableCell as="td" scope="row"><MpText size="body" color="dark">{{ e.organization }}</MpText></MpTableCell>
                  <MpTableCell as="td" scope="row"><MpText size="body" color="dark">{{ e.branch }}</MpText></MpTableCell>
                  <MpTableCell as="td" scope="row">
                    <MpButton variant="ghost" size="sm" left-icon="minus-circular"
                              aria-label="Remove employee" @click="removeEmployee(e.id)" />
                  </MpTableCell>
                </MpTableRow>
              </MpTableBody>
            </MpTable>
          </div>
          <MpButton variant="secondary" size="md" left-icon="add" style="align-self:flex-start;"
                    @click="openMemberDrawer">Add employee</MpButton>
        </template>

        <!-- ── Organization & Branch mode ── -->
        <template v-else>
          <!-- Organization single-select with search -->
          <MpFlex direction="column" gap="2">
            <MpText size="body" weight="semiBold" color="dark">Organization</MpText>
            <MpPopover id="std-org-select" is-close-on-select use-portal placement="bottom-start"
                       @close="orgSearch = ''">
              <MpPopoverTrigger>
                <button :class="orgTrigger">
                  <span :class="selectLabel" :style="selectedOrg ? '' : 'color:var(--mp-colors-gray-400)'">
                    {{ selectedOrg || 'Select organization' }}
                  </span>
                  <MpFlex align="center" gap="1" style="flex-shrink:0;">
                    <button v-if="selectedOrg" :class="orgClearBtn" @click.stop="clearOrg()">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      </svg>
                    </button>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </MpFlex>
                </button>
              </MpPopoverTrigger>
              <MpPopoverContent :class="css({ marginTop: '2px', minWidth: '320px' })">
                <div :class="css({ padding: '2', borderBottom: '1px solid', borderColor: 'border.form' })">
                  <MpInputGroup style="width:100%;">
                    <MpInputLeftAddon>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#9ca3af">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                    </MpInputLeftAddon>
                    <MpInput v-model="orgSearch" placeholder="Search..." :isFullWidth="true" @click.stop />
                  </MpInputGroup>
                </div>
                <MpPopoverList>
                  <MpPopoverListItem v-for="o in orgSearchOptions" :key="o"
                    :is-active="selectedOrg === o"
                    @click="selectedOrg = o; orgSearch = ''; selectedBranches = []">{{ o }}</MpPopoverListItem>
                  <MpPopoverListItem v-if="orgSearchOptions.length === 0" :is-disabled="true">No results</MpPopoverListItem>
                </MpPopoverList>
              </MpPopoverContent>
            </MpPopover>
          </MpFlex>

          <!-- Branch multi-select -->
          <MpFlex direction="column" gap="1">
            <MpText size="body" weight="semiBold" color="dark">Branch</MpText>
            <MpPopover id="std-branch-select" use-portal placement="bottom-start">
              <MpPopoverTrigger>
                <button :class="orgTrigger">
                  <span :class="selectLabel" :style="selectedBranches.length ? '' : 'color:var(--mp-colors-gray-400)'">
                    {{ selectedBranchesLabel }}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </MpPopoverTrigger>
              <MpPopoverContent :class="css({ marginTop: '2px', minWidth: '260px', maxHeight: '280px', overflowY: 'auto' })">
                <MpPopoverList>
                  <MpPopoverListItem v-for="b in filteredBranchOptions" :key="b" @click="toggleBranch(b)">
                    <span style="display:inline-flex;align-items:center;gap:8px;">
                      <span :style="`width:16px;height:16px;border-radius:4px;flex-shrink:0;pointer-events:none;display:flex;align-items:center;justify-content:center;border:1.5px solid ${selectedBranches.includes(b) ? 'var(--mp-colors-indigo-700,#4338CA)' : 'var(--mp-colors-gray-300,#D1D5DB)'};background:${selectedBranches.includes(b) ? 'var(--mp-colors-indigo-700,#4338CA)' : 'transparent'};`">
                        <svg v-if="selectedBranches.includes(b)" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </span>
                      {{ b }}
                    </span>
                  </MpPopoverListItem>
                </MpPopoverList>
              </MpPopoverContent>
            </MpPopover>
            <MpText v-if="selectedBranchesHint" size="body-small" color="gray.600">{{ selectedBranchesHint }}</MpText>
          </MpFlex>
        </template>

      </template>
    </MpFlex>

  </div>

  <!-- Footer -->
  <div :class="stickyFooter">
    <MpButton variant="ghost" size="md" @click="cancel">Cancel</MpButton>
    <MpButton variant="primary" size="md" :isLoading="saving" @click="save">Save</MpButton>
  </div>

  <!-- ══ Add employee drawer ══ -->
  <MpDrawer id="std-add-member-drawer" :is-open="memberDrawerOpen" size="xl" placement="right"
            is-block-scroll-on-mount @close="memberDrawerOpen = false">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <MpText size="h2" weight="semiBold" color="dark">Add employee</MpText>
        <MpDrawerCloseButton />
      </MpDrawerHeader>
      <MpDrawerBody>

        <!-- Search + filters -->
        <MpFlex direction="column" gap="3">
          <MpInputGroup style="max-width:320px;">
            <MpInputLeftAddon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#9ca3af">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </MpInputLeftAddon>
            <MpInput v-model="memberSearch" placeholder="Search name" :isFullWidth="true" />
          </MpInputGroup>

          <!-- Filter row -->
          <MpFlex align="center" gap="2" wrap="wrap">
            <!-- Organization -->
            <MpPopover id="std-mem-filter-org" use-portal placement="bottom-start">
              <MpPopoverTrigger>
                <button :class="filterTrigger">
                  <span :class="selectLabel">{{ filterLabel(filterOrg, 'All organization') }}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </MpPopoverTrigger>
              <MpPopoverContent :class="css({ marginTop: '2px', maxHeight: '280px', overflowY: 'auto' })">
                <MpPopoverList>
                  <MpPopoverListItem @click="filterOrg.splice(0)">
                    <span style="display:inline-flex;align-items:center;gap:8px;">
                      <span :style="`width:16px;height:16px;border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid ${!filterOrg.length ? 'var(--mp-colors-indigo-700,#4338CA)' : 'var(--mp-colors-gray-300,#D1D5DB)'};background:${!filterOrg.length ? 'var(--mp-colors-indigo-700,#4338CA)' : 'transparent'};pointer-events:none;`">
                        <svg v-if="!filterOrg.length" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </span>
                      All organization
                    </span>
                  </MpPopoverListItem>
                  <MpPopoverListItem v-for="o in orgOptions" :key="o" @click="toggleMemberFilter(filterOrg, o, orgOptions)">
                    <span style="display:inline-flex;align-items:center;gap:8px;">
                      <span :style="`width:16px;height:16px;border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid ${filterOrg.includes(o) ? 'var(--mp-colors-indigo-700,#4338CA)' : 'var(--mp-colors-gray-300,#D1D5DB)'};background:${filterOrg.includes(o) ? 'var(--mp-colors-indigo-700,#4338CA)' : 'transparent'};pointer-events:none;`">
                        <svg v-if="filterOrg.includes(o)" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </span>
                      {{ o }}
                    </span>
                  </MpPopoverListItem>
                </MpPopoverList>
              </MpPopoverContent>
            </MpPopover>

            <!-- Branch -->
            <MpPopover id="std-mem-filter-branch" use-portal placement="bottom-start">
              <MpPopoverTrigger>
                <button :class="filterTrigger">
                  <span :class="selectLabel">{{ filterLabel(filterBranch, 'All branch') }}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </MpPopoverTrigger>
              <MpPopoverContent :class="css({ marginTop: '2px', maxHeight: '280px', overflowY: 'auto' })">
                <MpPopoverList>
                  <MpPopoverListItem @click="filterBranch.splice(0)">
                    <span style="display:inline-flex;align-items:center;gap:8px;">
                      <span :style="`width:16px;height:16px;border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid ${!filterBranch.length ? 'var(--mp-colors-indigo-700,#4338CA)' : 'var(--mp-colors-gray-300,#D1D5DB)'};background:${!filterBranch.length ? 'var(--mp-colors-indigo-700,#4338CA)' : 'transparent'};pointer-events:none;`">
                        <svg v-if="!filterBranch.length" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </span>
                      All branch
                    </span>
                  </MpPopoverListItem>
                  <MpPopoverListItem v-for="b in branchOptions" :key="b" @click="toggleMemberFilter(filterBranch, b, branchOptions)">
                    <span style="display:inline-flex;align-items:center;gap:8px;">
                      <span :style="`width:16px;height:16px;border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid ${filterBranch.includes(b) ? 'var(--mp-colors-indigo-700,#4338CA)' : 'var(--mp-colors-gray-300,#D1D5DB)'};background:${filterBranch.includes(b) ? 'var(--mp-colors-indigo-700,#4338CA)' : 'transparent'};pointer-events:none;`">
                        <svg v-if="filterBranch.includes(b)" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </span>
                      {{ b }}
                    </span>
                  </MpPopoverListItem>
                </MpPopoverList>
              </MpPopoverContent>
            </MpPopover>

            <!-- Level -->
            <MpPopover id="std-mem-filter-level" use-portal placement="bottom-start">
              <MpPopoverTrigger>
                <button :class="filterTrigger">
                  <span :class="selectLabel">{{ filterLabel(filterLevel, 'All level') }}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </MpPopoverTrigger>
              <MpPopoverContent :class="css({ marginTop: '2px', maxHeight: '280px', overflowY: 'auto' })">
                <MpPopoverList>
                  <MpPopoverListItem @click="filterLevel.splice(0)">
                    <span style="display:inline-flex;align-items:center;gap:8px;">
                      <span :style="`width:16px;height:16px;border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid ${!filterLevel.length ? 'var(--mp-colors-indigo-700,#4338CA)' : 'var(--mp-colors-gray-300,#D1D5DB)'};background:${!filterLevel.length ? 'var(--mp-colors-indigo-700,#4338CA)' : 'transparent'};pointer-events:none;`">
                        <svg v-if="!filterLevel.length" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </span>
                      All level
                    </span>
                  </MpPopoverListItem>
                  <MpPopoverListItem v-for="l in levelOptions" :key="l" @click="toggleMemberFilter(filterLevel, l, levelOptions)">
                    <span style="display:inline-flex;align-items:center;gap:8px;">
                      <span :style="`width:16px;height:16px;border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid ${filterLevel.includes(l) ? 'var(--mp-colors-indigo-700,#4338CA)' : 'var(--mp-colors-gray-300,#D1D5DB)'};background:${filterLevel.includes(l) ? 'var(--mp-colors-indigo-700,#4338CA)' : 'transparent'};pointer-events:none;`">
                        <svg v-if="filterLevel.includes(l)" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </span>
                      {{ l }}
                    </span>
                  </MpPopoverListItem>
                </MpPopoverList>
              </MpPopoverContent>
            </MpPopover>

            <!-- Grade -->
            <MpPopover id="std-mem-filter-grade" use-portal placement="bottom-start">
              <MpPopoverTrigger>
                <button :class="filterTrigger">
                  <span :class="selectLabel">{{ filterLabel(filterGrade, 'All grade') }}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </MpPopoverTrigger>
              <MpPopoverContent :class="css({ marginTop: '2px', maxHeight: '280px', overflowY: 'auto' })">
                <MpPopoverList>
                  <MpPopoverListItem @click="filterGrade.splice(0)">
                    <span style="display:inline-flex;align-items:center;gap:8px;">
                      <span :style="`width:16px;height:16px;border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid ${!filterGrade.length ? 'var(--mp-colors-indigo-700,#4338CA)' : 'var(--mp-colors-gray-300,#D1D5DB)'};background:${!filterGrade.length ? 'var(--mp-colors-indigo-700,#4338CA)' : 'transparent'};pointer-events:none;`">
                        <svg v-if="!filterGrade.length" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </span>
                      All grade
                    </span>
                  </MpPopoverListItem>
                  <MpPopoverListItem v-for="g in gradeOptions" :key="g" @click="toggleMemberFilter(filterGrade, g, gradeOptions)">
                    <span style="display:inline-flex;align-items:center;gap:8px;">
                      <span :style="`width:16px;height:16px;border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid ${filterGrade.includes(g) ? 'var(--mp-colors-indigo-700,#4338CA)' : 'var(--mp-colors-gray-300,#D1D5DB)'};background:${filterGrade.includes(g) ? 'var(--mp-colors-indigo-700,#4338CA)' : 'transparent'};pointer-events:none;`">
                        <svg v-if="filterGrade.includes(g)" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </span>
                      {{ g }}
                    </span>
                  </MpPopoverListItem>
                </MpPopoverList>
              </MpPopoverContent>
            </MpPopover>

            <MpButton v-if="filterOrg.length || filterBranch.length || filterLevel.length || filterGrade.length"
              variant="ghost" size="md" @click="filterOrg.splice(0); filterBranch.splice(0); filterLevel.splice(0); filterGrade.splice(0)">Reset</MpButton>
          </MpFlex>
        </MpFlex>

        <!-- Selected count bar -->
        <div v-if="draftSelectedIds.length" :class="selectedBar" style="margin-top:12px;">
          <MpFlex align="center" justify="space-between">
            <MpText size="body" color="blue.700">{{ draftSelectedIds.length }} employee selected</MpText>
            <MpButton variant="ghost" size="sm" @click="resetDraft">Reset</MpButton>
          </MpFlex>
        </div>

        <!-- Employee table -->
        <div style="margin-top:12px; overflow-x:auto;">
          <MpTable :is-hoverable="false" style="width:100%; min-width:700px;">
            <MpTableHead>
              <MpTableRow>
                <MpTableCell as="th" scope="col" style="width:40px;">
                  <MpCheckbox id="std-chk-all" :isChecked="pageAllSelected" @change="togglePageAll" />
                </MpTableCell>
                <MpTableCell as="th" scope="col">
                  <button :class="sortHeader" @click="sortBy('name')">
                    Name <span :class="sortCaret">{{ memberSort.key==='name' ? (memberSort.dir==='asc' ? '↑' : '↓') : '↕' }}</span>
                  </button>
                </MpTableCell>
                <MpTableCell as="th" scope="col">Job position</MpTableCell>
                <MpTableCell as="th" scope="col">
                  <button :class="sortHeader" @click="sortBy('organization')">
                    Organization <span :class="sortCaret">{{ memberSort.key==='organization' ? (memberSort.dir==='asc' ? '↑' : '↓') : '↕' }}</span>
                  </button>
                </MpTableCell>
                <MpTableCell as="th" scope="col">Branch</MpTableCell>
                <MpTableCell as="th" scope="col">Level</MpTableCell>
                <MpTableCell as="th" scope="col">Grade</MpTableCell>
              </MpTableRow>
            </MpTableHead>
            <MpTableBody is-narrowed>
              <MpTableRow v-if="pagedEmployees.length === 0">
                <MpTableCell as="td" :colspan="7" style="text-align:center; padding:24px;">
                  <MpText size="body" color="gray.400">No employees found</MpText>
                </MpTableCell>
              </MpTableRow>
              <MpTableRow v-for="e in pagedEmployees" :key="e.id"
                :style="isDraftSelected(e.id) ? 'background:var(--mp-colors-blue-50)' : ''"
                style="cursor:pointer;" @click="toggleDraft(e.id)">
                <MpTableCell as="td" scope="row" @click.stop>
                  <MpCheckbox :id="`std-chk-${e.id}`" :isChecked="isDraftSelected(e.id)" @change="toggleDraft(e.id)" />
                </MpTableCell>
                <MpTableCell as="td" scope="row"><MpText size="body" color="dark">{{ e.name }}</MpText></MpTableCell>
                <MpTableCell as="td" scope="row"><MpText size="body" color="dark">{{ e.position }}</MpText></MpTableCell>
                <MpTableCell as="td" scope="row"><MpText size="body" color="dark">{{ e.organization }}</MpText></MpTableCell>
                <MpTableCell as="td" scope="row"><MpText size="body" color="dark">{{ e.branch }}</MpText></MpTableCell>
                <MpTableCell as="td" scope="row"><MpText size="body" color="dark">{{ e.level }}</MpText></MpTableCell>
                <MpTableCell as="td" scope="row"><MpText size="body" color="dark">{{ e.grade }}</MpText></MpTableCell>
              </MpTableRow>
            </MpTableBody>
          </MpTable>
        </div>

        <!-- Pagination -->
        <AppPagination
          :total="filteredEmployees.length"
          :page="memberPage"
          :rows-per-page="memberRowsPerPage"
          @update:page="memberPage = $event"
          @update:rows-per-page="memberRowsPerPage = $event"
        />

      </MpDrawerBody>
      <MpDrawerFooter>
        <MpButton variant="ghost" size="md" @click="memberDrawerOpen = false">Cancel</MpButton>
        <MpButton variant="primary" size="md" @click="confirmMembers">
          Add ({{ draftSelectedIds.length }})
        </MpButton>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>
</template>
