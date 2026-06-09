<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Policies › Claims › Detail
  Source : Figma z9nzcdQ9jpiGqafP4vvHed · node 4382-6658
  Skill  : implement-to-pixel (Branch B)
  Tokens : Pixel 2.4 · @mekari/pixel3 ^1.0.12
  Patterns: detail-view, layout-shell
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STATES INCLUDED:
    - Happy path (mock data matching Figma)
    - Empty subcategory list → "No subcategories added"
    - Null values → em dash (—)

  COPY DEFAULTS (matching Figma exactly):
    - Banner: "Card transactions will not be affected by the details in this category."
    - Subcategory helper: "Employees can choose a subcategory within this claim category to specify their requests"
    - Limitation helper: "The annual, monthly, and weekly limitations applied across branches, organizations, and employees."

  OPEN ITEMS:
    - Title is static for prototype; make dynamic from API once connected
    - Badge status should derive from real record status
    - Edit pencil navigates to create page edit mode
-->
<script setup lang="ts">
import {
  MpFlex, MpText,
  MpButton, MpBadge,
  MpBanner, MpBannerIcon, MpBannerDescription,
  MpTable, MpTableHead, MpTableBody, MpTableRow, MpTableCell,
  css,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Office Tools',
  breadcrumbParent: { label: 'Claims', path: '/policies/claims' },
})

const route = useRoute()

// ─── Mock data (replace with API call once backend is ready) ──────

interface LimitRow  { amount: string; frequency: string }
interface Member    { org: string; branch: string; employee: string }

interface Category {
  id: number
  name: string
  status: 'Active' | 'Inactive'
  description: string
  categoryType: string
  currencies: string[]
  usage: string[]
  createdOn: string
  lastUpdated: string
  subcategories: string[]
  branchLimits: LimitRow[]
  orgLimits: LimitRow[]
  employeeLimits: LimitRow[]
  members: Member[]
}

const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Office Tools',
    status: 'Active',
    description: 'All office tools',
    categoryType: 'International',
    currencies: ['HKD', 'MYR', 'JPY', 'SGD', 'USD'],
    usage: ['Reimbursement', 'Cash advance', 'Bills', 'Virtual card', 'Physical card'],
    createdOn: '14 Oct 2026',
    lastUpdated: '20 Oct 2026 at 14:43 (GMT+7)',
    subcategories: ['Chair', 'Desk', 'Pens', 'Printer', 'Sofa', 'Stamps', 'Stapler', 'Table'],
    branchLimits: [
      { amount: 'JPY 60.000', frequency: 'Per year'  },
      { amount: 'JPY 50.000', frequency: 'Per month' },
      { amount: 'JPY 12.500', frequency: 'Per week'  },
    ],
    orgLimits: [
      { amount: 'JPY 60.000', frequency: 'Per year'  },
      { amount: 'JPY 50.000', frequency: 'Per month' },
      { amount: 'JPY 12.500', frequency: 'Per week'  },
    ],
    employeeLimits: [
      { amount: 'JPY 6.000', frequency: 'Per year'  },
      { amount: 'JPY 5.000', frequency: 'Per month' },
      { amount: 'JPY 1.250', frequency: 'Per week'  },
    ],
    members: [
      { org: 'All organizations', branch: 'All branches', employee: 'All employees' },
    ],
  },
  {
    id: 2,
    name: 'Entertainment Claim',
    status: 'Active',
    description: 'For reimbursement of costs from business-related entertainment.',
    categoryType: 'International',
    currencies: ['IDR', 'USD'],
    usage: ['Reimbursement', 'Cash advance', 'Bills', 'Virtual card', 'Physical card'],
    createdOn: '10 Oct 2026',
    lastUpdated: '18 Oct 2026 at 10:00 (GMT+7)',
    subcategories: [],
    branchLimits: [],
    orgLimits: [],
    employeeLimits: [],
    members: [{ org: 'All organizations', branch: 'All branches', employee: 'All employees' }],
  },
  {
    id: 3,
    name: 'Office Supplies',
    status: 'Active',
    description: 'All office supplies',
    categoryType: 'Domestic',
    currencies: ['IDR'],
    usage: ['Reimbursement', 'Cash advance'],
    createdOn: '5 Oct 2026',
    lastUpdated: '15 Oct 2026 at 08:30 (GMT+7)',
    subcategories: [],
    branchLimits: [],
    orgLimits: [],
    employeeLimits: [],
    members: [{ org: 'All organizations', branch: 'All branches', employee: 'All employees' }],
  },
  {
    id: 4,
    name: 'Entertainment Claim',
    status: 'Inactive',
    description: 'For reimbursement of costs from business-related entertainment.',
    categoryType: 'Domestic',
    currencies: ['IDR'],
    usage: ['Reimbursement', 'Cash advance'],
    createdOn: '1 Sep 2026',
    lastUpdated: '10 Oct 2026 at 09:00 (GMT+7)',
    subcategories: [],
    branchLimits: [],
    orgLimits: [],
    employeeLimits: [],
    members: [{ org: 'All organizations', branch: 'All branches', employee: 'All employees' }],
  },
]

