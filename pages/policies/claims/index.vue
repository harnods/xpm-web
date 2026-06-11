<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Policies › Claims  (index, 2 tabs)
  Source     : Figma z9nzcdQ9jpiGqafP4vvHed · 2954-30576  +  Custom-categories screenshot
  Token mode : Pixel 2.4 via @mekari/pixel3 ^1.0.12
  Patterns   : layout-shell, tabs, index-view, filter (multi-select popover), confirmation
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  TABS:
    - Categories        → 3 filters (status · type · usage) + search; cols: name · description · type · usage · status
    - Custom categories → status filter + search only;            cols: name · description · last modified · status
                          (a custom category bundles standard categories with limits for specific people)

  STATES INCLUDED:
    - Happy path (sample rows for both tabs)
    - Empty — first-time (folder illustration, Figma 4396-122179) when no data exists
    - Empty — not-found (magnifying-glass illustration, Figma 76:9397) when search/filter returns nothing
      → both handled by <ClaimsBlankSlate>; copy adapts per tab (category vs custom category)
    - Confirmation modals: activate / deactivate / delete — copy adapts to scope
    - Null description: em dash (—)

  COPY DEFAULTS (iterate freely):
    - Header "Create category" button → popover: Standard category (/policies/claims/create)
      · Custom category (/policies/claims/custom/create — page TBD). Same on both tabs.
    - Custom search placeholder: "Search custom category name"
    - Not-found helper: "Your filter criteria didn't match any available category. Try adjusting your filter."

  ASSETS:
    - /images/empty-no-data.png   — Figma "No data" illustration (first-time)
    - /images/empty-not-found.png — Figma "Not found" illustration (search/filter no result)

  GAPS (next iteration):
    - Loading skeleton
    - Real pagination (custom tab shows static 30 rows / 3 pages mock)
-->

<script setup lang="ts">
import {
  MpFlex, MpText,
  MpButton, MpBadge, MpTextlink,
  MpInputGroup, MpInputLeftAddon, MpInput,
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
  MpModal, MpModalOverlay, MpModalContent,
  MpModalHeader, MpModalCloseButton, MpModalBody, MpModalFooter,
  css, toast,
} from '@mekari/pixel3'

definePageMeta({ title: 'Claims' })

const route = useRoute()

// ─── Types & data ────────────────────────────────────────────────

type Status = 'Active' | 'Inactive'

interface Row {
  id: number
  name: string
  description: string
  categoryType: 'Domestic' | 'International'
  categoryUsage: string[]
  status: Status
}

const rows = ref<Row[]>([
  { id: 1, name: 'Office Tools',        description: 'All office tools',                                                categoryType: 'Domestic',      categoryUsage: ['Reimbursement','Cash advance','Virtual card','Physical card'], status: 'Active'   },
  { id: 2, name: 'Entertainment Claim', description: 'For reimbursement of costs from business-related entertainment.', categoryType: 'International', categoryUsage: ['Reimbursement','Cash advance'],                                 status: 'Active'   },
  { id: 3, name: 'Office Supplies',     description: 'All office supplies',                                             categoryType: 'Domestic',      categoryUsage: ['Reimbursement','Cash advance','Virtual card','Physical card'], status: 'Active'   },
  { id: 4, name: 'Entertainment Claim', description: 'For reimbursement of costs from business-related entertainment.', categoryType: 'International', categoryUsage: ['Reimbursement','Cash advance'],                                 status: 'Inactive' },
])

const activeTab    = ref<'categories' | 'custom'>(route.query.tab === 'custom' ? 'custom' : 'categories')
const statusFilter = ref<string[]>([])   // [] = All
const typeFilter   = ref<string[]>([])   // [] = All
const usageFilter  = ref<string[]>([])   // [] = All
const searchQuery  = ref('')

// ─── Devtools (showcase only — stripped from production) ──────────
const isDev           = import.meta.dev
const devOpen         = ref(false)
const devEmpty        = ref(false)                              // force list empty to reveal blank slate
const devEmptyVariant = ref<'first-time' | 'not-found'>('first-time')

// Labels — "All X" when nothing selected, "Selected (N)" otherwise
const statusFilterLabel = computed(() =>
  statusFilter.value.length === 0 ? 'All status' : `Selected (${statusFilter.value.length})`
)
const typeFilterLabel = computed(() =>
  typeFilter.value.length === 0 ? 'All types' : `Selected (${typeFilter.value.length})`
)
const usageFilterLabel = computed(() =>
  usageFilter.value.length === 0 ? 'All usages' : `Selected (${usageFilter.value.length})`
)

// Generic toggle: add/remove value; "All" option always resets to []
// NOTE: Vue 3 templates auto-unwrap refs, so arr arrives as the plain reactive array — no .value needed
function toggleFilter(arr: string[], val: string) {
  const idx = arr.indexOf(val)
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(val)
}

const filteredRows = computed(() => {
  if (devEmpty.value) return []   // devtools showcase
  return rows.value.filter(row => {
    const matchStatus = statusFilter.value.length === 0 ||
      statusFilter.value.includes(row.status.toLowerCase())
    const matchType   = typeFilter.value.length === 0 ||
      typeFilter.value.includes(row.categoryType)
    const matchUsage  = usageFilter.value.length === 0 ||
      usageFilter.value.some(u => row.categoryUsage.includes(u))
    const matchSearch = !searchQuery.value || row.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchStatus && matchType && matchUsage && matchSearch
  })
})

