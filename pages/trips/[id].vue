<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Trip detail
  Token mode: Pixel DT 2.4 (semantic tokens via css())
  Components: MpFlex, MpText, MpButton, MpBadge, MpAvatar, PxIcon (all Pixel 3)
  Static content — [id] is ignored for this prototype.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-->
<script setup lang="ts">
import { MpFlex, MpText, MpButton, MpBadge, MpAvatar, css, token } from '@mekari/pixel3'

definePageMeta({
  title: 'Trip bandung',
  breadcrumbParent: { path: '/trips', label: 'Trips' },
})

// ─── Data ────────────────────────────────────────────────────────────
const tripInfo = [
  { label: 'Trip type',       value: 'Domestic',       sub: '' },
  { label: 'Booking option',  value: 'Company',        sub: '' },
  { label: 'Account',         value: 'Main account',   sub: '' },
  { label: 'Trip date',       value: '15 – 17 Jul 2026', sub: '(2 days)' },
  { label: 'Purpose of trip', value: 'Client visit',   sub: '' },
  { label: 'Destination',     value: 'Bandung',        sub: '· QA GROUP DOMESTIC 2' },
]

const transport = [
  { mode: 'Flight — round trip', from: 'Jakarta',  to: 'Bandung', departure: '15 Jul 2026', ret: '17 Jul 2026' },
  { mode: 'Train — transfer',    from: 'Bandung…', to: 'Client…', departure: '15 Jul 2026', ret: '—' },
]

// ─── Collapsible section state (per-section ref, default open) ─────────
const open = ref({ transport: true, accommodation: true, cashAdvance: true })

const timeline = [
  { title: 'Booking pending',                          dot: token.var('colors.icon.warning'), time: '' },
  { title: 'Approved by XM punya 3 (BUATXM3)',         dot: token.var('colors.icon.success'), time: '15 Jul 2026, 15:54 (GMT+7)' },
  { title: 'Requested by XM punya 3 (BUATXM3)',        dot: token.var('colors.icon.success'), time: '15 Jul 2026, 15:54 (GMT+7)' },
]

// ─── CSS ─────────────────────────────────────────────────────────────
const grid = css({ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '4', alignItems: 'start' })
const colStack = css({ display: 'flex', flexDirection: 'column', gap: '4' })

const card = css({
  bg: 'background.neutral', borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  borderRadius: 'lg', display: 'flex', flexDirection: 'column',
})
const cardHead = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  paddingInline: '4', paddingTop: '4', paddingBottom: '3',
})
const cardHeadLabel = css({
  fontFamily: 'body', fontSize: 'xs', fontWeight: 'semiBold', letterSpacing: 'wide',
  color: 'text.secondary', textTransform: 'uppercase',
})
const cardBody = css({ paddingInline: '4', paddingBottom: '4', display: 'flex', flexDirection: 'column', gap: '3' })
const cardHeadBtn = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  paddingInline: '4', paddingTop: '4', paddingBottom: '3',
  width: 'full', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
})

const infoGrid = css({ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '4' })
const infoLabel = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
const infoValue = css({ fontFamily: 'body', fontSize: 'md', color: 'text.default' })
const infoSub   = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })

const rowBlock = css({
  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '4',
  paddingBlock: '3',
  borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'border.default',
  _first: { borderTopWidth: '0', paddingTop: '0' },
})
const modeLabel = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default' })
const legGrid   = css({ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '2', marginTop: '2', maxWidth: '360px' })
const legLabel  = css({ fontFamily: 'body', fontSize: 'xs', color: 'text.secondary' })
const legValue  = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.default' })
const rowBtns   = css({ display: 'flex', alignItems: 'center', gap: '2', flexShrink: 0 })

const tbl = css({ w: 'full', borderCollapse: 'collapse' })
const th  = css({
  bg: 'background.neutral.subtle',
  fontFamily: 'body', fontSize: 'xs', fontWeight: 'semiBold', letterSpacing: 'wide',
  color: 'text.secondary', textTransform: 'uppercase',
  paddingInline: '3', paddingBlock: '2.5', textAlign: 'left', whiteSpace: 'nowrap',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
})
const thR = css({ textAlign: 'right' })
const td  = css({
  fontFamily: 'body', fontSize: 'sm', color: 'text.default',
  paddingInline: '3', paddingBlock: '3',
  borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default',
})
const tdR = css({ textAlign: 'right', whiteSpace: 'nowrap' })
const tdMuted = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary', paddingInline: '3', paddingBlock: '3' })
const totalCell = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default', paddingInline: '3', paddingBlock: '3' })

