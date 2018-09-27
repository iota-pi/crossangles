<template>
  <div
    class="session"
    @mousedown="drag"
    @mouseup="drop"
  >
    <div class="title">
      {{ title }}
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        dragging: false
      }
    },
    computed: {
      title () {
        return 'Test Title'
      }
    },
    methods: {
      drag (e) {
        console.log('drag', e)
        this.dragging = true
      },
      drop (e) {
        console.log('drop', e)
        this.dragging = false
      }
    },
    props: {

    }
  }
</script>

<style scoped>
  .session {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background-color: #ff00ff;
    color: white;
    cursor: grab;
  }
  .session.dragging {
    cursor: grabbing;
  }
</style>
