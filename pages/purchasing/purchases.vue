<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Purchasing › Purchases
  Token mode: Pixel DT 2.4 (semantic tokens)
  Components: MpFlex, MpText, MpButton, MpBadge, PxIcon (all Pixel 3)
  Submenu (Purchasing) handled by layout automatically.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-->
<script setup lang="ts">
import { MpFlex, MpText, MpButton, css } from '@mekari/pixel3'

definePageMeta({
  title: 'Purchases',
  subtitle: 'Invoices, orders, quotes and requests from vendors.',
})

// ─── Tabs ────────────────────────────────────────────────────────────
const tabs = ['Invoice', 'Order', 'Quote', 'Request']
const activeTab = ref('Invoice')

// ─── Rows ────────────────────────────────────────────────────────────
type Status = 'Overdue' | 'Paid' | 'Awaiting payment' | 'Awaiting review'

interface Row {
  doc: string
  vendor: string
  lines: string
  requester: string
  date: string
  due: string
  status: Status
  total: string
}

const rows: Row[] = [
  { doc: 'PI-64401', vendor: 'Manna Jaya Trading', lines: '1 line item',  requester: 'Maya Chen',    date: 'Jul 15', due: 'Aug 15', status: 'Overdue',          total: 'Rp 3.210.000'  },
  { doc: 'PI-64432', vendor: 'Movus Technologies', lines: '2 line items', requester: 'Daniel Reyes', date: 'Jul 18', due: 'Aug 18', status: 'Paid',             total: 'Rp 12.400.000' },
  { doc: 'PI-64470', vendor: 'Brassica Supply Co.', lines: '2 line items', requester: 'Priya Sharma', date: 'Jul 20', due: 'Aug 20', status: 'Awaiting payment', total: 'Rp 6.050.000'  },
  { doc: 'PI-64469', vendor: 'Integrity Partners', lines: '1 line item',  requester: 'Tom Okafor',   date: 'Jul 20', due: 'Aug 20', status: 'Awaiting review',  total: 'Rp 6.050.000'  },
  { doc: 'PI-64468', vendor: 'AJN Solutions',      lines: '2 line items', requester: 'Sara Lin',     date: 'Jul 20', due: 'Aug 20', status: 'Awaiting review',  total: 'Rp 6.050.000'  },
]

const STATUS_COLOR: Record<Status, string> = {
  'Overdue':          'var(--mp-colors-icon-danger)',
  'Paid':             'var(--mp-colors-icon-success)',
  'Awaiting payment': 'var(--mp-colors-icon-warning)',
  'Awaiting review':  'var(--mp-colors-icon-warning)',
}

function hasWarn(s: Status) {
  return s === 'Overdue' || s === 'Awaiting payment'
}

// ─── CSS ─────────────────────────────────────────────────────────────
const tabBar = css({
  display: 'flex', alignItems: 'center', gap: '5',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
})
const tab = css({
  appearance: 'none', background: 'transparent', border: 'none', cursor: 'pointer',
  paddingBlock: '3', marginBottom: '-1px',
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.secondary',
  borderBottomWidth: '2px', borderBottomStyle: 'solid', borderBottomColor: 'transparent',
  transition: 'color 120ms ease, border-color 120ms ease',
  _hover: { color: 'text.default' },
})
const tabActive = css({ color: 'text.default', borderBottomColor: 'border.brand' })

const searchWrap = css({
  display: 'inline-flex', alignItems: 'center', gap: '2',
  width: '240px', minHeight: '36px', paddingInline: '3',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.form',
  borderRadius: 'md', bg: 'background.neutral',
  _focusWithin: { boxShadow: 'focus', borderColor: 'border.focused' },
})
const searchInput = css({
  flex: '1 1 auto', minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
  fontFamily: 'body', fontSize: 'md', color: 'text.default',
  _placeholder: { color: 'text.secondary' },
})

