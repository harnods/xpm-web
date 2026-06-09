<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Workflows › Claims › Detail
  Source : Figma C098s6fLIfQ3JipIeSZi6d
           node 8179-70511 (International)
           node 8179-70510 (Domestic)
  Skill  : implement-to-pixel (Branch B)
  Tokens : Pixel 2.4 · @mekari/pixel3 ^1.0.12
  Patterns: detail-view, layout-shell
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STATES INCLUDED:
    - International workflow → sequential steps (Step 1/2/3)
    - Domestic workflow → amount-based rules + sequential steps

  OPEN ITEMS:
    - Title is static for prototype; make dynamic from API once connected
    - Edit pencil navigates to create page edit mode
-->
<script setup lang="ts">
import {
  MpFlex, MpText,
  MpButton,
  css,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Domestic Category Workflow',
  breadcrumbParent: { label: 'Claims', path: '/workflows/claims' },
})

const route = useRoute()

// ─── Types ────────────────────────────────────────────────────────

interface ApproverEntry {
  name: string           // "CPC002 - Agung Setiawarman (Backup approver)" or "1 upper line (Main Approver)"
  dept?: string          // "HR Staff" | "HR Manager"
  description?: string   // for "1 upper line" type with reporting hierarchy description
  isAlt?: boolean        // italic "Any of these approvers can also approve"
}

interface ApprovalStep {
  stepNumber: number
  entries: ApproverEntry[]
}

interface ApprovalSubStep {
  subStepNumber?: number  // for "Approval step 1" / "Approval step 2" inside a rule
  entries: ApproverEntry[]
}

interface ApprovalRule {
  ruleNumber: number
  condition: string
  noApproval?: boolean
  subSteps: ApprovalSubStep[]
}

interface Workflow {
  id: number
  name: string
  description: string
  transactionType: 'Domestic' | 'International'
  createdOn: string
  lastUpdated: string
  steps?: ApprovalStep[]            // International: only sequential steps
  rules?: ApprovalRule[]            // Domestic: amount-based rules
  additionalSteps?: ApprovalStep[]  // Domestic: sequential steps after rules
}

// ─── Mock data ───────────────────────────────────────────────────

const MOCK_WORKFLOWS: Workflow[] = [
  // ── id=1: Domestic Category Workflow (Figma node 8179-70510) ──
  {
    id: 1,
    name: 'Domestic Category Workflow',
    description: 'This is company domestic claim approval workflow for special person',
    transactionType: 'Domestic',
    createdOn: '17 Feb 2026',
    lastUpdated: '19 Feb 2026 at 14:30 by Rizal Chandra',
    rules: [
      {
        ruleNumber: 1,
        condition: 'Any amount less than or equal to Rp1.000.000',
        noApproval: true,
        subSteps: [],
      },
      {
        ruleNumber: 2,
        condition: 'Any amount between Rp1.000.000 and Rp5.000.000',
        subSteps: [
          {
            entries: [
              { name: 'CPC002 - Agung Setiawarman', dept: 'HR Manager' },
              { name: 'CPC044 - Ali Imran (Backup approver)', dept: 'HR Staff' },
            ],
          },
        ],
      },
      {
        ruleNumber: 3,
        condition: 'Any amount between Rp5.000.000 and Rp10.000.000',
        subSteps: [
          {
            subStepNumber: 1,
            entries: [
              { name: 'CPC002 - Agung Setiawarman', dept: 'HR Manager' },
              { name: 'CPC044 - Ali Imran (Backup approver)', dept: 'HR Staff' },
            ],
          },
          {
            subStepNumber: 2,
            entries: [
              { name: 'CPC002 - Agung Setiawarman', dept: 'HR Manager' },
              { name: 'CPC147 - Bayu Ferdian (Backup approver)', dept: 'HR Staff' },
            ],
          },
        ],
      },
      {
        ruleNumber: 4,
        condition: 'Any amount greater than Rp10.000.000',
        subSteps: [
          {
            entries: [
              { name: 'CPC002 - Agung Setiawarman', dept: 'HR Manager' },
            ],
          },
        ],
      },
    ],
  },

  // ── id=2: International Category Workflow (Figma node 8179-70511) ──
  {
    id: 2,
    name: 'International Category Workflow',
    description: 'This is company international claim approval workflow for special person',
    transactionType: 'International',
    createdOn: '17 Feb 2026',
    lastUpdated: '19 Feb 2026 at 14:30 by Rizal Chandra',
    steps: [
      {
        stepNumber: 1,
        entries: [
          {
            name: '1 upper line (Main Approver)',
            description: 'This refers to the default approval line of the requester, following the reporting hierarchy of your organization in Talenta.',
          },
          { name: 'CPC002 - Agung Setiawarman (Backup approver)', dept: 'HR Staff' },
          { name: 'CPC147 - Bayu Ferdian (Backup approver)', dept: 'HR Staff' },
          { name: 'CPC151 - Christin Purnama Sari (Backup approver)', dept: 'HR Staff' },
        ],
      },
      {
        stepNumber: 2,
        entries: [
          { name: 'CPC147 - Bayu Ferdian (Main Approver)', dept: 'HR Staff' },
        ],
      },
      {
        stepNumber: 3,
        entries: [
          { name: 'CPC002 - Agung Setiawarman (Main Approver)', dept: 'HR Manager' },
        ],
      },
    ],
  },

  // ── id=3–5: placeholder data ──
  {
    id: 3,
    name: 'Legacy Reimbursement Workflow',
    description: 'Legacy reimbursement approval workflow.',
    transactionType: 'Domestic',
    createdOn: '1 Jan 2025',
    lastUpdated: '1 Jan 2025 at 09:00 by Admin',
    rules: [
      {
        ruleNumber: 1,
        condition: 'Any amount',
        noApproval: false,
        subSteps: [
          { entries: [{ name: 'CPC002 - Agung Setiawarman', dept: 'HR Manager' }] },
        ],
      },
    ],
    additionalSteps: [],
  },
  {
    id: 4,
    name: 'Old Expense Workflow',
    description: 'Old expense approval workflow.',
    transactionType: 'Domestic',
    createdOn: '1 Jan 2025',
    lastUpdated: '1 Jan 2025 at 09:00 by Admin',
    rules: [
      {
        ruleNumber: 1,
        condition: 'Any amount',
        noApproval: false,
        subSteps: [
          { entries: [{ name: 'CPC002 - Agung Setiawarman', dept: 'HR Manager' }] },
        ],
      },
    ],
    additionalSteps: [],
  },
  {
    id: 5,
    name: 'Archived International Flow',
    description: 'Archived international approval flow.',
    transactionType: 'International',
    createdOn: '1 Jan 2024',
    lastUpdated: '1 Jan 2024 at 09:00 by Admin',
    steps: [
      {
        stepNumber: 1,
        entries: [
          { name: 'CPC002 - Agung Setiawarman (Main Approver)', dept: 'HR Manager' },
        ],
      },
    ],
  },
]

