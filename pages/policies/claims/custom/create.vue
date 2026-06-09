<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Policies › Claims › Create custom category
  Source     : Screenshot reference (custom policy create) + logic reused from
               pages/policies/claims/create.vue (standard category)
  Token mode : Pixel 2.4 · @mekari/pixel3
  Patterns   : form-view, data-table (rule rows), confirmation-free save footer
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  REMOVED from screenshot (per request): Status radio, Rule type radio.

  RULE TABLE columns (Max amount BEFORE Frequency, per request):
    Category · Profile · Max amount · Frequency · Limitation · (remove)

  LOGIC:
    - Category = a standard category. If it's international it carries currencies →
      those currencies populate the Max amount currency picker for that row
      ("bring the multicurrencies to the table"). Domestic → Rp.
    - Frequency uniqueness (reused from standard): each Category+Profile+Currency
      can use a frequency only once.
    - Limitation "No limit" → Max amount becomes "Unlimited" + disabled.
    - Remove = ghost minus-circular icon button (was a red "Remove" link).
    - Limit per transaction = same block as standard category; currencies sourced
      from the currencies in use across the rule rows.

  STATES: happy path + empty rule row (placeholders) + no-limit row + edit-title.
  GAPS: server validation, edit-mode hydration (title only for now).
-->
<script setup lang="ts">
import {
  MpFlex, MpText, MpTextlink,
  MpButton, MpButtonGroup,
  MpBanner, MpBannerIcon, MpBannerDescription,
  MpFormControl, MpFormLabel,
  MpInput, MpInputGroup, MpInputLeftAddon, MpTextarea,
  MpCheckbox, MpRadio,
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
  MpTable, MpTableHead, MpTableBody, MpTableRow, MpTableCell,
  MpDrawer, MpDrawerContent, MpDrawerHeader, MpDrawerCloseButton,
  MpDrawerBody, MpDrawerFooter, MpDrawerOverlay,
  css, toast,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Create custom category',
  breadcrumbParent: { label: 'Claims', path: '/policies/claims' },
})
const router = useRouter()
const route  = useRoute()

const isEditMode = computed(() => route.query.mode === 'edit')
watchEffect(() => {
  route.meta.title = isEditMode.value ? 'Edit custom category' : 'Create custom category'
})

// ─── Reference data ───────────────────────────────────────────────
const ALL_CURRENCIES = [
  { code: 'AUD', name: 'Australian dollar' },
  { code: 'CAD', name: 'Canadian dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British pound' },
  { code: 'HKD', name: 'Hong Kong dollar' },
  { code: 'JPY', name: 'Japanese yen' },
  { code: 'MYR', name: 'Malaysian ringgit' },
  { code: 'SGD', name: 'Singapore dollar' },
  { code: 'USD', name: 'US dollar' },
]
const DOMESTIC_CURRENCY = 'Rp'

// Standard categories the user can pull into a rule. International ones carry currencies.
interface StdCategory { id: string; name: string; type: 'domestic' | 'international'; currencies: string[] }
const STD_CATEGORIES: StdCategory[] = [
  { id: 'office-tools',   name: 'Office Tools',        type: 'international', currencies: ['HKD', 'MYR', 'JPY', 'SGD', 'USD'] },
  { id: 'entertainment',  name: 'Entertainment Claim', type: 'international', currencies: ['USD', 'SGD'] },
  { id: 'travel',         name: 'Business Travel',     type: 'international', currencies: ['USD', 'EUR', 'SGD'] },
  { id: 'office-supplies',name: 'Office Supplies',     type: 'domestic',     currencies: [] },
  { id: 'transport',      name: 'Transportation',      type: 'domestic',     currencies: [] },
]

const PROFILE_OPTIONS = [
  { value: 'employee',     label: 'Per employee' },
  { value: 'organization', label: 'Per organization' },
  { value: 'branch',       label: 'Per branch' },
]

const ALL_FREQUENCIES = ['per-week', 'per-month', 'per-year']
const FREQ_LABELS: Record<string, string> = {
  'per-week': 'Per week', 'per-month': 'Per month', 'per-year': 'Per year',
}

// ─── Label helpers ────────────────────────────────────────────────
function categoryById(id: string) { return STD_CATEGORIES.find(c => c.id === id) }
function categoryName(id: string)  { return categoryById(id)?.name ?? '' }
function profileLabel(v: string)   { return PROFILE_OPTIONS.find(p => p.value === v)?.label ?? '' }
function getCurrencyLabel(code: string): string {
  if (code === DOMESTIC_CURRENCY) return 'Rp - Indonesian rupiah'
  const c = ALL_CURRENCIES.find(c => c.code === code)
  return c ? `${code} - ${c.name}` : code
}
function isInternational(id: string) { return categoryById(id)?.type === 'international' }
// Currencies available for a row's Max amount, sourced from its selected category
function rowCurrencies(id: string): string[] {
  const cat = categoryById(id)
  if (!cat) return [DOMESTIC_CURRENCY]
  return cat.type === 'international' ? cat.currencies : [DOMESTIC_CURRENCY]
}
// What the Max amount addon should display
function currencyDisplay(rule: CustomRule): string {
  if (!rule.category || !isInternational(rule.category)) return DOMESTIC_CURRENCY
  return rule.currency || rowCurrencies(rule.category)[0] || DOMESTIC_CURRENCY
}

function formatThousands(val: string): string {
  const digits = val.replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('id-ID')
}

// ─── Basic information ────────────────────────────────────────────
const name        = ref('')
const description = ref('')

