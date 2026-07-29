<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Trips (list)
  Token mode: Pixel DT 2.4 (semantic tokens via css())
  Components: MpFlex, MpButton, PxIcon (all Pixel 3) + NuxtLink
  Static mock — 7 rows, no pagination logic.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-->
<script setup lang="ts">
import {
  MpFlex, MpButton, MpText, MpTextlink,
  MpDrawer, MpDrawerOverlay, MpDrawerContent, MpDrawerHeader,
  MpDrawerCloseButton, MpDrawerBody, MpDrawerFooter,
  css, token,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Trips',
  subtitle: 'All submitted trips across the company — monitor bookings, approvals and travelers.',
})

// ─── Drawer state ────────────────────────────────────────────────────
const filtersOpen = ref(false)
const policyOpen = ref(false)

// Filter selections (single-select toggle per group, prototype-static)
type FilterKey = 'type' | 'status' | 'period'
const sel = ref<Record<FilterKey, string | null>>({ type: null, status: null, period: null })
function pick(key: FilterKey, v: string) { sel.value[key] = sel.value[key] === v ? null : v }
function resetFilters() { sel.value = { type: null, status: null, period: null } }

const TRIP_TYPES = ['Domestic', 'International']
const STATUSES = ['Booking pending', 'Booked', 'Trip done', 'Completed']
const PERIODS = ['This month', 'Last month', 'Last 90 days', 'This year', 'Custom']

// Travel-policy drawer content (inferred — no reference wiring existed;
// kept reference-consistent with the New-trip-policy drawer on the home page)
const perDiemZones = [
  { zone: 'Zone 1 — Jabodetabek', rate: 'Rp 350.000 / day' },
  { zone: 'Zone 2 — Java (non-Jabodetabek)', rate: 'Rp 300.000 / day' },
  { zone: 'Zone 3 — Outer islands', rate: 'Rp 400.000 / day' },
  { zone: 'Zone 4 — International', rate: 'USD 75 / day' },
]

// ─── Data ────────────────────────────────────────────────────────────
type StatusKind = 'pending' | 'awaiting' | 'completed' | 'booked'

interface TripRow {
  name: string
  code: string
  reqBy: string
  reqSub: string
  dest: string
  destSub: string
  reqDate: string
  tripDate: string
  dur: string
  status: string
  kind: StatusKind
}

const rows: TripRow[] = [
  { name: 'Trip bandung',            code: 'BT20260750596', reqBy: 'XM punya 3', reqSub: 'BUATXM3', dest: 'Bandung',   destSub: 'QA GROUP DOMESTIC 2', reqDate: '15 Jul 2026', tripDate: '15 – 17 Jul 2026', dur: '2 days', status: 'Booking pending',              kind: 'pending' },
  { name: 'Visit klien di bandung',  code: 'BT20260750683', reqBy: 'XM punya 3', reqSub: 'BUATXM3', dest: 'Bandung',   destSub: 'QA GROUP DOMESTIC 2', reqDate: '16 Jul 2026', tripDate: '16 – 18 Jul 2026', dur: '2 days', status: 'Trip done · awaiting report', kind: 'awaiting' },
  { name: 'Visit klien di Bandung',  code: 'BT20260750772', reqBy: 'XM punya 3', reqSub: 'BUATXM3', dest: 'Bandung',   destSub: 'QA GROUP DOMESTIC 2', reqDate: '17 Jul 2026', tripDate: '17 – 19 Jul 2026', dur: '2 days', status: 'Trip done · awaiting report', kind: 'awaiting' },
  { name: 'Testing KE BANDUNG',      code: 'BT20260750741', reqBy: 'XM punya 3', reqSub: 'BUATXM3', dest: 'Bandung',   destSub: 'KEPERLUAN DEMO',      reqDate: '17 Jul 2026', tripDate: '17 – 21 Jul 2026', dur: '4 days', status: 'Completed',                    kind: 'completed' },
  { name: 'Singapore client visit',  code: 'BT20260751088', reqBy: 'XM punya 3', reqSub: 'BUATXM3', dest: 'Singapore', destSub: 'SEA REGIONAL',        reqDate: '20 Jul 2026', tripDate: '4 – 7 Aug 2026',   dur: '4 days', status: 'Booked',                       kind: 'booked' },
  { name: 'Testing PLB',             code: 'BT20260751072', reqBy: 'XM punya 3', reqSub: 'BUATXM3', dest: 'Bandung',   destSub: 'KEPERLUAN DEMO',      reqDate: '21 Jul 2026', tripDate: '27 – 29 Jul 2026', dur: '2 days', status: 'Booked',                       kind: 'booked' },
  { name: 'Test budget 1',           code: 'BT20260751030', reqBy: 'XM punya 3', reqSub: 'BUATXM3', dest: 'Semarang',  destSub: 'Jawa Tengah dan DIY', reqDate: '21 Jul 2026', tripDate: '27 – 30 Jul 2026', dur: '3 days', status: 'Booking pending',              kind: 'pending' },
]

