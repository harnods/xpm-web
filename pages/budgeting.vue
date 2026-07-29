<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Budgeting (Utilization)
  Token mode: Pixel DT 2.4 — semantic tokens via css()
  Components: MpFlex, MpText, MpButton, MpBadge, PxIcon
  Static mock — hierarchical spend-cap table (company → organization → branch)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-->
<script setup lang="ts">
import {
  MpFlex, MpText, MpButton, MpBadge,
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
  MpDrawer, MpDrawerOverlay, MpDrawerContent, MpDrawerHeader,
  MpDrawerCloseButton, MpDrawerBody,
  css,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Budgeting',
  navKey: 'budgeting',
})

// ─── Types ───────────────────────────────────────────────────────────
type Tag = 'FLAG' | 'HARD CAP' | 'TRACK' | 'NOT SET'
interface Row {
  key: string
  level: 0 | 1 | 2 | 3
  caret?: '▸' | '▾'
  name: string
  bold?: boolean
  muted?: boolean
  owner?: string
  period?: string
  budget?: string
  spent?: string
  pct: number | null            // null → no utilization bar
  tag?: Tag
  note?: string
  right: { pct: number } | { link: 'Set' | 'Adjust' }
}

// ─── Data ────────────────────────────────────────────────────────────
const rows: Row[] = [
  { key: 'total', level: 0, caret: '▾', name: 'Company total', bold: true, owner: '—', period: '—', budget: 'Rp575.000.000', spent: 'Rp394.200.000', pct: 69, right: { pct: 69 } },

  { key: 'company', level: 1, caret: '▸', name: 'Company', bold: true, owner: 'Adit Nugroho', period: 'monthly', budget: 'Rp300.000.000', spent: 'Rp236.000.000', pct: 79, right: { pct: 79 } },

  { key: 'sales', level: 1, caret: '▾', name: 'Sales', bold: true, owner: 'Maya Chen', period: 'monthly', budget: 'Rp35.000.000', spent: 'Rp23.900.000', pct: 68, right: { pct: 68 } },

  { key: 'orgwide', level: 2, name: 'Organization-wide', muted: true, period: 'monthly', budget: 'Rp24.000.000', spent: 'Rp16.400.000', pct: 74, right: { link: 'Adjust' } },
  { key: 'ow-meals', level: 3, name: 'Meals', tag: 'FLAG', note: '! branches allocate Rp11.000.000 — over by Rp1.000.000', budget: 'Rp10.000.000', spent: 'Rp7.400.000', pct: 74, right: { pct: 74 } },
  { key: 'ow-transport', level: 3, name: 'Transport', tag: 'HARD CAP', budget: 'Rp6.000.000', spent: 'Rp5.900.000', pct: 98, right: { pct: 98 } },
  { key: 'ow-accom', level: 3, name: 'Accommodation', tag: 'TRACK', budget: 'Rp8.000.000', spent: 'Rp3.100.000', pct: 39, right: { pct: 39 } },
  { key: 'ow-software', level: 3, name: 'Software', tag: 'NOT SET', budget: '—', spent: 'Rp5.100.000', pct: null, right: { link: 'Set' } },
  { key: 'ow-recruit', level: 3, name: 'Recruitment', tag: 'NOT SET', budget: '—', spent: 'Rp5.000.000', pct: null, right: { link: 'Set' } },
  { key: 'ow-golf', level: 3, name: 'Golf & entertainment', tag: 'NOT SET', budget: '—', spent: 'Rp6.900.000', pct: null, right: { link: 'Set' } },

  { key: 'jkt', level: 2, name: 'Jakarta branch', muted: true, period: 'monthly', budget: 'Rp6.000.000', spent: 'Rp4.200.000', pct: null, right: { link: 'Adjust' } },
  { key: 'jkt-meals', level: 3, name: 'Meals', tag: 'FLAG', budget: 'Rp6.000.000', spent: 'Rp4.200.000', pct: 70, right: { pct: 70 } },
  { key: 'jkt-transport', level: 3, name: 'Transport', tag: 'NOT SET', budget: '—', spent: 'Rp5.800.000', pct: null, right: { link: 'Set' } },
  { key: 'jkt-accom', level: 3, name: 'Accommodation', tag: 'NOT SET', budget: '—', spent: 'Rp810.000', pct: null, right: { link: 'Set' } },

  { key: 'sby', level: 2, name: 'Surabaya branch', muted: true, period: 'monthly', budget: 'Rp5.000.000', spent: 'Rp3.300.000', pct: null, right: { link: 'Adjust' } },
  { key: 'sby-meals', level: 3, name: 'Meals', tag: 'TRACK', budget: 'Rp5.000.000', spent: 'Rp3.300.000', pct: 66, right: { pct: 66 } },
]