// ─── Rule rows ────────────────────────────────────────────────────
interface CustomRule {
  category: string
  profile: string
  currency: string
  amount: string
  frequency: string
  noLimit: boolean
}
function emptyRule(): CustomRule {
  return { category: '', profile: '', currency: '', amount: '', frequency: '', noLimit: false }
}
const rules    = ref<CustomRule[]>([emptyRule()])
const ruleType = ref<'with-limit' | 'no-limit'>('with-limit')

// Frequency uniqueness — each Category+Profile+Currency can use a frequency once
function availableFrequencies(i: number): string[] {
  const r = rules.value[i]
  const used = new Set(
    rules.value
      .filter((x, idx) => idx !== i && x.category === r.category && x.profile === r.profile && x.currency === r.currency)
      .map(x => x.frequency)
      .filter(Boolean),
  )
  return ALL_FREQUENCIES.filter(f => !used.has(f))
}

function onSelectCategory(rule: CustomRule, id: string) {
  rule.category = id
  // Bring the category's currencies into the row; default to its first currency (or Rp)
  rule.currency = rowCurrencies(id)[0] ?? DOMESTIC_CURRENCY
  // Drop a now-conflicting frequency
  const idx = rules.value.indexOf(rule)
  if (rule.frequency && !availableFrequencies(idx).includes(rule.frequency)) rule.frequency = ''
}

function onSelectCurrency(rule: CustomRule, code: string) {
  rule.currency = code
  const idx = rules.value.indexOf(rule)
  if (rule.frequency && !availableFrequencies(idx).includes(rule.frequency)) rule.frequency = ''
}

function toggleNoLimit(i: number, v: boolean) {
  rules.value[i].noLimit = v
  if (v) rules.value[i].amount = ''
}

function addRule() { rules.value.push(emptyRule()) }
function removeRule(i: number) { rules.value.splice(i, 1) }

// ─── Limit per transaction (same block as standard category) ──────
// Currencies offered = those actually used across the rule rows (fallback Rp).
const ruleCurrencies = computed(() => {
  const s = new Set<string>()
  for (const r of rules.value) if (r.currency) s.add(r.currency)
  return s.size ? [...s] : [DOMESTIC_CURRENCY]
})

interface PerTxLimit { currency: string; amount: string }
const hasLimitPerTx = ref(false)
const perTxLimits   = ref<PerTxLimit[]>([])

function availablePerTxCurrencies(excludeIdx: number): string[] {
  const taken = new Set(perTxLimits.value.filter((_, i) => i !== excludeIdx).map(r => r.currency))
  return ruleCurrencies.value.filter(c => !taken.has(c))
}
const unusedPerTxCurrencies = computed(() => {
  const used = new Set(perTxLimits.value.map(r => r.currency))
  return ruleCurrencies.value.filter(c => !used.has(c))
})
function onLimitPerTxChange(v: boolean) {
  hasLimitPerTx.value = v
  if (v && perTxLimits.value.length === 0 && ruleCurrencies.value.length > 0)
    perTxLimits.value.push({ currency: ruleCurrencies.value[0], amount: '' })
  if (!v) perTxLimits.value = []
}
// Keep per-tx rows valid as rule currencies change
watch(ruleCurrencies, (next) => {
  perTxLimits.value = perTxLimits.value.filter(r => next.includes(r.currency))
  if (hasLimitPerTx.value && perTxLimits.value.length === 0 && next.length > 0)
    perTxLimits.value.push({ currency: next[0], amount: '' })
})

// At least one rule must have a category before per-transaction limits are allowed
const anyCategorySelected = computed(() => rules.value.some(r => !!r.category))

