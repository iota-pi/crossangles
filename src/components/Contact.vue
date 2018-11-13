<template>
  <v-dialog
    v-model="show"
    :max-width="700"
    persistent
  >
    <v-card>
      <v-form
        ref="contactForm"
        v-model="valid"
      >
        <v-card-title class="pb-2">
          <span class="headline">{{ title }}</span>
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
          <v-text-field
            ref="nameField"
            v-model="name"
            label="Your Name"
            hide-details
            prepend-icon="person"
            required
            :rules="[
              v => !!v || 'Please type a message'
            ]"
          />
          <v-text-field
            v-model="email"
            type="email"
            label="Your Email"
            prepend-icon="email"
            required
            :rules="[
              v => !!v || 'Please enter your email address',
              v => !v || emailRegex.test(v) || 'This email address doesn\'t look right',
              v => !v || v.length <= 254 || 'Imagine how painful that would be to type in!'
            ]"
            validate-on-blur
          />
          <v-textarea
            v-model="body"
            label="What would you like us to know?"
            rows="4"
            :counter="5000"
            required
            :rules="[
              v => !!v || 'Please type a message',
              v => !v || v.length <= 6000 || 'Please refrain from sending me essays',
              v => !v || v.length <= 5000 || 'Please limit your message to 5000 characters'
            ]"
          />
        </v-card-text>

        <v-card-actions>
          <v-btn
            block
            color="primary"
            :disabled="!valid"
            @click="submit"
          >
            Submit
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  import axios from 'axios'

  export default {
    props: {
      title: {
        type: String,
        default: 'Get in Contact'
      },
      display: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        name: null,
        email: null,
        body: null,
        valid: false,
        emailRegex: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/
      }
    },
    computed: {
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
    },
    watch: {
      show () {
        // Reset all fields when dialog is hidden
        if (this.show) {
          this.$nextTick(() => this.$refs.nameField.focus())
        } else {
          this.name = null
          this.email = null
          this.body = null
          this.$refs.contactForm.reset()
        }
      }
    },
    methods: {
      submit () {
        axios.post('https://' + process.env.VUE_APP_DOMAIN + '/contact/', {
          name: this.name,
          email: this.email,
          body: this.body
        }).then(() => {
          this.$store.commit('alert', {
            message: 'Success. Thanks for getting in contact!',
            type: 'success'
          })
        }).catch(error => {
          this.$store.commit('alert', {
            message: error.response.data.error,
            type: 'error'
          })
        })
        this.$emit('hide')
      }
    }
  }
</script>
