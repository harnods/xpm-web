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
  MpInput, MpInputGroup, MpInputLeftAddon, MpInputRightAddon,
  MpTextarea, MpAutocomplete, MpToggle, MpCheckbox,
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
let _uid = 1
const uid = () => _uid++

// ─── Form state ───────────────────────────────────────────────────

const workflowName = ref('Domestic Category Workflow')
const description  = ref('This is default approval for category')

// ─── Currency picker ──────────────────────────────────────────────
const ALL_CURRENCIES = [
  { code: 'AUD', name: 'Australian dollar' },
  { code: 'CAD', name: 'Canadian dollar' },
  { code: 'CNY', name: 'Renminbi' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British pound' },
  { code: 'HKD', name: 'Hong Kong dollar' },
  { code: 'JPY', name: 'Japanese yen' },
  { code: 'MYR', name: 'Malaysian ringgit' },
  { code: 'SGD', name: 'Singapore dollar' },
  { code: 'USD', name: 'US dollar' },
]
const MAX_CURRENCIES     = 5
const selectedCurrencies = ref<string[]>(['HKD', 'MYR', 'JPY', 'SGD', 'USD'])
const currencySearch     = ref('')
const currencyPickerOpen = ref(false)
const pickerRef          = ref<HTMLElement | null>(null)

const filteredCurrencies = computed(() =>
  ALL_CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(currencySearch.value.toLowerCase()) ||
    c.name.toLowerCase().includes(currencySearch.value.toLowerCase())
  )
)
const currencyHelpText = computed(() =>
  selectedCurrencies.value.length
    ? `Including ${selectedCurrencies.value.join(', ')}`
    : 'No currencies selected'
)

function toggleCurrency(code: string) {
  const idx = selectedCurrencies.value.indexOf(code)
  if (idx >= 0) selectedCurrencies.value.splice(idx, 1)
  else if (selectedCurrencies.value.length < MAX_CURRENCIES) selectedCurrencies.value.push(code)
}

// Close currency picker when clicking outside
function onDocumentMousedownCurrency(e: MouseEvent) {
  if (pickerRef.value && !pickerRef.value.contains(e.target as Node))
    currencyPickerOpen.value = false
}
onMounted(() => document.addEventListener('mousedown', onDocumentMousedownCurrency))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocumentMousedownCurrency))

// ─── Approval state ───────────────────────────────────────────────

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

const currencyDropdown = css({
  position: 'absolute', top: 'calc(100% + 4px)', left: '0', zIndex: 50,
  width: '280px', background: 'white',
  borderRadius: 'var(--Radius-pxl-radius-md, 8px)',
  boxShadow: 'var(--Shadow-pxl-shadow-md, 0 4px 16px rgba(0,0,0,.12))',
  border: '1px solid var(--Color-pxl-border-subtle, #E4E7EC)',
  padding: 'var(--Spacing-pxl-space-xs, 8px) 0',
})

const currencyItem = css({
  display: 'flex', width: '100%', boxSizing: 'border-box',
  padding: 'var(--Spacing-pxl-space-xs, 8px) var(--Spacing-pxl-space-sm, 12px)',
  alignItems: 'center', gap: 'var(--Spacing-pxl-space-xs, 8px)',
  cursor: 'pointer', borderRadius: '0',
  _hover: { background: 'var(--Color-pxl-bg-subtle, #F5F6F8)' },
})

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

        <!-- Currencies -->
        <MpFormControl id="wf-currencies" isRequired>
          <MpFormLabel>Currencies</MpFormLabel>
          <MpFormHelpText>{{ currencyHelpText }}</MpFormHelpText>
          <div ref="pickerRef" style="position:relative; width:280px; margin-top:4px;">
            <MpInputGroup @click="currencyPickerOpen = !currencyPickerOpen" style="cursor:pointer;">
              <MpInput
                :modelValue="selectedCurrencies.length ? `Selected (${selectedCurrencies.length})` : ''"
                placeholder="Select currencies"
                isReadOnly
                :isFullWidth="true"
                style="cursor:pointer;"
              />
              <MpInputRightAddon>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="color:inherit;">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </MpInputRightAddon>
            </MpInputGroup>
            <div v-if="currencyPickerOpen" :class="currencyDropdown">
              <div style="padding:0 8px 8px;">
                <MpInput v-model="currencySearch" placeholder="Search..." :isFullWidth="true" />
              </div>
              <div style="max-height:220px; overflow-y:auto; display:flex; flex-direction:column;">
                <div v-for="c in filteredCurrencies" :key="c.code" :class="currencyItem">
                  <MpCheckbox
                    :id="`cur-${c.code}`"
                    :isChecked="selectedCurrencies.includes(c.code)"
                    :isDisabled="!selectedCurrencies.includes(c.code) && selectedCurrencies.length >= MAX_CURRENCIES"
                    @change="toggleCurrency(c.code)"
                  >({{ c.code }}) {{ c.name }}</MpCheckbox>
                </div>
              </div>
            </div>
          </div>
        </MpFormControl>
      </MpFlex>

      <!-- ═════ Section 2: Claim approval rule ═════ -->
      <MpFlex direction="column" gap="5">
        <MpFlex direction="column" gap="1">
          <MpText as="h2" size="h2" weight="semiBold" color="dark">Claim approval rule</MpText>
          <MpText size="body" color="gray.600">
            Decide if claims require approval and configure the approval steps.
          </MpText>
        </MpFlex>

        <!-- ═════ Claim approval ═════ -->
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
