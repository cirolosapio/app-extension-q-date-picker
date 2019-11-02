<template>
  <q-page padding>
    <q-list class="float-left" style="min-width: 40vw">
      <q-item-label header>Model</q-item-label>
      <q-item v-for="(prop, key) in date" :key="key">
        <q-item-section>
          <q-item-label>{{key}}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item-label overline>{{prop}}</q-item-label>
        </q-item-section>
      </q-item>
      <q-separator spaced />
      <q-item-label header>Playground</q-item-label>
      <q-item>
        <q-item-section>
          <q-item-label>locale</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-select standout v-model="config.locale" :options="langOptions" dense emit-value map-options options-dense />
        </q-item-section>
      </q-item>
      <q-item v-for="(value, param) in colorsOptions" :key="`param-${param}`">
        <q-item-section>
          <q-item-label>{{param}}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-select standout :options="colors" emit-value v-model="colorsOptions[param]" dense options-dense>
            <template #option="{ opt, itemProps, itemEvents }">
              <q-item v-bind="itemProps" v-on="itemEvents" >
                <q-item-section>
                  <q-item-label>{{opt}}</q-item-label>
                </q-item-section>
                <q-item-section avatar>
                  <q-badge :color="opt" />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label>transition-show</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-input standout dense v-model="config.transitionShow" />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label>transition-hide</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-input standout dense v-model="config.transitionHide" />
        </q-item-section>
      </q-item>
      <q-item tag="label" clickable dense>
        <q-item-section>
          <q-item-label>noCompare</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-checkbox v-model="config.noCompare" />
        </q-item-section>
      </q-item>
    </q-list>

    <q-date-filter
      v-model="date"
      class="float-right"
      v-bind="{ ...config, ...colorsOptions }" />
  </q-page>
</template>

<style>
</style>

<script>
import languages from 'quasar/lang/index.json'
export default {
  name: 'PageIndex',
  data () {
    return {
      date: {},

      config: {
        locale: this.$q.lang.isoName,
        noCompare: false,
        transitionShow: 'jump-left',
        transitionHide: 'jump-right'
      },
      colorsOptions: {
        color: 'blue',
        previousColor: 'orange',
        toggleColor: 'teal'
      },

      langOptions: [],
      colors: [ 'blue', 'purple', 'red', 'green', 'teal', 'orange', 'indigo', 'yellow', 'pink' ]
    }
  },

  created () {
    this.langOptions = languages.map(({ isoName, nativeName }) => ({
      label: nativeName, value: isoName, disable: !['it', 'en-us'].includes(isoName)
    })).sort((a, b) => a.label > b.label)
  },

  watch: {
    locale (lang) {
      import(`quasar/lang/${lang}`).then(lang => {
        this.$q.lang.set(lang.default)
      })
    }
  }
}
</script>