const tblWrap = css({ w: 'full', overflowX: 'auto' })
const tbl = css({ w: 'full', tableLayout: 'auto', borderCollapse: 'collapse' })
const th = css({
  bg: 'background.neutral.subtle',
  fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.secondary',
  lineHeight: 'lg', paddingInline: '3', paddingBlock: '3', h: '44px',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
  textAlign: 'left', whiteSpace: 'nowrap', verticalAlign: 'middle',
})
const td = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'text.default',
  paddingInline: '3', paddingBlock: '3',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
  verticalAlign: 'middle', whiteSpace: 'nowrap',
})
const docLink   = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'medium', color: 'text.link', cursor: 'pointer' })
const vendorName = css({ fontFamily: 'body', fontSize: 'md', color: 'text.default' })
const vendorSub = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
const muted     = css({ fontFamily: 'body', fontSize: 'md', color: 'text.secondary' })
const statusWrap = css({ display: 'inline-flex', alignItems: 'center', gap: '2' })
const dot        = css({ w: '8px', h: '8px', borderRadius: 'full', flexShrink: 0 })
const statusText = css({ fontFamily: 'body', fontSize: 'md', color: 'text.default' })
const statusTextBold = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'bold', color: 'text.default' })
const totalText = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default', textAlign: 'right' })

const footer = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  paddingInline: '1', fontFamily: 'body', fontSize: 'sm', color: 'text.secondary',
})
</script>

<template>
  <!-- ═════ Header CTAs ═════ -->
  <Teleport to="#layout-header-actions">
    <MpButton variant="primary" size="md">Create purchase</MpButton>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" style="min-width:0;">

    <!-- Tabs -->
    <div :class="tabBar">
      <button
        v-for="t in tabs"
        :key="t"
        type="button"
        :class="[tab, activeTab === t ? tabActive : '']"
        @click="activeTab = t"
      >{{ t }}</button>
    </div>

    <!-- Toolbar -->
    <MpFlex align="center" justify="space-between" gap="3" style="flex-wrap:wrap;">
      <MpFlex align="center" gap="2" style="flex-wrap:wrap;">
        <MpButton variant="secondary" size="sm" right-icon="caret-down">All status</MpButton>
        <MpButton variant="secondary" size="sm" right-icon="caret-down">All accounts</MpButton>
        <MpButton variant="secondary" size="sm" right-icon="caret-down">This month</MpButton>
        <MpButton variant="secondary" size="sm" left-icon="filter">Filters</MpButton>
      </MpFlex>

      <MpFlex align="center" gap="2" style="flex-wrap:wrap;">
        <MpButton variant="secondary" size="sm" right-icon="caret-down">Sort: Oldest first</MpButton>
        <MpButton variant="secondary" size="sm">Export</MpButton>
        <label :class="searchWrap">
          <PxIcon name="search" :size="16" color="icon.subtle" />
          <input :class="searchInput" type="text" placeholder="Search document or vendor…" />
        </label>
      </MpFlex>
    </MpFlex>

    <!-- Table -->
    <div :class="tblWrap">
      <table :class="tbl">
        <thead>
          <tr>
            <th :class="th">DOCUMENT</th>
            <th :class="th">VENDOR</th>
            <th :class="th">REQUESTER</th>
            <th :class="th">DATE</th>
            <th :class="th">DUE · VALID</th>
            <th :class="th">STATUS</th>
            <th :class="th" style="width:24px;"></th>
            <th :class="th" style="text-align:right;">TOTAL</th>
            <th :class="th" style="width:44px;"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.doc">
            <td :class="td"><span :class="docLink">{{ r.doc }}</span></td>
            <td :class="td">
              <div :class="vendorName">{{ r.vendor }}</div>
              <div :class="vendorSub">{{ r.lines }}</div>
            </td>
            <td :class="td"><span :class="muted">{{ r.requester }}</span></td>
            <td :class="td"><span :class="muted">{{ r.date }}</span></td>
            <td :class="td"><span :class="muted">{{ r.due }}</span></td>
            <td :class="td">
              <span :class="statusWrap">
                <span :class="dot" :style="{ background: STATUS_COLOR[r.status] }" />
                <span :class="r.status === 'Overdue' ? statusTextBold : statusText">{{ r.status }}</span>
              </span>
            </td>
            <td :class="td" style="text-align:center;">
              <PxIcon v-if="hasWarn(r.status)" name="warning-triangle" :size="16" color="icon.warning" />
            </td>
            <td :class="td" style="text-align:right;"><span :class="totalText">{{ r.total }}</span></td>
            <td :class="td" style="text-align:right;">
              <MpButton variant="ghost" size="sm" left-icon="menu-meatball" aria-label="More" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div :class="footer">
      <span>Showing 5 of 5</span>
      <MpFlex align="center" gap="6">
        <span>Rows per page: 10</span>
        <span>Page 1 of 1</span>
      </MpFlex>
    </div>

  </MpFlex>
</template>
