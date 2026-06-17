<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Transactions › Claims (Index)
  Source: Figma KmuvgJGEUPeKe2bkbtgNaq · node 7599-124622
  Token mode: Pixel 2.4
  Patterns used: layout-shell, index-view, summary-cards, filter-toolbar, data-table, action-menu
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STATES INCLUDED:
    - Happy path (mock rows matching Figma)
    - AI anomaly sub-row (amber, under flagged transactions)
    - Empty state: illustrated, "No claims yet" (built — Figma key page showed only happy path)
    - Null values: em dash (—) in secondary text

  COPY DEFAULTS (iterate freely):
    - Header CTA: "Submit claim" → Reimbursement / Cash advance
    - Anomaly banner: "{n} potential transaction anomalies detected." + "View anomalies"
    - Empty state: "No claims yet" / "Claims submitted by employees will appear here."

  CONVENTION OVERRIDES applied:
    - Status: Pixel MpBadge types (warning / information / completed) mapped from status labels
    - "View anomalies": kept Figma amber emphasis (custom button) — designer intent

  OPEN ITEMS:
    - Summary card totals, table rows, anomaly flags are mock — wire to API
    - Month filter is a static display trigger for the prototype
-->
<script setup lang="ts">
import {
  MpFlex, MpText, MpTextlink,
  MpButton, MpBadge, MpIcon, MpAutocomplete,
  MpInputGroup, MpInputLeftAddon, MpInput,
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
  css,
} from '@mekari/pixel3'

definePageMeta({ title: 'Claims' })

// ─── Types ────────────────────────────────────────────────────────
type ClaimStatus =
  | 'Awaiting approval' | 'Awaiting settlement' | 'Awaiting disbursement'
  | 'Approved' | 'Disbursed' | 'Settled' | 'Rejected'

type ClaimType = 'Reimbursement' | 'Cash advance'

interface ClaimTxn {
  id: string
  hasAI?: boolean
  anomaly?: string[]        // flagged fields — renders the amber sub-row when present
  requestDate: string
  requestTime: string
  requestBy: string
  requestCode: string
  organization: string
  orgUnit: string
  type: ClaimType
  hasAttachment: boolean
  category: string
  account: string
  amount: number
  status: ClaimStatus
}

interface SummaryStat {
  label: string
  amount: string
  variant: 'orange' | 'blue' | 'green'
}

// ─── Copy constants ───────────────────────────────────────────────
const ANOMALY_COUNT = 2
const EMPTY_TITLE   = 'No claims yet'
const EMPTY_DESC    = 'Claims submitted by employees will appear here.'

// ─── Summary stats (mock — replace with API) ──────────────────────
const reimbursementStats: SummaryStat[] = [
  { label: 'Awaiting approval',     amount: 'Rp150.100.500', variant: 'orange' },
  { label: 'Awaiting disbursement', amount: 'Rp750.000',     variant: 'blue'   },
  { label: 'Disbursed',             amount: 'Rp550.750.000', variant: 'green'  },
]
const cashAdvanceStats: SummaryStat[] = [
  { label: 'Awaiting approval',     amount: 'Rp50.100.500',  variant: 'orange' },
  { label: 'Awaiting disbursement', amount: 'Rp1.750.000',   variant: 'blue'   },
  { label: 'Settled',               amount: 'Rp650.000.000', variant: 'green'  },
]

// ─── Status → MpBadge type ────────────────────────────────────────
const STATUS_TYPE: Record<ClaimStatus, string> = {
  'Awaiting approval':     'warning',
  'Awaiting settlement':   'warning',
  'Awaiting disbursement': 'information',
  'Approved':              'completed',
  'Disbursed':             'completed',
  'Settled':               'completed',
  'Rejected':              'critical',
}

