<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Home dashboard
  Source: reference prototype (~/Downloads/Mekari.html — "Good morning, Nata")
  Token mode: Pixel DT 2.4 (data-panda-theme="next")
  Components: MpFlex, MpText, MpButton, MpBadge, MpAvatar, PxIcon, AiIcon (all Pixel 3)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Sections:
    - Header (greeting via layout title + Export / Review queue teleported to #layout-header-actions)
    - Quick actions (5 cards)
    - Stats strip (4 metrics, divider-separated)
    - Waiting on you (review list) + Copilot digest
-->
<script setup lang="ts">
import { MpFlex, MpButton, MpAvatar, css } from '@mekari/pixel3'

definePageMeta({ title: 'Good morning, Nata', navKey: 'home' })

// ─── Data ────────────────────────────────────────────────────────────
const quickActions = [
  { icon: 'reimbursement', title: 'New claim',        sub: 'Reimburse or advance' },
  { icon: 'business-trip', title: 'Request a trip',   sub: 'Costed from trip policies' },
  { icon: 'cart',          title: 'Purchase request', sub: 'Routes via approval policy' },
  { icon: 'billing',       title: 'Issue a card',     sub: 'Virtual, with limits' },
  { icon: 'finance',       title: 'Set a budget',     sub: 'Pooled or per person' },
]

const stats = [
  { label: 'Needs review',           value: '13',            unit: 'items', sub: '6 flagged by policy' },
  { label: 'Awaiting your approval', value: 'Rp 18.297.890', unit: '',      sub: 'oldest waiting 4 days' },
  { label: 'To disburse',            value: 'Rp 8.120.000',  unit: '',      sub: '14 approved items · runs Fri' },
  { label: 'Spend this month',       value: 'Rp 46,2 jt',    unit: '',      sub: '+12% vs June · on budget' },
]

const waiting = [
  { name: 'Maya Chen',    memo: 'Client dinner — Nobu Downtown',   flag: 'Missing itemization', kind: 'warning', amount: 'Rp 184.000' },
  { name: 'Daniel Reyes', memo: 'Flight SFO → JFK, onsite week',   flag: 'In policy',           kind: 'neutral', amount: 'Rp 412.500' },
  { name: 'Priya Sharma', memo: 'Adobe Creative Cloud renewal',    flag: 'Possible duplicate',  kind: 'danger',  amount: 'Rp 59.990' },
  { name: 'Tom Okafor',   memo: 'Team offsite venue deposit',      flag: 'Over limit +Rp 250K', kind: 'warning', amount: 'Rp 1.250.000' },
]

const digest = [
  'Sales · Transport is at 98% of its hard cap — blocks new claims in ~4 days at current pace',
  '3 software renewals hit cards this week — Rp 5,1jt; one card lacks the balance',
  '2 claims look like duplicates (same vendor, same amount, 1 day apart) — review those first',
]

const DOT: Record<string, string> = {
  warning: 'var(--mp-colors-icon-warning)',
  neutral: 'var(--mp-colors-icon-default)',
  danger:  'var(--mp-colors-icon-danger)',
}

// ─── CSS ─────────────────────────────────────────────────────────────
const card = css({
  bg: 'background.neutral', borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  borderRadius: 'lg',
})

const iconChip = css({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  w: '40px', h: '40px', borderRadius: 'md', bg: 'background.brand', flexShrink: 0,
})

const quickGrid = css({
  display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '3',
})
const quickCard = css({
  display: 'flex', flexDirection: 'column', gap: '3', p: '4', textAlign: 'left',
  bg: 'background.neutral', borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  borderRadius: 'lg', cursor: 'pointer', transition: 'border-color 120ms ease, box-shadow 120ms ease',
  _hover: { borderColor: 'border.bold', boxShadow: 'xs' },
})

const statStrip = css({
  display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  bg: 'background.neutral', borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  borderRadius: 'lg', overflow: 'hidden',
})
const statCell = css({
  display: 'flex', flexDirection: 'column', gap: '1.5', px: '5', py: '4',
  borderLeftWidth: '1px', borderLeftStyle: 'solid', borderLeftColor: 'border.default',
  _first: { borderLeftWidth: '0' },
})

const label     = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
const statValue = css({ fontFamily: 'body', fontSize: '2xl', fontWeight: 'bold', color: 'text.default', lineHeight: 'xs' })
const statUnit  = css({ fontFamily: 'body', fontSize: 'md', color: 'text.secondary', fontWeight: 'regular' })
const cardTitle = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default' })
const cardSub   = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })

const bottomGrid = css({
  display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '4', alignItems: 'start',
})

const sectionHead  = css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '4', py: '3' })
const sectionTitle = css({ fontFamily: 'body', fontSize: 'lg', fontWeight: 'semiBold', color: 'text.default' })

