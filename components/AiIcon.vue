<!--
  AiIcon — Mekari AI / Airene sparkle icon
  Pixel built-in `MpIcon name="airene-brand"`, recolored to the
  Color/Icon/brand token (var(--mp-colors-icon-brand), #4b61dc).

  The airene-brand glyph ships with a hardcoded #651FFF fill, so the
  brand color is applied by overriding the path fill (the icon ignores
  the usual --mp-icon-color var).

  Usage:
    <AiIcon />            → sm (default)
    <AiIcon size="md" />
-->
<script setup lang="ts">
import { MpIcon } from '@mekari/pixel3'

withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg' | 'xl'
}>(), { size: 'sm' })
</script>

<template>
  <MpIcon name="airene-brand" :size="size" class="ai-icon-brand" />
</template>

<style>
.ai-icon-brand path {
  fill: var(--mp-colors-icon-brand) !important;
}
</style>