// ─── Custom categories tab ───────────────────────────────────────
// A custom category bundles standard categories with limits tailored to specific people.
// Toolbar here is simpler: status filter + search only (no type/usage).

interface CustomRow {
  id: number
  name: string
  description: string
  lastModified: string      // e.g. '08 Jun 2026'
  lastModifiedTime: string  // e.g. '16:02 (GMT+7)'
  status: Status
}

const customRows = ref<CustomRow[]>([
  { id: 1,  name: 'Executive Travel Allowance', description: 'Higher flight and hotel limits for directors and above',  lastModified: '08 Jun 2026', lastModifiedTime: '16:02 (GMT+7)', status: 'Active' },
  { id: 2,  name: 'Sales Client Entertainment', description: 'Client meeting and entertainment budget for the sales team', lastModified: '27 Jan 2026', lastModifiedTime: '16:04 (GMT+7)', status: 'Active' },
  { id: 3,  name: 'Engineering Equipment',      description: 'Laptop, monitor, and software limits for engineers',      lastModified: '27 Jan 2026', lastModifiedTime: '16:04 (GMT+7)', status: 'Active' },
  { id: 4,  name: 'Senior Staff Medical',       description: 'Extended medical reimbursement for grade 5 and above',    lastModified: '27 Jan 2026', lastModifiedTime: '16:03 (GMT+7)', status: 'Active' },
  { id: 5,  name: 'Field Operations Transport', description: 'Daily transport and fuel allowance for field staff',      lastModified: '29 Dec 2025', lastModifiedTime: '14:44 (GMT+7)', status: 'Active' },
  { id: 6,  name: 'Remote Work Allowance',      description: 'Home office and internet stipend for remote employees',   lastModified: '23 Oct 2025', lastModifiedTime: '11:14 (GMT+7)', status: 'Active' },
  { id: 7,  name: 'Manager Meal Per-diem',      description: 'Business-trip meal limits for managers',                  lastModified: '14 Oct 2025', lastModifiedTime: '17:07 (GMT+7)', status: 'Active' },
  { id: 8,  name: 'Marketing Campaign Budget',  description: 'Event and campaign spending for the marketing team',      lastModified: '23 Sep 2025', lastModifiedTime: '16:03 (GMT+7)', status: 'Active' },
  { id: 9,  name: 'Internship Expenses',        description: '—',                                                       lastModified: '28 Aug 2025', lastModifiedTime: '10:54 (GMT+7)', status: 'Active' },
  { id: 10, name: 'New Hire Onboarding Kit',    description: 'Equipment and welcome-kit budget for new employees',      lastModified: '24 Mar 2025', lastModifiedTime: '13:30 (GMT+7)', status: 'Active' },
])

const customStatusFilter = ref<string[]>([])   // [] = All
const customSearchQuery  = ref('')

const customStatusFilterLabel = computed(() =>
  customStatusFilter.value.length === 0 ? 'All status' : `Selected (${customStatusFilter.value.length})`
)

const filteredCustomRows = computed(() => {
  if (devEmpty.value) return []   // devtools showcase
  return customRows.value.filter(row => {
    const matchStatus = customStatusFilter.value.length === 0 ||
      customStatusFilter.value.includes(row.status.toLowerCase())
    const matchSearch = !customSearchQuery.value ||
      row.name.toLowerCase().includes(customSearchQuery.value.toLowerCase())
    return matchStatus && matchSearch
  })
})

// Switch tab — also close any open action menu so it doesn't leak across tabs
function setTab(t: 'categories' | 'custom') {
  activeTab.value = t
  activeActionId.value = null
}

// Restore active tab from ?tab= query param (e.g. when returning from a detail page)
watch(() => route.query.tab, (tab) => {
  if (tab === 'custom') activeTab.value = 'custom'
  else if (tab === 'categories') activeTab.value = 'categories'
}, { immediate: true })

// ─── Blank slate (empty states) ──────────────────────────────────
// Copy adapts per tab + per reason (no data yet vs. filter/search returned nothing).
const EMPTY_COPY = {
  categories: {
    noData:   { title: 'No category found',        desc: "You haven't created any claim category yet" },
    noResult: { title: 'No category found',        desc: "Your filter criteria didn't match any available category. Try adjusting your filter." },
  },
  custom: {
    noData:   { title: 'No custom category found', desc: "You haven't created any custom category yet" },
    noResult: { title: 'No custom category found', desc: "Your filter criteria didn't match any available custom category. Try adjusting your filter." },
  },
}

// Is a filter/search currently narrowing the list? Drives no-data vs no-result copy.
const categoriesHasFilter = computed(() =>
  statusFilter.value.length > 0 || typeFilter.value.length > 0 ||
  usageFilter.value.length > 0 || !!searchQuery.value.trim()
)
const customHasFilter = computed(() =>
  customStatusFilter.value.length > 0 || !!customSearchQuery.value.trim()
)

// Which blank-slate variant to show. Devtools override wins; otherwise:
//   filter/search active + no match → 'not-found' (magnifying glass)
//   no data at all                  → 'first-time' (folder)
const categoriesEmptyVariant = computed<'first-time' | 'not-found'>(() =>
  devEmpty.value ? devEmptyVariant.value : (categoriesHasFilter.value ? 'not-found' : 'first-time')
)
const customEmptyVariant = computed<'first-time' | 'not-found'>(() =>
  devEmpty.value ? devEmptyVariant.value : (customHasFilter.value ? 'not-found' : 'first-time')
)

// ─── Modal ───────────────────────────────────────────────────────

