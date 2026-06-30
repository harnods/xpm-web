<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — My claims (index)
  Source: Screenshot (app.expense.mekari.com/expenses)
  Token mode: Pixel 2.4
  Patterns used: layout-shell, index-view, filter-toolbar, data-table-with-pagination
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STATES INCLUDED:
    - Happy path: 10 mock rows, status filter + search
    - Request claim dropdown: Reimbursement / Reimbursement - Upload file (Beta) / Cash advance
    - Summary cards: Reimbursement + Cash advance groups

  OPEN ITEMS:
    - Date picker (static display for prototype — shows "Jun 2026")
    - "All filters" drawer
    - "My limits" modal/drawer
    - Loading skeleton + empty state
    - Row click → claim detail page (route /my-claims/[id] not yet created)
-->
<script setup lang="ts">
import {
  MpFlex, MpText, MpTextlink,
  MpButton, MpBadge,
  MpAutocomplete,
  MpInputGroup, MpInputLeftAddon, MpInput,
  MpBanner, MpBannerIcon, MpBannerDescription, MpBannerLink,
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
  css,
} from '@mekari/pixel3'

definePageMeta({ title: 'My claims' })

// ─── Types ─────────────────────────────────────────────────────────
type ClaimStatus = 'Awaiting approval' | 'Awaiting disbursement' | 'Awaiting settlement' | 'Disbursed' | 'Settled'
type ClaimType   = 'Reimbursement' | 'Reimbursement - Upload file' | 'Cash advance'

interface ClaimRow {
  id: string
  requestDate: string
  requestTime: string
  claimType: ClaimType
  claimCategory: string
  status: ClaimStatus
  amount: string
}

// ─── Summary stats ──────────────────────────────────────────────────
const reimbursementStats = [
  { label: 'Awaiting approval',     amount: 'Rp21.092.424', variant: 'orange' },
  { label: 'Awaiting disbursement', amount: 'Rp1.238.823',  variant: 'blue'   },
  { label: 'Disbursed',             amount: 'Rp741.000',    variant: 'green'  },
]

const cashAdvanceStats = [
  { label: 'Awaiting approval',     amount: 'Rp55.000',    variant: 'orange' },
  { label: 'Awaiting disbursement', amount: 'Rp1.317.260', variant: 'blue'   },
  { label: 'Settled',               amount: 'Rp35.000',    variant: 'green'  },
]

// ─── Mock rows ──────────────────────────────────────────────────────
const rows = ref<ClaimRow[]>([
  { id: '20260608747', requestDate: '10 Jun 2026', requestTime: '14:37 (GMT+7)', claimType: 'Cash advance',  claimCategory: 'Office supplies', status: 'Awaiting settlement',  amount: 'Rp20.000' },
  { id: '20260608746', requestDate: '10 Jun 2026', requestTime: '14:37 (GMT+7)', claimType: 'Cash advance',  claimCategory: 'Travel',          status: 'Awaiting disbursement', amount: 'Rp20.000' },
  { id: '20260608745', requestDate: '10 Jun 2026', requestTime: '14:37 (GMT+7)', claimType: 'Cash advance',  claimCategory: 'Meals',           status: 'Awaiting disbursement', amount: 'Rp20.000' },
  { id: '20260608744', requestDate: '10 Jun 2026', requestTime: '14:37 (GMT+7)', claimType: 'Cash advance',  claimCategory: 'Entertainment',   status: 'Awaiting disbursement', amount: 'Rp20.000' },
  { id: '20260608743', requestDate: '10 Jun 2026', requestTime: '14:37 (GMT+7)', claimType: 'Cash advance',  claimCategory: 'Office supplies', status: 'Awaiting disbursement', amount: 'Rp20.000' },
  { id: '20260608742', requestDate: '10 Jun 2026', requestTime: '14:37 (GMT+7)', claimType: 'Cash advance',  claimCategory: 'Transport',       status: 'Awaiting disbursement', amount: 'Rp15.000' },
  { id: '20260608741', requestDate: '10 Jun 2026', requestTime: '14:37 (GMT+7)', claimType: 'Reimbursement', claimCategory: 'Meals',           status: 'Awaiting disbursement', amount: 'Rp20.000' },
  { id: '20260608740', requestDate: '10 Jun 2026', requestTime: '14:37 (GMT+7)', claimType: 'Cash advance',  claimCategory: 'Entertainment',   status: 'Awaiting disbursement', amount: 'Rp20.000' },
  { id: '20260608739', requestDate: '10 Jun 2026', requestTime: '14:37 (GMT+7)', claimType: 'Reimbursement', claimCategory: 'Office tools',    status: 'Awaiting disbursement', amount: 'Rp20.000' },
  { id: '20260608738', requestDate: '10 Jun 2026', requestTime: '14:37 (GMT+7)', claimType: 'Cash advance',  claimCategory: 'Equipment',       status: 'Awaiting approval',     amount: 'Rp5.000'  },
])