const category = computed<Category | undefined>(() =>
  MOCK_CATEGORIES.find(c => c.id === Number(route.params.id))
)

// ─── Styles ───────────────────────────────────────────────────────

const kvGrid = css({
  display: 'grid',
  gridTemplateColumns: '180px 1fr',
  rowGap: '5',      // 20px — comfortable for read-only detail rows
  columnGap: '4',
})

const kvLabel = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'gray.600',
})

const kvValue = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'dark',
})

const kvValueSub = css({
  fontFamily: 'body', fontSize: 'sm', lineHeight: 'lg', color: 'gray.600',
  display: 'block', marginTop: '0.5',
})

const helperText = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'gray.600',
})

const subSection = css({
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold',
  lineHeight: 'lg', color: 'dark',
})

const subHelper = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg',
  color: 'gray.600', fontStyle: 'italic',
})

const th = css({
  bg: 'gray.25',
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold',
  lineHeight: 'lg', color: 'dark',
  paddingLeft: '2', paddingRight: '4', paddingBlock: '3',
  borderBottom: '1px solid', borderBottomColor: 'gray.100',
  textAlign: 'left', whiteSpace: 'nowrap', verticalAlign: 'middle',
})

const td = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'dark',
  paddingLeft: '2', paddingRight: '4', paddingBlock: '3',
  borderBottom: '1px solid', borderBottomColor: 'gray.100',
  verticalAlign: 'middle',
})
</script>

