<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Policies › Claims › Custom Policy Detail
  Token mode: Pixel 2.4
  Patterns used: detail-view, layout-shell
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-->
<script setup lang="ts">
import {
  MpFlex, MpText,
  MpButton, MpBadge,
  css,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Custom category detail',
  // ?tab=custom tells the index page to land on the Custom categories tab
  breadcrumbParent: { label: 'Claims', path: '/policies/claims?tab=custom' },
})

const route = useRoute()

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface CustomRule {
  category: string
  profile: string    // "Organization" | "Employee" | "Branch"
  frequency: string  // "Per month" | "Per week" | "Per year" | "Per day"
  maxAmount: string  // pre-formatted, dot thousands, e.g. "Rp5.000.000"
  parameter: string  // "Total"
}

interface PerTxLimit {
  currency: string
  amount: string     // dot thousands, e.g. "500.000"
}

interface PolicyMember {
  name: string
  position: string
  organization: string
  branch: string
}

interface CustomPolicy {
  id: number
  name: string
  status: 'Active' | 'Inactive'
  description: string
  ruleType: 'with-limit' | 'no-limit'
  rules: CustomRule[]
  perTxLimits: PerTxLimit[]
  members: PolicyMember[]
  createdOn: string
  lastChanged: string
}

// ─── Mock data — IDs 1–10 matching index.vue customRows ──────────────────────

