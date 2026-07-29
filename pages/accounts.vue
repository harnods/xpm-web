<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Accounts (company wallets)
  Token mode: Pixel DT 2.4 (data-panda-theme="next")
  Components: MpFlex, MpText, MpButton, MpBadge, MpToggle, MpDrawer*, PxIcon (all Pixel 3)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Interactive:
    - Wallet list: click a wallet → selection + right-side heading/stats/movement update
    - Currency IDR/USD segmented toggle switches the active pill + per-currency data
    - Tabs Transactions / Wallet settings switch the right-column content
    - Edit wallet / Move money / Top up (+ banner "Top up now") open right-side drawers
-->
<script setup lang="ts">
import {
  MpFlex, MpText, MpButton, MpBadge, MpToggle,
  MpDrawer, MpDrawerOverlay, MpDrawerContent, MpDrawerHeader,
  MpDrawerCloseButton, MpDrawerBody, MpDrawerFooter,
  css, token,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Accounts',
  subtitle: 'Manage company wallets, balances and money movement.',
  navKey: 'accounts',
})

// ─── Types ─────────────────────────────────────────────────────────────
interface Line { amt: string; cur: string }
interface Txn { date: string; desc: string; in: string; out: string; balance: string }
interface CurData { balance: string; pending: string; moneyIn: string; moneyOut: string; zero?: boolean; txns: Txn[] }
interface Rule { branch: string; type: string; scope: string }
interface Wallet {
  id: string
  name: string
  tag: string
  default?: boolean
  type: string
  description: string
  owner: string
  ownerMeta: string
  ownerInit: string
  created: string
  updated: string
  lines: Line[]
  currencies: string[]
  data: Record<string, CurData>
  rules: Rule[]
}

