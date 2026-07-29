<!--
  PageScaffold — placeholder card mirroring the reference prototype's
  undesigned screens (~/Downloads/Mekari.html). Pixel DT 2.4 tokens.
  Usage: <PageScaffold label="My approvals" />
-->
<script setup lang="ts">
import { MpFlex, MpText, css } from '@mekari/pixel3'

defineProps<{ label?: string }>()

const box = css({
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  gap: '2', textAlign: 'center', width: 'full', minHeight: '176px',
  px: '6', py: '10',
  bg: 'background.neutral', borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  borderRadius: 'lg',
})

const desc = css({ maxWidth: '460px' })
</script>

<template>
  <div :class="box">
    <MpText as="span" size="body" weight="semiBold" color="text.default">Scaffold</MpText>
    <MpText as="p" size="body" color="text.secondary" :class="desc">
      This page keeps the same shell, grouped nav and muted table language.
      Say “build {{ label || 'this page' }}” and I’ll design it next.
    </MpText>
  </div>
</template>
