<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Workflows › Claims
  Token mode: Pixel 2.4
  Patterns used: index-view, data-table, filter-toolbar, tabs
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-->
<script setup lang="ts">
import {
  MpFlex, MpText, MpTextlink,
  MpButton, MpBadge, MpAutocomplete,
  MpInputGroup, MpInputLeftAddon, MpInput,
  MpModal, MpModalOverlay, MpModalContent, MpModalHeader, MpModalBody, MpModalFooter, MpModalCloseButton,
  css, toast,
} from '@mekari/pixel3'

definePageMeta({ title: 'Claims' })

const route = useRoute()

// ─── Types & mock data ────────────────────────────────────────────

type Status   = 'Active' | 'Inactive'
type TabKey   = 'reimbursement' | 'cash-advance' | 'international' | 'custom'

interface WorkflowRow {
  id: number
  name: string
  status: Status
  currencies: string[]
}

// ── Tab data ──────────────────────────────────────────────────────
const reimbursementRows = ref<WorkflowRow[]>([
  { id: 1, name: 'Standard Reimbursement Workflow',    status: 'Active',   currencies: ['IDR']           },
  { id: 2, name: 'Manager Approval Flow',              status: 'Active',   currencies: ['IDR', 'USD']    },
  { id: 3, name: 'Finance Review Workflow',            status: 'Inactive', currencies: ['IDR']           },
])

const cashAdvanceRows = ref<WorkflowRow[]>([
  { id: 1, name: 'Cash Advance Standard Flow',         status: 'Active',   currencies: ['IDR']           },
  { id: 2, name: 'CA Finance Approval Workflow',       status: 'Active',   currencies: ['IDR', 'USD']    },
  { id: 3, name: 'Legacy Cash Advance Flow',           status: 'Inactive', currencies: ['IDR']           },
])

const internationalRows = ref<WorkflowRow[]>([
  { id: 1, name: 'Domestic Category Workflow',         status: 'Active',   currencies: ['IDR']                    },
  { id: 2, name: 'International Category Workflow',    status: 'Active',   currencies: ['JPY', 'HKD', 'USD', 'SGD'] },
  { id: 3, name: 'Legacy Reimbursement Workflow',      status: 'Inactive', currencies: ['USD', 'EUR']             },
  { id: 4, name: 'Old Expense Workflow',               status: 'Inactive', currencies: ['IDR']                    },
  { id: 5, name: 'Archived International Flow',        status: 'Inactive', currencies: ['JPY', 'USD']             },
])

const customRows = ref<WorkflowRow[]>([
  { id: 1, name: 'Custom Approval Chain',              status: 'Active',   currencies: ['IDR', 'USD', 'EUR'] },
  { id: 2, name: 'Multi-Level Review Workflow',        status: 'Inactive', currencies: ['IDR']               },
])

// ── Active tab ────────────────────────────────────────────────────
const activeTab = ref<TabKey>('international')

function setTab(t: TabKey) {
  activeTab.value = t
  activeActionId.value = null
  statusFilter.value = 'All status'
  searchQuery.value  = ''
}

// Restore tab from ?tab= query param (e.g. returning from detail page)
watch(() => route.query.tab, (tab) => {
  if (tab === 'reimbursement' || tab === 'cash-advance' || tab === 'international' || tab === 'custom') {
    activeTab.value = tab as TabKey
  }
}, { immediate: true })

const activeRows = computed((): WorkflowRow[] => {
  switch (activeTab.value) {
    case 'reimbursement':  return reimbursementRows.value
    case 'cash-advance':   return cashAdvanceRows.value
    case 'international':  return internationalRows.value
    case 'custom':         return customRows.value
  }
})

// ─── Filter & search ──────────────────────────────────────────────

const STATUS_FILTER_OPTIONS = ['All status', 'Active', 'Inactive']
const statusFilter = ref('All status')
const searchQuery  = ref('')

const filteredRows = computed(() => {
  return activeRows.value.filter(row => {
    const matchesStatus = statusFilter.value === 'All status' || row.status === statusFilter.value
    const matchesSearch = !searchQuery.value ||
      row.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesStatus && matchesSearch
  })
})

