<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="modalClose">
      <div class="modal">
        <div class="modal__header">
          <h1>{{ title }}</h1>
        </div>
        <div class="modal__body">
          <slot></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
  export default {
    name: 'Modal',
    props: {
      title: String
    },
    emit: ['close'],

    setup(props, context) {
      const modalClose = () => {
        context.emit('close');
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
    animation: overlayBlur 0.3s ease-out;
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
</style>