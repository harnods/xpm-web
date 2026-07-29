<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Claims (admin index)
  All company reimbursements and cash advances — monitor approvals and payouts.
  Token mode: Pixel DT 2.4
  Components: MpFlex, MpText, MpButton, MpBadge, PxIcon (all Pixel 3)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-->
<script setup lang="ts">
import {
  MpFlex, MpText, MpButton, MpToggle, MpTextlink, MpBadge,
  MpDrawer, MpDrawerOverlay, MpDrawerContent, MpDrawerHeader,
  MpDrawerCloseButton, MpDrawerBody, MpDrawerFooter,
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
  MpTableContainer, MpTable, MpTableHead, MpTableBody, MpTableRow, MpTableCell,
  css,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Claims',
})

// ─── Status → badge type ─────────────────────────────────────────────
function badgeType(s: string): 'completed' | 'warning' | 'critical' | 'information' | 'announcement' {
  if (['Settled', 'Disbursed', 'Booked', 'Completed', 'Approved', 'Paid'].includes(s)) return 'completed'
  if (['Awaiting approval', 'Awaiting disburse', 'Awaiting payment', 'Booking pending'].includes(s)) return 'warning'
  if (['Declined', 'Rejected', 'Overdue'].includes(s)) return 'critical'
  if (['Trip done · awaiting report', 'Sent', 'Requested'].includes(s)) return 'information'
  if (['Draft', 'Inactive'].includes(s)) return 'announcement'
  return 'announcement'
}

// ─── Types ─────────────────────────────────────────────────────────
type ClaimStatus =
  | 'Settled'
  | 'Disbursed'
  | 'Declined'
  | 'Awaiting disburse'
  | 'Awaiting approval'

interface ClaimRow {
  id: string
  date: string
  type: string
  category: string
  categorySub: string
  status: ClaimStatus
  amount: string
  flagged?: boolean
}

// ─── Mock rows ──────────────────────────────────────────────────────
const rows: ClaimRow[] = [
  { id: '2026070210', date: '9 Jul 2026',  type: 'Cash advance',   category: 'Cash advance', categorySub: 'Event cash float — roadshow',       status: 'Settled',            amount: 'Rp 516.000' },
  { id: '2026072042', date: '12 Jul 2026', type: 'Reimbursement',  category: 'Transport',    categorySub: 'Grab to client office',            status: 'Disbursed',          amount: 'Rp 64.500' },
  { id: '2026072064', date: '14 Jul 2026', type: 'Reimbursement',  category: 'Travel',       categorySub: 'Hotel minibar',                    status: 'Declined',           amount: 'Rp 41.300' },
  { id: '2026072071', date: '15 Jul 2026', type: 'Reimbursement',  category: 'Equipment',    categorySub: 'Monitor for home office',           status: 'Awaiting disburse',  amount: 'Rp 249.000' },
  { id: '2026072088', date: '18 Jul 2026', type: 'Reimbursement',  category: 'Software',     categorySub: 'Adobe Creative Cloud renewal',     status: 'Awaiting approval',  amount: 'Rp 59.990',    flagged: true },
  { id: '2026072086', date: '18 Jul 2026', type: 'Reimbursement',  category: 'Events',       categorySub: 'Team offsite venue deposit',       status: 'Awaiting approval',  amount: 'Rp 1.250.000', flagged: true },
  { id: '2026070219', date: '18 Jul 2026', type: 'Cash advance',   category: 'Cash advance', categorySub: 'Trade show cash float',            status: 'Awaiting approval',  amount: 'Rp 750.000',   flagged: true },
  { id: '2026072093', date: '19 Jul 2026', type: 'Reimbursement',  category: 'Meals',        categorySub: 'Client dinner — Nobu Downtown',    status: 'Awaiting approval',  amount: 'Rp 184.000',   flagged: true },
  { id: '2026072094', date: '19 Jul 2026', type: 'Reimbursement',  category: 'Travel',       categorySub: 'Flight SFO → JFK, onsite week',    status: 'Awaiting approval',  amount: 'Rp 412.500' },
  { id: '2026072097', date: '20 Jul 2026', type: 'Reimbursement',  category: 'Events',       categorySub: 'Conference pass — SaaStr Annual',  status: 'Awaiting approval',  amount: 'Rp 899.000' },
  { id: '2026070221', date: '20 Jul 2026', type: 'Cash advance',   category: 'Cash advance', categorySub: 'Per diem — client roadshow',       status: 'Awaiting approval',  amount: 'Rp 400.000' },
  { id: '2026072101', date: '22 Jul 2026', type: 'Reimbursement',  category: 'Transport',    categorySub: 'Ride share — client visit',        status: 'Awaiting approval',  amount: 'Rp 22.400' },
]

