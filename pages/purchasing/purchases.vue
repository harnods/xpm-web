<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Purchasing › Purchases
  Token mode: Pixel DT 2.4 (semantic tokens)
  Components: MpFlex, MpText, MpButton, MpTextlink, PxIcon,
              MpDrawer* (filters + create), MpFormControl/MpInput/MpSelect/MpTextarea
  Submenu (Purchasing) handled by layout automatically.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-->
<script setup lang="ts">
import {
  MpFlex, MpText, MpButton, MpTextlink, MpBadge,
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
  MpDrawer, MpDrawerOverlay, MpDrawerContent, MpDrawerHeader,
  MpDrawerCloseButton, MpDrawerBody, MpDrawerFooter,
  MpFormControl, MpFormLabel, MpInput, MpSelect, MpTextarea,
  MpTableContainer, MpTable, MpTableHead, MpTableBody, MpTableRow, MpTableCell,
  css,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Purchases',
})

// ─── Tabs ────────────────────────────────────────────────────────────
type Tab = 'Invoice' | 'Order' | 'Quote' | 'Request'
const tabs: Tab[] = ['Invoice', 'Order', 'Quote', 'Request']
const activeTab = ref<Tab>('Invoice')

// ─── Rows ────────────────────────────────────────────────────────────
type Status =
  | 'Overdue' | 'Rejected'
  | 'Paid' | 'Received' | 'Accepted' | 'Approved'
  | 'Sent' | 'Draft' | 'Comparing'
  | 'Awaiting payment' | 'Awaiting review' | 'Awaiting approval'

interface Row {
  doc: string
  primary: string   // vendor (Invoice/Order/Quote) or requester (Request)
  sub: string       // line-item summary or department
  date: string
  due: string
  status: Status
  total: string
}

// Each tab shows a DIFFERENT dataset ──────────────────────────────────
const DATASETS: Record<Tab, Row[]> = {
  Invoice: [
    { doc: 'PI-64401', primary: 'Manna Jaya Trading',  sub: '1 line item',  date: 'Jul 15', due: 'Aug 15', status: 'Overdue',          total: 'Rp 3.210.000'  },
    { doc: 'PI-64432', primary: 'Movus Technologies',  sub: '2 line items', date: 'Jul 18', due: 'Aug 18', status: 'Paid',             total: 'Rp 12.400.000' },
    { doc: 'PI-64470', primary: 'Brassica Supply Co.', sub: '2 line items', date: 'Jul 20', due: 'Aug 20', status: 'Awaiting payment', total: 'Rp 6.050.000'  },
    { doc: 'PI-64469', primary: 'Integrity Partners',  sub: '1 line item',  date: 'Jul 20', due: 'Aug 20', status: 'Awaiting review',  total: 'Rp 6.050.000'  },
    { doc: 'PI-64468', primary: 'AJN Solutions',       sub: '2 line items', date: 'Jul 20', due: 'Aug 20', status: 'Awaiting review',  total: 'Rp 6.050.000'  },
  ],
  Order: [
    { doc: 'PO-2211', primary: 'Krakatau Steel Trading', sub: '2 line items', date: 'Jul 15', due: 'Aug 10', status: 'Draft',    total: 'Rp 22.900.000' },
    { doc: 'PO-2213', primary: 'Movus Technologies',     sub: '2 line items', date: 'Jul 18', due: 'Jul 30', status: 'Received', total: 'Rp 5.150.000'  },
    { doc: 'PO-2214', primary: 'Brassica Supply Co.',    sub: '2 line items', date: 'Jul 21', due: 'Aug 02', status: 'Sent',     total: 'Rp 8.400.000'  },
  ],
  Quote: [
    { doc: 'QT-0339', primary: 'Integrity Partners', sub: '1 line item', date: 'Jul 16', due: 'Aug 16', status: 'Accepted',  total: 'Rp 4.200.000' },
    { doc: 'QT-0341', primary: 'AJN Solutions',      sub: '1 line item', date: 'Jul 19', due: 'Aug 19', status: 'Comparing', total: 'Rp 7.850.000' },
  ],
  Request: [
    { doc: 'PR-1105', primary: 'Priya Sharma',  sub: 'Marketing',   date: 'Jul 15', due: 'Jul 29', status: 'Rejected',          total: 'Rp 2.100.000' },
    { doc: 'PR-1107', primary: 'Daniel Reyes',  sub: 'Operations',  date: 'Jul 19', due: 'Aug 01', status: 'Approved',          total: 'Rp 578.000'   },
    { doc: 'PR-1108', primary: 'Citra Lestari', sub: 'Procurement', date: 'Jul 21', due: 'Aug 05', status: 'Awaiting approval', total: 'Rp 1.396.000' },
  ],
}

