<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Trips (list)
  Token mode: Pixel DT 2.4 (semantic tokens via css())
  Components: MpFlex, MpButton, PxIcon (all Pixel 3) + NuxtLink
  Static mock — 7 rows, no pagination logic.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-->
<script setup lang="ts">
import { MpFlex, MpButton, css } from '@mekari/pixel3'

definePageMeta({
  title: 'Trips',
  subtitle: 'All submitted trips across the company — monitor bookings, approvals and travelers.',
})

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
  pending:   'var(--mp-colors-icon-warning)',
  awaiting:  'var(--mp-colors-blue-600)',
  completed: 'var(--mp-colors-icon-default)',
  booked:    'var(--mp-colors-icon-success)',
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

const cellMain = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.default', whiteSpace: 'nowrap' })
const cellLink = css({ fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.link', textDecoration: 'none', whiteSpace: 'nowrap', _hover: { textDecoration: 'underline' } })
const cellSub  = css({ fontFamily: 'body', fontSize: 'xs', color: 'text.secondary', whiteSpace: 'nowrap' })

const statusCell = css({ display: 'inline-flex', alignItems: 'center', gap: '2', whiteSpace: 'nowrap' })
const dot        = css({ w: '8px', h: '8px', borderRadius: 'full', flexShrink: 0 })
const statusText = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.default' })

const footNote = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
</script>

<template>
  <!-- ═════ Header CTA ═════ -->
  <Teleport to="#layout-header-actions">
    <MpButton variant="primary" size="md">Manage travel policy</MpButton>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" style="min-width:0;">

    <!-- ═════ Toolbar ═════ -->
    <MpFlex align="center" justify="space-between" gap="3" style="flex-wrap:wrap;">
      <div :class="toolbarBtnRow">
        <MpButton variant="secondary" size="sm" right-icon="caret-down">All trip type</MpButton>
        <MpButton variant="secondary" size="sm" right-icon="caret-down">All status</MpButton>
        <MpButton variant="secondary" size="sm" left-icon="filter">Filters</MpButton>
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
            <td :class="td" style="text-align:right; white-space:nowrap;">
              <MpButton variant="ghost" size="sm" left-icon="menu-meatball" aria-label="Row actions" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ═════ Footer ═════ -->
    <span :class="footNote">Showing 7 of 7 · Rows per page: 10 · Page 1 of 1</span>

  </MpFlex>
</template>