// ─── Interactivity: state ───────────────────────────────────────────
const STATUS_OPTIONS: ClaimStatus[] = [
  'Settled', 'Disbursed', 'Declined', 'Awaiting disburse', 'Awaiting approval',
]

// Toolbar dropdowns
const MONTH_OPTIONS = ['Jul 2026', 'Jun 2026', 'May 2026']
const STATUS_MENU = ['All status', ...STATUS_OPTIONS]
const SORT_OPTIONS = ['Sort: Oldest first', 'Sort: Newest first']
const monthSel = ref('Jul 2026')
const sortBy = ref('Sort: Oldest first')

// "All status" dropdown → drives the visible rows.
const statusFilter = ref('All status')

const filteredRows = computed(() =>
  statusFilter.value === 'All status'
    ? rows
    : rows.filter(r => r.status === statusFilter.value),
)

// Drawers
const filtersOpen = ref(false)
const policyOpen  = ref(false)

// "All filters" drawer — reference shell; local pill selections (Apply/Reset only).
const fClaimType = ref<string | null>(null)
const fStatus    = ref<string | null>(null)
const fPeriod    = ref<string | null>(null)
function resetFilters() { fClaimType.value = null; fStatus.value = null; fPeriod.value = null }

// "Claim policy" drawer — inferred, reference-consistent (static demo data).
const receiptRequired  = ref(true)
const policyCaps = [
  { name: 'Meals',         cap: 'Rp 200.000 / day' },
  { name: 'Transport',     cap: 'Rp 500.000 / week' },
  { name: 'Accommodation', cap: 'Rp 1.500.000 / night' },
  { name: 'Software',      cap: 'Rp 5.000.000 / month' },
]

// ─── CSS ────────────────────────────────────────────────────────────
const searchWrap = css({
  display: 'flex', alignItems: 'center', gap: '2',
  width: '240px', flexShrink: 0, minHeight: '32px', paddingInline: '2.5',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.form',
  borderRadius: 'md', background: 'background.neutral',
  _focusWithin: { boxShadow: 'focus', borderColor: 'border.focused' },
})
const searchInput = css({
  flex: '1 1 auto', minWidth: 0, border: 'none', outline: 'none',
  background: 'transparent', fontFamily: 'body', fontSize: 'sm', color: 'text.default',
  _placeholder: { color: 'text.secondary' },
})

const link      = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.link', whiteSpace: 'nowrap' })
const catMain    = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.default' })
const catSub     = css({ fontFamily: 'body', fontSize: 'xs', color: 'text.secondary' })
const amount     = css({ fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.default', whiteSpace: 'nowrap', textAlign: 'right' })
const footText   = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary', whiteSpace: 'nowrap' })

// Drawer section blocks
const sectionLabel = css({ fontFamily: 'body', fontSize: 'xs', fontWeight: 'semiBold', letterSpacing: 'wide', textTransform: 'uppercase', color: 'text.secondary' })
const fieldLabel   = css({ fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.default' })
const helpText     = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })

// Selectable pill (used across filter groups)
const pill = css({
  fontFamily: 'body', fontSize: 'sm', lineHeight: 'lg',
  paddingInline: '3', paddingBlock: '1.5', borderRadius: 'full',
  borderWidth: '1px', borderStyle: 'solid', cursor: 'pointer',
  whiteSpace: 'nowrap', background: 'transparent',
})
const pillOff = css({ borderColor: 'border.default', color: 'text.default' })
const pillOn  = css({ borderColor: 'border.focused', color: 'text.link', background: 'background.brand.selected' })

// Policy caps list
const capRow = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4',
  paddingBlock: '2.5',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
})
const policyInput = css({
  minHeight: '32px', paddingInline: '2.5', width: '160px',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.form', borderRadius: 'md',
  background: 'background.neutral', fontFamily: 'body', fontSize: 'sm', color: 'text.default',
  outline: 'none', _focus: { boxShadow: 'focus', borderColor: 'border.focused' },
})
</script>

