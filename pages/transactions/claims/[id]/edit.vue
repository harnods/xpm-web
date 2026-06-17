<!--
  Mekari Expense — Transactions › Claims › Edit claim (approver side)
  Renders the shared ClaimForm in approver-edit mode: everything is editable
  EXCEPT the claim Category and each item's Subcategory. Stays under
  /transactions/claims/* so the approver never leaves the approval context.
-->
<script setup lang="ts">
definePageMeta({
  title: 'Edit claim',
  breadcrumbParent: { label: 'Claims', path: '/transactions/claims' },
})

// Dynamic H1 (sentence case): "Edit reimbursement request" / "Edit cash advance request"
const route = useRoute()
const typeLabel = route.query.type === 'cash-advance' ? 'cash advance' : 'reimbursement'
route.meta.title = `Edit ${typeLabel} request`
</script>

<template>
  <ClaimForm mode="approver-edit" />
</template>