// ─── Members (employees) ──────────────────────────────────────────
interface Employee {
  id: string; name: string; position: string
  organization: string; branch: string; level: string; grade: string
}
const ALL_EMPLOYEES: Employee[] = [
  { id: 'EMP001', name: 'Admin LMS In House',    position: 'CEO',               organization: 'IT Division',                   branch: 'Pusat',           level: 'C-Level',    grade: 'Grade 9' },
  { id: 'EMP002', name: 'Employee LMS In House', position: 'Staff GA',          organization: 'HRD & GA',                      branch: 'Pusat',           level: 'Staff',      grade: 'Grade 3' },
  { id: 'EMP003', name: 'Nando Yoga',            position: 'CEO',               organization: 'Board of Director (BOD) HQ',    branch: 'Pusat',           level: 'C-Level',    grade: 'Grade 9' },
  { id: 'EMP004', name: 'Brian Wijaya',          position: 'Manager HRD & GA',  organization: 'HRD & GA',                      branch: 'Pusat',           level: 'Manager',    grade: 'Grade 6' },
  { id: 'EMP005', name: 'Gille Cripowi',         position: 'Manager HRD & GA',  organization: 'HRD & GA',                      branch: 'Pusat',           level: 'Manager',    grade: 'Grade 6' },
  { id: 'EMP006', name: 'Andi Wijaya',           position: 'Staff Finance',     organization: 'Finance',                       branch: 'Jakarta HQ',      level: 'Staff',      grade: 'Grade 3' },
  { id: 'EMP007', name: 'Budi Santoso',          position: 'Supervisor Finance',organization: 'Finance',                       branch: 'Jakarta HQ',      level: 'Supervisor', grade: 'Grade 5' },
  { id: 'EMP008', name: 'Citra Lestari',         position: 'Manager Finance',   organization: 'Finance',                       branch: 'Jakarta HQ',      level: 'Manager',    grade: 'Grade 6' },
  { id: 'EMP009', name: 'Dewi Anggraini',        position: 'Staff Marketing',   organization: 'Marketing',                     branch: 'Surabaya Office', level: 'Staff',      grade: 'Grade 3' },
  { id: 'EMP010', name: 'Eko Prasetyo',          position: 'Lead Engineer',     organization: 'Engineering',                   branch: 'Bandung Office',  level: 'Lead',       grade: 'Grade 7' },
  { id: 'EMP011', name: 'Fitri Handayani',       position: 'Staff Engineering', organization: 'Engineering',                   branch: 'Bandung Office',  level: 'Staff',      grade: 'Grade 4' },
  { id: 'EMP012', name: 'Galih Pratama',         position: 'Manager Operations',organization: 'Operations',                    branch: 'Surabaya Office', level: 'Manager',    grade: 'Grade 6' },
  { id: 'EMP013', name: 'Hana Permata',          position: 'Supervisor Ops',    organization: 'Operations',                    branch: 'Surabaya Office', level: 'Supervisor', grade: 'Grade 5' },
  { id: 'EMP014', name: 'Indra Kusuma',          position: 'Staff IT',          organization: 'IT Division',                   branch: 'Pusat',           level: 'Staff',      grade: 'Grade 4' },
  { id: 'EMP015', name: 'Joko Susilo',           position: 'Director Sales',    organization: 'Sales',                         branch: 'Jakarta HQ',      level: 'Director',   grade: 'Grade 8' },
  { id: 'EMP016', name: 'Kartika Sari',          position: 'Staff Sales',       organization: 'Sales',                         branch: 'Medan Office',    level: 'Staff',      grade: 'Grade 3' },
  { id: 'EMP017', name: 'Lukman Hakim',          position: 'Manager Sales',     organization: 'Sales',                         branch: 'Medan Office',    level: 'Manager',    grade: 'Grade 6' },
  { id: 'EMP018', name: 'Maya Putri',            position: 'Staff HRD',         organization: 'HRD & GA',                      branch: 'Bali Office',     level: 'Staff',      grade: 'Grade 3' },
  { id: 'EMP019', name: 'Nugroho Adi',           position: 'Supervisor IT',     organization: 'IT Division',                   branch: 'Pusat',           level: 'Supervisor', grade: 'Grade 5' },
  { id: 'EMP020', name: 'Oka Mahendra',          position: 'Staff Operations',  organization: 'Operations',                    branch: 'Bali Office',     level: 'Staff',      grade: 'Grade 4' },
  { id: 'EMP021', name: 'Putri Rahmawati',       position: 'Lead Marketing',    organization: 'Marketing',                     branch: 'Jakarta HQ',      level: 'Lead',       grade: 'Grade 7' },
  { id: 'EMP022', name: 'Rizky Maulana',         position: 'Staff Finance',     organization: 'Finance',                       branch: 'Surabaya Office', level: 'Staff',      grade: 'Grade 3' },
  { id: 'EMP023', name: 'Siti Aminah',           position: 'Manager Engineering',organization: 'Engineering',                  branch: 'Bandung Office',  level: 'Manager',    grade: 'Grade 6' },
  { id: 'EMP024', name: 'Taufik Hidayat',        position: 'Director Operations',organization: 'Operations',                   branch: 'Pusat',           level: 'Director',   grade: 'Grade 8' },
]

// Confirmed members (rendered in table under the section)
const selectedEmployees = ref<Employee[]>([])
function removeEmployee(id: string) {
  const i = selectedEmployees.value.findIndex(e => e.id === id)
  if (i >= 0) selectedEmployees.value.splice(i, 1)
}

// ─── Add member drawer ────────────────────────────────────────────
const memberDrawerOpen    = ref(false)
const draftSelectedIds    = ref<string[]>([])
const memberSearch        = ref('')
const filterOrg           = ref<string[]>([])
const filterBranch        = ref<string[]>([])
const filterLevel         = ref<string[]>([])
const filterGrade         = ref<string[]>([])
const memberPage          = ref(1)
const memberRowsPerPage   = ref(10)
const memberSort       = ref<{ key: keyof Employee; dir: 'asc' | 'desc' }>({ key: 'name', dir: 'asc' })

const uniq = (arr: string[]) => [...new Set(arr)].sort()
const orgOptions    = computed(() => uniq(ALL_EMPLOYEES.map(e => e.organization)))
const branchOptions = computed(() => uniq(ALL_EMPLOYEES.map(e => e.branch)))
const levelOptions  = computed(() => uniq(ALL_EMPLOYEES.map(e => e.level)))
const gradeOptions  = computed(() => uniq(ALL_EMPLOYEES.map(e => e.grade)))

// Toggle a value in a multi-select filter array.
// If selecting the last remaining option makes all options active, auto-revert to "All" (empty).
function toggleMemberFilter(arr: string[], val: string, allOptions: string[]) {
  const idx = arr.indexOf(val)
  if (idx >= 0) {
    arr.splice(idx, 1)
  } else {
    arr.push(val)
    if (arr.length === allOptions.length) arr.splice(0) // all selected = same as All → reset
  }
}
// Label for a filter trigger
function filterLabel(arr: string[], allLabel: string) {
  if (!arr.length) return allLabel
  return `Selected (${arr.length})`
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

// Reset to page 1 whenever filters/search/rpp change
watch([filterOrg, filterBranch, filterLevel, filterGrade, memberSearch, memberRowsPerPage],
  () => { memberPage.value = 1 }, { deep: true })

// Header checkbox selects/deselects the current page rows
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

// ─── Submit ───────────────────────────────────────────────────────
const saving = ref(false)
function cancel() { router.push('/policies/claims') }
async function save() {
  saving.value = true
  await new Promise(r => setTimeout(r, 600))
  saving.value = false
  toast.notify({
    variant: 'success',
    title: isEditMode.value ? 'Custom category saved' : 'Custom category created',
    position: 'top-center',
  })
  router.push('/policies/claims')
}

// ─── Styles ───────────────────────────────────────────────────────
const page     = css({ width: '100%' })
const fieldMax  = 'max-width:480px;'

// Outline trigger (matches MpInput look) — used for Category / Profile / Frequency dropdowns
const selectTrigger = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  width: 'full', minHeight: '40px', gap: '2', minWidth: '0',
  border: '1px solid var(--mp-colors-border-form, rgba(29,31,36,.16))',
  borderRadius: '6px', paddingX: '3',
  fontFamily: 'body', fontSize: 'md', color: 'dark',
  background: 'transparent', cursor: 'pointer', outline: 'none',
  _focusVisible: { boxShadow: 'focus', borderColor: 'border.focused' },
  _disabled: { opacity: '0.5', cursor: 'not-allowed', background: 'gray.25' },
})
// Truncate the trigger label so it never spills into the next column
const selectLabel = css({
  flex: '1', minWidth: '0', textAlign: 'left',
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
})
// Currency chip inside the Max amount left addon
const currencyTrigger = css({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: '1', border: 'none', outline: 'none', background: 'transparent',
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default',
  cursor: 'pointer', paddingX: '2', paddingY: '0',
})

