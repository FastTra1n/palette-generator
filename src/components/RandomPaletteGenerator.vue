<template>
  <div class="generator">
    <div class="palette-wrapper">
      <div v-for="(hsl, index) in palette" @click="copyCode(index)" :key="index" :style="{ width: '250px', height: '300px', backgroundColor: hsl.hsl }">
        <p>{{ hsl.copied ? 'Скопировано' : hslToHex(hsl.hsl) }}</p>
      </div>
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
          const resultHsl = `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`
          colors.push({hsl: resultHsl, copied: false});
        }
        
        palette.value = colors;
      };

      const hslToHex = (hsl) => {
        let [h, s, l] = hsl.match(/(\d+(?:\.\d+)?)/g).map(Number);
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
          const k = (n + h / 30) % 12;
          const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
          return Math.round(255 * color).toString(16).padStart(2, '0');
        };

        return `#${f(0)}${f(8)}${f(4)}`;
      }

      const copyCode = async (index) => {
        const hsl = palette.value[index];
        const hex = hslToHex(hsl.hsl)
        await navigator.clipboard.writeText(hex);

        hsl.copied = true;

        setTimeout(() => {
          hsl.copied = false;
        }, 2000);
      }

      onMounted(() => {
        generatePalette();
      })

      return {
        palette,
        generatePalette,
        hslToHex,
        copyCode
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
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  transition: transform 0.3s;
}

.palette-wrapper div:hover {
  transform: scale(1.05);
}

.palette-wrapper div:active {
  transform: scale(0.9);
}

.palette-wrapper p {
  opacity: 0;
  transition: opacity 0.3s linear;
}

.palette-wrapper div:hover p {
  opacity: 1;
}
</style>