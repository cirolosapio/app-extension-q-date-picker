<template>
  <q-page padding>
    <q-date-picker class="fixed-top-right" style="margin-top: 70px;margin-right: 20px" v-bind="{ now, periods, compare, clearable, ...colorsOptions, ...formatOptions, labels: labelOptions }" v-model="date" />

    <div class="row">
      <q-list dense class="col-auto">
        <q-item-label header>Model</q-item-label>
        <q-item v-for="(prop, key) in date" :key="key">
          <q-item-section>
            <q-item-label>{{ key }}</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label overline>{{ prop }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item-label header>Playground</q-item-label>
        <q-item>
          <q-item-section>
            <q-item-label>Quasar Language</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-select standout :options="langOptions" dense emit-value map-options options-dense :hint="`First day of week: ${$q.lang.date.firstDayOfWeek}`" v-model="locale" />
          </q-item-section>
        </q-item>

        <q-item-label header>Colors</q-item-label>
        <q-item v-for="(value, param) in colorsOptions" :key="`option-${param}`">
          <q-item-section>
            <q-item-label>{{ param }}</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-select standout :options="colors" emit-value dense options-dense v-model="colorsOptions[param]">
              <template #option="{ opt, itemProps, itemEvents }">
                <q-item v-bind="itemProps" v-on="itemEvents">
                  <q-item-section>
                    <q-item-label>{{ opt }}</q-item-label>
                  </q-item-section>
                  <q-item-section avatar>
                    <q-badge :color="opt" />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-item-section>
        </q-item>

        <q-item-label header>Labels</q-item-label>
        <q-item v-for="(value, param) in labelOptions" :key="`option-${param}`">
          <q-item-section>
            <q-item-label>{{ param }}</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-input dense standout v-model="labelOptions[param]" />
          </q-item-section>
        </q-item>

        <q-item-label header>Formats</q-item-label>
        <q-item v-for="(value, param) in formatOptions" :key="`option-${param}`">
          <q-item-section>
            <q-item-label>{{ param }}</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-input dense standout v-model="formatOptions[param]" />
          </q-item-section>
        </q-item>

        <q-item-label header>Features</q-item-label>
        <q-item dense>
          <q-item-section>
            <q-item-label>Reference day</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input dense standout mask="####-##-##" v-model="now">
              <template #append>
                <q-icon name="mdi-calendar-blank" class="cursor-pointer">
                  <q-popup-proxy transition-show="scale" transition-hide="scale" ref="qDateProxy">
                    <q-date today-btn mask="YYYY-MM-DD" v-model="now" @input="() => $refs.qDateProxy.hide()" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-item-section>
        </q-item>
        <q-item tag="label" clickable dense>
          <q-item-section>
            <q-item-label>Enable compare mode</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="compare" />
          </q-item-section>
        </q-item>
        <q-item tag="label" clickable dense>
          <q-item-section>
            <q-item-label>Enable clearable button</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="clearable" />
          </q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item-label header>Periods</q-item-label>
        <q-markup-table dense>
          <thead>
            <tr>
              <td class="text-caption text-left" :class="$q.dark.isActive ? 'text-grey' : 'text-grey-10'" colspan="4">
                By clicking on the <b>Period</b> column you can change the label
              </td>
            </tr>
            <tr>
              <th class="text-center">
                <q-checkbox dense :value="toggleAllValue" @input="toggleAll" />
              </th>
              <th class="text-left">Period</th>
              <th class="text-left">Configuration</th>
              <th class="text-left">Previous</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="({ label, value, prev, ...rest }, idx) in examples" :key="value">
              <td class="text-center">
                <q-checkbox dense :val="value" v-model="filter" />
              </td>
              <td class="text-left cursor-pointer">
                {{ label }}
                <q-popup-edit v-model="examples[idx].label">
                  <q-input dense autofocus v-model="examples[idx].label" />
                </q-popup-edit>
              </td>
              <td class="text-left text-caption">{{ rest }}</td>
              <td class="text-left text-caption">{{ prev }}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-list>
    </div>
  </q-page>
</template>

<style>
</style>

<script>
import languages from 'quasar/lang/index.json'
export default {
  name: 'Index',
  data () {
    return {
      date: {},

      filter: [],
      examples: [
        { label: 'Today', value: 'today', prev: { days: -1 } },
        { label: 'Yesterday', value: 'yesterday', prev: { days: -1 }, start: { days: -1 }, end: { days: -1 } },
        { label: '2 days ago', value: '2_days_ago', prev: { days: -1 }, start: { days: -2 }, end: { days: -2 } },
        { label: 'This week', value: 'this_week', prev: { days: -7 }, startOf: 'week', endOf: 'week' },
        { label: 'Last week', value: 'last_week', prev: { days: -7 }, start: { days: -7 }, startOf: 'week', end: { days: -7 }, endOf: 'week' },
        { label: '2 weeks ago', value: '2_weeks_ago', prev: { days: -7 }, start: { days: -14 }, startOf: 'week', end: { days: -14 }, endOf: 'week' },
        { label: 'This month', value: 'this_month', prev: { month: -1 }, startOf: 'month', endOf: 'month' },
        { label: 'Last month', value: 'last_month', prev: { month: -1 }, start: { month: -1 }, startOf: 'month', end: { month: -1 }, endOf: 'month' },
        { label: '2 months ago', value: '2_months_ago', prev: { month: -1 }, start: { month: -2 }, startOf: 'month', end: { month: -2 }, endOf: 'month' },

        { label: 'Last 7 days', value: 'last_7_days', prev: { days: -7 }, start: { days: -6 } },
        { label: 'Last 14 days', value: 'last_14_days', prev: { days: -14 }, start: { days: -13 } },
        { label: 'Last 30 days', value: 'last_30_days', prev: { days: -30 }, start: { days: -29 } },
        { label: 'Last 90 days', value: 'last_90_days', prev: { days: -90 }, start: { days: -89 } }

        // { label: 'This quarter', value: 'this_quarter', period: 'quarter', start: m().startOf('quarter') },
        // { label: 'Last quarter', value: 'last_quarter', period: 'quarter', start: m().subtract(1, 'quarter').startOf('quarter'), end: m().subtract(1, 'quarter').endOf('quarter') },
        // { label: 'from start', value: 'from_start', start: m().subtract(this.maxYears, 'years').startOf('month') }
      ],

      now: null,
      compare: false,
      clearable: false,
      labelOptions: {
        custom: 'Custom',
        last_year: 'Last Year',
        compare: 'Compare',
        prev_period: 'Previous Period'
      },
      formatOptions: {
        displayFormat: 'D MMM YYYY'
      },
      colorsOptions: {
        color: 'blue',
        prevColor: 'orange',
        toggleColor: 'teal'
      },

      locale: this.$q.lang.isoName,
      langOptions: [],
      colors: ['blue', 'purple', 'red', 'green', 'teal', 'orange', 'indigo', 'yellow', 'pink']
    }
  },

  created () {
    this.langOptions = languages.map(({ isoName, nativeName }) => ({
      label: nativeName, value: isoName
    })).sort((a, b) => a.label > b.label)

    this.toggleAll()
  },

  computed: {
    periods () {
      return this.examples.filter(({ value }) => this.filter.includes(value))
    },
    toggleAllValue () {
      if (this.filter.length === this.examples.length) return true
      else if (this.filter.length === 0) return false
      return undefined
    }
  },

  watch: {
    locale (lang) {
      import(`quasar/lang/${lang}`).then(lang => {
        this.$q.lang.set(lang.default)
      })
    }
  },

  methods: {
    toggleAll () {
      if (this.filter.length !== this.examples.length) this.filter = this.examples.map(({ value }) => value)
      else this.filter = []
    }
  }
}
</script>
