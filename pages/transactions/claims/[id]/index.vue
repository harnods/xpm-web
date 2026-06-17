<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Transactions › Claim Detail
  Source: Figma KmuvgJGEUPeKe2bkbtgNaq · node 3256-46854
  Token mode: Pixel 2.4
  Patterns used: detail-view, drawer, tabs
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STATES INCLUDED:
    - Happy path (international reimbursement, INR → Rp)
    - Edit item drawer: Subcategory locked for international claims
    - Amount column: foreign currency + info icon → tooltip with rate + Rp conversion
    - Two tabs: Request history | Discussions (empty state)

  LOGIC:
    - isInternational: subcategory field disabled in edit drawer
    - MpTooltip on amount: shows Rp equivalent + exchange rate + disclaimer
    - Edit (Claim information) → approver edit form at ./[id]/edit (category + item subcategory locked)

  OPEN ITEMS:
    - Wire to real API; mock data hardcoded for prototype
    - Reject/Approve actions need confirmation modal + API call
-->
<script setup lang="ts">
import {
  MpFlex, MpText, MpTextlink, MpButton, MpBadge, MpIcon, MpTooltip,
  MpAutocomplete, MpInput, MpInputGroup, MpInputLeftAddon, MpTextarea,
  MpDrawer, MpDrawerOverlay, MpDrawerContent, MpDrawerHeader,
  MpDrawerCloseButton, MpDrawerBody, MpDrawerFooter,
  MpTabs, MpTabList, MpTab, MpTabPanels, MpTabPanel,
  MpTimeline, MpTimelineItem, MpTimelineTitle, MpTimelineCaption,
  toast, css,
} from '@mekari/pixel3'

definePageMeta({
  title: 'Claim detail',
  breadcrumbParent: { label: 'Claims', path: '/transactions/claims' },
})

const route   = useRoute()
const claimId = route.params.id as string

// ─── Types ────────────────────────────────────────────────────────
interface ReimbursementItem {
  id: string
  subcategory: string
  vendor: string
  foreignAmount: number
  amountRp: number
  description: string
  files: string[]
}

// ─── Mock claim data ──────────────────────────────────────────────
const CLAIM = reactive({
  status: 'Awaiting approval',
  isInternational: true,
  currency: 'INR',
  exchangeRate: 188,
  transactionType: 'Reimbursement',
  account: 'Clever Cloud',
  category: 'Transportation',
  subcategories: ['Car Rentals', 'Parking', 'Fuel', 'Public Transport', 'Toll Fee'],
  transactionDate: '15 Oct 2024',
  requestDate: '15 Oct 2024, 14:00 (GMT+7)',
  requester: {
    name: 'Daud Dimas Prasetyo',
    code: 'CP021',
    role: 'Sales Representative - Sales',
    unit: 'Head Office',
    email: 'daud.dimas@centralperk.co.id',
    phone: '+6287899999999',
  },
})

// Category slug used to pre-select the category on the edit form
const categorySlug = computed(() => CLAIM.category.toLowerCase().replace(/\s+/g, '-'))

// Open the approver edit form (stays under /transactions/claims; category + item subcategory locked)
function openClaimEdit() {
  navigateTo(`/transactions/claims/${claimId}/edit?category=${categorySlug.value}&type=reimbursement`)
}

const items = ref<ReimbursementItem[]>([
  {
    id: 'item-1',
    subcategory: 'Car Rentals',
    vendor: 'Silverbird',
    foreignAmount: 12_000,
    amountRp: 2_256_000,
    description: 'Business trip transportation from airport to hotel.',
    files: ['Invoice-1.jpg', 'Invoice-2.jpg'],
  },
  {
    id: 'item-2',
    subcategory: 'Parking',
    vendor: 'Hotel Mulia',
    foreignAmount: 6_197,
    amountRp: 1_165_036,
    description: 'Parking fee at hotel during business trip.',
    files: ['Receipt.jpg'],
  },
])

const totalForeign = computed(() => items.value.reduce((s, i) => s + i.foreignAmount, 0))
const totalRp      = computed(() => items.value.reduce((s, i) => s + i.amountRp, 0))

const REQUEST_HISTORY = [
  { status: 'created',   date: '15 Oct 2024, 14:00 (GMT+7)', actor: 'Daud Dimas Prasetyo', action: 'Submitted request' },
  { status: undefined,   date: '15 Oct 2024, 14:05 (GMT+7)', actor: 'System',              action: 'Forwarded to approver' },
]

