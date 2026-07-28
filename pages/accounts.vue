<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Accounts (company wallets)
  Token mode: Pixel DT 2.4 (data-panda-theme="next")
  Components: MpFlex, MpText, MpButton, MpBadge, PxIcon (all Pixel 3)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Sections (title + subtitle rendered by layout):
    - Header CTAs (Edit wallet / Move money / Top up) teleported to #layout-header-actions
    - All-wallets total line
    - Zero-balance warning banner
    - Two-column: wallet list (left) + balances / transactions (right)
-->
<script setup lang="ts">
import { MpFlex, MpText, MpButton, MpBadge, css } from '@mekari/pixel3'

definePageMeta({
  title: 'Accounts',
  subtitle: 'Manage company wallets, balances and money movement.',
  navKey: 'accounts',
})

// ─── Colors ──────────────────────────────────────────────────────────
const AMBER = 'var(--mp-colors-orange-600)'
const GREEN = 'var(--mp-colors-icon-success)'

// ─── Data ────────────────────────────────────────────────────────────
const currencyTabs = ['IDR', 'USD']
const activeCurrency = ref('IDR')

const contentTabs = ['Transactions', 'Wallet settings']
const activeTab = ref('Transactions')

const typeChips = ['All', 'Top-ups', 'Payments', 'FX']
const activeType = ref('All')

const periodChips = ['This month', 'Last month', 'All time']
const activePeriod = ref('All time')

const stats = [
  { label: 'Balance · IDR',     value: 'Rp 0',            color: 'text.default', big: true },
  { label: 'Pending payouts',   value: 'Rp 551.435.464',  color: AMBER },
  { label: 'Money in · Jul',    value: 'Rp 25.000.000',   color: GREEN },
  { label: 'Money out · Jul',   value: 'Rp 19.173.797',   color: 'text.default' },
]

const txns = [
  { date: '22 Jul 2026', desc: 'Reimbursement payout',    in: '',              out: 'Rp 6.773.797',  balance: 'Rp 0' },
  { date: '20 Jul 2026', desc: 'Top up · bank transfer',  in: 'Rp 25.000.000', out: '',              balance: 'Rp 6.773.797' },
  { date: '18 Jul 2026', desc: 'Bill payment · Movus',    in: '',              out: 'Rp 12.400.000', balance: 'Rp -18.226.203' },
]

// ─── CSS ─────────────────────────────────────────────────────────────
const mutedLine = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })

// Warning banner
const banner = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3',
  bg: 'background.danger', borderWidth: '1px', borderStyle: 'solid',
  borderColor: 'var(--mp-colors-red-200)', borderRadius: 'lg',
  px: '4', py: '3',
})
const bannerLeft = css({ display: 'flex', alignItems: 'center', gap: '2.5', minWidth: 0 })
const bannerDot  = css({ w: '8px', h: '8px', borderRadius: 'full', flexShrink: 0 })
const bannerText = css({ fontFamily: 'body', fontSize: 'md', color: 'text.default' })

// Two-column grid
const twoCol = css({
  display: 'grid', gridTemplateColumns: 'minmax(0, 300px) minmax(0, 1fr)',
  gap: '4', alignItems: 'start',
})

// Left wallet card
const walletCard = css({
  bg: 'background.neutral', borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  borderRadius: 'lg', display: 'flex', flexDirection: 'column',
})
const walletHead = css({
  fontFamily: 'body', fontSize: 'xs', fontWeight: 'semiBold', letterSpacing: 'wide',
  textTransform: 'uppercase', color: 'text.secondary', px: '4', pt: '4', pb: '2',
})
const walletList = css({ display: 'flex', flexDirection: 'column', gap: '1', px: '2', pb: '2' })
const walletItem = css({
  display: 'flex', flexDirection: 'column', gap: '1', px: '3', py: '2.5', borderRadius: 'md',
})
const walletItemActive = css({
  display: 'flex', flexDirection: 'column', gap: '1', px: '3', py: '2.5', borderRadius: 'md',
  bg: 'background.brand.selected',
  borderLeftWidth: '2px', borderLeftStyle: 'solid', borderLeftColor: 'border.brand',
})
const walletTop  = css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2' })
const walletName = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default' })
const walletTag  = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary', whiteSpace: 'nowrap' })
const walletBal  = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
const addWalletWrap = css({ px: '2', pb: '3' })

// Right column
const rightCol = css({ display: 'flex', flexDirection: 'column', gap: '4', minWidth: 0 })

