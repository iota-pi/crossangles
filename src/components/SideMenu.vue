<template>
  <v-navigation-drawer
    v-model="visible"
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
</template>

<script>
  export default {
    data () {
      return {
        items: [
          {
            icon: 'event',
            title: 'Add a Custom Event',
            action: () => this.$emit('custom')
          },
          {
            icon: 'photo',
            title: 'Save as Image',
            action: () => this.$emit('save')
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
            action: () => this.$emit('report')
          },
          {
            icon: 'email',
            title: 'Get in Contact',
            action: () => this.$emit('contact')
          }
        ]
      }
    },
    computed: {
      visible: {
        get () {
          return this.display
        },
        set (newValue) {
          if (!newValue) {
            this.$emit('hide')
          }
        }
      }
    },
    methods: {
      reset () {
        this.$store.dispatch('reset')
        this.drawer = false
        this.$emit('hide')
      },
      share () {
        const sharingURL = encodeURIComponent(process.env.VUE_APP_DOMAIN)
        const fbURL = 'https://www.facebook.com/sharer/sharer.php?u=' + sharingURL
        window.open(fbURL, 'FBsharer', 'width=600, height=400, scrollbars=no')
        this.$emit('hide')
      }
    },
    props: {
      display: {
        type: Boolean,
        default: false
      }
    }
  }
</script>
