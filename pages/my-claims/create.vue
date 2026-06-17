<!--
  Mekari Expense — My claims › Request reimbursement
  Thin wrapper around <ClaimForm> in create mode. All form logic lives in
  components/ClaimForm.vue (shared with the approver/requester edit views).
-->
<script setup lang="ts">
definePageMeta({
  title: 'Request reimbursement',
  breadcrumbParent: { label: 'My claims', path: '/my-claims' },
})
</script>

<template>
  <ClaimForm mode="create" />
</template>
