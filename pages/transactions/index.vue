<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Transactions (ledger)
  Token mode: Pixel DT 2.4
  Every money-out line across cards, reimbursements, bills and travel — one ledger.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-->
<script setup lang="ts">
import {
  MpFlex, MpText, MpButton, MpBadge, MpCheckbox,
  MpInputGroup, MpInputLeftAddon, MpInput,
  MpDrawer, MpDrawerOverlay, MpDrawerContent, MpDrawerHeader,
  MpDrawerCloseButton, MpDrawerBody, MpDrawerFooter,
  css,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Transactions',
  subtitle: 'Every money-out line across cards, reimbursements, bills and travel — one ledger.',
  navKey: 'transactions',
})

// ─── Summary cards ───────────────────────────────────────────────────
const summary = [
  { label: 'Total out · Jul', value: 'Rp 457,4 jt',     top: 'default' },
  { label: 'Card spend',      value: 'Rp 44.664.000',   top: 'brand'   },
  { label: 'Reimbursed',      value: 'Rp 12.513.585',   top: 'success' },
  { label: 'Bills paid',      value: 'Rp 380.462.009',  top: 'warning' },
]

// ─── Filter tabs ──────────────────────────────────────────────────────
const TABS = ['All', 'Card', 'Reimbursement', 'Cash advance', 'Bill', 'Travel']
const activeTab = ref('All')

// ─── Edit columns drawer ───────────────────────────────────────────────
interface ColDef { key: keyof TxRow; label: string }
const COLUMNS: ColDef[] = [
  { key: 'date',        label: 'Date'        },
  { key: 'source',      label: 'Source'      },
  { key: 'description', label: 'Description' },
  { key: 'name',        label: 'Name'        },
  { key: 'account',     label: 'Account'     },
  { key: 'status',      label: 'Status'      },
  { key: 'amount',      label: 'Amount'      },
]
const colsOpen = ref(false)
const visibleCols = ref<Set<string>>(new Set(COLUMNS.map(c => c.key)))
const isVisible = (k: string) => visibleCols.value.has(k)
function toggleCol(k: string) {
  const next = new Set(visibleCols.value)
  next.has(k) ? next.delete(k) : next.add(k)
  visibleCols.value = next
}

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

// ─── Tab filtering ─────────────────────────────────────────────────────
const filteredRows = computed(() =>
  activeTab.value === 'All' ? rows : rows.filter(r => r.source === activeTab.value),
)

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
const topBorders: Record<string, string> = {
  default: css({ borderTopColor: 'border.default' }),
  brand:   css({ borderTopColor: 'border.brand' }),
  success: css({ borderTopColor: 'border.success' }),
  warning: css({ borderTopColor: 'border.warning' }),
}
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
    height: '2px', background: 'icon.brand', borderRadius: 'full',
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
const dotClass: Record<string, string> = {
  green: css({ background: 'icon.success' }),
  amber: css({ background: 'icon.warning' }),
}
const amountCell = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default', textAlign: 'right', whiteSpace: 'nowrap' })

const footText = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })

// Edit columns drawer
const colsSubhead = css({
  fontFamily: 'body', fontSize: 'xs', fontWeight: 'semiBold', letterSpacing: '0.04em',
  color: 'text.secondary', paddingBlock: '2',
})
const colRow = css({
  display: 'flex', alignItems: 'center', gap: '3',
  paddingInline: '2', paddingBlock: '2', borderRadius: 'md', cursor: 'pointer',
  _hover: { bg: 'background.neutral.subtle' },
})
const colHandle = css({ fontFamily: 'body', fontSize: 'md', color: 'text.subtle', cursor: 'grab', flexShrink: 0 })
const colLabel = css({ fontFamily: 'body', fontSize: 'md', color: 'text.default' })

const alignRight = css({ textAlign: 'right' })
const searchGroup = css({ width: '260px', flexShrink: 0 })
const drawerHeading = css({ fontSize: 'lg', lineHeight: 'xl' })
</script>

