<template>
  <v-navigation-drawer
    v-model="visible"
    disable-resize-watcher
    state
    clipped
    fixed
    app
  >
    <v-list>
      <template v-for="(item, i) in items">
        <v-divider
          v-if="item.divider"
          :key="'divider' + i"
        />
        <v-list-tile
          v-else
          :key="'item' + i"
          value="true"
          class="no-primary--text"
          :href="item.href"
          target="_blank"
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
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
  export default {
    props: {
      display: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        items: [
          {
            icon: 'help',
            title: 'About CrossAngles',
            action: () => this.$emit('about')
          },
          {
            divider: true
          },
          {
            icon: 'event',
            title: 'Add a Custom Event',
            action: () => this.$emit('custom')
          },
          {
            icon: 'refresh',
            title: 'Reset Page',
            action: this.reset
          },
          {
            divider: true
          },
          {
            icon: 'photo',
            title: 'Save as Image',
            action: () => this.$emit('save')
          },
          {
            icon: 'share',
            title: 'Share on Facebook',
            action: this.share
          },
          {
            divider: true
          },
          {
            icon: 'email',
            title: 'Get in Contact',
            action: () => this.$emit('contact')
          },
          {
            icon: 'bug_report',
            title: 'Report a Bug',
            href: process.env.VUE_APP_GITHUB + '/issues',
            action: () => window.dataLayer.push({
              event: 'side_menu',
              label: 'Bug Report'
            })
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
          } else {
            window.dataLayer.push({
              event: 'side_menu',
              label: 'Show Menu'
            })
          }
        }
      }
    },
    methods: {
      reset () {
        this.$store.dispatch('reset')
        this.visible = false

        window.dataLayer.push({
          event: 'side_menu',
          label: 'Reset'
        })
      },
      share () {
        const sharingURL = encodeURIComponent(process.env.VUE_APP_DOMAIN)
        const fbURL = 'https://www.facebook.com/sharer/sharer.php?u=' + sharingURL
        window.open(fbURL, 'FBsharer', 'width=600, height=400, scrollbars=no')
        this.visible = false

        window.dataLayer.push({
          event: 'side_menu',
          label: 'Share'
        })
      }
    }
  }
</script>

<style>
  /* .no-primary--text a.primary--text {
    color: inherit !important;
  } */
</style>
