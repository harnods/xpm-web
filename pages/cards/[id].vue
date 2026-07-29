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
  MpFlex, MpText, MpButton, MpBadge,
  MpInputGroup, MpInputLeftAddon, MpInput,
  MpDrawer, MpDrawerOverlay, MpDrawerContent, MpDrawerHeader,
  MpDrawerCloseButton, MpDrawerBody, MpDrawerFooter,
  MpFormControl, MpFormLabel, MpFormHelpText, MpTextarea,
  MpBanner, MpBannerIcon, MpBannerDescription,
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

// ─── Status (local toggles — reference buttons are unwired) ────────────
type CardStatus = 'Active' | 'Frozen' | 'Inactive'
const status = ref<CardStatus>('Inactive')
const isFrozen = computed(() => status.value === 'Frozen')
const statusBadgeType = computed(() =>
  status.value === 'Frozen' ? 'warning'
    : status.value === 'Active' ? 'completed'
    : 'announcement',
)
function toggleFreeze() { status.value = isFrozen.value ? 'Active' : 'Frozen' }
function deactivate() { status.value = 'Inactive' }

// ─── Top up balance drawer ─────────────────────────────────────────────
interface Wallet { id: string; name: string; balance: string }
const wallets: Wallet[] = [
  { id: 'main',   name: 'Main account',       balance: 'Rp 0' },
  { id: 'reimb',  name: 'Reimbursement pool',  balance: 'Rp 6.773.797' },
  { id: 'float',  name: 'Card float',          balance: 'Rp 2.180.000' },
]
const isTopUpOpen = ref(false)
const selectedWallet = ref('float')
const topUpAmount = ref('0')
const topUpReason = ref('')
function formatThousands(val: string): string {
  const digits = String(val).replace(/\D/g, '')
  return digits ? Number(digits).toLocaleString('id-ID') : '0'
}
function openTopUp() {
  selectedWallet.value = 'float'
  topUpAmount.value = '0'
  topUpReason.value = ''
  isTopUpOpen.value = true
}
function proceedTopUp() { isTopUpOpen.value = false }

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

const progressWrap = css({ display: 'flex', alignItems: 'center', gap: '3', px: '5', py: '4' })
const progressTrack = css({
  flex: '1 1 auto', h: '8px', borderRadius: 'full', overflow: 'hidden',
  background: 'background.neutral.subtle',
})
const progressFill = css({ h: 'full', borderRadius: 'full', background: 'background.brand.bold', width: '60%' })
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
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.brand', background: 'background.brand',
})
const chipDivider = css({ w: '1px', h: '20px', background: 'background.neutral.subtle', flexShrink: 0 })

const actList = css({ display: 'flex', flexDirection: 'column' })
const actRow = css({
  display: 'flex', alignItems: 'center', gap: '3', px: '4', py: '3',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
  _last: { borderBottomWidth: '0' },
})
const actMeta  = css({ display: 'flex', flexDirection: 'column', gap: '0.5', minWidth: '0', flex: '1 1 auto' })
const actTitle = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default' })
const actSub   = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
const actAmount = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', whiteSpace: 'nowrap', textAlign: 'right', flexShrink: 0, width: '112px' })
const actAmountPos = css({ color: 'text.success' })
const actAmountNeg = css({ color: 'text.default' })

// Card visual
const cardVisual = css({
  borderRadius: 'lg', p: '4', aspectRatio: '1.6', color: 'white',
  display: 'flex', flexDirection: 'column',
  // brand card art — gradient constant (not a single token; only allowed raw-hex)
  backgroundImage: 'linear-gradient(135deg, #1D2656 0%, #4B61DC 100%)',
})
const cvTop = css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between' })
const cvSpacer = css({ flex: '1 1 auto' })
const cvNumWrap = css({ display: 'flex', flexDirection: 'column', gap: '0.5' })
const cvBrand = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'white' })
const cvVisa  = css({ fontFamily: 'body', fontSize: 'lg', fontWeight: 'bold', fontStyle: 'italic', color: 'white', letterSpacing: '0.04em' })
const cvName  = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'white' })
const cvBottom = css({ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '3', marginTop: '3' })
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

// Top-up wallet selectable rows
const walletList = css({ display: 'flex', flexDirection: 'column', gap: '2' })
const walletRow = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3',
  px: '4', py: '3', borderRadius: 'lg', cursor: 'pointer',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  background: 'transparent', width: 'full', textAlign: 'left',
})
const walletRowActive = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3',
  px: '4', py: '3', borderRadius: 'lg', cursor: 'pointer',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.brand',
  background: 'background.brand.selected', width: 'full', textAlign: 'left',
})
const walletName = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default' })
const walletBalance = css({ fontFamily: 'body', fontSize: 'md', color: 'text.secondary', whiteSpace: 'nowrap' })
</script>

