<template>
  <div
    class="session" :class="{ dragging: dragging }"
    @mousedown="drag"
    @mouseup="drop"
    :style="{
      'background-color': this.session.course.color,
      left: position.x + 'px',
      top: position.y + 'px',
      width: dimensions.w + 'px',
      height: dimensions.h + 'px',
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
    <div class="details">
      {{ details }}
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
        dimensions: { w: 0, h: 0 },
        zIndex: 1
      }
    },
    computed: {
      position () {
        if (this.dragging) {
          let x = this.currentPosition.x + (this.mouse.x - this.startMouse.x)
          let y = this.currentPosition.y + (this.mouse.y - this.startMouse.y)

          // Top/Left limits
          x = Math.max(x, 0)
          y = Math.max(y, 0)

          // Bottom/Right limits
          x = Math.min(x, this.boundary.w - this.dimensions.w)
          y = Math.min(y, this.boundary.h - this.dimensions.h)

          return { x, y }
        } else {
          return this.currentPosition
        }
      },
      mouseHeld () {
        return this.mouse.held
      },
      snapToggle () {
        return this.session.snapToggle
      },
      details () {
        let location = ''
        if (this.$store.state.options.locations) {
          location = this.session.location || ''
        }
        let enrols = ''
        if (this.$store.state.options.enrolments) {
          enrols = this.session.stream.enrols || ''
        }
        let sep = (location && enrols) ? ' — ' : ''
        return location + sep + enrols
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
            position: this.currentPosition
          })
        }
      },
      update () {
        let duration = this.session.time.end - this.session.time.start
        this.dimensions.w = Math.floor((this.boundary.w - 70) / 5) - 1
        this.dimensions.h = 50 * duration - 1

        let cellW = (this.boundary.w - 71) / 5
        let cellH = 50
        let day = ['M', 'T', 'W', 'H', 'F'].indexOf(this.session.time.day)
        let hour = this.session.time.start - this.hours[0]
        this.currentPosition = {
          x: 71 + cellW * day,
          y: 51 + cellH * hour
        }
      }
    },
    watch: {
      mouseHeld () {
        if (this.mouseHeld === false) {
          this.drop()
        }
      },
      boundary () {
        this.update()
      },
      snapToggle () {
        this.update()
      }
    },
    mounted () {
      this.update()
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
        required: true
      },
      hours: {
        type: Array,
        required: true
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

  .details {
    text-align: center;
    line-height: 1.1;
    font-size: 80%;
  }
</style>