// ─── Action menu ──────────────────────────────────────────────────

const activeActionId = ref<number | null>(null)
const dropdownPos    = ref({ top: '0px', right: '0px' })

const ACTION_OPTIONS = [
  { value: 'view',       label: 'View details' },
  { value: 'edit',       label: 'Edit workflow' },
  { value: 'deactivate', label: 'Deactivate'    },
  { value: 'delete',     label: 'Delete',  danger: true },
]

function toggleActionMenu(id: number, event: MouseEvent) {
  if (activeActionId.value === id) { activeActionId.value = null; return }
  activeActionId.value = id
  // Position relative to the clicked button using fixed coords — escapes any overflow container
  const btn = (event.currentTarget as HTMLElement)
  const rect = btn.getBoundingClientRect()
  dropdownPos.value = {
    top:   `${rect.bottom + 4}px`,
    right: `${window.innerWidth - rect.right}px`,
  }
}

// ─── Confirmation modal ───────────────────────────────────────────

type ModalActionType = 'deactivate' | 'activate' | 'delete'

const pendingAction = ref<{ type: ModalActionType; row: WorkflowRow } | null>(null)
const isModalOpen   = computed(() => pendingAction.value !== null)

const MODAL_CONFIG: Record<ModalActionType, { title: string; body: string; confirmLabel: string; confirmVariant: string }> = {
  deactivate: {
    title:          'Deactivate workflow?',
    body:           'Deactivating this workflow will not affect active requests that are currently using this workflow.',
    confirmLabel:   'Deactivate',
    confirmVariant: 'danger',
  },
  activate: {
    title:          'Activate workflow?',
    body:           'Activating this workflow will only affect new requests that match this workflow.',
    confirmLabel:   'Activate',
    confirmVariant: 'primary',
  },
  delete: {
    title:          'Delete workflow?',
    body:           'Deleting this workflow will not affect active requests that are currently using this workflow.',
    confirmLabel:   'Delete',
    confirmVariant: 'danger',
  },
}

function handleAction(value: string, row: WorkflowRow) {
  activeActionId.value = null
  if (value === 'view') {
    navigateTo(`/workflows/claims/${row.id}`)
  } else if (value === 'edit') {
    navigateTo(`/workflows/claims/create?mode=edit&id=${row.id}`)
  } else if (value === 'deactivate') {
    const isInactive = activeRows.value.find(r => r.id === row.id)?.status === 'Inactive'
    pendingAction.value = { type: isInactive ? 'activate' : 'deactivate', row }
  } else if (value === 'delete') {
    pendingAction.value = { type: 'delete', row }
  }
}

function confirmAction() {
  if (!pendingAction.value) return
  const { type, row } = pendingAction.value
  pendingAction.value = null

  // Mutate the currently active tab's array
  const tabRef = activeTab.value === 'reimbursement' ? reimbursementRows
               : activeTab.value === 'cash-advance'  ? cashAdvanceRows
               : activeTab.value === 'custom'        ? customRows
               : internationalRows

  if (type === 'deactivate') {
    const target = tabRef.value.find(r => r.id === row.id)
    if (target) target.status = 'Inactive'
    toast.notify({ variant: 'success', title: 'Workflow deactivated', position: 'top-center' })
  } else if (type === 'activate') {
    const target = tabRef.value.find(r => r.id === row.id)
    if (target) target.status = 'Active'
    toast.notify({ variant: 'success', title: 'Workflow activated', position: 'top-center' })
  } else if (type === 'delete') {
    tabRef.value = tabRef.value.filter(r => r.id !== row.id)
    toast.notify({ variant: 'success', title: 'Workflow deleted', position: 'top-center' })
  }
}

function cancelAction() {
  pendingAction.value = null
}

function onDocumentMousedown(e: MouseEvent) {
  // Don't close if the click is inside an open dropdown
  if ((e.target as HTMLElement).closest('[data-action-dropdown]')) return
  activeActionId.value = null
}

