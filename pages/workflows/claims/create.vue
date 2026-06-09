<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Workflows › Claims › Create workflow
  Source: Figma C098s6fLIfQ3JipIeSZi6d · node 8166-37285
  Token mode: Pixel 2.4
  Patterns used: form-view, dynamic-list
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STATES INCLUDED:
    - Happy path (dynamic rules + approval steps)
    - approvalBasis = 'any' hides rules section entirely

  COPY DEFAULTS:
    - Approval line helper: "This is the default approval line based on your organization's reporting hierarchy in Talenta."
    - "Doesn't require approval" = first option in "then" select

  OPEN ITEMS:
    - Real employee list from API
    - Form validation (required fields, amount range logic)
    - Save & publish API integration
-->
<script setup lang="ts">
import {
  MpFlex, MpText,
  MpButton, MpTextlink,
  MpFormControl, MpFormLabel, MpFormHelpText,
  MpInput, MpInputGroup, MpInputLeftAddon,
  MpTextarea, MpAutocomplete, MpRadio, MpToggle, MpTooltip,
  MpBadge,
  css, toast,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Create workflow',
  breadcrumbParent: { label: 'Claims', path: '/workflows/claims' },
})
const router = useRouter()
const route  = useRoute()

const isEditMode = computed(() => route.query.mode === 'edit')

// Sync page title shown in layout header
watchEffect(() => {
  route.meta.title = isEditMode.value ? 'Edit workflow' : 'Create workflow'
})

// ─── Types ────────────────────────────────────────────────────────

interface Approver {
  id: number
  type: string       // 'employee-id' | 'approval-line'
  employeeId: string
  lineCount: string
}

interface ApprovalStep {
  id: number
  approverType: string      // 'approval-line' | 'employee-id'
  lineCount: string         // '1 upper line' | '2 upper lines' | ...
  employeeId: string        // used when approverType === 'employee-id'
  additionalApprovers: Approver[]
}

interface WorkflowRule {
  id: number
  toAmount: string
  then: 'no-approval' | 'needs-approval'
  steps: ApprovalStep[]
}

// ─── Constants ────────────────────────────────────────────────────

const MAX_WORKFLOW_NAME  = 60
const MAX_DESCRIPTION    = 200
const APPROVAL_HELPER    = "This is the default approval line based on your organization's reporting hierarchy in Talenta."

const MOCK_EMPLOYEES = [
  { id: 'CP026', name: 'CP026 - Eka Setiawan' },
  { id: 'CP021', name: 'CP021 - Esa Pangestu' },
  { id: 'CP072', name: 'CP072 - Galih Prakoso' },
  { id: 'CP067', name: 'CP067 - Indah Permata' },
  { id: 'CP038', name: 'CP038 - Jessie Tan' },
  { id: 'CP078', name: 'CP078 - Joko Guntilang' },
  { id: 'CP040', name: 'CP040 - Rid Priyono' },
]

const LINE_COUNTS = ['1 upper line', '2 upper lines', '3 upper lines']

const APPROVER_TYPE_OPTIONS = [
  { value: 'approval-line', label: 'Approval line' },
  { value: 'employee-id',   label: 'Employee ID' },
]
const RULE_THEN_OPTIONS = [
  { value: 'no-approval',    label: "Doesn't require approval" },
  { value: 'needs-approval', label: 'Needs approval' },
]

let _uid = 1
const uid = () => _uid++

// ─── Form state ───────────────────────────────────────────────────

const workflowName    = ref('Domestic Category Workflow')
const description     = ref('This is default approval for category')
const transactionType = ref('domestic')   // 'domestic' | 'international'
const approvalBasis   = ref('any')        // 'any' | 'specific'

// Reset to "any" when switching to international — specific ranges don't apply
watch(transactionType, (val) => {
  if (val === 'international') approvalBasis.value = 'any'
})

// ─── "Any claim amount" state ─────────────────────────────────────

const anyDoesntRequireApproval = ref(false)  // false = requires approval → steps shown

