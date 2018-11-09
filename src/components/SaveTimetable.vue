<template>
  <v-layout class="font-weight-light pt-4" row>
    <v-flex class="text-xs-center">
      <v-btn color="primary" @click="$emit('save')" class="fixed-width">
        <span v-if="!saving">Save as Image</span>
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
</template>

<script>
  export default {
    props: {
      saving: {
        type: Boolean,
        default: false
      }
    }
  }
</script>

<style>
  .v-btn.fixed-width {
    min-width: 175px;
  }
</style>
