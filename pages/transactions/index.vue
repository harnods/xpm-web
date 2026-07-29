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
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
  MpDrawer, MpDrawerOverlay, MpDrawerContent, MpDrawerHeader,
  MpDrawerCloseButton, MpDrawerBody, MpDrawerFooter,
  MpTableContainer, MpTable, MpTableHead, MpTableBody, MpTableRow, MpTableCell,
  css,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Transactions',
  navKey: 'transactions',
})

// ─── Summary cards ───────────────────────────────────────────────────
const summary = [
  { label: 'Total out · Jul', value: 'Rp457.400.000',   top: 'default' },
  { label: 'Card spend',      value: 'Rp44.664.000',   top: 'brand'   },
  { label: 'Reimbursed',      value: 'Rp12.513.585',   top: 'success' },
  { label: 'Bills paid',      value: 'Rp380.462.009',  top: 'warning' },
]

// ─── Filter tabs ──────────────────────────────────────────────────────
const TABS = ['All', 'Card', 'Reimbursement', 'Cash advance', 'Bill', 'Travel']
const activeTab = ref('All')

// ─── Toolbar filters ────────────────────────────────────────────────────
const ACCOUNT_OPTIONS = ['All accounts', 'Main account', 'Operational account']
const MONTH_OPTIONS = ['This month', 'Last month', 'This quarter', 'This year']
const SORT_OPTIONS = ['Sort: Oldest first', 'Sort: Newest first']
const accountSel = ref(ACCOUNT_OPTIONS[0])
const monthSel = ref(MONTH_OPTIONS[0])
const sortSel = ref(SORT_OPTIONS[0])

// ─── Status → badge type ────────────────────────────────────────────────
function badgeType(s: string) {
  const completed = ['Paid', 'Received', 'Accepted', 'Approved', 'Settled', 'Disbursed', 'Cleared', 'Booked']
  const warning = ['Awaiting approval', 'Awaiting payment', 'Awaiting review', 'Awaiting disburse', 'Comparing']
  const critical = ['Overdue', 'Rejected']
  const information = ['Sent']
  const announcement = ['Draft']
  if (completed.includes(s)) return 'completed'
  if (warning.includes(s)) return 'warning'
  if (critical.includes(s)) return 'critical'
  if (information.includes(s)) return 'information'
  if (announcement.includes(s)) return 'announcement'
  return 'announcement'
}

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
  { date: '22 Jul', source: 'Card',          description: 'Grab — ride to airport',              name: 'XM punya 3',          account: 'Main account', status: 'Cleared',            statusKind: 'green', amount: 'Rp84.000'     },
  { date: '22 Jul', source: 'Card',          description: 'Meta Ads — July campaign',            name: 'ads meta',            account: 'Main account', status: 'Cleared',            statusKind: 'green', amount: 'Rp2.400.000'  },
  { date: '22 Jul', source: 'Reimbursement', description: 'Client lunch',                        name: 'Maya Chen',           account: 'Main account', status: 'Awaiting disburse',  statusKind: 'amber', amount: 'Rp58.708'     },
  { date: '20 Jul', source: 'Cash advance',  description: 'Roadshow per diem',                   name: 'Sofia Martins',       account: 'Main account', status: 'Disbursed',          statusKind: 'green', amount: 'Rp400.000'    },
  { date: '21 Jul', source: 'Bill',          description: 'PI20260764927 · Batuta Chemical',     name: 'PT Batuta',           account: 'Main account', status: 'Awaiting approval',  statusKind: 'amber', amount: 'Rp60.500'     },
  { date: '19 Jul', source: 'Bill',          description: 'PI20260764432 · Movus',               name: 'Movus Technologies',  account: 'Main account', status: 'Paid',               statusKind: 'green', amount: 'Rp12.400.000' },
  { date: '20 Jul', source: 'Travel',        description: 'Trip Bandung · BT20260751072',        name: 'XM punya 3',          account: 'Main account', status: 'Booked',             statusKind: 'green', amount: 'Rp1.250.000'  },
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