const anySteps = ref<ApprovalStep[]>([
  {
    id: uid(), approverType: 'approval-line', lineCount: '1 upper line', employeeId: '',
    additionalApprovers: [
      { id: uid(), type: 'employee-id', employeeId: 'CP026', lineCount: '' },
      { id: uid(), type: 'employee-id', employeeId: 'CP021', lineCount: '' },
    ],
  },
  {
    id: uid(), approverType: 'employee-id', lineCount: '1 upper line', employeeId: 'CP072',
    additionalApprovers: [],
  },
])

function addAnyStep() {
  anySteps.value.push({
    id: uid(), approverType: 'employee-id', lineCount: '1 upper line', employeeId: '',
    additionalApprovers: [],
  })
}

function removeAnyStep(i: number) {
  anySteps.value.splice(i, 1)
}

// Rules: always first ("≤ X") + middle ("between") + last ("> Y", auto-computed)
const rules = ref<WorkflowRule[]>([
  {
    id: uid(), toAmount: '1000000',
    then: 'no-approval', steps: [],
  },
  {
    id: uid(), toAmount: '999999999999',
    then: 'needs-approval',
    steps: [
      {
        id: uid(), approverType: 'approval-line', lineCount: '1 upper line',
        additionalApprovers: [],
      },
    ],
  },
])

// ─── Helpers ─────────────────────────────────────────────────────

const fmt = (n: string | number) => {
  const num = typeof n === 'string' ? parseFloat(n.replace(/\./g, '')) : n
  if (isNaN(num)) return n as string
  return new Intl.NumberFormat('id-ID').format(num)
}

// Strip non-digits from input, store raw digits in rule.toAmount
function onAmountUpdate(rule: WorkflowRule, val: string) {
  rule.toAmount = val.replace(/\D/g, '')
}

// Display formatted value (with separators); show empty string when blank
function displayAmount(toAmount: string) {
  return toAmount ? fmt(toAmount) : ''
}

// Auto-insert a default step when a rule switches to "needs-approval" with no steps
watch(rules, (current) => {
  for (const rule of current) {
    if (rule.then === 'needs-approval' && rule.steps.length === 0) {
      rule.steps.push({
        id: uid(),
        approverType: 'approval-line',
        lineCount: '1 upper line',
        employeeId: '',
        additionalApprovers: [],
      })
    }
  }
}, { deep: true })

// First rule = "≤ rules[0].toAmount"
// Middle rules (index 1..n-2) = "between rules[i-1].toAmount+1 and rules[i].toAmount"
// Last rule = "> rules[n-2].toAmount" (auto-computed, readonly)

function isFirst(i: number) { return i === 0 }
function isLast(i: number)  { return i === rules.value.length - 1 }

function rangeHelper(i: number): string {
  if (isFirst(i)) {
    const to = parseFloat(rules.value[i].toAmount) || 0
    return `Rp1 - Rp${fmt(to)}`
  }
  if (isLast(i)) {
    const from = (parseFloat(rules.value[i - 1].toAmount) || 0) + 1
    return `Rp${fmt(from)} - ∞`
  }
  const from = (parseFloat(rules.value[i - 1].toAmount) || 0) + 1
  const to   = parseFloat(rules.value[i].toAmount) || 0
  return `Rp${fmt(from)} - Rp${fmt(to)}`
}

// Last rule disabled input — shows raw boundary (same number as prev rule's toAmount)
const lastRuleDisplay = computed(() => {
  if (rules.value.length < 2) return '0'
  return fmt(rules.value[rules.value.length - 2].toAmount || '0')
})

// Last rule help text — shows range start (prev + 1)
const lastRuleHelpFrom = computed(() => {
  if (rules.value.length < 2) return '1'
  const prev = parseFloat(rules.value[rules.value.length - 2].toAmount) || 0
  return fmt(prev + 1)
})

// ─── Rule mutations ──────────────────────────────────────────────

function addMiddleRule() {
  const lastIdx = rules.value.length - 1
  const newRule: WorkflowRule = {
    id: uid(), toAmount: '',
    then: 'needs-approval',
    steps: [
      {
        id: uid(), approverType: 'approval-line', lineCount: '1 upper line', employeeId: '',
        additionalApprovers: [],
      },
    ],
  }
  rules.value.splice(lastIdx, 0, newRule)
}

