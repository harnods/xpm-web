<script setup lang="ts">
import { MpFlex, MpText, MpIcon, css, cx, token } from '@mekari/pixel3'

interface NavChild { label: string; path: string }
interface NavItem {
  icon: string
  label: string
  path?: string
  children?: NavChild[]
}

const group1: NavItem[] = [
  { icon: 'home', label: 'Home', path: '/' },
  { icon: 'wallet', label: 'Accounts', path: '/accounts' },
  {
    icon: 'log', label: 'Transactions',
    children: [
      { label: 'Claims', path: '/transactions/claims' },
      { label: 'Benefit reimbursements', path: '/transactions/benefit-reimbursements' },
      { label: 'Trips', path: '/transactions/trips' },
      { label: 'Virtual cards', path: '/transactions/virtual-cards' },
      { label: 'Physical cards', path: '/transactions/physical-cards' },
      { label: 'Purchases', path: '/transactions/purchases' },
    ],
  },
  {
    icon: 'expense', label: 'Purchasing',
    children: [
      { label: 'Purchases', path: '/purchasing/purchases' },
      { label: 'Products', path: '/purchasing/products' },
      { label: 'Vendors', path: '/purchasing/vendors' },
      { label: 'Warehouses', path: '/purchasing/warehouses' },
    ],
  },
  { icon: 'finance', label: 'Balances', path: '/balance' },
]

const group2: NavItem[] = [
  {
    icon: 'protection', label: 'Approvals',
    children: [
      { label: 'Claims', path: '/approval/claims' },
      { label: 'Trips', path: '/approval/trips' },
      { label: 'Purchases', path: '/approval/purchases' },
    ],
  },
  { icon: 'voucher', label: 'Travel arrangements', path: '/travel-arrangement' },
  { icon: 'reimbursement', label: 'My expenses', path: '/my-expense' },
  { icon: 'business-trip', label: 'My trips', path: '/my-trip' },
  { icon: 'billing', label: 'My cards', path: '/my-card' },
]

const group3: NavItem[] = [
  { icon: 'employee', label: 'Users', path: '/users' },
  {
    icon: 'policy', label: 'Policies',
    children: [
      { label: 'Claims', path: '/policies/claims' },
      { label: 'Trips', path: '/policies/trips' },
    ],
  },
  {
    icon: 'billing', label: 'Cards',
    children: [
      { label: 'Virtual cards', path: '/cards/virtual-cards' },
      { label: 'Physical cards', path: '/cards/physical-cards' },
    ],
  },
  {
    icon: 'workflow', label: 'Workflows',
    children: [
      { label: 'Claims', path: '/workflows/claims' },
      { label: 'Trips', path: '/workflows/trips' },
      { label: 'Purchases', path: '/workflows/purchases' },
      { label: 'Expenses', path: '/workflows/expenses' },
    ],
  },
  {
    icon: 'application', label: 'Integrations',
    children: [
      { label: 'Add-ons', path: '/integrations/add-ons' },
      { label: 'Sync to Jurnal', path: '/integrations/sync-to-jurnal' },
    ],
  },
  {
    icon: 'settings', label: 'Settings',
    children: [
      { label: 'Custom fields', path: '/settings/custom-fields' },
      { label: 'Virtual card credits', path: '/settings/virtual-card-credits' },
      { label: 'OCR credits', path: '/settings/ocr-credits' },
      { label: 'Purchase request access', path: '/settings/purchase-request-access' },
      { label: 'Scheduler', path: '/settings/scheduler' },
    ],
  },
]

const allGroups = [group1, group2, group3]
const allItems = [...group1, ...group2, ...group3]

const route = useRoute()
const hasActiveChild = (item: NavItem) =>
  !!item.children?.some(c => route.path === c.path || route.path.startsWith(c.path + '/'))
const isItemActive = (item: NavItem) =>
  item.path ? route.path === item.path : hasActiveChild(item)
const itemTarget = (item: NavItem) => item.path ?? item.children?.[0]?.path ?? '/'

const activeParent = computed<NavItem | undefined>(() => allItems.find(hasActiveChild))
const isSubmenuMode = computed(() => !!activeParent.value)

const isMainNavCollapsed = useState('sidebar-main-collapsed', () => false)
watch(isSubmenuMode, (open) => { if (open) isMainNavCollapsed.value = true }, { immediate: true })

const isPanelCollapsed = useState('sidebar-panel-collapsed', () => false)

const mode = computed<'full' | 'rail' | 'submenu'>(() =>
  activeParent.value ? 'submenu' : (isMainNavCollapsed.value ? 'rail' : 'full'),
)

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const shortcutLabel = isMac ? '⌘B' : 'Ctrl+B'
const onKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'b') {
    e.preventDefault()
    isMainNavCollapsed.value = !isMainNavCollapsed.value
  }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

