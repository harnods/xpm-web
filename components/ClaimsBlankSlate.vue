<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — Claims blank slate
  Source     : Figma z9nzcdQ9jpiGqafP4vvHed
               · first-time → 4396-122179 ("Blank Categories", No data folder · 414:13409)
               · not-found  → 76:9397 ("Not Found", magnifying glass · 414:13413)
  Token mode : Pixel 2.4
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Two illustrated variants:
    - first-time : no data ever created           → folder illustration
    - not-found  : search/filter returned nothing → magnifying-glass illustration
  Both centered inside the table body; header row stays visible above.
  Assets live in /public/images (exported from the Figma "No data" / "Not found" assets).
-->
<script setup lang="ts">
import { MpFlex, MpText } from '@mekari/pixel3'

withDefaults(defineProps<{
  title: string
  description: string
  variant?: 'first-time' | 'not-found'
}>(), { variant: 'first-time' })

const ILLUSTRATION: Record<'first-time' | 'not-found', string> = {
  'first-time': '/images/empty-no-data.png',
  'not-found':  '/images/empty-not-found.png',
}
</script>

<template>
  <MpFlex direction="column" align="center" justify="center" gap="1"
          style="padding-top:40px; padding-bottom:40px; width:100%;">

    <!-- Colored 3D illustration (Figma asset), 288×240 per design -->
    <img :src="ILLUSTRATION[variant]" alt="" width="288" height="240"
         style="width:288px; height:240px; object-fit:contain; margin-bottom:8px;" />

    <!-- Title — H3 16/24, Color/Text/default -->
    <MpText weight="semiBold" color="dark" style="font-size:16px; line-height:24px;">
      {{ title }}
    </MpText>

    <!-- Helper — 14/20, Color/Text/secondary, centered, wraps within ~376px -->
    <MpText color="gray.600" style="font-size:14px; line-height:20px; text-align:center; max-width:376px;">
      {{ description }}
    </MpText>

  </MpFlex>
</template>