const tblWrapRef = ref<HTMLElement | null>(null)

onMounted(() => {
  document.addEventListener('mousedown', onDocumentMousedown)
  // Some browser auto-scroll (e.g. from MpAutocomplete focus) can push the wrapper right — reset it
  nextTick(() => { if (tblWrapRef.value) tblWrapRef.value.scrollLeft = 0 })
})
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocumentMousedown))

// ─── CSS classes ──────────────────────────────────────────────────

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

const tblWrap = css({ w: 'full', overflowX: 'auto' })

const tbl = css({
  w: 'full', tableLayout: 'auto',
  borderCollapse: 'collapse',
})

const th = css({
  bg: 'gray.25',
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold',
  lineHeight: 'lg', color: 'dark',
  paddingLeft: '3', paddingRight: '3', paddingBlock: '3',
  h: '44px',
  borderBottom: '1px solid', borderBottomColor: 'gray.100',
  textAlign: 'left', whiteSpace: 'nowrap', verticalAlign: 'middle',
})

const td = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'dark',
  paddingLeft: '3', paddingRight: '3', paddingBlock: '3',
  borderBottom: '1px solid', borderBottomColor: 'gray.100',
  verticalAlign: 'middle',
})

const metaText = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg',
  color: 'gray.600', whiteSpace: 'nowrap',
})

const currencyTag = css({
  display: 'inline-flex', alignItems: 'center',
  paddingInline: '1.5', paddingBlock: '0.5',
  borderRadius: 'sm',
  background: 'gray.100',
  fontFamily: 'body', fontSize: 'sm', lineHeight: 'lg', color: 'dark',
  whiteSpace: 'nowrap',
})