const panelStyle = computed(() => ({
  width: isPanelCollapsed.value ? '16px' : '208px',
  marginRight: isPanelCollapsed.value ? '16px' : '8px',
  borderColor: isPanelCollapsed.value ? token.var('colors.gray.100') : 'transparent',
  boxShadow: isPanelCollapsed.value
    ? '6px 0 15px -3px rgba(0, 0, 0, 0.10) inset, 4px 0 6px -2px rgba(0, 0, 0, 0.05) inset'
    : 'none',
}))

/* ---------- styles ---------- */
const rootFull = css({ display: 'flex', flexDirection: 'column', w: '216px', h: '100%', flexShrink: 0 })
const rootRailOrSubmenu = css({ display: 'flex', flexDirection: 'row', h: '100%', flexShrink: 0, position: 'relative' })

const railBoxBase = { display: 'flex', flexDirection: 'column', w: '56px', h: '100%', flexShrink: 0 } as const
const railBoxSubmenu = css({
  ...railBoxBase, bg: 'ash.100', position: 'relative', zIndex: 1,
  borderRightWidth: '1px', borderRightStyle: 'solid', borderRightColor: 'gray.100',
})
const railBoxOnly = css({ ...railBoxBase, bg: 'transparent' })

const panelBase = css({
  display: 'flex', flexDirection: 'column', h: '100%', flexShrink: 0,
  overflow: 'hidden', boxSizing: 'border-box',
  borderLeftWidth: '1px', borderRightWidth: '1px', borderStyle: 'solid',
  transitionProperty: 'width, margin-right, border-color, box-shadow',
  transitionDuration: '200ms', transitionTimingFunction: 'ease',
})
const panelInner = css({
  display: 'flex', flexDirection: 'column', w: '208px', h: '100%', flexShrink: 0,
  transition: 'opacity 150ms ease',
})

const halfCircleExpand = css({
  position: 'absolute', bottom: '5', left: '72px', zIndex: 30,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  w: '24px', h: '36px', bg: 'white', color: 'gray.600',
  borderTopWidth: '1px', borderRightWidth: '1px', borderBottomWidth: '1px',
  borderStyle: 'solid', borderColor: 'gray.100',
  borderTopRightRadius: 'full', borderBottomRightRadius: 'full',
  boxShadow: 'sm', cursor: 'pointer',
  transition: 'opacity 150ms ease',
  _hover: { bg: 'gray.50' },
})

const navGroup = css({
  display: 'flex', flexDirection: 'column', gap: '0.5', py: '2', px: '2',
})
const groupDivider = css({ marginInline: '3', height: '1px', background: 'gray.100' })

const itemBase = {
  display: 'flex', alignItems: 'center', gap: '2', w: 'full', height: '36px', px: '3',
  border: 'none', borderRadius: 'md', cursor: 'pointer', textAlign: 'left',
  textDecoration: 'none',
  transition: 'background-color 120ms ease',
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg',
} as const
const itemDefault = css({ ...itemBase, bg: 'transparent', color: 'dark', fontWeight: 'regular', _hover: { bg: 'gray.50' } })
const itemActive = css({ ...itemBase, bg: 'background.brand.selected', color: 'text.link', fontWeight: 'semiBold', _hover: { bg: 'background.brand.selected' } })
const itemLabel = css({ flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })

const railGroup = css({
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5', py: '2', w: 'full',
})
const railBase = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', w: '40px', h: '36px',
  border: 'none', borderRadius: 'md', cursor: 'pointer', flexShrink: 0,
  textDecoration: 'none',
  transition: 'background-color 120ms ease',
} as const
const railDefault = css({ ...railBase, bg: 'transparent', color: 'dark', _hover: { bg: 'gray.50' } })
const railActive = css({ ...railBase, bg: 'background.brand.selected', _hover: { bg: 'background.brand.selected' } })

const childBase = {
  display: 'flex', alignItems: 'center', w: 'full', height: '36px', px: '3',
  border: 'none', cursor: 'pointer', borderRadius: 'md',
  textDecoration: 'none',
  fontFamily: 'body', fontSize: 'md', lineHeight: 'md',
  transition: 'background-color 120ms ease',
} as const
const childDefault = css({ ...childBase, bg: 'transparent', color: 'dark', fontWeight: 'regular', _hover: { bg: 'ash.100' } })
const childActive = css({ ...childBase, bg: 'background.brand.selected', color: 'text.link', fontWeight: 'semiBold', _hover: { bg: 'background.brand.selected' } })

const ghostBtn = css({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', w: '36px', h: '36px',
  border: 'none', bg: 'transparent', borderRadius: 'md', cursor: 'pointer', flexShrink: 0, color: 'gray.600',
  transition: 'background-color 120ms ease', _hover: { bg: 'gray.100' },
})

const sectionTitle = css({
  display: 'flex', alignItems: 'center', h: '36px', mt: '4', px: '4',
  fontSize: 'sm', fontWeight: 'semiBold', letterSpacing: 'wider',
  textTransform: 'uppercase', color: 'text.link', whiteSpace: 'nowrap',
})

