<template>
  <div class="generator">
    <div class="palette-wrapper">
      <div v-for="(hsl, index) in palette" @click="copyCode(index)" :key="index" :style="{ width: '250px', height: '300px', backgroundColor: hsl.hsl }">
        <p :style="{color: hsl.hsl}">{{ hsl.copied ? 'Скопировано' : hslToHex(hsl.hsl) }}</p>
        <img :style="{color: hsl.hsl}" @click.stop="pinColor(index)" src="../assets/pin.png" width="30px">
      </div>
    </div>
    <button @click="generatePalette">Случайная палитра</button>
    <div class="controls">
      <label>Количество цветов:</label>
      <select v-model="numColors">
        <option :value="3">3</option>
        <option :value="5">5</option>
        <option :value="7">7</option>
      </select>

      <label>Формат:</label>
      <select>
        <option value="HEX">HEX</option>
        <option value="RGB">RGB</option>
      </select>
    </div>
  </div>
</template>

<script>
  import { ref, onMounted } from 'vue';

  export default {
    name: 'RandomPaletteGenerator',
    
    setup() {
      const palette = ref([]);
      const numColors = ref(5);
      
      const generatePalette = () => {
        const baseColor = Math.random() * 360;
        const colors = [];
        const offset = 360 / numColors.value;

        for (let i = 0; i < numColors.value; i++) {
          if (palette.value.length > 0 && palette.value[i] && palette.value[i].locked) {
            colors.push(palette.value[i])
            continue;
          }
          const hue = (baseColor + i * offset) % 360;
          const saturation = 70 + Math.random() * 30;
          const lightness = 50 + Math.random() * 20;
          const resultHsl = `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`
          colors.push({hsl: resultHsl, copied: false, locked: false});
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

      const pinColor = (index) => {
        palette.value[index].locked = !palette.value[index].locked;
      };

      onMounted(() => {
        generatePalette();
      })

      return {
        palette,
        numColors,
        generatePalette,
        hslToHex,
        copyCode,
        pinColor
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
  position: relative;
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

.palette-wrapper p, img {
  filter: invert(1) grayscale(1) brightness(1.3) contrast(9000);
  mix-blend-mode: luminosity;
  opacity: 0;
  transition: opacity 0.3s linear;
}

.palette-wrapper img {
  position: absolute;
  top: 10px;
  right: 10px;
}

.palette-wrapper div:hover p {
  opacity: 1;
}

.palette-wrapper div:hover img {
  opacity: 1;
}

.controls {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.controls label {
  font-weight: bold;
}

.controls select {
  padding: 5px;
  border-radius: 5px;
}
</style>