const workflow = computed<Workflow | undefined>(() =>
  MOCK_WORKFLOWS.find(w => w.id === Number(route.params.id))
)

// Keep H1 in sync with the loaded workflow name
watchEffect(() => {
  if (workflow.value) route.meta.title = workflow.value.name
})

// ─── Styles ───────────────────────────────────────────────────────

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

const approverName = css({
  fontFamily: 'body', fontSize: 'md', fontWeight: 'regular',
  lineHeight: 'lg', color: 'dark', display: 'block',
})

const approverDept = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg',
  color: 'gray.600', display: 'block',
})

const approverDesc = css({
  fontFamily: 'body', fontSize: 'sm', lineHeight: 'lg',
  color: 'gray.600', display: 'block',
})

const approverAlt = css({
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold',
  lineHeight: 'lg', color: 'gray.600', display: 'block',
})

const approvalSubStepLabel = css({
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold',
  lineHeight: 'lg', color: 'dark', display: 'block', marginBottom: '2',
})

const ruleCondition = css({
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold',
  lineHeight: 'lg', color: 'dark',
})
</script>

<template>
  <!-- ═══ Stage content ═══ -->
  <MpFlex direction="column" gap="6" width="full">

    <!-- ═══ Section 1: Workflow details ═══ -->
    <MpFlex direction="column" gap="4">
      <!-- Section header row -->
      <MpFlex align="center" justify="space-between">
        <MpText as="h2" size="h2" weight="semiBold" color="dark">Workflow details</MpText>
        <MpButton
          variant="ghost"
          size="sm"
          left-icon="edit"
          @click="navigateTo(`/workflows/claims/create?mode=edit&id=${workflow?.id}`)"
        />
      </MpFlex>

      <!-- Key-value grid -->
      <div v-if="workflow" style="display:grid; grid-template-columns:180px 1fr; row-gap:20px; column-gap:16px;">
        <span :class="kvLabel">Workflow name</span>
        <span :class="kvValue">{{ workflow.name }}</span>

        <span :class="kvLabel">Description</span>
        <span :class="kvValue">{{ workflow.description || '—' }}</span>

        <span :class="kvLabel">Transaction type</span>
        <span :class="kvValue">{{ workflow.transactionType }}</span>

        <span :class="kvLabel">Created on</span>
        <span :class="kvValue">
          {{ workflow.createdOn }}
          <em :class="kvValueSub">Last updated {{ workflow.lastUpdated }}</em>
        </span>
      </div>
    </MpFlex>


    <!-- ═══ Section 2: Claim approval rule ═══ -->
    <MpFlex direction="column" gap="4" paddingTop="6">
      <MpFlex direction="column" gap="1">
        <MpText as="h2" size="h2" weight="semiBold" color="dark">Claim approval rule</MpText>
        <span :class="helperText">Approval rule when employees submit a claim request.</span>
      </MpFlex>

      <!-- ── International: sequential steps ── -->
      <template v-if="workflow?.transactionType === 'International' && workflow?.steps?.length">
        <div style="display:grid; grid-template-columns:120px 1fr; row-gap:0; column-gap:16px;">
          <template v-for="(step, stepIdx) in workflow.steps" :key="step.stepNumber">
            <!-- Divider between steps -->
            <template v-if="stepIdx > 0">
              <div style="grid-column:1/-1;">
                <hr style="border:none; border-top:1px solid var(--colors-gray\\.100); margin:16px 0;">
              </div>
            </template>

            <!-- Step label -->
            <span :class="kvLabel" style="padding-top:2px;">Step {{ step.stepNumber }}</span>

            <!-- Approver block -->
            <div style="display:flex; flex-direction:column; gap:12px;">
              <div v-for="(entry, eIdx) in step.entries" :key="eIdx">
                <span v-if="entry.isAlt" :class="approverAlt">{{ entry.name }}</span>
                <template v-else>
                  <span :class="approverName">{{ entry.name }}</span>
                  <span v-if="entry.description" :class="approverDesc">{{ entry.description }}</span>
                  <span v-if="entry.dept" :class="approverDept">{{ entry.dept }}</span>
                </template>
              </div>
            </div>
          </template>
        </div>
      </template>

      <!-- ── Domestic: rules + additional steps ── -->
      <template v-if="workflow?.transactionType === 'Domestic'">
        <div style="display:grid; grid-template-columns:120px 1fr; row-gap:0; column-gap:16px;">

          <!-- Rules -->
          <template v-for="(rule, ruleIdx) in workflow.rules" :key="rule.ruleNumber">
            <!-- Divider before every rule except first -->
            <template v-if="ruleIdx > 0">
              <div style="grid-column:1/-1;">
                <hr style="border:none; border-top:1px solid var(--colors-gray\\.100); margin:16px 0;">
              </div>
            </template>

            <!-- Rule N + condition -->
            <span :class="kvLabel" style="padding-top:2px;">Rule {{ rule.ruleNumber }}</span>
            <span :class="ruleCondition">{{ rule.condition }}</span>

            <!-- Approval row(s) -->
            <template v-if="rule.noApproval">
              <span :class="kvLabel" style="padding-top:2px; margin-top:8px;">Approval</span>
              <span :class="kvValue" style="margin-top:8px;">Doesn't need approval</span>
            </template>

            <template v-else v-for="(subStep, subIdx) in rule.subSteps" :key="subIdx">
              <span :class="kvLabel" style="padding-top:2px; margin-top:8px;">{{ subIdx === 0 ? 'Approval' : '' }}</span>
              <div style="margin-top:8px; display:flex; flex-direction:column; gap:4px;">
                <!-- Sub-step label if numbered (Approval step 1/2) -->
                <span v-if="subStep.subStepNumber" :class="approvalSubStepLabel">
                  Approval step {{ subStep.subStepNumber }}
                </span>
                <!-- Approver entries -->
                <div v-for="(entry, eIdx) in subStep.entries" :key="eIdx">
                  <span v-if="entry.isAlt" :class="approverAlt">{{ entry.name }}</span>
                  <template v-else>
                    <span :class="approverName">{{ entry.name }}</span>
                    <span v-if="entry.description" :class="approverDesc">{{ entry.description }}</span>
                    <span v-if="entry.dept" :class="approverDept">{{ entry.dept }}</span>
                  </template>
                </div>
              </div>
            </template>
          </template>

          <!-- Additional sequential steps (after rules) -->
          <template v-if="workflow.additionalSteps?.length">
            <template v-for="(step, stepIdx) in workflow.additionalSteps" :key="step.stepNumber">
              <div style="grid-column:1/-1;">
                <hr style="border:none; border-top:1px solid var(--colors-gray\\.100); margin:16px 0;">
              </div>

              <!-- Step label -->
              <span :class="kvLabel" style="padding-top:2px;">Step {{ step.stepNumber }}</span>

              <!-- Approver block -->
              <div style="display:flex; flex-direction:column; gap:12px;">
                <div v-for="(entry, eIdx) in step.entries" :key="eIdx">
                  <span v-if="entry.isAlt" :class="approverAlt">{{ entry.name }}</span>
                  <template v-else>
                    <span :class="approverName">{{ entry.name }}</span>
                    <span v-if="entry.description" :class="approverDesc">{{ entry.description }}</span>
                    <span v-if="entry.dept" :class="approverDept">{{ entry.dept }}</span>
                  </template>
                </div>
              </div>
            </template>
          </template>

        </div>
      </template>

    </MpFlex>

  </MpFlex>
</template>
