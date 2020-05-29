<template>
  <div>
    <q-item dense class="cursor-pointer custom-button">
      <q-item-section side v-if="getChoiseFromDate">
        <q-item-label caption>{{ getChoiseFromDate.label }}</q-item-label>
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ displayDate }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-icon :name="icons.mdiMenuDown" />
      </q-item-section>
      <q-item-section side>
        <div class="items-center">
          <q-icon class="cursor-pointer custom-hover" color="grey" size="24px" :name="icons.mdiChevronLeft" @click.stop="prev()" />
          <q-icon class="cursor-pointer custom-hover" color="grey" size="24px" :name="icons.mdiChevronRight" @click.stop="next()" />
        </div>
      </q-item-section>

      <q-popup-proxy v-bind="popupProps">
        <q-card-section horizontal>
          <q-card-section class="q-pa-none" style="min-width: 150px">
            <q-list padding class="custom-tabs">
              <q-tabs v-bind="tabsProps" :indicator-color="color" v-model="choise">
                <q-tab label="Custom" name="custom" />
                <q-separator spaced />
                <q-tab :label="label" :name="value" v-for="{ value, label } in dates" :key="value" />
              </q-tabs>

              <template v-if="compare">
                <q-separator spaced />

                <q-item tag="label" dense clickable>
                  <q-item-section>
                    <q-item-label>Compare</q-item-label> <!-- TODO: lang -->
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle dense :color="toggleColor" v-model="comparing" />
                  </q-item-section>
                </q-item>
                <q-tabs v-bind="tabsProps" :indicator-color="prevColor" v-if="comparing" v-model="compare_choise">
                  <q-tab name="prev_period" :label="getCompareChoiseFromDate ? getCompareChoiseFromDate.label : 'Previous period'" /> <!-- TODO: lang -->
                  <q-tab name="prev_year" :label="'Last Year'" /> <!-- TODO: lang -->
                  <q-tab name="custom" :label="'Custom'" /> <!-- TODO: lang -->
                </q-tabs>
              </template>
            </q-list>
          </q-card-section>

          <q-separator vertical />

          <q-card-section class="q-pa-none">
            <q-item dense class="q-px-xs custom-input">
              <q-item-section side>
                <q-input v-bind="inputProps(maxEnd, end)" :color="color" v-model="start" />
              </q-item-section>
              <q-item-section>
                <q-icon :name="icons.mdiMinus" />
              </q-item-section>
              <q-item-section side>
                <q-input v-bind="inputProps(minStart, start)" :color="color" v-model="end" />
              </q-item-section>
            </q-item>

            <template v-if="comparing">
              <q-item-label caption class="q-pt-sm q-pl-md">Compare</q-item-label> <!-- TODO: lang -->
              <q-item dense class="q-px-xs custom-input">
                <q-item-section side>
                  <q-input v-bind="inputProps(maxEnd, prev_end)" :color="color" v-model="prev_start" />
                </q-item-section>
                <q-item-section>
                  <q-icon :name="icons.mdiMinus" />
                </q-item-section>
                <q-item-section side>
                  <q-input v-bind="inputProps(minStart, prev_start)" :color="color" v-model="prev_end" />
                </q-item-section>
              </q-item>
            </template>

            <q-separator class="q-mb-xs" />

            <div>
              Calendar
            </div>
          </q-card-section>
        </q-card-section>

        <template v-if="choise === 'custom' || comparing">
          <q-separator />

          <q-card-actions align="right">
            <q-btn no-caps flat :label="$q.lang.label.cancel" color="grey" @click="$refs.menu.hide()" />
            <q-btn no-caps flat :label="$q.lang.label.set" :color="color" @click="emitInput(), $refs.menu.hide()" />
          </q-card-actions>
        </template>
      </q-popup-proxy>
    </q-item>

    <q-item-label class="float-right" caption v-if="comparing">
      <!-- TODO: lang -->
      Compare to: {{ displayPrevDate }}
    </q-item-label>
  </div>
</template>

