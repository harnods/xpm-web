<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Claims (admin index)
  All company reimbursements and cash advances — monitor approvals and payouts.
  Token mode: Pixel DT 2.4
  Components: MpFlex, MpText, MpButton, MpBadge, PxIcon (all Pixel 3)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-->
<script setup lang="ts">
import { MpFlex, MpText, MpButton, css } from '@mekari/pixel3'

definePageMeta({
  title: 'Claims',
  subtitle: 'All company reimbursements and cash advances — monitor approvals and payouts.',
})

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

// ─── Status → dot color ─────────────────────────────────────────────
const STATUS_DOT: Record<ClaimStatus, string> = {
  'Settled':           'var(--mp-colors-icon-success)',
  'Disbursed':         'var(--mp-colors-icon-success)',
  'Declined':          'var(--mp-colors-icon-danger)',
  'Awaiting disburse': 'var(--mp-colors-blue-600)',
  'Awaiting approval': 'var(--mp-colors-icon-warning)',
}

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

const tblWrap = css({ w: 'full', overflowX: 'auto' })
const tbl = css({ w: 'full', tableLayout: 'auto', borderCollapse: 'collapse' })

const th = css({
  bg: 'background.neutral.subtle',
  fontFamily: 'body', fontSize: 'xs', fontWeight: 'semiBold',
  letterSpacing: 'wide', color: 'text.secondary',
  paddingInline: '3', paddingBlock: '2.5', h: '40px',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
  textAlign: 'left', whiteSpace: 'nowrap', verticalAlign: 'middle', textTransform: 'uppercase',
})

const td = css({
  fontFamily: 'body', fontSize: 'sm', color: 'text.default',
  paddingInline: '3', paddingBlock: '3',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
  verticalAlign: 'middle',
})

const link      = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.link', whiteSpace: 'nowrap' })
const catMain    = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.default' })
const catSub     = css({ fontFamily: 'body', fontSize: 'xs', color: 'text.secondary' })
const statusText = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.default', whiteSpace: 'nowrap' })
const dot        = css({ w: '8px', h: '8px', borderRadius: 'full', flexShrink: 0, display: 'inline-block' })
const amount     = css({ fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.default', whiteSpace: 'nowrap', textAlign: 'right' })
const footText   = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary', whiteSpace: 'nowrap' })
</script>

<template>
  <!-- ═════ Header CTA ═════ -->
  <Teleport to="#layout-header-actions">
    <MpButton variant="primary" size="md">Manage claim policy</MpButton>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" style="min-width:0;">

    <!-- ═════ Toolbar ═════ -->
    <MpFlex align="center" justify="space-between" gap="3" style="flex-wrap:wrap;">

      <!-- Left -->
      <MpFlex align="center" gap="2" style="flex-wrap:wrap;">
        <MpButton variant="secondary" size="sm" right-icon="caret-down">Jul 2026</MpButton>
        <MpButton variant="secondary" size="sm" right-icon="caret-down">All status</MpButton>
        <MpButton variant="secondary" size="sm" left-icon="filter">Filters</MpButton>
      </MpFlex>

      <!-- Right -->
      <MpFlex align="center" gap="2" style="flex-wrap:wrap;">
        <MpButton variant="secondary" size="sm" right-icon="caret-down">Sort: Oldest first</MpButton>
        <MpButton variant="secondary" size="sm" left-icon="download">Export</MpButton>
        <label :class="searchWrap">
          <PxIcon name="search" :size="16" color="icon.subtle" />
          <input :class="searchInput" type="text" placeholder="Search transaction id…" />
        </label>
      </MpFlex>

    </MpFlex>

    <!-- ═════ Data table ═════ -->
    <div :class="tblWrap">
      <table :class="tbl">
        <thead>
          <tr>
            <th :class="th">Transaction ID</th>
            <th :class="th">Request date</th>
            <th :class="th">Claim type</th>
            <th :class="th">Claim category</th>
            <th :class="th">Status</th>
            <th :class="th" style="width:32px;"></th>
            <th :class="th" style="text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <!-- Transaction ID -->
            <td :class="td" style="white-space:nowrap;">
              <a href="#" :class="link">{{ row.id }}</a>
            </td>

            <!-- Request date -->
            <td :class="td" style="white-space:nowrap;">{{ row.date }}</td>

            <!-- Claim type -->
            <td :class="td" style="white-space:nowrap;">{{ row.type }}</td>

            <!-- Claim category -->
            <td :class="td">
              <div style="display:flex;flex-direction:column;gap:2px;">
                <span :class="catMain">{{ row.category }}</span>
                <span :class="catSub">{{ row.categorySub }}</span>
              </div>
            </td>

            <!-- Status -->
            <td :class="td" style="white-space:nowrap;">
              <span style="display:inline-flex;align-items:center;gap:8px;">
                <span :class="dot" :style="{ background: STATUS_DOT[row.status] }" />
                <span :class="statusText">{{ row.status }}</span>
              </span>
            </td>

            <!-- Warning flag -->
            <td :class="td" style="text-align:center;width:32px;">
              <PxIcon v-if="row.flagged" name="warning-triangle" :size="16" color="icon.warning" />
            </td>

            <!-- Amount -->
            <td :class="td" style="text-align:right;">
              <span :class="amount">{{ row.amount }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ═════ Footer ═════ -->
    <MpFlex align="center" justify="space-between" paddingInline="1">
      <span :class="footText">Showing 12 of 12</span>
      <MpFlex align="center" gap="6">
        <span :class="footText">Rows per page: 10</span>
        <span :class="footText">Page 1 of 1</span>
      </MpFlex>
    </MpFlex>

  </MpFlex>
</template>
