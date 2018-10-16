<template>
  <div
    class="timetable noselect"
    ref="timetable"
  >
    <div class="tt-row header">
      <div class="tt-col"></div>
      <div class="tt-col">Monday</div>
      <div class="tt-col">Tuesday</div>
      <div class="tt-col">Wednesday</div>
      <div class="tt-col">Thursday</div>
      <div class="tt-col">Friday</div>
    </div>
    <div class="tt-row" v-for="hour in hours" :key="'tthour' + hour">
      <div class="tt-col">{{ hour }}:00</div>
      <div class="tt-col" v-for="day in days" :key="'ttcell' + day + hour">
        <drop-zone
          v-for="dropzone, i in getDropZones(day, hour)"
          :key="'dropzone' + i"
          :dropzone="dropzone"
          :lastZ="lastZ"
        >
      </drop-zone>
        <session
          v-for="session, i in getSessions(day, hour)"
          :key="'session' + i"
          :mouse="mouse"
          :lastZ="lastZ"
          :boundary="boundary"
          :session="session"
          @drag="startDrag"
          @drop="stopDrag"
        >
        </session>
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
        lastZ: 10,
        boundary: null,
        dragging: null
      }
    },
    computed: {
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
      timetable () {
        return this.$store.state.timetable
      },
      dropzones () {
        let dropzones = []

        for (let course of this.$store.state.courses) {
          for (let stream of course.streams) {
            for (let i of stream.times.keys()) {
              let session = stream.times[i]
              dropzones.push({
                day: session.time.day,
                start: session.time.start,
                end: session.time.end,
                course: course,
                component: stream.component,
                stream: stream,
                session: session,
                index: i
              })
            }
          }
        }

        return dropzones
      },
      anythingChanges () {
        let c = this.$store.state.options.allowFull ? 1 : 0
        c += 2 * this.$store.state.events.length
        c += 10 * this.$store.state.courses.length
        return c
      }
    },
    methods: {
      startDrag (e) {
        this.lastZ += 1
        this.dragging = e.session
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
            x: zone.offsetParent.offsetLeft,
            y: zone.offsetParent.offsetTop,
            w: zone.offsetParent.offsetWidth,
            h: zone.offsetParent.offsetHeight
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

        // Snap to position if near enough
        if (nearest !== null) {
          // Move the session
          let dayIndex = Math.round(Math.max(nearest.x - 70, 0) / nearest.w)
          let hourIndex = Math.round(Math.max(nearest.y - 50, 0) / nearest.h)
          let day = this.days[dayIndex]
          let hour = this.hours[hourIndex]
          let dropzone = this.getDropZones(day, hour)[0]

          if (this.dragging === dropzone.session) {
            // Reset position
            this.dragging.snap = true
          } else {
            // Move all linked sessions
            for (let i of dropzone.stream.times.keys()) {
              let from = this.dragging.stream.times[i]
              let to = dropzone.stream.times[i]
              this.timetable.splice(this.timetable.indexOf(from), 1, to)
            }
          }
        }

        // Drag released
        this.dragging = null
      },
      getSessions (day, hour) {
        // Get all sessions starting at the given hour
        let matches = []

        // Convert hour to a number
        hour = +hour

        for (let session of this.timetable) {
          if (session.time.day === day && session.time.start === hour) {
            matches.push(session)
          }
        }

        return matches
      },
      getDropZones (day, hour) {
        // Get all dropzones starting at the given hour
        let matches = []

        // Convert hour to a number
        hour = +hour

        // Ignore all dropzones if nothing is being dragged currently
        if (this.dragging) {
          for (let dropzone of this.dropzones) {
            // Check that this dropzone is for the right course
            if (this.dragging.course !== dropzone.course) {
              continue
            }

            // Check that this dropzone is for the right component
            if (this.dragging.stream.component !== dropzone.component) {
              continue
            }

            // Check that this dropzone is for the right session
            if (this.dragging.index !== dropzone.index) {
              continue
            }

            // Check that this dropzone matches the given time
            if (dropzone.day === day && dropzone.start === hour) {
              matches.push(dropzone)
            }
          }
        }

        return matches
      },
      updateBoundary () {
        this.boundary = {
          x: this.$el.offsetLeft,
          y: this.$el.offsetTop,
          w: this.$el.offsetWidth,
          h: this.$el.offsetHeight
        }
      },
      updateTimetable () {
        // Group streams by component for each course
        let components = []
        for (let course of this.$store.state.courses) {
          let newComponents = course.streams.reduce((acc, stream) => {
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

        // Find the best timetable
        let result = this.search(components)

        // Split each stream into individual sessions
        let streams = result.timetable
        let sessions = streams.reduce((acc, stream) => {
          return acc.concat(stream.times)
        }, [])

        // Commit this new timetable to the store
        this.$store.commit('timetable', sessions)
      }
    },
    watch: {
      anythingChanges () {
        if (!this.$store.state.options.manual) {
          this.updateTimetable()
        }
      },
      bounds () {
        this.$nextTick(this.updateBoundary)
      }
    },
    mounted () {
      this.updateBoundary()
    },
    components: {
      session,
      dropZone
    },
    mixins: [ search ],
    props: {
      mouse: {
        type: Object,
        required: true
      }
    }
  }
</script>

<style scoped>
  .timetable {
    position: relative;
    overflow-x: auto;
  }

  .tt-row {
    display: flex;
    height: 50px;
  }
  .tt-row.header {
    font-weight: 500;
    font-size: 120%;
  }

  .tt-col {
    position: relative;
    flex: 1 1 100%;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.2);
    border-width: 0;
    border-left-width: 1px;
    border-top-width: 1px;
    min-width: 120px;
  }
  .tt-col:first-child {
    min-width: 70px;
    flex: 0 0 70px;
  }
  .tt-row.header > .tt-col, .tt-col:first-child {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .tt-col:last-child {
    border-right-width: 1px;
  }
  .tt-row:last-child > .tt-col {
    border-bottom-width: 1px;
  }
  .noselect {
  	-webkit-touch-callout: none;
  	-webkit-user-select: none;
  	-khtml-user-select: none;
  	-moz-user-select: none;
  	-ms-user-select: none;
  	user-select: none;
  }
</style>