<template>
  <!-- ═════ Title suffix badge ═════ -->
  <Teleport to="#layout-title-suffix">
    <MpBadge for="tableStatus" :type="statusBadgeType">{{ status }}</MpBadge>
  </Teleport>

  <!-- ═════ Header CTAs ═════ -->
  <Teleport to="#layout-header-actions">
    <MpFlex align="center" gap="2">
      <MpButton variant="secondary" size="md" @click="toggleFreeze">{{ isFrozen ? 'Unfreeze' : 'Freeze' }}</MpButton>
      <MpButton variant="ghost" size="md" color="text.danger" @click="deactivate">Deactivate</MpButton>
      <MpButton variant="primary" size="md" @click="openTopUp">Top up balance</MpButton>
    </MpFlex>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" min-width="0">

    <!-- ── Balance row + progress ── -->
    <div :class="card">
      <div :class="balanceGrid">
        <div v-for="c in balanceCells" :key="c.label" :class="balanceCell">
          <span :class="cellLabel">{{ c.label }}</span>
          <span :class="c.label === 'Remaining balance' ? cellBig : cellMed">{{ c.value }}</span>
          <span v-if="c.sub" :class="cellSub">{{ c.sub }}</span>
        </div>
      </div>
      <div :class="progressWrap">
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
          <MpInputGroup width="200px" flex-shrink="0">
            <MpInputLeftAddon>
              <PxIcon name="search" :size="16" color="icon.default" />
            </MpInputLeftAddon>
            <MpInput v-model="activitySearch" placeholder="Search activity…" :isFullWidth="true" />
          </MpInputGroup>
        </div>

        <div :class="actList">
          <div v-for="a in activity" :key="a.title + a.sub" :class="actRow">
            <div :class="actMeta">
              <span :class="actTitle">{{ a.title }}</span>
              <span :class="actSub">{{ a.sub }}</span>
            </div>
            <MpBadge for="tableStatus" :type="a.badgeType">{{ a.badge }}</MpBadge>
            <span :class="[actAmount, a.positive ? actAmountPos : actAmountNeg]">{{ a.amount }}</span>
          </div>
        </div>
      </div>

      <!-- RIGHT: card visual + card information -->
      <div :class="rightCol">

        <!-- VISA card visual -->
        <div :class="cardVisual">
          <div :class="cvTop">
            <span :class="cvBrand">mekari</span>
            <span :class="cvVisa">VISA</span>
          </div>
          <div :class="cvSpacer" />
          <span :class="cvName">Nabila MNC Test VCC</span>
          <div :class="cvBottom">
            <div :class="cvNumWrap">
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

  <!-- ═════ Top up card balance drawer ═════ -->
  <MpDrawer id="top-up-drawer" :is-open="isTopUpOpen" size="md" placement="right" is-block-scroll-on-mount @close="isTopUpOpen = false">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <MpText weight="semiBold" font-size="16px" line-height="24px">Top up card balance</MpText>
        <MpDrawerCloseButton />
      </MpDrawerHeader>

      <MpDrawerBody>
        <MpFlex direction="column" gap="5">
          <!-- Info banner -->
          <MpBanner id="banner-topup" variant="info" is-inline>
            <MpBannerIcon id="banner-topup-icon" />
            <MpBannerDescription id="banner-topup-desc">
              The source wallet is debited the moment the top-up succeeds — no bank transfer needed.
            </MpBannerDescription>
          </MpBanner>

          <!-- Pay from wallet -->
          <MpFormControl id="topup-wallet" isRequired>
            <MpFormLabel>Pay from wallet</MpFormLabel>
            <div :class="walletList">
              <button
                v-for="w in wallets"
                :key="w.id"
                type="button"
                :class="selectedWallet === w.id ? walletRowActive : walletRow"
                @click="selectedWallet = w.id"
              >
                <span :class="walletName">{{ w.name }}</span>
                <span :class="walletBalance">{{ w.balance }}</span>
              </button>
            </div>
          </MpFormControl>

          <!-- Top-up amount -->
          <MpFormControl id="topup-amount" isRequired>
            <MpFormLabel>Top-up amount</MpFormLabel>
            <MpInputGroup width="full">
              <MpInputLeftAddon has-background><MpText size="body" weight="semiBold">Rp</MpText></MpInputLeftAddon>
              <MpInput :modelValue="topUpAmount" placeholder="0" :isFullWidth="true"
                @input="(e: Event) => (topUpAmount = formatThousands((e.target as HTMLInputElement).value))" />
            </MpInputGroup>
            <MpFormHelpText>New card balance after top-up: Rp 100.000.000</MpFormHelpText>
          </MpFormControl>

          <!-- Reason -->
          <MpFormControl id="topup-reason">
            <MpFormLabel>Reason</MpFormLabel>
            <MpTextarea id="textarea-topup-reason" v-model="topUpReason" placeholder="Why is this card being topped up?" :isFullWidth="true" />
          </MpFormControl>
        </MpFlex>
      </MpDrawerBody>

      <MpDrawerFooter>
        <MpFlex align="center" justify="flex-end" gap="3" width="full">
          <MpButton variant="ghost" size="md" @click="isTopUpOpen = false">Cancel</MpButton>
          <MpButton variant="primary" size="md" @click="proceedTopUp">Proceed</MpButton>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>
</template>
