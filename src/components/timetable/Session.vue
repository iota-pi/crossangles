<template>
  <div
    class="session"
    :class="{
      new: isNew,
      dragging: pointer !== null,
      'elevation-3': pointer === null && (elevated || !isSnapped),
      'elevation-8': pointer !== null
    }"
    :style="{
      'background-color': session.course.color,
      left: position.x + 'px',
      top: position.y + 'px',
      width: dimensions.w + 'px',
      height: dimensions.h + 'px',
      'z-index': Math.max(zIndex, (elevated || !isSnapped) ? 90 : 0) + stackIndex
    }"
  >
    <v-fade-transition>
      <clash
        v-if="clashes.length > 1"
        :allowed="clashes.filter(s => s.time.canClash === false).length <= 1"
      />
    </v-fade-transition>

    <div class="label">
      <span v-if="session.course.code !== 'CBS' && !session.course.custom">
        <span class="em">
          {{ session.course.code }}
        </span>
        {{ session.stream.component }}
      </span>
      <span
        v-else
        class="em"
      >
        {{ session.stream.component }}
      </span>
    </div>

    <div
      v-for="(detail, i) in details"
      :key="'detail' + i"
      class="details"
      :class="{ 'more-space': duration > 1 }"
    >
      {{ detail }}
    </div>
  </div>
</template>

<script>
  import clash from './Clash'

  function pushEvent (action, session) {
    // Emit event to dataLayer
    window.dataLayer.push({
      event: 'timetable',
      action: action,
      label: session.course.code + '/' + session.stream.component + ':' + session.index
    })
  }

  export default {
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
      stackIndex: {
        type: Number,
        default: 0
      },
      clashes: {
        type: Array,
        default: null
      }
    },
    data () {
      return {
        currentPosition: { x: 0, y: 0 },
        dimensions: { w: 0, h: 0 },
        zIndex: 2,
        isSnapped: null,
        isNew: true
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
      duration () {
        return this.session.time.end - this.session.time.start
      },
      details () {
        // Don't show details on classes shorter than 1 hour
        if (this.duration < 1) {
          return []
        }

        // Add location/enrolment details
        let details = []
        if (this.$store.state.options.locations && this.session.location) {
          details.push(this.session.location)
        }
        if (this.$store.state.options.enrolments && this.session.stream.enrols) {
          details.push(this.session.stream.enrols)
        }

        // Join location and enrolments with an em-dash if both are present
        let result = [ details.join(' — ') ]

        // Add weeks details
        if (this.$store.state.options.weeks && this.session.weeks) {
          let prettyWeeks = this.session.weeks.replace(/,/g, ', ').replace(/-/g, '–')
          result.push('Weeks: ' + prettyWeeks)
        }

        return result
      },
      allowFull () {
        return this.$store.state.options.allowFull
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
      this.$nextTick(() => this.isNew = false)
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
        this.zIndex = 100

        // Emit a drag event to the timetable
        this.$emit('drag', {
          session: this.session,
          el: this.$el
        })

        // Emit event to dataLayer
        pushEvent('Dragged', this.session)
      },
      drop () {
        // Timeout is to fix visual glitch caused by dropzone transition
        window.setTimeout(() => {
          this.zIndex = 2
        }, 300)

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

        // Emit event to dataLayer
        pushEvent('Dropped', this.session)
      },
      updateDimensions () {
        this.dimensions.w = Math.floor((this.boundary.w - 60) / 5) - 1
        this.dimensions.h = 50 * this.duration - 1
      },
      update () {
        // Update width/height
        this.updateDimensions()

        // Update location
        let cellW = (this.boundary.w - (60 + 1)) / 5
        let cellH = 50
        let day = ['M', 'T', 'W', 'H', 'F'].indexOf(this.session.time.day)
        let hour = this.session.time.start - this.hours[0]
        this.currentPosition = {
          x: 60 + 1 + cellW * day,
          y: 50 + 1 + cellH * hour
        }
        this.isSnapped = true

        // Timeout is to fix visual glitch caused by dropzone transition
        window.setTimeout(() => {
          this.zIndex = 2
        }, 300)
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
    overflow: hidden;

    transition: box-shadow 0.3s, left 0.3s, top 0.3s;
  }
  .session.dragging {
    cursor: grabbing;
    transition: box-shadow 0.3s;
  }
  .session.new {
    transition: none;
  }

  .session > .label {
    text-align: center;
    line-height: 1.25;
    font-weight: 300;
    font-size: 105%;
  }
  .session > .label .em {
    font-weight: 500;
  }

  .details {
    text-align: center;
    line-height: 1.15;
    font-size: 82%;
    font-weight: 300;
  }

  .details.more-space {
    line-height: 1.2;
  }

  .blur {
    color: transparent;
    text-shadow: 0 0 12px rgba(255, 255, 255, 1);
    font-weight: 500;
  }
</style>