const stickyFooter = css({
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
  gap: 'var(--mp-spacing-3)', paddingTop: 'var(--mp-spacing-6)',
  paddingBottom: 'var(--mp-spacing-8)', width: '100%',
})

const memberTag = css({
  display: 'inline-flex', alignItems: 'center', gap: '1',
  paddingX: '2', paddingY: '1',
  background: 'blue.50', borderRadius: 'full',
  fontFamily: 'body', fontSize: 'sm', color: 'blue.600',
})
const memberTagRemove = css({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '16px', height: '16px', borderRadius: 'full',
  border: 'none', background: 'transparent', cursor: 'pointer',
  color: 'blue.400', padding: '0',
  _hover: { background: 'blue.100', color: 'blue.700' },
})

// ─── Add member drawer styles ─────────────────────────────────────
// Filter dropdown trigger (looks like MpSelect, fixed-ish width)
const filterTrigger = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  gap: '2', minWidth: '170px', minHeight: '40px',
  border: '1px solid var(--mp-colors-border-form, rgba(29,31,36,.16))',
  borderRadius: '6px', paddingX: '3',
  fontFamily: 'body', fontSize: 'md', color: 'dark',
  background: 'white', cursor: 'pointer', outline: 'none',
  _focusVisible: { boxShadow: 'focus', borderColor: 'border.focused' },
})
// Selected-count bar (subtle blue band above the table)
const selectedBar = css({
  background: 'blue.50', borderRadius: 'md',
  paddingX: '4', paddingY: '3',
})
// Sortable table header button
const sortHeader = css({
  display: 'inline-flex', alignItems: 'center', gap: '1',
  background: 'transparent', border: 'none', cursor: 'pointer', padding: '0',
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'dark',
})
const sortCaret = css({ color: 'gray.400', fontSize: 'sm' })

// Caret svg shared inline (kept as a tiny render fn via component is overkill) — use inline in template
</script>

