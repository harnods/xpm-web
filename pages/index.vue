<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Home dashboard
  Source: reference prototype (~/Downloads/Mekari.html — "Good morning, Nata")
  Token mode: Pixel DT 2.4 (data-panda-theme="next")
  Components: MpFlex, MpText, MpButton, MpBadge, MpAvatar, PxIcon, AiIcon (all Pixel 3)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Sections:
    - Header (greeting via layout title + Export / Review queue teleported to #layout-header-actions)
    - Quick actions (5 cards)  → each opens a right-side drawer
    - Stats strip (4 metrics, divider-separated)
    - Waiting on you (review list) + Copilot digest

  Drawers (static, reference-consistent):
    - New claim / New purchase request / New card  → clean Pixel forms
    - New trip policy   → replicated from prototype tpNew region (TRIP POLICIES)
    - New budget        → replicated from prototype bgNew region (BUDGETING)
    - Review claim      → opened from each "Review" row
-->
<script setup lang="ts">
import {
  MpFlex, MpText, MpButton, MpAvatar, MpBadge,
  MpFormControl, MpFormLabel, MpFormHelpText,
  MpInput, MpInputGroup, MpInputLeftAddon, MpTextarea,
  MpSelect, MpDatePicker, MpUpload, MpRadio,
  MpDrawer, MpDrawerOverlay, MpDrawerContent, MpDrawerHeader,
  MpDrawerCloseButton, MpDrawerBody, MpDrawerFooter,
  css,
} from '@mekari/pixel3'

definePageMeta({ title: 'Good morning, Nata', navKey: 'home' })

// ─── Data ────────────────────────────────────────────────────────────
type DrawerKey = 'claim' | 'trip' | 'purchase' | 'card' | 'budget'

const quickActions: { key: DrawerKey; icon: string; title: string; sub: string }[] = [
  { key: 'claim',    icon: 'reimbursement', title: 'New claim',        sub: 'Reimburse or advance' },
  { key: 'trip',     icon: 'business-trip', title: 'Request a trip',   sub: 'Costed from trip policies' },
  { key: 'purchase', icon: 'cart',          title: 'Purchase request', sub: 'Routes via approval policy' },
  { key: 'card',     icon: 'billing',       title: 'Issue a card',     sub: 'Virtual, with limits' },
  { key: 'budget',   icon: 'finance',       title: 'Set a budget',     sub: 'Pooled or per person' },
]

const stats = [
  { label: 'Needs review',           value: '13',            unit: 'items', sub: '6 flagged by policy' },
  { label: 'Awaiting your approval', value: 'Rp 18.297.890', unit: '',      sub: 'oldest waiting 4 days' },
  { label: 'To disburse',            value: 'Rp 8.120.000',  unit: '',      sub: '14 approved items · runs Fri' },
  { label: 'Spend this month',       value: 'Rp 46,2 jt',    unit: '',      sub: '+12% vs June · on budget' },
]

interface WaitingRow { name: string; memo: string; flag: string; kind: string; amount: string }
const waiting: WaitingRow[] = [
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

// ─── Static option lists (reference-consistent) ───────────────────────
const CLAIM_CATEGORIES = ['Meals & entertainment', 'Transportation', 'Accommodation', 'Software', 'Office supplies']
const ACCOUNTS         = ['Company IDR — 1234567890', 'Company USD — 9876543210', 'Petty cash — Jakarta HQ']
const PR_CATEGORIES    = ['Software & subscriptions', 'Hardware & equipment', 'Professional services', 'Facilities']
const CARD_TYPES       = ['Virtual', 'Physical']

// ─── Drawer state ──────────────────────────────────────────────────────
const open = ref<DrawerKey | null>(null)
const reviewRow = ref<WaitingRow | null>(null)

function openDrawer(k: DrawerKey) { open.value = k }
function closeDrawer() { open.value = null }
function openReview(r: WaitingRow) { reviewRow.value = r }
function closeReview() { reviewRow.value = null }

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

// ─── Drawer styles (shared) ────────────────────────────────────────────
const drawerTitle  = css({ fontFamily: 'body', fontSize: 'lg', fontWeight: 'semiBold', color: 'text.default' })
const eyebrow      = css({ fontFamily: 'body', fontSize: 'xs', fontWeight: 'semiBold', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary' })
const dTitle       = css({ fontFamily: 'body', fontSize: 'xl', fontWeight: 'bold', color: 'text.default' })
const sectionNum   = css({ fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.default' })
const sectionDesc  = css({ fontFamily: 'body', fontSize: 'sm', lineHeight: 'md', color: 'text.secondary' })
const footnote     = css({ fontFamily: 'body', fontSize: 'xs', lineHeight: 'md', color: 'text.secondary' })
const rowLabel     = css({ fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.default' })
const anyText      = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })

const addPill = css({
  display: 'inline-flex', alignItems: 'center', gap: '1', px: '3', py: '1.5',
  borderWidth: '1px', borderStyle: 'dashed', borderColor: 'border.default', borderRadius: 'full',
  fontFamily: 'body', fontSize: 'sm', color: 'text.secondary', cursor: 'pointer', bg: 'background.neutral',
  transition: 'border-color 120ms ease, color 120ms ease',
  _hover: { borderColor: 'border.bold', color: 'text.default' },
})
const optPill = css({
  display: 'inline-flex', alignItems: 'center', gap: '1', px: '3', py: '1.5',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default', borderRadius: 'full',
  fontFamily: 'body', fontSize: 'sm', color: 'text.default', cursor: 'pointer', bg: 'background.neutral',
  transition: 'border-color 120ms ease',
  _hover: { borderColor: 'border.bold' },
})
const optPillOn = css({
  display: 'inline-flex', alignItems: 'center', gap: '1', px: '3', py: '1.5',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--mp-colors-indigo-200)', borderRadius: 'full',
  fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'var(--mp-colors-indigo-600)',
  cursor: 'pointer', bg: 'background.brand',
})
const capRow = css({
  display: 'flex', alignItems: 'center', gap: '2', flexWrap: 'wrap', p: '3',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default', borderRadius: 'md',
  bg: 'background.neutral',
})
const capName = css({ fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.default', minWidth: '84px' })
const reviewMeta = css({
  display: 'flex', flexDirection: 'column', gap: '1', p: '4', borderRadius: 'md',
  bg: 'background.neutral.subtle',
})
</script>

<template>
  <!-- ═════ Header eyebrow + CTAs (into layout title bar) ═════ -->
  <Teleport to="#layout-title-suffix">
    <span :class="dateEyebrow">Tuesday, July 21</span>
  </Teleport>
  <Teleport to="#layout-header-actions">
    <MpFlex align="center" gap="2">
      <MpButton variant="secondary" size="md" left-icon="download">Export</MpButton>
      <MpButton variant="primary" size="md" @click="navigateTo('/inbox')">Review queue</MpButton>
    </MpFlex>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" style="min-width:0;">

    <!-- Quick actions -->
    <div :class="quickGrid">
      <button v-for="a in quickActions" :key="a.title" type="button" :class="quickCard" @click="openDrawer(a.key)">
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
          <MpButton variant="textLink" size="sm" right-icon="arrows-right" @click="navigateTo('/inbox')">Open inbox</MpButton>
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
            <MpButton variant="secondary" size="sm" @click="openReview(r)">Review</MpButton>
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

  <!-- ═════════════════════════ DRAWERS ═════════════════════════ -->

  <!-- New claim -->
  <MpDrawer id="home-claim-drawer" :is-open="open === 'claim'" size="md" placement="right" is-block-scroll-on-mount @close="closeDrawer">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <span :class="drawerTitle">New claim</span>
        <MpDrawerCloseButton />
      </MpDrawerHeader>
      <MpDrawerBody>
        <MpFlex direction="column" gap="5" width="full">
          <MpFormControl id="claim-category" isRequired>
            <MpFormLabel>Category</MpFormLabel>
            <MpSelect id="claim-category-select" placeholder="Select category" :is-full-width="true">
              <option v-for="c in CLAIM_CATEGORIES" :key="c" :value="c">{{ c }}</option>
            </MpSelect>
          </MpFormControl>

          <MpFormControl id="claim-amount" isRequired>
            <MpFormLabel>Amount</MpFormLabel>
            <MpInputGroup style="width:100%;">
              <MpInputLeftAddon has-background><MpText size="body" weight="semiBold">Rp</MpText></MpInputLeftAddon>
              <MpInput id="claim-amount-input" placeholder="0" :is-full-width="true" />
            </MpInputGroup>
          </MpFormControl>

          <MpFormControl id="claim-date" isRequired>
            <MpFormLabel>Date</MpFormLabel>
            <MpDatePicker id="claim-date-picker" format="DD MMM YYYY" value-type="date" placeholder="Select date" :use-portal="true" />
          </MpFormControl>

          <MpFormControl id="claim-description">
            <MpFormLabel>Description</MpFormLabel>
            <MpTextarea id="claim-description-input" placeholder="Enter description" :is-full-width="true" maxlength="600" />
          </MpFormControl>

          <MpFormControl id="claim-receipt" isRequired>
            <MpFormLabel>Receipt</MpFormLabel>
            <MpUpload button-text="Browse file" :is-multiple="true" accept=".jpg,.jpeg,.png,.pdf" placeholder="No file selected" />
            <MpFormHelpText>JPG, PNG or PDF, max 5MB. Up to 5 files.</MpFormHelpText>
          </MpFormControl>

          <MpFormControl id="claim-account" isRequired>
            <MpFormLabel>Account</MpFormLabel>
            <MpSelect id="claim-account-select" placeholder="Select account" :is-full-width="true">
              <option v-for="a in ACCOUNTS" :key="a" :value="a">{{ a }}</option>
            </MpSelect>
          </MpFormControl>
        </MpFlex>
      </MpDrawerBody>
      <MpDrawerFooter>
        <MpFlex justify="flex-end" gap="2" width="full">
          <MpButton variant="ghost" @click="closeDrawer">Cancel</MpButton>
          <MpButton variant="primary" @click="closeDrawer">Submit claim</MpButton>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>

  <!-- New trip policy — replicated from prototype tpNew region -->
  <MpDrawer id="home-trip-drawer" :is-open="open === 'trip'" size="xl" placement="right" is-block-scroll-on-mount @close="closeDrawer">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <MpFlex direction="column" gap="0.5">
          <span :class="eyebrow">TRIP POLICIES</span>
          <span :class="dTitle">New trip policy</span>
        </MpFlex>
        <MpDrawerCloseButton />
      </MpDrawerHeader>
      <MpDrawerBody>
        <MpFlex direction="column" gap="6" width="full">
          <MpFormControl id="trip-name">
            <MpFormLabel>Policy name</MpFormLabel>
            <MpInput id="trip-name-input" placeholder="Policy name — e.g. Jakarta metro standard" :is-full-width="true" />
          </MpFormControl>

          <!-- 1 · WHO & WHERE -->
          <MpFlex direction="column" gap="3">
            <span :class="sectionNum">1 · WHO &amp; WHERE</span>
            <span :class="sectionDesc">Combine zone, organization, branch and people — add OR groups for either/or scopes, e.g. Zone 2 for Sales, or Zone 3 for Dana</span>
            <MpFlex direction="column" gap="3" style="border:1px solid var(--mp-colors-border-default); border-radius:8px; padding:16px;">
              <span :class="footnote">CRITERIA 1 — leave a row empty for any</span>
              <MpFlex v-for="r in ['Zone', 'Organization', 'Branch', 'Job level', 'People']" :key="r" align="center" justify="space-between" gap="3">
                <span :class="rowLabel">{{ r }}</span>
                <MpFlex align="center" gap="2">
                  <span :class="addPill">+ Add</span>
                  <span :class="anyText">— any</span>
                </MpFlex>
              </MpFlex>
            </MpFlex>
            <span :class="addPill" style="align-self:flex-start;">+ Add OR group</span>
          </MpFlex>

          <!-- 2 · RATES -->
          <MpFlex direction="column" gap="3">
            <span :class="sectionNum">2 · RATES</span>
            <span :class="sectionDesc">Rates per component — what each part of a trip request is costed and capped at</span>
            <MpFlex v-for="c in ['Lodging', 'Transport', 'Meals & incidentals']" :key="c" :class="capRow">
              <span :class="capName">{{ c }}</span>
              <MpInputGroup style="flex:1 1 auto; min-width:160px;">
                <MpInputLeftAddon has-background><MpText size="body" weight="semiBold">Rp</MpText></MpInputLeftAddon>
                <MpInput :id="`trip-rate-${c}`" placeholder="0" :is-full-width="true" />
              </MpInputGroup>
              <span :class="optPill">per day</span>
            </MpFlex>
            <span :class="addPill" style="align-self:flex-start;">+ Item rate</span>
            <MpFlex align="flex-start" gap="2" style="margin-top:4px;">
              <MpRadio id="trip-over" name="trip-over" value="allow">Allow submission outside budget</MpRadio>
            </MpFlex>
            <span :class="footnote">Requests above these rates can still be submitted; approvers see an over-rate flag. Unchecked, they are blocked at submission.</span>
          </MpFlex>
        </MpFlex>
      </MpDrawerBody>
      <MpDrawerFooter>
        <MpFlex justify="flex-end" gap="2" width="full">
          <MpButton variant="ghost" @click="closeDrawer">Cancel</MpButton>
          <MpButton variant="primary" @click="closeDrawer">Save policy</MpButton>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>

  <!-- New purchase request -->
  <MpDrawer id="home-purchase-drawer" :is-open="open === 'purchase'" size="md" placement="right" is-block-scroll-on-mount @close="closeDrawer">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <span :class="drawerTitle">New purchase request</span>
        <MpDrawerCloseButton />
      </MpDrawerHeader>
      <MpDrawerBody>
        <MpFlex direction="column" gap="5" width="full">
          <MpFormControl id="pr-vendor" isRequired>
            <MpFormLabel>Vendor</MpFormLabel>
            <MpInput id="pr-vendor-input" placeholder="Enter vendor" :is-full-width="true" />
          </MpFormControl>

          <MpFormControl id="pr-category" isRequired>
            <MpFormLabel>Category</MpFormLabel>
            <MpSelect id="pr-category-select" placeholder="Select category" :is-full-width="true">
              <option v-for="c in PR_CATEGORIES" :key="c" :value="c">{{ c }}</option>
            </MpSelect>
          </MpFormControl>

          <MpFormControl id="pr-amount" isRequired>
            <MpFormLabel>Amount</MpFormLabel>
            <MpInputGroup style="width:100%;">
              <MpInputLeftAddon has-background><MpText size="body" weight="semiBold">Rp</MpText></MpInputLeftAddon>
              <MpInput id="pr-amount-input" placeholder="0" :is-full-width="true" />
            </MpInputGroup>
          </MpFormControl>

          <MpFormControl id="pr-needed" isRequired>
            <MpFormLabel>Needed by</MpFormLabel>
            <MpDatePicker id="pr-needed-picker" format="DD MMM YYYY" value-type="date" placeholder="Select date" :use-portal="true" />
          </MpFormControl>

          <MpFormControl id="pr-description">
            <MpFormLabel>Description</MpFormLabel>
            <MpTextarea id="pr-description-input" placeholder="Enter description" :is-full-width="true" maxlength="600" />
          </MpFormControl>

          <MpFormControl id="pr-account" isRequired>
            <MpFormLabel>Account</MpFormLabel>
            <MpSelect id="pr-account-select" placeholder="Select account" :is-full-width="true">
              <option v-for="a in ACCOUNTS" :key="a" :value="a">{{ a }}</option>
            </MpSelect>
          </MpFormControl>
        </MpFlex>
      </MpDrawerBody>
      <MpDrawerFooter>
        <MpFlex justify="flex-end" gap="2" width="full">
          <MpButton variant="ghost" @click="closeDrawer">Cancel</MpButton>
          <MpButton variant="primary" @click="closeDrawer">Submit request</MpButton>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>

  <!-- New card -->
  <MpDrawer id="home-card-drawer" :is-open="open === 'card'" size="md" placement="right" is-block-scroll-on-mount @close="closeDrawer">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <span :class="drawerTitle">New card</span>
        <MpDrawerCloseButton />
      </MpDrawerHeader>
      <MpDrawerBody>
        <MpFlex direction="column" gap="5" width="full">
          <MpFormControl id="card-name" isRequired>
            <MpFormLabel>Card name</MpFormLabel>
            <MpInput id="card-name-input" placeholder="e.g. Marketing subscriptions" :is-full-width="true" />
          </MpFormControl>

          <MpFormControl id="card-holder" isRequired>
            <MpFormLabel>Cardholder</MpFormLabel>
            <MpInput id="card-holder-input" placeholder="Search team member" :is-full-width="true" />
          </MpFormControl>

          <MpFormControl id="card-type" isRequired>
            <MpFormLabel>Type</MpFormLabel>
            <MpFlex align="center" gap="4">
              <MpRadio v-for="(t, i) in CARD_TYPES" :id="`card-type-${t}`" :key="t" name="card-type" :value="t" :model-value="i === 0 ? 'Virtual' : undefined">{{ t }}</MpRadio>
            </MpFlex>
          </MpFormControl>

          <MpFormControl id="card-limit" isRequired>
            <MpFormLabel>Spend limit</MpFormLabel>
            <MpInputGroup style="width:100%;">
              <MpInputLeftAddon has-background><MpText size="body" weight="semiBold">Rp</MpText></MpInputLeftAddon>
              <MpInput id="card-limit-input" placeholder="0" :is-full-width="true" />
            </MpInputGroup>
          </MpFormControl>

          <MpFormControl id="card-account" isRequired>
            <MpFormLabel>Account</MpFormLabel>
            <MpSelect id="card-account-select" placeholder="Select account" :is-full-width="true">
              <option v-for="a in ACCOUNTS" :key="a" :value="a">{{ a }}</option>
            </MpSelect>
          </MpFormControl>
        </MpFlex>
      </MpDrawerBody>
      <MpDrawerFooter>
        <MpFlex justify="flex-end" gap="2" width="full">
          <MpButton variant="ghost" @click="closeDrawer">Cancel</MpButton>
          <MpButton variant="primary" @click="closeDrawer">Create card</MpButton>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>

  <!-- New budget — replicated from prototype bgNew region -->
  <MpDrawer id="home-budget-drawer" :is-open="open === 'budget'" size="xl" placement="right" is-block-scroll-on-mount @close="closeDrawer">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <MpFlex direction="column" gap="0.5">
          <span :class="eyebrow">BUDGETING</span>
          <span :class="dTitle">New budget</span>
        </MpFlex>
        <MpDrawerCloseButton />
      </MpDrawerHeader>
      <MpDrawerBody>
        <MpFlex direction="column" gap="6" width="full">
          <!-- 1 · WHO -->
          <MpFlex direction="column" gap="3">
            <span :class="sectionNum">1 · WHO</span>
            <span :class="sectionDesc">Select one or several — leaving a row empty includes all: no organization applies company-wide, no branch covers the whole organization</span>
            <MpFlex v-for="r in ['Organization', 'Branch']" :key="r" align="center" justify="space-between" gap="3">
              <span :class="rowLabel">{{ r }}</span>
              <MpFlex align="center" gap="2">
                <span :class="addPill">+ Add</span>
                <span :class="anyText">— any</span>
              </MpFlex>
            </MpFlex>
          </MpFlex>

          <!-- 2 · PERIOD -->
          <MpFlex direction="column" gap="3">
            <span :class="sectionNum">2 · PERIOD</span>
            <span :class="sectionDesc">Budgets with different periods coexist — e.g. a monthly cap and a yearly envelope for the same scope</span>
            <MpFlex align="center" gap="2" wrap="wrap">
              <span :class="optPill">Weekly</span>
              <span :class="optPillOn">✓ Monthly</span>
              <span :class="optPill">Quarterly</span>
              <span :class="optPill">Yearly</span>
            </MpFlex>
          </MpFlex>

          <!-- 3 · CATEGORY CAPS -->
          <MpFlex direction="column" gap="3">
            <span :class="sectionNum">3 · CATEGORY CAPS</span>
            <span :class="sectionDesc">Amount per period — pooled for the whole scope, or per person so it scales with headcount</span>
            <MpFlex :class="capRow">
              <span :class="capName">All spend</span>
              <MpInputGroup style="flex:1 1 auto; min-width:160px;">
                <MpInputLeftAddon has-background><MpText size="body" weight="semiBold">Rp</MpText></MpInputLeftAddon>
                <MpInput id="budget-cap-input" placeholder="0" :is-full-width="true" />
              </MpInputGroup>
              <span :class="optPill">Pooled</span>
              <span :class="optPill">Hard cap</span>
            </MpFlex>
            <MpFlex align="center" gap="2" wrap="wrap">
              <span v-for="c in ['All spend', 'Meals', 'Transport', 'Accommodation', 'Software', 'Recruitment', 'Golf & entertainment']" :key="c" :class="addPill">+ {{ c }}</span>
            </MpFlex>
            <span :class="footnote">Track = meter only · Flag = warn approvers · Hard cap = auto-reject over the cap · Per person = each employee gets their own allowance (e.g. an AI budget per engineer), and the envelope scales with headcount</span>
          </MpFlex>
        </MpFlex>
      </MpDrawerBody>
      <MpDrawerFooter>
        <MpFlex justify="flex-end" gap="2" width="full">
          <MpButton variant="ghost" @click="closeDrawer">Cancel</MpButton>
          <MpButton variant="primary" @click="closeDrawer">Save budget</MpButton>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>

  <!-- Review claim -->
  <MpDrawer id="home-review-drawer" :is-open="!!reviewRow" size="sm" placement="right" is-block-scroll-on-mount @close="closeReview">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <span :class="drawerTitle">Review claim</span>
        <MpDrawerCloseButton />
      </MpDrawerHeader>
      <MpDrawerBody>
        <MpFlex v-if="reviewRow" direction="column" gap="4" width="full">
          <MpFlex align="center" gap="3">
            <MpAvatar :id="`rev-${reviewRow.name}`" :name="reviewRow.name" size="md" variant-color="gray" />
            <MpFlex direction="column" gap="0.5">
              <span :class="rowLabel">{{ reviewRow.name }}</span>
              <span :class="cardSub">Requester</span>
            </MpFlex>
          </MpFlex>

          <div :class="reviewMeta">
            <span :class="cardSub">Memo</span>
            <span :class="rowLabel">{{ reviewRow.memo }}</span>
          </div>

          <MpFlex align="center" justify="space-between" gap="3">
            <span :class="cardSub">Flag</span>
            <MpFlex align="center" gap="1.5">
              <span :class="dot" :style="{ background: DOT[reviewRow.kind] }" />
              <span :class="rowLabel">{{ reviewRow.flag }}</span>
            </MpFlex>
          </MpFlex>

          <MpFlex align="center" justify="space-between" gap="3">
            <span :class="cardSub">Amount</span>
            <span :class="statValue" style="font-size:20px;">{{ reviewRow.amount }}</span>
          </MpFlex>
        </MpFlex>
      </MpDrawerBody>
      <MpDrawerFooter>
        <MpFlex justify="flex-end" gap="2" width="full">
          <MpButton variant="secondary" @click="closeReview">Decline</MpButton>
          <MpButton variant="primary" @click="closeReview">Approve</MpButton>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>
</template>
