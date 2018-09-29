<template>
  <div
    class="timetable noselect"
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
          :session="{ duration: 2 }"
          @drag="lastZ += 1"
        >
        </session>
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
        boundary: null
      }
    },
    computed: {
      hours () {
        let blank = new Array(this.endHour - this.startHour)
        return blank.fill(0).map((_, i) => zfill('' + (i + this.startHour), 2))
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
      session
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