<template>
  <Teleport to="#layout-header-actions"><span /></Teleport>

  <div :class="page">

    <!-- ══ 1. Basic information ══ -->
    <MpFlex direction="column" gap="5" marginBottom="16">
      <MpText size="h2" weight="semiBold" color="dark">Basic information</MpText>

      <!-- Custom category name -->
      <MpFormControl id="cc-name" isRequired :style="fieldMax">
        <MpFlex justify="space-between" align="flex-end">
          <MpFormLabel>Custom category name</MpFormLabel>
          <MpText size="body-small" color="gray.400">{{ name.length }} / 40</MpText>
        </MpFlex>
        <MpInput id="input-cc-name" v-model="name"
                 placeholder="Enter custom category name" :isFullWidth="true" maxlength="40" />
      </MpFormControl>

      <!-- Description -->
      <MpFormControl id="cc-desc" isRequired :style="fieldMax">
        <MpFlex justify="space-between" align="flex-end">
          <MpFormLabel>Description</MpFormLabel>
          <MpText size="body-small" color="gray.400">{{ description.length }} / 200</MpText>
        </MpFlex>
        <MpTextarea id="textarea-cc-desc" v-model="description"
                    placeholder="Enter description" :isFullWidth="true" maxlength="200" />
      </MpFormControl>
    </MpFlex>

    <!-- ══ 2. Custom category limitation ══ -->
    <MpFlex direction="column" gap="5" marginBottom="16">
      <MpFlex direction="column" gap="1">
        <MpText size="h2" weight="semiBold" color="dark">Custom category limitation</MpText>
        <MpText size="body" color="gray.600">Set a rule that will be applied to this custom category.</MpText>
      </MpFlex>

      <!-- Rule type radio -->
      <MpFlex direction="column" gap="2">
        <MpText size="body" weight="semiBold" color="dark">Rule type</MpText>
        <MpFlex gap="6">
          <MpRadio id="cc-rule-with-limit" name="ccRuleType" value="with-limit" v-model="ruleType">With limit</MpRadio>
          <MpRadio id="cc-rule-no-limit"   name="ccRuleType" value="no-limit"   v-model="ruleType">No limit</MpRadio>
        </MpFlex>
      </MpFlex>

      <!-- No limit — inline description -->
      <MpText v-if="ruleType === 'no-limit'" size="body" color="dark">
        All categories have no spending limit for any frequency for members assigned to this custom policy.
      </MpText>

      <!-- Rule table — Max amount BEFORE Frequency (scrolls horizontally on narrow viewports) -->
      <div v-if="ruleType === 'with-limit'" style="width:100%; overflow-x:auto;">
      <MpTable :is-hoverable="false" style="table-layout:fixed; width:100%; min-width:880px;">
        <MpTableHead>
          <MpTableRow>
            <MpTableCell as="th" scope="col" style="width:22%;">Category</MpTableCell>
            <MpTableCell as="th" scope="col" style="width:16%;">Profile</MpTableCell>
            <MpTableCell as="th" scope="col" style="width:24%;">Max amount</MpTableCell>
            <MpTableCell as="th" scope="col" style="width:14%;">Limitation</MpTableCell>
            <MpTableCell as="th" scope="col" style="width:16%;">Frequency</MpTableCell>
            <MpTableCell as="th" scope="col" style="width:48px;" />
          </MpTableRow>
        </MpTableHead>
        <MpTableBody is-narrowed>
          <MpTableRow v-for="(rule, ri) in rules" :key="ri">

            <!-- Category (standard categories) -->
            <MpTableCell as="td" scope="row">
              <MpPopover :id="`rule-cat-${ri}`" is-close-on-select use-portal is-adaptive-width placement="bottom-start">
                <MpPopoverTrigger>
                  <button :class="selectTrigger">
                    <span :class="selectLabel" :style="rule.category ? '' : 'color:var(--mp-colors-gray-400)'">
                      {{ rule.category ? categoryName(rule.category) : 'Select Category' }}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                </MpPopoverTrigger>
                <MpPopoverContent :class="css({ marginTop: '2px' })">
                  <MpPopoverList>
                    <MpPopoverListItem v-for="c in STD_CATEGORIES" :key="c.id"
                      :is-active="rule.category === c.id" @click="onSelectCategory(rule, c.id)">
                      {{ c.name }}
                    </MpPopoverListItem>
                  </MpPopoverList>
                </MpPopoverContent>
              </MpPopover>
            </MpTableCell>

            <!-- Profile -->
            <MpTableCell as="td" scope="row">
              <MpPopover :id="`rule-profile-${ri}`" is-close-on-select use-portal is-adaptive-width placement="bottom-start">
                <MpPopoverTrigger>
                  <button :class="selectTrigger" :disabled="!rule.category">
                    <span :class="selectLabel" :style="rule.profile ? '' : 'color:var(--mp-colors-gray-400)'">
                      {{ rule.profile ? profileLabel(rule.profile) : 'Select profile' }}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                </MpPopoverTrigger>
                <MpPopoverContent :class="css({ marginTop: '2px' })">
                  <MpPopoverList>
                    <MpPopoverListItem v-for="p in PROFILE_OPTIONS" :key="p.value"
                      :is-active="rule.profile === p.value" @click="rule.profile = p.value">
                      {{ p.label }}
                    </MpPopoverListItem>
                  </MpPopoverList>
                </MpPopoverContent>
              </MpPopover>
            </MpTableCell>

            <!-- Max amount (currency from the selected category) -->
            <MpTableCell as="td" scope="row">
              <!-- International category → currency picker addon -->
              <MpPopover v-if="rule.category && isInternational(rule.category)"
                :id="`rule-cur-${ri}`" is-close-on-select use-portal is-adaptive-width placement="bottom-start">
                <MpPopoverTrigger>
                  <MpInputGroup style="width:100%;">
                    <MpInputLeftAddon has-background>
                      <button :class="currencyTrigger">
                        {{ currencyDisplay(rule) }}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </button>
                    </MpInputLeftAddon>
                    <MpInput
                      :modelValue="rule.amount"
                      :placeholder="rule.noLimit ? 'Unlimited' : '0'"
                      :isDisabled="rule.noLimit"
                      :isFullWidth="true"
                      @click.stop
                      @input="(e: Event) => (rule.amount = formatThousands((e.target as HTMLInputElement).value))"
                    />
                  </MpInputGroup>
                </MpPopoverTrigger>
                <MpPopoverContent :class="css({ marginTop: '2px' })">
                  <MpPopoverList>
                    <MpPopoverListItem v-for="code in rowCurrencies(rule.category)" :key="code"
                      :is-active="rule.currency === code" @click="onSelectCurrency(rule, code)">
                      {{ getCurrencyLabel(code) }}
                    </MpPopoverListItem>
                  </MpPopoverList>
                </MpPopoverContent>
              </MpPopover>

              <!-- Domestic / no category → fixed Rp (disabled until a category is picked) -->
              <MpInputGroup v-else style="width:100%;">
                <MpInputLeftAddon has-background><MpText size="body" weight="semiBold">Rp</MpText></MpInputLeftAddon>
                <MpInput
                  :modelValue="rule.amount"
                  :placeholder="rule.noLimit ? 'Unlimited' : '0'"
                  :isDisabled="!rule.category || rule.noLimit"
                  :isFullWidth="true"
                  @input="(e: Event) => (rule.amount = formatThousands((e.target as HTMLInputElement).value))"
                />
              </MpInputGroup>
            </MpTableCell>

            <!-- Limitation — No limit (sits beside Max amount; controls it) -->
            <MpTableCell as="td" scope="row">
              <MpCheckbox :id="`rule-nolimit-${ri}`" :isChecked="rule.noLimit" :isDisabled="!rule.category"
                          @change="(v: boolean) => toggleNoLimit(ri, v)">No limit</MpCheckbox>
            </MpTableCell>

            <!-- Frequency (unique per Category+Profile+Currency) -->
            <MpTableCell as="td" scope="row">
              <MpPopover :id="`rule-freq-${ri}`" is-close-on-select use-portal is-adaptive-width placement="bottom-start">
                <MpPopoverTrigger>
                  <button :class="selectTrigger" :disabled="!rule.category">
                    <span :class="selectLabel" :style="rule.frequency ? '' : 'color:var(--mp-colors-gray-400)'">
                      {{ rule.frequency ? FREQ_LABELS[rule.frequency] : 'Select frequency' }}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                </MpPopoverTrigger>
                <MpPopoverContent :class="css({ marginTop: '2px' })">
                  <MpPopoverList>
                    <MpPopoverListItem v-for="f in availableFrequencies(ri)" :key="f"
                      :is-active="rule.frequency === f" @click="rule.frequency = f">
                      {{ FREQ_LABELS[f] }}
                    </MpPopoverListItem>
                    <MpPopoverListItem v-if="availableFrequencies(ri).length === 0" :is-disabled="true">
                      All frequencies used
                    </MpPopoverListItem>
                  </MpPopoverList>
                </MpPopoverContent>
              </MpPopover>
            </MpTableCell>

            <!-- Remove (minus-circular, replaces the red "Remove" link) -->
            <MpTableCell as="td" scope="row">
              <MpButton v-if="rules.length > 1" variant="ghost" size="sm"
                        left-icon="minus-circular" aria-label="Remove rule" @click="removeRule(ri)" />
            </MpTableCell>

          </MpTableRow>
        </MpTableBody>
      </MpTable>
      </div>

      <MpButton v-if="ruleType === 'with-limit'" variant="secondary" size="md" left-icon="add" @click="addRule">Add rule</MpButton>

    </MpFlex>

    <!-- ══ 3. Additional rules (limit per transaction) ══ -->
    <MpFlex direction="column" gap="3" marginBottom="16">
      <MpFlex direction="column" gap="1">
        <MpText size="h2" weight="semiBold" color="dark">Additional rules</MpText>
        <MpText size="body" color="gray.600">Additional rule that will limit amount per transaction.</MpText>
      </MpFlex>

      <MpCheckbox id="cc-limit-tx" :isChecked="hasLimitPerTx" :isDisabled="!anyCategorySelected"
                  @change="onLimitPerTxChange">
        This custom category has limit per transaction
      </MpCheckbox>

      <div v-if="hasLimitPerTx" style="display:flex; flex-direction:column; gap:8px; align-self:flex-start; align-items:stretch; max-width:480px;">
        <MpFlex v-for="(row, i) in perTxLimits" :key="i" align="center" gap="2">
          <div style="flex:1; min-width:0;">
            <MpPopover :id="`pertx-cur-${i}`" is-close-on-select use-portal is-adaptive-width placement="bottom-start">
              <MpPopoverTrigger>
                <MpInputGroup style="width:100%;">
                  <MpInputLeftAddon has-background>
                    <button :class="currencyTrigger">
                      {{ row.currency }}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
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
                  <MpPopoverListItem v-for="code in availablePerTxCurrencies(i)" :key="code"
                    :is-active="row.currency === code" @click="row.currency = code">
                    {{ getCurrencyLabel(code) }}
                  </MpPopoverListItem>
                </MpPopoverList>
              </MpPopoverContent>
            </MpPopover>
          </div>
          <MpButton v-if="perTxLimits.length > 1" variant="ghost" size="sm"
                    left-icon="minus-circular" aria-label="Remove" @click="perTxLimits.splice(i, 1)" />
        </MpFlex>

        <MpPopover v-if="unusedPerTxCurrencies.length > 0" id="pertx-add-more" is-close-on-select use-portal placement="bottom-start">
          <MpPopoverTrigger>
            <MpButton variant="secondary" size="md" right-icon="chevrons-down" style="width:100%;">
              Add more limit per transaction
            </MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent :class="css({ marginTop: '2px' })">
            <MpPopoverList>
              <MpPopoverListItem v-for="code in unusedPerTxCurrencies" :key="code"
                @click="perTxLimits.push({ currency: code, amount: '' })">
                {{ getCurrencyLabel(code) }}
              </MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </MpPopover>
      </div>
    </MpFlex>

    <!-- ══ 4. Member for this custom category ══ -->
    <MpFlex direction="column" gap="3" marginBottom="8">
      <MpFlex direction="column" gap="1">
        <MpText size="h2" weight="semiBold" color="dark">Member for this custom category</MpText>
        <MpText size="body" color="gray.600">
          You can choose which employees to add as a member that will get this custom category.
        </MpText>
      </MpFlex>

      <!-- Selected members table -->
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

      <!-- Add employee button -->
      <MpButton variant="secondary" size="md" left-icon="add" style="align-self:flex-start;"
                @click="openMemberDrawer">Add employee</MpButton>
    </MpFlex>

  </div>

  <!-- Footer -->
  <div :class="stickyFooter">
    <MpButton variant="ghost" size="md" @click="cancel">Cancel</MpButton>
    <MpButton variant="primary" size="md" :isLoading="saving" @click="save">Save</MpButton>
  </div>

  <!-- ═══ Add member drawer ═══ -->
  <MpDrawer id="add-member-drawer" :is-open="memberDrawerOpen" size="xl" placement="right"
            is-block-scroll-on-mount @close="memberDrawerOpen = false">
    <MpDrawerContent>
      <MpDrawerHeader>
        Add member
        <MpDrawerCloseButton />
      </MpDrawerHeader>

      <MpDrawerBody>
        <MpFlex direction="column" gap="4">

          <!-- Filter toolbar -->
          <MpFlex align="center" gap="2" wrap="wrap">
            <!-- Organization — multi-select -->
            <MpPopover id="mem-filter-org" use-portal placement="bottom-start">
              <MpPopoverTrigger>
                <button :class="filterTrigger">
                  <span :class="selectLabel">{{ filterLabel(filterOrg, 'All organization') }}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </MpPopoverTrigger>
              <MpPopoverContent :class="css({ marginTop: '2px', maxHeight: '300px', overflowY: 'auto' })">
                <MpPopoverList>
                  <MpPopoverListItem @click="filterOrg.splice(0)">
                    <span style="display:inline-flex;align-items:center;gap:8px;">
                      <span :style="`width:16px;height:16px;border-radius:4px;flex-shrink:0;pointer-events:none;display:flex;align-items:center;justify-content:center;border:1.5px solid ${!filterOrg.length ? 'var(--mp-colors-indigo-700,#4338CA)' : 'var(--mp-colors-gray-300,#D1D5DB)'};background:${!filterOrg.length ? 'var(--mp-colors-indigo-700,#4338CA)' : 'transparent'};`">
                        <svg v-if="!filterOrg.length" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </span>
                      All organization
                    </span>
                  </MpPopoverListItem>
                  <MpPopoverListItem v-for="o in orgOptions" :key="o" @click="toggleMemberFilter(filterOrg, o, orgOptions)">
                    <span style="display:inline-flex;align-items:center;gap:8px;">
                      <span :style="`width:16px;height:16px;border-radius:4px;flex-shrink:0;pointer-events:none;display:flex;align-items:center;justify-content:center;border:1.5px solid ${filterOrg.includes(o) ? 'var(--mp-colors-indigo-700,#4338CA)' : 'var(--mp-colors-gray-300,#D1D5DB)'};background:${filterOrg.includes(o) ? 'var(--mp-colors-indigo-700,#4338CA)' : 'transparent'};`">
                        <svg v-if="filterOrg.includes(o)" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </span>
                      {{ o }}
                    </span>
                  </MpPopoverListItem>
                </MpPopoverList>
              </MpPopoverContent>
            </MpPopover>

            <!-- Branch — multi-select -->
            <MpPopover id="mem-filter-branch" use-portal placement="bottom-start">
              <MpPopoverTrigger>
                <button :class="filterTrigger">
                  <span :class="selectLabel">{{ filterLabel(filterBranch, 'All branch') }}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </MpPopoverTrigger>
              <MpPopoverContent :class="css({ marginTop: '2px', maxHeight: '300px', overflowY: 'auto' })">
                <MpPopoverList>
                  <MpPopoverListItem @click="filterBranch.splice(0)">
                    <span style="display:inline-flex;align-items:center;gap:8px;">
                      <span :style="`width:16px;height:16px;border-radius:4px;flex-shrink:0;pointer-events:none;display:flex;align-items:center;justify-content:center;border:1.5px solid ${!filterBranch.length ? 'var(--mp-colors-indigo-700,#4338CA)' : 'var(--mp-colors-gray-300,#D1D5DB)'};background:${!filterBranch.length ? 'var(--mp-colors-indigo-700,#4338CA)' : 'transparent'};`">
                        <svg v-if="!filterBranch.length" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </span>
                      All branch
                    </span>
                  </MpPopoverListItem>
                  <MpPopoverListItem v-for="b in branchOptions" :key="b" @click="toggleMemberFilter(filterBranch, b, branchOptions)">
                    <span style="display:inline-flex;align-items:center;gap:8px;">
                      <span :style="`width:16px;height:16px;border-radius:4px;flex-shrink:0;pointer-events:none;display:flex;align-items:center;justify-content:center;border:1.5px solid ${filterBranch.includes(b) ? 'var(--mp-colors-indigo-700,#4338CA)' : 'var(--mp-colors-gray-300,#D1D5DB)'};background:${filterBranch.includes(b) ? 'var(--mp-colors-indigo-700,#4338CA)' : 'transparent'};`">
                        <svg v-if="filterBranch.includes(b)" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </span>
                      {{ b }}
                    </span>
                  </MpPopoverListItem>
                </MpPopoverList>
              </MpPopoverContent>
            </MpPopover>

            <!-- Level — multi-select -->
            <MpPopover id="mem-filter-level" use-portal placement="bottom-start">
              <MpPopoverTrigger>
                <button :class="filterTrigger">
                  <span :class="selectLabel">{{ filterLabel(filterLevel, 'All level') }}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </MpPopoverTrigger>
              <MpPopoverContent :class="css({ marginTop: '2px', maxHeight: '300px', overflowY: 'auto' })">
                <MpPopoverList>
                  <MpPopoverListItem @click="filterLevel.splice(0)">
                    <span style="display:inline-flex;align-items:center;gap:8px;">
                      <span :style="`width:16px;height:16px;border-radius:4px;flex-shrink:0;pointer-events:none;display:flex;align-items:center;justify-content:center;border:1.5px solid ${!filterLevel.length ? 'var(--mp-colors-indigo-700,#4338CA)' : 'var(--mp-colors-gray-300,#D1D5DB)'};background:${!filterLevel.length ? 'var(--mp-colors-indigo-700,#4338CA)' : 'transparent'};`">
                        <svg v-if="!filterLevel.length" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </span>
                      All level
                    </span>
                  </MpPopoverListItem>
                  <MpPopoverListItem v-for="l in levelOptions" :key="l" @click="toggleMemberFilter(filterLevel, l, levelOptions)">
                    <span style="display:inline-flex;align-items:center;gap:8px;">
                      <span :style="`width:16px;height:16px;border-radius:4px;flex-shrink:0;pointer-events:none;display:flex;align-items:center;justify-content:center;border:1.5px solid ${filterLevel.includes(l) ? 'var(--mp-colors-indigo-700,#4338CA)' : 'var(--mp-colors-gray-300,#D1D5DB)'};background:${filterLevel.includes(l) ? 'var(--mp-colors-indigo-700,#4338CA)' : 'transparent'};`">
                        <svg v-if="filterLevel.includes(l)" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </span>
                      {{ l }}
                    </span>
                  </MpPopoverListItem>
                </MpPopoverList>
              </MpPopoverContent>
            </MpPopover>

            <!-- Grade — multi-select -->
            <MpPopover id="mem-filter-grade" use-portal placement="bottom-start">
              <MpPopoverTrigger>
                <button :class="filterTrigger">
                  <span :class="selectLabel">{{ filterLabel(filterGrade, 'All grade') }}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </MpPopoverTrigger>
              <MpPopoverContent :class="css({ marginTop: '2px', maxHeight: '300px', overflowY: 'auto' })">
                <MpPopoverList>
                  <MpPopoverListItem @click="filterGrade.splice(0)">
                    <span style="display:inline-flex;align-items:center;gap:8px;">
                      <span :style="`width:16px;height:16px;border-radius:4px;flex-shrink:0;pointer-events:none;display:flex;align-items:center;justify-content:center;border:1.5px solid ${!filterGrade.length ? 'var(--mp-colors-indigo-700,#4338CA)' : 'var(--mp-colors-gray-300,#D1D5DB)'};background:${!filterGrade.length ? 'var(--mp-colors-indigo-700,#4338CA)' : 'transparent'};`">
                        <svg v-if="!filterGrade.length" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </span>
                      All grade
                    </span>
                  </MpPopoverListItem>
                  <MpPopoverListItem v-for="g in gradeOptions" :key="g" @click="toggleMemberFilter(filterGrade, g, gradeOptions)">
                    <span style="display:inline-flex;align-items:center;gap:8px;">
                      <span :style="`width:16px;height:16px;border-radius:4px;flex-shrink:0;pointer-events:none;display:flex;align-items:center;justify-content:center;border:1.5px solid ${filterGrade.includes(g) ? 'var(--mp-colors-indigo-700,#4338CA)' : 'var(--mp-colors-gray-300,#D1D5DB)'};background:${filterGrade.includes(g) ? 'var(--mp-colors-indigo-700,#4338CA)' : 'transparent'};`">
                        <svg v-if="filterGrade.includes(g)" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </span>
                      {{ g }}
                    </span>
                  </MpPopoverListItem>
                </MpPopoverList>
              </MpPopoverContent>
            </MpPopover>

            <!-- Search (right) -->
            <MpInputGroup style="width:240px; margin-left:auto;">
              <MpInputLeftAddon>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#9ca3af">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </MpInputLeftAddon>
              <MpInput v-model="memberSearch" placeholder="Search name" :isFullWidth="true" />
            </MpInputGroup>
          </MpFlex>

          <!-- Selected count bar -->
          <MpFlex align="center" justify="space-between" :class="selectedBar">
            <MpText size="body" color="dark">{{ draftSelectedIds.length }} employees selected</MpText>
            <MpTextlink variant="primary" style="cursor:pointer;" @click="resetDraft">Reset</MpTextlink>
          </MpFlex>

          <!-- Employee table -->
          <MpTable :is-hoverable="true" style="width:100%;">
            <MpTableHead>
              <MpTableRow>
                <MpTableCell as="th" scope="col" style="width:48px;">
                  <MpCheckbox id="mem-check-all" :isChecked="pageAllSelected" @change="togglePageAll" />
                </MpTableCell>
                <MpTableCell as="th" scope="col"><button :class="sortHeader" @click="sortBy('name')">Name <span :class="sortCaret">⇅</span></button></MpTableCell>
                <MpTableCell as="th" scope="col"><button :class="sortHeader" @click="sortBy('position')">Position <span :class="sortCaret">⇅</span></button></MpTableCell>
                <MpTableCell as="th" scope="col"><button :class="sortHeader" @click="sortBy('organization')">Organization <span :class="sortCaret">⇅</span></button></MpTableCell>
                <MpTableCell as="th" scope="col"><button :class="sortHeader" @click="sortBy('branch')">Branch <span :class="sortCaret">⇅</span></button></MpTableCell>
              </MpTableRow>
            </MpTableHead>
            <MpTableBody is-narrowed>
              <MpTableRow v-for="e in pagedEmployees" :key="e.id">
                <MpTableCell as="td" scope="row">
                  <MpCheckbox :id="`mem-${e.id}`" :isChecked="isDraftSelected(e.id)" @change="() => toggleDraft(e.id)" />
                </MpTableCell>
                <MpTableCell as="td" scope="row"><MpText size="body" color="dark">{{ e.name }}</MpText></MpTableCell>
                <MpTableCell as="td" scope="row"><MpText size="body" color="dark">{{ e.position }}</MpText></MpTableCell>
                <MpTableCell as="td" scope="row"><MpText size="body" color="dark">{{ e.organization }}</MpText></MpTableCell>
                <MpTableCell as="td" scope="row"><MpText size="body" color="dark">{{ e.branch }}</MpText></MpTableCell>
              </MpTableRow>
              <MpTableRow v-if="filteredEmployees.length === 0">
                <MpTableCell as="td" scope="row" :colspan="5" style="text-align:center; color:var(--mp-colors-gray-600);">
                  No employee matches your filter
                </MpTableCell>
              </MpTableRow>
            </MpTableBody>
          </MpTable>

          <!-- Pagination -->
          <AppPagination
            :total="filteredEmployees.length"
            :page="memberPage"
            :rows-per-page="memberRowsPerPage"
            @update:page="memberPage = $event"
            @update:rows-per-page="memberRowsPerPage = $event"
          />

        </MpFlex>
      </MpDrawerBody>

      <MpDrawerFooter>
        <MpButtonGroup>
          <MpButton variant="ghost" @click="memberDrawerOpen = false">Cancel</MpButton>
          <MpButton variant="primary" @click="confirmMembers">Add</MpButton>
        </MpButtonGroup>
      </MpDrawerFooter>
    </MpDrawerContent>
    <MpDrawerOverlay />
  </MpDrawer>
</template>
