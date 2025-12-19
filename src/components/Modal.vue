<template>
  <Teleport to="body">
    <Transition name="modal-overlay-fade">
      <div class="modal-overlay" v-if="show" @click.self="modalClose">
        <Transition name="modal-scale">
          <div class="modal" v-if="show">
            <div class="modal__header">
              <h1>{{ title }}</h1>
            </div>
            <div class="modal__body">
              <slot></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
  export default {
    name: 'Modal',
    props: {
      title: String,
      show: Boolean
    },
    emit: ['close'],

    setup(props, { emit }) {
      const modalClose = () => {
        emit('close');
      }

      return {
        modalClose
      }
    }
  }
</script>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal {
    padding: 40px;
    background: white;
    border-radius: 16px;
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.15),
      0 10px 20px rgba(0, 0, 0, 0.1),
      0 0 0 1px rgba(0, 0, 0, 0.05);
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-overlay-fade-enter-active, .modal-overlay-fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .modal-overlay-fade-enter-from, .modal-overlay-fade-leave-to {
    opacity: 0;
  }

  .modal-scale-enter-active, .modal-scale-leave-active {
    transition: transform 0.3s ease, opacity 0.3s ease;
  }

  .modal-scale-enter-from, .modal-scale-leave-to {
    transform: scale(0.95);
    opacity: 0;
  }
</style>