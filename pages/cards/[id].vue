<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Card detail
  Token mode: Pixel DT 2.4
  Components: MpFlex, MpText, MpButton, MpBadge, PxIcon (all Pixel 3)
  Static content prototype.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-->
<script setup lang="ts">
import {
  MpFlex, MpButton, MpBadge,
  MpInputGroup, MpInputLeftAddon, MpInput,
  css,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Nabila MNC Test VCC',
  subtitle: 'C2026061550210 · Virtual card · XM punya 3 · Testing refund and reversal',
  breadcrumbParent: { path: '/cards', label: 'Cards' },
})

// ─── Data ────────────────────────────────────────────────────────────
const balanceCells = [
  { label: 'Remaining balance', value: 'Rp 100.000.000', sub: '' },
  { label: 'Loaded to card',    value: 'Rp 250.000.000', sub: '' },
  { label: 'Spent',             value: 'Rp 150.000.000', sub: '3 transactions' },
  { label: 'Funded from',       value: 'Main account',   sub: 'wallet' },
]

const spendFilters = ['All', 'Spend', 'Fees', 'Top-ups']
const spendActive = 'All'
const rangeFilters = ['This month', 'Last month', 'All time']
const rangeActive = 'All time'

interface Activity {
  title: string; sub: string
  badge: string; badgeType: string
  amount: string; positive: boolean
}
const activity: Activity[] = [
  { title: 'Tokopedia — test order',   sub: '20260630012 · 30 Jun 2026',        badge: 'Debit',   badgeType: 'neutral',   amount: '−Rp 100.000', positive: false },
  { title: 'DANA QR — refund test',    sub: '20260628008 · 28 Jun 2026',        badge: 'Credit',  badgeType: 'completed', amount: '+Rp 25.000',  positive: true  },
  { title: 'DANA QR',                  sub: '20260628007 · 28 Jun 2026',        badge: 'Debit',   badgeType: 'neutral',   amount: '−Rp 75.000',  positive: false },
  { title: 'QR payment fee',           sub: '20260628007 · 28 Jun 2026',        badge: 'Fee',     badgeType: 'neutral',   amount: '−Rp 700',     positive: false },
  { title: 'Card activation top-up',   sub: '15 Jun 2026 · from Main account',  badge: 'Success', badgeType: 'completed', amount: '+Rp 250.000', positive: true  },
]

const cardInfo = [
  { label: 'Card ID',       value: 'C2026061550210', sub: '' },
  { label: 'Purpose',       value: 'Testing refund and reversal', sub: '' },
  { label: 'Card holder',   value: 'XM punya 3', sub: 'BUATXM3' },
  { label: 'Active window', value: '15 Jun 2026 – 30 Jun 2026', sub: '' },
  { label: 'Funded from',   value: 'Main account', sub: '' },
]

const activitySearch = ref('')

// ─── CSS ─────────────────────────────────────────────────────────────
const card = css({
  bg: 'background.neutral', borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  borderRadius: 'lg',
})

const balanceGrid = css({ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' })
const balanceCell = css({
  display: 'flex', flexDirection: 'column', gap: '1.5', px: '5', py: '4',
  borderLeftWidth: '1px', borderLeftStyle: 'solid', borderLeftColor: 'border.default',
  _first: { borderLeftWidth: '0' },
})
const cellLabel = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
const cellBig   = css({ fontFamily: 'body', fontSize: '2xl', fontWeight: 'bold', color: 'text.default', lineHeight: 'xs' })
const cellMed   = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default' })
const cellSub   = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })

const progressWrap = css({ display: 'flex', alignItems: 'center', gap: '3' })
const progressTrack = css({
  flex: '1 1 auto', h: '8px', borderRadius: 'full', overflow: 'hidden',
  background: 'var(--mp-colors-neutral-200)',
})
const progressFill = css({ h: 'full', borderRadius: 'full', background: 'var(--mp-colors-indigo-600)', width: '60%' })
const progressLabel = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary', whiteSpace: 'nowrap', flexShrink: 0 })

const twoCol = css({ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '4', alignItems: 'start' })
const rightCol = css({ display: 'flex', flexDirection: 'column', gap: '4' })

const sectionHead  = css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '4', py: '3', borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default' })
const sectionTitle = css({ fontFamily: 'body', fontSize: 'lg', fontWeight: 'semiBold', color: 'text.default' })

const filterBar = css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3', px: '4', py: '3', flexWrap: 'wrap', borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default' })
const chipRow = css({ display: 'flex', alignItems: 'center', gap: '2', flexWrap: 'wrap' })
const chip = css({
  fontFamily: 'body', fontSize: 'sm', color: 'text.secondary', cursor: 'pointer',
  paddingInline: '3', paddingBlock: '1.5', borderRadius: 'full',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default', background: 'transparent',
})
const chipActive = css({
  fontFamily: 'body', fontSize: 'sm', color: 'text.link', fontWeight: 'semiBold', cursor: 'pointer',
  paddingInline: '3', paddingBlock: '1.5', borderRadius: 'full',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--mp-colors-icon-brand)', background: 'background.brand',
})
const chipDivider = css({ w: '1px', h: '20px', background: 'var(--mp-colors-neutral-200)', flexShrink: 0 })

const actList = css({ display: 'flex', flexDirection: 'column' })
const actRow = css({
  display: 'flex', alignItems: 'center', gap: '3', px: '4', py: '3',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
  _last: { borderBottomWidth: '0' },
})
const actTitle = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default' })
const actSub   = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
const actAmount = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', whiteSpace: 'nowrap', textAlign: 'right', flexShrink: 0 })

