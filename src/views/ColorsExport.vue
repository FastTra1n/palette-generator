<template>
  <div class="export-section">
    <h2>Экспорт цветов</h2>
    <div v-if="palette.length > 0">
      <div class="export-format">
        <h3>CSS Variables</h3>
        <pre><code>{{ cssVariables }}</code></pre>
        <button @click="copyCode(cssVariables)">Скопировать код</button>
      </div>
      <div class="export-format">
        <h3>SCSS Variables</h3>
        <pre><code>{{ scssVariables }}</code></pre>
        <button @click="copyCode(scssVariables)">Скопировать код</button>
      </div>
      <div class="export-format">
        <h3>Tailwind Config</h3>
        <pre><code>{{ tailwindConfig }}</code></pre>
        <button @click="copyCode(tailwindConfig)">Скопировать код</button>
      </div>
      <div class="export-format">

      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';

  export default {
    name: 'ColorsExport',

    setup() {
      const palette = ref([]);
      
      const loadPalette = () => {
        const savedData = localStorage.getItem('paletteData');
        const data = JSON.parse(savedData);
        palette.value = data.savedPalette;
      };

      const cssVariables = computed(() => {
        let code = ":root {\n";
        for (let i = 0; i < palette.value.length; i++) {
          code += `  --color-${i+1}: ${palette.value[i].hsl};\n`
        }
        code += "}";
        return code;
      });

      const scssVariables = computed(() => {
        let code = "";
        for (let i = 0; i < palette.value.length; i++) {
            code += `$color-${i+1}: ${palette.value[i].hsl};\n`
        }
        return code;
      });

      const tailwindConfig = computed(() => {
        let code = "module.exports = {\n  theme: {\n    extend: {\n      colors: [\n";
        for (let i = 0; i < palette.value.length; i++) {
            code += `        color-${i+1}: ${palette.value[i].hsl},\n`
        }
        code += "      ]\n    }\n  }\n}"
        return code;
      });

      const copyCode = async (code) => {
        await navigator.clipboard.writeText(code);
      }

      onMounted(() => {
        loadPalette();
      });

      return {
        palette,
        cssVariables,
        scssVariables,
        tailwindConfig,
        copyCode
      };
    },
  };
</script>

<style scoped>
  .export-section {
    margin-top: 40px;
    text-align: left;
  }

  .export-format {
    margin-bottom: 30px;
  }

  pre {
    width: 15%;
    background: #f4f4f4;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
  }

  button {
    margin-top: 10px;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  button:hover {
    background-color: #1787ffff;
  }

  button:active {
    background-color: #3898ffff;
  }
</style>