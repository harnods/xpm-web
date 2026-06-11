<!--
  SummaryBox — Mekari Expense statistic card
  Source: https://stackblitz.com/~/github.com/Pixel-Sandbox/pixel3-templates-patterns
          src/patterns/summary-box/components/SummaryBox.vue
  Adapted from sva (pixel3-styled-system) → css() (@mekari/pixel3) because
  @mekari/pixel3-styled-system is not installed in this project.

  ┌──────────────────────────────────────────┐
  │ [label]                      [badge?]    │  ← topContent (colored bg)
  ├──────────────────────────────────────────┤
  │ [caption]                [filter icon?] │
  │ [amount / h2]                            │  ← bottomContent (neutral bg)
  └──────────────────────────────────────────┘

  Props:
    as          — root element tag (default 'div')
    id          — forwarded to root
    variant     — 'orange' | 'green' | 'red' | 'blue' | 'gray' (default 'gray')
    label       — top label text (default 'Label')
    labelSrc    — optional <img> src; renders image instead of text label
    badge       — optional pill value shown in topContent
    caption     — sub-label above amount (default 'Total')
    amount      — main stat value (default 0)
    isLoading   — show spinner overlay + hide amounts
    isFilter    — show filter icon on hover/active
    isActive    — active state for filter icon + border emphasis
    isHoverable — enable hover border + shadow lift

  Slots:
    top-right-content   — custom content replacing the badge area
    bottom-right-content — custom content inside the filter-wrapper area
-->
<script setup lang="ts">
import { MpText, MpTooltip, MpSpinner, MpIcon, css } from '@mekari/pixel3'
import { computed, useSlots } from 'vue'

// ─── Props ─────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  as?:         string
  id?:         string | number
  isLoading?:  boolean
  variant?:    'orange' | 'green' | 'red' | 'blue' | 'gray'
  label?:      string
  labelSrc?:   string
  badge?:      string | number
  caption?:    string | number
  amount?:     string | number
  isFilter?:   boolean
  isActive?:   boolean
  isHoverable?: boolean
}>(), {
  as:      'div',
  variant: 'gray',
  label:   'Label',
  caption: 'Total',
  amount:  0,
})

// ─── Slots ──────────────────────────────────────────────────────────
const slots = useSlots()
const hasSlot = (name: string) => !!slots[name]

// ─── Color map (variant → CSS variable tokens) ──────────────────────
//     Semantic Pixel 2.4 tokens used as var(--mp-colors-*) references
const COLOR_MAP: Record<string, {
  border: string
  borderActive: string
  borderHover: string
  topBg: string
  badgeBg: string
}> = {
  orange: {
    border:       'var(--mp-colors-orange-300)',
    borderActive: 'var(--mp-colors-orange-300)',
    borderHover:  'var(--mp-colors-orange-500)',
    topBg:        'var(--mp-colors-orange-50)',
    badgeBg:      'var(--mp-colors-orange-500)',
  },
  green: {
    border:       'var(--mp-colors-green-300)',
    borderActive: 'var(--mp-colors-green-700)',
    borderHover:  'var(--mp-colors-green-700)',
    topBg:        'var(--mp-colors-green-50)',
    badgeBg:      'var(--mp-colors-green-600)',
  },
  red: {
    border:       'var(--mp-colors-red-300)',
    borderActive: 'var(--mp-colors-red-700)',
    borderHover:  'var(--mp-colors-red-700)',
    topBg:        'var(--mp-colors-red-50)',
    badgeBg:      'var(--mp-colors-red-600)',
  },
  blue: {
    border:       'var(--mp-colors-blue-300)',
    borderActive: 'var(--mp-colors-blue-700)',
    borderHover:  'var(--mp-colors-blue-700)',
    topBg:        'var(--mp-colors-blue-50)',
    badgeBg:      'var(--mp-colors-blue-600)',
  },
  gray: {
    border:       'var(--mp-colors-gray-100)',
    borderActive: 'var(--mp-colors-gray-400)',
    borderHover:  'var(--mp-colors-gray-400)',
    topBg:        'var(--mp-colors-gray-50)',
    badgeBg:      'var(--mp-colors-gray-600)',
  },
}

const colors = computed(() => COLOR_MAP[props.variant ?? 'gray'])

const rootStyle = computed(() => ({
  border:        `1px solid ${props.isActive ? colors.value.borderActive : colors.value.border}`,
  borderRadius:  'var(--mp-radii-md)',
  display:       'flex',
  flexDirection: 'column' as const,
  transition:    'all 0.1s ease, box-shadow 0.5s ease',
  cursor:        (props.isHoverable || props.isFilter) ? 'pointer' : undefined,
}))

