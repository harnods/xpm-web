<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Inbox
  Source: reference screenshot (Approvals / To-do / Notifications)
  Token mode: Pixel DT 2.4 (data-panda-theme="next")
  Components: MpFlex, MpText, MpButton, MpBadge, MpAvatar, PxIcon (all Pixel 3)
  Patterns mirrored: home index (css()/card/list), my-claims (th/td table), policies/claims (layout-tabs strip)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Tabs: Approvals (13) / To-do (6) / Notifications (4) — switches content via activeTab
    APPROVALS      — filter chips + search; "Needs your attention" + "Recommended to auto-approve" tables
    TO-DO          — "Your to-dos" + "Waiting on others" list sections
    NOTIFICATIONS  — "New" + "Earlier" list sections
-->
<script setup lang="ts">
import { MpFlex, MpButton, MpAvatar, css } from '@mekari/pixel3'

definePageMeta({ title: 'Inbox' })

// ─── Tabs ────────────────────────────────────────────────────────────
type Tab = 'approvals' | 'todo' | 'notifications'
const activeTab = ref<Tab>('approvals')
const TABS: { key: Tab; label: string; count: number }[] = [
  { key: 'approvals',     label: 'Approvals',     count: 13 },
  { key: 'todo',          label: 'To-do',         count: 6 },
  { key: 'notifications', label: 'Notifications', count: 4 },
]
function setTab(t: Tab) { activeTab.value = t }

// ─── Approvals filter chips + search ─────────────────────────────────
const CHIPS = ['All', 'Claims', 'Trips', 'Advances', 'Invoices']
const activeChip = ref('All')
const searchQuery = ref('')

// ─── Approvals data ──────────────────────────────────────────────────
const needsAttention = [
  { name: 'Maya Chen',           type: 'Claim',   category: 'Meals',        vendor: 'Nobu Downtown',      age: '4 days', risk: 'Missing itemization', amount: 'Rp 184.000' },
  { name: 'Priya Sharma',        type: 'Claim',   category: 'Software',     vendor: 'Adobe Systems',      age: '3 days', risk: 'Possible duplicate',  amount: 'Rp 59.990' },
  { name: 'Tom Okafor',          type: 'Claim',   category: 'Events',       vendor: 'The Assembly Hall',  age: '3 days', risk: 'Over limit +Rp 250K', amount: 'Rp 1.250.000' },
  { name: 'Ethan Cole',          type: 'Advance', category: 'Cash advance', vendor: '—',                  age: '3 days', risk: 'No linked trip',      amount: 'Rp 750.000' },
  { name: 'Brassica Supply Co.', type: 'Invoice', category: 'Vendor bill',  vendor: 'Brassica Supply Co.', age: '2 days', risk: 'PO amount mismatch',  amount: 'Rp 6.050.000' },
  { name: 'Daniel Reyes',        type: 'Trip',    category: 'New York',     vendor: 'New York, US',       age: '1 day',  risk: 'Hotel above cap',     amount: 'Rp 1.480.000' },
]

const autoApprove = [
  { name: 'Tom Okafor',          type: 'Trip',    category: 'Austin',       vendor: 'Austin, US',          age: '4 days', check: 'In policy · risk 12',      amount: 'Rp 3.400.000' },
  { name: 'Daniel Reyes',        type: 'Claim',   category: 'Travel',       vendor: 'United Airlines',     age: '2 days', check: 'In policy · risk 12',      amount: 'Rp 412.500' },
  { name: 'Maya Chen',           type: 'Trip',    category: 'London',       vendor: 'London, UK',          age: '2 days', check: 'In policy · risk 12',      amount: 'Rp 2.150.000' },
  { name: 'Lena Bauer',          type: 'Claim',   category: 'Events',       vendor: 'SaaStr Inc.',         age: '1 day',  check: 'In policy · risk 12',      amount: 'Rp 899.000' },
  { name: 'Sofia Martins',       type: 'Advance', category: 'Cash advance', vendor: '—',                   age: '1 day',  check: 'In policy · risk 12',      amount: 'Rp 400.000' },
  { name: 'Movus Technologies',  type: 'Invoice', category: 'Vendor bill',  vendor: 'Movus Technologies',  age: '1 day',  check: 'Matches PO · risk 12',     amount: 'Rp 1.240.000' },
  { name: 'Sofia Martins',       type: 'Claim',   category: 'Transport',    vendor: 'Uber',                age: '6 hrs',  check: 'Auto-approve fit · risk 7', amount: 'Rp 22.400' },
]

