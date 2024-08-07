---
title: vue-devtools 如何打开指定vue文件源码阅读
date: 2021-09-11
tags:
 - 源码阅读      
categories: 
 - frontEnd
---

## 疑问
1. vue-devtools如何打开本地文件的
2. 怎么知道我有什么编辑器
3. 知道其怎么启动本地后，有什么收获，可以用来项目优化？

## 1. 原理
1. 点击按钮后，插件发送了get请求：/__open-in-editor?file=src/App.vue
2. 只要监听了该请求，我们才能响应事件，进行回调方法的调用（依赖 **@vue/cli-service/lib/commands/serve.js**实现该点，进行监听）
3. 我们可以在监听的回调函数里，解析该请求的参数，从而得知要打开哪个文件。回调函数最好进行封装，可以通过文件参数的有无，决定是否去执行后续的打开文件操作。（依赖 **launch-editor-middleware**返回的方法实现该点，回调封装，根据参数有无调用打开文件操作）
4. 有了文件参数的路径，便能根据不同系统的实现方式，猜测对应编辑器，执行打开对应编辑器且打开文件的操作。（依赖 **launchEditor**便实现该点，打开文件）


总结：    
1. @vue/cli-service/lib/commands/serve.js文件中监听__open-in-editor，以依赖launch-editor-middleware返回的函数launchEditorMiddleware作为响应函数。
2. launchEditorMiddleware响应函数中，根据文件有无，调用依赖launch-editor的launch方法去执行打开文件的操作。
3. launch方法根据不同系统，且猜测对应编辑器，去实现打开文件操作。




## 2. serve.js 服务（主入口）

```js
// /node_modules/@vue/cli-service/lib/commands/serve.js
const launchEditorMiddleware = require('launch-editor-middleware')


before (app, server) {
  // 监听__open-in-editor，并调用launchEditorMiddleware取得回调函数
  app.use('/__open-in-editor', launchEditorMiddleware(() => console.log(
    `To specify an editor, specify the EDITOR env variable or ` +
    `add "editor" field to your Vue project config.\n`
  )))
}
```




## 3. launch-editor-middleware 启动编辑器中间件

```js
const url = require('url')
const path = require('path')
const launch = require('launch-editor')

module.exports = (specifiedEditor, srcRoot, onErrorCallback) => {
  // specifiedEditor传过来的是一个函数，里面执行打印操作。() => console.log()
  if (typeof specifiedEditor === 'function') {
    // 该打印操作的函数赋值给onErrorCallback错误回调函数 本身初始化
    onErrorCallback = specifiedEditor
    specifiedEditor = undefined
  }

  // srcRoot如果是函数，会赋值给onErrorCallback错误回调函数
  // 此时为undefined，不进入
  if (typeof srcRoot === 'function') { 
    onErrorCallback = srcRoot
    srcRoot = undefined
  }

  // process.cwd()  方法返回 Node.js 进程的当前工作目录。
  // 此时srcRoot赋值为vue项目根目录
  srcRoot = srcRoot || process.cwd() 

  // 返回响应函数
  return function launchEditorMiddleware (req, res, next) {
    // url.parse(urlStr, [parseQueryString], [slashesDenoteHost])
    // 参1 url文本，
    // 参2 是否解析查询字符串，调用了querystring module 去解析查询字符串
    // 参3 斜线表示主机
    /* 
      url.parse('/foo/bar?key=yeah')
      {
        search: '?key=yeah',
        query: 'key=yeah',
        pathname: '/foo/bar',
        path: '/foo/bar?key=yeah',
        href: '/foo/bar?key=yeah'
      }

      url.parse('/foo/bar?key=yeah', true) // 解析查询字符串
      {
        search: '?key=yeah',
        query: [Object: null prototype] { key: 'yeah' },
        pathname: '/foo/bar',
        path: '/foo/bar?key=yeah',
        href: '/foo/bar?key=yeah'
      }

      // 斜线表示主机 在 非// 下无效
      url.parse('/foo/bar?key=yeah', false, true) 
      {
        hostname: null,
        search: '?key=yeah',
        query: 'key=yeah',
        pathname: '/foo/bar',
        path: '/foo/bar?key=yeah',
        href: '/foo/bar?key=yeah'
      }

      // 斜线表示主机 在 // 下有效
      url.parse('//foo/bar?key=yeah', false, true)
      {
        hostname: 'foo',
        hash: null,
        search: '?key=yeah',
        query: 'key=yeah',
        pathname: '/bar',
        href: '//foo/bar?key=yeah'
      }
    */
    
    // http://localhost:8080/__open-in-editor?file=src/App.vue
    // query: {file: 'src/App.vue' }
    const { file } = url.parse(req.url, true).query || {}
    if (!file) { // 无文件相对路径，返回报错
      res.statusCode = 500
      res.end(`launch-editor-middleware: required query param "file" is missing.`)
    } else { // 有文件相对路径，执行打开文件的操作
      // 根目录+文件字段 可能包含行列信息， undefined， 错误函数 () => console.log()
      launch(path.resolve(srcRoot, file), specifiedEditor, onErrorCallback)
      res.end()
    }
  }
}
```




