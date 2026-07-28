<script setup lang="ts">
import { MpFlex, MpText, MpIcon, css, cx, token } from '@mekari/pixel3'

interface NavChild { label: string; path: string }
interface NavGroup { title: string; children: NavChild[] }
interface NavItem {
  icon: string
  label: string
  path?: string
  children?: NavChild[]
  groups?: NavGroup[]
}

const group1: NavItem[] = [
  { icon: 'home', label: 'Home', path: '/' },
  { icon: 'reports', label: 'Reports', path: '/reports' },
]

const group2: NavItem[] = [
  { icon: 'wallet', label: 'Accounts', path: '/accounts' },
  { icon: 'log', label: 'Transactions', path: '/transactions' },
  { icon: 'finance', label: 'Budgeting', path: '/budgeting' },
]

const group3: NavItem[] = [
  {
    icon: 'expenses', label: 'Purchasing',
    children: [
      { label: 'Purchases', path: '/purchasing/purchases' },
      { label: 'Products', path: '/purchasing/products' },
      { label: 'Warehouses', path: '/purchasing/warehouses' },
    ],
  },
  { icon: 'voucher', label: 'Trips', path: '/trips' },
  { icon: 'protection', label: 'Claims', path: '/claims' },
  { icon: 'billing', label: 'Cards', path: '/cards' },
]

const group4: NavItem[] = [
  { icon: 'reimbursement', label: 'My claims', path: '/my-claims' },
  { icon: 'business-trip', label: 'My trips', path: '/my-trip' },
]

const group5: NavItem[] = [
  {
    icon: 'settings', label: 'Settings',
    children: [
      { label: 'Users', path: '/settings/users' },
      { label: 'Vendors', path: '/settings/vendors' },
      { label: 'Policy', path: '/settings/policy' },
      { label: 'Integration', path: '/settings/integration' },
    ],
  },
]

const allGroups = [group1, group2, group3, group4, group5]
const allItems = [...group1, ...group2, ...group3, ...group4, ...group5]

const route = useRoute()
const allChildren = (item: NavItem): NavChild[] =>
  item.children ?? item.groups?.flatMap(g => g.children) ?? []

const hasActiveChild = (item: NavItem) =>
  allChildren(item).some(c => route.path === c.path || route.path.startsWith(c.path + '/'))
const isItemActive = (item: NavItem) =>
  item.path
    ? route.path === item.path || route.path.startsWith(item.path + '/')
    : hasActiveChild(item)
const itemTarget = (item: NavItem) => item.path ?? allChildren(item)[0]?.path ?? '/'

const activeParent = computed<NavItem | undefined>(() => allItems.find(hasActiveChild))
const isSubmenuMode = computed(() => !!activeParent.value)

const isMainNavCollapsed = useState('sidebar-main-collapsed', () => false)
watch(isSubmenuMode, (open) => { isMainNavCollapsed.value = open }, { immediate: true })

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
  width: isPanelCollapsed.value ? '16px' : '240px',
  marginRight: isPanelCollapsed.value ? '16px' : '8px',
  borderColor: isPanelCollapsed.value ? token.var('colors.border.default') : 'transparent',
  boxShadow: isPanelCollapsed.value
    ? '6px 0 15px -3px rgba(0, 0, 0, 0.10) inset, 4px 0 6px -2px rgba(0, 0, 0, 0.05) inset'
    : 'none',
}))

/* ---------- styles ---------- */
const rootFull = css({ display: 'flex', flexDirection: 'column', w: '216px', h: '100%', flexShrink: 0 })
const rootRailOrSubmenu = css({ display: 'flex', flexDirection: 'row', h: '100%', flexShrink: 0, position: 'relative' })

const railBoxBase = { display: 'flex', flexDirection: 'column', w: '56px', h: '100%', flexShrink: 0 } as const
const railBoxSubmenu = css({
  ...railBoxBase, bg: 'background.surface', position: 'relative', zIndex: 1,
  borderRightWidth: '1px', borderRightStyle: 'solid', borderRightColor: 'border.default',
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
  display: 'flex', flexDirection: 'column', w: '240px', h: '100%', flexShrink: 0,
  transition: 'opacity 150ms ease',
})

const halfCircleExpand = css({
  position: 'absolute', bottom: '5', left: '72px', zIndex: 30,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  w: '24px', h: '36px', bg: 'background.neutral', color: 'text.secondary',
  borderTopWidth: '1px', borderRightWidth: '1px', borderBottomWidth: '1px',
  borderStyle: 'solid', borderColor: 'border.default',
  borderTopRightRadius: 'full', borderBottomRightRadius: 'full',
  boxShadow: 'sm', cursor: 'pointer',
  transition: 'opacity 150ms ease',
  _hover: { bg: 'background.neutral.hovered' },
})

const navGroup = css({
  display: 'flex', flexDirection: 'column', gap: '0.5', py: '2', px: '2',
})
const groupDivider = css({ marginInline: '3', height: '1px', background: 'border.default' })

