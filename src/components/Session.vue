<template>
  <div
    class="session" :class="{ dragging: dragging }"
    @mousedown="drag"
    @mouseup="drop"
    :style="{
      height: basePosition.h + 'px',
      'background-color': color,
      left: position.x + 'px',
      top: position.y + 'px',
      'z-index': Math.min(zIndex, lastZ)
    }"
  >
    <div class="course-title">
      <span v-if="session.course.code !== 'CBS'" class="emphasis">
        {{ session.course.code }}:
      </span>
      <span :class="{ emphasis: session.course.code === 'CBS' }">
        {{ session.stream.component }}
      </span>
    </div>
    <div class="detail">
      <span v-if="$store.state.options.locations">
        {{ session.location }}
      </span>
      <span v-if="$store.state.options.locations && $store.state.options.enrolments">
        —
      </span>
      <span v-if="$store.state.options.enrolments">
        {{ session.stream.enrols }}
      </span>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        dragging: false,
        startMouse: { x: 0, y: 0 },
        currentPosition: { x: 0, y: 0 },
        basePosition: {},
        zIndex: 1
      }
    },
    computed: {
      title () {
        return this.session.course.code
      },
      position () {
        if (this.dragging) {
          let x = this.currentPosition.x + (this.mouse.x - this.startMouse.x)
          let y = this.currentPosition.y + (this.mouse.y - this.startMouse.y)
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

          return { x, y }
        } else {
          return this.currentPosition
        }
      },
      relativeLimits () {
        return {
          x: -this.basePosition.x,
          y: -this.basePosition.y,
          w: this.boundary.w - this.basePosition.w,
          h: this.boundary.h - (this.basePosition.h + 1) - 1
        }
      },
      mouseHeld () {
        return this.mouse.held
      },
      snap () {
        return this.session.snap
      },
      color () {
        return this.session.course.color
      }
    },
    methods: {
      drag (e) {
        if (!this.dragging) {
          this.startMouse = Object.assign({}, this.mouse)
          this.currentPosition = {
            x: parseInt(this.$el.style.left),
            y: parseInt(this.$el.style.top)
          }
          this.dragging = true
          this.zIndex = this.lastZ + 1
          this.$emit('drag', {
            session: this.session,
            el: this.$el
          })
        }
      },
      drop (e) {
        if (this.dragging) {
          this.currentPosition = {
            x: parseInt(this.$el.style.left),
            y: parseInt(this.$el.style.top)
          }
          this.dragging = false
          this.$emit('drop', {
            session: this.session,
            el: this.$el,
            position: {
              x: this.basePosition.x + this.currentPosition.x,
              y: this.basePosition.y + this.currentPosition.y
            }
          })
        }
      }
    },
    watch: {
      mouseHeld () {
        if (this.mouseHeld === false) {
          this.drop()
        }
      },
      snap () {
        if (this.session.snap) {
          this.currentPosition.x = 0
          this.currentPosition.y = 0
          this.session.snap = false
        }
      }
    },
    mounted () {
      let duration = this.session.time.end - this.session.time.start
      this.basePosition = {
        x: this.$el.offsetParent.offsetLeft,
        y: this.$el.offsetParent.offsetTop,
        w: this.$el.offsetParent.offsetWidth,
        h: this.$el.offsetParent.offsetHeight * duration - 1
      }
    },
    props: {
      session: {
        type: Object,
        required: true
      },
      mouse: {
        type: Object,
        required: true
      },
      lastZ: {
        type: Number,
        required: true
      },
      boundary: {
        type: Object,
        default: null
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

  .course-title {
    text-align: center;
    line-height: 1.25;
  }
  .course-title > .emphasis {
    font-weight: 500;
  }

  .detail {
    text-align: center;
    line-height: 1.1;
    font-size: 80%;
  }
</style>
