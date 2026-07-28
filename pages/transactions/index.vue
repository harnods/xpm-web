<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Transactions (ledger)
  Token mode: Pixel DT 2.4
  Every money-out line across cards, reimbursements, bills and travel — one ledger.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-->
<script setup lang="ts">
import {
  MpFlex, MpText, MpButton, MpBadge,
  MpInputGroup, MpInputLeftAddon, MpInput,
  css,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Transactions',
  subtitle: 'Every money-out line across cards, reimbursements, bills and travel — one ledger.',
  navKey: 'transactions',
})

// ─── Summary cards ───────────────────────────────────────────────────
const summary = [
  { label: 'Total out · Jul', value: 'Rp 457,4 jt',     top: 'var(--mp-colors-neutral-400)' },
  { label: 'Card spend',      value: 'Rp 44.664.000',   top: 'var(--mp-colors-indigo-700)'  },
  { label: 'Reimbursed',      value: 'Rp 12.513.585',   top: 'var(--mp-colors-green-600)'   },
  { label: 'Bills paid',      value: 'Rp 380.462.009',  top: 'var(--mp-colors-orange-600)'  },
]

// ─── Filter tabs ──────────────────────────────────────────────────────
const TABS = ['All', 'Card', 'Reimbursement', 'Cash advance', 'Bill', 'Travel']
const activeTab = ref('All')

// ─── Views segmented pill ──────────────────────────────────────────────
const activeView = ref('Default')

// ─── Search ─────────────────────────────────────────────────────────────
const searchQuery = ref('')

// ─── Rows ─────────────────────────────────────────────────────────────
interface TxRow {
  date: string
  source: string
  description: string
  name: string
  account: string
  status: string
  statusKind: 'green' | 'amber'
  amount: string
}

const rows: TxRow[] = [
  { date: '22 Jul', source: 'Card',          description: 'Grab — ride to airport',              name: 'XM punya 3',          account: 'Main account', status: 'Cleared',            statusKind: 'green', amount: 'Rp 84.000'     },
  { date: '22 Jul', source: 'Card',          description: 'Meta Ads — July campaign',            name: 'ads meta',            account: 'Main account', status: 'Cleared',            statusKind: 'green', amount: 'Rp 2.400.000'  },
  { date: '22 Jul', source: 'Reimbursement', description: 'Client lunch',                        name: 'Maya Chen',           account: 'Main account', status: 'Awaiting disburse',  statusKind: 'amber', amount: 'Rp 58.708'     },
  { date: '20 Jul', source: 'Cash advance',  description: 'Roadshow per diem',                   name: 'Sofia Martins',       account: 'Main account', status: 'Disbursed',          statusKind: 'green', amount: 'Rp 400.000'    },
  { date: '21 Jul', source: 'Bill',          description: 'PI20260764927 · Batuta Chemical',     name: 'PT Batuta',           account: 'Main account', status: 'Awaiting approval',  statusKind: 'amber', amount: 'Rp 60.500'     },
  { date: '19 Jul', source: 'Bill',          description: 'PI20260764432 · Movus',               name: 'Movus Technologies',  account: 'Main account', status: 'Paid',               statusKind: 'green', amount: 'Rp 12.400.000' },
  { date: '20 Jul', source: 'Travel',        description: 'Trip Bandung · BT20260751072',        name: 'XM punya 3',          account: 'Main account', status: 'Booked',             statusKind: 'green', amount: 'Rp 1.250.000'  },
]

const DOT: Record<string, string> = {
  green: 'var(--mp-colors-icon-success)',
  amber: 'var(--mp-colors-icon-warning)',
}

// ─── CSS ────────────────────────────────────────────────────────────
const summaryGrid = css({
  display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '3',
})
const summaryCard = css({
  display: 'flex', flexDirection: 'column', gap: '2', p: '4',
  bg: 'background.neutral',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  borderRadius: 'lg',
  borderTopWidth: '3px', borderTopStyle: 'solid',
})
const summaryLabel = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
const summaryValue = css({ fontFamily: 'body', fontSize: '2xl', fontWeight: 'bold', color: 'text.default', lineHeight: 'xs' })

// Tabs
const tabsRow = css({
  display: 'flex', alignItems: 'center', gap: '5',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
})
const tab = css({
  position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer',
  paddingBlock: '2.5', paddingInline: '0',
  fontFamily: 'body', fontSize: 'md', fontWeight: 'regular', color: 'text.secondary',
  _hover: { color: 'text.default' },
})
const tabActive = css({
  position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer',
  paddingBlock: '2.5', paddingInline: '0',
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default',
  _after: {
    content: '""', position: 'absolute', left: '0', right: '0', bottom: '-1px',
    height: '2px', background: 'var(--mp-colors-icon-brand)', borderRadius: 'full',
  },
})

