<template>
  <div
    class="timetable-holder"
    v-resize="updateDimensions"
  >
    <div
      class="timetable"
      ref="timetable"
      id="timetable"
    >
      <drop-zone
        v-for="dropzone in dropzones"
        :key="'d' + dropzone.course.code + dropzone.component + dropzone.day + dropzone.start"
        v-if="isVisibleDropzone(dropzone)"
        :dropzone="dropzone"
        :boundary="dimensions"
        :hours="bounds"
      />
      <session
        v-for="session in timetable"
        :key="'s' + session.course.code + session.stream.component + session.index"
        :session="session"
        :pointers="pointers"
        :boundary="dimensions"
        :hours="bounds"
        :elevated="dragging && dragging.stream === session.stream"
        :clashes="getClashingSessions(session)"
        @drag="startDrag"
        @drop="stopDrag"
        @unSnap="unSnap"
      />

      <!-- Draw timetable grid -->
      <div class="row header">
        <div></div>
        <div>Monday</div>
        <div>Tuesday</div>
        <div>Wednesday</div>
        <div>Thursday</div>
        <div>Friday</div>
      </div>
      <div class="row" v-for="hour in hours" :key="'tthour' + hour">
        <div>{{ hour }}:00</div>
        <div v-for="day in days" :key="'ttcell' + day + hour"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import session from './Session'
  import dropZone from './DropZone'
  import search from './mixins/search'

  const snapDist = 40

  function zfill (str, n, right) {
    while (str.length < n) {
      str = (right !== true ? '0' : '') + str + (right === true ? '0' : '')
    }
    return str
  }

  export default {
    data () {
      return {
        days: ['M', 'T', 'W', 'H', 'F'],
        dimensions: {},
        dimensionsInterval: null,
        dragging: null,
        snapped: [],
        pastTimetable: []
      }
    },
    computed: {
      timetable: {
        get () {
          return this.$store.state.timetable
        },
        set (newValue) {
          return this.$store.commit('timetable', newValue)
        }
      },
      bounds () {
        // Find starting and ending points of the timetable
        let start = 24
        let end = 0
        for (let zone of this.dropzones) {
          start = Math.min(start, zone.start)
          end = Math.max(end, zone.end)
        }

        // Default time range in case of an empty timetable
        if (start === 24 || end === 0) {
          start = 9
          end = 17
        }

        return [ start, end ]
      },
      hours () {
        let blank = new Array(this.bounds[1] - this.bounds[0])
        return blank.fill(0).map((_, i) => zfill('' + (i + this.bounds[0]), 2))
      },
      dropzones () {
        let dropzones = []

        for (let course of this.$store.state.chosen) {
          for (let stream of course.streams) {
            for (let i of stream.sessions.keys()) {
              let session = stream.sessions[i]
              dropzones.push({
                day: session.time.day,
                start: session.time.start,
                end: session.time.end,
                course: course,
                component: stream.component,
                stream: stream,
                session: session,
                index: session.index
              })
            }
          }
        }

        return dropzones
      },
      allowFull () {
        return this.$store.state.options.allowFull
      },
      events () {
        return this.$store.state.events.length
      },
      chosen () {
        return this.$store.state.chosen.length
      },
      loading () {
        return this.$store.state.loading
      }
    },
    methods: {
      startDrag (e) {
        this.dragging = e.session
        this.timetable.splice(this.timetable.indexOf(e.session), 1)
        this.timetable.push(e.session)

        let snappedIndex = this.snapped.indexOf(e.session)
        if (snappedIndex !== -1) {
          this.snapped.splice(snappedIndex, 1)
        }
      },
      stopDrag (e) {
        // Find the nearest dropzone
        let timetable = this.$refs.timetable
        let drag = e.position
        let zones = timetable.querySelectorAll('.dropzone')
        let best = Infinity
        let nearest = null
        for (let zone of zones) {
          // Find this dropzone's position
          let drop = {
            x: zone.offsetLeft,
            y: zone.offsetTop,
            w: zone.offsetWidth,
            h: zone.offsetHeight
          }

          // Find distance between the dragged element and this dropzone
          let dist = {
            x: drag.x - drop.x,
            y: drag.y - drop.y
          }

          let sqSum = dist.x * dist.x + dist.y * dist.y
          if (sqSum < snapDist * snapDist && sqSum < best) {
            best = sqSum
            nearest = drop
          }
        }

        // Snap sessions to new position
        if (nearest !== null) {
          // Find the corresponding dropzone object for the DOM element we have
          let dayIndex = Math.round(Math.max(nearest.x - 70, 0) / nearest.w)
          let hourIndex = Math.round(Math.max(nearest.y - 50, 0) / 50)
          let day = this.days[dayIndex]
          let hour = this.hours[hourIndex]
          let dropzone = this.getDropZones(day, hour)[0]

          if (this.dragging === dropzone.session) {
            // Snap all sessions in this stream back to their base position
            for (let session of dropzone.stream.sessions) {
              session.snapToggle = !session.snapToggle

              this.snapped.push(session)
            }
          } else {
            // Move all linked sessions to new stream locations
            let localTimetable = this.timetable.slice()
            for (let i of dropzone.stream.sessions.keys()) {
              let from = this.dragging.stream.sessions[i]
              let to = dropzone.stream.sessions[i]
              localTimetable.splice(localTimetable.indexOf(from), 1)
              localTimetable.push(to)

              this.snapped.push(to)
            }

            this.$store.commit('timetable', localTimetable)
          }
        }

        // Drag released
        this.dragging = null
      },
      unSnap (e) {
        let snappedIndex = this.snapped.indexOf(e.session)
        if (snappedIndex !== -1) {
          this.snapped.splice(snappedIndex, 1)
        }
      },
      isVisibleDropzone (dropzone) {
        if (!this.dragging) {
          return false
        }

        // Check that this dropzone is for the right course
        if (this.dragging.course !== dropzone.course) {
          return false
        }

        // Check that this dropzone is for the right component
        if (this.dragging.stream.component !== dropzone.component) {
          return false
        }

        // Check that this dropzone is for the right session
        if (this.dragging.index !== dropzone.index) {
          return false
        }

        // Check that this dropzone isn't full, or we're allowed full sessions
        if (dropzone.stream.status === 0 && !this.$store.state.options.allowFull) {
          return false
        }

        return true
      },
      getDropZones (day, hour) {
        // Get all currently visible dropzones starting at the given day and hour
        let matches = []

        for (let dropzone of this.dropzones) {
          if (!this.isVisibleDropzone(dropzone)) {
            continue
          }

          // Check that this dropzone matches the given time
          if (dropzone.day !== day || dropzone.start !== +hour) {
            continue
          }

          matches.push(dropzone)
        }

        return matches
      },
      getClashingSessions (base) {
        let clashing = []
        if (this.snapped.includes(base)) {
          for (let session of this.timetable) {
            if (!this.snapped.includes(session)) {
              continue
            }

            if (session.time.day !== base.time.day) {
              continue
            }

            if (session.time.start < base.time.end && session.time.end > base.time.start) {
              clashing.push(session)
            }
          }
        }

        return clashing
      },
      updateDimensions () {
        this.dimensions = {
          w: this.$el.scrollWidth,
          h: this.$el.scrollHeight
        }
      },
      updateTimetable (allowFullOveride) {
        // Group streams by component for each course
        let components = []
        for (let course of this.$store.state.chosen) {
          let newComponents = course.streams.reduce((acc, stream) => {
            // Skip any CBS activities which have been deselected
            if (course.code === 'CBS' && !this.$store.state.events.includes(stream.component)) {
              return acc
            }

            // Check if this component type has occured before
            let match = acc.filter(c => c.component === stream.component)[0]

            // Link to this course from within each stream
            stream.course = course

            if (match) {
              // If component match is found add this stream to that component
              match.streams.push(stream)
            } else {
              // Otherwise make a new element for this component
              acc.push({
                course: course,
                component: stream.component,
                streams: [ stream ]
              })
            }

            return acc
          }, [])
          components = components.concat(newComponents)
        }
        // Sort components in descending order of complexity
        // (roll-backs are more likely to occur on less flexible streams)
        components.sort((a, b) => a.streams.length - b.streams.length)

        // Find the best timetable
        let result = this.search(components, 5000, this.timetable, allowFullOveride)

        // Split each stream into individual sessions
        if (result !== null) {
          let sessions = result.timetable.reduce((acc, s) => acc.concat(s.sessions), [])

          // Commit this new timetable to the store
          this.timetable = sessions

          this.snapped = sessions.slice()
          for (let session of this.snapped) {
            session.snapToggle = !session.snapToggle
          }
        } else {
          // No timetable was able to be made
          if (!this.allowFull) {
            // Automatically enable full classes (if not already enabled, and not just disabled)
            if (allowFullOveride !== false) {
              this.$store.commit('options', Object.assign({}, this.$store.state.options, { allowFull: true }))
              this.$store.commit('alert', {
                message: 'No valid timetable found, retrying including full classes',
                type: 'warning'
              })
            } else {
              this.$store.commit('alert', {
                message: 'Some classes have been displaced',
                type: 'warning'
              })
            }
          } else {
            // Display a warning message
            this.$store.commit('alert', {
              message: 'Could not create a valid timetable',
              type: 'error'
            })
          }
        }
      }
    },
    watch: {
      allowFull () {
        if (!this.loading && !this.$store.state.options.manual) {
          this.updateTimetable(this.allowFull || false)
        }
      },
      events () {
        if (!this.loading && !this.$store.state.options.manual) {
          this.updateTimetable()
        }
      },
      chosen () {
        if (!this.loading && !this.$store.state.options.manual) {
          this.updateTimetable()
        }
      },
      loading () {
        if (!this.loading) {
          // Update snapped sessions following timetable restore
          this.snapped = this.timetable.slice()
        }
      },
      updateToggle () {
        this.updateTimetable()
      },
      bounds () {
        this.$nextTick(this.updateDimensions)
      }
    },
    mounted () {
      this.updateDimensions()

      // Frequently update dimension measurements
      this.dimensionsInterval = window.setInterval(() => {
        this.updateDimensions()
      }, 3000)
    },
    beforeDestroy () {
      // Clear interval
      // NB: currently this component is never destroyed in normal functioning
      window.clearInterval(this.dimensionsInterval)
    },
    components: {
      session,
      dropZone
    },
    mixins: [ search ],
    props: {
      pointers: {
        type: Object,
        required: true
      },
      updateToggle: {
        type: Boolean,
        default: false
      }
    }
  }
</script>

<style scoped>
  .timetable-holder {
    position: relative;
    overflow-x: auto;
    z-index: 0;
  }
  .timetable {
    position: relative;
    overflow-x: visible;

    /* prevent selection */
  	-webkit-touch-callout: none;
  	-webkit-user-select: none;
  	-khtml-user-select: none;
  	-moz-user-select: none;
  	-ms-user-select: none;
  	user-select: none;
  }

  .row {
    display: flex;
    height: 50px;
  }
  .row.header {
    font-weight: 500;
    font-size: 120%;
  }

  .row > div {
    position: relative;
    flex: 1 1 100%;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.2);
    border-width: 0;
    border-left-width: 1px;
    border-top-width: 1px;
    min-width: 120px;
  }
  .row > div:first-child {
    min-width: 70px;
    flex: 0 0 70px;
  }
  .row.header > div, .row > div:first-child {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .row > div:last-child {
    border-right-width: 1px;
  }
  .row:last-child > div {
    border-bottom-width: 1px;
  }
</style>
