<template>
  <div
    class="dropzone"
    :style="{
      height: (basePosition.h * duration - 1) + 'px',
      'background-color': color,
      'z-index': lastZ - 1
    }"
  >
  </div>
</template>

<script>
  export default {
    data () {
      return {
        basePosition: {}
      }
    },
    computed: {
      color () {
        return this.dropzone.course.color
      },
      duration () {
        return this.dropzone.end - this.dropzone.start
      }
    },
    mounted () {
      this.basePosition = {
        x: this.$el.offsetParent.offsetLeft,
        y: this.$el.offsetParent.offsetTop,
        w: this.$el.offsetParent.offsetWidth,
        h: this.$el.offsetParent.offsetHeight
      }
    },
    props: {
      lastZ: {
        type: Number,
        required: true
      },
      dropzone: {
        type: Object,
        required: true
      }
    }
  }
</script>

<style scoped>
  .dropzone {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0.5;
  }
</style>
