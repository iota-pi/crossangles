<template>
  <v-list v-if="courses.length > 0" class="py-0">
    <v-list-tile v-for="course in courses" :key="course.code">
      <v-list-tile-content>
        <v-list-tile-title>
          {{ course.code }}

          <span class="faded">
            — {{ course.title }}
          </span>
        </v-list-tile-title>
      </v-list-tile-content>

      <div class="no-spacing">
        <swatches
          v-model="course.color"
          :colors="colors"
          :row-length="4"
          popover-to="left"
          shapes="circles"
          :swatch-size="32"
          :trigger-style="{ width: '32px', height: '32px' }"
        />
      </div>

      <v-list-tile-action>
        <v-btn icon @click="courses.splice(courses.indexOf(course), 1)">
          <v-icon>close</v-icon>
        </v-btn>
      </v-list-tile-action>
    </v-list-tile>
  </v-list>
</template>

<script>
  import Swatches from 'vue-swatches'
  import 'vue-swatches/dist/vue-swatches.min.css'
  import colors from './mixins/colors'

  export default {
    data () {
      return {
        color: ''
      }
    },
    computed: {
      courses () {
        return this.$store.state.courses
      }
    },
    components: {
      Swatches
    },
    mixins: [ colors ]
  }
</script>

<style scoped>
  .faded {
    opacity: 0.7;
  }
  .no-spacing {
    line-height: 0.1;
    font-size: 1px;
  }
</style>