// Views segmented pill
const viewLabel = css({ fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.secondary', letterSpacing: '0.04em' })
const segment = css({
  display: 'inline-flex', alignItems: 'center', gap: '1', padding: '1',
  bg: 'background.neutral.subtle',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default', borderRadius: 'md',
})
const segItem = css({
  background: 'transparent', border: 'none', cursor: 'pointer',
  paddingInline: '3', paddingBlock: '1.5', borderRadius: 'sm',
  fontFamily: 'body', fontSize: 'sm', color: 'text.secondary',
})
const segItemActive = css({
  border: 'none', cursor: 'pointer',
  paddingInline: '3', paddingBlock: '1.5', borderRadius: 'sm',
  bg: 'background.neutral', boxShadow: 'xs',
  fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.default',
})

// Table
const tblWrap = css({ w: 'full', overflowX: 'auto' })
const tbl = css({ w: 'full', tableLayout: 'auto', borderCollapse: 'collapse' })
const th = css({
  bg: 'background.neutral.subtle',
  fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', lineHeight: 'lg', color: 'text.secondary',
  paddingInline: '3', paddingBlock: '3', h: '44px',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
  textAlign: 'left', whiteSpace: 'nowrap', verticalAlign: 'middle',
})
const td = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'text.default',
  paddingInline: '3', paddingBlock: '3',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
  verticalAlign: 'middle', whiteSpace: 'nowrap',
})
const descCell = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default' })
const secondaryCell = css({ fontFamily: 'body', fontSize: 'md', color: 'text.secondary' })
const statusCell = css({ display: 'inline-flex', alignItems: 'center', gap: '2', fontFamily: 'body', fontSize: 'md', color: 'text.default' })
const dot = css({ w: '8px', h: '8px', borderRadius: 'full', flexShrink: 0 })
const amountCell = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default', textAlign: 'right', whiteSpace: 'nowrap' })

const footText = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
</script>

<template>
  <!-- ═════ Header CTAs ═════ -->
  <Teleport to="#layout-header-actions">
    <MpButton variant="primary" size="md">Export ledger</MpButton>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" style="min-width:0;">

    <!-- 1) Summary cards -->
    <div :class="summaryGrid">
      <div v-for="s in summary" :key="s.label" :class="summaryCard" :style="{ borderTopColor: s.top }">
        <span :class="summaryLabel">{{ s.label }}</span>
        <span :class="summaryValue">{{ s.value }}</span>
      </div>
    </div>

    <!-- 2) Filter tabs -->
    <div :class="tabsRow">
      <button
        v-for="t in TABS" :key="t" type="button"
        :class="activeTab === t ? tabActive : tab"
        @click="activeTab = t"
      >{{ t }}</button>
    </div>

    <!-- 3) Toolbar -->
    <MpFlex align="center" justify="space-between" gap="3" style="flex-wrap:wrap;">
      <MpFlex align="center" gap="2">
        <MpButton variant="secondary" size="sm" right-icon="caret-down">All accounts</MpButton>
        <MpButton variant="secondary" size="sm" right-icon="caret-down">This month</MpButton>
      </MpFlex>
      <MpFlex align="center" gap="2">
        <MpButton variant="secondary" size="sm" right-icon="caret-down">Sort: Oldest first</MpButton>
        <MpButton variant="secondary" size="sm">Export</MpButton>
        <MpInputGroup style="width:260px;flex-shrink:0;">
          <MpInputLeftAddon>
            <PxIcon name="search" :size="16" color="icon.subtle" />
          </MpInputLeftAddon>
          <MpInput v-model="searchQuery" placeholder="Search description or name…" :isFullWidth="true" />
        </MpInputGroup>
      </MpFlex>
    </MpFlex>

    <!-- 4) Views row -->
    <MpFlex align="center" justify="space-between">
      <MpFlex align="center" gap="3">
        <span :class="viewLabel">VIEWS</span>
        <div :class="segment">
          <button
            type="button"
            :class="activeView === 'Default' ? segItemActive : segItem"
            @click="activeView = 'Default'"
          >Default</button>
        </div>
      </MpFlex>
      <MpButton variant="secondary" size="sm">Edit columns</MpButton>
    </MpFlex>

    <!-- 5) Table -->
    <div :class="tblWrap">
      <table :class="tbl">
        <thead>
          <tr>
            <th :class="th">DATE</th>
            <th :class="th">SOURCE</th>
            <th :class="th">DESCRIPTION</th>
            <th :class="th">NAME</th>
            <th :class="th">ACCOUNT</th>
            <th :class="th">STATUS</th>
            <th :class="th" style="text-align:right;">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in rows" :key="i">
            <td :class="td">{{ r.date }}</td>
            <td :class="td"><span :class="secondaryCell">{{ r.source }}</span></td>
            <td :class="td"><span :class="descCell">{{ r.description }}</span></td>
            <td :class="td">{{ r.name }}</td>
            <td :class="td"><span :class="secondaryCell">{{ r.account }}</span></td>
            <td :class="td">
              <span :class="statusCell">
                <span :class="dot" :style="{ background: DOT[r.statusKind] }" />
                {{ r.status }}
              </span>
            </td>
            <td :class="td" style="text-align:right;"><span :class="amountCell">{{ r.amount }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 6) Footer -->
    <MpFlex align="center" justify="space-between" paddingInline="1">
      <span :class="footText">Showing 7 of 7</span>
      <MpFlex align="center" gap="6">
        <span :class="footText">Rows per page: 10</span>
        <span :class="footText">Page 1 of 1</span>
      </MpFlex>
    </MpFlex>

  </MpFlex>
</template>
