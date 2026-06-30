<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — My limits drawer
  Source: Figma Qz7o6vefzEMVLwlEcRU4pN · node 7654-87705
  Token mode: Pixel 2.4
  Patterns used: drawer, accordion (custom), progress bar
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  A read-only summary of the requester's spending limits, grouped by claim
  category. Each category is collapsible; international categories expand to a
  grid of per-currency cards, domestic categories to a single Rp card. Each
  card shows the remaining balance (progress bar) and the maximum limit per
  period (transaction / week / month / year). "Unlimited" → grey track, no fill.
-->
<script setup lang="ts">
import {
  MpFlex, MpText, MpIcon, MpTextlink,
  MpDrawer, MpDrawerOverlay, MpDrawerContent, MpDrawerHeader,
  MpDrawerCloseButton, MpDrawerBody,
  css,
} from '@mekari/pixel3'

defineProps<{ isOpen: boolean }>()
defineEmits<{ (e: 'close'): void }>()

// ─── Types ────────────────────────────────────────────────────────
interface PeriodLimit { amount: string; period: string }
interface CurrencyLimit {
  code: string
  name: string
  available: string
  unlimited?: boolean
  barPct?: number                 // fill width 0–100 (omit / unlimited → grey track only)
  barColor?: 'green' | 'orange' | 'red'
  limits: PeriodLimit[]
}
interface LimitCategory {
  name: string
  description: string
  international: boolean
  summary: string                 // collapsed right-hand amount
  summaryMore?: number            // "+N more" for international
  currencies: CurrencyLimit[]
}

// ─── Mock data (replace with API) ─────────────────────────────────
const categories = ref<LimitCategory[]>([
  {
    name: 'Communication',
    description: 'Communication for external use',
    international: false,
    summary: 'Rp10.000.000',
    currencies: [
      { code: 'Rp', name: 'Indonesian rupiah', available: 'Rp10.000.000', barPct: 0, limits: [
        { amount: 'Rp10.000.000', period: 'per week' },
        { amount: 'Rp40.000.000', period: 'per month' },
        { amount: 'Rp480.000.000', period: 'per year' },
      ] },
    ],
  },
  {
    name: 'Communication International',
    description: 'Communication for international use',
    international: true,
    summary: 'CAD 1.000',
    summaryMore: 3,
    currencies: [
      { code: 'CAD', name: 'Canadian Dollar', available: 'CAD 1.000', barPct: 90, barColor: 'orange', limits: [
        { amount: 'CAD 15.000', period: 'per week' },
        { amount: 'CAD 60.000', period: 'per month' },
      ] },
      { code: 'USD', name: 'US Dollar', available: 'Unlimited', unlimited: true, limits: [
        { amount: 'USD 5.000', period: 'per transaction' },
      ] },
      { code: 'EUR', name: 'Euro', available: 'EUR 2.000', barPct: 30, barColor: 'green', limits: [
        { amount: 'EUR 3.000', period: 'per month' },
      ] },
      { code: 'SGD', name: 'Singapore Dollar', available: 'SGD 800', barPct: 60, barColor: 'orange', limits: [
        { amount: 'SGD 2.000', period: 'per month' },
      ] },
    ],
  },
  {
    name: 'Transportation International',
    description: 'Transportation budget for international',
    international: true,
    summary: 'CAD 10.000',
    currencies: [
      { code: 'CAD', name: 'Canadian Dollar', available: 'CAD 10.000', barPct: 20, barColor: 'green', limits: [
        { amount: 'CAD 15.000', period: 'per week' },
        { amount: 'CAD 60.000', period: 'per month' },
        { amount: 'CAD 720.000', period: 'per year' },
      ] },
      { code: 'AUD', name: 'Australian Dollar', available: 'AUD 35.000', barPct: 50, barColor: 'orange', limits: [
        { amount: 'AUD 50.000', period: 'per transaction' },
        { amount: 'AUD 70.000', period: 'per week' },
        { amount: 'AUD 280.000', period: 'per month' },
        { amount: 'AUD 3.360.000', period: 'per year' },
      ] },
      { code: 'GBP', name: 'British Pound', available: 'GBP 0', barPct: 100, barColor: 'red', limits: [
        { amount: 'GBP 40.000', period: 'per week' },
        { amount: 'GBP 100.000', period: 'per month' },
        { amount: 'GBP 1.200.000', period: 'per year' },
      ] },
      { code: 'EUR', name: 'Euro', available: 'Unlimited', unlimited: true, limits: [
        { amount: 'EUR 2.000', period: 'per transaction' },
      ] },
      { code: 'USD', name: 'United States Dollar', available: 'Unlimited', unlimited: true, limits: [
        { amount: 'USD 12.000', period: 'per transaction' },
      ] },
    ],
  },
  {
    name: 'Transportation Domestic',
    description: 'Transportation budget for domestic',
    international: false,
    summary: 'Rp10.000.000',
    currencies: [
      { code: 'Rp', name: 'Indonesian rupiah', available: 'Rp10.000.000', barPct: 0, limits: [
        { amount: 'Rp10.000.000', period: 'per week' },
        { amount: 'Rp40.000.000', period: 'per month' },
        { amount: 'Rp480.000.000', period: 'per year' },
      ] },
    ],
  },
])

// Default expanded state mirrors the Figma key screen (last two open)
const expanded = ref<Record<number, boolean>>({ 0: false, 1: false, 2: true, 3: true })
function toggle(i: number) { expanded.value[i] = !expanded.value[i] }