const emptyState = css({
  fontFamily: 'body', fontSize: 'sm', color: 'text.secondary',
  textAlign: 'center', paddingInline: '4', paddingBlock: '8',
})
const noteMuted = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
const reqMeta   = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })

// Requester
const reqName = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default' })
const reqSub  = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })

// Timeline
const tlItem  = css({ display: 'flex', gap: '3', alignItems: 'flex-start' })
const tlRail  = css({ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 })
const tlDot   = css({ w: '10px', h: '10px', borderRadius: 'full', marginTop: '4px' })
const tlLine  = css({ w: '1px', flex: '1 1 auto', minHeight: '18px', background: 'border.default' })
const tlTitle = css({ fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.default' })
const tlTime  = css({ fontFamily: 'body', fontSize: 'xs', color: 'text.secondary' })

// Layout helpers (folded from former inline styles)
const colGap2       = css({ display: 'flex', flexDirection: 'column', gap: '2px' })
const col           = css({ display: 'flex', flexDirection: 'column' })
const minW0         = css({ minWidth: 0 })
const colGap2PadB   = css({ display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '2' })
const cardBodyPadTop = css({ paddingTop: '4' })
</script>

<template>
  <!-- ═════ Title suffix badge ═════ -->
  <Teleport to="#layout-title-suffix">
    <MpBadge for="tableStatus" type="warning">Booking pending</MpBadge>
  </Teleport>

  <!-- ═════ Header CTA ═════ -->
  <Teleport to="#layout-header-actions">
    <MpButton variant="secondary" size="md" left-icon="download">Export PDF</MpButton>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" min-width="0">
    <MpText as="p" size="body-small" color="text.secondary">BT20260750596 · requested 15 Jul 2026</MpText>
    <div :class="grid">

      <!-- ══════════ LEFT ══════════ -->
      <div :class="colStack">

        <!-- TRIP INFORMATION -->
        <div :class="card">
          <div :class="cardHead"><span :class="cardHeadLabel">Trip information</span></div>
          <div :class="cardBody">
            <div :class="infoGrid">
              <div v-for="f in tripInfo" :key="f.label" :class="colGap2">
                <span :class="infoLabel">{{ f.label }}</span>
                <span>
                  <span :class="infoValue">{{ f.value }}</span>
                  <span v-if="f.sub" :class="infoSub">&nbsp;{{ f.sub }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- TRANSPORTATION -->
        <div :class="card">
          <button :class="cardHeadBtn" @click="open.transport = !open.transport">
            <span :class="cardHeadLabel">Transportation</span>
            <PxIcon :name="open.transport ? 'caret-up' : 'caret-down'" :size="18" color="icon.default" />
          </button>
          <div v-show="open.transport" :class="cardBody">
            <div v-for="t in transport" :key="t.mode" :class="rowBlock">
              <div :class="minW0">
                <span :class="modeLabel">{{ t.mode }}</span>
                <div :class="legGrid">
                  <div :class="colGap2">
                    <span :class="legLabel">From</span><span :class="legValue">{{ t.from }}</span>
                  </div>
                  <div :class="colGap2">
                    <span :class="legLabel">To</span><span :class="legValue">{{ t.to }}</span>
                  </div>
                  <div :class="colGap2">
                    <span :class="legLabel">Departure</span><span :class="legValue">{{ t.departure }}</span>
                  </div>
                  <div :class="colGap2">
                    <span :class="legLabel">Return</span><span :class="legValue">{{ t.ret }}</span>
                  </div>
                </div>
              </div>
              <div :class="rowBtns">
                <MpButton variant="secondary" size="sm" right-icon="newtab">Book via OTA</MpButton>
                <MpButton variant="textLink" size="sm" left-icon="add">Attach document</MpButton>
              </div>
            </div>
          </div>
        </div>

        <!-- ACCOMMODATION -->
        <div :class="card">
          <button :class="cardHeadBtn" @click="open.accommodation = !open.accommodation">
            <span :class="cardHeadLabel">Accommodation</span>
            <PxIcon :name="open.accommodation ? 'caret-up' : 'caret-down'" :size="18" color="icon.default" />
          </button>
          <div v-show="open.accommodation" :class="cardBody">
            <div :class="rowBlock">
              <div :class="minW0">
                <span :class="modeLabel">Kontrakan</span>
                <div :class="legGrid">
                  <div :class="colGap2">
                    <span :class="legLabel">Location</span><span :class="legValue">Bandung</span>
                  </div>
                  <div :class="colGap2">
                    <span :class="legLabel">Check-in</span><span :class="legValue">15 Jul 2026</span>
                  </div>
                  <div :class="colGap2">
                    <span :class="legLabel">Check-out</span><span :class="legValue">17 Jul 2026</span>
                  </div>
                </div>
              </div>
              <div :class="rowBtns">
                <MpButton variant="secondary" size="sm" right-icon="newtab">Book via OTA</MpButton>
                <MpButton variant="textLink" size="sm" left-icon="add">Attach document</MpButton>
              </div>
            </div>
          </div>
        </div>

        <!-- CASH ADVANCE -->
        <div :class="card">
          <button :class="cardHeadBtn" @click="open.cashAdvance = !open.cashAdvance">
            <span :class="cardHeadLabel">Cash advance</span>
            <PxIcon :name="open.cashAdvance ? 'caret-up' : 'caret-down'" :size="18" color="icon.default" />
          </button>
          <div v-show="open.cashAdvance" :class="cardBody">
            <table :class="tbl">
              <thead>
                <tr>
                  <th :class="th">Category</th>
                  <th :class="th">Description</th>
                  <th :class="[th, thR]">Requested</th>
                  <th :class="[th, thR]">Approved</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td :class="td">Per diem</td>
                  <td :class="td">testing · Meals</td>
                  <td :class="[td, tdR]">Rp 50.000</td>
                  <td :class="[td, tdR]">Rp 50.000</td>
                </tr>
                <tr>
                  <td :class="totalCell" colspan="3">Total cash advance</td>
                  <td :class="[totalCell, tdR]">Rp 50.000</td>
                </tr>
              </tbody>
            </table>
            <span :class="noteMuted">Proof of CA disbursement: —</span>
          </div>
        </div>

        <!-- TRIP EXPENSES · REPORT -->
        <div :class="card">
          <div :class="cardHead">
            <span :class="cardHeadLabel">Trip expenses · report</span>
            <span :class="reqMeta">Requested —&nbsp;&nbsp;&nbsp;Approved —</span>
          </div>
          <div :class="cardBody">
            <table :class="tbl">
              <thead>
                <tr>
                  <th :class="th">Date</th>
                  <th :class="th">Type</th>
                  <th :class="th">Description</th>
                  <th :class="[th, thR]">Spent</th>
                  <th :class="[th, thR]">Approved</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td :class="emptyState" colspan="5">Trip report not submitted yet — expenses appear here after settlement.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- ══════════ RIGHT ══════════ -->
      <div :class="colStack">

        <!-- Requester -->
        <div :class="card">
          <div :class="[cardBody, cardBodyPadTop]">
            <MpFlex align="center" gap="3">
              <MpAvatar id="av-requester" name="XM punya 3" size="md" variant-color="gray" />
              <div :class="col">
                <span :class="reqName">XM punya 3</span>
                <span :class="reqSub">BUATXM3</span>
              </div>
            </MpFlex>
            <div :class="colGap2">
              <span :class="reqSub">CEO — Board of Director (BOD) HQ</span>
              <span :class="reqSub">Pusat</span>
              <span :class="reqSub">prodtestingxpm@gmail.com</span>
              <span :class="reqSub">+62 856 5988 9486</span>
            </div>
          </div>
        </div>

        <!-- TRIP STATUS -->
        <div :class="card">
          <div :class="cardHead"><span :class="cardHeadLabel">Trip status</span></div>
          <div :class="cardBody">
            <div v-for="(item, i) in timeline" :key="i" :class="tlItem">
              <div :class="tlRail">
                <span :class="tlDot" :style="{ background: item.dot }" />
                <span v-if="i < timeline.length - 1" :class="tlLine" />
              </div>
              <div :class="colGap2PadB">
                <span :class="tlTitle">{{ item.title }}</span>
                <span v-if="item.time" :class="tlTime">{{ item.time }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </MpFlex>
</template>
