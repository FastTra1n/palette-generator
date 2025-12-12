<template>
  <div class="generator">
    <div class="palette-wrapper">
      <div v-for="(hsl, index) in palette" :key="index" :style="{ width: '250px', height: '300px', backgroundColor: hsl }"></div>
    </div>
    <button @click="generatePalette">Случайная палитра</button>
  </div>
</template>

<script>
  import { ref, onMounted } from 'vue';

  export default {
    name: 'RandomPaletteGenerator',
    
    setup() {
      const palette = ref([]);
      
      const generatePalette = () => {
        const baseColor = Math.random() * 360;
        const colors = [];
        
        for (let i = 0; i < 5; i++) {
          const hue = (baseColor + i * 72) % 360;
          const saturation = 70 + Math.random() * 30;
          const lightness = 50 + Math.random() * 20;
          colors.push(`hsl(${hue}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`);
        }
        
        palette.value = colors;
      };

      onMounted(() => {
        generatePalette();
      })

      return {
        palette,
        generatePalette
      };
    },
  };
</script>

<style scoped>
.generator {
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
}

.palette-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-start;
}

.generator button {
  width: 200px;
  height: 50px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 10px;
}

.generator button:hover {
  background-color: #1787ffff;
}

.generator button:active {
  background-color: #3898ffff;
}

.palette-wrapper div {
  transition: transform 0.3s;
}

.palette-wrapper div:hover {
  transform: scale(1.05);
}
</style>