const MOCK_POLICIES: CustomPolicy[] = [
  {
    id: 1,
    name: 'Executive Travel Allowance',
    status: 'Active',
    description: 'Higher flight and hotel limits for directors and above on domestic and international trips.',
    ruleType: 'with-limit',
    rules: [
      { category: 'Transport',      profile: 'Employee', frequency: 'Per month', maxAmount: 'Rp3.000.000',  parameter: 'Total' },
      { category: 'Accommodation',  profile: 'Employee', frequency: 'Per night', maxAmount: 'Rp1.500.000',  parameter: 'Total' },
    ],
    perTxLimits: [],
    members: [
      { name: 'Citra Purnama',      position: 'C-Level Executive',   organization: 'HRD & GA',    branch: 'Pusat'          },
      { name: 'Andi Wijaya',        position: 'Director Operations',  organization: 'Operations',  branch: 'Jakarta HQ'     },
      { name: 'Budi Santoso',       position: 'Lead Engineer',        organization: 'Engineering', branch: 'Bandung Office' },
    ],
    createdOn: '2 Jun 2026',
    lastChanged: '8 Jun 2026 at 16:02 (GMT+7)',
  },
  {
    id: 2,
    name: 'Sales Client Entertainment',
    status: 'Active',
    description: 'Client meeting and entertainment budget for the sales team attending external business events.',
    ruleType: 'with-limit',
    rules: [
      { category: 'Entertainment',  profile: 'Organization', frequency: 'Per month', maxAmount: 'Rp10.000.000', parameter: 'Total' },
      { category: 'Entertainment',  profile: 'Employee',     frequency: 'Per month', maxAmount: 'Rp2.000.000',  parameter: 'Total' },
    ],
    perTxLimits: [
      { currency: 'Rp', amount: '2.000.000' },
    ],
    members: [
      { name: 'Dewi Kusuma',        position: 'Sales Manager',        organization: 'Sales',       branch: 'Jakarta HQ'     },
      { name: 'Eko Prasetyo',       position: 'Account Executive',    organization: 'Sales',       branch: 'Surabaya Office'},
      { name: 'Fitri Handayani',    position: 'Sales Staff',          organization: 'Sales',       branch: 'Jakarta HQ'     },
      { name: 'Galih Saputra',      position: 'Account Manager',      organization: 'Sales',       branch: 'Bandung Office' },
      { name: 'Hendra Kusumah',     position: 'Sales Staff',          organization: 'Sales',       branch: 'Medan Office'   },
    ],
    createdOn: '20 Jan 2026',
    lastChanged: '27 Jan 2026 at 16:04 (GMT+7)',
  },
  {
    id: 3,
    name: 'Engineering Equipment',
    status: 'Active',
    description: 'Laptop, monitor, and software licence limits for engineering employees.',
    ruleType: 'with-limit',
    rules: [
      { category: 'Equipment',      profile: 'Employee', frequency: 'Per year', maxAmount: 'Rp15.000.000', parameter: 'Total' },
      { category: 'Office Supplies',profile: 'Employee', frequency: 'Per year', maxAmount: 'Rp2.000.000',  parameter: 'Total' },
    ],
    perTxLimits: [],
    members: [
      { name: 'Budi Santoso',       position: 'Lead Engineer',        organization: 'Engineering', branch: 'Bandung Office' },
      { name: 'Irwan Setiawan',     position: 'Senior Engineer',      organization: 'Engineering', branch: 'Bandung Office' },
      { name: 'Joko Widodo',        position: 'Backend Engineer',     organization: 'Engineering', branch: 'Jakarta HQ'     },
      { name: 'Kartini Lestari',    position: 'Frontend Engineer',    organization: 'Engineering', branch: 'Jakarta HQ'     },
    ],
    createdOn: '20 Jan 2026',
    lastChanged: '27 Jan 2026 at 16:04 (GMT+7)',
  },
  {
    id: 4,
    name: 'Senior Staff Medical',
    status: 'Active',
    description: 'Extended medical and health reimbursement for employees at grade 5 and above.',
    ruleType: 'with-limit',
    rules: [
      { category: 'Medical',        profile: 'Employee', frequency: 'Per year', maxAmount: 'Rp8.000.000', parameter: 'Total' },
    ],
    perTxLimits: [
      { currency: 'Rp', amount: '500.000' },
    ],
    members: [
      { name: 'Citra Purnama',      position: 'C-Level Executive',   organization: 'HRD & GA',    branch: 'Pusat'          },
      { name: 'Andi Wijaya',        position: 'Director Operations',  organization: 'Operations',  branch: 'Jakarta HQ'     },
      { name: 'Dewi Kusuma',        position: 'Sales Manager',        organization: 'Sales',       branch: 'Jakarta HQ'     },
      { name: 'Budi Santoso',       position: 'Lead Engineer',        organization: 'Engineering', branch: 'Bandung Office' },
      { name: 'Zikra Mufti',        position: 'Manager Sales & Marketing', organization: 'Marketing', branch: 'Pusat'       },
      { name: 'Zhorif Al Aqil Nasution', position: 'Manager IT',     organization: 'Marketing',   branch: 'Pusat'          },
    ],
    createdOn: '20 Jan 2026',
    lastChanged: '27 Jan 2026 at 16:03 (GMT+7)',
  },
  {
    id: 5,
    name: 'Field Operations Transport',
    status: 'Active',
    description: 'Daily transport and fuel allowance for field staff working outside the main office.',
    ruleType: 'with-limit',
    rules: [
      { category: 'Transport',      profile: 'Employee', frequency: 'Per week',  maxAmount: 'Rp500.000',  parameter: 'Total' },
      { category: 'Transport',      profile: 'Employee', frequency: 'Per month', maxAmount: 'Rp1.500.000',parameter: 'Total' },
    ],
    perTxLimits: [],
    members: [
      { name: 'Lukman Hakim',       position: 'Field Technician',     organization: 'Operations',  branch: 'Surabaya Office'},
      { name: 'Maya Sari',          position: 'Field Coordinator',    organization: 'Operations',  branch: 'Medan Office'   },
      { name: 'Nanda Pratama',      position: 'Field Staff',          organization: 'Operations',  branch: 'Bali Office'    },
      { name: 'Odi Suhendar',       position: 'Field Staff',          organization: 'Operations',  branch: 'Bandung Office' },
    ],
    createdOn: '15 Dec 2025',
    lastChanged: '29 Dec 2025 at 14:44 (GMT+7)',
  },
  {
    id: 6,
    name: 'Remote Work Allowance',
    status: 'Active',
    description: 'Home office setup and internet stipend for employees working remotely.',
    ruleType: 'with-limit',
    rules: [
      { category: 'Office Supplies',profile: 'Employee', frequency: 'Per month', maxAmount: 'Rp750.000',  parameter: 'Total' },
      { category: 'Internet',       profile: 'Employee', frequency: 'Per month', maxAmount: 'Rp350.000',  parameter: 'Total' },
    ],
    perTxLimits: [],
    members: [
      { name: 'Kartini Lestari',    position: 'Frontend Engineer',    organization: 'Engineering', branch: 'Jakarta HQ'     },
      { name: 'Joko Widodo',        position: 'Backend Engineer',     organization: 'Engineering', branch: 'Jakarta HQ'     },
      { name: 'Zulfaina',           position: 'Supervisor IT',        organization: 'Marketing',   branch: 'Pusat'          },
      { name: 'Fitri Handayani',    position: 'Sales Staff',          organization: 'Sales',       branch: 'Jakarta HQ'     },
      { name: 'Zhilal Haqqi',       position: 'Staff Finance',        organization: 'Marketing',   branch: 'Pusat'          },
    ],
    createdOn: '10 Oct 2025',
    lastChanged: '23 Oct 2025 at 11:14 (GMT+7)',
  },
  {
    id: 7,
    name: 'Manager Meal Per-diem',
    status: 'Active',
    description: 'Business-trip meal and daily allowance limits for managers on official travel.',
    ruleType: 'with-limit',
    rules: [
      { category: 'Meals',          profile: 'Employee', frequency: 'Per day',   maxAmount: 'Rp300.000',  parameter: 'Total' },
      { category: 'Meals',          profile: 'Employee', frequency: 'Per month', maxAmount: 'Rp3.000.000',parameter: 'Total' },
    ],
    perTxLimits: [
      { currency: 'Rp', amount: '150.000' },
    ],
    members: [
      { name: 'Andi Wijaya',        position: 'Director Operations',  organization: 'Operations',  branch: 'Jakarta HQ'     },
      { name: 'Dewi Kusuma',        position: 'Sales Manager',        organization: 'Sales',       branch: 'Jakarta HQ'     },
      { name: 'Zikra Mufti',        position: 'Manager Sales & Marketing', organization: 'Marketing', branch: 'Pusat'       },
      { name: 'Zhorif Al Aqil Nasution', position: 'Manager IT',     organization: 'Marketing',   branch: 'Pusat'          },
      { name: 'Budi Santoso',       position: 'Lead Engineer',        organization: 'Engineering', branch: 'Bandung Office' },
    ],
    createdOn: '1 Oct 2025',
    lastChanged: '14 Oct 2025 at 17:07 (GMT+7)',
  },
  {
    id: 8,
    name: 'Marketing Campaign Budget',
    status: 'Active',
    description: 'Event and campaign spending for the marketing team, including vendor payments and collateral.',
    ruleType: 'with-limit',
    rules: [
      { category: 'Event',          profile: 'Organization', frequency: 'Per month', maxAmount: 'Rp5.000.000',  parameter: 'Total' },
      { category: 'Event',          profile: 'Employee',     frequency: 'Per month', maxAmount: 'Rp1.000.000',  parameter: 'Total' },
      { category: 'Office Supplies',profile: 'Employee',     frequency: 'Per year',  maxAmount: 'Rp3.000.000',  parameter: 'Total' },
    ],
    perTxLimits: [],
    members: [
      { name: 'Zhorif Al Aqil Nasution', position: 'Manager IT',     organization: 'Marketing',   branch: 'Pusat'          },
      { name: 'Zhilal Haqqi',       position: 'Staff Finance',        organization: 'Marketing',   branch: 'Pusat'          },
      { name: 'Zikra Mufti',        position: 'Manager Sales & Marketing', organization: 'Marketing', branch: 'Pusat'       },
      { name: 'Zuhri Elvi Wahyuni', position: 'Supervisor IT',        organization: 'Marketing',   branch: 'Pusat'          },
      { name: 'Zulfaina',           position: 'Supervisor IT',        organization: 'Marketing',   branch: 'Pusat'          },
    ],
    createdOn: '10 Sep 2025',
    lastChanged: '23 Sep 2025 at 16:03 (GMT+7)',
  },
  {
    id: 9,
    name: 'Internship Expenses',
    status: 'Active',
    description: '—',
    ruleType: 'no-limit',
    rules: [],
    perTxLimits: [
      { currency: 'Rp', amount: '100.000' },
    ],
    members: [
      { name: 'Putri Ramadhani',    position: 'Intern — Marketing',   organization: 'Marketing',   branch: 'Pusat'          },
      { name: 'Rizky Firmansyah',   position: 'Intern — Engineering', organization: 'Engineering', branch: 'Jakarta HQ'     },
    ],
    createdOn: '1 Aug 2025',
    lastChanged: '28 Aug 2025 at 10:54 (GMT+7)',
  },
  {
    id: 10,
    name: 'New Hire Onboarding Kit',
    status: 'Active',
    description: 'Equipment and welcome-kit budget allocated for new employees within their first 90 days.',
    ruleType: 'with-limit',
    rules: [
      { category: 'Equipment',      profile: 'Employee', frequency: 'Per year', maxAmount: 'Rp5.000.000',  parameter: 'Total' },
      { category: 'Office Supplies',profile: 'Employee', frequency: 'Per year', maxAmount: 'Rp1.000.000',  parameter: 'Total' },
    ],
    perTxLimits: [],
    members: [
      { name: 'Sinta Permata',      position: 'Staff — HRD & GA',     organization: 'HRD & GA',    branch: 'Pusat'          },
      { name: 'Tommy Wirawan',      position: 'Staff — Finance',       organization: 'Finance',     branch: 'Jakarta HQ'     },
      { name: 'Ulfah Rahayu',       position: 'Staff — Operations',    organization: 'Operations',  branch: 'Surabaya Office'},
    ],
    createdOn: '10 Mar 2025',
    lastChanged: '24 Mar 2025 at 13:30 (GMT+7)',
  },
]

