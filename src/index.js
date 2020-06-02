/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

const { green } = require('chalk')

const extendConf = function (conf) {
  // make sure qdatepicker boot file is registered
  conf.boot.push('~quasar-app-extension-q-date-picker/src/boot/q-date-picker.js')
  console.log(green(' App ·') + ' Extension(q-date-picker): Adding q-date-picker boot reference to your quasar.conf.js')

  // make sure boot & component files transpile
  conf.build.transpileDependencies.push(/quasar-app-extension-q-date-picker[\\/]src/)
}

module.exports = function (api) {
  // register JSON api
  api.registerDescribeApi('QDatePicker', './component/QDatePicker.json')

  api.extendQuasarConf(extendConf)
}