type ModalType = 'activate' | 'deactivate' | 'delete'
type Scope     = 'category' | 'custom'
// Minimal shape both Row and CustomRow satisfy — lets one modal serve both tabs
interface ActionableRow { id: number; name: string; status: Status }

const pendingAction = ref<{ type: ModalType; row: ActionableRow; scope: Scope } | null>(null)
const isModalOpen   = computed(() => pendingAction.value !== null)

const modalConfig = computed(() => {
  const pa = pendingAction.value
  if (!pa) return null
  const t   = pa.type
  const obj = pa.scope === 'custom' ? 'custom category' : 'category'
  if (t === 'activate') return {
    title:   `Activate ${obj}?`,
    intro:   null,
    bullets: null,
    single:  `Once activated, the selected employees will be able to access this ${obj}.`,
    confirm: 'Activate',
  }
  if (t === 'deactivate') return {
    title:   `Deactivate ${obj}?`,
    intro:   'Make sure you read the following information before deactivating:',
    bullets: [
      `Members assigned to this ${obj} will no longer have access to the deactivated ${obj}.`,
      'Ongoing transaction requests will still be processed.',
      `The deactivated ${obj} can be reactivated.`,
    ],
    single:  null,
    confirm: 'Deactivate',
  }
  if (t === 'delete') return {
    title:   `Delete ${obj}?`,
    intro:   'Make sure you read the following information before deleting:',
    bullets: [
      `Members assigned to this ${obj} will no longer have access to the deleted ${obj}.`,
      // This impact only applies to standard categories (they can be bundled into custom categories)
      ...(pa.scope === 'category'
        ? ['This category will also be removed from any custom category that includes it.']
        : []),
      'Ongoing transaction requests will still be processed.',
      `The deleted ${obj} can't be restored.`,
    ],
    single:  null,
    confirm: 'Delete',
  }
  return null
})

function closeModal() { pendingAction.value = null }

function confirmModal() {
  const pa = pendingAction.value
  if (!pa) return
  closeModal()
  const noun = pa.scope === 'custom' ? 'Custom category' : 'Category'

  if (pa.scope === 'custom') {
    const target = customRows.value.find(r => r.id === pa.row.id)
    if (pa.type === 'activate')        { if (target) target.status = 'Active' }
    else if (pa.type === 'deactivate') { if (target) target.status = 'Inactive' }
    else if (pa.type === 'delete')     { customRows.value = customRows.value.filter(r => r.id !== pa.row.id) }
  } else {
    const target = rows.value.find(r => r.id === pa.row.id)
    if (pa.type === 'activate')        { if (target) target.status = 'Active' }
    else if (pa.type === 'deactivate') { if (target) target.status = 'Inactive' }
    else if (pa.type === 'delete')     { rows.value = rows.value.filter(r => r.id !== pa.row.id) }
  }

  const verb = pa.type === 'activate' ? 'activated' : pa.type === 'deactivate' ? 'deactivated' : 'deleted'
  toast.notify({ variant: 'success', title: `${noun} ${verb}`, position: 'top-center' })
}

// ─── Action menu ─────────────────────────────────────────────────

const activeActionId = ref<number | null>(null)
const dropdownPos    = ref({ top: '0px', right: '0px' })

const ACTION_OPTIONS = [
  { value: 'view',       label: 'View detail'  },
  { value: 'duplicate',  label: 'Duplicate'    },
  { value: 'edit',       label: 'Edit'         },
  { value: 'deactivate', label: 'Deactivate'   },
  { value: 'delete',     label: 'Delete', danger: true },
]

function toggleActionMenu(id: number, event: MouseEvent) {
  if (activeActionId.value === id) { activeActionId.value = null; return }
  activeActionId.value = id
  const btn  = event.currentTarget as HTMLElement
  const rect = btn.getBoundingClientRect()
  dropdownPos.value = {
    top:   `${rect.bottom + 4}px`,
    right: `${Math.max(8, window.innerWidth - rect.right)}px`,
  }
}

function handleAction(value: string, row: ActionableRow, scope: Scope = 'category') {
  activeActionId.value = null
  const base = scope === 'custom' ? '/policies/claims/custom' : '/policies/claims'
  if (value === 'view') {
    navigateTo(`${base}/${row.id}`)
  } else if (value === 'duplicate') {
    if (scope === 'custom') {
      const src = customRows.value.find(r => r.id === row.id)
      if (src) customRows.value.unshift({ ...src, id: Date.now(), name: `${src.name} (copy)` })
    } else {
      const src = rows.value.find(r => r.id === row.id)
      if (src) rows.value.push({ ...src, id: Date.now(), name: `${src.name} (copy)` })
    }
    const noun = scope === 'custom' ? 'Custom category' : 'Category'
    toast.notify({ variant: 'success', title: `${noun} duplicated`, position: 'top-center' })
  } else if (value === 'edit') {
    navigateTo(`${base}/create?mode=edit&id=${row.id}`)
  } else if (value === 'deactivate') {
    const type: ModalType = row.status === 'Inactive' ? 'activate' : 'deactivate'
    pendingAction.value = { type, row, scope }
  } else if (value === 'delete') {
    pendingAction.value = { type: 'delete', row, scope }
  }
}

function onDocumentMousedown(e: MouseEvent) {
  if ((e.target as HTMLElement).closest('[data-action-dropdown]')) return
  activeActionId.value = null
}

const tblWrapRef = ref<HTMLElement | null>(null)

onMounted(() => {
  document.addEventListener('mousedown', onDocumentMousedown)
  nextTick(() => { if (tblWrapRef.value) tblWrapRef.value.scrollLeft = 0 })
})
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocumentMousedown))

