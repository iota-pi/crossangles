<template>
  <v-app>
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
      <v-container fluid>
        <course-selection />
      </v-container>
    </v-content>
    <v-footer app>
      <v-container fluid class="py-0">
        <span>Data updated: blah blah blah</span>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script>
import courseSelection from './components/CourseSelection'

export default {
  data () {
    return {
      drawer: false,
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
  mounted () {
    this.$store.dispatch('loadData')
  },
  name: 'App',
  components: {
    courseSelection
  }
}
</script>