// Card visual
const cardVisual = css({
  borderRadius: 'lg', p: '4', aspectRatio: '1.6', color: 'white',
  display: 'flex', flexDirection: 'column',
})
const cvTop = css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between' })
const cvBrand = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'white' })
const cvVisa  = css({ fontFamily: 'body', fontSize: 'lg', fontWeight: 'bold', fontStyle: 'italic', color: 'white', letterSpacing: '0.04em' })
const cvName  = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'white' })
const cvBottom = css({ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '3' })
const cvMuted = css({ fontFamily: 'body', fontSize: 'xs', color: 'rgba(255,255,255,0.72)' })
const cvNumber = css({ fontFamily: 'body', fontSize: 'md', color: 'white', letterSpacing: '0.06em' })

// Card information list
const infoList = css({ display: 'flex', flexDirection: 'column' })
const infoRow = css({
  display: 'flex', flexDirection: 'column', gap: '0.5', px: '4', py: '3',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
  _last: { borderBottomWidth: '0' },
})
const infoLabel = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
const infoValue = css({ fontFamily: 'body', fontSize: 'md', color: 'text.default' })
const infoSub   = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
</script>

<template>
  <!-- ═════ Title suffix badge ═════ -->
  <Teleport to="#layout-title-suffix">
    <MpBadge for="tableStatus" type="announcement">Inactive</MpBadge>
  </Teleport>

  <!-- ═════ Header CTAs ═════ -->
  <Teleport to="#layout-header-actions">
    <MpFlex align="center" gap="2">
      <MpButton variant="secondary" size="md">Freeze</MpButton>
      <MpButton variant="ghost" size="md" :style="{ color: 'var(--mp-colors-text-danger)' }">Deactivate</MpButton>
      <MpButton variant="primary" size="md">Top up balance</MpButton>
    </MpFlex>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" style="min-width:0;">

    <!-- ── Balance row + progress ── -->
    <div :class="card">
      <div :class="balanceGrid">
        <div v-for="c in balanceCells" :key="c.label" :class="balanceCell">
          <span :class="cellLabel">{{ c.label }}</span>
          <span :class="c.label === 'Remaining balance' ? cellBig : cellMed">{{ c.value }}</span>
          <span v-if="c.sub" :class="cellSub">{{ c.sub }}</span>
        </div>
      </div>
      <div :class="progressWrap" style="padding:16px 20px;">
        <span :class="progressTrack"><span :class="progressFill" /></span>
        <span :class="progressLabel">60% of loaded balance spent</span>
      </div>
    </div>

    <!-- ── Two-column ── -->
    <div :class="twoCol">

      <!-- LEFT: Activity -->
      <div :class="card">
        <div :class="sectionHead">
          <span :class="sectionTitle">Activity</span>
        </div>

        <div :class="filterBar">
          <div :class="chipRow">
            <button v-for="f in spendFilters" :key="f" type="button" :class="f === spendActive ? chipActive : chip">{{ f }}</button>
            <span :class="chipDivider" />
            <button v-for="f in rangeFilters" :key="f" type="button" :class="f === rangeActive ? chipActive : chip">{{ f }}</button>
          </div>
          <MpInputGroup style="width:200px;flex-shrink:0;">
            <MpInputLeftAddon>
              <PxIcon name="search" :size="16" color="icon.default" />
            </MpInputLeftAddon>
            <MpInput v-model="activitySearch" placeholder="Search activity…" :isFullWidth="true" />
          </MpInputGroup>
        </div>

        <div :class="actList">
          <div v-for="a in activity" :key="a.title + a.sub" :class="actRow">
            <div style="display:flex;flex-direction:column;gap:2px;min-width:0;flex:1 1 auto;">
              <span :class="actTitle">{{ a.title }}</span>
              <span :class="actSub">{{ a.sub }}</span>
            </div>
            <MpBadge for="tableStatus" :type="a.badgeType">{{ a.badge }}</MpBadge>
            <span
              :class="actAmount"
              :style="{ color: a.positive ? 'var(--mp-colors-icon-success)' : 'var(--mp-colors-text-default)', width: '112px' }"
            >{{ a.amount }}</span>
          </div>
        </div>
      </div>

      <!-- RIGHT: card visual + card information -->
      <div :class="rightCol">

        <!-- VISA card visual -->
        <div :class="cardVisual" style="background:linear-gradient(135deg, #1D2656 0%, #4B61DC 100%);">
          <div :class="cvTop">
            <span :class="cvBrand">mekari</span>
            <span :class="cvVisa">VISA</span>
          </div>
          <div style="flex:1 1 auto;" />
          <span :class="cvName">Nabila MNC Test VCC</span>
          <div :class="cvBottom" style="margin-top:12px;">
            <div style="display:flex;flex-direction:column;gap:2px;">
              <span :class="cvMuted">Virtual card</span>
              <span :class="cvNumber">•••• 2104</span>
            </div>
            <span :class="cvMuted">Valid thru 06/26</span>
          </div>
        </div>

        <!-- Card information -->
        <div :class="card">
          <div :class="sectionHead">
            <span :class="sectionTitle">Card information</span>
          </div>
          <div :class="infoList">
            <div v-for="i in cardInfo" :key="i.label" :class="infoRow">
              <span :class="infoLabel">{{ i.label }}</span>
              <span :class="infoValue">{{ i.value }}</span>
              <span v-if="i.sub" :class="infoSub">{{ i.sub }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>

  </MpFlex>
</template>