## 4. launch-editor 启动编辑器

### 4.1 launchEditor 启动编辑器主函数

```js
/**
 * @params file 文件绝对路径 可能包含行列信息
 * @params specifiedEditor 指定编辑器
 * @params onErrorCallback 错误回调
 */
function launchEditor (file, specifiedEditor, onErrorCallback) {
  // 解析文件路径信息，后面有讲到该方法
  const parsed = parseFile(file) 
  let { fileName } = parsed // 纯粹文件绝对路径
  const { lineNumber, columnNumber } = parsed // 行信息 列信息

  if (!fs.existsSync(fileName)) { // 文件是否存在 不存在则返回，后面有讲到该方法
    return
  }

  // 上层传进来是undefined 所以此处不进入
  // 如果为函数，则会跟launch-editor-middleware内部写的一样，赋值给错误回调函数，本身初始化
  if (typeof specifiedEditor === 'function') {
    onErrorCallback = specifiedEditor
    specifiedEditor = undefined
  }
  
  // 错误回调函数进行封装，多了默认错误文件名提示，后面有讲到该方法
  onErrorCallback = wrapErrorCallback(onErrorCallback)

  // 猜测使用的编辑器，后面有讲到该方法
  const [editor, ...args] = guessEditor(specifiedEditor)
  if (!editor) { // 没有猜测到对应编辑器，就报错
    onErrorCallback(fileName, null)
    return
  }


  // linux平台 
  // 且 文件名路径以/mnt/开头
  // 且 当前系统发行版本是微软标志
  if (
    process.platform === 'linux' &&
    fileName.startsWith('/mnt/') &&
    /Microsoft/i.test(os.release()) // process.platform , os.release()，后面有讲到该方法
  ) {
    // Assume WSL / "Bash on Ubuntu on Windows" is being used, and
    // that the file exists on the Windows file system.
    // `os.release()` is "4.4.0-43-Microsoft" in the current release
    // build of WSL, see: https://github.com/Microsoft/BashOnWindows/issues/423#issuecomment-221627364
    // When a Windows editor is specified, interop functionality can
    // handle the path translation, but only if a relative path is used.
    /* 
      假设 WSL / "在 Windows 上的 Ubuntu 上的 Bash" 正在被使用，并且该文件存在于 Windows 文件系统中。
      'os.release() 于 "4.4.0-43-Microsoft" 在 Wsl 的当前版本构建中， 请参阅： https://github.com/Microsoft/BashOnWindows/issues/423#issuecomment-221627364
      指定 Windows 编辑器时，互操作功能可以处理路径转换，但前提是使用相对路径。 
     */
    
    // 如果满足平台条件，此处会取得文件相对项目的相对地址，后面有讲到该方法
    // 项目地址  d:\\vue\\src\\components\\HelloWorld.vue
    // 相对地址  src\\components\\HelloWorld.vue
    fileName = path.relative('', fileName) 
  }

  //如果有行信息
  if (lineNumber) {
    // 取得额外的坐标信息数组，后面有讲到该方法
    const extraArgs = getArgumentsForPosition(editor, fileName, lineNumber, columnNumber)
    // 推入参数数组里
    args.push.apply(args, extraArgs)
  } else {
    args.push(fileName)
  }
  
  // 有子进程存在，且是终端文本编辑器
  if (_childProcess && isTerminalEditor(editor)) {
    // There's an existing editor process already and it's attached
    // to the terminal, so go kill it. Otherwise two separate editor
    // instances attach to the stdin/stdout which gets confusing.
    // 如果现有一个编辑器进程并且连接到终端，就关闭他。否则两个独立编辑器实例将会在输出输入上混乱
    // 传入SIGKILL 它会无条件地终止所有平台上的 Node.js。
    _childProcess.kill('SIGKILL')
  }

  if (process.platform === 'win32') {
    // On Windows, launch the editor in a shell because spawn can only
    // launch .exe files.
    // window系统，启动编辑器，并携带参数
    
    // child_process.spawn(command[, args][, options])
    // 方法使用给定的 command 和 args 中的命令行参数衍生新进程。
    _childProcess = childProcess.spawn(
      'cmd.exe', // 要运行的命令
      ['/C', editor].concat(args), // 字符串参数列表
      { stdio: 'inherit' } // 子进程的标准输入输出配置
    )
  } else {
    _childProcess = childProcess.spawn(editor, args, { stdio: 'inherit' })
  }
  _childProcess.on('exit', function (errorCode) { // 监听退出子进程
    _childProcess = null // 本身初始化

    if (errorCode) { // 如果是错误退出的，错误码报错
      onErrorCallback(fileName, '(code ' + errorCode + ')')
    }
  })

  _childProcess.on('error', function (error) { // 错误码报错
    onErrorCallback(fileName, error.message)
  })
}
```