function removeMiddleRule(i: number) {
  rules.value.splice(i, 1)
}

// ─── Step mutations ──────────────────────────────────────────────

function addStep(rule: WorkflowRule) {
  rule.steps.push({
    id: uid(), approverType: 'employee-id', lineCount: '1 upper line', employeeId: '',
    additionalApprovers: [],
  })
}

function removeStep(rule: WorkflowRule, stepIdx: number) {
  rule.steps.splice(stepIdx, 1)
}

// ─── Approver mutations ──────────────────────────────────────────

function addApprover(step: ApprovalStep) {
  step.additionalApprovers.push({ id: uid(), type: 'employee-id', employeeId: '', lineCount: '' })
}

function removeApprover(step: ApprovalStep, approverIdx: number) {
  step.additionalApprovers.splice(approverIdx, 1)
}

// ─── Submit ──────────────────────────────────────────────────────

const saving = ref(false)

function cancel() { router.push('/workflows/claims') }

async function save() {
  saving.value = true
  await new Promise(r => setTimeout(r, 600))
  saving.value = false
  const title = isEditMode.value ? 'Workflow changes saved' : 'Workflow created'
  toast.notify({ variant: 'success', title, position: 'top-center' })
  router.push('/workflows/claims')
}

// ─── CSS classes ─────────────────────────────────────────────────

const page = css({ maxWidth: '780px' })

const sectionHeader = css({
  fontFamily: 'body', fontSize: 'h2', fontWeight: 'semiBold',
  lineHeight: 'h2', color: 'dark',
})

const ruleCard = css({
  border: '1px solid var(--mp-colors-neutral-500)',
  borderRadius: 'md', overflow: 'hidden',
})

const ruleCardHeader = css({
  background: 'gray.25',
  padding: 'var(--Spacing-pxl-space-md, 16px)',
  display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-pxl-space-xs, 8px)',
})

const ruleTitle = css({
  fontFamily: 'body', fontSize: 'h3', fontWeight: 'semiBold',
  lineHeight: 'h3', color: 'dark',
})

const ruleBody = css({
  padding: 'var(--Spacing-pxl-space-md, 16px)',
  display: 'flex', flexDirection: 'column',
  gap: 'var(--Spacing-pxl-space-md, 16px)',
})

const stepsContainer = css({
  display: 'flex', flexDirection: 'column',
  // Border between every adjacent child: step↔step and last-step↔Add-button
  '& > * + *': {
    borderTop: '1px solid',
    borderTopColor: 'gray.100',
  },
})

const stepRow = css({
  display: 'flex', gap: 'var(--Spacing-pxl-space-sm, 12px)',
  alignItems: 'flex-start',
  paddingTop: 'var(--Spacing-pxl-space-md, 16px)',
  paddingBottom: 'var(--Spacing-pxl-space-md, 16px)',
})

const stepBadge = css({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '24px', height: '24px', flexShrink: 0,
  borderRadius: 'full',
  background: 'blue.400',
  fontFamily: 'body', fontSize: 'sm', fontWeight: 'semiBold', color: 'white',
})

const approverRow = css({
  display: 'flex', gap: 'var(--Spacing-pxl-space-xs, 8px)',
  alignItems: 'center', width: '100%',
})

const removeLink = css({
  fontFamily: 'body', fontSize: 'md', color: 'blue.400',
  background: 'transparent', border: 'none', cursor: 'pointer',
  padding: '0', whiteSpace: 'nowrap',
  _hover: { color: 'blue.500', textDecoration: 'underline' },
})

const charCount = css({
  fontFamily: 'body', fontSize: 'sm', color: 'gray.400',
  whiteSpace: 'nowrap', flexShrink: 0,
})

const helperText = css({
  fontFamily: 'body', fontSize: 'sm', color: 'gray.600',
})

const subLabel = css({
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'dark',
  marginBottom: 'var(--Spacing-pxl-space-3xs, 4px)',
})
</script>

