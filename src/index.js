/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

const extendConf = function (conf) {
  // make sure qfilter boot file is registered
  conf.boot.push('~quasar-app-extension-q-date-filter/src/boot/q-date-filter.js')
  console.log(` App Extension (q-date-filter) Info: 'Adding q-date-filter boot reference to your quasar.conf.js'`)

  // make sure boot & component files transpile
  conf.build.transpileDependencies.push(/quasar-app-extension-q-date-filter[\\/]src/)
}

module.exports = function (api) {
  // quasar compatibility check
  api.compatibleWith('quasar', '^1.0.0')
  api.compatibleWith('@quasar/app', '^1.0.0')

  // register JSON api
  api.registerDescribeApi('QDateFilter', './component/QDateFilter.json')

  api.extendQuasarConf(extendConf)
}
