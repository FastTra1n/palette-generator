import { createRouter, createWebHistory } from 'vue-router'

import PaletteGenerator from '@/components/PaletteGenerator.vue';
import Mockup from '@/components/Mockup.vue';
import Collections from '@/components/Collections.vue';

const routes = [
  {
    path: '/',
    name: 'PaletteGenerator',
    component: PaletteGenerator
  },
  {
    path: '/mockup',
    name: 'Mockup',
    component: Mockup
  },
  {
    path: '/collections',
    name: 'Collections',
    component: Collections
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;