// Currency segmented toggle
const segment = css({
  display: 'inline-flex', alignItems: 'center', gap: '1', p: '1',
  bg: 'background.neutral.subtle', borderRadius: 'md',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  alignSelf: 'flex-start',
})
const segPill = css({
  fontFamily: 'body', fontSize: 'sm', fontWeight: 'medium', color: 'text.secondary',
  px: '3', py: '1.5', borderRadius: 'sm', cursor: 'pointer', background: 'transparent', border: 'none',
})
const segPillActive = css({
  fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.default',
  px: '3', py: '1.5', borderRadius: 'sm', cursor: 'pointer', border: 'none',
  bg: 'background.neutral', boxShadow: 'xs',
})

// Stats strip
const statStrip = css({
  display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
})
const statCell = css({
  display: 'flex', flexDirection: 'column', gap: '1.5', px: '5', py: '4',
  borderLeftWidth: '1px', borderLeftStyle: 'solid', borderLeftColor: 'border.default',
  _first: { borderLeftWidth: '0', paddingLeft: '0' },
})
const statLabel  = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
const statBig    = css({ fontFamily: 'body', fontSize: '2xl', fontWeight: 'bold', lineHeight: 'xs' })
const statValue  = css({ fontFamily: 'body', fontSize: 'lg', fontWeight: 'semiBold', lineHeight: 'sm' })

// Tabs (underline)
const tabsRow = css({
  display: 'flex', alignItems: 'center', gap: '4',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
})
const tab = css({
  fontFamily: 'body', fontSize: 'md', color: 'text.secondary', cursor: 'pointer',
  background: 'transparent', border: 'none', px: '1', pb: '3',
  borderBottomWidth: '2px', borderBottomStyle: 'solid', borderBottomColor: 'transparent',
})
const tabActive = css({
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default', cursor: 'pointer',
  background: 'transparent', border: 'none', px: '1', pb: '3',
  borderBottomWidth: '2px', borderBottomStyle: 'solid', borderBottomColor: 'border.brand',
})

// Sub-title + filter chips
const subTitle = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default' })
const filterWrap = css({ display: 'flex', alignItems: 'center', gap: '2', flexWrap: 'wrap' })
const chip = css({
  fontFamily: 'body', fontSize: 'sm', color: 'text.secondary', cursor: 'pointer',
  px: '3', py: '1.5', borderRadius: 'full',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default', background: 'transparent',
})
const chipActive = css({
  fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.link', cursor: 'pointer',
  px: '3', py: '1.5', borderRadius: 'full',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.brand', bg: 'background.brand.selected',
})
const chipDivider = css({ w: '1px', h: '20px', bg: 'border.default', flexShrink: 0, mx: '1' })
const searchBox = css({
  display: 'flex', alignItems: 'center', gap: '2', px: '3', py: '1.5', minWidth: '180px',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default', borderRadius: 'md',
  color: 'text.secondary', bg: 'background.neutral',
})
const searchText = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })

// Table
const tbl = css({ w: 'full', tableLayout: 'auto', borderCollapse: 'collapse' })
const th = css({
  fontFamily: 'body', fontSize: 'xs', fontWeight: 'semiBold', letterSpacing: 'wide',
  textTransform: 'uppercase', color: 'text.secondary',
  px: '3', py: '2.5', textAlign: 'left', whiteSpace: 'nowrap', verticalAlign: 'middle',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
})
const thNum = css({
  fontFamily: 'body', fontSize: 'xs', fontWeight: 'semiBold', letterSpacing: 'wide',
  textTransform: 'uppercase', color: 'text.secondary',
  px: '3', py: '2.5', textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'middle',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
})
const td = css({
  fontFamily: 'body', fontSize: 'md', color: 'text.default',
  px: '3', py: '3', verticalAlign: 'middle', whiteSpace: 'nowrap',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
})
const tdNum = css({
  fontFamily: 'body', fontSize: 'md', color: 'text.default',
  px: '3', py: '3', verticalAlign: 'middle', whiteSpace: 'nowrap', textAlign: 'right',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
})
const dashCell = css({ color: 'text.secondary' })

// Resolve a stat color: pass-through raw var() strings, map semantic tokens to CSS vars
function statColor(c: string): string {
  if (c.startsWith('var')) return c
  return `var(--mp-colors-${c.replace('.', '-')})`
}
</script>