// ─── Table rows (mock — replace with API) ─────────────────────────
const ROWS = ref<ClaimTxn[]>([
  { id: '2024225917', hasAI: true, anomaly: ['amount', 'vendor', 'duplication'], requestDate: '15 Oct 2025', requestTime: '14:00 (GMT+7)', requestBy: 'Daud Dimas Prasetyo', requestCode: 'CP0021', organization: 'Management', orgUnit: 'Head Office', type: 'Reimbursement', hasAttachment: true,  category: 'Transportation',  account: 'Main account', amount: 3_421_000,  status: 'Awaiting approval' },
  { id: '2024225915', hasAI: true, anomaly: ['amount'],                         requestDate: '15 Oct 2025', requestTime: '14:00 (GMT+7)', requestBy: 'Abdul Kodir',         requestCode: 'CP0012', organization: 'Legal',      orgUnit: 'Head Office', type: 'Cash advance',   hasAttachment: true,  category: 'Entertainment',   account: 'Main account', amount: 2_500_000,  status: 'Awaiting approval' },
  { id: '20241224123',                                                          requestDate: '14 Oct 2025', requestTime: '14:00 (GMT+7)', requestBy: 'Zainul Abidin',       requestCode: 'CP0010', organization: 'Marketing',  orgUnit: 'Head Office', type: 'Cash advance',   hasAttachment: true,  category: 'Office Supplies', account: 'Main account', amount: 500_000,    status: 'Awaiting settlement' },
  { id: '20241224135',                                                          requestDate: '14 Oct 2025', requestTime: '14:00 (GMT+7)', requestBy: 'Andy Ardiansyah',     requestCode: 'CP0029', organization: 'Sales',      orgUnit: 'Head Office', type: 'Reimbursement', hasAttachment: true,  category: 'Office Supplies', account: 'Main account', amount: 15_000_000, status: 'Approved' },
  { id: '20241224314',                                                          requestDate: '12 Oct 2025', requestTime: '14:00 (GMT+7)', requestBy: 'Asti Jayanti',        requestCode: 'CP0013', organization: 'Sales',      orgUnit: 'Head Office', type: 'Reimbursement', hasAttachment: true,  category: 'Transportation',  account: 'Main account', amount: 60_000,     status: 'Approved' },
  { id: '20241223873',                                                          requestDate: '12 Oct 2025', requestTime: '14:00 (GMT+7)', requestBy: 'Zulfati Imani',       requestCode: 'CP0078', organization: 'Sales',      orgUnit: 'Head Office', type: 'Reimbursement', hasAttachment: true,  category: 'Transportation',  account: 'Main account', amount: 15_000,     status: 'Approved' },
  { id: '20241223132',                                                          requestDate: '12 Oct 2025', requestTime: '14:00 (GMT+7)', requestBy: 'Muhammad Prayoga',    requestCode: 'CP0156', organization: 'Marketing',  orgUnit: 'Head Office', type: 'Reimbursement', hasAttachment: true,  category: 'Transportation',  account: 'Main account', amount: 110_000,    status: 'Approved' },
])

// ─── Filters ──────────────────────────────────────────────────────
const ACCOUNT_OPTIONS = ['Main account', 'Sub account']
const STATUS_OPTIONS  = ['All status', 'Awaiting approval', 'Awaiting settlement', 'Awaiting disbursement', 'Approved', 'Disbursed', 'Settled']
const accountFilter = ref('Main account')
const statusFilter  = ref('All status')
const searchQuery   = ref('')
const monthLabel    = 'Oct 2025'

const filteredRows = computed(() =>
  ROWS.value.filter((r) => {
    const matchesStatus = statusFilter.value === 'All status' || r.status === statusFilter.value
    const q = searchQuery.value.toLowerCase()
    const matchesSearch = !q || r.id.toLowerCase().includes(q) || r.requestBy.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })
)

// ─── Helpers ──────────────────────────────────────────────────────
const formatRp = (n: number) => `Rp${n.toLocaleString('id-ID')}`