// ─── To-do data ──────────────────────────────────────────────────────
const yourTodos = [
  { name: 'Maya Chen',    title: 'Add receipt to Grab claim',        sub: 'Missing itemization',        age: '2 days', action: 'Fix' },
  { name: 'Daniel Reyes', title: 'Confirm hotel booking · New York', sub: 'Awaiting your confirmation',  age: '1 day',  action: 'Confirm' },
  { name: 'Priya Sharma', title: 'Re-submit Adobe renewal',          sub: 'Possible duplicate flagged',  age: '1 day',  action: 'Review' },
]
const waitingOthers = [
  { name: 'Ethan Cole', title: 'Cash advance · roadshow',  sub: 'Waiting on Finance disbursement', age: '3 days', action: 'View' },
  { name: 'Tom Okafor', title: 'Team offsite deposit',     sub: 'Waiting on Manager approval',     age: '2 days', action: 'View' },
]

// ─── Notifications data ──────────────────────────────────────────────
const notifNew = [
  { icon: 'reimbursement', title: 'Claim approved · Client lunch',     meta: 'Finance · 2h ago',   action: 'View' },
  { icon: 'billing',       title: 'Card top-up completed',             meta: 'Accounts · 4h ago',  action: 'View' },
  { icon: 'business-trip', title: 'Trip Bandung booking pending',      meta: 'Travel · 6h ago',    action: 'Open' },
  { icon: 'protection',    title: 'Policy updated: Meals cap',         meta: 'Admin · 1d ago',     action: 'View' },
]
const notifEarlier = [
  { icon: 'cart',          title: 'Purchase PI-64432 paid',            meta: 'Purchasing · 2d ago', action: 'View' },
  { icon: 'reimbursement', title: 'Cash advance disbursed',            meta: 'Finance · 3d ago',    action: 'View' },
]

// ─── CSS ─────────────────────────────────────────────────────────────
// Tabs (mirror policies/claims strip)
const tabBtn = css({
  display: 'inline-flex', alignItems: 'center', gap: '2', paddingBlock: '13px',
  background: 'transparent', border: 'none', cursor: 'pointer',
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg',
  borderBottom: '2px solid transparent',
})
const tabActive = css({
  color: 'text.default', fontWeight: 'semiBold',
  borderBottomColor: 'var(--mp-colors-indigo-500)',
})
const tabInactive = css({
  color: 'text.secondary',
  _hover: { color: 'text.default' },
})
const countPill = css({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  minWidth: '20px', h: '20px', paddingInline: '1.5', borderRadius: 'full',
  bg: 'background.neutral.subtle', color: 'text.secondary',
  fontFamily: 'body', fontSize: 'xs', fontWeight: 'semiBold', lineHeight: 'xs',
})

// Filter chips
const chipBase = css({
  display: 'inline-flex', alignItems: 'center', h: '32px', paddingInline: '3',
  borderRadius: 'full', border: 'none', cursor: 'pointer',
  fontFamily: 'body', fontSize: 'sm', fontWeight: 'medium', whiteSpace: 'nowrap',
})
const chipActive = css({ bg: 'background.brand.selected', color: 'text.link' })
const chipGhost = css({
  bg: 'transparent', color: 'text.secondary',
  _hover: { bg: 'background.neutral.subtle', color: 'text.default' },
})