// Tabs (rendered into the layout tab-slot)
const tabsRow = css({
  display: 'flex', alignItems: 'center', gap: '5',
  paddingInline: '6', height: '44px',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
  background: 'background.neutral',
})
const tab = css({
  display: 'inline-flex', alignItems: 'center', gap: '2', height: '44px',
  background: 'transparent', border: 'none', cursor: 'pointer',
  fontFamily: 'body', fontSize: 'md',
  borderBottomWidth: '2px', borderBottomStyle: 'solid', borderBottomColor: 'transparent',
  color: 'text.secondary',
})
const tabActive = css({
  display: 'inline-flex', alignItems: 'center', gap: '2', height: '44px',
  background: 'transparent', border: 'none', cursor: 'pointer',
  fontFamily: 'body', fontSize: 'md',
  borderBottomWidth: '2px', borderBottomStyle: 'solid', borderBottomColor: 'border.brand',
  color: 'text.default', fontWeight: 'semiBold',
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

// Table — main cell text inherits MpTable default; amount is right-aligned
const amountCell = css({ textAlign: 'right', whiteSpace: 'nowrap' })

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
    <MpButton variant="primary">Export ledger</MpButton>
  </Teleport>

  <!-- ═════ Primary tabs (into layout tab-slot) ═════ -->
  <Teleport to="#layout-tabs">
    <div :class="tabsRow">
      <button
        v-for="t in TABS" :key="t" type="button"
        :class="activeTab === t ? tabActive : tab"
        @click="activeTab = t"
      >{{ t }}</button>
    </div>
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

    <!-- 2) Toolbar -->
    <MpFlex align="center" justify="space-between" gap="3" wrap="wrap">
      <MpFlex align="center" gap="2">
        <MpPopover id="flt-account" placement="bottom-start" is-close-on-select>
          <MpPopoverTrigger>
            <MpButton variant="secondary" right-icon="caret-down">{{ accountSel }}</MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent :class="css({ minWidth: '180px' })">
            <MpPopoverList>
              <MpPopoverListItem v-for="o in ACCOUNT_OPTIONS" :key="o" :is-active="accountSel === o" @click="accountSel = o">{{ o }}</MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </MpPopover>
        <MpPopover id="flt-month" placement="bottom-start" is-close-on-select>
          <MpPopoverTrigger>
            <MpButton variant="secondary" right-icon="caret-down">{{ monthSel }}</MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent :class="css({ minWidth: '180px' })">
            <MpPopoverList>
              <MpPopoverListItem v-for="o in MONTH_OPTIONS" :key="o" :is-active="monthSel === o" @click="monthSel = o">{{ o }}</MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </MpPopover>
      </MpFlex>
      <MpFlex align="center" gap="2">
        <MpPopover id="flt-sort" placement="bottom-start" is-close-on-select>
          <MpPopoverTrigger>
            <MpButton variant="secondary" right-icon="caret-down">{{ sortSel }}</MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent :class="css({ minWidth: '180px' })">
            <MpPopoverList>
              <MpPopoverListItem v-for="o in SORT_OPTIONS" :key="o" :is-active="sortSel === o" @click="sortSel = o">{{ o }}</MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </MpPopover>
        <MpButton variant="secondary">Export</MpButton>
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
      <MpButton variant="secondary" @click="colsOpen = true">Edit columns</MpButton>
    </MpFlex>

    <!-- 5) Table -->
    <MpTableContainer :class="css({ width: 'full' })">
      <MpTable>
        <MpTableHead>
          <MpTableRow>
            <MpTableCell v-if="isVisible('date')" scope="col">DATE</MpTableCell>
            <MpTableCell v-if="isVisible('source')" scope="col">SOURCE</MpTableCell>
            <MpTableCell v-if="isVisible('description')" scope="col">DESCRIPTION</MpTableCell>
            <MpTableCell v-if="isVisible('name')" scope="col">NAME</MpTableCell>
            <MpTableCell v-if="isVisible('account')" scope="col">ACCOUNT</MpTableCell>
            <MpTableCell v-if="isVisible('status')" scope="col">STATUS</MpTableCell>
            <MpTableCell v-if="isVisible('amount')" scope="col" :class="alignRight">AMOUNT</MpTableCell>
          </MpTableRow>
        </MpTableHead>
        <MpTableBody>
          <MpTableRow v-for="(r, i) in filteredRows" :key="i">
            <MpTableCell v-if="isVisible('date')" as="td" scope="row">{{ r.date }}</MpTableCell>
            <MpTableCell v-if="isVisible('source')" as="td">{{ r.source }}</MpTableCell>
            <MpTableCell v-if="isVisible('description')" as="td">{{ r.description }}</MpTableCell>
            <MpTableCell v-if="isVisible('name')" as="td">{{ r.name }}</MpTableCell>
            <MpTableCell v-if="isVisible('account')" as="td">{{ r.account }}</MpTableCell>
            <MpTableCell v-if="isVisible('status')" as="td">
              <MpBadge for="tableStatus" :type="badgeType(r.status)">{{ r.status }}</MpBadge>
            </MpTableCell>
            <MpTableCell v-if="isVisible('amount')" as="td" :class="alignRight"><span :class="amountCell">{{ r.amount }}</span></MpTableCell>
          </MpTableRow>
        </MpTableBody>
      </MpTable>
    </MpTableContainer>

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