// ─── Status map ───────────────────────────────────────────────────
const STATUS_TYPE: Record<string, string> = {
  'Awaiting approval':     'warning',
  'Awaiting settlement':   'warning',
  'Awaiting disbursement': 'information',
  'Approved':              'completed',
  'Disbursed':             'completed',
  'Settled':               'completed',
  'Rejected':              'critical',
}

// ─── Tabs ─────────────────────────────────────────────────────────
const currentTab = ref(0)   // 0 = Request history · 1 = Discussions

// ─── Edit drawer ──────────────────────────────────────────────────
const isDrawerOpen  = ref(false)
const selectedItem  = ref<ReimbursementItem | null>(null)
const draft = reactive({
  subcategory: '',
  vendor: '',
  amountStr: '',
  description: '',
  files: [] as string[],
  reason: '',
})

function openEditDrawer(item: ReimbursementItem) {
  selectedItem.value = item
  draft.subcategory  = item.subcategory
  draft.vendor       = item.vendor
  draft.amountStr    = item.amountRp.toLocaleString('id-ID')
  draft.description  = item.description
  draft.files        = [...item.files]
  draft.reason       = ''
  isDrawerOpen.value = true
}

function removeFile(index: number) {
  draft.files.splice(index, 1)
}

function saveItem() {
  if (!selectedItem.value) return
  const idx = items.value.findIndex(i => i.id === selectedItem.value!.id)
  if (idx !== -1) {
    const amountRp = parseInt(draft.amountStr.replace(/\./g, '')) || items.value[idx].amountRp
    items.value[idx] = {
      ...items.value[idx],
      subcategory: draft.subcategory,
      vendor: draft.vendor,
      amountRp,
      description: draft.description,
      files: [...draft.files],
    }
  }
  isDrawerOpen.value = false
  toast.notify({ variant: 'success', title: 'Claim updated', position: 'top-center' })
}

// ─── Helpers ──────────────────────────────────────────────────────
const formatRp      = (n: number) => `Rp${n.toLocaleString('id-ID')}`
const formatForeign = (n: number) => `${CLAIM.currency} ${n.toLocaleString('id-ID')}`
const initials      = (name: string) => name.split(' ').map(w => w[0]).slice(0, 2).join('')

// ─── Styles ───────────────────────────────────────────────────────
const card = css({
  background: 'white',
  borderRadius: 'lg',
  padding: '5',
})

const kvGrid = 'kv-grid-main'

const kvLabel = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg',
  color: 'gray.600',
})

const kvValue = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'dark',
})

const kvValueSub = css({
  fontFamily: 'body', fontSize: 'sm', lineHeight: 'lg', color: 'gray.600',
})

const sidebar = css({
  width: '240px', flexShrink: '0',
  background: '#FBFBFB',
  border: '1px solid var(--mp-colors-border-default, #DCDFE4)',
  borderRadius: 'lg',   // 8px
  padding: '6',         // 24px
})

const iconGray = css({ color: 'gray.600' })

const avatarCircle = css({
  width: '48px', height: '48px', borderRadius: 'full',
  background: 'background.brand', color: 'white',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', flexShrink: '0',
})

const th = css({
  bg: 'gray.25', fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold',
  lineHeight: 'lg', color: 'dark', paddingInline: '3', paddingBlock: '3', height: '44px',
  borderBottom: '1px solid', borderBottomColor: 'gray.100',
  textAlign: 'left', whiteSpace: 'nowrap', verticalAlign: 'middle',
})
const thRight = css({
  bg: 'gray.25', fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold',
  lineHeight: 'lg', color: 'dark', paddingInline: '3', paddingBlock: '3', height: '44px',
  borderBottom: '1px solid', borderBottomColor: 'gray.100',
  textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'middle',
})
const td = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'dark',
  paddingInline: '3', paddingBlock: '3',
  borderBottom: '1px solid', borderBottomColor: 'gray.100', verticalAlign: 'middle',
})
const tdRight = css({
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg', color: 'dark',
  paddingInline: '3', paddingBlock: '3', textAlign: 'right', whiteSpace: 'nowrap',
  borderBottom: '1px solid', borderBottomColor: 'gray.100', verticalAlign: 'middle',
})

const fieldGroup = css({ display: 'flex', flexDirection: 'column', gap: '1.5' })
const fieldLabel = css({
  fontFamily: 'body', fontSize: 'md', fontWeight: 'semiBold', color: 'dark', lineHeight: 'lg',
})
const fieldReq = css({ color: 'red.500' })

const fileRow = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2',
  padding: '2', borderRadius: 'md',
  _hover: { background: 'gray.25' },
})
</script>