// Search input
const searchWrap = css({
  display: 'inline-flex', alignItems: 'center', gap: '2', h: '36px',
  paddingInline: '3', width: '260px',
  bg: 'background.neutral', borderRadius: 'md',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  _focusWithin: { borderColor: 'border.focused', boxShadow: 'focus' },
})
const searchInput = css({
  flex: '1 1 auto', minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
  fontFamily: 'body', fontSize: 'sm', color: 'text.default',
  _placeholder: { color: 'text.secondary' },
})

// Section header
const sectionHead = css({ display: 'flex', alignItems: 'center', gap: '2', flexWrap: 'wrap', paddingBlock: '1' })
const sectionTitle = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default' })
const sectionPill = css({
  display: 'inline-flex', alignItems: 'center', gap: '1.5',
  paddingInline: '2', h: '20px', borderRadius: 'full',
  bg: 'background.neutral.subtle', color: 'text.default',
  fontFamily: 'body', fontSize: 'xs', fontWeight: 'semiBold', lineHeight: 'xs',
})
const sectionSub = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
const sectionRight = css({ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '3' })
const dot = css({ w: '6px', h: '6px', borderRadius: 'full', flexShrink: 0 })

// Table (mirror my-claims th/td, DT2.4 semantic tokens)
const tblWrap = css({ w: 'full', overflowX: 'auto' })
const tbl = css({ w: 'full', tableLayout: 'auto', borderCollapse: 'collapse' })
const th = css({
  bg: 'background.neutral.subtle',
  fontFamily: 'body', fontSize: 'xs', fontWeight: 'semiBold', lineHeight: 'lg',
  color: 'text.secondary', letterSpacing: '0.04em',
  paddingInline: '3', paddingBlock: '2.5', h: '40px',
  borderBottom: '1px solid', borderBottomColor: 'border.default',
  textAlign: 'left', whiteSpace: 'nowrap', verticalAlign: 'middle',
})
const td = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'text.default',
  paddingInline: '3', paddingBlock: '3',
  borderBottom: '1px solid', borderBottomColor: 'border.default',
  verticalAlign: 'middle', whiteSpace: 'nowrap',
})
const cellName = css({ display: 'inline-flex', alignItems: 'center', gap: '2.5' })
const nameText = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default' })
const secondaryText = css({ fontFamily: 'body', fontSize: 'md', color: 'text.secondary' })
const riskCell = css({ display: 'inline-flex', alignItems: 'center', gap: '2', fontFamily: 'body', fontSize: 'md', color: 'text.secondary' })
const amountCell = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default', textAlign: 'right', whiteSpace: 'nowrap' })
const checkbox = css({ w: '16px', h: '16px', cursor: 'pointer', accentColor: 'var(--mp-colors-indigo-500)' })

