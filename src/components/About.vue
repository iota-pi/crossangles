<template>
  <v-dialog
    v-model="show"
    :max-width="700"
    lazy
  >
    <v-card>
      <v-card-title class="pb-2">
        <span class="headline">About CrossAngles</span>
        <v-spacer />
        <v-btn
          icon
          flat
          @click="show = false"
        >
          <v-icon color="grey darken-2">close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-0">
        <p>
          CrossAngles is provided by
          <a
            href="https://www.campusbiblestudy.org/"
            target="_blank"
          >Campus Bible Study</a>—a group of people at UNSW who are
          interested in learning together about Jesus from the Bible.
          Whether you follow Jesus, or want to find out what He's all about,
          Campus Bible Study is a great place for you to learn more.
          If you've never come before, we recommend checking out the Bible talks.
        </p>

        <p class="mb-0">
          The data was last updated at
          <span class="font-weight-regular">
            {{ meta.updateTime }} ({{ meta.updateDate }})
          </span>
          from
          <a
            href="http://classutil.unsw.edu.au"
            target="_blank"
          >classutil.unsw.edu.au</a>.
          CrossAngles comes without any guarantee of data accuracy or of optimality.
          We also collect anonymous information about how people tend to use
          this tool to help us make improvements.
          If you have any questions or suggestions, please
          <a
            class="underlined"
            @click="$emit('contact')"
          >contact us</a>.
        </p>
      </v-card-text>

      <v-card-actions>
        <v-btn
          block
          flat
          color="primary"
          @click="$emit('hide')"
        >
          Done
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    props: {
      display: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      meta () {
        return this.$store.state.meta
      },
      show: {
        get () {
          return this.display
        },
        set (newValue) {
          if (!newValue) {
            this.$emit('hide')
          }
        }
      }
    }
  }
</script>

<style scoped>
  a.underlined {
    text-decoration: underline;
  }
</style>
