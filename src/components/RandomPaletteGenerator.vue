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

      <label>Тёмная тема фона:</label>
      <input type="checkbox" v-model="darkTheme">

      <label>Выбрать базовый цвет:</label>
      <input type="color" v-model="selectedBaseColor">

      <label>Тип палитры:</label>
      <select v-model="scheme">
        <option value="analogous">Аналогичная</option>
        <option value="monochromatic">Монохромная</option>
        <option value="triadic">Триада</option>
        <option value="complementary">Комплементарная</option>
      </select>

      <label>По настроению:</label>
      <select v-model="mood">
        <option value="neutral">Нейтральное</option>
        <option value="calm">Спокойное</option>
        <option value="energetic">Энергичное</option>
        <option value="professional">Профессиональное</option>
      </select>
    </div>

    <div class="mockup-preview" :style="{ backgroundColor: palette.length > 5 ? palette[5].hsl : '#fff', color: palette.length > 6 ? palette[6].hsl : '#000'}">
      <h2>Превью в mockup интерфейсе</h2>
      <div class="mockup-container" :class="{ dark: darkTheme }">
        <h3 :style="{ color: palette.length > 0 ? palette[0].hsl : '#000' }">Это заголовок карточки</h3>
        <span class="contrast-level">Контраст заголовка: {{ getContrastLevel(darkTheme ? "#343434" : "#f9f9f9", palette.length > 0 ? palette[0].hsl : '#000') }}</span>

        <div class="mockup-card" :style="{ backgroundColor: palette.length > 1 ? palette[1].hsl : '#fff' }">
          <p :style="{ color: palette.length > 2 ? palette[2].hsl : '#000' }">А это текст внутри карточки</p>
          <span class="contrast-level">Контраст текста в карточке: {{ getContrastLevel(palette.length > 1 ? palette[1].hsl : '#fff', palette.length > 2 ? palette[2].hsl : '#000') }}</span>
        </div>

        <button class="mockup-button" :style="{ backgroundColor: palette.length > 3 ? palette[3].hsl : '#007bff', color: palette.length > 4 ? palette[4].hsl : '#fff' }">Ещё и с кнопкой!</button>
        <span class="contrast-level">Контраст кнопки: {{ getContrastLevel(palette.length > 3 ? palette[3].hsl : '#007bff', palette.length > 4 ? palette[4].hsl : '#fff') }}</span>
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
      const darkTheme = ref(false);
      const selectedBaseColor = ref('');
      const scheme = ref('triadic');
      const mood = ref('neutral');

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

      loadFromStorage();
      
      const generatePalette = () => {
        const baseColor = !selectedBaseColor.value ? Math.random() * 360 : hexToHsl(selectedBaseColor.value).h;
        const colors = [];
        let offset;

        switch (scheme.value) {
          case 'analogous':
            offset = 40;
            break;
          case 'monochromatic':
            offset = 0;
            break;
          case 'triadic':
            offset = 360 / numColors.value;
            break;
          case 'complementary':
            offset = 180
            break;
        }

        for (let i = 0; i < numColors.value; i++) {
          if (palette.value.length > 0 && palette.value[i] && palette.value[i].locked) {
            colors.push(palette.value[i])
            continue;
          }
          let hue = (baseColor + i * offset) % 360;
          let saturation, lightness;
          
          switch (mood.value) {
            case 'calm':
              saturation = 30 + Math.random() * 40;
              lightness = 60 + Math.random() * 30;
              break;
            case 'energetic':
              saturation = 80 + Math.random() * 20;
              lightness = 40 + Math.random() * 20;
              break;
            case 'professional':
              saturation = 20 + Math.random() * 30;
              lightness = 40 + Math.random() * 40;
              if (hue > 180 && hue < 300) hue = (hue + 60) % 360;
              break;
            case 'neutral':
            default:
              saturation = 70 + Math.random() * 30;
              lightness = 50 + Math.random() * 20;
              break;
          }
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

      const hexToHsl = (hex) => {
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;

        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
          h = s = 0;
        } else {
          let d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
      };

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

      const hexToRGB = (hex) => {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
      };

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

      const getLuminance = (rgb) => {
        const [r, g, b] = rgb.match(/\d+/g).map(Number).map(c => c / 255);
        const a = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
      };

      const calculateContrast = (bgColor, textColor) => {
        const bgRGB = bgColor.startsWith('hsl') ? hslToRGB(bgColor) : hexToRGB(bgColor);
        const textRGB = textColor.startsWith('hsl') ? hslToRGB(textColor) : hexToRGB(textColor);
        const luminanceBg = getLuminance(bgRGB);
        const luminanceText = getLuminance(textRGB);
        const brighter = Math.max(luminanceBg, luminanceText);
        const darker = Math.min(luminanceBg, luminanceText);
        return (brighter + 0.05) / (darker + 0.05);
      };

      const getContrastLevel = (bg, fg) => {
        const ratio = calculateContrast(bg, fg);
        if (ratio >= 7) return 'AAA';
        if (ratio >= 4.5) return 'AA';
        return 'Недостаточно';
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
        darkTheme,
        selectedBaseColor,
        scheme,
        mood,
        generatePalette,
        hslToHex,
        hexToHsl,
        hslToRGB,
        hexToRGB,
        copyCode,
        pinColor,
        getContrastLevel
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

.mockup-container.dark {
  background-color: #343434;
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

.contrast-level {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
  display: block;
}
</style>