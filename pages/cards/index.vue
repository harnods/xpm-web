<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Cards (list)
  Token mode: Pixel DT 2.4
  Components: MpFlex, MpText, MpButton, MpBadge, PxIcon (all Pixel 3)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-->
<script setup lang="ts">
import {
  MpFlex, MpButton, MpBadge,
  MpInputGroup, MpInputLeftAddon, MpInput,
  css,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Cards',
  subtitle: "Cards management — issue, fund and control the company's virtual and physical cards.",
})

// ─── Data ────────────────────────────────────────────────────────────
const summary = [
  { label: 'Active cards',          badge: '12', value: 'Rp 1.240.000', top: 'var(--mp-colors-green-600)' },
  { label: 'Inactive',              badge: '8',  value: 'Rp 620.000',   top: 'var(--mp-colors-neutral-400)' },
  { label: 'Card creation credit',  badge: null, value: '20',           top: 'var(--mp-colors-indigo-700)' },
]

const tabs = [
  { key: 'virtual',  label: 'Virtual cards',  active: true },
  { key: 'physical', label: 'Physical cards', active: false },
]

interface CardRow {
  id: string; name: string; nameSub: string
  holder: string; holderSub: string
  exp: string; balance: string; account: string
  status: 'Active' | 'Inactive'
}

const rows: CardRow[] = [
  { id: 'c1', name: 'Nabila MNC Test VCC',   nameSub: 'Testing refund and reversal', holder: 'XM punya 3',              holderSub: 'BUATXM3',   exp: '30 Jun 2026', balance: 'Rp 100.000', account: 'Main account', status: 'Inactive' },
  { id: 'c2', name: 'ads meta',              nameSub: 'iklan',                       holder: 'Trial Aeon',             holderSub: 'PRMT-0081', exp: '01 Jul 2026', balance: 'Rp 50.000',  account: 'Main account', status: 'Inactive' },
  { id: 'c3', name: 'Nabila MNC Test VCC 3', nameSub: 'Testing Dana QR',             holder: 'XM punya 3',             holderSub: 'BUATXM3',   exp: '01 Aug 2026', balance: 'Rp 50.000',  account: 'Main account', status: 'Active' },
  { id: 'c4', name: 'VCC untuk Meta',        nameSub: 'Untuk pembayaran WABA',       holder: 'Test XPM - Abdul',       holderSub: 'PRMT-0028', exp: '31 Dec 2026', balance: 'Rp 50.000',  account: 'Main account', status: 'Active' },
  { id: 'c5', name: 'Grab Activation',       nameSub: 'testing',                     holder: 'Activation Specialist',  holderSub: 'PRMT-0031', exp: '25 Jun 2028', balance: 'Rp 440.000', account: 'Main account', status: 'Active' },
]

const searchQuery = ref('')