const itemClassFull = (item: NavItem) => cx(isItemActive(item) ? itemActive : itemDefault)
const itemClassRail = (item: NavItem) => cx(isItemActive(item) ? railActive : railDefault)
</script>

<template>
  <aside :class="mode === 'full' ? rootFull : rootRailOrSubmenu">
    <!-- ============ FULL MODE ============ -->
    <template v-if="mode === 'full'">
      <MpFlex as="nav" direction="column" flex="1" overflowY="auto" overflowX="hidden" minHeight="0" aria-label="Main">
        <template v-for="(group, gi) in allGroups" :key="gi">
          <div v-if="gi > 0" :class="groupDivider" />
          <div :class="navGroup" :style="gi === 0 ? { paddingTop: '16px' } : {}">
            <NuxtLink
              v-for="item in group"
              :key="item.label"
              :to="itemTarget(item)"
              :class="itemClassFull(item)"
              :aria-current="isItemActive(item) ? 'page' : undefined"
            >
              <PxIcon :name="item.icon" :size="20" :variant="isItemActive(item) ? 'fill' : 'outline'" :color="isItemActive(item) ? 'icon.brand' : ''" />
              <span :class="itemLabel">{{ item.label }}</span>
            </NuxtLink>
          </div>
        </template>
      </MpFlex>

      <MpFlex align="center" gap="0.5" paddingInline="3" height="68px" borderTop="1px solid" borderTopColor="gray.100" flexShrink="0">
        <button type="button" :class="ghostBtn"
          :aria-label="`Collapse sidebar (${shortcutLabel})`"
          :title="`Collapse sidebar · ${shortcutLabel}`"
          @click="isMainNavCollapsed = true"
        >
          <MpIcon name="chevrons-left" />
        </button>
        <MpText as="span" size="body-small" color="gray.600">Company ID : 102938</MpText>
      </MpFlex>
    </template>

    <!-- ============ RAIL + SUBMENU ============ -->
    <template v-else>
      <div :class="mode === 'submenu' ? railBoxSubmenu : railBoxOnly">
        <MpFlex direction="column" flex="1" align="center" paddingInline="1" overflowY="auto" overflowX="hidden" minHeight="0">
          <template v-for="(group, gi) in allGroups" :key="gi">
            <div v-if="gi > 0" :class="groupDivider" style="width: 40px" />
            <div :class="railGroup" :style="gi === 0 ? { paddingTop: '16px' } : {}">
              <NuxtLink
                v-for="item in group"
                :key="item.label"
                :to="itemTarget(item)"
                :class="itemClassRail(item)"
                :aria-label="item.label"
                :title="item.label"
              >
                <PxIcon :name="item.icon" :size="20" :variant="isItemActive(item) ? 'fill' : 'outline'" :color="isItemActive(item) ? 'icon.brand' : ''" />
              </NuxtLink>
            </div>
          </template>
        </MpFlex>

        <MpFlex v-if="mode === 'rail'" align="center" justify="center" height="68px" flexShrink="0" borderTop="1px solid" borderTopColor="gray.100">
          <button type="button" :class="ghostBtn"
            :aria-label="`Expand sidebar (${shortcutLabel})`"
            :title="`Expand sidebar · ${shortcutLabel}`"
            @click="isMainNavCollapsed = false"
          >
            <MpIcon name="chevrons-right" />
          </button>
        </MpFlex>
      </div>

      <div v-if="mode === 'submenu'" :class="panelBase" :style="panelStyle">
        <div :class="panelInner" :style="{ opacity: isPanelCollapsed ? 0 : 1, pointerEvents: isPanelCollapsed ? 'none' : 'auto' }">
          <div :class="sectionTitle">{{ activeParent?.label }}</div>
          <MpFlex direction="column" gap="0.5" flex="1" paddingInline="2" overflowY="auto" minHeight="0">
            <NuxtLink
              v-for="child in activeParent?.children"
              :key="child.path"
              :to="child.path"
              :class="route.path === child.path ? childActive : childDefault"
              :aria-current="route.path === child.path ? 'page' : undefined"
            >
              {{ child.label }}
            </NuxtLink>
          </MpFlex>
          <MpFlex align="center" justify="flex-end" height="68px" paddingInline="3" flexShrink="0">
            <button type="button" :class="ghostBtn" aria-label="Collapse submenu" @click="isPanelCollapsed = true">
              <MpIcon name="chevrons-left" />
            </button>
          </MpFlex>
        </div>
      </div>

      <button
        v-if="mode === 'submenu'"
        type="button"
        :class="halfCircleExpand"
        :style="{ opacity: isPanelCollapsed ? 1 : 0, pointerEvents: isPanelCollapsed ? 'auto' : 'none' }"
        aria-label="Expand submenu"
        @click="isPanelCollapsed = false"
      >
        <MpIcon name="chevrons-right" size="sm" />
      </button>
    </template>
  </aside>
</template>