<template>
  <!-- ═════ Header CTA ═════ -->
  <Teleport to="#layout-header-actions">
    <MpButton variant="primary" size="md" @click="policyOpen = true">Manage claim policy</MpButton>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" min-width="0">

    <!-- ═════ Toolbar ═════ -->
    <MpFlex align="center" justify="space-between" gap="3" wrap="wrap">

      <!-- Left -->
      <MpFlex align="center" gap="2" wrap="wrap">
        <MpPopover id="claims-month" placement="bottom-start" is-close-on-select>
          <MpPopoverTrigger>
            <MpButton variant="secondary" size="sm" right-icon="caret-down">{{ monthSel }}</MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent :class="css({ minWidth: '180px' })">
            <MpPopoverList>
              <MpPopoverListItem v-for="o in MONTH_OPTIONS" :key="o" :is-active="monthSel === o" @click="monthSel = o">{{ o }}</MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </MpPopover>

        <!-- Working status filter -->
        <MpPopover id="claims-status" placement="bottom-start" is-close-on-select>
          <MpPopoverTrigger>
            <MpButton variant="secondary" size="sm" right-icon="caret-down">{{ statusFilter }}</MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent :class="css({ minWidth: '180px' })">
            <MpPopoverList>
              <MpPopoverListItem v-for="o in STATUS_MENU" :key="o" :is-active="statusFilter === o" @click="statusFilter = o">{{ o }}</MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </MpPopover>

        <MpButton variant="secondary" size="sm" left-icon="filter" @click="filtersOpen = true">Filters</MpButton>
      </MpFlex>

      <!-- Right -->
      <MpFlex align="center" gap="2" wrap="wrap">
        <MpPopover id="claims-sort" placement="bottom-start" is-close-on-select>
          <MpPopoverTrigger>
            <MpButton variant="secondary" size="sm" right-icon="caret-down">{{ sortBy }}</MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent :class="css({ minWidth: '180px' })">
            <MpPopoverList>
              <MpPopoverListItem v-for="o in SORT_OPTIONS" :key="o" :is-active="sortBy === o" @click="sortBy = o">{{ o }}</MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </MpPopover>
        <MpButton variant="secondary" size="sm" left-icon="download">Export</MpButton>
        <label :class="searchWrap">
          <PxIcon name="search" :size="16" color="icon.subtle" />
          <input :class="searchInput" type="text" placeholder="Search transaction id…" />
        </label>
      </MpFlex>

    </MpFlex>

    <!-- ═════ Data table ═════ -->
    <MpTableContainer :class="css({ width: 'full' })">
      <MpTable>
        <MpTableHead>
          <MpTableRow>
            <MpTableCell scope="col">Transaction ID</MpTableCell>
            <MpTableCell scope="col">Request date</MpTableCell>
            <MpTableCell scope="col">Claim type</MpTableCell>
            <MpTableCell scope="col">Claim category</MpTableCell>
            <MpTableCell scope="col">Status</MpTableCell>
            <MpTableCell scope="col" />
            <MpTableCell scope="col" :class="css({ textAlign: 'right' })">Amount</MpTableCell>
          </MpTableRow>
        </MpTableHead>
        <MpTableBody>
          <MpTableRow v-for="row in filteredRows" :key="row.id">
            <!-- Transaction ID -->
            <MpTableCell as="td" scope="row">
              <a href="#" :class="link">{{ row.id }}</a>
            </MpTableCell>

            <!-- Request date -->
            <MpTableCell as="td" scope="row">{{ row.date }}</MpTableCell>

            <!-- Claim type -->
            <MpTableCell as="td" scope="row">{{ row.type }}</MpTableCell>

            <!-- Claim category -->
            <MpTableCell as="td" scope="row">
              <div :class="css({ display: 'flex', flexDirection: 'column', gap: '2px' })">
                <span :class="catMain">{{ row.category }}</span>
                <span :class="catSub">{{ row.categorySub }}</span>
              </div>
            </MpTableCell>

            <!-- Status -->
            <MpTableCell as="td" scope="row">
              <MpBadge for="tableStatus" :type="badgeType(row.status)">{{ row.status }}</MpBadge>
            </MpTableCell>

            <!-- Warning flag -->
            <MpTableCell as="td" scope="row" :class="css({ textAlign: 'center' })">
              <PxIcon v-if="row.flagged" name="warning-triangle" :size="16" color="icon.warning" />
            </MpTableCell>

            <!-- Amount -->
            <MpTableCell as="td" scope="row" :class="css({ textAlign: 'right' })">
              <span :class="amount">{{ row.amount }}</span>
            </MpTableCell>
          </MpTableRow>
        </MpTableBody>
      </MpTable>
    </MpTableContainer>

    <!-- ═════ Footer ═════ -->
    <MpFlex align="center" justify="space-between" paddingInline="1">
      <span :class="footText">Showing {{ filteredRows.length }} of {{ rows.length }}</span>
      <MpFlex align="center" gap="6">
        <span :class="footText">Rows per page: 10</span>
        <span :class="footText">Page 1 of 1</span>
      </MpFlex>
    </MpFlex>

  </MpFlex>

  <!-- ═════ Drawer: All filters (reference shell) ═════ -->
  <MpDrawer id="claims-filters" :is-open="filtersOpen" size="md" placement="right" is-block-scroll-on-mount @close="filtersOpen = false">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <MpText weight="semiBold" font-size="16px" line-height="24px">All filters</MpText>
        <MpDrawerCloseButton />
      </MpDrawerHeader>

      <MpDrawerBody>
        <MpFlex direction="column" gap="5" width="full">

          <!-- Claim type -->
          <MpFlex direction="column" gap="2">
            <span :class="fieldLabel">Claim type</span>
            <MpFlex align="center" gap="2" wrap="wrap">
              <button
                v-for="t in ['Reimbursement', 'Cash advance']"
                :key="t"
                :class="[pill, fClaimType === t ? pillOn : pillOff]"
                @click="fClaimType = fClaimType === t ? null : t"
              >{{ t }}</button>
            </MpFlex>
          </MpFlex>

          <!-- Status -->
          <MpFlex direction="column" gap="2">
            <span :class="fieldLabel">Status</span>
            <MpFlex align="center" gap="2" wrap="wrap">
              <button
                v-for="s in STATUS_OPTIONS"
                :key="s"
                :class="[pill, fStatus === s ? pillOn : pillOff]"
                @click="fStatus = fStatus === s ? null : s"
              >{{ s }}</button>
            </MpFlex>
          </MpFlex>

          <!-- Period -->
          <MpFlex direction="column" gap="2">
            <span :class="sectionLabel">Period</span>
            <MpFlex align="center" gap="2" wrap="wrap">
              <button
                v-for="p in ['This month', 'Last month', 'Last 90 days', 'This year', 'Custom']"
                :key="p"
                :class="[pill, fPeriod === p ? pillOn : pillOff]"
                @click="fPeriod = fPeriod === p ? null : p"
              >{{ p }}</button>
            </MpFlex>
          </MpFlex>

        </MpFlex>
      </MpDrawerBody>

      <MpDrawerFooter>
        <MpFlex align="center" justify="space-between" width="full">
          <MpTextlink size="body" cursor="pointer" @click="resetFilters">Reset filter</MpTextlink>
          <MpFlex gap="2">
            <MpButton variant="ghost" @click="filtersOpen = false">Cancel</MpButton>
            <MpButton variant="primary" @click="filtersOpen = false">Apply</MpButton>
          </MpFlex>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>

  <!-- ═════ Drawer: Claim policy (INFERRED — no reference screen; reference-consistent) ═════ -->
  <MpDrawer id="claims-policy" :is-open="policyOpen" size="md" placement="right" is-block-scroll-on-mount @close="policyOpen = false">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <MpText weight="semiBold" font-size="16px" line-height="24px">Claim policy</MpText>
        <MpDrawerCloseButton />
      </MpDrawerHeader>

      <MpDrawerBody>
        <MpFlex direction="column" gap="5" width="full">

          <!-- Categories & caps -->
          <MpFlex direction="column" gap="2">
            <span :class="sectionLabel">Categories &amp; caps</span>
            <div>
              <div v-for="c in policyCaps" :key="c.name" :class="capRow">
                <span :class="fieldLabel">{{ c.name }}</span>
                <span :class="helpText">{{ c.cap }}</span>
              </div>
            </div>
          </MpFlex>

          <!-- Receipt required -->
          <MpFlex align="center" justify="space-between" gap="4">
            <MpFlex direction="column" gap="0.5" min-width="0">
              <span :class="fieldLabel">Receipt required</span>
              <span :class="helpText">Claims must include an attached receipt.</span>
            </MpFlex>
            <MpToggle v-model:is-checked="receiptRequired" />
          </MpFlex>

          <!-- Auto-approve threshold -->
          <MpFlex align="center" justify="space-between" gap="4">
            <MpFlex direction="column" gap="0.5" min-width="0">
              <span :class="fieldLabel">Auto-approve threshold</span>
              <span :class="helpText">Claims below this amount skip approval.</span>
            </MpFlex>
            <input :class="policyInput" type="text" value="Rp 100.000" />
          </MpFlex>

          <!-- Approval routing note -->
          <MpFlex direction="column" gap="1">
            <span :class="fieldLabel">Approval routing</span>
            <span :class="helpText">Claims above the threshold route to the requester's direct manager, then Finance for disbursement.</span>
          </MpFlex>

        </MpFlex>
      </MpDrawerBody>

      <MpDrawerFooter>
        <MpFlex justify="flex-end" gap="2" width="full">
          <MpButton variant="ghost" @click="policyOpen = false">Cancel</MpButton>
          <MpButton variant="primary" @click="policyOpen = false">Save policy</MpButton>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>
</template>