// Connector text rendered BEFORE each flagged field, e.g.
// ['amount','vendor','duplication'] → " amount" + ", vendor" + ", and duplication"
function anomalyPrefix(i: number, n: number): string {
  if (i === 0) return ' '
  if (i === n - 1) return n === 2 ? ' and ' : ', and '
  return ', '
}

// ─── Action menu (escapes overflow via fixed teleport) ────────────
const activeActionId = ref<string | null>(null)
const dropdownPos    = ref({ top: '0px', right: '0px' })
const ACTION_OPTIONS = [
  { value: 'view', label: 'View details' },
  { value: 'edit', label: 'Edit' },
]

function toggleActionMenu(id: string, event: MouseEvent) {
  if (activeActionId.value === id) { activeActionId.value = null; return }
  activeActionId.value = id
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  dropdownPos.value = { top: `${rect.bottom + 4}px`, right: `${window.innerWidth - rect.right}px` }
}
// Known category slugs on the claim form; fall back to a populated one so the
// approver edit view always renders a complete claim for the prototype.
const FORM_CATEGORY_SLUGS = ['transportation', 'entertainment', 'equipment', 'office-supplies', 'software']

function handleAction(value: string, row: ClaimTxn) {
  activeActionId.value = null
  if (value === 'view') {
    navigateTo(`/transactions/claims/${row.id}`)
  } else if (value === 'edit') {
    const slug = row.category.toLowerCase().replace(/\s+/g, '-')
    const category = FORM_CATEGORY_SLUGS.includes(slug) ? slug : 'transportation'
    const type = row.type === 'Cash advance' ? 'cash-advance' : 'reimbursement'
    navigateTo(`/transactions/claims/${row.id}/edit?category=${category}&type=${type}`)
  }
}
function onDocumentMousedown(e: MouseEvent) {
  if ((e.target as HTMLElement).closest('[data-action-dropdown]')) return
  activeActionId.value = null
}
onMounted(() => document.addEventListener('mousedown', onDocumentMousedown))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocumentMousedown))

function submitClaim(type: 'reimbursement' | 'cash-advance') {
  navigateTo(`/my-claims/create?type=${type}`)
}

// ─── Styles ───────────────────────────────────────────────────────
const sectionLabel = css({
  fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'dark',
})

// AI anomaly banner
const aiBanner = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4',
  padding: '3', paddingInline: '4', borderRadius: 'md', background: 'orange.50',
})
const aiPill = css({
  display: 'inline-flex', alignItems: 'center', gap: '0',
  paddingInline: '2', paddingBlock: '0.5', borderRadius: 'full',
  background: 'background.brand', color: 'icon.brand',
  fontFamily: 'body', fontSize: 'xs', fontWeight: 'semiBold',
})
const aiPillSm = css({
  display: 'inline-flex', alignItems: 'center', gap: '0',
  paddingInline: '1.5', paddingBlock: '0.5', borderRadius: 'full',
  background: 'background.brand', color: 'icon.brand',
  fontFamily: 'body', fontWeight: 'semiBold',
})
const anomalyBtn = css({
  display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap',
  paddingInline: '3', paddingBlock: '2', borderRadius: 'md', border: 'none', cursor: 'pointer',
  background: 'yellow.300', color: 'dark',
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold',
  _hover: { background: 'yellow.400' },
})

// Filter trigger (matches MpInput outline) — used for the month display
const filterTrigger = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2',
  minWidth: '150px', height: '40px', paddingInline: '3',
  border: '1px solid var(--mp-colors-border-form, rgba(29,31,36,.16))', borderRadius: '6px',
  fontFamily: 'body', fontSize: 'md', color: 'dark', background: 'white', cursor: 'pointer',
})
const iconBtn = css({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '40px', height: '40px', borderRadius: '6px',
  border: '1px solid var(--mp-colors-border-form, rgba(29,31,36,.16))',
  background: 'white', cursor: 'pointer', color: 'gray.600',
  _hover: { background: 'gray.25' },
})