// ─── CSS ─────────────────────────────────────────────────────────────
const summaryGrid = css({ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3' })
const summaryCard = css({
  display: 'flex', flexDirection: 'column', gap: '2', p: '4',
  bg: 'background.neutral', borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  borderRadius: 'lg', borderTopWidth: '3px',
})
const summaryLabelRow = css({ display: 'flex', alignItems: 'center', gap: '2' })
const summaryLabel    = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
const summaryValue    = css({ fontFamily: 'body', fontSize: '2xl', fontWeight: 'bold', color: 'text.default', lineHeight: 'xs' })

const tabStrip = css({
  display: 'flex', alignItems: 'center', gap: '4',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
})
const tabItem = css({
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.secondary',
  paddingBlock: '2', cursor: 'pointer', background: 'transparent', border: 'none',
  borderBottomWidth: '2px', borderBottomStyle: 'solid', borderBottomColor: 'transparent',
  marginBottom: '-1px',
})
const tabItemActive = css({
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.link',
  paddingBlock: '2', cursor: 'pointer', background: 'transparent', border: 'none',
  borderBottomWidth: '2px', borderBottomStyle: 'solid', borderBottomColor: 'var(--mp-colors-icon-brand)',
  marginBottom: '-1px',
})

const tblWrap = css({ w: 'full', overflowX: 'auto' })
const tbl = css({ w: 'full', tableLayout: 'auto', borderCollapse: 'collapse' })
const th = css({
  bg: 'background.neutral.subtle',
  fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.secondary',
  paddingInline: '3', paddingBlock: '3', h: '44px',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
  textAlign: 'left', whiteSpace: 'nowrap', verticalAlign: 'middle', textTransform: 'uppercase', letterSpacing: '0.02em',
})
const td = css({
  fontFamily: 'body', fontSize: 'md', color: 'text.default',
  paddingInline: '3', paddingBlock: '3',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
  verticalAlign: 'middle',
})
const cellName = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.link', textDecoration: 'none', cursor: 'pointer', _hover: { textDecoration: 'underline' } })
const cellPrimary = css({ fontFamily: 'body', fontSize: 'md', color: 'text.default' })
const cellSub  = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
const statusCell = css({ display: 'inline-flex', alignItems: 'center', gap: '2', whiteSpace: 'nowrap' })
const dot = css({ w: '8px', h: '8px', borderRadius: 'full', flexShrink: 0 })

const footer = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
</script>

<template>
  <!-- ═════ Header CTA ═════ -->
  <Teleport to="#layout-header-actions">
    <MpButton variant="primary" size="md" left-icon="add">Create card</MpButton>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" style="min-width:0;">

    <!-- ── Summary cards ── -->
    <div :class="summaryGrid">
      <div v-for="s in summary" :key="s.label" :class="summaryCard" :style="{ borderTopColor: s.top }">
        <div :class="summaryLabelRow">
          <span :class="summaryLabel">{{ s.label }}</span>
          <MpBadge v-if="s.badge" for="tableStatus" type="neutral">{{ s.badge }}</MpBadge>
        </div>
        <span :class="summaryValue">{{ s.value }}</span>
      </div>
    </div>

    <!-- ── Tabs ── -->
    <div :class="tabStrip">
      <button v-for="t in tabs" :key="t.key" type="button" :class="t.active ? tabItemActive : tabItem">
        {{ t.label }}
      </button>
    </div>

    <!-- ── Toolbar ── -->
    <MpFlex align="center" justify="space-between" gap="3" style="flex-wrap:wrap;">
      <MpFlex align="center" gap="2" style="flex-wrap:wrap;">
        <MpButton variant="secondary" size="sm" right-icon="caret-down">All status</MpButton>
        <MpButton variant="secondary" size="sm" right-icon="caret-down">All accounts</MpButton>
      </MpFlex>
      <MpFlex align="center" gap="2" style="flex-wrap:wrap;">
        <MpButton variant="ghost" size="sm" right-icon="caret-down">Sort: Oldest first</MpButton>
        <MpButton variant="secondary" size="sm" left-icon="download">Export</MpButton>
        <MpInputGroup style="width:260px;flex-shrink:0;">
          <MpInputLeftAddon>
            <PxIcon name="search" :size="16" color="icon.default" />
          </MpInputLeftAddon>
          <MpInput v-model="searchQuery" placeholder="Search cardholder/card name…" :isFullWidth="true" />
        </MpInputGroup>
      </MpFlex>
    </MpFlex>

    <!-- ── Table ── -->
    <div :class="tblWrap">
      <table :class="tbl">
        <thead>
          <tr>
            <th :class="th">Card name</th>
            <th :class="th">Cardholder</th>
            <th :class="th">Expiration</th>
            <th :class="th" style="text-align:right;">Card balance</th>
            <th :class="th">Account</th>
            <th :class="th">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td :class="td">
              <NuxtLink :to="`/cards/${row.id}`" :class="cellName">{{ row.name }}</NuxtLink>
              <div :class="cellSub">{{ row.nameSub }}</div>
            </td>
            <td :class="td">
              <div :class="cellPrimary">{{ row.holder }}</div>
              <div :class="cellSub">{{ row.holderSub }}</div>
            </td>
            <td :class="td" style="white-space:nowrap;">{{ row.exp }}</td>
            <td :class="td" style="text-align:right;white-space:nowrap;">{{ row.balance }}</td>
            <td :class="td" style="white-space:nowrap;">{{ row.account }}</td>
            <td :class="td">
              <span :class="statusCell">
                <span
                  :class="dot"
                  :style="{ background: row.status === 'Active' ? 'var(--mp-colors-icon-success)' : 'var(--mp-colors-icon-default)' }"
                />
                {{ row.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Footer ── -->
    <span :class="footer">Showing 5 of 5 · Rows per page: 10 · Page 1 of 1</span>

  </MpFlex>
</template>
