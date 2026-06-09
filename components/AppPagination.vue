<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Expense — AppPagination
  Source     : Figma z9nzcdQ9jpiGqafP4vvHed node 4407:124336
  Token mode : Pixel 2.4 · @mekari/pixel3
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Props:
    total           — total number of items
    page            — current page (1-indexed), v-model:page
    rowsPerPage     — rows shown per page, v-model:rowsPerPage
    rowsPerPageOptions — array of selectable sizes (default [5,10,25,50,100])
-->
<script setup lang="ts">
import {
  MpFlex, MpText, MpButton,
  MpPopover, MpPopoverTrigger, MpPopoverContent, MpPopoverList, MpPopoverListItem,
  css,
} from '@mekari/pixel3'

const props = withDefaults(defineProps<{
  total: number
  page: number
  rowsPerPage: number
  rowsPerPageOptions?: number[]
}>(), {
  rowsPerPageOptions: () => [5, 10, 25, 50, 100],
})

const emit = defineEmits<{
  'update:page':        [value: number]
  'update:rowsPerPage': [value: number]
}>()

const totalPages  = computed(() => Math.max(1, Math.ceil(props.total / props.rowsPerPage)))
const rangeStart  = computed(() => props.total === 0 ? 0 : (props.page - 1) * props.rowsPerPage + 1)
const rangeEnd    = computed(() => Math.min(props.page * props.rowsPerPage, props.total))
const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))

function setPage(p: number)   { if (p >= 1 && p <= totalPages.value) emit('update:page', p) }
function setRpp(n: number)    { emit('update:rowsPerPage', n); emit('update:page', 1) }

// ── Styles ──────────────────────────────────────────────────────────
// Left: "Rows per page 10 ▾" — borderless ghost button
const rppTrigger = css({
  display: 'flex', alignItems: 'center', gap: '1',
  paddingLeft: '2', paddingRight: '1', paddingY: '1',
  borderRadius: 'sm', border: 'none', outline: 'none',
  fontFamily: 'body', fontSize: 'md', color: 'text.secondary',
  background: 'transparent', cursor: 'pointer',
  _hover: { background: 'gray.50' },
  _focusVisible: { boxShadow: 'focus' },
})
// Right: page-number select — bordered input-look, 80px wide
const pageSelectTrigger = css({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  gap: '2', width: '80px', minHeight: '36px',
  border: '1px solid var(--mp-colors-border-form, rgba(29,31,36,.16))',
  borderRadius: '6px', paddingX: '3',
  fontFamily: 'body', fontSize: 'md', color: 'dark',
  background: 'white', cursor: 'pointer', outline: 'none',
  _focusVisible: { boxShadow: 'focus', borderColor: 'border.focused' },
})
const chevronSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
</script>

<template>
  <MpFlex align="center" justify="space-between" paddingX="2" paddingY="4" style="width:100%;">

    <!-- ── Left: rows-per-page + range text ── -->
    <MpFlex align="center" gap="6">
      <MpFlex align="center" gap="3">
        <MpText size="body" color="gray.600">Rows per page</MpText>

        <MpPopover id="pagination-rpp" is-close-on-select use-portal placement="bottom-start">
          <MpPopoverTrigger>
            <button :class="rppTrigger">
              {{ rowsPerPage }}
              <!-- caret -->
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;">
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </MpPopoverTrigger>
          <MpPopoverContent :class="css({ marginTop: '2px' })">
            <MpPopoverList>
              <MpPopoverListItem
                v-for="n in rowsPerPageOptions" :key="n"
                :is-active="rowsPerPage === n"
                @click="setRpp(n)"
              >{{ n }}</MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </MpPopover>
      </MpFlex>

      <MpText size="body" color="gray.600">
        Showing {{ rangeStart }}–{{ rangeEnd }} of {{ total }}
      </MpText>
    </MpFlex>

    <!-- ── Right: page-number select + prev/next ── -->
    <MpFlex align="center" gap="4">
      <MpFlex align="center" gap="3">

        <!-- Page number dropdown -->
        <MpPopover id="pagination-page" is-close-on-select use-portal placement="bottom-end">
          <MpPopoverTrigger>
            <button :class="pageSelectTrigger">
              {{ page }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;">
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </MpPopoverTrigger>
          <MpPopoverContent :class="css({ marginTop: '2px', maxHeight: '240px', overflowY: 'auto' })">
            <MpPopoverList>
              <MpPopoverListItem
                v-for="p in pageNumbers" :key="p"
                :is-active="page === p"
                @click="setPage(p)"
              >{{ p }}</MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </MpPopover>

        <MpText size="body" color="gray.600">of {{ totalPages }} pages</MpText>
      </MpFlex>

      <!-- Prev / Next -->
      <MpFlex align="center" gap="2">
        <MpButton
          variant="ghost" size="sm"
          left-icon="chevrons-left"
          aria-label="Previous page"
          :isDisabled="page <= 1"
          @click="setPage(page - 1)"
        />
        <MpButton
          variant="ghost" size="sm"
          left-icon="chevrons-right"
          aria-label="Next page"
          :isDisabled="page >= totalPages"
          @click="setPage(page + 1)"
        />
      </MpFlex>
    </MpFlex>

  </MpFlex>
</template>
