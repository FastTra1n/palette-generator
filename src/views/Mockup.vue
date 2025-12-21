<template>
  <div class="visualization-container">
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
    <div class="theme-container">
      <label>Тёмная тема фона:</label>
      <input type="checkbox" v-model="darkTheme">
    </div>
  </div>
</template>

<script>
  import { ref, onMounted } from 'vue';

  export default {
    name: 'Mockup',

    setup() {
      const palette = ref([]);
      const darkTheme = ref(false);

      const loadPalette = () => {
        const savedData = localStorage.getItem('paletteData');
        if (!savedData) {
          generatePalette();
          return;
        }
        const data = JSON.parse(savedData);
        palette.value = data.savedPalette;
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
      };

      const hexToRGB = (hex) => {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
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

      onMounted(() => {
        loadPalette();
      });
      
      return {
        palette,
        darkTheme,
        getContrastLevel
      };
    },
  };
</script>

<style scoped>
  label {
    font-weight: bold;
  }

  select {
    padding: 5px;
    border-radius: 5px;
  }

  .visualization-container {
    display: flex;
    min-width: 100%;
    min-height: 100%;
    justify-content: center;
    align-items: center;
    margin-top: 40px;
    gap: 300px;
  }

  .mockup-preview {
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