<template>
  <!-- ═════ Header CTAs ═════ -->
  <Teleport to="#layout-header-actions">
    <MpFlex align="center" gap="2">
      <MpButton variant="secondary" size="md">Edit wallet</MpButton>
      <MpButton variant="secondary" size="md" left-icon="transfer">Move money</MpButton>
      <MpButton variant="primary" size="md">Top up</MpButton>
    </MpFlex>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" style="min-width:0;">

    <!-- All-wallets total -->
    <span :class="mutedLine">All wallets ≈ Rp 25.572.177</span>

    <!-- Zero-balance warning banner -->
    <div :class="banner">
      <div :class="bannerLeft">
        <span :class="bannerDot" :style="{ background: AMBER }" />
        <span :class="bannerText">Main account is at zero — top up to release pending payouts.</span>
      </div>
      <MpButton variant="primary" size="sm">Top up now</MpButton>
    </div>

    <!-- Two-column layout -->
    <div :class="twoCol">

      <!-- LEFT — wallet list -->
      <div :class="walletCard">
        <span :class="walletHead">Wallets</span>
        <div :class="walletList">

          <!-- Main account — active -->
          <div :class="walletItemActive">
            <div :class="walletTop">
              <MpFlex align="center" gap="2">
                <span :class="walletName">Main account</span>
                <MpBadge for="tableStatus" type="information">Default</MpBadge>
              </MpFlex>
              <span :class="walletTag">Primary wallet</span>
            </div>
            <span :class="walletBal">Rp 0 · IDR</span>
            <span :class="walletBal">$930.00 · USD</span>
          </div>

          <!-- Reimbursement pool -->
          <div :class="walletItem">
            <div :class="walletTop">
              <span :class="walletName">Reimbursement pool</span>
              <span :class="walletTag">Sub-wallet</span>
            </div>
            <span :class="walletBal">Rp 6.773.797 · IDR</span>
          </div>

          <!-- Card float -->
          <div :class="walletItem">
            <div :class="walletTop">
              <span :class="walletName">Card float</span>
              <span :class="walletTag">Sub-wallet</span>
            </div>
            <span :class="walletBal">Rp 2.180.000 · IDR</span>
            <span :class="walletBal">S$120.00 · SGD</span>
          </div>

        </div>
        <div :class="addWalletWrap">
          <MpButton variant="textLink" size="md" left-icon="add">Add wallet</MpButton>
        </div>
      </div>

      <!-- RIGHT — balances + transactions -->
      <div :class="rightCol">

        <!-- Currency segmented toggle -->
        <div :class="segment">
          <button
            v-for="c in currencyTabs" :key="c" type="button"
            :class="activeCurrency === c ? segPillActive : segPill"
            @click="activeCurrency = c"
          >{{ c }}</button>
        </div>

        <!-- Stats strip -->
        <div :class="statStrip">
          <div v-for="s in stats" :key="s.label" :class="statCell">
            <span :class="statLabel">{{ s.label }}</span>
            <span :class="s.big ? statBig : statValue" :style="{ color: statColor(s.color) }">{{ s.value }}</span>
          </div>
        </div>

        <!-- Tabs -->
        <div :class="tabsRow">
          <button
            v-for="t in contentTabs" :key="t" type="button"
            :class="activeTab === t ? tabActive : tab"
            @click="activeTab = t"
          >{{ t }}</button>
        </div>

        <!-- Sub-title + filter chips -->
        <MpFlex direction="column" gap="3">
          <span :class="subTitle">Main account · IDR movement</span>
          <div :class="filterWrap">
            <button
              v-for="c in typeChips" :key="c" type="button"
              :class="activeType === c ? chipActive : chip"
              @click="activeType = c"
            >{{ c }}</button>
            <span :class="chipDivider" />
            <button
              v-for="c in periodChips" :key="c" type="button"
              :class="activePeriod === c ? chipActive : chip"
              @click="activePeriod = c"
            >{{ c }}</button>
            <span :class="chipDivider" />
            <div :class="searchBox">
              <PxIcon name="search" :size="16" color="icon.default" />
              <span :class="searchText">Search movement…</span>
            </div>
          </div>
        </MpFlex>

        <!-- Transactions table -->
        <table :class="tbl">
          <thead>
            <tr>
              <th :class="th">Date</th>
              <th :class="th">Description</th>
              <th :class="thNum">Money in</th>
              <th :class="thNum">Money out</th>
              <th :class="thNum">Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in txns" :key="i">
              <td :class="td">{{ r.date }}</td>
              <td :class="td">{{ r.desc }}</td>
              <td :class="tdNum">
                <span v-if="r.in" :style="{ color: GREEN }">{{ r.in }}</span>
                <span v-else :class="dashCell">—</span>
              </td>
              <td :class="tdNum">
                <span v-if="r.out">{{ r.out }}</span>
                <span v-else :class="dashCell">—</span>
              </td>
              <td :class="tdNum">{{ r.balance }}</td>
            </tr>
          </tbody>
        </table>

      </div>

    </div>

  </MpFlex>
</template>
