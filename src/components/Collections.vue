<template>
  <div class="collections-section">
    <h2>Сохранённые коллекции</h2>
    <div class="collections-list">
      <div class="collection-card" v-for="(collection, index) in paletteCollections" :key="index">
        <div class="collection-header">
          <h3>{{ collection.name }}</h3>
        </div>
        <div class="collection-tags">
          <span v-for="(tag, tagIndex) in collection.tags" :key="tagIndex" class="tag">{{ tag }}</span>
        </div>
        <div class="collection-palette">
          <div class="palette-collection-wrapper">
            <div class="color-watch" v-for="(hsl, colorIndex) in collection.palettes" :key="colorIndex" :style="{ width: '50px', height: '50px', backgroundColor: hsl.hsl }"></div>
          </div>
        </div>
        <div class="collection-actions">
          <button @click="loadSelectedCollection(index)">Загрузить</button>
          <button @click="deleteCollection(index)">Удалить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, onMounted } from 'vue';

  export default {
    name: 'Collections',

    setup() {
      const palette = ref([]);
      const numColors = ref(5);
      const displayFormat = ref('HEX');
      const paletteCollections = ref([]);
      
      const loadPalette = () => {
        const savedData = localStorage.getItem('paletteData');
        if (!savedData) {
          generatePalette();
          return;
        }
        const data = JSON.parse(savedData);
        palette.value = data.savedPalette;
      };

      const saveToStorage = () => {
        const data = {
          savedPalette: palette.value,
          savedNumColors: numColors.value,
          savedDisplayFormat: displayFormat.value
        };  
        localStorage.setItem('paletteData', JSON.stringify(data));
      };

      const loadCollections = () => {
        const savedData = localStorage.getItem('paletteCollection');
        paletteCollections.value = savedData ? JSON.parse(savedData) : [];
      };

      const loadSelectedCollection = (index) => {
        palette.value = paletteCollections.value[index].palettes;
        saveToStorage();
      };

      const deleteCollection = (index) => {
        if (confirm('Вы уверены, что хотите удалить коллекцию?')) {
          paletteCollections.value.splice(index, 1);
        }
        localStorage.setItem('paletteCollection', JSON.stringify(paletteCollections.value));
      };

      onMounted(() => {
        loadPalette();
        loadCollections();
      });

      return {
        paletteCollections,
        loadSelectedCollection,
        deleteCollection,
      };
    },
  };
</script>

<style scoped>
  button {
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

  .collections-section {
    margin-top: 40px;
    width: 100%;
  }

  .collections-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .collection-card {
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s;
  }

  .collection-card:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }

  .collection-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .collection-tags {
    display: flex;
    gap: 5px;
  }

  .tag {
    padding: 5px 10px;
    background-color: #e0e0e0;
    border-radius: 20px;
    font-size: 12px;
  }

  .palette-collection-wrapper {
    padding: 20px 0;
    display: flex;
    gap: 10px;
  }

  .collection-palette {
    display: flex;
    gap: 5px;
    margin-bottom: 10px;
  }

  .color-watch {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }

  .collection-actions {
    display: flex;
    gap: 10px;
  }

  .collection-actions button {
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
  }

  .collection-actions button:first-child {
    background-color: #007bff;
    color: white;
  }

  .collection-actions button:last-child {
    background-color: #ff4d4d;
    color: white;
  }
</style>