const activeRows = computed(() => DATASETS[activeTab.value])
// On Request tab the 2nd column is the requester + department, not a vendor
const primaryHeader = computed(() => (activeTab.value === 'Request' ? 'REQUESTER' : 'VENDOR'))

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
function hasWarn(s: Status) {
  return s === 'Overdue' || s === 'Awaiting payment'
}

// ─── Toolbar filters ────────────────────────────────────────────────────
const STATUS_OPTIONS = ['All status', 'Awaiting payment', 'Awaiting review', 'Paid', 'Overdue']
const ACCOUNT_OPTIONS = ['All accounts', 'Main account', 'Operational account']
const MONTH_OPTIONS = ['This month', 'Last month', 'This quarter', 'This year']
const SORT_OPTIONS = ['Sort: Oldest first', 'Sort: Newest first']
const statusSel = ref(STATUS_OPTIONS[0])
const accountSel = ref(ACCOUNT_OPTIONS[0])
const monthSel = ref(MONTH_OPTIONS[0])
const sortSel = ref(SORT_OPTIONS[0])

// ─── Filters drawer ──────────────────────────────────────────────────
const filtersOpen = ref(false)
const STATUS_PILLS = ['Awaiting payment', 'Awaiting review', 'Paid', 'Overdue']
const PERIOD_PILLS = ['This month', 'Last month', 'Last 90 days', 'This year', 'Custom']
const selStatus = ref<string[]>([])
const selPeriod = ref<string>('')

function toggleStatus(p: string) {
  const i = selStatus.value.indexOf(p)
  if (i === -1) selStatus.value.push(p)
  else selStatus.value.splice(i, 1)
}
function resetFilters() { selStatus.value = []; selPeriod.value = '' }

// ─── Create purchase drawer ──────────────────────────────────────────
// NOTE: the "Create purchase" button is unwired in the reference; this
// form is inferred to be reference-consistent with the Pixel drawer pattern.
const createOpen = ref(false)
const form = reactive({
  type: 'Invoice', vendor: '', docNo: '', date: '', due: '', amount: '', description: '',
})

// ─── Tab / table CSS ─────────────────────────────────────────────────
const tabBar = css({
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

const searchWrap = css({
  display: 'inline-flex', alignItems: 'center', gap: '2',
  width: '240px', minHeight: '36px', paddingInline: '3',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.form',
  borderRadius: 'md', bg: 'background.neutral',
  _focusWithin: { boxShadow: 'focus', borderColor: 'border.focused' },
})
const searchInput = css({
  flex: '1 1 auto', minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
  fontFamily: 'body', fontSize: 'md', color: 'text.default',
  _placeholder: { color: 'text.secondary' },
})

const docLink   = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'medium', color: 'text.link', cursor: 'pointer' })
const vendorSub = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
const totalText = css({ fontWeight: 'semiBold', textAlign: 'right' })

const footer = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  paddingInline: '1', fontFamily: 'body', fontSize: 'sm', color: 'text.secondary',
})

// ─── Drawer CSS ──────────────────────────────────────────────────────
const drawerHeaderText = css({ fontFamily: 'body', fontSize: 'lg', fontWeight: 'semiBold', color: 'text.default' })
const sectionLabel = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default' })
const sectionCaps = css({
  fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.secondary',
  textTransform: 'uppercase', letterSpacing: '0.04em',
})
const pillRow = css({ display: 'flex', flexWrap: 'wrap', gap: '2' })
const pill = css({
  appearance: 'none', cursor: 'pointer',
  paddingBlock: '2', paddingInline: '3', borderRadius: 'full',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.form',
  bg: 'background.neutral', color: 'text.default',
  fontFamily: 'body', fontSize: 'sm', fontWeight: 'medium',
  transition: 'all 120ms ease',
  _hover: { borderColor: 'border.default' },
})
const pillActive = css({
  bg: 'background.brand.subtle', borderColor: 'border.brand', color: 'text.brand',
})
</script>

