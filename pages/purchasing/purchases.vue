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
  MpFlex, MpText, MpButton, MpTextlink,
  MpDrawer, MpDrawerOverlay, MpDrawerContent, MpDrawerHeader,
  MpDrawerCloseButton, MpDrawerBody, MpDrawerFooter,
  MpFormControl, MpFormLabel, MpInput, MpSelect, MpTextarea,
  css,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Purchases',
  subtitle: 'Invoices, orders, quotes and requests from vendors.',
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

const STATUS_COLOR: Record<Status, string> = {
  'Overdue':           'var(--mp-colors-icon-danger)',
  'Rejected':          'var(--mp-colors-icon-danger)',
  'Paid':              'var(--mp-colors-icon-success)',
  'Received':          'var(--mp-colors-icon-success)',
  'Accepted':          'var(--mp-colors-icon-success)',
  'Approved':          'var(--mp-colors-icon-success)',
  'Sent':              'var(--mp-colors-blue-600)',
  'Draft':             'var(--mp-colors-icon-subtle)',
  'Comparing':         'var(--mp-colors-icon-warning)',
  'Awaiting payment':  'var(--mp-colors-icon-warning)',
  'Awaiting review':   'var(--mp-colors-icon-warning)',
  'Awaiting approval': 'var(--mp-colors-icon-warning)',
}

function isDanger(s: Status) {
  return s === 'Overdue' || s === 'Rejected'
}
function hasWarn(s: Status) {
  return s === 'Overdue' || s === 'Awaiting payment'
}

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
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
})
const tab = css({
  appearance: 'none', background: 'transparent', border: 'none', cursor: 'pointer',
  paddingBlock: '3', marginBottom: '-1px',
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.secondary',
  borderBottomWidth: '2px', borderBottomStyle: 'solid', borderBottomColor: 'transparent',
  transition: 'color 120ms ease, border-color 120ms ease',
  _hover: { color: 'text.default' },
})
const tabActive = css({ color: 'text.default', borderBottomColor: 'border.brand' })

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

const tblWrap = css({ w: 'full', overflowX: 'auto' })
const tbl = css({ w: 'full', tableLayout: 'auto', borderCollapse: 'collapse' })
const th = css({
  bg: 'background.neutral.subtle',
  fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.secondary',
  lineHeight: 'lg', paddingInline: '3', paddingBlock: '3', h: '44px',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
  textAlign: 'left', whiteSpace: 'nowrap', verticalAlign: 'middle',
})
const td = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'text.default',
  paddingInline: '3', paddingBlock: '3',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
  verticalAlign: 'middle', whiteSpace: 'nowrap',
})
const docLink   = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'medium', color: 'text.link', cursor: 'pointer' })
const vendorName = css({ fontFamily: 'body', fontSize: 'md', color: 'text.default' })
const vendorSub = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
const muted     = css({ fontFamily: 'body', fontSize: 'md', color: 'text.secondary' })
const statusWrap = css({ display: 'inline-flex', alignItems: 'center', gap: '2' })
const dot        = css({ w: '8px', h: '8px', borderRadius: 'full', flexShrink: 0 })
const statusText = css({ fontFamily: 'body', fontSize: 'md', color: 'text.default' })
const statusTextBold = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'bold', color: 'text.default' })
const totalText = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default', textAlign: 'right' })

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

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" style="min-width:0;">

    <!-- Tabs -->
    <div :class="tabBar">
      <button
        v-for="t in tabs"
        :key="t"
        type="button"
        :class="[tab, activeTab === t ? tabActive : '']"
        @click="activeTab = t"
      >{{ t }}</button>
    </div>

    <!-- Toolbar -->
    <MpFlex align="center" justify="space-between" gap="3" style="flex-wrap:wrap;">
      <MpFlex align="center" gap="2" style="flex-wrap:wrap;">
        <MpButton variant="secondary" size="sm" right-icon="caret-down">All status</MpButton>
        <MpButton variant="secondary" size="sm" right-icon="caret-down">All accounts</MpButton>
        <MpButton variant="secondary" size="sm" right-icon="caret-down">This month</MpButton>
        <MpButton variant="secondary" size="sm" left-icon="filter" @click="filtersOpen = true">Filters</MpButton>
      </MpFlex>

      <MpFlex align="center" gap="2" style="flex-wrap:wrap;">
        <MpButton variant="secondary" size="sm" right-icon="caret-down">Sort: Oldest first</MpButton>
        <MpButton variant="secondary" size="sm">Export</MpButton>
        <label :class="searchWrap">
          <PxIcon name="search" :size="16" color="icon.subtle" />
          <input :class="searchInput" type="text" placeholder="Search document or vendor…" />
        </label>
      </MpFlex>
    </MpFlex>

    <!-- Table -->
    <div :class="tblWrap">
      <table :class="tbl">
        <thead>
          <tr>
            <th :class="th">DOCUMENT</th>
            <th :class="th">{{ primaryHeader }}</th>
            <th :class="th">DATE</th>
            <th :class="th">DUE · VALID</th>
            <th :class="th">STATUS</th>
            <th :class="th" style="width:24px;"></th>
            <th :class="th" style="text-align:right;">TOTAL</th>
            <th :class="th" style="width:44px;"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in activeRows" :key="r.doc">
            <td :class="td"><span :class="docLink">{{ r.doc }}</span></td>
            <td :class="td">
              <div :class="vendorName">{{ r.primary }}</div>
              <div :class="vendorSub">{{ r.sub }}</div>
            </td>
            <td :class="td"><span :class="muted">{{ r.date }}</span></td>
            <td :class="td"><span :class="muted">{{ r.due }}</span></td>
            <td :class="td">
              <span :class="statusWrap">
                <span :class="dot" :style="{ background: STATUS_COLOR[r.status] }" />
                <span :class="isDanger(r.status) ? statusTextBold : statusText">{{ r.status }}</span>
              </span>
            </td>
            <td :class="td" style="text-align:center;">
              <PxIcon v-if="hasWarn(r.status)" name="warning-triangle" :size="16" color="icon.warning" />
            </td>
            <td :class="td" style="text-align:right;"><span :class="totalText">{{ r.total }}</span></td>
            <td :class="td" style="text-align:right;">
              <MpButton variant="ghost" size="sm" left-icon="menu-meatball" aria-label="More" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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
          <MpTextlink size="body" style="cursor:pointer;" @click="resetFilters">Reset filter</MpTextlink>
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
            <MpFormControl id="np-date" isRequired style="flex:1 1 0;">
              <MpFormLabel>Date</MpFormLabel>
              <MpInput id="np-date-input" v-model="form.date" type="date" :is-full-width="true" />
            </MpFormControl>
            <MpFormControl id="np-due" style="flex:1 1 0;">
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
