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
            @click="item.action"
          >
            <v-list-tile-action>
              <v-icon>
                {{ item.icon }}
              </v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ item.title }}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>

      <v-content>
        <v-container class="narrow">
          <div class="font-weight-light subheading">
            <p>
              Welcome to <span class="font-weight-regular">{{ title }}</span>!
              To get started with planning your timetable for
              <span class="font-weight-regular">Term {{ meta.term }}, {{ meta.year }}</span>
              select the courses you've enrolled in below.
            </p>
            <p>
              To make the most out of this tool,
              don't miss out on personalising your timetable by
              <span class="font-weight-regular">dragging classes around</span>
              to suit you better,
              <span class="font-weight-regular">changing the color</span>
              for each of your courses,
              <span class="font-weight-regular">adding custom events</span>,
              and
              <span class="font-weight-regular">saving your timetable as an image</span>
              when you're done.
            </p>
          </div>

          <course-selection class="mb-1" @custom="customDialog = true" />
          <course-display class="mb-3" @editCustom="editCustom" />
          <options class="mb-5" />

          <timetable :pointers="pointers" />

          <v-layout class="font-weight-light pt-4" row>
            <v-flex class="text-xs-center">
              <v-btn color="primary" @click="save" class="fixed-width">
                <span v-if="!saving">Save Timetable as Image</span>
                <v-progress-circular
                  v-else
                  color="white"
                  indeterminate
                  :size="24"
                  :width="3"
                />
              </v-btn>
            </v-flex>
          </v-layout>

          <div class="font-weight-light pt-5">
            <p>
              This tool is provided by
              <span class="font-weight-regular">
                <a href="https://www.campusbiblestudy.org/">Campus Bible Study</a>
              </span>
              — a group of people at UNSW who are interested in learning together
              about Jesus from the Bible.
              Whether you follow Jesus, or want to find out what He's all about,
              <span class="font-weight-regular">Campus Bible Study</span>
              is a great place for you to learn more.
              If you've never come before, we recommend checking out the Bible talks.
            </p>
            <p>
              The data was last updated at {{ meta.updateTime }}
              <span class="faded">({{ meta.updateDate }})</span>
              from <a href="http://classutil.unsw.edu.au">classutil.unsw.edu.au</a>.
              This tool comes without any guarantee of data accuracy or completeness.
            </p>
          </div>
        </v-container>
      </v-content>
      <v-footer height="auto">
        <v-container class="py-2 narrow">
          <v-layout row wrap>
            <v-flex xs12 sm9 class="py-1">
              <span>Last data update:</span>
              <span>{{ meta.updateTime }}</span>
              <span class="faded">({{ meta.updateDate }})</span>
            </v-flex>

            <v-flex xs12 sm3 class="py-1 text-sm-right">
              <a @click="contactDialog = true; contactTitle = null">
                Get in Contact
              </a>
            </v-flex>
          </v-layout>
        </v-container>
      </v-footer>
    </div>
    <custom
      :display="customDialog"
      :edit="customToEdit"
      @hide="customDialog = false;
      customToEdit = null"
    />
    <contact
      :display="contactDialog"
      :title="contactTitle || 'Get in Contact'"
      @hide="contactDialog = false"
    />
    <alert />
  </v-app>
</template>

<script>
  import Vue from 'vue'

  import courseSelection from './components/selection/CourseSelection'
  import courseDisplay from './components/selection/CourseDisplay'
  import options from './components/selection/Options'
  import custom from './components/selection/Custom'
  import timetable from './components/timetable/Timetable'
  import contact from './components/Contact'
  import alert from './components/Alert'

  import image from './components/mixins/image'

  export default {
    data () {
      return {
        drawer: false,
        mouse: { x: 0, y: 0, held: false },
        pointers: {},
        contactDialog: false,
        contactTitle: null,
        customDialog: false,
        customToEdit: null,
        saving: false,
        items: [
          {
            icon: 'photo',
            title: 'Save as Image',
            action: this.save
          },
          {
            icon: 'refresh',
            title: 'Reset Page',
            action: this.reset
          },
          {
            icon: 'share',
            title: 'Share on Facebook',
            action: this.share
          },
          {
            icon: 'bug_report',
            title: 'Report a Bug',
            action: this.report
          },
          {
            icon: 'email',
            title: 'Get in Contact',
            action: this.contact
          }
        ],
        title: 'CrossAngles'
      }
    },
    computed: {
      meta () {
        return this.$store.state.meta
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
      },
      editCustom (customCourse) {
        this.customToEdit = this.$store.state.custom.filter(c => c.id === customCourse.code)[0]
        this.customDialog = true
      },
      save () {
        this.saving = true
        this.saveTimetable(() => { this.saving = false })
        this.drawer = false
      },
      reset () {
        this.$store.dispatch('reset')
        this.drawer = false
      },
      report () {
        this.contactDialog = true
        this.contactTitle = 'Report a Bug'
        this.drawer = false
      },
      contact () {
        this.contactDialog = true
        this.contactTitle = null
        this.drawer = false
      },
      share () {
        const sharingURL = encodeURIComponent(process.env.DOMAIN)
        const fbURL = 'https://www.facebook.com/sharer/sharer.php?u=' + sharingURL
        window.open(fbURL, 'FBsharer', 'width=600, height=400, scrollbars=no')
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
      timetable,
      custom,
      contact,
      alert
    },
    mixins: [ image ]
  }
</script>

<style scoped>
  .container.narrow {
    max-width: 900px;
  }
  .faded {
    opacity: 0.8;
  }
  .v-btn.fixed-width {
    min-width: 250px;
  }
</style>

<style>
  /* Fix strange dialog snapping */
  html.overflow-y-hidden > body {
    overflow-y: scroll;
  }
</style>