// Tab buttons — teleported above the white stage
const tabActive = css({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  paddingBlock: '13px',
  background: 'transparent', border: 'none', cursor: 'pointer',
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg',
  color: 'text.link',
  borderBottom: '2px solid', borderBottomColor: 'blue.400',
})

const tabInactive = css({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  paddingBlock: '13px',
  background: 'transparent', border: 'none', cursor: 'pointer',
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg',
  color: 'gray.600',
  borderBottom: '2px solid transparent',
  _hover: { color: 'text.link' },
})

// Table — native <table> for precise fixed-layout control
const tblWrap = css({
  w: 'full', overflowX: 'auto',         // scroll on narrow viewports
})

const tbl = css({
  w: 'full', tableLayout: 'auto',
  borderCollapse: 'collapse',
})

const th = css({
  bg: 'gray.25',
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold',
  lineHeight: 'lg', color: 'dark',
  paddingLeft: '2', paddingRight: '4', paddingBlock: '13px',
  h: '52px',
  borderBottom: '1px solid', borderBottomColor: 'gray.100',
  textAlign: 'left', whiteSpace: 'nowrap', verticalAlign: 'middle',
})

const td = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'dark',
  paddingLeft: '2', paddingRight: '4', paddingBlock: '13px',
  borderBottom: '1px solid', borderBottomColor: 'gray.100',
  verticalAlign: 'middle',
})

// Pagination text
const metaText = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg',
  color: 'gray.600', whiteSpace: 'nowrap',
})

// Visual-only checkbox — pointer-events:none so clicks pass through to MpPopoverListItem
// Colors: indigo.700 (#4B61DC) = text.link / brand action blue; neutral.300 (#DCDFE4) = border
// NOTE: gray.300 does NOT exist in token 2.4 — must use neutral.300
const checkBox    = css({ pointerEvents: 'none', flexShrink: '0', w: '16px', h: '16px', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 120ms', background: 'white' })
const checkBoxOn  = 'background:var(--mp-colors-indigo-700);'
const checkBoxOff = 'box-shadow:inset 0 0 0 1.5px var(--mp-colors-neutral-300);'
const checkMark   = css({ w: '10px', h: '8px' })

// Filter trigger — looks like MpSelect (input border, chevron, white bg)
const filterTrigger = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  gap: '2', minWidth: '140px', minHeight: '40px',
  border: '1px solid var(--mp-colors-border-form, rgba(29,31,36,.16))',
  borderRadius: '6px', paddingX: '3',
  fontFamily: 'body', fontSize: 'md', color: 'dark',
  background: 'white', cursor: 'pointer', outline: 'none',
  _focusVisible: { boxShadow: 'focus', borderColor: 'border.focused' },
})

// Apply button — sticky bottom per official Pixel "Button On Bottom" pattern
// IMPORTANT: MpPopoverContent must have overflowY:'auto' to contain the sticky properly
const applyBtn = css({
  cursor: 'pointer',
  position: 'sticky',
  bottom: '0',
  width: 'full',
  py: '2',
  borderTopWidth: '1px',
  borderColor: 'gray.100',
  background: 'white',
  textAlign: 'center',
})

const actionMenu = css({
  zIndex: '9999', background: 'white',
  border: '1px solid', borderColor: 'gray.100',
  borderRadius: 'md', minWidth: '172px',
  boxShadow: 'var(--shadows-lg)', overflow: 'hidden',
})

const actionItem = css({
  display: 'block', w: 'full', textAlign: 'left',
  paddingInline: '4', paddingBlock: '2.5',
  background: 'transparent', border: 'none', cursor: 'pointer',
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'dark',
  _hover: { background: 'gray.25' },
})

const actionItemDanger = css({
  display: 'block', w: 'full', textAlign: 'left',
  paddingInline: '4', paddingBlock: '2.5',
  background: 'transparent', border: 'none', cursor: 'pointer',
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'red.500',
  _hover: { background: 'red.25' },
})

// ─── Devtools (floating showcase control) ────────────────────────
const devFab = css({
  position: 'fixed', bottom: '20px', right: '20px', zIndex: '99999',
  w: '44px', h: '44px', borderRadius: 'full',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'dark', color: 'white', cursor: 'pointer', border: 'none',
  boxShadow: 'var(--shadows-lg)',
  _hover: { opacity: '0.9' },
})
const devPanel = css({
  position: 'fixed', bottom: '74px', right: '20px', zIndex: '99999',
  w: '232px', background: 'white', borderRadius: 'lg',
  border: '1px solid', borderColor: 'gray.100',
  boxShadow: 'var(--shadows-lg)', padding: '4',
})
const devClose = css({
  background: 'transparent', border: 'none', cursor: 'pointer',
  color: 'gray.600', fontSize: 'md', lineHeight: '1', padding: '1',
})
const devToggleOn = css({
  w: 'full', py: '2', borderRadius: 'md', cursor: 'pointer', border: 'none',
  background: 'indigo.700', color: 'white',
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold',
})
const devToggleOff = css({
  w: 'full', py: '2', borderRadius: 'md', cursor: 'pointer',
  border: '1px solid', borderColor: 'gray.100', background: 'white', color: 'dark',
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold',
  _hover: { background: 'gray.25' },
})
const devSegOn = css({
  flex: '1', py: '1.5', borderRadius: 'md', cursor: 'pointer', border: 'none',
  background: 'indigo.700', color: 'white',
  fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold',
})
const devSegOff = css({
  flex: '1', py: '1.5', borderRadius: 'md', cursor: 'pointer',
  border: '1px solid', borderColor: 'gray.100', background: 'white', color: 'dark',
  fontFamily: 'body', fontSize: 'sm',
  _hover: { background: 'gray.25' },
})
</script>