const topStyle = computed(() => ({
  display:         'flex',
  position:        'relative' as const,
  padding:         'var(--mp-spacing-2) var(--mp-spacing-3)',
  justifyContent:  'space-between',
  alignItems:      'center',
  borderRadius:    'var(--mp-radii-md) var(--mp-radii-md) 0 0',
  background:      colors.value.topBg,
}))

const badgeStyle = computed(() => ({
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  padding:        '2px 6px',
  borderRadius:   '16px',
  color:          'var(--mp-colors-white)',
  fontSize:       'var(--mp-fontSizes-sm)',
  fontFamily:     'var(--mp-fonts-body)',
  fontWeight:     '400',
  height:         '20px',
  background:     colors.value.badgeBg,
  flexShrink:     '0',
}))

// ─── Static CSS ──────────────────────────────────────────────────────
const bottomContent = css({
  position:     'relative',
  bg:           'white',
  borderRadius: '0 0 var(--mp-radii-md) var(--mp-radii-md)',
  width:        'full',
})

const bottomContentWrapper = css({
  display:       'flex',
  flexDirection: 'column',
  paddingInline: '3',
  paddingBlock:  '2',
})

const loadingWrapper = css({
  position:       'absolute',
  top:            '0',
  width:          'full',
  height:         'full',
  display:        'inline-flex',
  alignItems:     'center',
  justifyContent: 'center',
})

const filterWrapper = css({
  position: 'absolute',
  top:      '5',
  right:    '3',
})

const filterIcon = css({
  transition: 'all 0.2s ease',
  opacity:    '0',
  transform:  'scale(.5)',
})
</script>

<template>
  <component
    :is="props.as"
    data-slot="root"
    :data-active="String(!!props.isActive)"
    :data-hoverable="String(!!props.isHoverable)"
    class="group"
    :style="rootStyle"
    v-bind="$attrs"
    @mouseover="props.isHoverable ? ($el.style.boxShadow = 'var(--mp-shadows-lg)', $el.style.borderColor = colors.borderHover) : null"
    @mouseleave="props.isHoverable ? ($el.style.boxShadow = '', $el.style.borderColor = props.isActive ? colors.borderActive : colors.border) : null"
  >
    <!-- ── Top content ── -->
    <div data-slot="top-content" :style="topStyle">
      <div :style="{ width: 'calc(100% - 32px)', overflow: 'hidden' }">
        <img
          v-if="props.labelSrc"
          :style="{ height: '20px', width: 'auto' }"
          :src="props.labelSrc"
          alt=""
        />
        <template v-else>
          <MpTooltip :label="props.label">
            <MpText weight="semiBold" isTruncated>{{ props.label }}</MpText>
          </MpTooltip>
        </template>
      </div>

      <!-- Badge -->
      <div v-if="props.badge && !props.isLoading" data-slot="badge" :style="badgeStyle">
        {{ props.badge }}
      </div>

      <!-- Custom top-right slot -->
      <div v-if="hasSlot('top-right-content')">
        <slot name="top-right-content" />
      </div>
    </div>

    <!-- ── Bottom content ── -->
    <div data-slot="bottom-content" :class="bottomContent">
      <div
        :class="bottomContentWrapper"
        :style="{ visibility: props.isLoading ? 'hidden' : 'visible' }"
      >
        <MpText color="gray.600" size="label-small">{{ props.caption }}</MpText>
        <MpText as="h2" size="h2">{{ props.amount }}</MpText>

        <!-- Filter icon / bottom-right slot -->
        <div
          v-if="props.isFilter || hasSlot('bottom-right-content')"
          :class="filterWrapper"
        >
          <div v-if="props.isFilter">
            <MpTooltip label="Filter" placement="bottom">
              <MpIcon
                :data-active="props.isActive || undefined"
                name="filter"
                :variant="props.isActive ? 'duotone' : 'outline'"
                :class="filterIcon"
                :style="{ opacity: props.isActive ? '1' : undefined }"
              />
            </MpTooltip>
          </div>
          <slot v-else name="bottom-right-content" />
        </div>
      </div>

      <!-- Loading spinner overlay -->
      <div v-if="props.isLoading" data-slot="loading-wrapper" :class="loadingWrapper">
        <MpSpinner size="md" />
      </div>
    </div>
  </component>
</template>
