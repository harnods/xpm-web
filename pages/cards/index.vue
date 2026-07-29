<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Cards (list)
  Token mode: Pixel DT 2.4
  Components: MpFlex, MpText, MpButton, MpBadge, PxIcon (all Pixel 3)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-->
<script setup lang="ts">
import {
  MpFlex, MpText, MpButton, MpBadge,
  MpInputGroup, MpInputLeftAddon, MpInput,
  MpDrawer, MpDrawerOverlay, MpDrawerContent, MpDrawerHeader,
  MpDrawerCloseButton, MpDrawerBody, MpDrawerFooter,
  MpFormControl, MpFormLabel, MpFormHelpText,
  MpSelect, MpRadio, MpTextarea,
  css,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Cards',
  subtitle: "Cards management — issue, fund and control the company's virtual and physical cards.",
})

// ─── Data ────────────────────────────────────────────────────────────
const summary = [
  { label: 'Active cards',          badge: '12', value: 'Rp 1.240.000', top: 'success' as const },
  { label: 'Inactive',              badge: '8',  value: 'Rp 620.000',   top: 'default' as const },
  { label: 'Card creation credit',  badge: null, value: '20',           top: 'brand'   as const },
]

const tabs = [
  { key: 'virtual',  label: 'Virtual cards' },
  { key: 'physical', label: 'Physical cards' },
] as const
type TabKey = typeof tabs[number]['key']
const activeTab = ref<TabKey>('virtual')

interface CardRow {
  id: string; name: string; nameSub: string
  holder: string; holderSub: string
  exp: string; balance: string; account: string
  status: 'Active' | 'Inactive'
}

// Virtual cards — existing dataset (unchanged)
const virtualRows: CardRow[] = [
  { id: 'c1', name: 'Nabila MNC Test VCC',   nameSub: 'Testing refund and reversal', holder: 'XM punya 3',              holderSub: 'BUATXM3',   exp: '30 Jun 2026', balance: 'Rp 100.000', account: 'Main account', status: 'Inactive' },
  { id: 'c2', name: 'ads meta',              nameSub: 'iklan',                       holder: 'Trial Aeon',             holderSub: 'PRMT-0081', exp: '01 Jul 2026', balance: 'Rp 50.000',  account: 'Main account', status: 'Inactive' },
  { id: 'c3', name: 'Nabila MNC Test VCC 3', nameSub: 'Testing Dana QR',             holder: 'XM punya 3',             holderSub: 'BUATXM3',   exp: '01 Aug 2026', balance: 'Rp 50.000',  account: 'Main account', status: 'Active' },
  { id: 'c4', name: 'VCC untuk Meta',        nameSub: 'Untuk pembayaran WABA',       holder: 'Test XPM - Abdul',       holderSub: 'PRMT-0028', exp: '31 Dec 2026', balance: 'Rp 50.000',  account: 'Main account', status: 'Active' },
  { id: 'c5', name: 'Grab Activation',       nameSub: 'testing',                     holder: 'Activation Specialist',  holderSub: 'PRMT-0031', exp: '25 Jun 2028', balance: 'Rp 440.000', account: 'Main account', status: 'Active' },
]

// Physical cards — separate dataset
const physicalRows: CardRow[] = [
  { id: 'p1', name: 'Marketing card',     nameSub: 'field team', holder: 'Hiraya Araniya', holderSub: 'PRMT-0062', exp: '18 May 2028', balance: 'Rp 51.000',    account: 'Main account', status: 'Active' },
  { id: 'p2', name: 'Ops corporate card', nameSub: 'operations', holder: 'Dewi Lestari',   holderSub: 'PRMT-0344', exp: '02 Feb 2029', balance: 'Rp 1.000.000', account: 'Main account', status: 'Active' },
]

const rows = computed(() => (activeTab.value === 'virtual' ? virtualRows : physicalRows))

const searchQuery = ref('')

