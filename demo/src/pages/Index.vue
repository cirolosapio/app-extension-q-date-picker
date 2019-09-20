<template>
  <q-page padding>
    <q-list class="float-left" style="min-width: 40vw">
      <q-item-label header>Result</q-item-label>
      <q-item v-for="(prop, key) in date" :key="key">
        <q-item-section side>
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
          <q-item-label>Locale</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-select readonly v-model="locale" :options="['it', 'en-us']" dense />
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
      <q-item tag="label" clickable>
        <q-item-section no-wrap>
          <q-item-label>Disable comparing</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-checkbox v-model="noCompare" />
        </q-item-section>
      </q-item>
    </q-list>
    <q-date-filter
      v-model="date"
      class="float-right"
      :locale="locale"
      :no-compare="noCompare"
      :color="colorsOptions.color"
      :previous-color="colorsOptions.previousColor"
      :toggle-color="colorsOptions.toggleColor" />
  </q-page>
</template>

<style>
</style>

<script>
import { QCheckbox, QSeparator, QSelect, QBadge } from 'quasar'
export default {
  name: 'PageIndex',
  components: { QCheckbox, QSeparator, QSelect, QBadge },
  data () {
    return {
      date: {},
      colorsOptions: {
        color: 'primary',
        previousColor: 'amber',
        toggleColor: 'teal'
      },
      locale: 'en-us',
      noCompare: false,
      colors: [ 'primary', 'secondary', 'accent', 'red', 'green', 'teal', 'positive', 'negative', 'info', 'warning' ]
    }
  }
}
</script>