const itemBase = {
  display: 'flex', alignItems: 'center', gap: '2', w: 'full', height: '36px', px: '3',
  border: 'none', borderRadius: 'md', cursor: 'pointer', textAlign: 'left',
  textDecoration: 'none',
  transition: 'background-color 120ms ease',
  fontFamily: 'body', fontSize: 'md', lineHeight: 'lg',
} as const
const itemDefault = css({ ...itemBase, bg: 'transparent', color: 'text.default', fontWeight: 'regular', _hover: { bg: 'background.neutral.hovered' } })
const itemActive = css({ ...itemBase, bg: 'background.brand.selected', color: 'text.link', fontWeight: 'semiBold', _hover: { bg: 'background.brand.selected' } })
const itemLabel = css({ flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })

const railGroup = css({
  display: 'flex', flexDirection: 'column', gap: '0.5', py: '2', w: 'full',
})
const railBase = {
  display: 'flex', alignItems: 'center', justifyContent: 'flex-start', w: 'full', h: '36px', pl: '4',
  border: 'none', borderRadius: 'md', cursor: 'pointer', flexShrink: 0,
  textDecoration: 'none',
  transition: 'background-color 120ms ease',
} as const
const railDefault = css({ ...railBase, bg: 'transparent', color: 'text.default', _hover: { bg: 'background.neutral.hovered' } })
const railActive = css({ ...railBase, bg: 'background.brand.selected', _hover: { bg: 'background.brand.selected' } })

const childBase = {
  display: 'flex', alignItems: 'center', w: 'full', minHeight: '36px', px: '3', py: '2',
  border: 'none', cursor: 'pointer', borderRadius: 'md',
  textDecoration: 'none',
  fontFamily: 'body', fontSize: 'md', lineHeight: 'md',
  transition: 'background-color 120ms ease',
} as const
const childDefault = css({ ...childBase, bg: 'transparent', color: 'text.default', fontWeight: 'regular', _hover: { bg: 'background.surface' } })
const childActive = css({ ...childBase, bg: 'background.brand.selected', color: 'text.link', fontWeight: 'semiBold', _hover: { bg: 'background.brand.selected' } })

const ghostBtn = css({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', w: '36px', h: '36px',
  border: 'none', bg: 'transparent', borderRadius: 'md', cursor: 'pointer', flexShrink: 0, color: 'text.secondary',
  transition: 'background-color 120ms ease', _hover: { bg: 'background.neutral.hovered' },
})

const sectionTitle = css({
  display: 'flex', alignItems: 'center', h: '36px', mt: '4', px: '3',
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

      <MpFlex align="center" gap="0.5" paddingInline="3" height="68px" borderTop="1px solid" borderTopColor="border.default" flexShrink="0">
        <button type="button" :class="ghostBtn"
          :aria-label="`Collapse sidebar (${shortcutLabel})`"
          :title="`Collapse sidebar · ${shortcutLabel}`"
          @click="isMainNavCollapsed = true"
        >
          <MpIcon name="chevrons-left" />
        </button>
        <MpText as="span" size="body-small" color="text.secondary">Company ID : 102938</MpText>
      </MpFlex>
    </template>

    <!-- ============ RAIL + SUBMENU ============ -->
    <template v-else>
      <div :class="mode === 'submenu' ? railBoxSubmenu : railBoxOnly">
        <MpFlex direction="column" flex="1" paddingInline="1" overflowY="auto" overflowX="hidden" minHeight="0">
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

        <MpFlex v-if="mode === 'rail'" align="center" justify="center" height="68px" flexShrink="0" borderTop="1px solid" borderTopColor="border.default">
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
          <MpFlex direction="column" gap="0.5" flex="1" paddingInline="2" overflowY="auto" minHeight="0">
            <div v-if="!activeParent?.groups" :class="sectionTitle">{{ activeParent?.label }}</div>
            <template v-if="activeParent?.groups">
              <template v-for="(group, gi) in activeParent.groups" :key="group.title">
                <div v-if="gi > 0" style="height:1px;background:var(--mp-colors-gray-100);margin:4px 4px;" />
                <div :class="sectionTitle">{{ group.title }}</div>
                <NuxtLink
                  v-for="child in group.children"
                  :key="child.path"
                  :to="child.path"
                  :class="(route.path === child.path || route.path.startsWith(child.path + '/')) ? childActive : childDefault"
                  :aria-current="(route.path === child.path || route.path.startsWith(child.path + '/')) ? 'page' : undefined"
                >
                  {{ child.label }}
                </NuxtLink>
              </template>
            </template>
            <template v-else>
              <NuxtLink
                v-for="child in activeParent?.children"
                :key="child.path"
                :to="child.path"
                :class="(route.path === child.path || route.path.startsWith(child.path + '/')) ? childActive : childDefault"
                :aria-current="(route.path === child.path || route.path.startsWith(child.path + '/')) ? 'page' : undefined"
              >
                {{ child.label }}
              </NuxtLink>
            </template>
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
