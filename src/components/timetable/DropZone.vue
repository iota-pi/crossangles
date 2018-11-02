<template>
  <div
    class="dropzone"
    :style="{
      'background-color': this.dropzone.course.color,
      left: position.x + 'px',
      top: position.y + 'px',
      width: position.w + 'px',
      height: position.h + 'px'
    }"
  >
  </div>
</template>

<script>
  export default {
    data () {
      return {
        position: {}
      }
    },
    methods: {
      update () {
        let duration = this.dropzone.end - this.dropzone.start
        let cellW = (this.boundary.w - 71) / 5
        let cellH = 50
        let day = ['M', 'T', 'W', 'H', 'F'].indexOf(this.dropzone.day)
        let hour = this.dropzone.start - this.hours[0]
        this.position = {
          x: 71 + cellW * day,
          y: 51 + cellH * hour,
          w: cellW - 1,
          h: cellH * duration - 1
        }
      }
    },
    watch: {
      dropzone () {
        this.update()
      },
      boundary () {
        this.update()
      }
    },
    mounted () {
      this.update()
    },
    props: {
      dropzone: {
        type: Object,
        required: true
      },
      hours: {
        type: Array,
        required: true
      },
      boundary: {
        type: Object,
        required: true
      }
    }
  }
</script>

<style scoped>
  .dropzone {
    z-index: 4;
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0.5;
  }
</style>
