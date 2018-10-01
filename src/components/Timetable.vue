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
      <div class="tt-col">
        <session
          v-if="hour == 10"
          :mouse="mouse"
          :lastZ="lastZ"
          :boundary="boundary"
          :session="testSession"
          @drag="startDrag"
          @drop="stopDrag"
        >
        </session>
        <dropzone
          v-if="hour == 11 && dragged === testSession"
          :session="testSession"
          :dragged="dragged"
          :lastZ="lastZ"
        >
        </dropzone>
      </div>
      <div class="tt-col"></div>
      <div class="tt-col"></div>
      <div class="tt-col"></div>
      <div class="tt-col"></div>
    </div>
  </div>
</template>

<script>
  import session from './Session'
  import dropzone from './DropZone'

  function zfill (str, n, right) {
    while (str.length < n) {
      str = (right !== true ? '0' : '') + str + (right === true ? '0' : '')
    }
    return str
  }

  export default {
    data () {
      return {
        startHour: 8,
        endHour: 16,
        lastZ: 10,
        boundary: null,
        dragged: null,
        testSession: { duration: 2 }
      }
    },
    computed: {
      hours () {
        let blank = new Array(this.endHour - this.startHour)
        return blank.fill(0).map((_, i) => zfill('' + (i + this.startHour), 2))
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
      }
    },
    mounted () {
      this.boundary = {
        x: this.$el.offsetLeft,
        y: this.$el.offsetTop,
        w: this.$el.offsetWidth,
        h: this.$el.offsetHeight
      }
    },
    components: {
      session,
      dropzone
    },
    props: {
      mouse: {
        type: Array,
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