// Table
const tblWrap = css({ width: 'full', overflowX: 'auto' })
const tbl = css({ width: 'full', minWidth: '1180px', borderCollapse: 'collapse' })
const th = css({
  bg: 'gray.25', fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold',
  lineHeight: 'lg', color: 'dark', paddingInline: '3', paddingBlock: '3', height: '44px',
  borderBottom: '1px solid', borderBottomColor: 'gray.100',
  textAlign: 'left', whiteSpace: 'nowrap', verticalAlign: 'middle',
})
const thRight = css({
  bg: 'gray.25', fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold',
  lineHeight: 'lg', color: 'dark', paddingInline: '3', paddingBlock: '3', height: '44px',
  borderBottom: '1px solid', borderBottomColor: 'gray.100',
  textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'middle',
})
const td = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'dark',
  paddingInline: '3', paddingBlock: '3',
  borderBottom: '1px solid', borderBottomColor: 'gray.100', verticalAlign: 'top',
})
const tdRight = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'dark',
  paddingInline: '3', paddingBlock: '3', textAlign: 'right', whiteSpace: 'nowrap',
  borderBottom: '1px solid', borderBottomColor: 'gray.100', verticalAlign: 'top',
})
const cellSub = css({ fontFamily: 'body', fontSize: 'sm', color: 'gray.600', whiteSpace: 'nowrap' })
const metaText = css({ fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'gray.600', whiteSpace: 'nowrap' })

// Anomaly sub-row
const anomalyCell = css({
  background: 'orange.50', paddingInline: '3', paddingBlock: '2',
  borderBottom: '1px solid', borderBottomColor: 'gray.100',
  fontFamily: 'body', fontSize: 'sm', color: 'gray.700',
})

// Action dropdown
const actionMenu = css({
  position: 'fixed', zIndex: '9999', background: 'white',
  border: '1px solid', borderColor: 'gray.100', borderRadius: 'md',
  minWidth: '160px', boxShadow: 'var(--shadows-lg)', overflow: 'hidden',
})
const actionItem = css({
  display: 'block', width: 'full', textAlign: 'left',
  paddingInline: '4', paddingBlock: '2.5', background: 'transparent', border: 'none', cursor: 'pointer',
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'dark',
  _hover: { background: 'gray.25' },
})
</script>