<template>
  <!-- ═══ Status badge — teleported inline with H1 ═══ -->
  <Teleport to="#layout-title-suffix">
    <MpBadge
      v-if="category"
      for="additionalInformation"
      type="completed"
    >
      {{ category.status }}
    </MpBadge>
  </Teleport>

  <!-- ═══ Stage content ═══ -->
  <MpFlex direction="column" gap="6" width="full">

    <!-- Info banner -->
    <MpBanner variant="info">
      <MpBannerIcon id="detail-banner-icon" />
      <MpBannerDescription id="detail-banner-desc">
        Card transactions will not be affected by the details in this category.
      </MpBannerDescription>
    </MpBanner>

    <!-- ═══ Section: Basic information ═══ -->
    <MpFlex direction="column" gap="4">
      <!-- Section header row -->
      <MpFlex align="center" justify="space-between">
        <MpText as="h2" size="h2" weight="semiBold" color="dark">Basic information</MpText>
        <MpButton
          variant="ghost"
          size="sm"
          left-icon="edit"
          @click="navigateTo(`/policies/claims/create?mode=edit&id=${category?.id}`)"
        />
      </MpFlex>

      <!-- Key-value grid -->
      <div v-if="category" style="display:grid; grid-template-columns:180px 1fr; row-gap:20px; column-gap:16px;">
        <span :class="kvLabel">Claim category name</span>
        <span :class="kvValue">{{ category.name }}</span>

        <span :class="kvLabel">Description</span>
        <span :class="kvValue">{{ category.description || '—' }}</span>

        <span :class="kvLabel">Category type</span>
        <span :class="kvValue">{{ category.categoryType }}</span>

        <span :class="kvLabel">Currencies</span>
        <span :class="kvValue">{{ category.currencies.join(', ') || '—' }}</span>

        <span :class="kvLabel">Category usage</span>
        <span :class="kvValue">{{ category.usage.join(', ') || '—' }}</span>

        <span :class="kvLabel">Created on</span>
        <span :class="kvValue">
          {{ category.createdOn }}
          <em :class="kvValueSub">Last updated on {{ category.lastUpdated }}</em>
        </span>
      </div>
    </MpFlex>


    <!-- ═══ Section: Subcategory ═══ -->
    <MpFlex v-if="category?.subcategories?.length" direction="column" gap="3" paddingTop="6">
      <MpText as="h2" size="h2" weight="semiBold" color="dark">Subcategory</MpText>
      <span :class="helperText">
        Employees can choose a subcategory within this claim category to specify their requests
      </span>

      <div>
        <ul style="display:grid; grid-template-columns:1fr 1fr; list-style-type:disc; padding-left:20px; row-gap:8px; column-gap:24px;">
          <li
            v-for="sub in category?.subcategories"
            :key="sub"
            style="font-family:var(--fonts-body); font-size:var(--fontSizes-md); line-height:var(--lineHeights-lg); color:var(--colors-dark);"
          >
            {{ sub }}
          </li>
        </ul>
      </div>
    </MpFlex>


    <!-- ═══ Section: Category limitation ═══ -->
    <MpFlex direction="column" gap="5" paddingTop="6">
      <MpFlex direction="column" gap="1">
        <MpText as="h2" size="h2" weight="semiBold" color="dark">Category limitation</MpText>
        <span :class="helperText">
          The annual, monthly, and weekly limitations applied across branches, organizations, and employees.
        </span>
      </MpFlex>

      <!-- Branch -->
      <MpFlex direction="column" gap="2">
        <span :class="subSection">Branch</span>
        <span v-if="!category?.branchLimits?.length" :class="kvValue">No limits are applied to branches in this category</span>
        <div v-if="category?.branchLimits?.length" style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr>
                <th :class="th">Max amount</th>
                <th :class="th">Frequency</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in category.branchLimits" :key="i">
                <td :class="td">{{ row.amount }}</td>
                <td :class="td">{{ row.frequency }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </MpFlex>

      <!-- Organization -->
      <MpFlex direction="column" gap="2">
        <span :class="subSection">Organization</span>
        <span v-if="!category?.orgLimits?.length" :class="kvValue">No limits are applied to organizations in this category</span>
        <div v-if="category?.orgLimits?.length" style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr>
                <th :class="th">Max amount</th>
                <th :class="th">Frequency</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in category.orgLimits" :key="i">
                <td :class="td">{{ row.amount }}</td>
                <td :class="td">{{ row.frequency }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </MpFlex>

      <!-- Employee -->
      <MpFlex direction="column" gap="2">
        <span :class="subSection">Employee</span>
        <span v-if="!category?.employeeLimits?.length" :class="kvValue">No limits are applied to employees in this category</span>
        <div v-if="category?.employeeLimits?.length" style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr>
                <th :class="th">Max amount</th>
                <th :class="th">Frequency</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in category.employeeLimits" :key="i">
                <td :class="td">{{ row.amount }}</td>
                <td :class="td">{{ row.frequency }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </MpFlex>
    </MpFlex>


    <!-- ═══ Section: Additional limitation ═══ -->
    <MpFlex direction="column" gap="4" paddingTop="6">
      <MpText as="h2" size="h2" weight="semiBold" color="dark">Additional limitation</MpText>
      <div style="display:grid; grid-template-columns:180px 1fr; row-gap:20px; column-gap:16px;">
        <span :class="kvLabel">Limit per transaction</span>
        <span :class="kvValue">Unlimited</span>
      </div>
    </MpFlex>


    <!-- ═══ Section: Member for this category ═══ -->
    <MpFlex direction="column" gap="4" paddingTop="6">
      <MpText as="h2" size="h2" weight="semiBold" color="dark">Member for this category</MpText>
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th :class="th">Organization</th>
              <th :class="th">Branch</th>
              <th :class="th">Employee</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!category?.members?.length">
              <td :class="td" colspan="3" style="color:var(--colors-gray\\.600); text-align:center;">—</td>
            </tr>
            <tr v-for="(m, i) in category?.members" :key="i">
              <td :class="td">{{ m.org || '—' }}</td>
              <td :class="td">{{ m.branch || '—' }}</td>
              <td :class="td">{{ m.employee || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </MpFlex>

  </MpFlex>
</template>