// ─── Data (static per-wallet mock) ──────────────────────────────────────
const wallets: Wallet[] = [
  {
    id: 'main',
    name: 'Main account',
    tag: 'Primary wallet',
    default: true,
    type: 'Primary',
    description: 'Company operating account — funds pending payouts and reimbursements.',
    owner: 'Dirman Suharno',
    ownerMeta: 'Finance · Owner',
    ownerInit: 'DS',
    created: '12 Jan 2025',
    updated: '20 Jul 2026',
    currencies: ['IDR', 'USD'],
    lines: [
      { amt: 'Rp 0', cur: 'IDR' },
      { amt: '$930.00', cur: 'USD' },
    ],
    data: {
      IDR: {
        balance: 'Rp 0', pending: 'Rp 551.435.464', moneyIn: 'Rp 25.000.000', moneyOut: 'Rp 19.173.797', zero: true,
        txns: [
          { date: '22 Jul 2026', desc: 'Reimbursement payout',   in: '',              out: 'Rp 6.773.797',  balance: 'Rp 0' },
          { date: '20 Jul 2026', desc: 'Top up · bank transfer', in: 'Rp 25.000.000', out: '',              balance: 'Rp 6.773.797' },
          { date: '18 Jul 2026', desc: 'Bill payment · Movus',   in: '',              out: 'Rp 12.400.000', balance: 'Rp -18.226.203' },
        ],
      },
      USD: {
        balance: '$930.00', pending: '$0.00', moneyIn: '$1,200.00', moneyOut: '$270.00',
        txns: [
          { date: '21 Jul 2026', desc: 'Vendor refund · Figma',  in: '$1,200.00', out: '',        balance: '$930.00' },
          { date: '15 Jul 2026', desc: 'Subscription · Notion',  in: '',          out: '$270.00', balance: '-$270.00' },
        ],
      },
    },
    rules: [
      { branch: 'All branches',   type: 'Reimbursements', scope: 'Any policy' },
      { branch: 'Jakarta HQ',     type: 'Bill payments',  scope: 'Vendor policy' },
    ],
  },
  {
    id: 'reimb',
    name: 'Reimbursement pool',
    tag: 'Sub-wallet',
    type: 'Sub-wallet',
    description: 'Dedicated pool for employee reimbursement payouts.',
    owner: 'Ayu Prawira',
    ownerMeta: 'People Ops · Owner',
    ownerInit: 'AP',
    created: '03 Mar 2025',
    updated: '22 Jul 2026',
    currencies: ['IDR'],
    lines: [
      { amt: 'Rp 6.773.797', cur: 'IDR' },
    ],
    data: {
      IDR: {
        balance: 'Rp 6.773.797', pending: 'Rp 0', moneyIn: 'Rp 25.000.000', moneyOut: 'Rp 18.226.203',
        txns: [
          { date: '20 Jul 2026', desc: 'Transfer from Main account', in: 'Rp 25.000.000', out: '',              balance: 'Rp 6.773.797' },
          { date: '19 Jul 2026', desc: 'Reimbursement · A. Wibowo',  in: '',              out: 'Rp 5.826.203',  balance: 'Rp -18.226.203' },
          { date: '12 Jul 2026', desc: 'Reimbursement · L. Sari',    in: '',              out: 'Rp 12.400.000', balance: 'Rp -12.400.000' },
        ],
      },
    },
    rules: [
      { branch: 'All branches', type: 'Reimbursements', scope: 'Any policy' },
    ],
  },
  {
    id: 'card',
    name: 'Card float',
    tag: 'Sub-wallet',
    type: 'Sub-wallet',
    description: 'Prepaid float that funds issued corporate cards.',
    owner: 'Bima Nugraha',
    ownerMeta: 'Finance · Owner',
    ownerInit: 'BN',
    created: '18 May 2025',
    updated: '17 Jul 2026',
    currencies: ['IDR', 'SGD'],
    lines: [
      { amt: 'Rp 2.180.000', cur: 'IDR' },
      { amt: 'S$120.00', cur: 'SGD' },
    ],
    data: {
      IDR: {
        balance: 'Rp 2.180.000', pending: 'Rp 0', moneyIn: 'Rp 5.000.000', moneyOut: 'Rp 2.820.000',
        txns: [
          { date: '17 Jul 2026', desc: 'Card spend · Grab',           in: '',             out: 'Rp 320.000',    balance: 'Rp 2.180.000' },
          { date: '14 Jul 2026', desc: 'Top up · from Main account',  in: 'Rp 5.000.000', out: '',              balance: 'Rp 2.500.000' },
          { date: '10 Jul 2026', desc: 'Card spend · AWS',            in: '',             out: 'Rp 2.500.000',  balance: 'Rp -2.500.000' },
        ],
      },
      SGD: {
        balance: 'S$120.00', pending: 'S$0.00', moneyIn: 'S$500.00', moneyOut: 'S$380.00',
        txns: [
          { date: '16 Jul 2026', desc: 'Card spend · Canva', in: '',        out: 'S$80.00',  balance: 'S$120.00' },
          { date: '09 Jul 2026', desc: 'Top up · FX',        in: 'S$500.00', out: '',         balance: 'S$200.00' },
        ],
      },
    },
    rules: [
      { branch: 'All branches', type: 'Card spend', scope: 'Corporate card policy' },
    ],
  },
]

// ─── Reactive selection ──────────────────────────────────────────────
const selectedIdx = ref(0)
const activeCurrency = ref('IDR')

const selectedWallet = computed(() => wallets[selectedIdx.value])
const currencyTabs = computed(() => selectedWallet.value.currencies)
const showCurrency = computed(() => currencyTabs.value.length > 1)
const cur = computed<CurData>(() => selectedWallet.value.data[activeCurrency.value])

function selectWallet(i: number) {
  selectedIdx.value = i
  // Reset currency to the wallet's first available currency
  activeCurrency.value = wallets[i].currencies[0]
}

const contentTabs = ['Transactions', 'Wallet settings']
const activeTab = ref('Transactions')

const typeChips = ['All', 'Top-ups', 'Payments', 'FX']
const activeType = ref('All')

const periodChips = ['This month', 'Last month', 'All time']
const activePeriod = ref('All time')

// Derived heading + stats + banner
const heading = computed(() => `${selectedWallet.value.name} · ${activeCurrency.value} movement`)
const showBanner = computed(() => !!cur.value.zero)
const stats = computed(() => [
  { label: `Balance · ${activeCurrency.value}`, value: cur.value.balance,   color: 'text.default', big: true },
  { label: 'Pending payouts',                   value: cur.value.pending,   color: 'text.warning' },
  { label: 'Money in · Jul',                    value: cur.value.moneyIn,   color: 'text.success' },
  { label: 'Money out · Jul',                   value: cur.value.moneyOut,  color: 'text.default' },
])

