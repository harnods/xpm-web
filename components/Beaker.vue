<!--
  Beaker — Mekari Expense quota/credit status indicator
  Source: https://stackblitz.com/~/github.com/Pixel-Sandbox/pixel3-templates-patterns
          src/patterns/beaker/pages/beaker.vue
  Adapted: cva (@mekari/pixel3-styled-system) → computed inline styles (@mekari/pixel3)

  Visual anatomy:
    ┌──────────────────────────────────────┐
    │  [progress|icon]  label  value  ›   │
    └──────────────────────────────────────┘

  Props:
    variant       — 'transactional' | 'nonTransactional' | 'warning' | 'danger'
                    transactional   → white bg, gray border on hover
                    nonTransactional→ blue.50 bg, blue border on hover
                    warning         → orange.50 bg, orange border on hover
                    danger          → red.50 bg, red border on hover
    label         — main label text (e.g. "OCR credit")
    value         — bold value text (e.g. "239")
    progress      — 0–100 circular MpProgress value; shows progress ring if set
    progressColor — token color string for the ring (default 'lime.400')
    icon          — MpIcon name; used when progress is not set
    iconVariant   — MpIcon variant prop (default 'outline')
    as            — root element tag (default 'button')
-->
<script setup lang="ts">
import { MpProgress, MpIcon, MpText, css } from '@mekari/pixel3'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  as?:            string
  variant?:       'transactional' | 'nonTransactional' | 'warning' | 'danger'
  label?:         string
  value?:         string | number
  progress?:      number
  progressColor?: string
  icon?:          string
  iconVariant?:   string
}>(), {
  as:            'button',
  variant:       'transactional',
  label:         'Label',
  progressColor: 'lime.400',
  iconVariant:   'outline',
})

// ─── Color map ────────────────────────────────────────────────────────
const COLOR_MAP = {
  transactional:    { bg: 'white',                            hoverBorder: 'var(--mp-colors-gray-100)'   },
  nonTransactional: { bg: 'var(--mp-colors-blue-50)',         hoverBorder: 'var(--mp-colors-blue-400)'   },
  warning:          { bg: 'var(--mp-colors-orange-50)',       hoverBorder: 'var(--mp-colors-orange-400)' },
  danger:           { bg: 'var(--mp-colors-red-50)',          hoverBorder: 'var(--mp-colors-red-400)'    },
}

const colors = computed(() => COLOR_MAP[props.variant ?? 'transactional'])

// ─── CSS ──────────────────────────────────────────────────────────────
const base = css({
  display:    'flex',
  alignItems: 'center',
  gap:        '2',
  rounded:    'md',
  padding:    '2',
  border:     '1px solid transparent',
  transition: 'all 250ms',
  cursor:     'pointer',
  outline:    'none',
  _focusVisible: { boxShadow: 'focus' },
})
</script>

<template>
  <component
    :is="props.as"
    :class="base"
    :style="{
      background:   colors.bg,
      borderColor:  'transparent',
    }"
    v-bind="$attrs"
    @mouseover="($el as HTMLElement).style.borderColor = colors.hoverBorder"
    @mouseleave="($el as HTMLElement).style.borderColor = 'transparent'"
  >
    <!-- Left: circular progress OR icon -->
    <MpProgress
      v-if="props.progress !== undefined"
      :value="String(props.progress)"
      variant="circular"
      size="sm"
      :color="props.progressColor"
    />
    <MpIcon
      v-else-if="props.icon"
      :name="props.icon"
      :variant="props.iconVariant"
      size="sm"
    />

    <!-- Label + value -->
    <MpText>
      {{ props.label }}
      <MpText v-if="props.value !== undefined" as="span" weight="semiBold">
        {{ ' ' }}{{ props.value }}
      </MpText>
    </MpText>

    <!-- Trailing chevron -->
    <MpIcon name="chevrons-right" size="sm" />
  </component>
</template>