// Progress-bar fills use Pixel chart-bold tokens (matching the Figma source)
const BAR_COLOR: Record<string, string> = {
  green:  'var(--mp-colors-chart-cat02-bold, #119E8F)',
  orange: 'var(--mp-colors-chart-cat04-bold, #E46910)',
  red:    'var(--mp-colors-chart-cat06-bold, #E2483D)',
}
const BAR_TRACK = 'var(--mp-colors-background-neutral-subtle, #F0F1F3)'

// ─── Styles ───────────────────────────────────────────────────────
const catHeader = css({
  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '4',
  width: 'full', paddingBlock: '3', background: 'transparent', border: 'none',
  cursor: 'pointer', textAlign: 'left',
})
const chevron = css({ color: 'gray.600', flexShrink: '0', marginTop: '2px' })
const catName = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', lineHeight: 'lg', color: 'dark' })
const catDesc = css({ fontFamily: 'body', fontSize: 'sm', lineHeight: 'lg', color: 'gray.600' })
const availLabel = css({ fontFamily: 'body', fontSize: 'xs', lineHeight: 'lg', color: 'gray.600' })
const availAmount = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', lineHeight: 'lg', color: 'dark', whiteSpace: 'nowrap' })

const cardGrid = css({
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '4',
  paddingBottom: '4',
})
const card = css({
  border: '1px solid var(--mp-colors-border-default, #DCDFE4)', borderRadius: 'lg',
  padding: '4', display: 'flex', flexDirection: 'column', gap: '3',
})
const cardTitle = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', lineHeight: 'lg', color: 'dark' })
const maxLabel = css({ fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', lineHeight: 'lg', color: 'dark' })
const limitAmount = css({ fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'dark', whiteSpace: 'nowrap' })
const limitPeriod = css({ fontFamily: 'body', fontSize: 'sm', lineHeight: 'lg', color: 'gray.600' })
</script>

<template>
  <MpDrawer
    id="my-limits-drawer"
    :is-open="isOpen"
    size="2xl"
    placement="right"
    is-block-scroll-on-mount
    @close="$emit('close')"
  >
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <MpText weight="semiBold" style="font-size:16px; line-height:24px;">My limits</MpText>
        <MpDrawerCloseButton />
      </MpDrawerHeader>

      <MpDrawerBody>
        <MpFlex direction="column" gap="0" width="full">
          <template v-for="(cat, i) in categories" :key="cat.name">

            <!-- Category header (accordion trigger) -->
            <button :class="catHeader" @click="toggle(i)">
              <MpFlex align="flex-start" gap="2" style="min-width:0;">
                <MpIcon :name="expanded[i] ? 'caret-down' : 'caret-right'" size="sm" :class="chevron" />
                <MpFlex direction="column" gap="0.5" style="min-width:0;">
                  <span :class="catName">{{ cat.name }}</span>
                  <span :class="catDesc">{{ cat.description }}</span>
                </MpFlex>
              </MpFlex>

              <!-- Collapsed summary on the right -->
              <MpFlex v-if="!expanded[i]" direction="column" align="flex-end" gap="0.5" style="flex-shrink:0;">
                <span :class="availLabel">Available to spend</span>
                <MpFlex align="center" gap="1">
                  <span :class="availAmount">{{ cat.summary }}</span>
                  <MpTextlink v-if="cat.summaryMore" size="body" style="cursor:pointer;">+{{ cat.summaryMore }} more</MpTextlink>
                </MpFlex>
              </MpFlex>
            </button>

            <!-- Expanded: per-currency cards -->
            <div v-if="expanded[i]" :class="cardGrid" :style="cat.international ? '' : 'grid-template-columns:1fr;'">
              <div v-for="cur in cat.currencies" :key="cur.code" :class="card">
                <span v-if="cur.code !== 'Rp'" :class="cardTitle">{{ cur.code }} - {{ cur.name }}</span>

                <!-- Available + progress bar -->
                <MpFlex direction="column" gap="2">
                  <MpFlex align="center" justify="space-between" gap="3">
                    <span :class="availLabel">Available to spend</span>
                    <span :class="availAmount">{{ cur.available }}</span>
                  </MpFlex>
                  <div :style="`height:8px; border-radius:999px; background:${BAR_TRACK}; overflow:hidden; width:100%;`">
                    <div
                      v-if="!cur.unlimited && cur.barPct"
                      :style="`height:100%; width:${cur.barPct}%; border-radius:999px; background:${BAR_COLOR[cur.barColor || 'green']};`"
                    />
                  </div>
                </MpFlex>

                <!-- Maximum limit per period -->
                <MpFlex direction="column" gap="2">
                  <span :class="maxLabel">Maximum limit</span>
                  <div style="display:flex; flex-wrap:wrap; gap:16px;">
                    <MpFlex
                      v-for="(lim, li) in cur.limits"
                      :key="li"
                      direction="column"
                      gap="0"
                      style="min-width:120px; flex:1 1 0;"
                    >
                      <span :class="limitAmount">{{ lim.amount }}</span>
                      <span :class="limitPeriod">{{ lim.period }}</span>
                    </MpFlex>
                  </div>
                </MpFlex>
              </div>
            </div>

          </template>
        </MpFlex>
      </MpDrawerBody>
    </MpDrawerContent>
  </MpDrawer>
</template>