<template>
  <!-- ═════ Status badge beside layout H1 ═════ -->
  <Teleport to="#layout-title-suffix">
    <MpBadge for="additionalInformation" :type="STATUS_TYPE[CLAIM.status]">{{ CLAIM.status }}</MpBadge>
  </Teleport>

  <MpFlex direction="column" gap="5" width="full">

    <!-- ═════ Top row: Claim information (60%) · spacer (10%) · Requester (30%) ═════ -->
    <MpFlex align="flex-start" width="full">

      <!-- ── Claim information (60%) ── -->
      <div :class="card" style="width:60%; min-width:0;">
        <MpFlex justify="space-between" align="center" style="margin-bottom:16px;">
          <MpText as="h2" weight="semiBold" style="font-size:16px; line-height:24px;">Claim information</MpText>
          <MpButton variant="secondary" size="sm" left-icon="edit" @click="openClaimEdit">Edit</MpButton>
        </MpFlex>
        <div :class="kvGrid">
          <span :class="kvLabel">Transaction type</span>
          <span :class="kvValue">{{ CLAIM.transactionType }}</span>

          <span :class="kvLabel">Account</span>
          <span :class="kvValue">{{ CLAIM.account }}</span>

          <span :class="kvLabel">Category</span>
          <span :class="kvValue">{{ CLAIM.category }}</span>

          <span :class="kvLabel">Transaction date</span>
          <span :class="kvValue">{{ CLAIM.transactionDate }}</span>

          <span :class="kvLabel">Request date</span>
          <span :class="kvValue">{{ CLAIM.requestDate }}</span>
        </div>
      </div>

      <!-- Spacing (10%) between columns -->
      <div style="width:10%; flex-shrink:0;" />

      <!-- ─── Requester (30%) ── -->
      <div :class="sidebar" style="width:30%; min-width:0;">
        <MpFlex direction="column" gap="5">
          <!-- Avatar + name -->
          <MpFlex align="center" gap="3">
            <div :class="avatarCircle">{{ initials(CLAIM.requester.name) }}</div>
            <MpFlex direction="column" gap="0.5" style="min-width:0;">
              <MpText weight="semiBold" style="font-size:16px; line-height:24px;">{{ CLAIM.requester.name }}</MpText>
              <MpText color="gray.600" style="font-size:14px; line-height:20px;">{{ CLAIM.requester.code }}</MpText>
            </MpFlex>
          </MpFlex>

          <!-- Icon detail rows -->
          <MpFlex direction="column" gap="3">
            <MpFlex align="flex-start" gap="2.5">
              <MpIcon name="briefcase" size="sm" :class="iconGray" style="flex-shrink:0; margin-top:2px;" />
              <MpText class="requester-value" style="font-size:14px; line-height:20px;">{{ CLAIM.requester.role }}</MpText>
            </MpFlex>
            <MpFlex align="flex-start" gap="2.5">
              <MpIcon name="location" size="sm" :class="iconGray" style="flex-shrink:0; margin-top:2px;" />
              <MpText class="requester-value" style="font-size:14px; line-height:20px;">{{ CLAIM.requester.unit }}</MpText>
            </MpFlex>
            <MpFlex align="flex-start" gap="2.5">
              <MpIcon name="envelope" size="sm" :class="iconGray" style="flex-shrink:0; margin-top:2px;" />
              <MpTextlink
                size="body-small"
                @click="() => {}"
                class="requester-email"
                style="cursor:pointer; font-size:14px !important;"
              >{{ CLAIM.requester.email }}</MpTextlink>
            </MpFlex>
            <MpFlex align="flex-start" gap="2.5">
              <MpIcon name="phone" size="sm" :class="iconGray" style="flex-shrink:0; margin-top:2px;" />
              <MpText class="requester-value" style="font-size:14px; line-height:20px;">{{ CLAIM.requester.phone }}</MpText>
            </MpFlex>
          </MpFlex>
        </MpFlex>
      </div>

    </MpFlex>

    <!-- ═════ Reimbursement items (full width) ═════ -->
    <div :class="card">
      <MpFlex direction="column" gap="0.5" style="margin-bottom:16px;">
        <MpText as="h2" weight="semiBold" style="font-size:16px; line-height:24px;">Reimbursement items</MpText>
        <MpText color="gray.600" style="font-size:14px; line-height:20px;">Details of expenses submitted for reimbursement, outlining each item and its cost.</MpText>
      </MpFlex>
      <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; min-width:620px;">
              <thead>
                <tr>
                  <th :class="th">Subcategory</th>
                  <th :class="th">Vendor</th>
                  <th :class="th" style="min-width:200px;">Description</th>
                  <th :class="th">Attachments</th>
                  <th :class="thRight">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in items" :key="item.id">
                  <td :class="td">{{ item.subcategory }}</td>
                  <td :class="td">{{ item.vendor }}</td>
                  <td :class="td">{{ item.description }}</td>
                  <td :class="td">
                    <MpFlex direction="column" gap="1" style="min-width:0;">
                      <MpTextlink
                        v-for="file in item.files"
                        :key="file"
                        size="body-small"
                        :title="file"
                        @click="() => {}"
                        style="cursor:pointer; white-space:nowrap;"
                      >{{ file }}</MpTextlink>
                    </MpFlex>
                  </td>
                  <!-- Amount with exchange-rate tooltip -->
                  <td :class="tdRight">
                    <MpTooltip placement="top" use-portal>
                      <MpFlex align="center" gap="1" style="justify-content:flex-end; cursor:help; white-space:nowrap;">
                        <span>{{ formatForeign(item.foreignAmount) }}</span>
                        <MpIcon name="info" size="sm" :class="css({ color: 'gray.400' })" style="flex-shrink:0;" />
                      </MpFlex>
                      <template #label>
                        <div style="text-align:center;">
                          <p>{{ formatRp(item.amountRp) }}</p>
                          <p>1 {{ CLAIM.currency }} = Rp{{ CLAIM.exchangeRate }}</p>
                          <p>Rate might change periodically</p>
                        </div>
                      </template>
                    </MpTooltip>
                  </td>
                </tr>

                <!-- Total row -->
                <tr>
                  <td :class="td" colspan="4">
                    <MpText weight="semiBold" style="font-size:14px; line-height:20px;">Total {{ CLAIM.transactionType }} amount</MpText>
                  </td>
                  <td :class="tdRight" style="vertical-align:middle;">
                    <MpTooltip placement="top" use-portal>
                      <MpFlex align="center" gap="1" style="justify-content:flex-end; cursor:help; white-space:nowrap;">
                        <MpText weight="semiBold" style="font-size:14px; white-space:nowrap;">{{ formatForeign(totalForeign) }}</MpText>
                        <MpIcon name="info" size="sm" :class="css({ color: 'gray.400' })" style="flex-shrink:0;" />
                      </MpFlex>
                      <template #label>
                        <div style="text-align:center;">
                          <p>{{ formatRp(totalRp) }}</p>
                          <p>1 {{ CLAIM.currency }} = Rp{{ CLAIM.exchangeRate }}</p>
                          <p>Rate might change periodically</p>
                        </div>
                      </template>
                    </MpTooltip>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Tabs: Request history | Discussions (Pixel MpTabs) ── -->
        <div :class="card">
          <MpTabs id="claim-tabs" v-model="currentTab" is-manual>
            <MpTabList>
              <MpTab>Request history</MpTab>
              <MpTab>Discussions</MpTab>
            </MpTabList>

            <MpTabPanels>
              <!-- Request history — Pixel timeline -->
              <MpTabPanel>
                <MpTimeline>
                  <MpTimelineItem
                    v-for="(event, i) in REQUEST_HISTORY"
                    :key="i"
                    :status="event.status"
                  >
                    <MpTimelineTitle>
                      <MpText font-size="md" line-height="md" weight="semiBold">{{ event.action }}</MpText>
                    </MpTimelineTitle>
                    <MpTimelineCaption>{{ event.actor }} · {{ event.date }}</MpTimelineCaption>
                  </MpTimelineItem>
                </MpTimeline>
              </MpTabPanel>

              <!-- Discussions — empty -->
              <MpTabPanel>
                <MpFlex direction="column" align="center" justify="center" style="padding:32px 0; gap:8px;">
                  <MpText color="gray.600" style="font-size:14px; line-height:20px;">No discussions yet.</MpText>
                </MpFlex>
              </MpTabPanel>
            </MpTabPanels>
          </MpTabs>
        </div>

    <!-- ═════ Footer actions (full width) ═════ -->
    <MpFlex justify="flex-end" gap="3" style="padding-bottom:8px;">
      <MpButton variant="secondary" size="md">Reject request</MpButton>
      <MpButton variant="primary" size="md">Approve request</MpButton>
    </MpFlex>

  </MpFlex>

  <!-- ═════ Edit item drawer ═════ -->
  <MpDrawer
    :is-open="isDrawerOpen"
    @close="isDrawerOpen = false"
    is-block-scroll-on-mount
    placement="right"
    size="md"
  >
    <MpDrawerOverlay />
    <MpDrawerContent>
      <MpDrawerHeader>
        <MpText weight="semiBold" style="font-size:16px; line-height:24px;">Edit item</MpText>
        <MpDrawerCloseButton />
      </MpDrawerHeader>

      <MpDrawerBody>
        <MpFlex direction="column" gap="4">

          <!-- Subcategory — locked for international claims -->
          <div :class="fieldGroup">
            <span :class="fieldLabel">
              Subcategory <span :class="fieldReq">*</span>
            </span>
            <MpAutocomplete
              id="edit-subcategory"
              v-model="draft.subcategory"
              :data="CLAIM.subcategories"
              placeholder="Select subcategory"
              :is-disabled="CLAIM.isInternational"
            />
            <MpText v-if="CLAIM.isInternational" size="body-small" color="gray.600">
              Subcategory cannot be changed for international claims.
            </MpText>
          </div>

          <!-- Vendor -->
          <div :class="fieldGroup">
            <span :class="fieldLabel">Vendor <span :class="fieldReq">*</span></span>
            <MpInput
              id="edit-vendor"
              v-model="draft.vendor"
              placeholder="e.g. Silverbird"
              :isFullWidth="true"
            />
          </div>

          <!-- Amount -->
          <div :class="fieldGroup">
            <span :class="fieldLabel">Amount <span :class="fieldReq">*</span></span>
            <MpInputGroup>
              <MpInputLeftAddon has-background>
                <MpText style="font-size:14px; line-height:20px;">Rp</MpText>
              </MpInputLeftAddon>
              <MpInput
                id="edit-amount"
                v-model="draft.amountStr"
                placeholder="0"
                :isFullWidth="true"
              />
            </MpInputGroup>
          </div>

          <!-- Description -->
          <div :class="fieldGroup">
            <span :class="fieldLabel">Description</span>
            <MpTextarea
              id="edit-description"
              v-model="draft.description"
              placeholder="Add a description"
              :maxlength="200"
              :isFullWidth="true"
            />
          </div>

          <!-- Attachment -->
          <div :class="fieldGroup">
            <span :class="fieldLabel">Attachment <span :class="fieldReq">*</span></span>
            <div style="border:1px solid var(--mp-colors-border-form, rgba(29,31,36,.16)); border-radius:6px; padding:12px; display:flex; flex-direction:column; gap:8px;">
              <MpButton variant="secondary" size="sm" left-icon="upload" style="align-self:flex-start;">Browse file</MpButton>
              <MpText size="body-small" color="gray.600">
                File must be in JPG, JPEG, PNG, and PDF with a maximum of 10 MB.
              </MpText>
              <MpFlex v-if="draft.files.length" direction="column" gap="1" style="margin-top:4px;">
                <div v-for="(file, fi) in draft.files" :key="fi" :class="fileRow">
                  <MpFlex align="center" gap="2">
                    <MpIcon name="document" size="sm" :class="css({ color: 'gray.500' })" />
                    <MpText size="body-small" color="dark">{{ file }}</MpText>
                  </MpFlex>
                  <MpButton
                    variant="ghost"
                    size="sm"
                    left-icon="minus-circle"
                    :aria-label="`Remove ${file}`"
                    @click="removeFile(fi)"
                  />
                </div>
              </MpFlex>
            </div>
          </div>

          <!-- Reason -->
          <div :class="fieldGroup">
            <span :class="fieldLabel">Reason <span :class="fieldReq">*</span></span>
            <MpTextarea
              id="edit-reason"
              v-model="draft.reason"
              placeholder="Explain the reason for editing this item"
              :maxlength="200"
              :isFullWidth="true"
            />
          </div>

        </MpFlex>
      </MpDrawerBody>

      <MpDrawerFooter>
        <MpFlex justify="flex-end" gap="3" width="full">
          <MpButton variant="ghost" @click="isDrawerOpen = false">Cancel</MpButton>
          <MpButton variant="primary" @click="saveItem">Save changes</MpButton>
        </MpFlex>
      </MpDrawerFooter>
    </MpDrawerContent>
  </MpDrawer>
</template>

<style scoped>
.kv-grid-main {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  row-gap: 20px;
}
/* MpTextlink renders as a button that defaults to white-space:nowrap —
   force the email to wrap so it can't push its column wider than the card */
.requester-email {
  white-space: normal !important;
  word-break: break-all;
  text-align: left;
  max-width: 100%;
}
/* Long unbreakable values (e.g. phone number) wrap instead of overflowing */
.requester-value {
  min-width: 0;
  overflow-wrap: anywhere;
}
</style>
