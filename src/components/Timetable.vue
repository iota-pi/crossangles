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
        <session
          v-for="session in getSessions(day, hour)"
          :key="hour + session.stream.component + session.course.code"
          :mouse="mouse"
          :lastZ="lastZ"
          :boundary="boundary"
          :session="session"
          @drag="startDrag"
          @drop="stopDrag"
        >
        </session>
        <!-- <dropzone
          v-if="dragged === session"
          :session="session"
          :dragged="dragged"
          :lastZ="lastZ"
        >
        </dropzone> -->
      </div>
    </div>
  </div>
</template>

<script>
  import session from './Session'
  import dropzone from './DropZone'
  import search from './mixins/search'

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
        dragged: null
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
            for (let session of stream.timetable) {
              dropzones.push({
                day: session.time.day,
                start: session.time.start,
                end: session.time.end,
                component: stream.component,
                course: course
              })
            }
          }
        }

        return dropzones
      },
      anythingChanges () {
        let c = [
          this.$store.state.courses,
          this.$store.state.events,
          this.$store.state.options
        ]
        return c.length + Math.random()
      }
    },
    methods: {
      startDrag (e) {
        this.lastZ += 1
        this.dragged = e.session
      },
      stopDrag (e) {
        // Find the nearest dropzone
        let timetable = this.$refs.timetable
        let drag = e.position
        let dropzones = timetable.querySelectorAll('.dropzone')
        let best = Infinity
        let nearest = null
        for (let dropzone of dropzones) {
          // Find this dropzone's position
          let drop = {
            x: dropzone.offsetParent.offsetLeft,
            y: dropzone.offsetParent.offsetTop,
            h: dropzone.offsetParent.offsetHeight
          }

          // Find distance between the dragged element and this dropzone
          let dist = {
            x: drag.x - drop.x,
            y: drag.y - drop.y
          }

          let sqSum = dist.x * dist.x + dist.y * dist.y
          if (sqSum < drop.h * drop.h && sqSum < best) {
            best = sqSum
            nearest = drop
          }
        }

        // Snap to position if near enough
        if (nearest !== null) {
          // Move the session
          // TODO
          console.log('snap')
        }

        // Drag released
        this.dragged = null
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
      updateBoundary () {
        this.boundary = {
          x: this.$el.offsetLeft,
          y: this.$el.offsetTop,
          w: this.$el.offsetWidth,
          h: this.$el.offsetHeight
        }
      }
    },
    watch: {
      anythingChanges () {
        console.log('computing timetable')
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
          for (let session of stream.timetable) {
            session.stream = stream
            session.course = stream.course
          }
          return acc.concat(stream.timetable)
        }, [])

        // Commit this new timetable to the store
        this.$store.commit('timetable', sessions)
        console.log(this.dropzones)
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
      dropzone
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
    min-width: 100px;
  }
  .tt-col:first-child {
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
