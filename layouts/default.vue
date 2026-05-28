<script setup lang="ts">
import { MpFlex, MpText } from '@mekari/pixel3'

const route = useRoute()
const pageTitle = computed(() => (route.meta.title as string) || 'Page Title')
</script>

<template>
  <MpFlex direction="column" height="100vh" background="background">
    <AppHeader />

    <MpFlex flex="1" minHeight="0">
      <AppSidebar />

      <MpFlex as="main" direction="column" flex="1" minWidth="0">
        <!-- title bar 72px: no Pixel spacing token equivalent. -->
        <MpFlex align="center" height="72px" paddingInline="6">
          <MpText as="h1" size="h1" weight="semiBold" color="dark">
            {{ pageTitle }}
          </MpText>
        </MpFlex>

        <!-- Stage: white sheet, rounded top-left, top + left border only. -->
        <MpFlex
          direction="column"
          flex="1"
          overflowY="auto"
          background="white"
          paddingInline="6"
          paddingBlock="6"
          borderTopLeftRadius="md"
          borderTop="1px solid"
          borderTopColor="gray.100"
          borderLeft="1px solid"
          borderLeftColor="gray.100"
        >
          <slot />
        </MpFlex>
      </MpFlex>
    </MpFlex>
  </MpFlex>
</template>