<template>
  <!-- ═════ Header action ═════ -->
  <Teleport to="#layout-header-actions">
    <MpPopover id="submit-claim" use-portal placement="bottom-end" is-close-on-select>
      <MpPopoverTrigger>
        <MpButton variant="primary" size="md" right-icon="caret-down">Submit claim</MpButton>
      </MpPopoverTrigger>
      <MpPopoverContent :class="css({ marginTop: '2px', minWidth: '200px' })">
        <MpPopoverList>
          <MpPopoverListItem @click="submitClaim('reimbursement')">Reimbursement</MpPopoverListItem>
          <MpPopoverListItem @click="submitClaim('cash-advance')">Cash advance</MpPopoverListItem>
        </MpPopoverList>
      </MpPopoverContent>
    </MpPopover>
  </Teleport>

  <!-- ═════ Stage ═════ -->
  <MpFlex direction="column" gap="5" width="full" style="min-width:0;">

    <!-- ═════ Summary boxes ═════ -->
    <div style="overflow-x:auto; width:100%;">
      <div style="display:flex; gap:12px; align-items:flex-start; width:max-content; min-width:100%;">

        <!-- Reimbursement group -->
        <div style="flex:1; display:flex; flex-direction:column; gap:8px;">
          <span :class="sectionLabel">Reimbursement</span>
          <div style="display:flex; gap:8px;">
            <SummaryBox
              v-for="stat in reimbursementStats"
              :key="stat.label"
              :label="stat.label"
              :amount="stat.amount"
              caption="Total"
              :variant="stat.variant"
              style="flex:1 1 0; min-width:170px;"
            />
          </div>
        </div>

        <!-- Section divider -->
        <div style="width:1px; background:var(--mp-colors-gray-100); align-self:stretch; margin-top:26px; flex-shrink:0;"></div>

        <!-- Cash advance group -->
        <div style="flex:1; display:flex; flex-direction:column; gap:8px;">
          <span :class="sectionLabel">Cash advance</span>
          <div style="display:flex; gap:8px;">
            <SummaryBox
              v-for="stat in cashAdvanceStats"
              :key="stat.label"
              :label="stat.label"
              :amount="stat.amount"
              caption="Total"
              :variant="stat.variant"
              style="flex:1 1 0; min-width:170px;"
            />
          </div>
        </div>

      </div>
    </div>

    <!-- ═════ AI anomaly banner ═════ -->
    <div :class="aiBanner">
      <MpFlex align="center" gap="2">
        <span :class="aiPill" style="border: 1px solid var(--mp-colors-border-brand);"><AiIcon size="sm" style="width:16px; height:16px; flex-shrink:0;" /> AI</span>
        <MpText size="body" color="dark">{{ ANOMALY_COUNT }} potential transaction anomalies detected.</MpText>
      </MpFlex>
      <button :class="anomalyBtn" @click="navigateTo('/transactions/claims?view=anomalies')">View anomalies</button>
    </div>

    <!-- ═════ Filter toolbar ═════ -->
    <MpFlex align="center" justify="space-between" gap="3" style="flex-wrap:wrap;">
      <MpFlex align="center" gap="3" style="flex-wrap:wrap;">
        <div style="width:168px;">
          <MpAutocomplete id="filter-account" v-model="accountFilter" :data="ACCOUNT_OPTIONS" placeholder="Main account" />
        </div>
        <button :class="filterTrigger">
          <MpFlex align="center" gap="2">
            <MpIcon name="calendar" size="sm" :class="css({ color: 'gray.600' })" />
            {{ monthLabel }}
          </MpFlex>
        </button>
        <div style="width:150px;">
          <MpAutocomplete id="filter-status" v-model="statusFilter" :data="STATUS_OPTIONS" placeholder="All status" />
        </div>
        <MpTextlink size="body" @click="() => {}" style="cursor:pointer;">All filters</MpTextlink>
      </MpFlex>

      <MpFlex align="center" gap="3" style="flex-shrink:0;">
        <MpButton aria-label="download button" left-icon="download" variant="ghost" />
        <MpInputGroup style="width:240px;flex-shrink:0;">
          <MpInputLeftAddon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#9ca3af">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </MpInputLeftAddon>
          <MpInput v-model="searchQuery" placeholder="Search ID / requester" :isFullWidth="true" />
        </MpInputGroup>
      </MpFlex>
    </MpFlex>

    <!-- ═════ Data table ═════ -->
    <div :class="tblWrap">
      <table :class="tbl">
        <thead>
          <tr>
            <th :class="th">Transaction ID</th>
            <th :class="th">Request date</th>
            <th :class="th">Request by</th>
            <th :class="th">Organization</th>
            <th :class="th">Type</th>
            <th :class="th">Category</th>
            <th :class="th">Account</th>
            <th :class="thRight">Amount</th>
            <th :class="th">Status</th>
            <th :class="th" />
          </tr>
        </thead>
        <tbody>
          <!-- Empty state -->
          <tr v-if="!filteredRows.length">
            <td :class="td" colspan="10" style="border-bottom:none;">
              <MpFlex direction="column" align="center" justify="center" gap="1" style="padding:48px 0;">
                <img src="/images/empty-no-data.png" alt="" width="180" height="150" style="object-fit:contain; margin-bottom:8px;" />
                <MpText weight="semiBold" color="dark" style="font-size:16px; line-height:24px;">{{ EMPTY_TITLE }}</MpText>
                <MpText color="gray.600" style="font-size:14px; line-height:20px; text-align:center;">{{ EMPTY_DESC }}</MpText>
              </MpFlex>
            </td>
          </tr>

          <template v-for="row in filteredRows" :key="row.id">
            <tr>
              <!-- Transaction ID -->
              <td :class="td">
                <MpFlex align="center" gap="1">
                  <MpTextlink size="body" @click="navigateTo(`/transactions/claims/${row.id}`)" style="cursor:pointer; white-space:nowrap;">{{ row.id }}</MpTextlink>
                  <span v-if="row.hasAI" :class="aiPillSm" style="font-size:8px; line-height:1;"><AiIcon size="sm" style="width:12px; height:12px; flex-shrink:0;" /> AI</span>
                </MpFlex>
              </td>
              <!-- Request date -->
              <td :class="td">
                <div style="white-space:nowrap;">{{ row.requestDate }}</div>
                <div :class="cellSub">{{ row.requestTime }}</div>
              </td>
              <!-- Request by -->
              <td :class="td">
                <div style="white-space:nowrap;">{{ row.requestBy }}</div>
                <div :class="cellSub">{{ row.requestCode }}</div>
              </td>
              <!-- Organization -->
              <td :class="td">
                <div style="white-space:nowrap;">{{ row.organization }}</div>
                <div :class="cellSub">{{ row.orgUnit }}</div>
              </td>
              <!-- Type -->
              <td :class="td">
                <div style="white-space:nowrap;">{{ row.type }}</div>
                <MpTextlink v-if="row.hasAttachment" size="body-small" @click="() => {}" style="cursor:pointer;">View attachment</MpTextlink>
                <span v-else :class="cellSub">No attachment</span>
              </td>
              <!-- Category -->
              <td :class="td" style="white-space:nowrap;">{{ row.category }}</td>
              <!-- Account -->
              <td :class="td" style="white-space:nowrap;">{{ row.account }}</td>
              <!-- Amount -->
              <td :class="tdRight">{{ formatRp(row.amount) }}</td>
              <!-- Status -->
              <td :class="td" style="white-space:nowrap;">
                <MpBadge for="tableStatus" :type="STATUS_TYPE[row.status]">{{ row.status }}</MpBadge>
              </td>
              <!-- Action -->
              <td :class="td" style="text-align:right; white-space:nowrap;">
                <MpButton variant="secondary" size="md" right-icon="caret-down" @click.stop="toggleActionMenu(row.id, $event)">Action</MpButton>
                <Teleport to="body">
                  <div v-if="activeActionId === row.id" :class="actionMenu" :style="{ top: dropdownPos.top, right: dropdownPos.right }" data-action-dropdown>
                    <button v-for="opt in ACTION_OPTIONS" :key="opt.value" :class="actionItem" @click.stop="handleAction(opt.value, row)">{{ opt.label }}</button>
                  </div>
                </Teleport>
              </td>
            </tr>

            <!-- Anomaly sub-row -->
            <tr v-if="row.anomaly">
              <td :class="anomalyCell" colspan="10">
                <MpFlex align="center" gap="1">
                  <span :class="css({ color: 'gray.400' })" style="margin-right:2px;">↳</span>
                  <MpText as="span" size="body-small" color="gray.700"
                    >Potential anomalies detected in<template v-for="(field, i) in row.anomaly" :key="field"><span>{{ anomalyPrefix(i, row.anomaly.length) }}</span><MpText as="span" size="body-small" weight="semiBold" color="gray.700">{{ field }}</MpText></template>.</MpText>
                  <MpTextlink size="body-small" @click="navigateTo(`/transactions/claims/${row.id}`)" style="cursor:pointer; font-size:12px !important; font-weight:400; line-height:20px !important;">Review transaction</MpTextlink>
                </MpFlex>
              </td>
            </tr>
          </template>
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
        <span :class="metaText">Showing 1–{{ filteredRows.length }} of {{ ROWS.length }}</span>
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
</template>
