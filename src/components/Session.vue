<template>
  <div
    class="session" :class="{ dragging: dragging }"
    @mousedown="drag"
    @mouseup="drop"
    :style="{
      height: (basePosition.h * session.duration - 1) + 'px',
      'background-color': color,
      left: position[0] + 'px',
      top: position[1] + 'px',
      'z-index': Math.min(zIndex, lastZ)
    }"
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
        dragging: false,
        startMouse: [0, 0],
        currentPosition: [0, 0],
        basePosition: {},
        zIndex: 1
      }
    },
    computed: {
      title () {
        return 'Test Title'
      },
      position () {
        if (this.dragging) {
          let x = this.currentPosition[0] + (this.mouse[0] - this.startMouse[0])
          let y = this.currentPosition[1] + (this.mouse[1] - this.startMouse[1])
          let bound = this.relativeLimits

          if (x < bound.x) {
            x = bound.x
          }
          if (x > bound.x + bound.w) {
            x = bound.x + bound.w
          }
          if (y < bound.y) {
            y = bound.y
          }
          if (y > bound.y + bound.h) {
            y = bound.y + bound.h
          }

          return [x, y]
        } else {
          return this.currentPosition
        }
      },
      relativeLimits () {
        return {
          x: -this.basePosition.x,
          y: -this.basePosition.y,
          w: this.boundary.w - this.basePosition.w,
          h: this.boundary.h - this.basePosition.h
        }
      }
    },
    methods: {
      drag (e) {
        this.startMouse = this.mouse.slice()
        this.currentPosition = [parseInt(this.$el.style.left), parseInt(this.$el.style.top)]
        this.dragging = true
        this.zIndex = this.lastZ + 1
        this.$emit('drag')
      },
      drop (e) {
        this.currentPosition = [parseInt(this.$el.style.left), parseInt(this.$el.style.top)]
        this.dragging = false
        this.$emit('drop')
      }
    },
    mounted () {
      this.basePosition = {
        x: this.$el.offsetParent.offsetLeft,
        y: this.$el.offsetParent.offsetTop,
        w: this.$el.offsetWidth,
        h: this.$el.offsetParent.offsetHeight
      }
    },
    props: {
      mouse: {
        type: Array,
        required: true
      },
      lastZ: {
        type: Number,
        required: true
      },
      boundary: {
        type: Object,
        default: null
      },
      session: {
        type: Object,
        default: 1
      },
      color: {
        type: String,
        default: '#ff00ff'
      }
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
    color: white;
    cursor: grab;
  }
  .session.dragging {
    cursor: grabbing;
  }
</style>
