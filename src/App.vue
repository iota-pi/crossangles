<template>
  <v-app>
    <div
      @mousemove="mousemove"
      @touchmove="touchmove"
      @mousedown="mousedown"
      @touchstart="mousedown"
      @mouseup="mouseup"
      @touchend="mouseup"
    >
      <v-toolbar
        app
        dark
        color="primary"
      >
        <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        <v-toolbar-title v-text="title"></v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-navigation-drawer
        v-model="drawer"
        enable-resize-watcher
        temporary
        fixed
        app
      >
        <v-list>
          <v-list-tile
            value="true"
            v-for="(item, i) in items"
            :key="i"
          >
            <v-list-tile-action>
              <v-icon v-html="item.icon"></v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-text="item.title"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>

      <v-content>
        <v-container class="narrow">
          <course-selection />
          <course-display />
          <options />
          <timetable class="mt-4" :mouse="mouse" />
        </v-container>
      </v-content>
      <v-footer app>
        <v-container fluid class="py-0">
          <span>Data updated: blah blah blah</span>
        </v-container>
      </v-footer>
    </div>
  </v-app>
</template>

<script>
  import courseSelection from './components/CourseSelection'
  import courseDisplay from './components/CourseDisplay'
  import options from './components/Options'
  import timetable from './components/Timetable'

  export default {
    data () {
      return {
        drawer: false,
        mouse: { x: 0, y: 0, held: false },
        items: [{
          icon: 'bubble_chart',
          title: 'Save as Image'
        },
        {
          icon: 'bubble_chart',
          title: 'Reset Page'
        },
        {
          icon: 'bubble_chart',
          title: 'Save a Backup'
        }],
        title: 'CrossAngles'
      }
    },
    methods: {
      mousemove (e) {
        this.mouse.x = e.pageX
        this.mouse.y = e.pageY
      },
      mousedown (e) {
        this.mouse.held = true
      },
      mouseup (e) {
        this.mouse.held = false
      },
      touchmove (e) {
        let touch = e.touches[0]

        // Check if we are dragging an element
        let timetable = document.getElementById('timetable')
        for (let session of timetable.querySelectorAll('.session.dragging')) {
          if (session.contains(touch.target)) {
            e.preventDefault()
            break
          }
        }

        this.mouse.x = touch.pageX
        this.mouse.y = touch.pageY
      }
    },
    mounted () {
      this.$store.dispatch('loadData')
    },
    name: 'App',
    components: {
      courseSelection,
      courseDisplay,
      options,
      timetable
    }
  }
</script>

<style scoped>
 .container.narrow {
   max-width: 900px;
 }
</style>