const periods = ['All periods', 'Weekly', 'Monthly', 'Quarterly', 'Yearly']
const activePeriod = 'All periods'

// ─── Interaction state ───────────────────────────────────────────────
const activeTab = ref<'util' | 'config'>('util')
const drawerOpen = ref(false)
function openDrawer() { drawerOpen.value = true }
function closeDrawer() { drawerOpen.value = false }

// Drawer selections (static prototype)
const bgdPeriods = ['Weekly', 'Monthly', 'Quarterly', 'Yearly']
const bgdActivePeriod = 'Monthly'
const bgdCatChips = ['All spend', 'Meals', 'Transport', 'Accommodation', 'Software', 'Recruitment', 'Golf & entertainment']

// ─── Configured budgets (derived from utilization data) ──────────────
interface ConfigRow { scope: string; period: string; category: string; cap: string; type: Tag }
const configRows: ConfigRow[] = [
  { scope: 'Company',           period: 'monthly', category: 'All spend',     cap: 'Rp300.000.000', type: 'TRACK' },
  { scope: 'Sales',             period: 'monthly', category: 'All spend',     cap: 'Rp35.000.000',  type: 'TRACK' },
  { scope: 'Organization-wide', period: 'monthly', category: 'Meals',         cap: 'Rp10.000.000',  type: 'FLAG' },
  { scope: 'Organization-wide', period: 'monthly', category: 'Transport',     cap: 'Rp6.000.000',   type: 'HARD CAP' },
  { scope: 'Organization-wide', period: 'monthly', category: 'Accommodation', cap: 'Rp8.000.000',   type: 'TRACK' },
  { scope: 'Jakarta branch',    period: 'monthly', category: 'Meals',         cap: 'Rp6.000.000',   type: 'FLAG' },
]

const groups = ['Organization', 'Location', 'Category']
const activeGroups = ['Category']

const TAG_BADGE: Record<Tag, 'warning' | 'critical' | 'information' | 'announcement'> = {
  'FLAG':     'warning',
  'HARD CAP': 'critical',
  'TRACK':    'information',
  'NOT SET':  'announcement',
}

// Organization selector (select-like → MpPopover)
const ORG_OPTIONS = ['All organizations', 'Company', 'Sales', 'Organization-wide']
const orgFilter = ref('All organizations')

const indentClass: string[] = [
  css({ paddingLeft: '8px' }),
  css({ paddingLeft: '30px' }),
  css({ paddingLeft: '52px' }),
  css({ paddingLeft: '74px' }),
]

