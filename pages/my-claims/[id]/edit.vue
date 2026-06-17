<!--
  Mekari Expense — My claims › Edit claim (requester side)
  Renders the shared ClaimForm in requester-edit mode: only attachments,
  descriptions and the Additional details section are editable.
-->
<script setup lang="ts">
definePageMeta({
  title: 'Edit claim',
  breadcrumbParent: { label: 'My claims', path: '/my-claims' },
})

// Dynamic H1 (sentence case): "Edit reimbursement request" / "Edit cash advance request"
const route = useRoute()
const typeLabel = route.query.type === 'cash-advance' ? 'cash advance' : 'reimbursement'
route.meta.title = `Edit ${typeLabel} request`
</script>

<template>
  <ClaimForm mode="requester-edit" />
</template>
