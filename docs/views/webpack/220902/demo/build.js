const webpack = require('webpack')

// `webpack-cli` 与 `webpack/cli` 调来调去，逻辑复杂，为了方便，直接使用其 node api 进行示例，方便调试

// 1. 关于 ES 理解 webpack 的运行时代码
// 2. ES Module 是如何转化为 CommonJS 的
// 

function f1 () {
  return webpack({
    entry: './index.js',
    mode: 'none',
  })
}

function f2 () {
  return webpack({
    entry: './index.js',
    mode: 'none',
    infrastructureLogging: { // 用于基础设施水平的日志选项
      debug: true, // 开启特定日志比如插件(plugins)和加载器(loaders)的调试信息。 与 stats.loggingDebug 选项类似但仅仅对于基础设施而言。默认为 false。
      level: 'log', // 开启基础设施日志输出。与 stats.logging 选项类似但仅仅是对于基础设施而言。默认值为 'info'。
      /* 
      'none' - 禁用日志
      'error' - 仅仅显示错误
      'warn' - 仅仅显示错误与告警
      'info' - 显示错误、告警与信息
      'log' - 显示错误、告警，信息，日志信息，组别，清楚。 收缩的组别会在收缩的状态中被显示。
      'verbose' - 输出所有日志除了调试与追踪。收缩的组别会在扩展的状态中被显示。 
      */
    }
  })
}

f1().run((err, stat) => {
  // console.log(stat.toJson())
})
