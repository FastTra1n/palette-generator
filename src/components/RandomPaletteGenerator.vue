<template>
  <div class="generator">
    <div class="palette-wrapper">
      <div v-for="(hsl, index) in palette" @click="copyCode(index)" :key="index" :style="{ width: '250px', height: '300px', backgroundColor: hsl.hsl }">
        <p :style="{color: hsl.hsl}">{{ hsl.copied ? 'Скопировано' : displayFormat == 'HEX' ? hslToHex(hsl.hsl) : hslToRGB(hsl.hsl) }}</p>
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
      <select v-model="displayFormat">
        <option value="HEX">HEX</option>
        <option value="RGB">RGB</option>
      </select>
    </div>

    <div class="mockup-preview" :style="{ backgroundColor: palette.length > 5 ? palette[5].hsl : '#fff', color: palette.length > 6 ? palette[6].hsl : '#000'}">
      <h2>Превью в mockup интерфейсе</h2>
      <div class="mockup-container">
        <h3 :style="{ color: palette.length > 0 ? palette[0].hsl : '#000' }">Это заголовок карточки</h3>

        <div class="mockup-card" :style="{ backgroundColor: palette.length > 1 ? palette[1].hsl : '#fff' }">
          <p :style="{ color: palette.length > 2 ? palette[2].hsl : '#000' }">А это текст внутри карточки</p>
        </div>

        <button class="mockup-button" :style="{ backgroundColor: palette.length > 3 ? palette[3].hsl : '#007bff', color: palette.length > 4 ? palette[4].hsl : '#fff' }">Ещё и с кнопкой!</button>
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, onMounted, watch } from 'vue';

  export default {
    name: 'RandomPaletteGenerator',
    
    setup() {
      const palette = ref([]);
      const numColors = ref(5);
      const displayFormat = ref('HEX');
      
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
        saveToStorage();
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

      const hslToRGB = (hsl) => {
        let [h, s, l] = hsl.match(/(\d+(?:\.\d+)?)/g).map(Number);
        s /= 100;
        l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;

        if (0 <= h && h < 60) { r = c; g = x; b = 0; }
        else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
        else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
        else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
        else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
        else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return `rgb(${r}, ${g}, ${b})`;
      }

      const copyCode = async (index) => {
        const hsl = palette.value[index];
        const code = displayFormat.value === 'HEX' ? hslToHex(hsl.hsl) : hslToRGB(hsl.hsl)
        await navigator.clipboard.writeText(code);

        hsl.copied = true;

        setTimeout(() => {
          hsl.copied = false;
        }, 2000);
      }

      const pinColor = (index) => {
        palette.value[index].locked = !palette.value[index].locked;
      };

      const loadFromStorage = () => {
        const savedData = localStorage.getItem('paletteData');
        if (!savedData) {
          generatePalette();
          return;
        }
        const data = JSON.parse(savedData);
        palette.value = data.savedPalette;
        numColors.value = data.savedNumColors;
        displayFormat.value = data.savedDisplayFormat;
      };

      const saveToStorage = () => {
        const data = {
          savedPalette: palette.value,
          savedNumColors: numColors.value,
          savedDisplayFormat: displayFormat.value
        };
        localStorage.setItem('paletteData', JSON.stringify(data));
      };

      watch(numColors, () => {
        palette.value = [];
        generatePalette();
      });

      watch(displayFormat, () => {
        saveToStorage();
      })

      onMounted(() => {
        loadFromStorage();
      });

      return {
        palette,
        numColors,
        displayFormat,
        generatePalette,
        hslToHex,
        hslToRGB,
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
  cursor: pointer;
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

.mockup-preview {
  margin-top: 40px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
}

.mockup-container {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.mockup-card {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 10px;
}

.mockup-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>