const list = css({ display: 'flex', flexDirection: 'column', gap: '2', px: '3', pb: '3' })
const row  = css({
  display: 'flex', alignItems: 'center', gap: '3', px: '3', py: '2.5',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default', borderRadius: 'md',
  bg: 'background.neutral', transition: 'background-color 120ms ease',
  _hover: { bg: 'background.neutral.hovered' },
})
const rowName   = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default', whiteSpace: 'nowrap', width: '132px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis' })
const rowMemo   = css({ fontFamily: 'body', fontSize: 'md', color: 'text.secondary', flex: '1 1 auto', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' })
const rowFlag   = css({ display: 'inline-flex', alignItems: 'center', gap: '1.5', fontFamily: 'body', fontSize: 'md', color: 'text.secondary', whiteSpace: 'nowrap', flexShrink: 0 })
const dot       = css({ w: '6px', h: '6px', borderRadius: 'full', flexShrink: 0 })
const rowAmount = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default', whiteSpace: 'nowrap', textAlign: 'right', width: '104px', flexShrink: 0 })

const digestCard = css({
  bg: 'background.brand', borderWidth: '1px', borderStyle: 'solid',
  borderColor: 'var(--mp-colors-indigo-200)', borderRadius: 'lg',
  display: 'flex', flexDirection: 'column',
})
const digestHead = css({ display: 'flex', alignItems: 'center', gap: '2', px: '4', pt: '4', pb: '2' })
const digestItem = css({
  px: '4', py: '3', fontFamily: 'body', fontSize: 'md', lineHeight: 'md', color: 'text.default',
  borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--mp-colors-indigo-200)',
})
const digestFoot = css({
  px: '4', py: '3', fontFamily: 'body', fontSize: 'sm', color: 'text.secondary',
  borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--mp-colors-indigo-200)',
})
const dateEyebrow = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary', whiteSpace: 'nowrap' })
</script>

<template>
  <!-- ═════ Header eyebrow + CTAs (into layout title bar) ═════ -->
  <Teleport to="#layout-title-suffix">
    <span :class="dateEyebrow">Tuesday, July 21</span>
  </Teleport>
  <Teleport to="#layout-header-actions">
    <MpFlex align="center" gap="2">
      <MpButton variant="secondary" size="md" left-icon="download">Export</MpButton>
      <MpButton variant="primary" size="md">Review queue</MpButton>
    </MpFlex>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" style="min-width:0;">

    <!-- Quick actions -->
    <div :class="quickGrid">
      <button v-for="a in quickActions" :key="a.title" type="button" :class="quickCard">
        <span :class="iconChip"><PxIcon :name="a.icon" :size="20" color="icon.brand" /></span>
        <div style="display:flex;flex-direction:column;gap:2px;">
          <span :class="cardTitle">{{ a.title }}</span>
          <span :class="cardSub">{{ a.sub }}</span>
        </div>
      </button>
    </div>

    <!-- Stats strip -->
    <div :class="statStrip">
      <div v-for="s in stats" :key="s.label" :class="statCell">
        <span :class="label">{{ s.label }}</span>
        <span>
          <span :class="statValue">{{ s.value }}</span>
          <span v-if="s.unit" :class="statUnit">&nbsp;{{ s.unit }}</span>
        </span>
        <span :class="cardSub">{{ s.sub }}</span>
      </div>
    </div>

    <!-- Waiting on you + Copilot digest -->
    <div :class="bottomGrid">

      <!-- Waiting on you -->
      <div :class="card">
        <div :class="sectionHead">
          <span :class="sectionTitle">Waiting on you</span>
          <MpButton variant="textLink" size="sm" right-icon="arrows-right">Open inbox</MpButton>
        </div>
        <div :class="list">
          <div v-for="r in waiting" :key="r.name" :class="row">
            <MpAvatar :id="`av-${r.name}`" :name="r.name" size="sm" variant-color="gray" />
            <span :class="rowName">{{ r.name }}</span>
            <span :class="rowMemo">{{ r.memo }}</span>
            <span :class="rowFlag">
              <span :class="dot" :style="{ background: DOT[r.kind] }" />
              {{ r.flag }}
            </span>
            <span :class="rowAmount">{{ r.amount }}</span>
            <MpButton variant="secondary" size="sm">Review</MpButton>
          </div>
        </div>
      </div>

      <!-- Copilot digest -->
      <div :class="digestCard">
        <div :class="digestHead">
          <AiIcon size="md" />
          <span :class="sectionTitle">Copilot digest</span>
        </div>
        <div v-for="(d, i) in digest" :key="i" :class="digestItem">{{ d }}</div>
        <div :class="digestFoot">Every line is traceable — click through to the source</div>
      </div>

    </div>

  </MpFlex>
</template>
