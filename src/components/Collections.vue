<template>
  <input class="search-input" type="text" placeholder="Фильтр по имени или тегам..." v-model="searchQuery">
  <div class="collections-section">
    <h2>Сохранённые коллекции</h2>
    <div class="collections-list">
      <div class="collection-card" v-for="(collection, index) in filterCollections" :key="index">
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
          <button class="load-button" @click="loadSelectedCollection(index)">Загрузить</button>
          <button class="edit-button" @click="editSelectedCollection(index)">Редактировать</button>
          <button class="delete-button" @click="deleteSelectedCollection(index)">Удалить</button>
          <Modal title="Редактировать коллекцию" :show="showCreateCollection" @close="showCreateCollection = false">
            <form @submit.prevent="handleCollectionEdit">
              <div class="collection-name">
                <label>Введите название коллекции:</label>
                <input type="text" v-model="editCollectionName" required>
              </div>
              <div class="collection-tags">
                <label>Укажите теги коллекции:</label>
                <input type="text" v-model="editCollectionTags">
              </div>
              <button type="submit">Сохранить</button>
            </form>
          </Modal>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, onMounted, computed } from 'vue';

  import Modal from './Modal.vue';

  export default {
    name: 'Collections',
    components: {
      Modal,
    },

    setup() {
      const palette = ref([]);
      const numColors = ref(5);
      const displayFormat = ref('HEX');
      const paletteCollections = ref([]);
      const searchQuery = ref('');

      const showCreateCollection = ref(false);
      const editCollectionIndex = ref(-1);
      const editCollectionName = ref('');
      const editCollectionTags = ref('');
      
      const loadPalette = () => {
        const savedData = localStorage.getItem('paletteData');
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
        palette.value = filterCollections.value[index].palettes;
        saveToStorage();
      };

      const editSelectedCollection = (index) => {
        editCollectionIndex.value = index;
        editCollectionName.value = filterCollections.value[index].name;
        editCollectionTags.value = filterCollections.value[index].tags.join(' ');
        showCreateCollection.value = true;
      };

      const deleteSelectedCollection = (index) => {
        if (confirm('Вы уверены, что хотите удалить коллекцию?')) {
          paletteCollections.value.splice(index, 1);
        }
        localStorage.setItem('paletteCollection', JSON.stringify(paletteCollections.value));
      };

      const filterCollections = computed(() => {
        const query = searchQuery.value.toLowerCase();
        return paletteCollections.value.filter(collection => {
          if (collection.name.toLowerCase().includes(query) || collection.tags.some(t => t.toLowerCase().includes(query))) {
            return true;
          }
        });
      });

      const handleCollectionEdit = (e) => {
        e.preventDefault();

        const savedData = localStorage.getItem('paletteCollection');
        const collections = savedData ? JSON.parse(savedData) : [];

        const tags = editCollectionTags.value ? editCollectionTags.value.split(' ') : [];
        collections[editCollectionIndex.value].name = editCollectionName.value;
        collections[editCollectionIndex.value].tags = tags;
        showCreateCollection.value = false;
        paletteCollections.value = collections;
        localStorage.setItem('paletteCollection', JSON.stringify(collections));
      };

      onMounted(() => {
        loadPalette();
        loadCollections();
      });

      return {
        paletteCollections,
        searchQuery,
        filterCollections,
        showCreateCollection,
        editCollectionName,
        editCollectionTags,
        loadSelectedCollection,
        editSelectedCollection,
        deleteSelectedCollection,
        handleCollectionEdit
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

  .search-input {
    width: 30%;
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
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

  .load-button {
    background-color: #007bff;
    color: white;
  }

  .load-button:hover {
    background-color: #1787ffff;
  }

  .load-button:active {
    background-color: #3898ffff;
  }

  .edit-button {
    background-color: rgb(255, 172, 39);
    color: white;
  }

  .edit-button:hover {
    background-color: rgb(255, 180, 58);
  }

  .edit-button:active {
    background-color: rgb(255, 188, 81);
  }

  .delete-button {
    background-color: #ff4d4d;
    color: white;
  }

  .delete-button:hover {
    background-color: #ff5757;
  }

  .delete-button:active {
    background-color: #ff6767;
  }
</style>