// ─── Create card drawer ──────────────────────────────────────────────
// NOTE: the reference "Create card" CTA is unwired; this drawer + form is
// inferred to be reference-consistent (mirrors ClaimForm drawer patterns).
const CARDHOLDERS = ['XM punya 3', 'Trial Aeon', 'Test XPM - Abdul', 'Hiraya Araniya', 'Dewi Lestari']
const FUNDING_ACCOUNTS = ['Main account', 'Reimbursement pool', 'Card float']

const isCreateOpen = ref(false)
const createDraft = ref({
  name: '', cardholder: '', type: 'virtual' as 'virtual' | 'physical',
  spendLimit: '', fundingAccount: '', purpose: '',
})
function formatThousands(val: string): string {
  const digits = String(val).replace(/\D/g, '')
  return digits ? Number(digits).toLocaleString('id-ID') : ''
}
function openCreate() {
  createDraft.value = { name: '', cardholder: '', type: 'virtual', spendLimit: '', fundingAccount: '', purpose: '' }
  isCreateOpen.value = true
}
function createCard() { isCreateOpen.value = false }

// ─── CSS ─────────────────────────────────────────────────────────────
const summaryGrid = css({ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3' })
const summaryCard = css({
  display: 'flex', flexDirection: 'column', gap: '2', p: '4',
  bg: 'background.neutral', borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  borderRadius: 'lg', borderTopWidth: '3px',
})
// summary-card top border accent (palette → semantic)
const cardTop = {
  success: css({ borderTopColor: 'border.success' }),
  default: css({ borderTopColor: 'border.default' }),
  brand:   css({ borderTopColor: 'border.brand' }),
}
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
  borderBottomWidth: '2px', borderBottomStyle: 'solid', borderBottomColor: 'border.brand',
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
const dotActive   = css({ background: 'icon.success' })
const dotInactive = css({ background: 'icon.default' })

const alignRight = css({ textAlign: 'right' })
const nowrap = css({ whiteSpace: 'nowrap' })

const footer = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
</script>

<template>
  <!-- ═════ Header CTA ═════ -->
  <Teleport to="#layout-header-actions">
    <MpButton variant="primary" size="md" left-icon="add" @click="openCreate">Create card</MpButton>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" min-width="0">

    <!-- ── Summary cards ── -->
    <div :class="summaryGrid">
      <div v-for="s in summary" :key="s.label" :class="[summaryCard, cardTop[s.top]]">
        <div :class="summaryLabelRow">
          <span :class="summaryLabel">{{ s.label }}</span>
          <MpBadge v-if="s.badge" for="tableStatus" type="neutral">{{ s.badge }}</MpBadge>
        </div>
        <span :class="summaryValue">{{ s.value }}</span>
      </div>
    </div>

    <!-- ── Tabs ── -->
    <div :class="tabStrip">
      <button v-for="t in tabs" :key="t.key" type="button" :class="activeTab === t.key ? tabItemActive : tabItem" @click="activeTab = t.key">
        {{ t.label }}
      </button>
    </div>

    <!-- ── Toolbar ── -->
    <MpFlex align="center" justify="space-between" gap="3" wrap="wrap">
      <MpFlex align="center" gap="2" wrap="wrap">
        <MpButton variant="secondary" size="sm" right-icon="caret-down">All status</MpButton>
        <MpButton variant="secondary" size="sm" right-icon="caret-down">All accounts</MpButton>
      </MpFlex>
      <MpFlex align="center" gap="2" wrap="wrap">
        <MpButton variant="ghost" size="sm" right-icon="caret-down">Sort: Oldest first</MpButton>
        <MpButton variant="secondary" size="sm" left-icon="download">Export</MpButton>
        <MpInputGroup width="260px" flex-shrink="0">
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
            <th :class="[th, alignRight]">Card balance</th>
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
            <td :class="[td, nowrap]">{{ row.exp }}</td>
            <td :class="[td, alignRight, nowrap]">{{ row.balance }}</td>
            <td :class="[td, nowrap]">{{ row.account }}</td>
            <td :class="td">
              <span :class="statusCell">
                <span :class="[dot, row.status === 'Active' ? dotActive : dotInactive]" />
                {{ row.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Footer ── -->
    <span :class="footer">Showing {{ rows.length }} of {{ rows.length }} · Rows per page: 10 · Page 1 of 1</span>

  </MpFlex>

  <!-- ═════ Create card drawer (inferred — reference CTA is unwired) ═════ -->
  <MpDrawer id="create-card-drawer" :is-open="isCreateOpen" size="md" placement="right" is-block-scroll-on-mount @close="isCreateOpen = false">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <MpText weight="semiBold" font-size="16px" line-height="24px">New card</MpText>
        <MpDrawerCloseButton />
      </MpDrawerHeader>

      <MpDrawerBody>
        <MpFlex direction="column" gap="5">
          <!-- Card name -->
          <MpFormControl id="create-card-name" isRequired>
            <MpFormLabel>Card name</MpFormLabel>
            <MpInput id="input-create-name" v-model="createDraft.name" placeholder="Enter card name" :isFullWidth="true" />
          </MpFormControl>

          <!-- Cardholder -->
          <MpFormControl id="create-cardholder" isRequired>
            <MpFormLabel>Cardholder</MpFormLabel>
            <MpSelect id="select-create-cardholder" v-model="createDraft.cardholder" placeholder="Select cardholder" :is-full-width="true">
              <option v-for="c in CARDHOLDERS" :key="c" :value="c">{{ c }}</option>
            </MpSelect>
          </MpFormControl>

          <!-- Type -->
          <MpFormControl id="create-type" isRequired>
            <MpFormLabel>Type</MpFormLabel>
            <MpFlex gap="6" marginTop="1">
              <MpRadio id="create-type-virtual" name="create-card-type" value="virtual" v-model="createDraft.type">Virtual</MpRadio>
              <MpRadio id="create-type-physical" name="create-card-type" value="physical" v-model="createDraft.type">Physical</MpRadio>
            </MpFlex>
          </MpFormControl>

          <!-- Spend limit -->
          <MpFormControl id="create-spend-limit" isRequired>
            <MpFormLabel>Spend limit</MpFormLabel>
            <MpInputGroup width="full">
              <MpInputLeftAddon has-background><MpText size="body" weight="semiBold">Rp</MpText></MpInputLeftAddon>
              <MpInput :modelValue="createDraft.spendLimit" placeholder="0" :isFullWidth="true"
                @input="(e: Event) => (createDraft.spendLimit = formatThousands((e.target as HTMLInputElement).value))" />
            </MpInputGroup>
          </MpFormControl>

          <!-- Funding account -->
          <MpFormControl id="create-funding-account" isRequired>
            <MpFormLabel>Funding account</MpFormLabel>
            <MpSelect id="select-create-funding" v-model="createDraft.fundingAccount" placeholder="Select funding account" :is-full-width="true">
              <option v-for="a in FUNDING_ACCOUNTS" :key="a" :value="a">{{ a }}</option>
            </MpSelect>
          </MpFormControl>

          <!-- Purpose -->
          <MpFormControl id="create-purpose">
            <MpFormLabel>Purpose</MpFormLabel>
            <MpTextarea id="textarea-create-purpose" v-model="createDraft.purpose" placeholder="What is this card for?" :isFullWidth="true" />
          </MpFormControl>
        </MpFlex>
      </MpDrawerBody>

      <MpDrawerFooter>
        <MpFlex align="center" justify="flex-end" gap="3" width="full">
          <MpButton variant="ghost" size="md" @click="isCreateOpen = false">Cancel</MpButton>
          <MpButton variant="primary" size="md" @click="createCard">Create card</MpButton>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>
</template>