### 4.2 parseFile 解析文件路径信息

```js
const positionRE = /:(\d+)(:(\d+))?$/
/**
 * @params file 文件绝对路径 可能包含行列信息
 */
function parseFile (file) {
  // 过滤掉 :数字:数字，提取纯文件绝对路径
  const fileName = file.replace(positionRE, '')
  const match = file.match(positionRE)
  const lineNumber = match && match[1] // 行信息
  const columnNumber = match && match[3] // 列信息
  return {
    fileName,
    lineNumber,
    columnNumber
  }
}
```



### 4.3 fs.existsSync 判断路径是否存在
如果路径存在则返回 true，否则返回 false。

```js
import { existsSync } from 'fs';

if (existsSync('/etc/passwd')) {
  console.log('The path exists.');
}
```




### 4.4 wrapErrorCallback 错误回调函数封装

```js
function wrapErrorCallback (cb) {
  return (fileName, errorMessage) => {
    console.log()
    // 提示无法打开文件
    // path.basename(fileName) 返回路径最后一部分，一般为文件名，后面有讲到该方法
    console.log(
      chalk.red('Could not open ' + path.basename(fileName) + ' in the editor.')
    )

    if (errorMessage) {
      // 拼接句号
      if (errorMessage[errorMessage.length - 1] !== '.') {
        errorMessage += '.'
      }
      // 有错误信息则进行提示错误
      console.log(
        chalk.red('The editor process exited with an error: ' + errorMessage)
      )
    }
    console.log()
    // 错误回调调用
    if (cb) cb(fileName, errorMessage)
  }
}
```




### 4.5 guessEditor 猜测使用的编辑器

```js
const childProcess = require('child_process')

/**
 *  @params specifiedEditor 指定编辑器
 */
function guessEditor (specifiedEditor) {
  if (specifiedEditor) {
    // shell语句解析，此处传路径，除了shell中的特殊符号，基本按空格分隔数组。
    // 目录最好不要含空格，否则无法正常找到
    return shellQuote.parse(specifiedEditor)
  }
  // We can find out which editor is currently running by:
  // `ps x` on macOS and Linux
  // `Get-Process` on Windows
  try {
    if (process.platform === 'darwin') { // Mac OS
      // 子进程运行指令，该方法在子进程完全关闭之前不会返回。
      // 取出现在启用的编辑器
      const output = childProcess.execSync('ps x').toString()

      // Mac 市场常见的编辑器目录数组 比对成功则返回
      const processNames = Object.keys(COMMON_EDITORS_OSX)
      for (let i = 0; i < processNames.length; i++) {
        const processName = processNames[i]
        if (output.indexOf(processName) !== -1) {
          return [COMMON_EDITORS_OSX[processName]]
        }
      }
    } else if (process.platform === 'win32') { // windows
      // 子进程运行指令，该方法在子进程完全关闭之前不会返回。
      // 取出现在启用的编辑器
      const output = childProcess
        .execSync('powershell -Command "Get-Process | Select-Object Path"', {
          stdio: ['pipe', 'pipe', 'ignore']
        })
        .toString()
      const runningProcesses = output.split('\r\n')
      for (let i = 0; i < runningProcesses.length; i++) {
        // `Get-Process` sometimes returns empty lines
        if (!runningProcesses[i]) { // 空行跳过
          continue
        }

        // 路径去空格
        const fullProcessPath = runningProcesses[i].trim()

        // 取出文件名
        const shortProcessName = path.basename(fullProcessPath)

        // 市场常见的编辑器数组 比对成功则返回
        if (COMMON_EDITORS_WIN.indexOf(shortProcessName) !== -1) {
          return [fullProcessPath]
        }
      }
    } else if (process.platform === 'linux') { // linux
      // --no-heading No header line
      // x List all processes owned by you
      // -o comm Need only names column
      // 子进程运行指令，该方法在子进程完全关闭之前不会返回。
      // 取出现在启用的编辑器
      const output = childProcess
        .execSync('ps x --no-heading -o comm --sort=comm')
        .toString()
      const processNames = Object.keys(COMMON_EDITORS_LINUX)
      // 市场常见的编辑器数组 比对成功则返回
      for (let i = 0; i < processNames.length; i++) {
        const processName = processNames[i]
        if (output.indexOf(processName) !== -1) {
          return [COMMON_EDITORS_LINUX[processName]]
        }
      }
    }
  } catch (error) {
    // Ignore...
  }

  // Last resort, use old skool env vars
  // 最后一招，使用老式的环境变量
  if (process.env.VISUAL) {
    return [process.env.VISUAL]
  } else if (process.env.EDITOR) {
    return [process.env.EDITOR]
  }

  return [null]
}
```