// Action dropdown — plain list, no input field
const actionMenu = css({
  position: 'absolute', right: '0', top: 'calc(100% + 4px)',
  zIndex: '9999',
  background: 'white',
  border: '1px solid', borderColor: 'gray.100',
  borderRadius: 'md',
  minWidth: '172px',
  boxShadow: 'var(--shadows-lg)',
  overflow: 'hidden',
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
</script>

<template>
  <!-- ═════ Header CTA ═════ -->
  <Teleport to="#layout-header-actions">
    <MpButton variant="primary" size="md" @click="navigateTo('/workflows/claims/create')">
      Create workflow
    </MpButton>
  </Teleport>

  <!-- ═════ Tabs ═════ -->
  <Teleport to="#layout-tabs">
    <MpFlex gap="6" paddingInline="6" style="line-height: normal;">
      <button :class="activeTab === 'reimbursement' ? tabActive : tabInactive" @click="setTab('reimbursement')">Reimbursement</button>
      <button :class="activeTab === 'cash-advance'  ? tabActive : tabInactive" @click="setTab('cash-advance')">Cash advance</button>
      <button :class="activeTab === 'international' ? tabActive : tabInactive" @click="setTab('international')">International</button>
      <button :class="activeTab === 'custom'        ? tabActive : tabInactive" @click="setTab('custom')">Custom</button>
    </MpFlex>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" style="min-width:0;">

    <!-- ═════ Filter toolbar ═════ -->
    <MpFlex align="center" justify="space-between">
      <!-- Status filter -->
      <div style="width:180px;">
        <MpAutocomplete
          id="filter-status"
          v-model="statusFilter"
          :data="STATUS_FILTER_OPTIONS"
          placeholder="All status"
        />
      </div>

      <!-- Search — fixed 240px, right-aligned -->
      <MpInputGroup style="width:240px;">
        <MpInputLeftAddon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#9ca3af">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </MpInputLeftAddon>
        <MpInput
          v-model="searchQuery"
          placeholder="Search workflow..."
          :isFullWidth="true"
        />
      </MpInputGroup>
    </MpFlex>

    <!-- ═════ Data table ═════ -->
    <div :class="tblWrap" ref="tblWrapRef">
      <table :class="tbl">
        <thead>
          <tr>
            <th :class="th">Workflow name</th>
            <th :class="th">Status</th>
            <th :class="th">Currency</th>
            <th :class="th"></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in filteredRows" :key="row.id">

            <!-- Workflow name — link to details -->
            <td :class="td">
              <MpTextlink
                size="body"
                @click="navigateTo(`/workflows/claims/${row.id}`)"
                style="cursor:pointer;"
              >{{ row.name }}</MpTextlink>
            </td>

            <!-- Status badge -->
            <td :class="td" style="white-space:nowrap;">
              <MpBadge
                for="tableStatus"
                variant="subtle"
                :variantColor="row.status === 'Active' ? 'green' : 'gray'"
              >{{ row.status }}</MpBadge>
            </td>

            <!-- Currency tags -->
            <td :class="td">
              <MpFlex wrap="wrap" gap="1">
                <span v-for="cur in row.currencies" :key="cur" :class="currencyTag">{{ cur }}</span>
              </MpFlex>
            </td>

            <!-- Actions -->
            <td :class="td" style="text-align:right; white-space:nowrap;">
              <MpButton
                variant="secondary"
                size="md"
                rightIcon="caret-down"
                @click.stop="toggleActionMenu(row.id, $event)"
              >Actions</MpButton>

              <!-- Dropdown teleported to body → escapes overflow-x container -->
              <Teleport to="body">
                <div
                  v-if="activeActionId === row.id"
                  :class="actionMenu"
                  :style="{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right }"
                  data-action-dropdown
                >
                  <button
                    v-for="opt in ACTION_OPTIONS"
                    :key="opt.value"
                    :class="opt.danger ? actionItemDanger : actionItem"
                    @click.stop="handleAction(opt.value, row)"
                  >{{ opt.value === 'deactivate' ? (row.status === 'Inactive' ? 'Activate' : 'Deactivate') : opt.label }}</button>
                </div>
              </Teleport>
            </td>

          </tr>
        </tbody>
      </table>
    </div>

    <!-- ═════ Pagination ═════ -->
    <MpFlex align="center" justify="space-between" paddingInline="1">
      <MpFlex align="center" gap="6">
        <MpFlex align="center" gap="1">
          <span :class="metaText">Rows per page</span>
          <MpButton variant="ghost" size="sm" rightIcon="caret-down">10</MpButton>
        </MpFlex>
        <span :class="metaText">Showing 1–{{ filteredRows.length }} of {{ activeRows.length }}</span>
      </MpFlex>

      <MpFlex align="center" gap="4">
        <MpFlex align="center" gap="3">
          <MpButton variant="secondary" size="sm" rightIcon="caret-down" style="width:64px;">1</MpButton>
          <span :class="metaText">of 1 page</span>
        </MpFlex>
        <MpFlex align="center" gap="2">
          <MpButton variant="ghost" size="sm" leftIcon="chevrons-left" aria-label="Previous page" />
          <MpButton variant="ghost" size="sm" leftIcon="chevrons-right" aria-label="Next page" />
        </MpFlex>
      </MpFlex>
    </MpFlex>

  </MpFlex>

  <!-- ═════ Confirmation modal ═════ -->
  <MpModal :is-open="isModalOpen" @close="cancelAction">
    <MpModalContent>
      <MpModalHeader>
        {{ pendingAction ? MODAL_CONFIG[pendingAction.type].title : '' }}
        <MpModalCloseButton />
      </MpModalHeader>
      <MpModalBody>{{ pendingAction ? MODAL_CONFIG[pendingAction.type].body : '' }}</MpModalBody>
      <MpModalFooter>
        <MpButton variant="ghost" size="md" @click="cancelAction">Cancel</MpButton>
        <MpButton :variant="pendingAction ? MODAL_CONFIG[pendingAction.type].confirmVariant : 'primary'" size="md" @click="confirmAction">
          {{ pendingAction ? MODAL_CONFIG[pendingAction.type].confirmLabel : '' }}
        </MpButton>
      </MpModalFooter>
    </MpModalContent>
    <MpModalOverlay />
  </MpModal>
</template>
