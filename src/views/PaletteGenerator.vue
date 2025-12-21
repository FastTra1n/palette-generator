<template>
  <div class="generator">
    <div class="palette-wrapper">
      <div v-for="(hsl, index) in palette" @click="copyCode(index)" :key="index" :style="{ width: '250px', height: '300px', backgroundColor: hsl.hsl }">
        <p :style="{color: hsl.hsl}">{{ hsl.copied ? 'Скопировано' : displayFormat == 'HEX' ? hslToHex(hsl.hsl) : hslToRGB(hsl.hsl) }}</p>
        <img :style="{color: hsl.hsl}" @click.stop="pinColor(index)" src="../assets/pin.png" width="30px">
      </div>
    </div>
    <div class="palette-actions">
      <button @click="generatePalette">Случайная палитра</button>
      <button @click="savePalette">Сохранить палитру</button>
      <Modal title="Создать коллекцию" :show="showCreateCollection" @close="showCreateCollection = false">
        <form @submit.prevent="handleCollectionCreate">
          <div class="collection-name">
            <label>Введите название коллекции:</label>
            <input type="text" v-model="collectionName" required>
          </div>
          <div class="collection-tags">
            <label>Укажите теги коллекции:</label>
            <input type="text" v-model="collectionTags">
          </div>
          <button type="submit">Создать</button>
        </form>
      </Modal>
    </div>
    
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
    
    <canvas ref="color-wheel" width="400" height="400"></canvas>
  </div>
</template>

<script>
  import { ref, onMounted, watch, useTemplateRef } from 'vue';
  import { useRoute } from 'vue-router';
  
  import Modal from '../components/Modal.vue';
  
  export default {
    name: 'RandomPaletteGenerator',
    components: {
      Modal,
    },
    
    setup() {
      const palette = ref([]);
      const numColors = ref(5);
      const displayFormat = ref('HEX');
      const darkTheme = ref(false);
      const selectedBaseColor = ref('');
      const scheme = ref('triadic');
      const mood = ref('neutral');
      const colorWheelCanvas = useTemplateRef('color-wheel');

      const showCreateCollection = ref(false);
      const collectionName = ref('');
      const collectionTags = ref('');
      const collectionFavorite = ref(false);

      const route = useRoute();

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
        drawColorWheel();
      };

      const savePalette = () => {
        showCreateCollection.value = true;
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

      const drawColorWheel = () => {
        const canvas = colorWheelCanvas.value;
        const ctx = canvas.getContext('2d');
        const radius = canvas.width / 2;
        const image = ctx.createImageData(canvas.width, canvas.height);
        const data = image.data;

        const xy2polar = (x, y) => {
          const r = Math.sqrt(x * x + y * y);
          const phi = Math.atan2(y, x);
          return [r, phi];
        };
      
        const rad2deg = (rad) => {
          return ((rad + Math.PI) / (2 * Math.PI)) * 360;
        };
      
        const hsvToRgb = (h, s, v) => {
          h = h / 360;
          let r, g, b;
          let i = Math.floor(h * 6);
          let f = h * 6 - i;
          let p = v * (1 - s);
          let q = v * (1 - f * s);
          let t = v * (1 - (1 - f) * s);
        
          switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
          }
        
          return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        };
      
        for (let x = -radius; x < radius; x++) {
          for (let y = -radius; y < radius; y++) {
            const [dist, phi] = xy2polar(x, y);
          
            if (dist > radius) continue;
          
            const deg = rad2deg(phi);
            const hue = deg;
            const saturation = dist / radius;
            const value = 1.0;
          
            const [red, green, blue] = hsvToRgb(hue, saturation, value);
            const adjustedX = x + radius;
            const adjustedY = y + radius;
            const index = (adjustedY * canvas.width + adjustedX) * 4;
          
            data[index] = red;
            data[index + 1] = green;
            data[index + 2] = blue;
            data[index + 3] = 255;
          }
        }
      
        ctx.putImageData(image, 0, 0);
      
        palette.value.forEach((color, index) => {
          const hsl = hexToHsl(hslToHex(color.hsl));
          const hue = hsl.h;
          const saturation = hsl.s / 100;
        
          const angleRad = (hue / 360) * 2 * Math.PI + Math.PI;
          const rDist = radius * saturation;
        
          const markX = radius + rDist * Math.cos(angleRad);
          const markY = radius + rDist * Math.sin(angleRad);

          ctx.beginPath();
          ctx.arc(markX, markY, 8, 0, 2 * Math.PI);
          ctx.fillStyle = color.hsl;
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      };

      const handleCollectionCreate = (e) => {
        e.preventDefault();

        const savedData = localStorage.getItem('paletteCollection');
        const collections = savedData ? JSON.parse(savedData) : [];
        collections.push({
          name: collectionName.value,
          tags: collectionTags.value.split(' '),
          palettes: palette.value,
          favorite: collectionFavorite.value
        });
        localStorage.setItem('paletteCollection', JSON.stringify(collections));

        collectionName.value = '';
        collectionTags.value = '';
        showCreateCollection.value = false;
        paletteCollections.value = collections;
      };

      watch(numColors, () => {
        palette.value = [];
        generatePalette();
      });

      watch(displayFormat, () => {
        saveToStorage();
      });

      onMounted(() => {
        loadFromStorage();
        const encodedPalette = route.query.palette
        if (encodedPalette) {
          try {
            const decoded = JSON.parse(atob(encodedPalette));
            palette.value = decoded;
            saveToStorage();
          } catch (e) {
            console.error('Ошибка: при декодировании ссылки на палитру произошла ошибка! Проверьте корректность ссылки и/или рассылаемой палитры.')
          }
        }
        drawColorWheel();
      });

      return {
        palette,
        numColors,
        displayFormat,
        darkTheme,
        selectedBaseColor,
        scheme,
        mood,
        showCreateCollection,
        collectionName,
        collectionTags,
        generatePalette,
        savePalette,
        hslToHex,
        hexToHsl,
        hslToRGB,
        hexToRGB,
        copyCode,
        pinColor,
        handleCollectionCreate,
      };
    },
  };
</script>

<style scoped>
  form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  input[type="text"] {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
  }

  button[type="submit"] {
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  button[type="submit"]:hover {
    background-color: #0056b3;
  }

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

  .palette-actions {
    display: flex;
    justify-content: center;
    width: 500px;
    gap: 50px;
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
</style>