<template>
  <!--
    ═══ Header action — teleported into layout title bar ═══
    MpButton variant "primary" confirmed: ButtonVariant = 'primary' | 'secondary' | ...
  -->
  <Teleport to="#layout-header-actions">
    <!-- Unified create action (both tabs) — dropdown to pick category type -->
    <MpPopover id="create-category" use-portal placement="bottom-end" is-close-on-select>
      <MpPopoverTrigger>
        <MpButton variant="primary" size="md" right-icon="caret-down">
          Create category
        </MpButton>
      </MpPopoverTrigger>
      <MpPopoverContent :class="css({ marginTop: '2px', minWidth: '200px' })">
        <MpPopoverList>
          <!-- Standard → existing create page -->
          <MpPopoverListItem @click="navigateTo('/policies/claims/create')">
            Standard category
          </MpPopoverListItem>
          <!-- Custom → page to be built next -->
          <MpPopoverListItem @click="navigateTo('/policies/claims/custom/create')">
            Custom category
          </MpPopoverListItem>
        </MpPopoverList>
      </MpPopoverContent>
    </MpPopover>
  </Teleport>

  <Teleport to="#layout-tabs">
    <MpFlex gap="6" paddingInline="6" style="line-height: normal;">
      <button :class="activeTab === 'categories' ? tabActive : tabInactive"
              @click="setTab('categories')">Categories</button>
      <button :class="activeTab === 'custom' ? tabActive : tabInactive"
              @click="setTab('custom')">Custom categories</button>
    </MpFlex>
  </Teleport>

  <!-- ═══ Stage content ═══ -->
  <MpFlex direction="column" gap="6" width="full">

   <!-- ════════════════ CATEGORIES TAB ════════════════ -->
   <template v-if="activeTab === 'categories'">

    <!-- Filter toolbar -->
    <MpFlex align="center" justify="space-between" width="full">

      <!-- Left: 3 filter popovers — MpSelect-style trigger, checkbox items, sticky Apply -->
      <MpFlex align="center" gap="2">

        <!-- Status — multi-select -->
        <MpPopover id="filter-status" use-portal placement="bottom-start" v-slot="{ onClosePopover }">
          <MpPopoverTrigger>
            <button :class="filterTrigger">
              {{ statusFilterLabel }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9H6Z" fill="currentColor"/></svg>
            </button>
          </MpPopoverTrigger>
          <MpPopoverContent :class="css({ marginTop: '2px', overflowY: 'auto', maxHeight: '300px' })">
            <MpPopoverList>
              <MpPopoverListItem @click="statusFilter = []">
                <MpFlex align="center" gap="2">
                  <span :class="checkBox" :style="statusFilter.length === 0 ? checkBoxOn : checkBoxOff"><svg v-if="statusFilter.length === 0" :class="checkMark" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                  All status
                </MpFlex>
              </MpPopoverListItem>
              <MpPopoverListItem @click="toggleFilter(statusFilter, 'active')">
                <MpFlex align="center" gap="2">
                  <span :class="checkBox" :style="statusFilter.includes('active') ? checkBoxOn : checkBoxOff"><svg v-if="statusFilter.includes('active')" :class="checkMark" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                  Active
                </MpFlex>
              </MpPopoverListItem>
              <MpPopoverListItem @click="toggleFilter(statusFilter, 'inactive')">
                <MpFlex align="center" gap="2">
                  <span :class="checkBox" :style="statusFilter.includes('inactive') ? checkBoxOn : checkBoxOff"><svg v-if="statusFilter.includes('inactive')" :class="checkMark" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                  Inactive
                </MpFlex>
              </MpPopoverListItem>
            </MpPopoverList>
            <button :class="applyBtn" @click="onClosePopover">
              <MpText weight="semiBold" color="indigo.700">Apply</MpText>
            </button>
          </MpPopoverContent>
        </MpPopover>

        <!-- Type — multi-select -->
        <MpPopover id="filter-type" use-portal placement="bottom-start" v-slot="{ onClosePopover }">
          <MpPopoverTrigger>
            <button :class="filterTrigger">
              {{ typeFilterLabel }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9H6Z" fill="currentColor"/></svg>
            </button>
          </MpPopoverTrigger>
          <MpPopoverContent :class="css({ marginTop: '2px', overflowY: 'auto', maxHeight: '300px' })">
            <MpPopoverList>
              <MpPopoverListItem @click="typeFilter = []">
                <MpFlex align="center" gap="2">
                  <span :class="checkBox" :style="typeFilter.length === 0 ? checkBoxOn : checkBoxOff"><svg v-if="typeFilter.length === 0" :class="checkMark" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                  All types
                </MpFlex>
              </MpPopoverListItem>
              <MpPopoverListItem @click="toggleFilter(typeFilter, 'Domestic')">
                <MpFlex align="center" gap="2">
                  <span :class="checkBox" :style="typeFilter.includes('Domestic') ? checkBoxOn : checkBoxOff"><svg v-if="typeFilter.includes('Domestic')" :class="checkMark" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                  Domestic
                </MpFlex>
              </MpPopoverListItem>
              <MpPopoverListItem @click="toggleFilter(typeFilter, 'International')">
                <MpFlex align="center" gap="2">
                  <span :class="checkBox" :style="typeFilter.includes('International') ? checkBoxOn : checkBoxOff"><svg v-if="typeFilter.includes('International')" :class="checkMark" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                  International
                </MpFlex>
              </MpPopoverListItem>
            </MpPopoverList>
            <button :class="applyBtn" @click="onClosePopover">
              <MpText weight="semiBold" color="indigo.700">Apply</MpText>
            </button>
          </MpPopoverContent>
        </MpPopover>

        <!-- Usage — multi-select -->
        <MpPopover id="filter-usage" use-portal placement="bottom-start" v-slot="{ onClosePopover }">
          <MpPopoverTrigger>
            <button :class="filterTrigger">
              {{ usageFilterLabel }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9H6Z" fill="currentColor"/></svg>
            </button>
          </MpPopoverTrigger>
          <MpPopoverContent :class="css({ marginTop: '2px', overflowY: 'auto', maxHeight: '300px' })">
            <MpPopoverList>
              <MpPopoverListItem @click="usageFilter = []">
                <MpFlex align="center" gap="2">
                  <span :class="checkBox" :style="usageFilter.length === 0 ? checkBoxOn : checkBoxOff"><svg v-if="usageFilter.length === 0" :class="checkMark" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                  All usages
                </MpFlex>
              </MpPopoverListItem>
              <MpPopoverListItem
                v-for="u in ['Reimbursement','Cash advance','Virtual card','Physical card']"
                :key="u"
                @click="toggleFilter(usageFilter, u)"
              >
                <MpFlex align="center" gap="2">
                  <span :class="checkBox" :style="usageFilter.includes(u) ? checkBoxOn : checkBoxOff"><svg v-if="usageFilter.includes(u)" :class="checkMark" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                  {{ u }}
                </MpFlex>
              </MpPopoverListItem>
            </MpPopoverList>
            <button :class="applyBtn" @click="onClosePopover">
              <MpText weight="semiBold" color="indigo.700">Apply</MpText>
            </button>
          </MpPopoverContent>
        </MpPopover>

      </MpFlex>

      <!-- Right: Search -->
      <MpInputGroup style="width:240px;">
        <MpInputLeftAddon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#9ca3af">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </MpInputLeftAddon>
        <MpInput v-model="searchQuery" placeholder="Search category" />
      </MpInputGroup>

    </MpFlex>

    <!-- Data table -->
    <div :class="tblWrap" ref="tblWrapRef">
      <table :class="tbl">

        <!-- tableLayout:auto — all columns sized by content; no width hints -->
        <colgroup>
          <col>
          <col>
          <col>
          <col>
          <col>
        </colgroup>

        <thead>
          <tr>
            <th :class="th">Claim category name</th>
            <th :class="th">Description</th>
            <th :class="th">Category type</th>
            <th :class="th">Category usage</th>
            <th :class="th">Status</th>
            <th :class="th"></th>
          </tr>
        </thead>

        <tbody>
          <!-- Blank slate — first-time (illustrated) or filtered (inline) -->
          <tr v-if="filteredRows.length === 0">
            <td :colspan="6" style="padding:0; border-bottom:none;">
              <ClaimsBlankSlate
                :variant="categoriesEmptyVariant"
                :title="categoriesEmptyVariant === 'not-found' ? EMPTY_COPY.categories.noResult.title : EMPTY_COPY.categories.noData.title"
                :description="categoriesEmptyVariant === 'not-found' ? EMPTY_COPY.categories.noResult.desc : EMPTY_COPY.categories.noData.desc"
              />
            </td>
          </tr>

          <tr v-for="row in filteredRows" :key="row.id">

            <td :class="td" style="min-width:140px; white-space:nowrap;">
              <MpTextlink @click="navigateTo(`/policies/claims/${row.id}`)" style="cursor:pointer;">{{ row.name }}</MpTextlink>
            </td>

            <td :class="td">
              <div style="max-width:260px; white-space:normal; overflow-wrap:break-word; word-break:break-word;">
                <MpText size="body" color="dark">{{ row.description }}</MpText>
              </div>
            </td>

            <td :class="td">
              <div style="max-width:180px; white-space:normal; overflow-wrap:break-word;">
                <MpText size="body" color="dark">{{ row.categoryType }}</MpText>
              </div>
            </td>

            <td :class="td">
              <ul style="margin:0; padding-left:16px; list-style-type:disc;">
                <li v-for="u in row.categoryUsage" :key="u"
                    style="font-family:var(--fonts-body); font-size:var(--fontSizes-md); line-height:var(--lineHeights-lg); color:var(--colors-dark);">
                  {{ u }}
                </li>
              </ul>
            </td>

            <td :class="td" style="white-space:nowrap;">
              <MpBadge for="tableStatus" variant="subtle"
                :variantColor="row.status === 'Active' ? 'green' : 'gray'"
              >{{ row.status }}</MpBadge>
            </td>

            <td :class="td" style="text-align:right; white-space:nowrap;">
              <MpButton variant="secondary" size="md" rightIcon="caret-down"
                @click.stop="toggleActionMenu(row.id, $event)">Actions</MpButton>

              <Teleport to="body">
                <div v-if="activeActionId === row.id" :class="actionMenu"
                  :style="{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right }"
                  data-action-dropdown>
                  <button v-for="opt in ACTION_OPTIONS" :key="opt.value"
                    :class="opt.danger ? actionItemDanger : actionItem"
                    @click.stop="handleAction(opt.value, row)">
                    {{ opt.value === 'deactivate' ? (row.status === 'Inactive' ? 'Activate' : 'Deactivate') : opt.label }}
                  </button>
                </div>
              </Teleport>
            </td>

          </tr>
        </tbody>

      </table>
    </div>

    <!-- Pagination -->
    <MpFlex align="center" justify="space-between" paddingInline="1">

      <!-- Left: rows per page + count -->
      <MpFlex align="center" gap="6">
        <MpFlex align="center" gap="1">
          <span :class="metaText">Rows per page</span>
          <MpButton variant="ghost" size="sm" rightIcon="caret-down">10</MpButton>
        </MpFlex>
        <span :class="metaText">Showing 1–{{ filteredRows.length }} of {{ rows.length }}</span>
      </MpFlex>

      <!-- Right: page selector + prev/next -->
      <MpFlex align="center" gap="4">
        <MpFlex align="center" gap="3">
          <MpButton variant="secondary" size="sm" rightIcon="caret-down"
                    style="width:64px;">1</MpButton>
          <span :class="metaText">of 1 page</span>
        </MpFlex>
        <MpFlex align="center" gap="2">
          <MpButton variant="ghost" size="sm" leftIcon="chevrons-left"
                    aria-label="Previous page" />
          <MpButton variant="ghost" size="sm" leftIcon="chevrons-right"
                    aria-label="Next page" />
        </MpFlex>
      </MpFlex>

    </MpFlex>

   </template>

   <!-- ════════════════ CUSTOM CATEGORIES TAB ════════════════ -->
   <template v-else>

    <!-- Filter toolbar — status filter + search only -->
    <MpFlex align="center" justify="space-between" width="full">

      <MpFlex align="center" gap="2">
        <MpPopover id="custom-filter-status" use-portal placement="bottom-start" v-slot="{ onClosePopover }">
          <MpPopoverTrigger>
            <button :class="filterTrigger">
              {{ customStatusFilterLabel }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9H6Z" fill="currentColor"/></svg>
            </button>
          </MpPopoverTrigger>
          <MpPopoverContent :class="css({ marginTop: '2px', overflowY: 'auto', maxHeight: '300px' })">
            <MpPopoverList>
              <MpPopoverListItem @click="customStatusFilter = []">
                <MpFlex align="center" gap="2">
                  <span :class="checkBox" :style="customStatusFilter.length === 0 ? checkBoxOn : checkBoxOff"><svg v-if="customStatusFilter.length === 0" :class="checkMark" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                  All status
                </MpFlex>
              </MpPopoverListItem>
              <MpPopoverListItem @click="toggleFilter(customStatusFilter, 'active')">
                <MpFlex align="center" gap="2">
                  <span :class="checkBox" :style="customStatusFilter.includes('active') ? checkBoxOn : checkBoxOff"><svg v-if="customStatusFilter.includes('active')" :class="checkMark" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                  Active
                </MpFlex>
              </MpPopoverListItem>
              <MpPopoverListItem @click="toggleFilter(customStatusFilter, 'inactive')">
                <MpFlex align="center" gap="2">
                  <span :class="checkBox" :style="customStatusFilter.includes('inactive') ? checkBoxOn : checkBoxOff"><svg v-if="customStatusFilter.includes('inactive')" :class="checkMark" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                  Inactive
                </MpFlex>
              </MpPopoverListItem>
            </MpPopoverList>
            <button :class="applyBtn" @click="onClosePopover">
              <MpText weight="semiBold" color="indigo.700">Apply</MpText>
            </button>
          </MpPopoverContent>
        </MpPopover>
      </MpFlex>

      <!-- Right: Search -->
      <MpInputGroup style="width:240px;">
        <MpInputLeftAddon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#9ca3af">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </MpInputLeftAddon>
        <MpInput v-model="customSearchQuery" placeholder="Search custom category name" />
      </MpInputGroup>

    </MpFlex>

    <!-- Data table -->
    <div :class="tblWrap">
      <table :class="tbl">

        <colgroup>
          <col>
          <col>
          <col>
          <col>
          <col>
        </colgroup>

        <thead>
          <tr>
            <th :class="th">Custom category name</th>
            <th :class="th">Description</th>
            <th :class="th">Last modified</th>
            <th :class="th">Status</th>
            <th :class="th"></th>
          </tr>
        </thead>

        <tbody>
          <!-- Blank slate — first-time (illustrated) or filtered (inline) -->
          <tr v-if="filteredCustomRows.length === 0">
            <td :colspan="5" style="padding:0; border-bottom:none;">
              <ClaimsBlankSlate
                :variant="customEmptyVariant"
                :title="customEmptyVariant === 'not-found' ? EMPTY_COPY.custom.noResult.title : EMPTY_COPY.custom.noData.title"
                :description="customEmptyVariant === 'not-found' ? EMPTY_COPY.custom.noResult.desc : EMPTY_COPY.custom.noData.desc"
              />
            </td>
          </tr>

          <tr v-for="row in filteredCustomRows" :key="row.id">

            <td :class="td" style="min-width:160px; white-space:nowrap;">
              <MpTextlink @click="navigateTo(`/policies/claims/custom/${row.id}`)" style="cursor:pointer;">{{ row.name }}</MpTextlink>
            </td>

            <td :class="td">
              <div style="max-width:320px; white-space:normal; overflow-wrap:break-word; word-break:break-word;">
                <MpText size="body" color="dark">{{ row.description }}</MpText>
              </div>
            </td>

            <td :class="td" style="white-space:nowrap;">
              <MpText size="body" color="dark">{{ row.lastModified }}</MpText>
              <div><span :class="metaText">{{ row.lastModifiedTime }}</span></div>
            </td>

            <td :class="td" style="white-space:nowrap;">
              <MpBadge for="tableStatus" variant="subtle"
                :variantColor="row.status === 'Active' ? 'green' : 'gray'"
              >{{ row.status }}</MpBadge>
            </td>

            <td :class="td" style="text-align:right; white-space:nowrap;">
              <MpButton variant="secondary" size="md" rightIcon="caret-down"
                @click.stop="toggleActionMenu(row.id, $event)">Actions</MpButton>

              <Teleport to="body">
                <div v-if="activeActionId === row.id" :class="actionMenu"
                  :style="{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right }"
                  data-action-dropdown>
                  <button v-for="opt in ACTION_OPTIONS" :key="opt.value"
                    :class="opt.danger ? actionItemDanger : actionItem"
                    @click.stop="handleAction(opt.value, row, 'custom')">
                    {{ opt.value === 'deactivate' ? (row.status === 'Inactive' ? 'Activate' : 'Deactivate') : opt.label }}
                  </button>
                </div>
              </Teleport>
            </td>

          </tr>
        </tbody>

      </table>
    </div>

    <!-- Pagination — static mock (server paginates; 30 rows across 3 pages) -->
    <MpFlex align="center" justify="space-between" paddingInline="1">

      <MpFlex align="center" gap="6">
        <MpFlex align="center" gap="1">
          <span :class="metaText">Rows per page</span>
          <MpButton variant="ghost" size="sm" rightIcon="caret-down">10</MpButton>
        </MpFlex>
        <span :class="metaText">Showing 1–{{ filteredCustomRows.length }} of 30</span>
      </MpFlex>

      <MpFlex align="center" gap="4">
        <MpFlex align="center" gap="3">
          <MpButton variant="secondary" size="sm" rightIcon="caret-down"
                    style="width:64px;">1</MpButton>
          <span :class="metaText">of 3 page</span>
        </MpFlex>
        <MpFlex align="center" gap="2">
          <MpButton variant="ghost" size="sm" leftIcon="chevrons-left"
                    aria-label="Previous page" />
          <MpButton variant="ghost" size="sm" leftIcon="chevrons-right"
                    aria-label="Next page" />
        </MpFlex>
      </MpFlex>

    </MpFlex>

   </template>

  </MpFlex>

  <!-- ═══ Confirmation modals ═══ -->
  <MpModal :is-open="isModalOpen" @close="closeModal">
    <MpModalContent>
      <MpModalHeader>
        {{ modalConfig?.title ?? '' }}
        <MpModalCloseButton />
      </MpModalHeader>
      <MpModalBody>
        <MpText v-if="modalConfig?.single" size="body" color="dark">
          {{ modalConfig.single }}
        </MpText>
        <template v-else-if="modalConfig?.intro">
          <MpText size="body" color="dark" style="margin-bottom:12px;">
            {{ modalConfig.intro }}
          </MpText>
          <ul style="margin:0; padding-left:20px; list-style-type:disc;">
            <li v-for="(item, i) in modalConfig.bullets" :key="i"
                style="font-family:var(--fonts-body); font-size:var(--fontSizes-md); line-height:var(--lineHeights-lg); color:var(--colors-dark); margin-bottom:4px;">
              {{ item }}
            </li>
          </ul>
        </template>
      </MpModalBody>
      <MpModalFooter>
        <MpButton variant="ghost" @click="closeModal">Cancel</MpButton>
        <MpButton
          :variant="pendingAction?.type === 'activate' ? 'primary' : 'danger'"
          @click="confirmModal"
        >
          {{ modalConfig?.confirm ?? '' }}
        </MpButton>
      </MpModalFooter>
    </MpModalContent>
    <MpModalOverlay />
  </MpModal>

  <!-- ═══ Floating devtools (dev only) — showcase blank slate ═══ -->
  <Teleport to="body">
    <template v-if="isDev">

      <!-- Panel -->
      <div v-if="devOpen" :class="devPanel">
        <MpFlex direction="column" gap="3">

          <MpFlex align="center" justify="space-between">
            <MpText weight="semiBold" color="dark" style="font-size:13px;">Devtools · Blank slate</MpText>
            <button :class="devClose" aria-label="Close devtools" @click="devOpen = false">✕</button>
          </MpFlex>

          <button :class="devEmpty ? devToggleOn : devToggleOff" @click="devEmpty = !devEmpty">
            {{ devEmpty ? 'Showing blank slate' : 'Show blank slate' }}
          </button>

          <div :style="devEmpty ? '' : 'opacity:.4; pointer-events:none;'">
            <MpText color="gray.600" style="font-size:12px; margin-bottom:6px;">Variant</MpText>
            <MpFlex gap="2">
              <button :class="devEmptyVariant === 'first-time' ? devSegOn : devSegOff"
                      @click="devEmptyVariant = 'first-time'">First-time</button>
              <button :class="devEmptyVariant === 'not-found' ? devSegOn : devSegOff"
                      @click="devEmptyVariant = 'not-found'">Not found</button>
            </MpFlex>
          </div>

          <MpText color="gray.600" style="font-size:11px; line-height:16px;">
            Affects the {{ activeTab === 'custom' ? 'Custom categories' : 'Categories' }} tab
          </MpText>

        </MpFlex>
      </div>

      <!-- Floating action button -->
      <button :class="devFab" aria-label="Toggle devtools" @click="devOpen = !devOpen">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
        </svg>
      </button>

    </template>
  </Teleport>
</template>