// List rows (to-do / notifications)
const card = css({
  bg: 'background.neutral', borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  borderRadius: 'lg', overflow: 'hidden',
})
const listRow = css({
  display: 'flex', alignItems: 'center', gap: '3', paddingInline: '4', paddingBlock: '3',
  borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'border.default',
  bg: 'background.neutral', transition: 'background-color 120ms ease',
  _first: { borderTopWidth: '0' },
  _hover: { bg: 'background.neutral.hovered' },
})
const rowBody = css({ display: 'flex', flexDirection: 'column', gap: '0.5', flex: '1 1 auto', minWidth: 0 })
const rowTitle = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' })
const rowSub = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' })
const rowAge = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary', whiteSpace: 'nowrap', flexShrink: 0 })
const iconChip = css({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  w: '36px', h: '36px', borderRadius: 'md', bg: 'background.brand', flexShrink: 0,
})
const notifMeta = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary', whiteSpace: 'nowrap' })
const listLabel = css({ fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.secondary', letterSpacing: '0.04em' })
</script>

<template>
  <!-- ═════ Tabs strip (into layout title bar area) ═════ -->
  <Teleport to="#layout-tabs">
    <MpFlex gap="6" paddingInline="6" style="line-height: normal;">
      <button
        v-for="t in TABS" :key="t.key"
        :class="[tabBtn, activeTab === t.key ? tabActive : tabInactive]"
        @click="setTab(t.key)"
      >
        {{ t.label }}
        <span :class="countPill">{{ t.count }}</span>
      </button>
    </MpFlex>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" style="min-width:0;">

    <!-- ══════════════════ APPROVALS ══════════════════ -->
    <template v-if="activeTab === 'approvals'">

      <!-- Filter chips + search -->
      <MpFlex align="center" justify="space-between" gap="3" style="flex-wrap:wrap;">
        <MpFlex align="center" gap="2" style="flex-wrap:wrap;">
          <button
            v-for="c in CHIPS" :key="c"
            :class="[chipBase, activeChip === c ? chipActive : chipGhost]"
            @click="activeChip = c"
          >{{ c }}</button>
        </MpFlex>

        <div :class="searchWrap">
          <PxIcon name="search" :size="16" color="icon.subtle" />
          <input v-model="searchQuery" :class="searchInput" type="text" placeholder="Search name or memo…" />
        </div>
      </MpFlex>

      <!-- Needs your attention -->
      <div :class="card">
        <div :class="[sectionHead, css({ paddingInline: '4', paddingTop: '4', paddingBottom: '3' })]">
          <span :class="sectionTitle">Needs your attention</span>
          <span :class="sectionPill">
            <span :class="dot" :style="{ background: 'var(--mp-colors-icon-warning)' }" />8
          </span>
          <span :class="sectionRight">
            <span :class="sectionSub">Rp 9.773.990 waiting · flagged by policy or AI</span>
          </span>
        </div>

        <div :class="tblWrap">
          <table :class="tbl">
            <thead>
              <tr>
                <th :class="th">Requester</th>
                <th :class="th">Type</th>
                <th :class="th">Category</th>
                <th :class="th">Vendor</th>
                <th :class="th">Age</th>
                <th :class="th">AI risk</th>
                <th :class="th" style="text-align:right;">Amount</th>
                <th :class="th"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in needsAttention" :key="i">
                <td :class="td">
                  <span :class="cellName">
                    <MpAvatar :id="`na-${i}`" :name="r.name" size="sm" variant-color="gray" />
                    <span :class="nameText">{{ r.name }}</span>
                  </span>
                </td>
                <td :class="td"><span :class="secondaryText">{{ r.type }}</span></td>
                <td :class="td"><span :class="secondaryText">{{ r.category }}</span></td>
                <td :class="td"><span :class="secondaryText">{{ r.vendor }}</span></td>
                <td :class="td"><span :class="secondaryText">{{ r.age }}</span></td>
                <td :class="td">
                  <span :class="riskCell">
                    <span :class="dot" :style="{ background: 'var(--mp-colors-icon-warning)' }" />{{ r.risk }}
                  </span>
                </td>
                <td :class="td"><span :class="amountCell" style="display:block;">{{ r.amount }}</span></td>
                <td :class="td" style="text-align:right;">
                  <MpButton variant="secondary" size="sm">Review</MpButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recommended to auto-approve -->
      <div :class="card">
        <div :class="css({ display: 'flex', alignItems: 'center', gap: '2', flexWrap: 'wrap', paddingInline: '4', paddingTop: '4', paddingBottom: '3' })">
          <span :class="sectionTitle">Recommended to auto-approve</span>
          <span :class="sectionPill">
            <span :class="dot" :style="{ background: 'var(--mp-colors-icon-success)' }" />7
          </span>
          <span :class="sectionSub">in policy, clean receipts, low AI risk</span>
          <span :class="sectionRight">
            <MpButton variant="primary" size="sm">Approve all · Rp 8.523.900</MpButton>
          </span>
        </div>

        <div :class="tblWrap">
          <table :class="tbl">
            <thead>
              <tr>
                <th :class="th" style="width:36px;"></th>
                <th :class="th">Requester</th>
                <th :class="th">Type</th>
                <th :class="th">Category</th>
                <th :class="th">Vendor</th>
                <th :class="th">Age</th>
                <th :class="th">AI check</th>
                <th :class="th" style="text-align:right;">Amount</th>
                <th :class="th"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in autoApprove" :key="i">
                <td :class="td"><input type="checkbox" :class="checkbox" /></td>
                <td :class="td">
                  <span :class="cellName">
                    <MpAvatar :id="`aa-${i}`" :name="r.name" size="sm" variant-color="gray" />
                    <span :class="nameText">{{ r.name }}</span>
                  </span>
                </td>
                <td :class="td"><span :class="secondaryText">{{ r.type }}</span></td>
                <td :class="td"><span :class="secondaryText">{{ r.category }}</span></td>
                <td :class="td"><span :class="secondaryText">{{ r.vendor }}</span></td>
                <td :class="td"><span :class="secondaryText">{{ r.age }}</span></td>
                <td :class="td">
                  <span :class="riskCell">
                    <span :class="dot" :style="{ background: 'var(--mp-colors-icon-success)' }" />{{ r.check }}
                  </span>
                </td>
                <td :class="td"><span :class="amountCell" style="display:block;">{{ r.amount }}</span></td>
                <td :class="td" style="text-align:right;">
                  <MpButton variant="secondary" size="sm">Review</MpButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </template>

    <!-- ══════════════════ TO-DO ══════════════════ -->
    <template v-else-if="activeTab === 'todo'">

      <MpFlex direction="column" gap="2">
        <span :class="listLabel">YOUR TO-DOS</span>
        <div :class="card">
          <div v-for="(r, i) in yourTodos" :key="i" :class="listRow">
            <MpAvatar :id="`todo-${i}`" :name="r.name" size="sm" variant-color="gray" />
            <div :class="rowBody">
              <span :class="rowTitle">{{ r.title }}</span>
              <span :class="rowSub">{{ r.sub }}</span>
            </div>
            <span :class="rowAge">{{ r.age }}</span>
            <MpButton variant="secondary" size="sm">{{ r.action }}</MpButton>
          </div>
        </div>
      </MpFlex>

      <MpFlex direction="column" gap="2">
        <span :class="listLabel">WAITING ON OTHERS</span>
        <div :class="card">
          <div v-for="(r, i) in waitingOthers" :key="i" :class="listRow">
            <MpAvatar :id="`wait-${i}`" :name="r.name" size="sm" variant-color="gray" />
            <div :class="rowBody">
              <span :class="rowTitle">{{ r.title }}</span>
              <span :class="rowSub">{{ r.sub }}</span>
            </div>
            <span :class="rowAge">{{ r.age }}</span>
            <MpButton variant="secondary" size="sm">{{ r.action }}</MpButton>
          </div>
        </div>
      </MpFlex>

    </template>

    <!-- ══════════════════ NOTIFICATIONS ══════════════════ -->
    <template v-else>

      <MpFlex direction="column" gap="2">
        <span :class="listLabel">NEW</span>
        <div :class="card">
          <div v-for="(n, i) in notifNew" :key="i" :class="listRow">
            <span :class="iconChip"><PxIcon :name="n.icon" :size="18" color="icon.brand" /></span>
            <div :class="rowBody">
              <span :class="rowTitle">
                {{ n.title }}
                <span :class="notifMeta">· {{ n.meta }}</span>
              </span>
            </div>
            <MpButton variant="textLink" size="sm">{{ n.action }}</MpButton>
          </div>
        </div>
      </MpFlex>

      <MpFlex direction="column" gap="2">
        <span :class="listLabel">EARLIER</span>
        <div :class="card">
          <div v-for="(n, i) in notifEarlier" :key="i" :class="listRow">
            <span :class="iconChip"><PxIcon :name="n.icon" :size="18" color="icon.brand" /></span>
            <div :class="rowBody">
              <span :class="rowTitle">
                {{ n.title }}
                <span :class="notifMeta">· {{ n.meta }}</span>
              </span>
            </div>
            <MpButton variant="textLink" size="sm">{{ n.action }}</MpButton>
          </div>
        </div>
      </MpFlex>

    </template>

  </MpFlex>
</template>