### 4.6 path.basename 返回 path 的最后一部分
方法返回 path 的最后一部分。 传入参2，可以将尾随的目录分隔符忽略
```js
path.basename('/foo/bar/baz/asdf/quux.html');
// 返回: 'quux.html'

path.basename('/foo/bar/baz/asdf/quux.html', '.html');
// 返回: 'quux'
```




### 4.7 process.platform 运行Node.js进程的操作系统平台
返回标识运行 Node.js 进程的操作系统平台的字符串
```js
import { platform } from 'process';

console.log(platform); // 我这是 win32
```




### 4.8 os.release 返回操作系统的发行版本的方法

```js
os.release(); // 我这是 10.0.19xxx
```




### 4.9 path.relative 寻找两个绝对路径的相对关系
path.relative(from, to)    
方法根据当前工作目录返回从 from 到 to 的相对路径。 如果 from 和 to 都解析为相同的路径（在分别调用 path.resolve() 之后），则返回零长度字符串。    
如果零长度字符串作为 from 或 to 传入，则将使用当前工作目录而不是零长度字符串
```js
path.relative('C:\\orandea\\test\\aaa', 'C:\\orandea\\impl\\bbb');
// 返回: '..\\..\\impl\\bbb'
```




### 4.10 getArgumentsForPosition 取得坐标信息数组

```js
const path = require('path')

// normalize file/line numbers into command line args for specific editors
/**
 * @params editor 编辑器路径 但传过来可能也只有编辑器名
 * @params fileName 文件名
 * @params lineNumber 行信息
 * @params columnNumber 列信息
 */
function getArgumentsForPosition (
  editor,
  fileName,
  lineNumber,
  columnNumber = 1
) {
  // 返回路径最后一部分 且去除.exe|cmd|bat后缀，即只取得编辑器名
  const editorBasename = path.basename(editor).replace(/\.(exe|cmd|bat)$/i, '')
  // 返回对应编辑器行列信息封装
  switch (editorBasename) {
    case 'atom':
    case 'Atom':
    case 'Atom Beta':
    case 'subl':
    case 'sublime':
    case 'sublime_text':
    case 'wstorm':
    case 'charm':
      return [`${fileName}:${lineNumber}:${columnNumber}`]
    case 'notepad++':
      return ['-n' + lineNumber, fileName]
    case 'vim':
    case 'mvim':
      return [`+call cursor(${lineNumber}, ${columnNumber})`, fileName]
    case 'joe':
      return ['+' + `${lineNumber}`, fileName]
    case 'emacs':
    case 'emacsclient':
      return [`+${lineNumber}:${columnNumber}`, fileName]
    case 'rmate':
    case 'mate':
    case 'mine':
      return ['--line', lineNumber, fileName]
    case 'code':
    case 'code-insiders':
    case 'Code':
      return ['-r', '-g', `${fileName}:${lineNumber}:${columnNumber}`]
    case 'appcode':
    case 'clion':
    case 'clion64':
    case 'idea':
    case 'idea64':
    case 'phpstorm':
    case 'phpstorm64':
    case 'pycharm':
    case 'pycharm64':
    case 'rubymine':
    case 'rubymine64':
    case 'webstorm':
    case 'webstorm64':
      return ['--line', lineNumber, fileName]
  }

  // For all others, drop the lineNumber until we have
  // a mapping above, since providing the lineNumber incorrectly
  // can result in errors or confusing behavior.
  return [fileName]
}
```





### 4.11 isTerminalEditor 是否终端文本编辑器

```js
function isTerminalEditor (editor) {
  switch (editor) {
    case 'vim':
    case 'emacs':
    case 'nano':
      return true
  }
  return false
}
```


