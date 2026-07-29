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
  MpFlex, MpText, MpButton,
  MpDrawer, MpDrawerOverlay, MpDrawerContent, MpDrawerHeader,
  MpDrawerCloseButton, MpDrawerBody,
  css,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Budgeting',
  subtitle: 'Spend caps by category — company → organization → branch. Click any line to see its trend.',
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
  { key: 'total', level: 0, caret: '▾', name: 'Company total', bold: true, owner: '—', period: '—', budget: 'Rp 575jt', spent: 'Rp 394,2jt', pct: 69, right: { pct: 69 } },

  { key: 'company', level: 1, caret: '▸', name: 'Company', bold: true, owner: 'Adit Nugroho', period: 'monthly', budget: 'Rp 300jt', spent: 'Rp 236jt', pct: 79, right: { pct: 79 } },

  { key: 'sales', level: 1, caret: '▾', name: 'Sales', bold: true, owner: 'Maya Chen', period: 'monthly', budget: 'Rp 35jt', spent: 'Rp 23,9jt', pct: 68, right: { pct: 68 } },

  { key: 'orgwide', level: 2, name: 'Organization-wide', muted: true, period: 'monthly', budget: 'Rp 24jt', spent: 'Rp 16,4jt', pct: 74, right: { link: 'Adjust' } },
  { key: 'ow-meals', level: 3, name: 'Meals', tag: 'FLAG', note: '! branches allocate Rp 1ljt — over by Rp 1jt', budget: 'Rp 10jt', spent: 'Rp 7,4jt', pct: 74, right: { pct: 74 } },
  { key: 'ow-transport', level: 3, name: 'Transport', tag: 'HARD CAP', budget: 'Rp 6jt', spent: 'Rp 5,9jt', pct: 98, right: { pct: 98 } },
  { key: 'ow-accom', level: 3, name: 'Accommodation', tag: 'TRACK', budget: 'Rp 8jt', spent: 'Rp 3,1jt', pct: 39, right: { pct: 39 } },
  { key: 'ow-software', level: 3, name: 'Software', tag: 'NOT SET', budget: '—', spent: 'Rp 5,1jt', pct: null, right: { link: 'Set' } },
  { key: 'ow-recruit', level: 3, name: 'Recruitment', tag: 'NOT SET', budget: '—', spent: 'Rp 5,0jt', pct: null, right: { link: 'Set' } },
  { key: 'ow-golf', level: 3, name: 'Golf & entertainment', tag: 'NOT SET', budget: '—', spent: 'Rp 6,9jt', pct: null, right: { link: 'Set' } },

  { key: 'jkt', level: 2, name: 'Jakarta branch', muted: true, period: 'monthly', budget: 'Rp 6jt', spent: 'Rp 4,2jt', pct: null, right: { link: 'Adjust' } },
  { key: 'jkt-meals', level: 3, name: 'Meals', tag: 'FLAG', budget: 'Rp 6jt', spent: 'Rp 4,2jt', pct: 70, right: { pct: 70 } },
  { key: 'jkt-transport', level: 3, name: 'Transport', tag: 'NOT SET', budget: '—', spent: 'Rp 5,8jt', pct: null, right: { link: 'Set' } },
  { key: 'jkt-accom', level: 3, name: 'Accommodation', tag: 'NOT SET', budget: '—', spent: 'Rp 810rb', pct: null, right: { link: 'Set' } },

  { key: 'sby', level: 2, name: 'Surabaya branch', muted: true, period: 'monthly', budget: 'Rp 5jt', spent: 'Rp 3,3jt', pct: null, right: { link: 'Adjust' } },
  { key: 'sby-meals', level: 3, name: 'Meals', tag: 'TRACK', budget: 'Rp 5jt', spent: 'Rp 3,3jt', pct: 66, right: { pct: 66 } },
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
  { scope: 'Company',           period: 'monthly', category: 'All spend',     cap: 'Rp 300jt', type: 'TRACK' },
  { scope: 'Sales',             period: 'monthly', category: 'All spend',     cap: 'Rp 35jt',  type: 'TRACK' },
  { scope: 'Organization-wide', period: 'monthly', category: 'Meals',         cap: 'Rp 10jt',  type: 'FLAG' },
  { scope: 'Organization-wide', period: 'monthly', category: 'Transport',     cap: 'Rp 6jt',   type: 'HARD CAP' },
  { scope: 'Organization-wide', period: 'monthly', category: 'Accommodation', cap: 'Rp 8jt',   type: 'TRACK' },
  { scope: 'Jakarta branch',    period: 'monthly', category: 'Meals',         cap: 'Rp 6jt',   type: 'FLAG' },
]