<template>
  <div :class="page">
    <MpFlex direction="column" gap="6">

      <!-- ═════ Section 1: Workflow details ═════ -->
      <MpFlex direction="column" gap="4">
        <MpText as="h2" size="h2" weight="semiBold" color="dark">Workflow details</MpText>

        <!-- Workflow name -->
        <MpFormControl id="wf-name" isRequired>
          <MpFlex justify="space-between" align="center">
            <MpFormLabel>Workflow name</MpFormLabel>
            <span :class="charCount">{{ workflowName.length }} / {{ MAX_WORKFLOW_NAME }}</span>
          </MpFlex>
          <MpInput
            v-model="workflowName"
            placeholder="Enter workflow name"
            :isFullWidth="true"
            :maxlength="MAX_WORKFLOW_NAME"
          />
        </MpFormControl>

        <!-- Description -->
        <MpFormControl id="wf-description" isRequired>
          <MpFormLabel>Description</MpFormLabel>
          <MpTextarea
            v-model="description"
            placeholder="Enter description"
            :isFullWidth="true"
            :maxlength="MAX_DESCRIPTION"
            rows="4"
          />
          <MpFlex justify="flex-end">
            <span :class="charCount">{{ description.length }} / {{ MAX_DESCRIPTION }}</span>
          </MpFlex>
        </MpFormControl>

        <!-- Transaction type -->
        <MpFormControl id="wf-tx-type" isRequired>
          <MpFormLabel>Transaction type</MpFormLabel>
          <MpFlex gap="6" marginTop="1">
            <MpRadio id="tx-domestic"      name="transactionType" value="domestic"      v-model="transactionType">Domestic</MpRadio>
            <MpRadio id="tx-international" name="transactionType" value="international" v-model="transactionType">International</MpRadio>
          </MpFlex>
        </MpFormControl>
      </MpFlex>

      <!-- ═════ Section 2: Claim approval rule ═════ -->
      <MpFlex direction="column" gap="5">
        <MpFlex direction="column" gap="1">
          <MpText as="h2" size="h2" weight="semiBold" color="dark">Claim approval rule</MpText>
          <MpText size="body" color="gray.600">
            Set a rule for any purchase amount or a specific one, then decide if the vendor needs approval and choose the approval steps.
          </MpText>
        </MpFlex>

        <!-- Claim approval based on -->
        <MpFormControl id="wf-basis">
          <MpFormLabel>Claim approval based on</MpFormLabel>
          <MpFlex gap="6" marginTop="1">
            <MpRadio id="basis-any"      name="approvalBasis" value="any"      v-model="approvalBasis">Any claim amount</MpRadio>
            <MpTooltip
              id="tooltip-basis-specific"
              label="Amount-based rules aren't available for international transactions."
              placement="top"
              :is-manual="transactionType !== 'international'"
              :is-open="false"
            >
              <div :style="transactionType === 'international' ? 'cursor: not-allowed; display: inline-flex;' : 'display: inline-flex;'">
                <MpRadio
                  id="basis-specific"
                  name="approvalBasis"
                  value="specific"
                  v-model="approvalBasis"
                  :isDisabled="transactionType === 'international'"
                  :style="transactionType === 'international' ? 'pointer-events: none;' : ''"
                >Specific claim amount</MpRadio>
              </div>
            </MpTooltip>
          </MpFlex>
        </MpFormControl>

        <!-- ═════ Any claim amount: approval section ═════ -->
        <template v-if="approvalBasis === 'any'">
          <MpFlex direction="column" gap="4">

            <!-- Header row: label + toggle -->
            <MpFlex justify="space-between" align="flex-start">
              <MpFlex direction="column" gap="1">
                <MpText size="body" weight="semiBold" color="dark">Claim approval</MpText>
                <MpText size="body" color="gray.600">Approval rule when user has submitted claims.</MpText>
              </MpFlex>
              <MpFlex align="center" gap="2">
                <MpToggle v-model:isChecked="anyDoesntRequireApproval" />
                <MpText size="body" color="dark">Doesn't require approval</MpText>
              </MpFlex>
            </MpFlex>

            <!-- Approval steps (only when approval required) -->
            <template v-if="!anyDoesntRequireApproval">
              <div :class="stepsContainer">

                <div v-for="(step, si) in anySteps" :key="step.id" :class="stepRow">
                  <MpBadge for="tableStatus" variant="solid" variantColor="blue">{{ si + 1 }}</MpBadge>

                  <MpFlex direction="column" gap="3" style="flex:1; min-width:0;">
                    <MpFlex justify="space-between" align="center">
                      <MpText size="body" weight="semiBold" color="dark">Approval step {{ si + 1 }}</MpText>
                      <button v-if="anySteps.length > 1" :class="removeLink" @click="removeAnyStep(si)">Remove</button>
                    </MpFlex>

                    <MpFlex gap="2" align="flex-start">
                      <div style="flex:1;">
                        <MpAutocomplete :id="`any-step-type-${step.id}`" v-model="step.approverType" :data="APPROVER_TYPE_OPTIONS" value-prop="value" label-prop="label" />
                      </div>
                      <div v-if="step.approverType === 'approval-line'" style="flex:1;">
                        <MpAutocomplete :id="`any-step-line-${step.id}`" v-model="step.lineCount" :data="LINE_COUNTS" />
                      </div>
                      <div v-else-if="step.approverType === 'employee-id'" style="flex:1;">
                        <MpAutocomplete :id="`any-step-emp-${step.id}`" v-model="step.employeeId" :data="MOCK_EMPLOYEES" value-prop="id" label-prop="name" placeholder="Select employee" />
                      </div>
                    </MpFlex>

                    <MpText v-if="step.approverType === 'approval-line'" size="body" color="gray.600">
                      {{ APPROVAL_HELPER }}
                    </MpText>

                    <MpFlex direction="column" gap="2">
                      <MpText v-if="step.additionalApprovers.length > 0" size="body" weight="semiBold" color="dark">Any of these approver can also approve</MpText>

                      <MpFlex
                        v-for="(approver, ai) in step.additionalApprovers"
                        :key="approver.id"
                        :class="approverRow"
                      >
                        <div style="flex:1;">
                          <MpAutocomplete :id="`any-approver-type-${step.id}-${approver.id}`" v-model="approver.type" :data="APPROVER_TYPE_OPTIONS" value-prop="value" label-prop="label" />
                        </div>
                        <div v-if="approver.type === 'approval-line'" style="flex:1;">
                          <MpAutocomplete :id="`any-approver-line-${step.id}-${approver.id}`" v-model="approver.lineCount" :data="LINE_COUNTS" />
                        </div>
                        <div v-else style="flex:1;">
                          <MpAutocomplete :id="`any-approver-emp-${step.id}-${approver.id}`" v-model="approver.employeeId" :data="MOCK_EMPLOYEES" value-prop="id" label-prop="name" placeholder="Select employee" />
                        </div>
                        <MpButton
                          variant="ghost"
                          size="md"
                          leftIcon="minus-circular"
                          aria-label="Remove approver"
                          @click="removeApprover(step, ai)"
                        />
                      </MpFlex>

                      <MpButton variant="textLink" size="md" leftIcon="add-circular" @click="addApprover(step)">
                        Add more approver
                      </MpButton>
                    </MpFlex>
                  </MpFlex>
                </div>

                <div style="padding-top: var(--Spacing-pxl-space-md, 16px);">
                  <MpButton variant="secondary" size="md" leftIcon="add-circular" @click="addAnyStep">
                    Add approval step
                  </MpButton>
                </div>

              </div>
            </template>

          </MpFlex>
        </template>

        <!-- ═════ Rules section (only when specific) ═════ -->
        <template v-if="approvalBasis === 'specific'">
          <MpFlex direction="column" gap="1">
            <MpText size="body" weight="semiBold" color="dark">Claim approval</MpText>
            <MpText size="body" color="gray.600">Approval rule when user has submitted claims.</MpText>
          </MpFlex>

          <MpFlex direction="column" gap="4">

            <!-- ── Rule cards ── -->
            <template v-for="(rule, ri) in rules" :key="rule.id">
            <div
              :class="ruleCard"
            >
              <!-- Rule header row -->
              <div :class="ruleCardHeader">
                <MpFlex justify="space-between" align="center">
                  <span :class="ruleTitle">Rule {{ ri + 1 }}</span>
                  <!-- Remove link for middle rules only -->
                  <button
                    v-if="!isFirst(ri) && !isLast(ri)"
                    :class="removeLink"
                    @click="removeMiddleRule(ri)"
                  >Remove</button>
                </MpFlex>

                <!-- Amount fields -->
                <!-- First rule: ≤ amount -->
                <template v-if="isFirst(ri)">
                  <MpFormControl :id="`rule-${rule.id}-to`">
                    <MpFormLabel>Any amount less than or equal to</MpFormLabel>
                    <div style="width:264px;">
                      <MpInputGroup>
                        <MpInputLeftAddon hasBackground>Rp</MpInputLeftAddon>
                        <MpInput
                          :modelValue="displayAmount(rule.toAmount)"
                          @update:modelValue="(v) => onAmountUpdate(rule, v)"
                          placeholder="0"
                          :isFullWidth="true"
                        />
                      </MpInputGroup>
                    </div>
                    <MpFormHelpText>{{ rangeHelper(ri) }}</MpFormHelpText>
                  </MpFormControl>
                </template>

                <!-- Middle rules: between amounts -->
                <template v-else-if="!isLast(ri)">
                  <MpFormControl :id="`rule-${rule.id}-between`">
                    <MpFormLabel>Any amount between</MpFormLabel>
                    <MpFlex align="center" gap="2">
                      <div style="width:264px;">
                        <MpInputGroup>
                          <MpInputLeftAddon hasBackground>Rp</MpInputLeftAddon>
                          <MpInput
                            :modelValue="fmt(parseFloat(rules[ri-1]?.toAmount) || 0)"
                            :isFullWidth="true"
                            isDisabled
                          />
                        </MpInputGroup>
                      </div>
                      <MpText size="body" color="gray.600">to</MpText>
                      <div style="width:264px;">
                        <MpInputGroup>
                          <MpInputLeftAddon hasBackground>Rp</MpInputLeftAddon>
                          <MpInput
                              :modelValue="displayAmount(rule.toAmount)"
                              @update:modelValue="(v) => onAmountUpdate(rule, v)"
                              placeholder="0"
                              :isFullWidth="true"
                            />
                        </MpInputGroup>
                      </div>
                    </MpFlex>
                    <MpFormHelpText>{{ rangeHelper(ri) }}</MpFormHelpText>
                  </MpFormControl>
                </template>

                <!-- Last rule: > amount (auto) -->
                <template v-else>
                  <MpFormControl :id="`rule-${rule.id}-gt`">
                    <MpFormLabel>Any amount greater than</MpFormLabel>
                    <div style="width:264px;">
                      <MpInputGroup>
                        <MpInputLeftAddon hasBackground>Rp</MpInputLeftAddon>
                        <MpInput :modelValue="lastRuleDisplay" :isFullWidth="true" isDisabled />
                      </MpInputGroup>
                    </div>
                    <MpFormHelpText>Rp{{ lastRuleHelpFrom }} - Unlimited</MpFormHelpText>
                  </MpFormControl>
                </template>

                <!-- then select — inside gray header, below amount -->
                <div style="width:264px;">
                  <MpFormControl :id="`rule-${rule.id}-then`">
                    <MpFormLabel>then</MpFormLabel>
                    <MpAutocomplete :id="`rule-then-${rule.id}`" v-model="rule.then" :data="RULE_THEN_OPTIONS" value-prop="value" label-prop="label" />
                  </MpFormControl>
                </div>
              </div>

              <!-- Rule body: approval steps only — hidden when no approval needed -->
              <div v-if="rule.then === 'needs-approval'" :class="ruleBody">

                <!-- ── Approval steps (only when needs-approval) ── -->
                <template v-if="rule.then === 'needs-approval'">
                  <div :class="stepsContainer">

                    <div
                      v-for="(step, si) in rule.steps"
                      :key="step.id"
                      :class="stepRow"
                    >
                      <!-- Numbered badge -->
                      <MpBadge for="tableStatus" variant="solid" variantColor="blue">{{ si + 1 }}</MpBadge>

                      <!-- Step content -->
                      <MpFlex direction="column" gap="3" style="flex:1; min-width:0;">

                        <!-- Step header -->
                        <MpFlex justify="space-between" align="center">
                          <MpText size="body" weight="semiBold" color="dark">Approval step {{ si + 1 }}</MpText>
                          <button :class="removeLink" @click="removeStep(rule, si)">Remove</button>
                        </MpFlex>

                        <!-- Approver type + line count -->
                        <MpFlex gap="2" align="flex-start">
                          <div style="flex:1;">
                            <MpAutocomplete :id="`rule-step-type-${step.id}`" v-model="step.approverType" :data="APPROVER_TYPE_OPTIONS" value-prop="value" label-prop="label" />
                          </div>
                          <div v-if="step.approverType === 'approval-line'" style="flex:1;">
                            <MpAutocomplete :id="`rule-step-line-${step.id}`" v-model="step.lineCount" :data="LINE_COUNTS" />
                          </div>
                          <div v-else-if="step.approverType === 'employee-id'" style="flex:1;">
                            <MpAutocomplete :id="`rule-step-emp-${step.id}`" v-model="step.employeeId" :data="MOCK_EMPLOYEES" value-prop="id" label-prop="name" placeholder="Select employee" />
                          </div>
                        </MpFlex>

                        <!-- Helper text for approval line -->
                        <MpText
                          v-if="step.approverType === 'approval-line'"
                          size="body"
                          color="gray.600"
                        >{{ APPROVAL_HELPER }}</MpText>

                        <!-- Additional approvers -->
                        <MpFlex direction="column" gap="2">
                          <MpText v-if="step.additionalApprovers.length > 0" size="body" weight="semiBold" color="dark">Any of these approver can also approve</MpText>

                          <MpFlex
                            v-for="(approver, ai) in step.additionalApprovers"
                            :key="approver.id"
                            :class="approverRow"
                          >
                            <div style="flex:1;">
                              <MpAutocomplete :id="`rule-approver-type-${step.id}-${approver.id}`" v-model="approver.type" :data="APPROVER_TYPE_OPTIONS" value-prop="value" label-prop="label" />
                            </div>
                            <div v-if="approver.type === 'approval-line'" style="flex:1;">
                              <MpAutocomplete :id="`rule-approver-line-${step.id}-${approver.id}`" v-model="approver.lineCount" :data="LINE_COUNTS" />
                            </div>
                            <div v-else style="flex:1;">
                              <MpAutocomplete :id="`rule-approver-emp-${step.id}-${approver.id}`" v-model="approver.employeeId" :data="MOCK_EMPLOYEES" value-prop="id" label-prop="name" placeholder="Select employee" />
                            </div>
                            <MpButton
                              variant="ghost"
                              size="md"
                              leftIcon="minus-circular"
                              aria-label="Remove approver"
                              @click="removeApprover(step, ai)"
                            />
                          </MpFlex>

                          <!-- Add more approver -->
                          <MpButton
                            variant="textLink"
                            size="md"
                            leftIcon="add-circular"
                            @click="addApprover(step)"
                          >Add more approver</MpButton>
                        </MpFlex>

                      </MpFlex>
                    </div>

                    <!-- Add approval step -->
                    <div style="padding-top: var(--Spacing-pxl-space-md, 16px);">
                      <MpButton
                        variant="secondary"
                        size="md"
                        leftIcon="add-circular"
                        @click="addStep(rule)"
                      >Add approval step</MpButton>
                    </div>
                  </div>
                </template>

              </div>
            </div>

            <!-- Add another rule — appears between last middle rule and last rule -->
            <MpButton
              v-if="ri === rules.length - 2"
              variant="secondary"
              size="md"
              leftIcon="add-circular"
              @click="addMiddleRule"
            >Add another rule</MpButton>

            </template>

          </MpFlex>
        </template>

      </MpFlex>

    </MpFlex>
  </div>

  <!-- ═════ Footer actions ═════ -->
  <MpFlex justify="flex-end" gap="3" paddingTop="4" paddingBottom="8" width="full">
    <MpButton variant="ghost" size="md" @click="cancel">Cancel</MpButton>
    <MpButton variant="primary" size="md" :isLoading="saving" @click="save">
      {{ isEditMode ? 'Save changes' : 'Save & publish' }}
    </MpButton>
  </MpFlex>
</template>
