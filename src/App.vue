<template>
  <v-app>
    <div
      @mousemove="mousemove"
      @touchmove="mousemove"
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
          <timetable class="mt-4" :pointers="pointers" />
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
  import Vue from 'vue'

  import courseSelection from './components/CourseSelection'
  import courseDisplay from './components/CourseDisplay'
  import options from './components/Options'
  import timetable from './components/Timetable'

  export default {
    data () {
      return {
        drawer: false,
        mouse: { x: 0, y: 0, held: false },
        pointers: {},
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
      getTargetSession (targetNode) {
        let timetable = document.getElementById('timetable')
        let sessions = timetable.querySelectorAll('.session')

        for (let session of sessions) {
          if (session.contains(targetNode)) {
            return session
          }
        }

        return null
      },
      getPointerID (pointer) {
        return (pointer.identifier !== undefined) ? pointer.identifier : 'mouse'
      },
      mousemove (e) {
        let pointers = e.changedTouches || [ e ]
        let dragged = false
        for (let pointer of pointers) {
          let id = this.getPointerID(pointer)

          // Update the position of this pointer if we are tracking it
          let tracker = this.pointers[id]
          if (tracker) {
            tracker.x = pointer.pageX
            tracker.y = pointer.pageY
            dragged = true
          }
        }

        if (dragged && e.touches) {
          e.preventDefault()
        }
      },
      mousedown (e) {
        // Block multiple touches
        if (Object.keys(this.pointers).length > 0) {
          return
        }

        let pointers = e.changedTouches || [ e ]
        for (let pointer of pointers) {
          let target = this.getTargetSession(pointer.target)
          if (target !== null) {
            let id = this.getPointerID(pointer)
            Vue.set(this.pointers, id, {
              x: pointer.pageX,
              y: pointer.pageY,
              startX: pointer.pageX,
              startY: pointer.pageY,
              target: target,
              id: id
            })
          }
        }
      },
      mouseup (e) {
        let pointers = e.changedTouches || [ e ]
        for (let pointer of pointers) {
          let id = this.getPointerID(pointer)

          // Stop tracking this pointer
          Vue.delete(this.pointers, id)
        }
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