const groups = ['Organization', 'Location', 'Category']
const activeGroups = ['Category']

const TAG_STYLE: Record<Tag, { bg: string; color: string }> = {
  'FLAG':     { bg: 'var(--mp-colors-orange-100)',  color: 'var(--mp-colors-orange-700)' },
  'HARD CAP': { bg: 'var(--mp-colors-violet-100)',  color: 'var(--mp-colors-violet-700)' },
  'TRACK':    { bg: 'var(--mp-colors-blue-100)',    color: 'var(--mp-colors-blue-700)' },
  'NOT SET':  { bg: 'var(--mp-colors-neutral-200)', color: 'var(--mp-colors-text-secondary)' },
}

function indentPad(level: number): string {
  return `${8 + level * 22}px`
}

// ─── CSS ─────────────────────────────────────────────────────────────
// Tabs (underline)
const tabBar   = css({ display: 'flex', alignItems: 'center', gap: '5', borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'border.default' })
const tab      = css({ position: 'relative', paddingBlock: '2.5', fontFamily: 'body', fontSize: 'md', fontWeight: 'regular', color: 'text.secondary', cursor: 'pointer', bg: 'transparent', border: 'none', _hover: { color: 'text.default' } })
const tabOn    = css({ position: 'relative', paddingBlock: '2.5', fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.default', cursor: 'pointer', bg: 'transparent', border: 'none', _after: { content: '""', position: 'absolute', left: '0', right: '0', bottom: '-1px', height: '2px', bg: 'var(--mp-colors-indigo-600)' } })

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
const tagBadge  = css({ display: 'inline-flex', alignItems: 'center', paddingInline: '1.5', paddingBlock: '0.5', borderRadius: 'sm', fontFamily: 'body', fontSize: '2xs', fontWeight: 'semiBold', letterSpacing: '0.02em', whiteSpace: 'nowrap' })
const flagNote  = css({ fontFamily: 'body', fontSize: 'sm', color: 'var(--mp-colors-orange-700)', whiteSpace: 'nowrap' })

const barTrack = css({ position: 'relative', width: '96px', height: '6px', borderRadius: 'full', background: 'var(--mp-colors-neutral-200)', overflow: 'hidden' })
const barFill  = css({ position: 'absolute', left: '0', top: '0', bottom: '0', borderRadius: 'full' })
const setLink  = css({ fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'text.link', cursor: 'pointer', _hover: { textDecoration: 'underline' } })
const pctText  = css({ fontFamily: 'body', fontSize: 'md', color: 'text.default' })

function barColor(pct: number): string {
  return pct >= 95 ? 'var(--mp-colors-orange-600)' : 'var(--mp-colors-indigo-600)'
}

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
    <MpButton variant="primary" size="md" @click="openDrawer">Set budget</MpButton>
  </Teleport>

  <!-- ═════ Stage content ═════ -->
  <MpFlex direction="column" gap="4" width="full" style="min-width:0;">

    <!-- 1) Tabs -->
    <div :class="tabBar">
      <button type="button" :class="activeTab === 'util' ? tabOn : tab" @click="activeTab = 'util'">Utilization</button>
      <button type="button" :class="activeTab === 'config' ? tabOn : tab" @click="activeTab = 'config'">Configured budgets</button>
    </div>

    <!-- ═════ UTILIZATION TAB ═════ -->
    <template v-if="activeTab === 'util'">

    <!-- 2) Period pills + org selector + period stepper -->
    <MpFlex align="center" justify="space-between" gap="3" style="flex-wrap:wrap;">
      <MpFlex align="center" gap="1" style="flex-wrap:wrap;">
        <button
          v-for="p in periods"
          :key="p"
          type="button"
          :class="p === activePeriod ? pillOn : pill"
        >{{ p }}</button>
      </MpFlex>

      <MpFlex align="center" gap="2">
        <MpButton variant="secondary" size="sm" right-icon="caret-down">All organizations</MpButton>
        <span :class="stepper">
          <span :class="stepArrow">‹</span>
          <span>Current period</span>
          <span :class="stepArrow">›</span>
        </span>
      </MpFlex>
    </MpFlex>

    <!-- 3) Group by -->
    <MpFlex align="center" gap="2" style="flex-wrap:wrap;">
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
            <td :class="td" :style="{ paddingLeft: indentPad(row.level) }">
              <span :class="nameWrap">
                <span :class="caretCell">{{ row.caret || '' }}</span>
                <MpText
                  as="span"
                  size="body"
                  :weight="row.bold ? 'semiBold' : 'regular'"
                  :color="row.muted ? 'text.secondary' : 'text.default'"
                >{{ row.name }}</MpText>
                <span
                  v-if="row.tag"
                  :class="tagBadge"
                  :style="{ background: TAG_STYLE[row.tag].bg, color: TAG_STYLE[row.tag].color }"
                >{{ row.tag }}</span>
                <span v-if="row.note" :class="flagNote">{{ row.note }}</span>
              </span>
            </td>

            <!-- OWNER -->
            <td :class="td">
              <MpText v-if="row.owner" as="span" size="body" color="text.secondary">{{ row.owner }}</MpText>
            </td>

            <!-- PERIOD -->
            <td :class="td">
              <MpText v-if="row.period" as="span" size="body" color="text.secondary">{{ row.period }}</MpText>
            </td>

            <!-- BUDGET -->
            <td :class="tdNum">
              <MpText v-if="row.budget" as="span" size="body" :color="row.budget === '—' ? 'text.secondary' : 'text.default'">{{ row.budget }}</MpText>
            </td>

            <!-- SPENT -->
            <td :class="tdNum">
              <MpText v-if="row.spent" as="span" size="body" color="text.default">{{ row.spent }}</MpText>
            </td>

            <!-- UTILIZATION bar -->
            <td :class="td">
              <span v-if="row.pct !== null" :class="barTrack">
                <span
                  :class="barFill"
                  :style="{ width: Math.min(row.pct, 100) + '%', background: barColor(row.pct) }"
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
              <td :class="td"><MpText as="span" size="body" weight="semiBold" color="text.default">{{ b.scope }}</MpText></td>
              <td :class="td"><MpText as="span" size="body" color="text.secondary">{{ b.period }}</MpText></td>
              <td :class="td"><MpText as="span" size="body" color="text.default">{{ b.category }}</MpText></td>
              <td :class="tdNum"><MpText as="span" size="body" color="text.default">{{ b.cap }}</MpText></td>
              <td :class="td">
                <span :class="tagBadge" :style="{ background: TAG_STYLE[b.type].bg, color: TAG_STYLE[b.type].color }">{{ b.type }}</span>
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
        <MpFlex direction="column" gap="8" width="full" style="padding-bottom:24px;">

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
            <MpFlex align="center" gap="2" style="flex-wrap:wrap;">
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
            <MpFlex align="center" gap="2" style="flex-wrap:wrap;">
              <button v-for="c in bgdCatChips" :key="c" type="button" :class="chipGhost">+ {{ c }}</button>
            </MpFlex>
            <span :class="drawerFootnote">Track = meter only · Flag = warn approvers · Hard cap = auto-reject over the cap · Per person = each employee gets their own allowance (e.g. an AI budget per engineer), and the envelope scales with headcount</span>
          </MpFlex>

          <!-- Footer -->
          <MpFlex align="center" justify="flex-end" gap="3" style="padding-top:8px;">
            <MpButton variant="ghost" @click="closeDrawer">Cancel</MpButton>
            <MpButton variant="primary" @click="closeDrawer">Save budget</MpButton>
          </MpFlex>

        </MpFlex>
      </MpDrawerBody>
    </MpDrawerContent>
  </MpDrawer>
</template>
