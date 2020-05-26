<template>
  <div>
    <q-item dense class="cursor-pointer q-pr-xs q-pl-sm" style="min-height: 28px">
      <q-item-section side class="q-pr-sm-important">
        <q-item-label caption>{{ displayValue }}</q-item-label>
      </q-item-section>
      <q-item-section no-wrap>
        <q-item-label class="text-caption">
          {{ displayDate }}
        </q-item-label>
      </q-item-section>
      <q-item-section side class="q-pl-xs-important">
        <q-icon name="arrow_drop_down" />
      </q-item-section>
      <q-item-section side class="q-pl-xs-important">
        <div class="items-center">
          <q-icon class="cursor-pointer hover-black" color="grey" size="24px" name="keyboard_arrow_left" @click.stop="prev()" />
          <q-icon class="cursor-pointer hover-black" color="grey" size="24px" name="keyboard_arrow_right" @click.stop="next()" />
        </div>
      </q-item-section>

      <q-popup-proxy maximized cover :anchor="anchor" :transition-show="transitionShow" :transition-hide="transitionHide" max-height="1000px" :persistent="choise === 'custom' || comparing" ref="menu">
        <div class="column no-wrap justify-between" :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'">
          <div class="row">
            <div :class="$q.screen.xs ? 'col-4' : 'col-5'">
              <q-list padding class="custom-list" style="transition: width .3s, height .3s">
                <q-tabs no-caps dense vertical switch-indicator :indicator-color="color" :active-bg-color="activeBgColor" v-model="choise">
                  <q-tab :style="tabStyle" name="custom" :label="$q.lang.custom" />
                  <q-separator spaced />
                  <q-tab :style="tabStyle" :name="value" :label="$q.lang[value]" v-for="{ value } in periods" :key="value" />
                </q-tabs>
                <template v-if="!$q.screen.xs">
                  <q-separator spaced />
                  <q-item class="q-pl-none q-py-none q-my-xs" style="min-height: 20px" clickable :class="{ [activeBgColor]: choise === 'x_days_to_today' }" @click="choise = 'x_days_to_today'">
                    <q-separator vertical :color="choise === 'x_days_to_today' ? color : bg" style="width: 2px" />
                    <div class="flex items-baseline q-gutter-x-sm q-pl-md q-py-xs">
                      <q-input dense style="max-width: 30px" ref="days_to_today" v-model="days_to_today" @click.stop="$refs.days_to_today.focus()" />
                      <q-item-label>{{ $q.lang.daysToToday }}</q-item-label>
                    </div>
                  </q-item>
                  <q-item class="q-pl-none q-py-none q-my-xs" style="min-height: 20px" clickable :class="{ [activeBgColor]: choise === 'x_days_to_yesterday' }" @click="choise = 'x_days_to_yesterday'">
                    <q-separator vertical :color="choise === 'x_days_to_yesterday' ? color : bg" style="width: 2px" />
                    <div class="flex items-baseline q-gutter-x-sm q-pl-md q-py-xs">
                      <q-input dense style="max-width: 30px" ref="days_to_yesterday" v-model="days_to_yesterday" @click.stop="$refs.days_to_yesterday.focus()" />
                      <q-item-label>{{ $q.lang.daysToYesterday }}</q-item-label>
                    </div>
                  </q-item>
                </template>

                <template v-if="!noCompare">
                  <q-separator spaced />

                  <q-item tag="label" dense clickable :disable="choise === 'from_start'" :style="tabStyle">
                    <q-item-section>
                      <q-item-label>{{ $q.lang.compare }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-toggle dense :color="toggleColor" :disable="choise === 'from_start'" v-model="comparing" />
                    </q-item-section>
                  </q-item>
                  <q-tabs no-caps dense vertical switch-indicator :indicator-color="color" v-if="comparing" v-model="compare_choise">
                    <q-tab name="previous_period" :label="displayComparingValue" />
                    <q-tab name="previous_year" :label="$q.lang.last_year" />
                    <q-tab name="custom" :label="$q.lang.custom" />
                  </q-tabs>
                </template>

                <q-resize-observer :debounce="0" @resize="onResize" />
              </q-list>
            </div>

            <q-separator vertical />

            <div class="col">
              <div class="flex justify-between items-baseline q-px-xs custom-input">
                <q-input :color="color" dense type="date" :rules="[val => maxEnd(val, end)]" no-error-icon hide-bottom-space v-model="start" />
                <q-icon name="mdi-minus" />
                <q-input :color="color" dense type="date" :rules="[val => minStart(val, start)]" no-error-icon hide-bottom-space v-model="end" />
              </div>
              <template v-if="comparing">
                <q-item-label caption class="q-pt-sm q-pl-md">{{ $q.lang.compare }}</q-item-label>
                <div class="flex justify-between items-baseline q-px-xs custom-input">
                  <q-input :color="previousColor" dense type="date" :rules="[val => maxEnd(val, previous_end)]" no-error-icon hide-bottom-space v-model="previous_start" />
                  <q-icon name="mdi-minus" />
                  <q-input :color="previousColor" dense type="date" :rules="[val => minStart(val, previous_start)]" no-error-icon hide-bottom-space v-model="previous_end" />
                </div>
              </template>

              <q-separator class="q-mt-sm" />

              <div style="overflow-y: auto; overflow-x: hidden" :style="calendarHeight">
                <v-date-picker :color="color" :is-dark="$q.dark.isActive" mode="range" title-position="left" :rows="2" is-inline :attributes="attrs" is-expanded style="border-width: 0px; margin-right: 17px" v-model="selectedDate">
                  <template #header="{ title }">
                    <div class="vc-header vc-text-gray-900">
                      <div class="vc-title-layout align-left">
                        <div class="vc-title-wrapper">
                          <div class="vc-text-lg vc-text-gray-800 vc-font-semibold">{{ title }}</div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template #nav-left-button>
                    <q-icon name="keyboard_arrow_left" />
                  </template>
                  <template #nav-right-button>
                    <q-icon name="keyboard_arrow_right" class="q-pr-md" />
                  </template>
                </v-date-picker>
              </div>
            </div>
          </div>

          <div class="colum" v-if="['custom', 'x_days_to_today', 'x_days_to_yesterday'].includes(choise) || comparing">
            <q-separator />

            <q-card-actions align="right">
              <q-btn no-caps flat :label="$q.lang.label.cancel" color="grey" @click="$refs.menu.hide()" />
              <q-btn no-caps flat :label="$q.lang.label.set" :color="color" @click="ok(), $refs.menu.hide()" />
            </q-card-actions>
          </div>
        </div>
      </q-popup-proxy>
    </q-item>

    <q-item-label class="float-right" caption v-if="comparing">
      {{ $q.lang.compareTo }}: {{ displayComparingDate }}
    </q-item-label>
  </div>
</template>

<script>
import * as m from 'moment'
export default {
  name: 'QDateFilter',
  props: {
    locale: {
      type: String,
      required: true
    },
    value: {
      type: Object,
      required: true
    },
    noCompare: Boolean,
    maxYears: {
      type: Number,
      default: () => 2
    },
    transitionShow: {
      type: String,
      default: () => 'jump-left'
    },
    transitionHide: {
      type: String,
      default: () => 'jump-right'
    },
    anchor: {
      type: String,
      default: () => 'top right'
    },
    color: {
      type: String,
      default: () => 'blue'
    },
    previousColor: {
      type: String,
      default: () => 'yellow'
    },
    toggleColor: {
      type: String,
      default: () => 'teal'
    }
  },

  data () {
    return {
      start: '',
      end: '',
      previous_start: '',
      previous_end: '',

      choise: '',
      lastChoise: '',
      compare_choise: '',
      days_to_today: 30,
      days_to_yesterday: 30,
      custom: true,
      comparing: false,
      calendarHeight: null,

      periods: [
        { value: 'today', period: 'day', start: m(), end: m() },
        { value: 'yesterday', period: 'day', start: m().subtract(1, 'days'), end: m().subtract(1, 'days') },
        { period: 'week', value: 'this_week', start: m().startOf('week'), end: m() },
        { value: 'last_7_days', start: m().subtract(6, 'days'), end: m() },
        { value: 'last_week', period: 'week', start: m().subtract(1, 'week').startOf('week'), end: m().subtract(1, 'week').endOf('week') },
        { value: 'last_14_days', start: m().subtract(13, 'days'), end: m() },
        { value: 'this_month', period: 'month', start: m().startOf('month'), end: m() },
        { value: 'last_30_days', start: m().subtract(29, 'days'), end: m() },
        { value: 'last_month', period: 'month', start: m().subtract(1, 'month').startOf('month'), end: m().subtract(1, 'month').endOf('month') },
        // { value: 'this_quarter', period: 'quarter', start: m().startOf('quarter'), end: m() },
        // { value: 'last_90_days', start: m().subtract(89, 'days'), end: m() },
        // { value: 'last_quarter', period: 'quarter', start: m().subtract(1, 'quarter').startOf('quarter'), end: m().subtract(1, 'quarter').endOf('quarter') },
        { value: 'from_start', start: m().subtract(this.maxYears, 'years').startOf('month'), end: m() }
      ],
      previous_periods: [
        { value: 'today', display: 'yesterday', start: m().subtract(1, 'days'), end: m().subtract(1, 'days') },
        { value: 'yesterday', display: '2_days_ago', start: m().subtract(2, 'days'), end: m().subtract(2, 'days') },
        { value: 'this_week', display: 'last_week', start: m().subtract(1, 'week').startOf('week'), end: m().subtract(1, 'week').endOf('week') },
        { value: 'last_7_days', start: m().subtract(13, 'days'), end: m().subtract(7, 'days') },
        { value: 'last_week', display: '2_weeks_ago', start: m().subtract(2, 'week').startOf('week'), end: m().subtract(2, 'week').endOf('week') },
        { value: 'last_14_days', start: m().subtract(27, 'days'), end: m().subtract(14, 'days') },
        { value: 'this_month', display: 'last_month', start: m().subtract(1, 'month').startOf('month'), end: m().subtract(1, 'month').endOf('month') },
        { value: 'last_30_days', start: m().subtract(59, 'days'), end: m().subtract(30, 'days') },
        // { value: 'last_month', display: '2_months_ago', start: m().subtract(2, 'month').startOf('month'), end: m().subtract(2, 'month').endOf('month') },
        // { value: 'this_quarter', display: 'last_quarter', start: m().subtract(1, 'quarter').startOf('quarter'), end: m().subtract(1, 'quarter').endOf('quarter') },
        // { value: 'last_90_days', start: m().subtract(179, 'days'), end: m().subtract(90, 'days') },
        { value: 'last_quarter', display: '2_quarters_ago', start: m().subtract(2, 'quarter').startOf('quarter'), end: m().subtract(2, 'quarter').endOf('quarter') }
      ]
    }
  },

  created () {
    import(`../lang/${this.locale}`).then(({ default: { qDateFilter } }) => {
      Object.entries(qDateFilter).forEach(([key, value]) => {
        this.$set(this.$q.lang, key, value)
      })
    })
    if (this.locale !== 'en-us') import(`moment/locale/${this.locale}`)

    if (m(this.value.start).isValid() && m(this.value.end).isValid()) {
      this.selectedDate = {
        start: this.value.start,
        end: this.value.end
      }
    }
  },

  computed: {
    tabStyle () {
      return `padding: 0 ${this.$q.screen.xs ? 7 : 15}px`
    },
    activeBgColor () {
      return this.$q.dark.isActive ? 'grey-9' : 'grey-2'
    },
    bg () {
      return this.$q.dark.isActive ? 'dark' : 'white'
    },
    selectedDate: {
      get () {
        if (this.choise !== 'custom' && !this.comparing) this.ok()
        return {
          start: m(this.start).toDate(),
          end: m(this.end).toDate()
        }
      },
      set ({ start, end }) {
        this.start = m(start).format('YYYY-MM-DD')
        this.end = m(end).format('YYYY-MM-DD')

        this.updateChoise()
        this.updatePrevious()
      }
    },
    previousDate: {
      get () {
        if (this.isCustomCompare) this.compare_choise = 'custom'
        return {
          start: m(this.previous_start).toDate(),
          end: m(this.previous_end).toDate()
        }
      },
      set ({ start, end }) {
        this.previous_start = m(start).format('YYYY-MM-DD')
        this.previous_end = m(end).format('YYYY-MM-DD')
      }
    },
    attrs () {
      return (this.comparing && m(this.start).isValid() && m(this.end).isValid()) ? [
        {
          key: 'previousDate',
          highlight: this.previousColor,
          dates: [this.previousDate]
        }
      ] : []
    },
    minStart () {
      return (date, start) => start ? date >= start : true
    },
    maxEnd () {
      return (date, end) => end ? date <= end : true
    },
    displayValue () {
      if (this.periods.findIndex(({ value }) => value === this.choise) !== -1) return this.$q.lang[this.choise]
      else if (this.choise === 'x_days_to_today') return this.days_to_today + this.$q.lang.daysToToday
      else if (this.choise === 'x_days_to_yesterday') return this.days_to_yesterday + this.$q.lang.daysToYesterday
      return this.$q.lang.custom
    },
    displayDate () {
      // if (!m(this.start).isValid() || !m(this.end).isValid()) return ''
      if (this.start === this.end) return m(this.start).format('D MMM YYYY')
      else if (m(this.start).month() === m(this.end).month()) return `${m(this.start).date()} - ${m(this.end).format('D MMM YYYY')}`
      else if (m(this.start).year() === m(this.end).year()) return `${m(this.start).format('D MMM')} - ${m(this.end).format('D MMM YYYY')}`
      else return `${m(this.start).format('D MMM YYYY')} - ${m(this.end).format('D MMM YYYY')}`
    },
    displayComparingValue () {
      if (this.choise && !['from_start', 'custom', 'x_days_to_today', 'x_days_to_yesterday'].includes(this.choise) && !this.isCustom) {
        const { display } = this.previous_periods.find(({ value }) => value === this.choise)
        return display ? this.$q.lang[display] : this.$q.lang.previous_period
      } return this.$q.lang.previous_period
    },
    displayComparingDate () {
      if (this.previous_start === this.previous_end) return m(this.previous_start).format('D MMM YYYY')
      else if (m(this.previous_start).month() === m(this.previous_end).month()) return `${m(this.previous_start).date()} - ${m(this.previous_end).format('D MMM YYYY')}`
      else if (m(this.previous_start).year() === m(this.previous_end).year()) return `${m(this.previous_start).format('D MMM')} - ${m(this.previous_end).format('D MMM YYYY')}`
      else return `${m(this.previous_start).format('D MMM YYYY')} - ${m(this.previous_end).format('D MMM YYYY')}`
    },
    isCustomCompare () {
      let isCustom = true
      // fa parte dei periodi?
      this.previous_periods.forEach(({ start, end }) => {
        if (start.format('YYYY-MM-DD') === this.previous_start && end.format('YYYY-MM-DD') === this.previous_end) isCustom = false
      })

      // è l'anno precedente?
      if (m(this.start).subtract(1, 'years').format('YYYY-MM-DD') === this.previous_start &&
        m(this.end).subtract(1, 'years').format('YYYY-MM-DD') === this.previous_end) isCustom = false

      // è il periodo specchiato?
      const end = m(this.start).subtract(1, 'days').format('YYYY-MM-DD'),
        diff = m(this.end).diff(m(this.start), 'days'),
        start = m(this.start).subtract(diff + 1, 'days').format('YYYY-MM-DD')
      if (start === this.previous_start && end === this.previous_end) isCustom = false
      return isCustom
    },
    dayDiff () {
      return m(this.end).diff(m(this.start), 'days')
    },
    period () {
      if (this.lastChoise && !['x_days_to_today', 'x_days_to_yesterday'].includes(this.lastChoise)) {
        return this.periods.find(({ value }) => value === this.lastChoise).period
      }
      return null
    }
  },

  watch: {
    locale (lang) {
      import(`../lang/${lang}`).then(({ default: { qDateFilter } }) => {
        Object.entries(qDateFilter).forEach(([key, value]) => {
          this.$set(this.$q.lang, key, value)
        })
      })
    },
    choise (choise) {
      if (choise !== 'custom') this.lastChoise = choise
      if (choise === 'from_start') this.comparing = false
      if (this.periods.findIndex(({ value }) => value === choise) !== -1) {
        const { start, end } = this.periods.find(({ value }) => value === choise)
        this.selectedDate = { start: start.toDate(), end: end.toDate() }
      } else if (choise === 'x_days_to_today') this.selectedDate = { start: m().subtract(this.days_to_today - 1, 'days').toDate(), end: m().toDate() }
      else if (choise === 'x_days_to_yesterday') this.selectedDate = { start: m().subtract(this.days_to_yesterday, 'days').toDate(), end: m().subtract(1, 'days').toDate() }
      else return
      if (!this.comparing && !['x_days_to_today', 'x_days_to_yesterday'].includes(choise)) this.$refs.menu.hide()
    },
    days_to_today (days) {
      this.choise = 'x_days_to_today'
      this.selectedDate = { start: m().subtract(this.days_to_today - 1, 'days').toDate(), end: m().toDate() }
    },
    days_to_yesterday (days) {
      this.choise = 'x_days_to_yesterday'
      this.selectedDate = { start: m().subtract(this.days_to_yesterday, 'days').toDate(), end: m().subtract(1, 'days').toDate() }
    },
    comparing (comparing) {
      if (comparing && !this.compare_choise) this.compare_choise = 'previous_period'
    },
    compare_choise () {
      this.updatePrevious()
    }
  },

  methods: {
    ok () {
      const range = {
        start: this.start,
        end: this.end
      }
      if (this.comparing) {
        range.previous_start = this.previous_start
        range.previous_end = this.previous_end
      }
      this.$emit('input', range)
    },
    updateChoise () {
      // 1 - è una dei periodi
      // 2 - corrisponde a x_days_to_today
      // 3 - corrisponde a x_days_to_yesterday
      // 4 - è custom

      const start_from_today = m().subtract(this.days_to_today - 1, 'days'),
        end_from_today = m(),
        start_from_yesterday = m().subtract(this.days_to_yesterday, 'days'),
        end_from_yesterday = m().subtract(1, 'days')
      let isAPeriod = false

      this.periods.forEach(({ start, end }, index) => {
        if (start.format('YYYY-MM-DD') === this.start && end.format('YYYY-MM-DD') === this.end) {
          this.choise = this.periods[index].value
          isAPeriod = true
        }
      })

      if (start_from_today.format('YYYY-MM-DD') === this.start && end_from_today.format('YYYY-MM-DD') === this.end) this.choise = 'x_days_to_today'
      else if (start_from_yesterday.format('YYYY-MM-DD') === this.start && end_from_yesterday.format('YYYY-MM-DD') === this.end) this.choise = 'x_days_to_yesterday'
      else if (!isAPeriod) this.choise = 'custom'
    },
    updatePrevious () {
      if (this.compare_choise === 'previous_period') {
        if (this.previous_periods.findIndex(({ value }) => value === this.choise) !== -1) {
          const { start, end } = this.previous_periods.find(({ value }) => value === this.choise)
          this.previousDate = { start: start.toDate(), end: end.toDate() }
        } else {
          // se non è uno dei periodi rifletto a specchio
          const end = m(this.start).subtract(1, 'days').toDate(),
            diff = m(this.end).diff(m(this.start), 'days'),
            start = m(this.start).subtract(diff + 1, 'days').toDate()
          this.previousDate = { start, end }
        }
      } else if (this.compare_choise === 'previous_year') {
        const start = m(this.start).subtract(1, 'years').toDate(),
          end = m(this.end).subtract(1, 'years').toDate()
        this.previousDate = { start, end }
      }
    },
    prev () {
      if (this.period) {
        this.selectedDate = {
          start: m(this.start).subtract(1, this.period).toDate(),
          end: m(this.end).subtract(1, this.period).endOf(this.period).toDate()
        }
      } else {
        this.selectedDate = {
          start: m(this.start).subtract(this.dayDiff + 1, 'days').toDate(),
          end: m(this.end).subtract(this.dayDiff + 1, 'days').toDate()
        }
      }
      this.ok()
    },
    next () {
      if (this.period) {
        this.selectedDate = {
          start: m(this.start).add(1, this.period).toDate(),
          end: m(this.end).add(1, this.period).endOf(this.period).toDate()
        }
      } else {
        this.selectedDate = {
          start: m(this.start).add(this.dayDiff + 1, 'days').toDate(),
          end: m(this.end).add(this.dayDiff + 1, 'days').toDate()
        }
      }
      this.ok()
    },
    onResize () {
      let height = 30 * (this.periods.length) + 150
      height += this.$q.screen.xs ? 108 : 0
      height += this.comparing ? 38 : 0
      height += this.noCompare ? (this.$q.screen.xs ? -16 : -45) : 0
      height += 'px'
      this.calendarHeight = { height }
    }
  }
}
</script>

<style lang="stylus">
.custom-list
  .q-tab
    justify-content left !important
    min-height 30px

  .q-tab__label
    font-size 12px !important
    font-weight 400 !important

  .q-item__label
    font-size 12px !important

  .q-field--dense
    .q-field__control
      height 20px

.custom-input
  .q-field--dense
    .q-field__control
      height 30px

  .q-field__native
    padding 0px

.vc-grid-container
  padding-right 15px

.vc-arrows-container
  padding-right 24px !important

.vc-grid-cell
  .on-left
    margin-right 0

  .on-right
    margin-left 0

.hover-black
  &:hover
    color $primary !important

.q-pl-xs-important
  padding-left 4px !important

.q-pr-sm-important
  padding-right 8px !important
</style>