<template>
  <!-- ═════ Header CTAs ═════ -->
  <Teleport to="#layout-header-actions">
    <MpButton variant="primary" size="md" @click="createOpen = true">Create purchase</MpButton>
  </Teleport>

  <!-- ═════ Primary tabs (into layout tab-slot) ═════ -->
  <Teleport to="#layout-tabs">
    <div :class="tabBar">
      <button
        v-for="t in tabs"
        :key="t"
        type="button"
        :class="[tab, activeTab === t ? tabActive : '']"
        @click="activeTab = t"
      >{{ t }}</button>
    </div>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" min-width="0">

    <!-- Toolbar -->
    <MpFlex align="center" justify="space-between" gap="3" wrap="wrap">
      <MpFlex align="center" gap="2" wrap="wrap">
        <MpPopover id="flt-status" placement="bottom-start" is-close-on-select>
          <MpPopoverTrigger>
            <MpButton variant="secondary" size="sm" right-icon="caret-down">{{ statusSel }}</MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent :class="css({ minWidth: '180px' })">
            <MpPopoverList>
              <MpPopoverListItem v-for="o in STATUS_OPTIONS" :key="o" :is-active="statusSel === o" @click="statusSel = o">{{ o }}</MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </MpPopover>
        <MpPopover id="flt-account" placement="bottom-start" is-close-on-select>
          <MpPopoverTrigger>
            <MpButton variant="secondary" size="sm" right-icon="caret-down">{{ accountSel }}</MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent :class="css({ minWidth: '180px' })">
            <MpPopoverList>
              <MpPopoverListItem v-for="o in ACCOUNT_OPTIONS" :key="o" :is-active="accountSel === o" @click="accountSel = o">{{ o }}</MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </MpPopover>
        <MpPopover id="flt-month" placement="bottom-start" is-close-on-select>
          <MpPopoverTrigger>
            <MpButton variant="secondary" size="sm" right-icon="caret-down">{{ monthSel }}</MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent :class="css({ minWidth: '180px' })">
            <MpPopoverList>
              <MpPopoverListItem v-for="o in MONTH_OPTIONS" :key="o" :is-active="monthSel === o" @click="monthSel = o">{{ o }}</MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </MpPopover>
        <MpButton variant="secondary" size="sm" left-icon="filter" @click="filtersOpen = true">Filters</MpButton>
      </MpFlex>

      <MpFlex align="center" gap="2" wrap="wrap">
        <MpPopover id="flt-sort" placement="bottom-start" is-close-on-select>
          <MpPopoverTrigger>
            <MpButton variant="secondary" size="sm" right-icon="caret-down">{{ sortSel }}</MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent :class="css({ minWidth: '180px' })">
            <MpPopoverList>
              <MpPopoverListItem v-for="o in SORT_OPTIONS" :key="o" :is-active="sortSel === o" @click="sortSel = o">{{ o }}</MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </MpPopover>
        <MpButton variant="secondary" size="sm">Export</MpButton>
        <label :class="searchWrap">
          <PxIcon name="search" :size="16" color="icon.subtle" />
          <input :class="searchInput" type="text" placeholder="Search document or vendor…" />
        </label>
      </MpFlex>
    </MpFlex>

    <!-- Table -->
    <MpTableContainer :class="css({ width: 'full' })">
      <MpTable>
        <MpTableHead>
          <MpTableRow>
            <MpTableCell scope="col">DOCUMENT</MpTableCell>
            <MpTableCell scope="col">{{ primaryHeader }}</MpTableCell>
            <MpTableCell scope="col">DATE</MpTableCell>
            <MpTableCell scope="col">DUE · VALID</MpTableCell>
            <MpTableCell scope="col">STATUS</MpTableCell>
            <MpTableCell scope="col" :class="css({ width: '24px' })"></MpTableCell>
            <MpTableCell scope="col" :class="css({ textAlign: 'right' })">TOTAL</MpTableCell>
            <MpTableCell scope="col" :class="css({ width: '44px' })"></MpTableCell>
          </MpTableRow>
        </MpTableHead>
        <MpTableBody>
          <MpTableRow v-for="r in activeRows" :key="r.doc">
            <MpTableCell as="td" scope="row"><span :class="docLink">{{ r.doc }}</span></MpTableCell>
            <MpTableCell as="td">
              <div>{{ r.primary }}</div>
              <div :class="vendorSub">{{ r.sub }}</div>
            </MpTableCell>
            <MpTableCell as="td">{{ r.date }}</MpTableCell>
            <MpTableCell as="td">{{ r.due }}</MpTableCell>
            <MpTableCell as="td">
              <MpBadge for="tableStatus" :type="badgeType(r.status)">{{ r.status }}</MpBadge>
            </MpTableCell>
            <MpTableCell as="td" :class="css({ textAlign: 'center' })">
              <PxIcon v-if="hasWarn(r.status)" name="warning-triangle" :size="16" color="icon.warning" />
            </MpTableCell>
            <MpTableCell as="td" :class="css({ textAlign: 'right' })"><span :class="totalText">{{ r.total }}</span></MpTableCell>
            <MpTableCell as="td" :class="css({ textAlign: 'right' })">
              <MpButton variant="ghost" size="sm" left-icon="menu-meatball" aria-label="More" />
            </MpTableCell>
          </MpTableRow>
        </MpTableBody>
      </MpTable>
    </MpTableContainer>

    <!-- Footer -->
    <div :class="footer">
      <span>Showing {{ activeRows.length }} of {{ activeRows.length }}</span>
      <MpFlex align="center" gap="6">
        <span>Rows per page: 10</span>
        <span>Page 1 of 1</span>
      </MpFlex>
    </div>

  </MpFlex>

  <!-- ═════ Drawer · All filters ═════ -->
  <MpDrawer id="purchases-filters" :is-open="filtersOpen" size="sm" placement="right" is-block-scroll-on-mount @close="filtersOpen = false">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <span :class="drawerHeaderText">All filters</span>
        <MpDrawerCloseButton />
      </MpDrawerHeader>

      <MpDrawerBody>
        <MpFlex direction="column" gap="6" width="full">
          <!-- Status -->
          <MpFlex direction="column" gap="3">
            <span :class="sectionLabel">Status</span>
            <div :class="pillRow">
              <button
                v-for="p in STATUS_PILLS"
                :key="p"
                type="button"
                :class="[pill, selStatus.includes(p) ? pillActive : '']"
                @click="toggleStatus(p)"
              >{{ p }}</button>
            </div>
          </MpFlex>

          <!-- Period -->
          <MpFlex direction="column" gap="3">
            <span :class="sectionCaps">Period</span>
            <div :class="pillRow">
              <button
                v-for="p in PERIOD_PILLS"
                :key="p"
                type="button"
                :class="[pill, selPeriod === p ? pillActive : '']"
                @click="selPeriod = selPeriod === p ? '' : p"
              >{{ p }}</button>
            </div>
          </MpFlex>
        </MpFlex>
      </MpDrawerBody>

      <MpDrawerFooter>
        <MpFlex align="center" justify="space-between" width="full">
          <MpTextlink size="body" cursor="pointer" @click="resetFilters">Reset filter</MpTextlink>
          <MpFlex align="center" gap="2">
            <MpButton variant="ghost" @click="filtersOpen = false">Cancel</MpButton>
            <MpButton variant="primary" @click="filtersOpen = false">Apply</MpButton>
          </MpFlex>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>

  <!-- ═════ Drawer · New purchase (inferred form) ═════ -->
  <MpDrawer id="purchases-create" :is-open="createOpen" size="md" placement="right" is-block-scroll-on-mount @close="createOpen = false">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <span :class="drawerHeaderText">New purchase</span>
        <MpDrawerCloseButton />
      </MpDrawerHeader>

      <MpDrawerBody>
        <MpFlex direction="column" gap="5" width="full">
          <MpFormControl id="np-type" isRequired>
            <MpFormLabel>Type</MpFormLabel>
            <MpSelect id="np-type-select" v-model="form.type" :is-full-width="true">
              <option v-for="t in tabs" :key="t" :value="t">{{ t }}</option>
            </MpSelect>
          </MpFormControl>

          <MpFormControl id="np-vendor" isRequired>
            <MpFormLabel>Vendor</MpFormLabel>
            <MpInput id="np-vendor-input" v-model="form.vendor" placeholder="Enter vendor" :is-full-width="true" />
          </MpFormControl>

          <MpFormControl id="np-docno" isRequired>
            <MpFormLabel>Document no.</MpFormLabel>
            <MpInput id="np-docno-input" v-model="form.docNo" placeholder="e.g. PI-64500" :is-full-width="true" />
          </MpFormControl>

          <MpFlex gap="4" width="full">
            <MpFormControl id="np-date" isRequired flex="1 1 0">
              <MpFormLabel>Date</MpFormLabel>
              <MpInput id="np-date-input" v-model="form.date" type="date" :is-full-width="true" />
            </MpFormControl>
            <MpFormControl id="np-due" flex="1 1 0">
              <MpFormLabel>Due date</MpFormLabel>
              <MpInput id="np-due-input" v-model="form.due" type="date" :is-full-width="true" />
            </MpFormControl>
          </MpFlex>

          <MpFormControl id="np-amount" isRequired>
            <MpFormLabel>Amount (Rp)</MpFormLabel>
            <MpInput id="np-amount-input" v-model="form.amount" placeholder="0" :is-full-width="true" />
          </MpFormControl>

          <MpFormControl id="np-desc">
            <MpFormLabel>Description</MpFormLabel>
            <MpTextarea id="np-desc-input" v-model="form.description" placeholder="Enter description" :is-full-width="true" maxlength="600" />
          </MpFormControl>
        </MpFlex>
      </MpDrawerBody>

      <MpDrawerFooter>
        <MpFlex align="center" justify="flex-end" gap="2" width="full">
          <MpButton variant="ghost" @click="createOpen = false">Cancel</MpButton>
          <MpButton variant="primary" @click="createOpen = false">Create</MpButton>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>
</template>