// ─── Drawer state ──────────────────────────────────────────────────────
const editOpen = ref(false)
const moveOpen = ref(false)
const topOpen = ref(false)

// Edit wallet form
const editName = ref('')
const editCurrency = ref('IDR')
const editType = ref('Primary')
const editDefault = ref(false)
const walletTypes = ['Primary', 'Sub-wallet', 'Card float']

function openEdit() {
  const w = selectedWallet.value
  editName.value = w.name
  editCurrency.value = w.currencies[0]
  editType.value = w.type
  editDefault.value = !!w.default
  editOpen.value = true
}

// Move money form
const moveFrom = ref('main')
const moveTo = ref('reimb')
const moveAmount = ref('')
const moveNote = ref('')
function openMove() {
  moveFrom.value = selectedWallet.value.id
  moveTo.value = wallets.find(w => w.id !== selectedWallet.value.id)?.id ?? selectedWallet.value.id
  moveAmount.value = ''
  moveNote.value = ''
  moveOpen.value = true
}

// Top up form
const topAmount = ref('')
const topSource = ref('Bank transfer')
const topNote = ref('')
const topSources = ['Bank transfer', 'From Main account', 'Virtual account']
function openTop() {
  topAmount.value = ''
  topSource.value = 'Bank transfer'
  topNote.value = ''
  topOpen.value = true
}

// ─── CSS ─────────────────────────────────────────────────────────────
const mutedLine = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })

// Warning banner
const banner = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3',
  bg: 'background.danger', borderWidth: '1px', borderStyle: 'solid',
  borderColor: 'border.danger', borderRadius: 'lg',
  px: '4', py: '3',
})
const bannerLeft = css({ display: 'flex', alignItems: 'center', gap: '2.5', minWidth: 0 })
const bannerDot  = css({ w: '8px', h: '8px', borderRadius: 'full', flexShrink: 0, bg: 'icon.warning' })
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
  cursor: 'pointer', textAlign: 'left', background: 'transparent', border: 'none', width: 'full',
  _hover: { bg: 'background.neutral.subtle' },
})
const walletItemActive = css({
  display: 'flex', flexDirection: 'column', gap: '1', px: '3', py: '2.5', borderRadius: 'md',
  cursor: 'pointer', textAlign: 'left', width: 'full', border: 'none',
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

// ─── Wallet settings panel ─────────────────────────────────────────────
const settingsCard = css({
  bg: 'background.neutral', borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  borderRadius: 'lg', display: 'flex', flexDirection: 'column',
})
const settingsHead = css({
  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '4',
  px: '5', py: '4',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
})
const settingsTitle = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default' })
const settingsSub = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
const settingsBody = css({ display: 'flex', flexDirection: 'column', px: '5', py: '2' })
const settingsRow = css({
  display: 'grid', gridTemplateColumns: '180px minmax(0, 1fr)', gap: '4', py: '3',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
  _last: { borderBottomWidth: '0' },
})
const settingsKey = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
const settingsVal = css({ fontFamily: 'body', fontSize: 'md', color: 'text.default' })
const ownerWrap = css({ display: 'flex', alignItems: 'center', gap: '2.5' })
const avatar = css({
  w: '32px', h: '32px', borderRadius: 'full', flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  bg: 'background.brand.selected', color: 'text.link',
  fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold',
})
const ruleRow = css({
  display: 'flex', alignItems: 'center', gap: '2', py: '3', flexWrap: 'wrap',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
  _last: { borderBottomWidth: '0' },
})
const ruleTag = css({
  fontFamily: 'body', fontSize: 'sm', color: 'text.default',
  px: '2.5', py: '1', borderRadius: 'md',
  bg: 'background.neutral.subtle', borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
})
const ruleScope = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })

