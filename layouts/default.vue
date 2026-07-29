<script setup lang="ts">
import { MpFlex, MpText, css } from '@mekari/pixel3'

const tabsSlot = css({ lineHeight: '0' })

const route = useRoute()
const pageTitle = computed(() => (route.meta.title as string) || 'Page Title')
const breadcrumbParent = computed(() => (route.meta.breadcrumbParent as any)?.path ? (route.meta.breadcrumbParent as any) : null)

// Mirror sidebar state to compute width for toast centering
const isMainNavCollapsed = useState('sidebar-main-collapsed', () => false)
const isPanelCollapsed   = useState('sidebar-panel-collapsed', () => false)

// Static nav children paths to detect submenu mode (mirrors AppSidebar logic)
const SUBMENU_PATHS = [
  '/purchasing/', '/settings/',
]
const isSubmenu = computed(() => SUBMENU_PATHS.some(p => route.path.startsWith(p)))

const sidebarWidth = computed(() => {
  if (isSubmenu.value) return 56 + (isPanelCollapsed.value ? 16 : 240) // rail + panel
  return isMainNavCollapsed.value ? 56 : 216                            // rail or full
})

// Expose sidebar width to the root so the toast CSS rule can read it
if (import.meta.client) {
  watchEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', `${sidebarWidth.value}px`)
  })
}
</script>

<template>
  <MpFlex direction="column" height="100vh" background="background.surface" :style="`--sidebar-w: ${sidebarWidth}px`">
    <AppHeader />

    <MpFlex flex="1" minHeight="0">
      <AppSidebar />

      <MpFlex as="main" direction="column" flex="1" minWidth="0" overflowY="auto">
        <!-- Title bar — single element, always renders #layout-header-actions -->
        <MpFlex
          align="center"
          justify="space-between"
          :height="breadcrumbParent ? '100px' : '72px'"
          paddingInline="6"
          flexShrink="0"
        >
          <MpFlex direction="column" justify="center" gap="1">
            <NuxtLink
              v-if="breadcrumbParent"
              :to="breadcrumbParent.path"
              class="mp-td_none mp-c_text.link hover:mp-c_blue.500"
            >
              <MpText as="span" size="body" weight="regular" color="text.link">
                {{ breadcrumbParent.label }}
              </MpText>
            </NuxtLink>
            <MpFlex align="center" gap="2">
              <MpText as="h1" size="h1" weight="semiBold" color="text.default">
                {{ pageTitle }}
              </MpText>
              <div id="layout-title-suffix" />
            </MpFlex>
          </MpFlex>
          <div id="layout-header-actions" />
        </MpFlex>

        <!-- Optional tabs strip (filled via Teleport from pages) -->
        <!-- line-height:0 collapses the anonymous block box created by empty text nodes from Teleport -->
        <div id="layout-tabs" :class="tabsSlot" />

        <!-- Stage: white sheet, rounded top-left, top + left border only. -->
        <MpFlex
          direction="column"
          flex="1"
          background="background.neutral"
          paddingInline="6"
          paddingBlock="6"
          borderTopLeftRadius="md"
          borderTop="1px solid"
          borderTopColor="border.default"
          borderLeft="1px solid"
          borderLeftColor="border.default"
        >
          <slot />
        </MpFlex>
      </MpFlex>
    </MpFlex>
  </MpFlex>
</template>
