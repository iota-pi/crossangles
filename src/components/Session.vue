<template>
  <div
    class="session"
    :class="{
      dragging: pointer !== null,
      'elevation-2': !elevated && !this.isSnapped,
      'elevation-8': elevated
    }"
    :style="{
      'background-color': this.session.course.color,
      left: position.x + 'px',
      top: position.y + 'px',
      width: dimensions.w + 'px',
      height: dimensions.h + 'px',
      'z-index': Math.max(zIndex, (elevated || !this.isSnapped) ? 3 : 0)
    }"
  >
    <v-fade-transition>
      <clash
        v-if="clashes.length > 1"
        :allowed="clashes.filter(s => s.time.canClash === false).length <= 1"
      />
    </v-fade-transition>
    <div class="label">
      <span v-if="session.course.code !== 'CBS'" class="em">
        {{ session.course.code }}:
      </span>
      <span :class="{ em: session.course.code === 'CBS' }">
        {{ session.stream.component }}
      </span>
    </div>
    <div class="details">
      {{ details }}
    </div>
  </div>
</template>

<script>
  import clash from './Clash'

  export default {
    data () {
      return {
        currentPosition: { x: 0, y: 0 },
        dimensions: { w: 0, h: 0 },
        zIndex: 1,
        isSnapped: null
      }
    },
    computed: {
      position () {
        if (this.pointer) {
          let x = this.currentPosition.x + (this.pointer.x - this.pointer.startX)
          let y = this.currentPosition.y + (this.pointer.y - this.pointer.startY)

          // Enforce position limits
          if (!this.isSnapped) {
            x = Math.max(x, 0)
            y = Math.max(y, 0)
            x = Math.min(x, this.boundary.w - this.dimensions.w)
            y = Math.min(y, this.boundary.h - this.dimensions.h)
          }

          return { x, y }
        } else {
          let { x, y } = this.currentPosition

          // Raise elevated courses a little
          if (this.elevated) {
            x -= 2
            y -= 4
          }

          // Enforce position limits
          if (!this.isSnapped) {
            x = Math.max(x, 0)
            y = Math.max(y, 0)
            x = Math.min(x, this.boundary.w - this.dimensions.w)
            y = Math.min(y, this.boundary.h - this.dimensions.h)
          }

          return { x, y }
        }
      },
      pointer () {
        for (let p of Object.keys(this.pointers)) {
          if (this.pointers[p].target === this.$el) {
            return this.pointers[p]
          }
        }

        return null
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
      },
      allowFull () {
        return this.$store.state.options.allowFull
      }
    },
    methods: {
      drag () {
        // Remember starting position for later reference
        this.currentPosition = {
          x: parseInt(this.$el.style.left),
          y: parseInt(this.$el.style.top)
        }
        this.isSnapped = false

        // Update z-index counter
        this.zIndex = 10

        // Emit a drag event to the timetable
        this.$emit('drag', {
          session: this.session,
          el: this.$el
        })
      },
      drop () {
        this.zIndex = 2

        // Remember ending position
        this.currentPosition = {
          x: parseInt(this.$el.style.left),
          y: parseInt(this.$el.style.top)
        }

        // Emit a drop event to the timetable
        this.$emit('drop', {
          session: this.session,
          el: this.$el,
          position: this.currentPosition
        })
      },
      updateDimensions () {
        let duration = this.session.time.end - this.session.time.start
        this.dimensions.w = Math.floor((this.boundary.w - 70) / 5) - 1
        this.dimensions.h = 50 * duration - 1
      },
      update () {
        // Update width/height
        this.updateDimensions()

        // Update location
        let cellW = (this.boundary.w - 71) / 5
        let cellH = 50
        let day = ['M', 'T', 'W', 'H', 'F'].indexOf(this.session.time.day)
        let hour = this.session.time.start - this.hours[0]
        this.currentPosition = {
          x: 71 + cellW * day,
          y: 51 + cellH * hour
        }
        this.isSnapped = true
        this.zIndex = 1
      }
    },
    watch: {
      pointer () {
        if (this.pointer) {
          this.drag()
        } else {
          this.drop()
        }
      },
      session () {
        this.update()
      },
      boundary () {
        if (this.isSnapped) {
          this.update()
        } else {
          this.updateDimensions()
        }
      },
      hours () {
        this.update()
      },
      snapToggle () {
        this.update()
      },
      allowFull () {
        // Dislodge class slightly if this stream becomes unavailable
        if (this.session.stream.status === 0 && this.allowFull !== true) {
          if (this.isSnapped) {
            let dx = Math.floor(Math.random() * 30) - 15
            let dy = Math.floor(Math.random() * 20) - 10
            dx = (dx < 0) ? dx - 15 : dx + 16
            dy = (dy < 0) ? dy - 10 : dy + 11

            this.currentPosition.x += dx
            this.currentPosition.y += dy
            this.isSnapped = false
            this.$emit('unSnap', {
              session: this.session
            })
          }
        }
      }
    },
    mounted () {
      this.update()
    },
    components: {
      clash
    },
    props: {
      session: {
        type: Object,
        required: true
      },
      pointers: {
        type: Object,
        required: true
      },
      boundary: {
        type: Object,
        required: true
      },
      hours: {
        type: Array,
        required: true
      },
      elevated: {
        type: Boolean,
        default: false
      },
      clashes: {
        type: Array,
        default: false
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

    transition: box-shadow 0.3s, left 0.3s, top 0.3s;
  }
  .session.dragging {
    cursor: grabbing;
    transition: box-shadow 0.3s;
  }

  .session > .label {
    text-align: center;
    line-height: 1.25;
  }
  .session > .label > .em {
    font-weight: 500;
  }

  .details {
    text-align: center;
    line-height: 1.1;
    font-size: 80%;
  }

  .blur {
    color: transparent;
    text-shadow: 0 0 12px rgba(255, 255, 255, 1);
    font-weight: 500;
  }
</style>