<template>
  <!-- ═════ Header CTAs ═════ -->
  <Teleport to="#layout-header-actions">
    <MpButton variant="primary" size="md">Export ledger</MpButton>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" minWidth="0">

    <!-- 1) Summary cards -->
    <div :class="summaryGrid">
      <div v-for="s in summary" :key="s.label" :class="[summaryCard, topBorders[s.top]]">
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
    <MpFlex align="center" justify="space-between" gap="3" wrap="wrap">
      <MpFlex align="center" gap="2">
        <MpButton variant="secondary" size="sm" right-icon="caret-down">All accounts</MpButton>
        <MpButton variant="secondary" size="sm" right-icon="caret-down">This month</MpButton>
      </MpFlex>
      <MpFlex align="center" gap="2">
        <MpButton variant="secondary" size="sm" right-icon="caret-down">Sort: Oldest first</MpButton>
        <MpButton variant="secondary" size="sm">Export</MpButton>
        <MpInputGroup :class="searchGroup">
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
      <MpButton variant="secondary" size="sm" @click="colsOpen = true">Edit columns</MpButton>
    </MpFlex>

    <!-- 5) Table -->
    <div :class="tblWrap">
      <table :class="tbl">
        <thead>
          <tr>
            <th v-if="isVisible('date')" :class="th">DATE</th>
            <th v-if="isVisible('source')" :class="th">SOURCE</th>
            <th v-if="isVisible('description')" :class="th">DESCRIPTION</th>
            <th v-if="isVisible('name')" :class="th">NAME</th>
            <th v-if="isVisible('account')" :class="th">ACCOUNT</th>
            <th v-if="isVisible('status')" :class="th">STATUS</th>
            <th v-if="isVisible('amount')" :class="[th, alignRight]">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in filteredRows" :key="i">
            <td v-if="isVisible('date')" :class="td">{{ r.date }}</td>
            <td v-if="isVisible('source')" :class="td"><span :class="secondaryCell">{{ r.source }}</span></td>
            <td v-if="isVisible('description')" :class="td"><span :class="descCell">{{ r.description }}</span></td>
            <td v-if="isVisible('name')" :class="td">{{ r.name }}</td>
            <td v-if="isVisible('account')" :class="td"><span :class="secondaryCell">{{ r.account }}</span></td>
            <td v-if="isVisible('status')" :class="td">
              <span :class="statusCell">
                <span :class="[dot, dotClass[r.statusKind]]" />
                {{ r.status }}
              </span>
            </td>
            <td v-if="isVisible('amount')" :class="[td, alignRight]"><span :class="amountCell">{{ r.amount }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 6) Footer -->
    <MpFlex align="center" justify="space-between" paddingInline="1">
      <span :class="footText">Showing {{ filteredRows.length }} of {{ rows.length }}</span>
      <MpFlex align="center" gap="6">
        <span :class="footText">Rows per page: 10</span>
        <span :class="footText">Page 1 of 1</span>
      </MpFlex>
    </MpFlex>

    <!-- Edit columns drawer -->
    <MpDrawer
      id="edit-columns-drawer"
      :is-open="colsOpen"
      size="sm"
      placement="right"
      is-block-scroll-on-mount
      @close="colsOpen = false"
    >
      <MpDrawerOverlay />
      <MpDrawerContent>
        <MpDrawerHeader>
          <MpText weight="semiBold" :class="drawerHeading">Edit columns</MpText>
          <MpDrawerCloseButton />
        </MpDrawerHeader>

        <MpDrawerBody>
          <div :class="colsSubhead">COLUMNS — TICK TO SHOW · DRAG TO REORDER</div>
          <MpFlex direction="column" gap="0" width="full">
            <div v-for="c in COLUMNS" :key="c.key" :class="colRow" @click="toggleCol(c.key)">
              <span :class="colHandle">⠿</span>
              <MpCheckbox :is-checked="isVisible(c.key)" @click.stop="toggleCol(c.key)" />
              <span :class="colLabel">{{ c.label }}</span>
            </div>
          </MpFlex>
        </MpDrawerBody>

        <MpDrawerFooter>
          <MpFlex align="center" justify="flex-end" gap="2" width="full">
            <MpButton variant="ghost" @click="colsOpen = false">Cancel</MpButton>
            <MpButton variant="primary" @click="colsOpen = false">Save</MpButton>
          </MpFlex>
        </MpDrawerFooter>
      </MpDrawerContent>
    </MpDrawer>

  </MpFlex>
</template>
