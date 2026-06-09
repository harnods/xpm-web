<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Workflows › Claims
  Token mode: Pixel 2.4
  Patterns used: index-view, data-table, filter-toolbar
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

// ─── Types & mock data ────────────────────────────────────────────

type Status = 'Active' | 'Inactive'

interface WorkflowRow {
  id: number
  name: string
  transactionType: 'Domestic' | 'International'
  status: Status
}

const rows = ref<WorkflowRow[]>([
  { id: 1, name: 'Domestic Category Workflow',      transactionType: 'Domestic',      status: 'Active'   },
  { id: 2, name: 'International Category Workflow', transactionType: 'International', status: 'Active'   },
  { id: 3, name: 'Legacy Reimbursement Workflow',   transactionType: 'Domestic',      status: 'Inactive' },
  { id: 4, name: 'Old Expense Workflow',            transactionType: 'Domestic',      status: 'Inactive' },
  { id: 5, name: 'Archived International Flow',     transactionType: 'International', status: 'Inactive' },
])

// ─── Filter & search ──────────────────────────────────────────────

const STATUS_FILTER_OPTIONS = ['All status', 'Active', 'Inactive']
const statusFilter = ref('All status')
const searchQuery  = ref('')

const filteredRows = computed(() => {
  return rows.value.filter(row => {
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
    const isInactive = rows.value.find(r => r.id === row.id)?.status === 'Inactive'
    pendingAction.value = { type: isInactive ? 'activate' : 'deactivate', row }
  } else if (value === 'delete') {
    pendingAction.value = { type: 'delete', row }
  }
}

function confirmAction() {
  if (!pendingAction.value) return
  const { type, row } = pendingAction.value
  pendingAction.value = null

  if (type === 'deactivate') {
    const target = rows.value.find(r => r.id === row.id)
    if (target) target.status = 'Inactive'
    toast.notify({ variant: 'success', title: 'Workflow deactivated', position: 'top-center' })
  } else if (type === 'activate') {
    const target = rows.value.find(r => r.id === row.id)
    if (target) target.status = 'Active'
    toast.notify({ variant: 'success', title: 'Workflow activated', position: 'top-center' })
  } else if (type === 'delete') {
    rows.value = rows.value.filter(r => r.id !== row.id)
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
            <th :class="th">Transaction type</th>
            <th :class="th">Status</th>
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

            <!-- Transaction type -->
            <td :class="td" style="white-space:nowrap;">
              <MpText size="body" color="dark">{{ row.transactionType }}</MpText>
            </td>

            <!-- Status badge -->
            <td :class="td" style="white-space:nowrap;">
              <MpBadge
                for="tableStatus"
                variant="subtle"
                :variantColor="row.status === 'Active' ? 'green' : 'gray'"
              >{{ row.status }}</MpBadge>
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
        <span :class="metaText">Showing 1–{{ filteredRows.length }} of {{ rows.length }}</span>
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