// ─── Filter & search ────────────────────────────────────────────────
const STATUS_OPTIONS = ['All status', 'Awaiting approval', 'Awaiting disbursement', 'Awaiting settlement', 'Disbursed', 'Settled']
const statusFilter   = ref('All status')
const searchQuery    = ref('')
const selectedMonth  = ref('Jun 2026')

// My limits drawer
const showLimits = ref(false)

const filteredRows = computed(() =>
  rows.value.filter(row => {
    const matchStatus = statusFilter.value === 'All status' || row.status === statusFilter.value
    const matchSearch = !searchQuery.value ||
      row.id.includes(searchQuery.value) ||
      row.claimCategory.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchStatus && matchSearch
  })
)

// ─── Action menu ────────────────────────────────────────────────────
const activeActionId = ref<string | null>(null)
const dropdownPos    = ref({ top: '0px', right: '0px' })

const ACTION_OPTIONS = [
  { value: 'view',   label: 'View details' },
  { value: 'edit',   label: 'Edit'         },
]

// Known category slugs on the claim form; fall back to a populated one so the
// requester edit view always renders a complete claim for the prototype.
const FORM_CATEGORY_SLUGS = ['transportation', 'entertainment', 'equipment', 'office-supplies', 'software']

function onAction(value: string, row: ClaimRow) {
  activeActionId.value = null
  if (value === 'view') {
    navigateTo(`/my-claims/${row.id}`)
  } else if (value === 'edit') {
    const slug = row.claimCategory.toLowerCase().replace(/\s+/g, '-')
    const category = FORM_CATEGORY_SLUGS.includes(slug) ? slug : 'transportation'
    const type = row.claimType === 'Cash advance' ? 'cash-advance' : 'reimbursement'
    navigateTo(`/my-claims/${row.id}/edit?category=${category}&type=${type}`)
  }
  // 'delete' is out of scope for this prototype
}

