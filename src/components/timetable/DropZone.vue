<template>
  <div
    class="dropzone"
    :style="{
      'background-color': dropzone.course.color + 'A0',
      left: position.x + 'px',
      top: position.y + 'px',
      width: position.w + 'px',
      height: position.h + 'px'
    }"
  />
</template>

<script>
  export default {
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
    },
    data () {
      return {
        position: {}
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
    methods: {
      update () {
        let duration = this.dropzone.end - this.dropzone.start
        let cellW = (this.boundary.w - (60 + 1)) / 5
        let cellH = 50
        let day = ['M', 'T', 'W', 'H', 'F'].indexOf(this.dropzone.day)
        let hour = this.dropzone.start - this.hours[0]
        this.position = {
          x: 60 + 1 + cellW * day,
          y: 50 + 1 + cellH * hour,
          w: cellW - 1,
          h: cellH * duration - 1
        }
      }
    }
  }
</script>

<style scoped>
  .dropzone {
    z-index: 80;
    position: absolute;
    width: 100%;
    height: 100%;
  }
</style>
