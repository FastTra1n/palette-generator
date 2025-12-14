<template>
  <div class="container">
    <RandomPaletteGenerator />
  </div>
</template>

<script>
import RandomPaletteGenerator from './components/RandomPaletteGenerator.vue'

export default {
  name: 'App',

  components: {
    RandomPaletteGenerator,
  }
};
</script>

<style scoped>
  .container {
    max-width: 1920px;
    margin: 0 auto;
  }
</style>