function toggleActionMenu(id: string, event: MouseEvent) {
  if (activeActionId.value === id) { activeActionId.value = null; return }
  activeActionId.value = id
  const btn  = event.currentTarget as HTMLElement
  const rect = btn.getBoundingClientRect()
  dropdownPos.value = {
    top:   `${rect.bottom + 4}px`,
    right: `${Math.max(8, window.innerWidth - rect.right)}px`,
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

// ─── Status helpers ──────────────────────────────────────────────────
// MpBadge type per status: anything "Awaiting …" is a warning, settled/disbursed are completed
function statusType(s: ClaimStatus): string {
  if (s.includes('Awaiting')) return 'warning'
  if (s === 'Disbursed' || s === 'Settled') return 'completed'
  return 'information'
}

// ─── CSS ────────────────────────────────────────────────────────────
const sectionLabel = css({
  fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'dark',
})

const filterTrigger = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  gap: '2', minWidth: '120px', minHeight: '40px',
  border: '1px solid var(--mp-colors-border-form, rgba(29,31,36,.16))',
  borderRadius: '6px', paddingX: '3',
  fontFamily: 'body', fontSize: 'md', color: 'dark',
  background: 'white', cursor: 'pointer', outline: 'none',
  _focusVisible: { boxShadow: 'focus', borderColor: 'border.focused' },
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
const bannerBtn = css({
  display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap',
  paddingInline: '3', paddingBlock: '2', borderRadius: 'md', border: 'none', cursor: 'pointer',
  background: 'yellow.300', color: 'dark',
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold',
  _hover: { background: 'yellow.400' },
})
</script>

<template>
  <!-- ═════ Header CTAs ═════ -->
  <Teleport to="#layout-header-actions">
    <MpFlex align="center" gap="2">
      <MpButton variant="secondary" size="md" left-icon="policy" @click="showLimits = true">My limits</MpButton>
      <MpPopover id="request-claim-menu" use-portal placement="bottom-end" is-close-on-select>
        <MpPopoverTrigger>
          <MpButton variant="primary" size="md" right-icon="caret-down">Request claim</MpButton>
        </MpPopoverTrigger>
        <MpPopoverContent :class="css({ marginTop: '2px', minWidth: '240px' })">
          <MpPopoverList>
            <MpPopoverListItem @click="navigateTo('/my-claims/create?type=reimbursement')">
              Reimbursement
            </MpPopoverListItem>
            <MpPopoverListItem @click="navigateTo('/my-claims/create?type=reimbursement-upload')">
              <MpFlex align="center" justify="space-between" width="full">
                <span>Reimbursement - Upload file</span>
                <MpBadge for="tableStatus" type="information">Beta</MpBadge>
              </MpFlex>
            </MpPopoverListItem>
            <MpPopoverListItem @click="navigateTo('/my-claims/create?type=cash-advance')">
              Cash advance
            </MpPopoverListItem>
          </MpPopoverList>
        </MpPopoverContent>
      </MpPopover>
    </MpFlex>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" style="min-width:0;">

    <!-- ═════ Warning banner ═════ -->
    <MpBanner id="banner-wtm" variant="warning" is-inline>
      <MpBannerIcon id="banner-wtm-icon" />
      <MpBannerDescription id="banner-wtm-desc">
        1,271 claims are awaiting refund or settlement and need your action.
      </MpBannerDescription>
      <MpBannerLink id="banner-wtm-link">
        <button :class="bannerBtn">View</button>
      </MpBannerLink>
    </MpBanner>

    <!-- ═════ Summary cards ═════ -->
    <!--
      Scroll strategy:
        outer  — overflow-x:auto, clips to page width
        inner  — width:max-content + min-width:100%
                   · min-width:100% → fills outer on wide screens → groups grow via flex:1
                   · width:max-content → natural size on narrow screens → overflows outer → scroll
        groups — flex:1 + NO min-width:0 override → natural min-content pushes inner wider
        cards  — flex:1 1 0; min-width:170px (enough for longest amount at h2 without wrap)
    -->
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

    <!-- ═════ Filter toolbar ═════ -->
    <MpFlex align="center" justify="space-between" gap="3" style="flex-wrap:wrap;">

      <!-- Left: date + status + all filters + OCR credit -->
      <MpFlex align="center" gap="2" style="flex-wrap:wrap;">

        <!-- Date picker (static for prototype) -->
        <button :class="filterTrigger" style="min-width:120px; width:auto;">
          <span>{{ selectedMonth }}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
            style="color:var(--mp-colors-gray-400);flex-shrink:0;">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </button>

        <!-- Status filter -->
        <div style="width:180px;">
          <MpAutocomplete
            id="filter-status"
            v-model="statusFilter"
            :data="STATUS_OPTIONS"
            placeholder="All status"
          />
        </div>

        <!-- All filters -->
        <MpButton variant="textLink" size="md">All filters</MpButton>

        <!-- OCR credit — Beaker indicator -->
        <Beaker
          variant="transactional"
          :progress="80"
          progress-color="green.400"
          label="OCR credit"
          value="239"
        />

      </MpFlex>

      <!-- Right: Search -->
      <MpInputGroup style="width:240px;flex-shrink:0;">
        <MpInputLeftAddon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#9ca3af;">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </MpInputLeftAddon>
        <MpInput
          v-model="searchQuery"
          placeholder="Search transaction id..."
          :isFullWidth="true"
        />
      </MpInputGroup>

    </MpFlex>

    <!-- ═════ Data table ═════ -->
    <div :class="tblWrap" ref="tblWrapRef">
      <table :class="tbl">
        <thead>
          <tr>
            <th :class="th">Transaction ID</th>
            <th :class="th">Request date</th>
            <th :class="th">Claim type</th>
            <th :class="th">Claim category</th>
            <th :class="th">Status</th>
            <th :class="th" style="text-align:right;">Amount</th>
            <th :class="th"></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in filteredRows" :key="row.id">

            <!-- Transaction ID -->
            <td :class="td" style="white-space:nowrap;">
              <MpTextlink @click="navigateTo(`/my-claims/${row.id}`)" style="cursor:pointer;">
                {{ row.id }}
              </MpTextlink>
            </td>

            <!-- Request date -->
            <td :class="td" style="white-space:nowrap;">
              <MpText size="body" color="dark">{{ row.requestDate }}</MpText>
              <div><span :class="metaText">{{ row.requestTime }}</span></div>
            </td>

            <!-- Claim type -->
            <td :class="td" style="white-space:nowrap;">
              <MpText size="body" color="dark">{{ row.claimType }}</MpText>
            </td>

            <!-- Claim category -->
            <td :class="td">
              <MpText size="body" color="dark">{{ row.claimCategory }}</MpText>
            </td>

            <!-- Status -->
            <td :class="td" style="white-space:nowrap;">
              <MpBadge for="tableStatus" :type="statusType(row.status)">
                {{ row.status }}
              </MpBadge>
            </td>

            <!-- Amount — right-aligned per Mekari number convention -->
            <td :class="td" style="text-align:right; white-space:nowrap;">
              <MpText size="body" color="dark">{{ row.amount }}</MpText>
            </td>

            <!-- Actions -->
            <td :class="td" style="text-align:right; white-space:nowrap;">
              <MpButton variant="secondary" size="md" rightIcon="caret-down"
                @click.stop="toggleActionMenu(row.id, $event)">Actions</MpButton>

              <Teleport to="body">
                <div v-if="activeActionId === row.id" :class="actionMenu"
                  :style="{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right }"
                  data-action-dropdown>
                  <button v-for="opt in ACTION_OPTIONS" :key="opt.value"
                    :class="opt.danger ? actionItemDanger : actionItem"
                    @click.stop="onAction(opt.value, row)">
                    {{ opt.label }}
                  </button>
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
        <span :class="metaText">Showing 1–{{ filteredRows.length }} of 217</span>
      </MpFlex>

      <MpFlex align="center" gap="4">
        <MpFlex align="center" gap="3">
          <MpButton variant="secondary" size="sm" rightIcon="caret-down" style="width:64px;">1</MpButton>
          <span :class="metaText">of 22 page</span>
        </MpFlex>
        <MpFlex align="center" gap="2">
          <MpButton variant="ghost" size="sm" leftIcon="chevrons-left" aria-label="Previous page" />
          <MpButton variant="ghost" size="sm" leftIcon="chevrons-right" aria-label="Next page" />
        </MpFlex>
      </MpFlex>

    </MpFlex>

  </MpFlex>

  <!-- ═════ My limits drawer ═════ -->
  <MyLimitsDrawer :is-open="showLimits" @close="showLimits = false" />
</template>