const DOT: Record<StatusKind, string> = {
  pending:   token.var('colors.icon.warning'),
  awaiting:  token.var('colors.icon.information'),
  completed: token.var('colors.icon.default'),
  booked:    token.var('colors.icon.success'),
}

// ─── CSS ─────────────────────────────────────────────────────────────
const toolbarBtnRow = css({ display: 'flex', alignItems: 'center', gap: '2', flexWrap: 'wrap' })

const searchBox = css({
  display: 'flex', alignItems: 'center', gap: '2',
  minHeight: '32px', paddingInline: '3', minWidth: '240px',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default', borderRadius: 'md',
  bg: 'background.neutral',
})
const searchInput = css({
  border: 'none', outline: 'none', background: 'transparent', flex: '1 1 auto', minWidth: 0,
  fontFamily: 'body', fontSize: 'sm', color: 'text.default',
  _placeholder: { color: 'text.secondary' },
})

const tblWrap = css({ w: 'full', overflowX: 'auto', borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default', borderRadius: 'lg' })
const tbl = css({ w: 'full', tableLayout: 'auto', borderCollapse: 'collapse' })
const th = css({
  bg: 'background.neutral.subtle',
  fontFamily: 'body', fontSize: 'xs', fontWeight: 'semiBold', letterSpacing: 'wide',
  color: 'text.secondary', textTransform: 'uppercase',
  paddingInline: '4', paddingBlock: '3', h: '40px',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
  textAlign: 'left', whiteSpace: 'nowrap', verticalAlign: 'middle',
})
const td = css({
  paddingInline: '4', paddingBlock: '3',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
  verticalAlign: 'middle',
})
const tdActions = css({ textAlign: 'right', whiteSpace: 'nowrap' })

const cellMain = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.default', whiteSpace: 'nowrap' })
const cellLink = css({ fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.link', textDecoration: 'none', whiteSpace: 'nowrap', _hover: { textDecoration: 'underline' } })
const cellSub  = css({ fontFamily: 'body', fontSize: 'xs', color: 'text.secondary', whiteSpace: 'nowrap' })

const statusCell = css({ display: 'inline-flex', alignItems: 'center', gap: '2', whiteSpace: 'nowrap' })
const dot        = css({ w: '8px', h: '8px', borderRadius: 'full', flexShrink: 0 })
const statusText = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.default' })

const footNote = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })

// ─── Drawer styles ───────────────────────────────────────────────────
const drawerTitle = css({ fontFamily: 'body', fontSize: 'lg', fontWeight: 'semiBold', color: 'text.default' })
const groupLabel  = css({ fontFamily: 'body', fontSize: 'xs', fontWeight: 'semiBold', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' })
const fieldLabel  = css({ fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.default' })
const pillRow     = css({ display: 'flex', flexWrap: 'wrap', gap: '2' })

const pillOff = css({
  display: 'inline-flex', alignItems: 'center', px: '3', py: '1.5',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default', borderRadius: 'full',
  fontFamily: 'body', fontSize: 'sm', color: 'text.default', cursor: 'pointer', bg: 'background.neutral',
  transition: 'border-color 120ms ease',
  _hover: { borderColor: 'border.bold' },
})
const pillOn = css({
  display: 'inline-flex', alignItems: 'center', px: '3', py: '1.5',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'background.brand.selected', borderRadius: 'full',
  fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.link',
  cursor: 'pointer', bg: 'background.brand',
})

const policyRow  = css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4', paddingBlock: '2.5', borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'border.default', _first: { borderTopWidth: '0' } })
const policyName = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.default' })
const policyRate = css({ fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.default', whiteSpace: 'nowrap' })
const policyBox  = css({ borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default', borderRadius: 'lg', paddingInline: '4', paddingBlock: '1' })
</script>

<template>
  <!-- ═════ Header CTA ═════ -->
  <Teleport to="#layout-header-actions">
    <MpButton variant="primary" size="md" @click="policyOpen = true">Manage travel policy</MpButton>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" min-width="0">

    <!-- ═════ Toolbar ═════ -->
    <MpFlex align="center" justify="space-between" gap="3" wrap="wrap">
      <div :class="toolbarBtnRow">
        <MpButton variant="secondary" size="sm" right-icon="caret-down">All trip type</MpButton>
        <MpButton variant="secondary" size="sm" right-icon="caret-down">All status</MpButton>
        <MpButton variant="secondary" size="sm" left-icon="filter" @click="filtersOpen = true">Filters</MpButton>
      </div>
      <div :class="toolbarBtnRow">
        <MpButton variant="secondary" size="sm" right-icon="caret-down">Sort: Oldest first</MpButton>
        <MpButton variant="secondary" size="sm" left-icon="download">Export</MpButton>
        <label :class="searchBox">
          <PxIcon name="search" :size="16" color="icon.default" />
          <input :class="searchInput" type="text" placeholder="Search employee name…" />
        </label>
      </div>
    </MpFlex>

    <!-- ═════ Data table ═════ -->
    <div :class="tblWrap">
      <table :class="tbl">
        <thead>
          <tr>
            <th :class="th">Trip name</th>
            <th :class="th">Request by</th>
            <th :class="th">Destination</th>
            <th :class="th">Request date</th>
            <th :class="th">Trip date</th>
            <th :class="th">Booking status</th>
            <th :class="th" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.code">
            <!-- Trip name -->
            <td :class="td">
              <div><NuxtLink :to="`/trips/${r.code}`" :class="cellLink">{{ r.name }}</NuxtLink></div>
              <div :class="cellSub">{{ r.code }}</div>
            </td>
            <!-- Request by -->
            <td :class="td">
              <div :class="cellMain">{{ r.reqBy }}</div>
              <div :class="cellSub">{{ r.reqSub }}</div>
            </td>
            <!-- Destination -->
            <td :class="td">
              <div :class="cellMain">{{ r.dest }}</div>
              <div :class="cellSub">{{ r.destSub }}</div>
            </td>
            <!-- Request date -->
            <td :class="td"><span :class="cellMain">{{ r.reqDate }}</span></td>
            <!-- Trip date -->
            <td :class="td">
              <div :class="cellMain">{{ r.tripDate }}</div>
              <div :class="cellSub">{{ r.dur }}</div>
            </td>
            <!-- Booking status -->
            <td :class="td">
              <span :class="statusCell">
                <span :class="dot" :style="{ background: DOT[r.kind] }" />
                <PxIcon v-if="r.kind === 'pending'" name="warning-triangle" :size="16" color="icon.warning" />
                <span :class="statusText">{{ r.status }}</span>
              </span>
            </td>
            <!-- Actions -->
            <td :class="[td, tdActions]">
              <MpButton variant="ghost" size="sm" left-icon="menu-meatball" aria-label="Row actions" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ═════ Footer ═════ -->
    <span :class="footNote">Showing 7 of 7 · Rows per page: 10 · Page 1 of 1</span>

  </MpFlex>

  <!-- ═════ DRAWER · All filters ═════ -->
  <MpDrawer id="trips-filters-drawer" :is-open="filtersOpen" size="md" placement="right" is-block-scroll-on-mount @close="filtersOpen = false">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <span :class="drawerTitle">All filters</span>
        <MpDrawerCloseButton />
      </MpDrawerHeader>
      <MpDrawerBody>
        <MpFlex direction="column" gap="6" width="full">
          <!-- Trip type -->
          <MpFlex direction="column" gap="3">
            <span :class="fieldLabel">Trip type</span>
            <div :class="pillRow">
              <span v-for="t in TRIP_TYPES" :key="t" :class="sel.type === t ? pillOn : pillOff" @click="pick('type', t)">{{ t }}</span>
            </div>
          </MpFlex>
          <!-- Status -->
          <MpFlex direction="column" gap="3">
            <span :class="fieldLabel">Status</span>
            <div :class="pillRow">
              <span v-for="s in STATUSES" :key="s" :class="sel.status === s ? pillOn : pillOff" @click="pick('status', s)">{{ s }}</span>
            </div>
          </MpFlex>
          <!-- Period -->
          <MpFlex direction="column" gap="3">
            <span :class="groupLabel">Period</span>
            <div :class="pillRow">
              <span v-for="p in PERIODS" :key="p" :class="sel.period === p ? pillOn : pillOff" @click="pick('period', p)">{{ p }}</span>
            </div>
          </MpFlex>
        </MpFlex>
      </MpDrawerBody>
      <MpDrawerFooter>
        <MpFlex align="center" justify="space-between" gap="2" width="full">
          <MpTextlink size="body" @click="resetFilters">Reset filter</MpTextlink>
          <MpFlex gap="2">
            <MpButton variant="ghost" @click="filtersOpen = false">Cancel</MpButton>
            <MpButton variant="primary" @click="filtersOpen = false">Apply</MpButton>
          </MpFlex>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>

  <!-- ═════ DRAWER · Travel policy (inferred — no reference wiring; kept
       reference-consistent with the home-page trip-policy drawer) ═════ -->
  <MpDrawer id="trips-policy-drawer" :is-open="policyOpen" size="md" placement="right" is-block-scroll-on-mount @close="policyOpen = false">
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <span :class="drawerTitle">Travel policy</span>
        <MpDrawerCloseButton />
      </MpDrawerHeader>
      <MpDrawerBody>
        <MpFlex direction="column" gap="6" width="full">
          <!-- Booking window -->
          <MpFlex direction="column" gap="1">
            <span :class="fieldLabel">Booking window</span>
            <MpText size="body" color="secondary">Trips must be booked at least 3 days before departure.</MpText>
          </MpFlex>
          <!-- Cabin class cap -->
          <MpFlex direction="column" gap="1">
            <span :class="fieldLabel">Cabin class cap</span>
            <MpText size="body" color="secondary">Economy for flights under 5 hours; Business allowed beyond.</MpText>
          </MpFlex>
          <!-- Hotel nightly cap -->
          <MpFlex direction="column" gap="1">
            <span :class="fieldLabel">Hotel nightly cap</span>
            <MpText size="body" color="secondary">Rp 1.200.000 domestic · USD 180 international, per night.</MpText>
          </MpFlex>
          <!-- Per-diem rates by zone -->
          <MpFlex direction="column" gap="3">
            <span :class="groupLabel">Per-diem rates by zone</span>
            <div :class="policyBox">
              <div v-for="z in perDiemZones" :key="z.zone" :class="policyRow">
                <span :class="policyName">{{ z.zone }}</span>
                <span :class="policyRate">{{ z.rate }}</span>
              </div>
            </div>
          </MpFlex>
          <span :class="footNote">Requests above these caps can still be submitted; approvers see an over-policy flag before booking.</span>
        </MpFlex>
      </MpDrawerBody>
      <MpDrawerFooter>
        <MpFlex justify="flex-end" gap="2" width="full">
          <MpButton variant="ghost" @click="policyOpen = false">Cancel</MpButton>
          <MpButton variant="primary" @click="policyOpen = false">Save policy</MpButton>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>
</template>
