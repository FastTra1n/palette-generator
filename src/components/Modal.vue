<template>
  <Teleport to="body">
    <div class="modal">
      <div class="modal__header">
        {{ title }}
      </div>
      <div class="modal__body">
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>

<script>
  export default {
    name: 'Modal',
    props: {
      title: String
    }
  }
</script>

<style>
  
</style>