// ─── Drawer form styles ──────────────────────────────────────────────
const fieldLabel = css({ fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.default', mb: '1.5', display: 'block' })
const fieldHint  = css({ fontFamily: 'body', fontSize: 'xs', color: 'text.secondary', mt: '1.5' })
const inputBase = css({
  width: 'full', fontFamily: 'body', fontSize: 'md', color: 'text.default',
  px: '3', py: '2.5', borderRadius: 'md', bg: 'background.neutral',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  _focus: { outline: 'none', borderColor: 'border.brand', boxShadow: `0 0 0 3px ${token.var('colors.background.brand.selected')}` },
})
const textareaBase = css({
  width: 'full', fontFamily: 'body', fontSize: 'md', color: 'text.default',
  px: '3', py: '2.5', borderRadius: 'md', bg: 'background.neutral', minHeight: '84px', resize: 'vertical',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  _focus: { outline: 'none', borderColor: 'border.brand', boxShadow: `0 0 0 3px ${token.var('colors.background.brand.selected')}` },
})
const amountWrap = css({
  display: 'flex', alignItems: 'center', gap: '2', px: '3', py: '2.5', borderRadius: 'md', bg: 'background.neutral',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  _focusWithin: { borderColor: 'border.brand', boxShadow: `0 0 0 3px ${token.var('colors.background.brand.selected')}` },
})
const amountPrefix = css({ fontFamily: 'body', fontSize: 'md', color: 'text.secondary', flexShrink: 0 })
const amountInput = css({
  flex: 1, fontFamily: 'body', fontSize: 'md', color: 'text.default', border: 'none', outline: 'none', background: 'transparent', width: 'full',
})
const toggleRow = css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4' })

// Stat value color classes (semantic tokens)
const statColors: Record<string, string> = {
  'text.default': css({ color: 'text.default' }),
  'text.warning': css({ color: 'text.warning' }),
  'text.success': css({ color: 'text.success' }),
}
// Money-in cell (positive)
const moneyIn = css({ color: 'text.success' })
// Drawer heading (16px / 24px)
const drawerHeading = css({ fontSize: 'lg', lineHeight: 'xl' })
</script>

<template>
  <!-- ═════ Header CTAs ═════ -->
  <Teleport to="#layout-header-actions">
    <MpFlex align="center" gap="2">
      <MpButton variant="secondary" size="md" @click="openEdit">Edit wallet</MpButton>
      <MpButton variant="secondary" size="md" left-icon="transfer" @click="openMove">Move money</MpButton>
      <MpButton variant="primary" size="md" @click="openTop">Top up</MpButton>
    </MpFlex>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" minWidth="0">

    <!-- All-wallets total -->
    <span :class="mutedLine">All wallets ≈ Rp 25.572.177</span>

    <!-- Zero-balance warning banner -->
    <div v-if="showBanner" :class="banner">
      <div :class="bannerLeft">
        <span :class="bannerDot" />
        <span :class="bannerText">{{ selectedWallet.name }} is at zero — top up to release pending payouts.</span>
      </div>
      <MpButton variant="primary" size="sm" @click="openTop">Top up now</MpButton>
    </div>

    <!-- Two-column layout -->
    <div :class="twoCol">

      <!-- LEFT — wallet list -->
      <div :class="walletCard">
        <span :class="walletHead">Wallets</span>
        <div :class="walletList">
          <button
            v-for="(w, i) in wallets" :key="w.id" type="button"
            :class="selectedIdx === i ? walletItemActive : walletItem"
            @click="selectWallet(i)"
          >
            <div :class="walletTop">
              <MpFlex align="center" gap="2">
                <span :class="walletName">{{ w.name }}</span>
                <MpBadge v-if="w.default" for="tableStatus" type="information">Default</MpBadge>
              </MpFlex>
              <span :class="walletTag">{{ w.tag }}</span>
            </div>
            <span v-for="l in w.lines" :key="l.cur" :class="walletBal">{{ l.amt }} · {{ l.cur }}</span>
          </button>
        </div>
        <div :class="addWalletWrap">
          <MpButton variant="textLink" size="md" left-icon="add">Add wallet</MpButton>
        </div>
      </div>

      <!-- RIGHT — balances + transactions / settings -->
      <div :class="rightCol">

        <!-- Currency segmented toggle -->
        <div v-if="showCurrency" :class="segment">
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
            <span :class="[s.big ? statBig : statValue, statColors[s.color]]">{{ s.value }}</span>
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

        <!-- ─── Transactions tab ─── -->
        <template v-if="activeTab === 'Transactions'">
          <!-- Sub-title + filter chips -->
          <MpFlex direction="column" gap="3">
            <span :class="subTitle">{{ heading }}</span>
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
              <tr v-for="(r, i) in cur.txns" :key="i">
                <td :class="td">{{ r.date }}</td>
                <td :class="td">{{ r.desc }}</td>
                <td :class="tdNum">
                  <span v-if="r.in" :class="moneyIn">{{ r.in }}</span>
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
        </template>

        <!-- ─── Wallet settings tab ─── -->
        <template v-else>
          <!-- Wallet details -->
          <div :class="settingsCard">
            <div :class="settingsHead">
              <MpFlex direction="column" gap="0.5" minWidth="0">
                <span :class="settingsTitle">Wallet details</span>
                <span :class="settingsSub">Name, purpose and the people accountable for this wallet</span>
              </MpFlex>
              <MpButton variant="secondary" size="sm" @click="openEdit">Edit</MpButton>
            </div>
            <div :class="settingsBody">
              <div :class="settingsRow">
                <span :class="settingsKey">Wallet name</span>
                <span :class="settingsVal">{{ selectedWallet.name }}</span>
              </div>
              <div :class="settingsRow">
                <span :class="settingsKey">Description</span>
                <span :class="settingsVal">{{ selectedWallet.description }}</span>
              </div>
              <div :class="settingsRow">
                <span :class="settingsKey">Wallet type</span>
                <span :class="settingsVal">{{ selectedWallet.type }}</span>
              </div>
              <div :class="settingsRow">
                <span :class="settingsKey">Currency</span>
                <span :class="settingsVal">{{ selectedWallet.currencies.join(' · ') }}</span>
              </div>
              <div :class="settingsRow">
                <span :class="settingsKey">Default account</span>
                <span :class="settingsVal">{{ selectedWallet.default ? 'Yes — company default' : 'No' }}</span>
              </div>
              <div :class="settingsRow">
                <span :class="settingsKey">Wallet owner</span>
                <div :class="ownerWrap">
                  <span :class="avatar">{{ selectedWallet.ownerInit }}</span>
                  <MpFlex direction="column" gap="0">
                    <span :class="settingsVal">{{ selectedWallet.owner }}</span>
                    <span :class="settingsSub">{{ selectedWallet.ownerMeta }}</span>
                  </MpFlex>
                </div>
              </div>
              <div :class="settingsRow">
                <span :class="settingsKey">Created on</span>
                <MpFlex direction="column" gap="0">
                  <span :class="settingsVal">{{ selectedWallet.created }}</span>
                  <span :class="settingsSub">Last updated {{ selectedWallet.updated }}</span>
                </MpFlex>
              </div>
            </div>
          </div>

          <!-- Funding rules -->
          <div :class="settingsCard">
            <div :class="settingsHead">
              <MpFlex direction="column" gap="0.5" minWidth="0">
                <span :class="settingsTitle">Funding rules</span>
                <span :class="settingsSub">Which spend this wallet pays for — by branch, type and policy</span>
              </MpFlex>
              <MpButton variant="secondary" size="sm" left-icon="add">Add rule</MpButton>
            </div>
            <div :class="settingsBody">
              <div v-for="(r, i) in selectedWallet.rules" :key="i" :class="ruleRow">
                <span :class="ruleTag">{{ r.branch }}</span>
                <span :class="ruleTag">{{ r.type }}</span>
                <PxIcon name="arrow-right" :size="14" color="icon.default" />
                <span :class="ruleScope">{{ r.scope }} · pays from this wallet</span>
              </div>
            </div>
          </div>
        </template>

      </div>

    </div>

  </MpFlex>

  <!-- ═════ Edit wallet drawer ═════ -->
  <MpDrawer id="edit-wallet-drawer" :is-open="editOpen" size="md" placement="right" is-block-scroll-on-mount @close="editOpen = false">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <MpText weight="semiBold" :class="drawerHeading">Edit wallet</MpText>
        <MpDrawerCloseButton />
      </MpDrawerHeader>
      <MpDrawerBody>
        <MpFlex direction="column" gap="4" width="full">
          <div>
            <label :class="fieldLabel">Wallet name</label>
            <input :class="inputBase" v-model="editName" placeholder="e.g. Petty cash · Store A" />
          </div>
          <div>
            <label :class="fieldLabel">Currency</label>
            <select :class="inputBase" v-model="editCurrency">
              <option v-for="c in selectedWallet.currencies" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div>
            <label :class="fieldLabel">Wallet type</label>
            <select :class="inputBase" v-model="editType">
              <option v-for="t in walletTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div :class="toggleRow">
            <div>
              <span :class="fieldLabel">Default account</span>
              <span :class="fieldHint">Use this wallet as the company default for new spend</span>
            </div>
            <MpToggle v-model:is-checked="editDefault" />
          </div>
        </MpFlex>
      </MpDrawerBody>
      <MpDrawerFooter>
        <MpFlex justify="flex-end" gap="2" width="full">
          <MpButton variant="ghost" @click="editOpen = false">Cancel</MpButton>
          <MpButton variant="primary" @click="editOpen = false">Save changes</MpButton>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>

  <!-- ═════ Move money drawer ═════ -->
  <MpDrawer id="move-money-drawer" :is-open="moveOpen" size="md" placement="right" is-block-scroll-on-mount @close="moveOpen = false">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <MpText weight="semiBold" :class="drawerHeading">Move money</MpText>
        <MpDrawerCloseButton />
      </MpDrawerHeader>
      <MpDrawerBody>
        <MpFlex direction="column" gap="4" width="full">
          <div>
            <label :class="fieldLabel">From wallet</label>
            <select :class="inputBase" v-model="moveFrom">
              <option v-for="w in wallets" :key="w.id" :value="w.id">{{ w.name }}</option>
            </select>
          </div>
          <div>
            <label :class="fieldLabel">To wallet</label>
            <select :class="inputBase" v-model="moveTo">
              <option v-for="w in wallets" :key="w.id" :value="w.id">{{ w.name }}</option>
            </select>
          </div>
          <div>
            <label :class="fieldLabel">Amount</label>
            <div :class="amountWrap">
              <span :class="amountPrefix">Rp</span>
              <input :class="amountInput" v-model="moveAmount" inputmode="numeric" placeholder="0" />
            </div>
          </div>
          <div>
            <label :class="fieldLabel">Note <span :class="fieldHint">(optional)</span></label>
            <textarea :class="textareaBase" v-model="moveNote" placeholder="What is this transfer for?" />
          </div>
        </MpFlex>
      </MpDrawerBody>
      <MpDrawerFooter>
        <MpFlex justify="flex-end" gap="2" width="full">
          <MpButton variant="ghost" @click="moveOpen = false">Cancel</MpButton>
          <MpButton variant="primary" left-icon="transfer" @click="moveOpen = false">Move money</MpButton>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>

  <!-- ═════ Top up drawer ═════ -->
  <MpDrawer id="top-up-drawer" :is-open="topOpen" size="md" placement="right" is-block-scroll-on-mount @close="topOpen = false">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <MpText weight="semiBold" :class="drawerHeading">Top up</MpText>
        <MpDrawerCloseButton />
      </MpDrawerHeader>
      <MpDrawerBody>
        <MpFlex direction="column" gap="4" width="full">
          <div>
            <label :class="fieldLabel">Amount</label>
            <div :class="amountWrap">
              <span :class="amountPrefix">Rp</span>
              <input :class="amountInput" v-model="topAmount" inputmode="numeric" placeholder="0" />
            </div>
          </div>
          <div>
            <label :class="fieldLabel">Source</label>
            <select :class="inputBase" v-model="topSource">
              <option v-for="s in topSources" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div>
            <label :class="fieldLabel">Note <span :class="fieldHint">(optional)</span></label>
            <textarea :class="textareaBase" v-model="topNote" placeholder="Reference or reason for this top up" />
          </div>
        </MpFlex>
      </MpDrawerBody>
      <MpDrawerFooter>
        <MpFlex justify="flex-end" gap="2" width="full">
          <MpButton variant="ghost" @click="topOpen = false">Cancel</MpButton>
          <MpButton variant="primary" @click="topOpen = false">Top up</MpButton>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>
</template>
