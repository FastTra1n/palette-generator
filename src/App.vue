<template>
  <div class="container">
    <div class="navbar">
      <router-link to="/" class="nav-link">Генератор</router-link>
      <router-link to="/mockup" class="nav-link">Предпросмотр</router-link>
      <router-link to="/collections" class="nav-link">Коллекции</router-link>
      <router-link to="/export" class="nav-link">Экспорт цветов</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
};
</script>

<style scoped>
  .container {
    max-width: 1920px;
    margin: 0 auto;
  }

  .navbar {
    margin-bottom: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f0f0f0;
    padding: 15px 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 0 0 10px 10px;
    gap: 40px;
  }

  .nav-link {
    text-decoration: none;
    color: #333;
    font-size: 18px;
    font-weight: bold;
    padding: 10px 15px;
    transition: color 0.3s ease, background-color 0.3s ease;
    border-radius: 5px;
  }

  .nav-link:hover {
    color: #007bff;
    background-color: #e0e0e0;
  }

  .nav-link.router-link-active {
    color: #007bff;
    background-color: #d0eaff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
  }
</style>