// ─── CSS ─────────────────────────────────────────────────────────────
// Tabs (teleported into #layout-tabs)
const tabStrip = css({ display: 'flex', alignItems: 'center', gap: '5', paddingInline: '6', height: '44px', borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default', background: 'background.neutral' })
const tabBtn   = css({ display: 'inline-flex', alignItems: 'center', gap: '2', height: '44px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'body', fontSize: 'md', borderBottom: '2px solid transparent' })
const tabActive   = css({ color: 'text.default', fontWeight: 'semiBold', borderBottomColor: 'border.brand' })
const tabInactive = css({ color: 'text.secondary' })

// Period pills + group chips
const pill     = css({ paddingInline: '3', paddingBlock: '1.5', borderRadius: 'full', fontFamily: 'body', fontSize: 'sm', fontWeight: 'regular', color: 'text.secondary', bg: 'transparent', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', _hover: { bg: 'background.neutral.subtle' } })
const pillOn   = css({ paddingInline: '3', paddingBlock: '1.5', borderRadius: 'full', fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.link', bg: 'background.brand.selected', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' })

const chip     = css({ paddingInline: '3', paddingBlock: '1.5', borderRadius: 'md', fontFamily: 'body', fontSize: 'sm', fontWeight: 'regular', color: 'text.secondary', bg: 'background.neutral.subtle', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', _hover: { color: 'text.default' } })
const chipOn   = css({ paddingInline: '3', paddingBlock: '1.5', borderRadius: 'md', fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.link', bg: 'background.brand.selected', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' })
const chipGhost = css({ paddingInline: '3', paddingBlock: '1.5', borderRadius: 'md', fontFamily: 'body', fontSize: 'sm', fontWeight: 'regular', color: 'text.secondary', bg: 'transparent', borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default', cursor: 'pointer', whiteSpace: 'nowrap', _hover: { borderColor: 'border.bold', color: 'text.default' } })

const groupLabel = css({ fontFamily: 'body', fontSize: 'xs', fontWeight: 'semiBold', letterSpacing: '0.04em', color: 'text.secondary', textTransform: 'uppercase' })
const note       = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })

const stepper    = css({ display: 'inline-flex', alignItems: 'center', gap: '2', paddingInline: '3', paddingBlock: '1.5', borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default', borderRadius: 'md', fontFamily: 'body', fontSize: 'sm', color: 'text.default', bg: 'background.neutral' })
const stepArrow  = css({ cursor: 'pointer', color: 'text.secondary', fontSize: 'md', lineHeight: 'xs', userSelect: 'none', _hover: { color: 'text.default' } })

// Table
const tblWrap = css({ w: 'full', overflowX: 'auto', borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default', borderRadius: 'lg' })
const tbl     = css({ w: 'full', tableLayout: 'auto', borderCollapse: 'collapse', minWidth: '860px' })
const th      = css({ bg: 'background.neutral.subtle', fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.secondary', paddingInline: '3', paddingBlock: '2.5', borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default', textAlign: 'left', whiteSpace: 'nowrap', verticalAlign: 'middle' })
const thNum   = css({ bg: 'background.neutral.subtle', fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'text.secondary', paddingInline: '3', paddingBlock: '2.5', borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default', textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'middle' })
const td      = css({ fontFamily: 'body', fontSize: 'md', color: 'text.default', paddingInline: '3', paddingBlock: '2.5', borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default', verticalAlign: 'middle', whiteSpace: 'nowrap' })
const tdNum   = css({ fontFamily: 'body', fontSize: 'md', color: 'text.default', paddingInline: '3', paddingBlock: '2.5', borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default', verticalAlign: 'middle', whiteSpace: 'nowrap', textAlign: 'right' })
const tr      = css({ cursor: 'pointer', transition: 'background-color 120ms ease', _hover: { bg: 'background.neutral.subtle' } })

const caretCell = css({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', color: 'text.secondary', fontSize: 'xs', flexShrink: 0 })
const nameWrap  = css({ display: 'inline-flex', alignItems: 'center', gap: '2', minWidth: 0 })
const flagNote  = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.warning', whiteSpace: 'nowrap' })

const barTrack = css({ position: 'relative', width: '96px', height: '6px', borderRadius: 'full', background: 'background.neutral.subtle', overflow: 'hidden' })
const barFill  = css({ position: 'absolute', left: '0', top: '0', bottom: '0', borderRadius: 'full' })
const barBrand = css({ background: 'background.brand.bold' })
const barWarn  = css({ background: 'background.warning.bold' })
const setLink  = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'regular', color: 'text.link', cursor: 'pointer', _hover: { textDecoration: 'underline' } })
const pctText  = css({ fontFamily: 'body', fontSize: 'md', color: 'text.default' })

// Footnote under the table
const footnote = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary', lineHeight: 'lg' })

// Drawer content
const eyebrow    = css({ fontFamily: 'body', fontSize: '2xs', fontWeight: 'semiBold', letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase' })
const drawerTitle = css({ fontFamily: 'body', fontSize: 'xl', fontWeight: 'semiBold', color: 'text.default' })
const sectionNum  = css({ fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', letterSpacing: '0.04em', color: 'text.default', textTransform: 'uppercase' })
const sectionDesc = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary', lineHeight: 'lg' })
const whoLabel    = css({ fontFamily: 'body', fontSize: 'xs', fontWeight: 'semiBold', letterSpacing: '0.04em', color: 'text.secondary', textTransform: 'uppercase' })
const anyText     = css({ fontFamily: 'body', fontSize: 'sm', color: 'text.secondary' })
const drawerFootnote = css({ fontFamily: 'body', fontSize: 'xs', color: 'text.secondary', lineHeight: 'lg' })
</script>

<template>
  <!-- ═════ Header CTA ═════ -->
  <Teleport to="#layout-header-actions">
    <MpButton variant="primary" @click="openDrawer">Set budget</MpButton>
  </Teleport>

  <!-- ═════ Tabs strip (into layout title bar area) ═════ -->
  <Teleport to="#layout-tabs">
    <div :class="tabStrip">
      <button type="button" :class="[tabBtn, activeTab === 'util' ? tabActive : tabInactive]" @click="activeTab = 'util'">Utilization</button>
      <button type="button" :class="[tabBtn, activeTab === 'config' ? tabActive : tabInactive]" @click="activeTab = 'config'">Configured budgets</button>
    </div>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" minWidth="0">

    <!-- ═════ UTILIZATION TAB ═════ -->
    <template v-if="activeTab === 'util'">

    <!-- 2) Period pills + org selector + period stepper -->
    <MpFlex align="center" justify="space-between" gap="3" wrap="wrap">
      <MpFlex align="center" gap="1" wrap="wrap">
        <button
          v-for="p in periods"
          :key="p"
          type="button"
          :class="p === activePeriod ? pillOn : pill"
        >{{ p }}</button>
      </MpFlex>

      <MpFlex align="center" gap="2">
        <MpPopover id="filter-org" use-portal placement="bottom-end" is-close-on-select>
          <MpPopoverTrigger>
            <MpButton variant="secondary" right-icon="caret-down">{{ orgFilter }}</MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent :class="css({ marginTop: '2px', minWidth: '200px' })">
            <MpPopoverList>
              <MpPopoverListItem v-for="o in ORG_OPTIONS" :key="o" @click="orgFilter = o">{{ o }}</MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </MpPopover>
        <span :class="stepper">
          <span :class="stepArrow">‹</span>
          <span>Current period</span>
          <span :class="stepArrow">›</span>
        </span>
      </MpFlex>
    </MpFlex>

    <!-- 3) Group by -->
    <MpFlex align="center" gap="2" wrap="wrap">
      <span :class="groupLabel">Group by</span>
      <button
        v-for="g in groups"
        :key="g"
        type="button"
        :class="activeGroups.includes(g) ? chipOn : chip"
      >{{ g }}</button>
      <button type="button" :class="chipGhost">Individual</button>
      <span :class="note">drag to reorder · click to add or remove</span>
    </MpFlex>

    <!-- 4) Hierarchical table -->
    <div :class="tblWrap">
      <table :class="tbl">
        <thead>
          <tr>
            <th :class="th">NAME</th>
            <th :class="th">OWNER</th>
            <th :class="th">PERIOD</th>
            <th :class="thNum">BUDGET</th>
            <th :class="thNum">SPENT</th>
            <th :class="th">UTILIZATION</th>
            <th :class="thNum"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.key" :class="tr">

            <!-- NAME (indent + caret + tag + note) -->
            <td :class="[td, indentClass[row.level]]">
              <span :class="nameWrap">
                <span :class="caretCell">{{ row.caret || '' }}</span>
                <MpText
                  as="span"
                  size="body"
                  weight="regular"
                  color="text.default"
                >{{ row.name }}</MpText>
                <MpBadge v-if="row.tag" for="tableStatus" :type="TAG_BADGE[row.tag]">{{ row.tag }}</MpBadge>
                <span v-if="row.note" :class="flagNote">{{ row.note }}</span>
              </span>
            </td>

            <!-- OWNER -->
            <td :class="td">
              <MpText v-if="row.owner" as="span" size="body" color="text.default">{{ row.owner }}</MpText>
            </td>

            <!-- PERIOD -->
            <td :class="td">
              <MpText v-if="row.period" as="span" size="body" color="text.default">{{ row.period }}</MpText>
            </td>

            <!-- BUDGET -->
            <td :class="tdNum">
              <MpText v-if="row.budget" as="span" size="body" color="text.default">{{ row.budget }}</MpText>
            </td>

            <!-- SPENT -->
            <td :class="tdNum">
              <MpText v-if="row.spent" as="span" size="body" color="text.default">{{ row.spent }}</MpText>
            </td>

            <!-- UTILIZATION bar -->
            <td :class="td">
              <span v-if="row.pct !== null" :class="barTrack">
                <span
                  :class="[barFill, row.pct >= 95 ? barWarn : barBrand]"
                  :style="{ width: Math.min(row.pct, 100) + '%' }"
                />
              </span>
            </td>

            <!-- RIGHT: % or link -->
            <td :class="tdNum">
              <span v-if="'pct' in row.right" :class="pctText">{{ row.right.pct }}%</span>
              <span v-else :class="setLink" @click.stop="openDrawer">{{ row.right.link }}</span>
            </td>

          </tr>
        </tbody>
      </table>
    </div>

    <!-- 5) Footnote -->
    <div :class="footnote">Utilization is measured within each budget's own period · TRACK = meter only · FLAG = approvers see an over-budget warning in the Inbox · HARD CAP = requests over the cap are auto-rejected via Policy</div>

    </template>

    <!-- ═════ CONFIGURED BUDGETS TAB ═════ -->
    <template v-else>
      <div :class="tblWrap">
        <table :class="tbl">
          <thead>
            <tr>
              <th :class="th">SCOPE</th>
              <th :class="th">PERIOD</th>
              <th :class="th">CATEGORY</th>
              <th :class="thNum">CAP</th>
              <th :class="th">TYPE</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(b, i) in configRows" :key="i" :class="tr">
              <td :class="td"><MpText as="span" size="body" weight="regular" color="text.default">{{ b.scope }}</MpText></td>
              <td :class="td"><MpText as="span" size="body" color="text.default">{{ b.period }}</MpText></td>
              <td :class="td"><MpText as="span" size="body" color="text.default">{{ b.category }}</MpText></td>
              <td :class="tdNum"><MpText as="span" size="body" color="text.default">{{ b.cap }}</MpText></td>
              <td :class="td">
                <MpBadge for="tableStatus" :type="TAG_BADGE[b.type]">{{ b.type }}</MpBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

  </MpFlex>

  <!-- ═════ New budget drawer ═════ -->
  <MpDrawer
    id="new-budget-drawer"
    :is-open="drawerOpen"
    size="2xl"
    placement="right"
    is-block-scroll-on-mount
    @close="closeDrawer"
  >
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <MpFlex direction="column" gap="0.5">
          <span :class="eyebrow">BUDGETING</span>
          <span :class="drawerTitle">New budget</span>
        </MpFlex>
        <MpDrawerCloseButton />
      </MpDrawerHeader>

      <MpDrawerBody>
        <MpFlex direction="column" gap="8" width="full" pb="6">

          <!-- 1 · WHO -->
          <MpFlex direction="column" gap="3">
            <span :class="sectionNum">1 · WHO</span>
            <span :class="sectionDesc">Select one or several — leaving a row empty includes all: no organization applies company-wide, no branch covers the whole organization.</span>
            <MpFlex direction="column" gap="2">
              <span :class="whoLabel">ORGANIZATION</span>
              <MpFlex align="center" gap="2">
                <button type="button" :class="chipGhost">+ Add</button>
                <span :class="anyText">— any</span>
              </MpFlex>
            </MpFlex>
            <MpFlex direction="column" gap="2">
              <span :class="whoLabel">BRANCH</span>
              <MpFlex align="center" gap="2">
                <button type="button" :class="chipGhost">+ Add</button>
                <span :class="anyText">— any</span>
              </MpFlex>
            </MpFlex>
          </MpFlex>

          <!-- 2 · PERIOD -->
          <MpFlex direction="column" gap="3">
            <span :class="sectionNum">2 · PERIOD</span>
            <span :class="sectionDesc">Budgets with different periods coexist — e.g. a monthly cap and a yearly envelope for the same scope.</span>
            <MpFlex align="center" gap="2" wrap="wrap">
              <button
                v-for="p in bgdPeriods"
                :key="p"
                type="button"
                :class="p === bgdActivePeriod ? pillOn : pill"
              >{{ p }}</button>
            </MpFlex>
          </MpFlex>

          <!-- 3 · CATEGORY CAPS -->
          <MpFlex direction="column" gap="3">
            <span :class="sectionNum">3 · CATEGORY CAPS</span>
            <span :class="sectionDesc">Amount per period — pooled for the whole scope, or per person so it scales with headcount.</span>
            <MpFlex align="center" gap="2" wrap="wrap">
              <button v-for="c in bgdCatChips" :key="c" type="button" :class="chipGhost">+ {{ c }}</button>
            </MpFlex>
            <span :class="drawerFootnote">Track = meter only · Flag = warn approvers · Hard cap = auto-reject over the cap · Per person = each employee gets their own allowance (e.g. an AI budget per engineer), and the envelope scales with headcount</span>
          </MpFlex>

          <!-- Footer -->
          <MpFlex align="center" justify="flex-end" gap="3" pt="2">
            <MpButton variant="ghost" @click="closeDrawer">Cancel</MpButton>
            <MpButton variant="primary" @click="closeDrawer">Save budget</MpButton>
          </MpFlex>

        </MpFlex>
      </MpDrawerBody>
    </MpDrawerContent>
  </MpDrawer>
</template>
