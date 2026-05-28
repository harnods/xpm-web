<script setup lang="ts">
import { MpFlex, MpText, css, cx } from '@mekari/pixel3'

interface NavItem {
  icon: string
  label: string
  to: string
  children?: { label: string; to: string }[]
}

const group1: NavItem[] = [
  { icon: 'home', label: 'Home', to: '/' },
  { icon: 'wallet', label: 'Accounts', to: '/accounts' },
  { icon: 'log', label: 'Transactions', to: '/transactions' },
  { icon: 'finance', label: 'Balances', to: '/balance' },
]

const group2: NavItem[] = [
  { icon: 'protection', label: 'Approvals', to: '/approval' },
  { icon: 'voucher', label: 'Travel arrangements', to: '/travel-arrangement' },
  { icon: 'reimbursement', label: 'My expenses', to: '/my-expense' },
  { icon: 'business-trip', label: 'My trips', to: '/my-trip' },
  { icon: 'billing', label: 'My cards', to: '/my-card' },
]

const group3: NavItem[] = [
  { icon: 'employee', label: 'Users', to: '/users' },
  { icon: 'policy', label: 'Policies', to: '/policy' },
  { icon: 'billing', label: 'Cards', to: '/card' },
  { icon: 'workflow', label: 'Workflows', to: '/workflow' },
  { icon: 'calendar', label: 'Schedulers', to: '/scheduler' },
  { icon: 'application', label: 'Integrations', to: '/integrations' },
  { icon: 'settings', label: 'Settings', to: '/settings' },
]

const allGroups = [group1, group2, group3]

const route = useRoute()
const isActive = (item: { to: string }) => route.path === item.to
const matchesSection = (item: NavItem) =>
  route.path === item.to || route.path.startsWith(item.to + '/')

const activeSection = computed<NavItem | null>(() => {
  for (const group of allGroups) {
    for (const item of group) {
      if (item.children && matchesSection(item)) return item
    }
  }
  return null
})

const showSubPanel = computed(() => !!activeSection.value)

const userCollapsed = useState('sidebar-collapsed', () => false)
const toggleCollapse = () => (userCollapsed.value = !userCollapsed.value)

const railMode = computed(() => userCollapsed.value || showSubPanel.value)

const onKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'b') {
    e.preventDefault()
    toggleCollapse()
  }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const shortcutLabel = isMac ? '⌘B' : 'Ctrl+B'

const itemFull = css({
  display: 'flex', alignItems: 'center', gap: '2', paddingInline: '3',
  height: '36px', borderRadius: 'md', color: 'dark',
  fontFamily: 'body', fontSize: 'md', lineHeight: '3xl',
  textDecoration: 'none', cursor: 'pointer',
  '& [data-role="nav-icon"]': { display: 'inline-flex', alignItems: 'center', flexShrink: '0' },
  _hover: {
    color: 'blue.500',
    '& [data-role="nav-icon"] svg': { '--mp-icon-color': 'token(colors.blue.500) !important' },
  },
})

const itemRail = css({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '36px', height: '36px', borderRadius: 'md',
  color: 'dark', textDecoration: 'none', cursor: 'pointer',
  marginInline: 'auto',
  '& [data-role="nav-icon"]': { display: 'inline-flex', alignItems: 'center', flexShrink: '0' },
  _hover: {
    '& [data-role="nav-icon"] svg': { '--mp-icon-color': 'token(colors.blue.500) !important' },
  },
})

const itemActive = css({ bg: 'blue.100', color: 'blue.500', fontWeight: 'semiBold' })

const labelStyle = css({ whiteSpace: 'nowrap', transition: 'opacity 0.12s ease' })

const groupWrap = css({
  display: 'flex', flexDirection: 'column',
  marginInline: '2', gap: '0.5', paddingBlock: '2',
})

const divider = css({
  marginInline: '3', height: '1px', background: 'gray.100',
})

const itemClassFull = (item: NavItem) =>
  cx(itemFull, (isActive(item) || (item.children && matchesSection(item))) && itemActive)
const itemClassRail = (item: NavItem) =>
  cx(itemRail, (isActive(item) || (item.children && matchesSection(item))) && itemActive)
</script>

<template>
  <MpFlex
    as="aside"
    direction="row"
    flexShrink="0"
    height="100%"
    overflow="hidden"
    :style="{ width: showSubPanel ? '264px' : (userCollapsed ? '56px' : '216px'), transition: 'width 0.22s ease' }"
  >
    <!-- Main column -->
    <MpFlex
      direction="column"
      :width="showSubPanel ? '48px' : userCollapsed ? '56px' : '216px'"
      flexShrink="0"
      height="100%"
      :background="showSubPanel ? 'ash.100' : undefined"
      style="transition: width 0.22s ease"
    >
      <MpFlex as="nav" direction="column" flex="1" overflowY="auto" overflowX="hidden" aria-label="Main">
        <template v-for="(group, gi) in allGroups" :key="gi">
          <div v-if="gi > 0" :class="divider" />
          <div :class="groupWrap">
            <template v-if="!railMode">
              <NuxtLink
                v-for="item in group"
                :key="item.to"
                :to="item.to"
                :class="itemClassFull(item)"
                :aria-current="isActive(item) ? 'page' : undefined"
              >
                <span data-role="nav-icon">
                  <PxIcon
                    :name="item.icon"
                    :size="20"
                    :variant="isActive(item) ? 'fill' : 'outline'"
                    :color="isActive(item) ? 'text.brand' : ''"
                  />
                </span>
                <span :class="labelStyle">{{ item.label }}</span>
              </NuxtLink>
            </template>
            <template v-else>
              <NuxtLink
                v-for="item in group"
                :key="item.to"
                :to="item.to"
                :class="itemClassRail(item)"
                :aria-label="item.label"
                :title="item.label"
              >
                <span data-role="nav-icon">
                  <PxIcon
                    :name="item.icon"
                    :size="20"
                    :variant="isActive(item) ? 'fill' : 'outline'"
                    :color="isActive(item) ? 'text.brand' : ''"
                  />
                </span>
              </NuxtLink>
            </template>
          </div>
        </template>
      </MpFlex>

      <!-- Main footer · 68px -->
      <MpFlex
        v-if="!showSubPanel"
        align="center"
        :justify="railMode ? 'center' : 'flex-start'"
        gap="0.5"
        :paddingInline="railMode ? '0' : '3'"
        height="68px"
        borderTop="1px solid"
        borderTopColor="gray.100"
      >
        <button
          type="button"
          :class="css({
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px',
            background: 'transparent', border: 'none', borderRadius: 'md',
            cursor: 'pointer', color: 'gray.600', flexShrink: '0',
            _hover: { background: 'gray.100' },
          })"
          :aria-label="(userCollapsed ? 'Expand sidebar' : 'Collapse sidebar') + ` (${shortcutLabel})`"
          :title="(userCollapsed ? 'Expand sidebar' : 'Collapse sidebar') + ` · ${shortcutLabel}`"
          :aria-keyshortcuts="isMac ? 'Meta+B' : 'Control+B'"
          :aria-expanded="!userCollapsed"
          @click="toggleCollapse"
        >
          <PxIcon :name="userCollapsed ? 'arrow-expand' : 'arrow-collapse'" :size="20" />
        </button>

        <MpText v-if="!railMode" as="span" size="body-small" color="gray.600" :class="labelStyle">
          Company ID : 102938
        </MpText>
      </MpFlex>
    </MpFlex>
  </MpFlex>
</template>