const policy = computed<CustomPolicy | undefined>(() =>
  MOCK_POLICIES.find(p => p.id === Number(route.params.id))
)

// Set H1 synchronously so the layout renders the name on first paint, not 'Custom category detail'
const _found = MOCK_POLICIES.find(p => p.id === Number(route.params.id))
if (_found) route.meta.title = _found.name

// ─── Styles ──────────────────────────────────────────────────────────────────

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

const th = css({
  bg: 'gray.25',
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold',
  lineHeight: 'lg', color: 'dark',
  paddingLeft: '3', paddingRight: '4', paddingBlock: '3',
  borderBottom: '1px solid', borderBottomColor: 'gray.100',
  textAlign: 'left', whiteSpace: 'nowrap', verticalAlign: 'middle',
})

const td = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'dark',
  paddingLeft: '3', paddingRight: '4', paddingBlock: '3',
  borderBottom: '1px solid', borderBottomColor: 'gray.100',
  verticalAlign: 'middle',
})
</script>

<template>
  <!-- ═══ Status badge — teleported inline with H1 ═══ -->
  <Teleport to="#layout-title-suffix">
    <MpBadge
      v-if="policy"
      for="additionalInformation"
      type="completed"
    >
      {{ policy.status }}
    </MpBadge>
  </Teleport>

  <!-- ═══ Stage content ═══ -->
  <MpFlex direction="column" gap="6" width="full">

    <!-- ═══ Section 1: Basic information ═══ -->
    <MpFlex direction="column" gap="4">
      <MpFlex align="center" justify="space-between">
        <MpText as="h2" size="h2" weight="semiBold" color="dark">Basic information</MpText>
        <MpButton
          v-if="policy"
          variant="secondary"
          size="sm"
          left-icon="edit"
          @click="navigateTo(`/policies/claims/custom/create?mode=edit&id=${policy.id}`)"
        >Edit</MpButton>
      </MpFlex>

      <div v-if="policy" style="display:grid; grid-template-columns:180px 1fr; row-gap:20px; column-gap:16px;">
        <span :class="kvLabel">Custom category name</span>
        <span :class="kvValue">{{ policy.name }}</span>

        <span :class="kvLabel">Description</span>
        <span :class="kvValue">{{ policy.description || '—' }}</span>

        <span :class="kvLabel">Created on</span>
        <span :class="kvValue">
          {{ policy.createdOn }}
          <em :class="kvValueSub">Last changed on {{ policy.lastChanged }}</em>
        </span>
      </div>
    </MpFlex>


    <!-- ═══ Section 2: Custom policy limitation ═══ -->
    <MpFlex direction="column" gap="4" paddingTop="6">
      <MpText as="h2" size="h2" weight="semiBold" color="dark">Custom category limitation</MpText>

      <!-- No-limit mode -->
      <MpText v-if="policy?.ruleType === 'no-limit'" size="body" color="dark">
        Members assigned to this custom category have no spending limit for any frequency.
      </MpText>

      <!-- With-limit mode — rule table -->
      <template v-if="policy?.ruleType === 'with-limit'">
        <span v-if="!policy.rules.length" :class="kvValue">No limits are applied.</span>
        <div v-else style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr>
                <th :class="th">Category</th>
                <th :class="th">Profile</th>
                <th :class="th">Frequency</th>
                <th :class="th">Max amount</th>
                <th :class="th">Parameter</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(rule, i) in policy.rules" :key="i">
                <td :class="td">{{ rule.category }}</td>
                <td :class="td">{{ rule.profile }}</td>
                <td :class="td">{{ rule.frequency }}</td>
                <td :class="td">{{ rule.maxAmount }}</td>
                <td :class="td">{{ rule.parameter }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </MpFlex>


    <!-- ═══ Section 3: Additional limitation (only if perTxLimits set) ═══ -->
    <MpFlex v-if="policy?.perTxLimits?.length" direction="column" gap="4" paddingTop="6">
      <MpText as="h2" size="h2" weight="semiBold" color="dark">Additional limitation</MpText>
      <div style="display:grid; grid-template-columns:180px 1fr; row-gap:20px; column-gap:16px;">
        <span :class="kvLabel">Limit per transaction</span>
        <span :class="kvValue">
          {{ policy!.perTxLimits.map(l => `${l.currency} ${l.amount}`).join(' · ') }}
        </span>
      </div>
    </MpFlex>


    <!-- ═══ Section 4: Member for this policy ═══ -->
    <MpFlex direction="column" gap="4" paddingTop="6">
      <MpText as="h2" size="h2" weight="semiBold" color="dark">Member for this category</MpText>
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th :class="th">Name</th>
              <th :class="th">Position</th>
              <th :class="th">Organization</th>
              <th :class="th">Branch</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!policy?.members?.length">
              <td :class="td" colspan="4" style="text-align:center; color:var(--colors-gray\\.600);">—</td>
            </tr>
            <tr v-for="(m, i) in policy?.members" :key="i">
              <td :class="td">{{ m.name || '—' }}</td>
              <td :class="td">{{ m.position || '—' }}</td>
              <td :class="td">{{ m.organization || '—' }}</td>
              <td :class="td">{{ m.branch || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </MpFlex>

  </MpFlex>
</template>