<script>
import { mdiChevronLeft, mdiChevronRight, mdiMenuDown, mdiMinus } from '@quasar/extras/mdi-v5'
import { startOfDate, endOfDate, deepEqual } from '../utils'
import { date } from 'quasar'
export default {
  name: 'QDateFilter',
  props: {
    menuProps: {
      type: Object,
      default: () => ({
        anchor: 'top right',
        transitionShow: 'jump-left',
        transitionHide: 'jump-right'
      })
    },
    compare: Boolean,
    periods: {
      type: Array,
      required: true
    },
    dateFormat: {
      type: String,
      default: () => 'YYYY-MM-DD'
    },
    displayFormat: {
      type: String,
      default: () => 'D MMM YYYY'
    },
    color: {
      type: String,
      default: () => 'blue'
    },
    prevColor: {
      type: String,
      default: () => 'orange'
    },
    toggleColor: {
      type: String,
      default: () => 'teal'
    }
  },

  data () {
    return {
      choise: 'custom',
      compare_choise: 'custom',
      comparing: false,

      icons: {
        mdiChevronLeft,
        mdiChevronRight,
        mdiMenuDown,
        mdiMinus
      },

      start: null,
      end: null,
      prev_start: null,
      prev_end: null
    }
  },

  computed: {
    // configs
    popupProps () {
      return {
        ref: 'menu',
        maximized: true,
        cover: true,
        maxHeight: '1000px',
        ...this.menuProps,
        persistent: this.choise === 'custom' || this.comparing
      }
    },
    tabsProps () {
      return {
        vertical: true,
        switchIndicator: true,
        noCaps: true,
        activeBgColor: this.$q.dark.isActive ? 'grey-9' : 'grey-2'
      }
    },
    inputProps () {
      return (rule, key) => ({
        dense: true,
        borderless: true,
        noErrorIcon: true,
        hideBottomSpace: true,
        type: 'date',
        rules: [val => rule(val, key)]
      })
    },

    // getters
    dates () {
      return this.periods.map(({ start = {}, end = {}, startOf, endOf, ...rest }) => {
        const today = new Date().toJSON().slice(0, 10)

        start = date.addToDate(today, start)
        end = date.addToDate(today, end)

        if (startOf) start = startOfDate(start, startOf)
        if (endOf) end = endOfDate(end, endOf)

        return { ...rest, start, end }
      })
    },
    prev_dates () {
      if (!this.comparing) return []
      return this.dates.map(({ start, end, prev, value }, idx, dates) => {
        start = date.addToDate(start, prev)
        end = date.addToDate(end, prev)
        const res = { start, end, value, label: 'Previous period' } // TODO: lang

        const next = dates[idx + 1]
        if (next) {
          const { label, prev: period } = next
          if (deepEqual(period, prev)) res.label = label
        }

        return res
      })
    },
    getChoiseFromDate () {
      return this.dates.find(({ start, end }) =>
        this.start === date.formatDate(start, this.dateFormat) &&
        this.end === date.formatDate(end, this.dateFormat))
    },
    getCompareChoiseFromDate () {
      return this.prev_dates.find(({ start, end }) =>
        this.prev_start === date.formatDate(start, this.dateFormat) &&
        this.prev_end === date.formatDate(end, this.dateFormat))
    },
    getDateFromChoise () {
      return this.dates.find(({ value }) => value === this.choise)
    },
    getPrevDateFromChoise () {
      return this.prev_dates.find(({ value }) => value === this.choise)
    },
    getDayDiff () {
      return date.getDateDiff(this.start, this.end, 'days')
    },
    getPeriodFromChoise () {
      return this.getDateFromChoise ? this.getDateFromChoise.prev : { days: -this.getDayDiff - 1 }
    },

    // rules
    minStart () {
      return (val, start) => start ? val >= start : true
    },
    maxEnd () {
      return (val, end) => end ? val <= end : true
    },

    // display values
    displayDate () {
      if (this.start === this.end) return date.formatDate(this.start, this.displayFormat)
      else if (date.isSameDate(this.start, this.end, 'month')) return `${date.formatDate(this.start, 'D')} - ${date.formatDate(this.end, this.displayFormat)}`
      else if (date.isSameDate(this.start, this.end, 'year')) return `${date.formatDate(this.start, 'D MMM')} - ${date.formatDate(this.end, this.displayFormat)}`
      else return `${date.formatDate(this.start, this.displayFormat)} - ${date.formatDate(this.end, this.displayFormat)}`
    },
    displayPrevDate () {
      if (this.prev_start === this.prev_end) return date.formatDate(this.prev_start, this.displayFormat)
      else if (date.isSameDate(this.prev_start, this.prev_end, 'month')) return `${date.formatDate(this.prev_start, 'D')} - ${date.formatDate(this.prev_end, this.displayFormat)}`
      else if (date.isSameDate(this.prev_start, this.prev_end, 'year')) return `${date.formatDate(this.prev_start, 'D MMM')} - ${date.formatDate(this.prev_end, this.displayFormat)}`
      else return `${date.formatDate(this.prev_start, this.displayFormat)} - ${date.formatDate(this.prev_end, this.displayFormat)}`
    }
  },

  watch: {
    choise (choise) {
      if (this.dates.findIndex(({ value }) => value === choise) !== -1) {
        const { start, end } = this.dates.find(({ value }) => value === choise)
        this.start = date.formatDate(start, this.dateFormat)
        this.end = date.formatDate(end, this.dateFormat)
      }
      if (this.comparing && this.prev_dates.findIndex(({ value }) => value === choise) !== -1) {
        const { start, end } = this.prev_dates.find(({ value }) => value === choise)
        this.prev_start = date.formatDate(start, this.dateFormat)
        this.prev_end = date.formatDate(end, this.dateFormat)
      }
      if (!this.comparing && choise !== 'custom') this.emitInput()
    },
    compare_choise () {
      if (this.compare_choise === 'prev_period') {
        if (this.prev_dates.findIndex(({ value }) => value === this.choise) !== -1) {
          const { start, end } = this.prev_dates.find(({ value }) => value === this.choise)
          this.prev_start = date.formatDate(start, this.dateFormat)
          this.prev_end = date.formatDate(end, this.dateFormat)
        } else {
          // se non è uno dei periodi rifletto a specchio
          const end = date.subtractFromDate(this.start, { days: 1 }),
            start = date.subtractFromDate(this.start, { days: this.getDayDiff + 1 })
          this.prev_start = date.formatDate(start, this.dateFormat)
          this.prev_end = date.formatDate(end, this.dateFormat)
        }
      } else if (this.compare_choise === 'prev_year') {
        const start = date.subtractFromDate(this.start, { year: 1 }),
          end = date.subtractFromDate(this.end, { year: 1 })
        this.prev_start = date.formatDate(start, this.dateFormat)
        this.prev_end = date.formatDate(end, this.dateFormat)
      }
    },
    start () { this.updateChoises() },
    end () { this.updateChoises() },
    prev_start () { this.updateChoises() },
    prev_end () { this.updateChoises() }
  },

  methods: {
    // actions
    prev () {
      const diff = this.getPeriodFromChoise
      this.start = date.formatDate(date.addToDate(this.start, diff), this.dateFormat)
      this.end = date.formatDate(date.addToDate(this.end, diff), this.dateFormat)
      if (this.comparing) {
        this.prev_start = date.formatDate(date.addToDate(this.prev_start, diff), this.dateFormat)
        this.prev_end = date.formatDate(date.addToDate(this.prev_end, diff), this.dateFormat)
      }
      this.emitInput()
    },
    next () {
      const diff = this.getPeriodFromChoise
      this.start = date.formatDate(date.subtractFromDate(this.start, diff), this.dateFormat)
      this.end = date.formatDate(date.subtractFromDate(this.end, diff), this.dateFormat)
      if (this.comparing) {
        this.prev_start = date.formatDate(date.subtractFromDate(this.prev_start, diff), this.dateFormat)
        this.prev_end = date.formatDate(date.subtractFromDate(this.prev_end, diff), this.dateFormat)
      }
      this.emitInput()
    },
    updateChoises () {
      this.choise = this.getChoiseFromDate?.value ?? 'custom'

      // fa parte dei periodi?
      if (this.getCompareChoiseFromDate) this.compare_choise = 'prev_period'

      // è l'anno precedente?
      else if (this.prev_start === date.formatDate(date.subtractFromDate(this.start, { year: 1 }), this.dateFormat) &&
        this.prev_end === date.formatDate(date.subtractFromDate(this.end, { year: 1 }), this.dateFormat)) this.compare_choise = 'prev_year'

      // è il periodo specchiato?
      else if (this.prev_start === date.formatDate(date.subtractFromDate(this.start, { days: this.getDayDiff + 1 }), this.dateFormat) &&
        this.prev_end === date.formatDate(date.subtractFromDate(this.start, { days: 1 }), this.dateFormat)) this.compare_choise = 'prev_period'

      else this.compare_choise = 'custom'
    },
    emitInput () {
      const range = {
        start: this.start,
        end: this.end
      }
      if (this.comparing) {
        range.prev_start = this.prev_start
        range.prev_end = this.prev_end
      }
      this.$emit('input', range)
      this.$refs.menu.hide()
    }
  }
}
</script>

<style lang="stylus" scoped>
.custom-tabs >>>
  .q-tab
    justify-content left !important
    padding 0 15px
    min-height 30px

  .q-tab
    .q-tab__content
      min-width 0

  .q-tab__label
    font-size 12px !important
    font-weight 400 !important

  .q-item__label
    font-size 12px !important

.custom-button >>>
  .q-list--dense > .q-item, .q-item--dense
    padding 2px 0

  .q-item__section--main ~ .q-item__section--side
    padding-left 2px

.custom-input >>>
  .q-field--dense
    .q-field__control
      height 28px

  .q-field__native
    padding 0px

  .q-item__section--side
    padding-right 0px

.custom-hover
  &:hover
    color $primary !important
</style>
