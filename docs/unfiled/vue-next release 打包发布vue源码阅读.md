---
title: vue-next release 打包发布vue源码阅读
date: 2021-09-06
tags:
 - 源码阅读      
categories: 
 - frontEnd
---

## 疑问
1. 发布流程的步骤是？
2. 如何应用到我目前的项目
3. 放在公共组件库和具体项目有什么具体区别吗

   
## 1 引用模块

### 1.1 minimist 参数解析器  

```js
/**
 * process.argv
 * 第一个参数 process.execPath Node.js。进程的可执行文件的绝对路径名 
 * 第二个元素将是正在执行的 JavaScript 文件的路径
 * 其余元素将是任何其他命令行参数
 **/
var argv = require('minimist')(process.argv.slice(2)); // 提取参数
```


```js
/**
 * var argv = parseArgs(args, opts={})
 * 
 * 类似数字的参数都会以数字返回
 * --之后的参数都不会被解析，都会放在_中
 * _: 没有与之相关的选项存放点
 * */

// 例子
var argv = require('minimist')(process.argv.slice(2));

$ node example/parse.js -a beep -b boop
// { _: [], a: 'beep', b: 'boop' }

$ node example/parse.js -x 3 -y 4 -n5 -abc --beep=boop foo bar baz
/* {
  _: [ 'foo', 'bar', 'baz' ],
  x: 3,
  y: 4,
  n: 5,
  a: true,
  b: true,
  c: true,
  beep: 'boop' 
} */

```
更多可以参考 **minimist**[<sup id="$1">1</sup>](#1)


```js
const args = require('minimist')(process.argv.slice(2))

const preId =
  args.preid ||
  (semver.prerelease(currentVersion) && semver.prerelease(currentVersion)[0])
const isDryRun = args.dry
const skipTests = args.skipTests
const skipBuild = args.skipBuild

// 源码: 解析参数, 并将一部分参数变量赋值
```




### 1.2 path 路径
path.resolve([...paths])    
从右到左，将路径或路径片段的序列解析为绝对路径    
如果没有传入 path 片段，则 path.resolve() 返回当前工作目录的绝对路径。

```js
path.resolve('/foo/bar', './baz');
// 返回: '/foo/bar/baz'  绝对路径,相对路径

path.resolve('/foo/bar', '/tmp/file/');
// 返回: '/tmp/file'  绝对路径,绝对路径 绝对路径覆盖

path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif');
// 相对路径,相对路径,相对路径
// 如果当前工作目录是 /home/myself/node，
// 则返回 '/home/myself/node/wwwroot/static_files/gif/image.gif'
```




### 1.3 fs 文件系统

```js

/**
 * __dirname 当前模块的目录名，绝对路径
 * 例：有文件/Users/mjr/example.js  运行 node example.js
 * console.log(__dirname); //  /Users/mjr
 **/

/**
 * fs.readdirSync(path[, options]) 读取目录的内容
 * options:
 *  encoding      默认值: 'utf8' 指定编码
 *  withFileTypes 默认值: false  设置为 true，则结果将包含 <fs.Dirent> 对象
 * 
 **/

const fs = require('fs')
const packages = fs
  .readdirSync(path.resolve(__dirname, '../packages'))
  .filter(p => !p.endsWith('.ts') && !p.startsWith('.'))
/* 
  假如当前模块在D:\\web\\items\\vue-next\\scripts，拼凑 ../packages
  readdirSync接到的参数为：D:\\web\\items\\vue-next\\packages
  读取了该路径下的目录，且过滤掉ts文件和.开头文件
  
  packages 存放了pacakges的文件名 
  ['compiler-core', 'compiler-dom', 'compiler-sfc', 'compiler-ssr', 'reactivity', 'ref-transform', 'runtime-core', 'runtime-dom', 'runtime-test', 'server-renderer', 'sfc-playground', 'shared', 'size-check', 'template-explorer', 'vue', 'vue-compat']
*/
```

更多可以参考 **fs**[<sup id="$2">2</sup>](#2)，**模块作用域**[<sup id="$3">3</sup>](#3)




### 1.4 chalk 更好看的终端文本

```js
const chalk = require('chalk')

const dryRun = (bin, args, opts = {}) =>
  console.log(chalk.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts) // 蓝色字体

const step = msg => console.log(chalk.cyan(msg)) // 青色
```

更多可以参考 **chalk**[<sup id="$4">4</sup>](#4)




### 1.5 semver 语义化版本

```js
const semver = require('semver')
semver.valid('1.2.3') // '1.2.3' 返回解析后的版本，无则返回null
semver.valid('a.b.c') // null
semver.clean('  =v1.2.3   ') // '1.2.3'
semver.satisfies('1.2.3', '1.x || >=2.5.0 || 5.0.0 - 7.2.3') // true 空格和||等效  返回是否包含在表达式内
semver.gt('1.2.3', '9.8.7') // false 是否大于
semver.lt('1.2.3', '9.8.7') // true  是否小于

// The range 1.2.7 || >=1.2.9 <2.0.0 would match the versions 1.2.7, 1.2.9, and 1.4.6, but not the versions 1.2.8 or 2.0.0.

```


留空/星号/x：代表该处任意 [major, minor, patch]
```js
  1.2.3 - 2.3.4 := >=1.2.3 <=2.3.4
  * := >=0.0.0 (Any version satisfies)
  1.x := >=1.0.0 <2.0.0-0 (Matching major version)
  1.2.x := >=1.2.0 <1.3.0-0 (Matching major and minor versions)

  "" (empty string) := * := >=0.0.0
  1 := 1.x.x := >=1.0.0 <2.0.0-0
  1.2 := 1.2.x := >=1.2.0 <1.3.0-0
```


~ 从最右边patch开始，主要更改patch，无则更改minor，按以下顺序 [major, minor, patch]  (可理解为：保障最小更改)
1. patch有定义时，仅允许patch更改。 
2. minor有定义时，允许**patch**修改. 
3. major有定义时，允许**minor**修改. 
```js
  ~1.2.3 := >=1.2.3 <1.(2+1).0 := >=1.2.3 <1.3.0-0
  ~1.2 := >=1.2.0 <1.(2+1).0 := >=1.2.0 <1.3.0-0 (Same as 1.2.x)
  ~1 := >=1.0.0 <(1+1).0.0 := >=1.0.0 <2.0.0-0 (Same as 1.x)

  ~1.2.3-beta.2 := >=1.2.3-beta.2 <1.3.0-0 // 特殊：有测试版本，1.2.3-beta.4允许，但1.2.4-beta.2不允许，因为major, minor, patch版本号不同。
```


^ 从最左边非0为标准，允许修改下一级，按以下顺序 [major, minor, patch] (可理解为：保障最大更改)
1. major有定义时，允许**minor**修改.。 
2. minor有定义时，允许**patch**修改. 
3. patch有定义时，仅允许测试版本更改。 
```js
  ^1.2.3 := >=1.2.3 <2.0.0-0
  ^0.2.3 := >=0.2.3 <0.3.0-0
  ^0.0.3 := >=0.0.3 <0.0.4-0

  ~1.2.3-beta.2 := >=1.2.3-beta.2 <1.3.0-0 // 特殊：有测试版本，1.2.3-beta.4允许，但1.2.4-beta.2不允许，因为major, minor, patch版本号不同。
```


inc 返回一个增加1的版本。根据参2类型决定是增加哪种类型。参2可选major, premajor, minor, preminor, patch, prepatch,  prerelease    

pre代表预发版本

```js
semver.inc('1.2.3', 'major'); // 2.0.0
// 测试需要一个额外的标识符字符串参数，该参数将附加字符串的值作为测试标识符.
semver.inc('1.2.3', 'major', 'beta'); // 2.0.0 结果一样，所以 非测试就不要写参3了.
semver.inc('1.2.3', 'premajor', 'alpha'); // 2.0.0-alpha.0
semver.inc('1.2.3', 'premajor', 'beta'); // 2.0.0-beta.0

semver.inc('1.2.3', 'minor'); // 1.3.0
semver.inc('1.2.3', 'preminor', 'alpha'); // 1.3.0-alpha.0

semver.inc('1.2.3', 'patch'); // 1.2.4
semver.inc('1.2.3', 'prepatch', 'alpha'); // 1.2.4-alpha.0

semver.inc('1.2.3', 'prerelease', 'alpha'); // 1.2.4-alpha.0 
// 非预发版本，则跟prepatch调用一致。感觉调用prerelease还是保障他是预发版本吧
semver.inc('1.2.3-alpha.0', 'prerelease', 'alpha'); // 1.2.3-alpha.1  预发版本调用，预发版本+1
semver.inc('1.2.3-alpha.1', 'prerelease', 'beta'); // 1.2.3-beta.0  以新的预发版本标志从0开始了。 
```


prerelease 返回测试版本的数组，如果不存在，则返回 null
```js
semver.prerelease('1.2.3-alpha.1') -> ['alpha', 1]
```


release.js源码
```js
const semver = require('semver')
const currentVersion = require('../package.json').version

/* code */

const preId =
  args.preid ||
  (semver.prerelease(currentVersion) && semver.prerelease(currentVersion)[0]) // 根据参数或package.json的版本号，取得测试版本，非测试则返回null

/* code */

// 版本增1
const inc = i => semver.inc(currentVersion, i, preId) // preId 测试版本 

/* code */

if (!semver.valid(targetVersion)) { // 取版本号，不标准则抛异常
  throw new Error(`invalid target version: ${targetVersion}`)
}
```

更多可以参考 **semver**[<sup id="$5">5</sup>](#5)




### 1.6 enquirer 更好的交互CLI提示

单提示
```js
const { prompt } = require('enquirer');
 
const response = await prompt({
  type: 'input', // 用户输入
  name: 'username', // 变量名
  message: 'What is your username?' // 提示
});
 
console.log(response); // { username: 'jonschlinkert' }
```


多提示
```js
const response = await prompt([
  {
    type: 'input',
    name: 'name',
    message: 'What is your name?'
  },
  {
    type: 'input',
    name: 'username',
    message: 'What is your username?'
  }
]);
 
console.log(response); // { name: 'Edward Chan', username: 'edwardmchan' }
```


选择
```js
const { prompt } = require('enquirer');
 
const questions = [{
  type: 'select',
  name: 'color',
  message: 'Favorite color?',
  initial: 1,
  choices: ['red', 'green', 'blue']
}];
 
let answers = await prompt(questions);
console.log('Answer:', answers.color); // 根据选择 red、green、blue其一
```

release.js源码
```js
const versionIncrements = [
  'patch',
  'minor',
  'major',
  ...(preId ? ['prepatch', 'preminor', 'premajor', 'prerelease'] : []) // 测试标志则多推入几个测试选项
]

/* code  */

let targetVersion = args._[0]

if (!targetVersion) { // 未输入版本
  // no explicit version, offer suggestions
  const { release } = await prompt({ // 交互提示选择
    type: 'select',
    name: 'release', // 变量名
    message: 'Select release type',
    choices: versionIncrements.map(i => `${i} (${inc(i)})`).concat(['custom']) // 选项，release标志 (版本+1)
  })

  if (release === 'custom') { // 自定义
    targetVersion = ( // 交互提示输入
      await prompt({
        type: 'input',
        name: 'version',
        message: 'Input custom version',
        initial: currentVersion
      })
    ).version
  } else {
    targetVersion = release.match(/\((.*)\)/)[1] // 正则取出版本号
  }
}
```
更多可以参考 **enquirer**[<sup id="$6">6</sup>](#6)




### 1.7 execa 执行命令

execa(file, arguments, options?)
- file 执行文件
- arguments 参数
- options 可选项


```js
const execa = require('execa')

const run = (bin, args, opts = {}) =>
  execa(bin, args, { stdio: 'inherit', ...opts })
```
内容较多，需要时    
更多可以参考 **execa**[<sup id="$7">7</sup>](#7)








## 2 全局参数和方法

### 2.1 isDryRun 是否真正执行命令标志
根据上面了解到的内容，就很清晰知道，添加了--dry，会用打印替代执行命令（后续的发布和git操作都用到了runIfNotDry方法，在--dry下为打印），便于调试。

```js
const isDryRun = args.dry

if (!skipTests && !isDryRun) { // 有dry 或 skipTests 都会跳过
  // jest Facebook旗下的javascript测试框架
  await run(bin('jest'), ['--clearCache'])
  await run('yarn', ['test', '--bail'])
} else {
  console.log(`(skipped)`)
}

if (!skipBuild && !isDryRun) { // 有skipBuild 或 dry 都会跳过
  await run('yarn', ['build', '--release'])
  // test generated dts files
  step('\nVerifying type declarations...')
  await run('yarn', ['test-dts-only'])
} else {
  console.log(`(skipped)`)
}

const run = (bin, args, opts = {}) =>
  execa(bin, args, { stdio: 'inherit', ...opts })

const dryRun = (bin, args, opts = {}) =>
  console.log(chalk.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts)


const runIfNotDry = isDryRun ? dryRun : run // 后续的发布和git操作用到此方法 没有dry标志则运行

```
   



### 2.2 skipTests 跳过测试标志

```js
const skipTests = args.skipTests

/* code */

if (!skipTests && !isDryRun) { // 有dry 或 skipTests 
  // jest Facebook旗下的javascript测试框架
  await run(bin('jest'), ['--clearCache'])
  await run('yarn', ['test', '--bail'])
} else {
  console.log(`(skipped)`)
}
```




### 2.3 skipBuild 跳过打包标志

```js
const skipBuild = args.skipBuild

/* code */

if (!skipBuild && !isDryRun) { // 有skipBuild 或 dry 都会跳过
  await run('yarn', ['build', '--release'])
  // test generated dts files
  step('\nVerifying type declarations...')
  await run('yarn', ['test-dts-only'])
} else {
  console.log(`(skipped)`)
}
```




### 2.4 step 打印青色文本方法
```js
const step = msg => console.log(chalk.cyan(msg))

step('\nRunning tests...')

step('\nUpdating cross dependencies...')

step('\nBuilding all packages...')

step('\nVerifying type declarations...')

step('\nCommitting changes...')

step('\nPublishing packages...')

step('\nPushing to GitHub...')

step(`Publishing ${pkgName}...`)

```




### 2.5 packages 包数组
根目录下packages文件夹的目录数组，不包含 **.ts后缀的文件** 和 **.开头的文件**
```js
const packages = fs
  .readdirSync(path.resolve(__dirname, '../packages'))
  .filter(p => !p.endsWith('.ts') && !p.startsWith('.'))
```




### 2.6 skippedPackages 不发布的包数组
跳过指定包不发布。

```js
const skippedPackages = []

for (const pkg of packages) { // 从packages文件夹中循环，执行发布方法
  await publishPackage(pkg, targetVersion, runIfNotDry)
}

/* publishPackage发布包的方法*/
async function publishPackage(pkgName, version, runIfNotDry) {
  if (skippedPackages.includes(pkgName)) { // 跳过不发布的包
    return
  }
  /* code */
}
```
在发布包方法publishPackage方法中调用，后面讲该方法




### 2.7 updateDeps 更新对象信息
package.json可转成的对象，主要用于更新其信息    

传入包对象，依赖类型，和版本号。    
会对该 包对象 里的 依赖类型 内部，vue 和 所有包含在packages包数组内的vue/xxx更新版本    
```js
/**
 * 更新包文件信息
 * @params pkg 包对象 一般为package.json转成的对象
 * @params depType 依赖类型 一般为dependencies 或 peerDependencies
 * @params version 版本号
 **/
function updateDeps(pkg, depType, version) {
  // 获得指定依赖对象 一般为dependencies 或 peerDependencies 对象
  const deps = pkg[depType]
  if (!deps) return // 无则提前返回
  Object.keys(deps).forEach(dep => {
    if (
      dep === 'vue' ||
      (dep.startsWith('@vue') && packages.includes(dep.replace(/^@vue\//, '')))
    ) {
      /*
        满足下面条件之一
        1. 键名为vue
        2. 以@vue开头 且 '@vue/xxx', xxx在pacakges包数组中
        则对其赋值，并黄色文本提示 包名 -> 依赖类型 -> 依赖名@版本
        
        所以该包对象的vue 和 @vue/xxx 版本都会被统一赋值为version
      */
      console.log(
        chalk.yellow(`${pkg.name} -> ${depType} -> ${dep}@${version}`)
      )
      deps[dep] = version
    }
  })
}
```
在更新包信息updatePackage方法中调用，后面讲该方法




### 2.8 updatePackage 更新包package.json文件的方法
更新包的package.json文件。   

```js
/**
 * 更新包方法
 * @params pkgRoot 包目录
 * @params version 版本号
 **/
function updatePackage(pkgRoot, version) {
  // 取得包目录下package.json文件的绝对地址
  const pkgPath = path.resolve(pkgRoot, 'package.json')
  // utf-8编码读取文本，并转成对象
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  // 对其版本号更新
  pkg.version = version
  
  // 更新对象信息, 对其dependencies和peerDependencies下的vue vue/xxx 进行版本更新
  updateDeps(pkg, 'dependencies', version) 
  updateDeps(pkg, 'peerDependencies', version)

  // 转成文本添加换行，并写入文件
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}
```
在更新包信息updateVersions方法中调用，后面讲该方法





### 2.9 getPkgRoot 获得指定包目录的绝对路径的方法
传入包名，可获得包目录的绝对路径

```js
/**
 * 获得指定包目录的绝对路径的方法
 * @params pkg 包名
 **/
const getPkgRoot = pkg => path.resolve(__dirname, '../packages/' + pkg)
```
在更新版本updateVersions方法中调用，后面讲该方法




### 2.10 updateVersions 更新版本-更新主包和所有子包的package.json文件
更新主包和所有子包的package.json文件。   

```js
/**
 * 
 **/
function updateVersions(version) {
  // 1. update root package.json
  // 更新根目录的package.json
  updatePackage(path.resolve(__dirname, '..'), version)
  // 2. update all packages
  // 传入packages包数组，取得所有子包的绝对路径
  // 将所有子包的绝对路径传入【更新包package.json文件的方法】中，更新packages内的所有packages.json
  packages.forEach(p => updatePackage(getPkgRoot(p), version))
}
```





### 2.11 publishPackage 发布包
更新主包和所有子包的package.json文件。 

```js
for (const pkg of packages) { // 发布packages所有包
  await publishPackage(pkg, targetVersion, runIfNotDry)
}

/**
 * 发布包
 * @params pkgName 包名
 * @params version 版本号
 * @params runIfNotDry 没有dry标志则运行
 */
async function publishPackage(pkgName, version, runIfNotDry) {
  if (skippedPackages.includes(pkgName)) { // 跳过不发布的包
    return
  }
  const pkgRoot = getPkgRoot(pkgName) // 获得包目录
  const pkgPath = path.resolve(pkgRoot, 'package.json') // 取得package.json文件
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) // 读取文件后转对象
  if (pkg.private) { // 私有包不发布
    return
  }

  // For now, all 3.x packages except "vue" can be published as
  // `latest`, whereas "vue" will be published under the "next" tag.
  // 除了vue所有3.x的的包都可以发布最后的版本，vue只能在next标签下发布
  let releaseTag = null // 测试标志
  if (args.tag) { // 参数tag赋值，以参数为主
    releaseTag = args.tag
  } else if (version.includes('alpha')) { // 版本包含alpha
    releaseTag = 'alpha'
  } else if (version.includes('beta')) { // 版本包含beta
    releaseTag = 'beta'
  } else if (version.includes('rc')) { // 版本包含rc
    releaseTag = 'rc'
  } else if (pkgName === 'vue') { // vue包 标志改为next
    // TODO remove when 3.x becomes default
    releaseTag = 'next'
  }

  // TODO use inferred release channel after official 3.0 release
  // const releaseTag = semver.prerelease(version)[0] || null

  step(`Publishing ${pkgName}...`)
  try {
    // 非dry模式，运行发布
    await runIfNotDry(
      'yarn',
      [
        'publish',
        '--new-version',
        version,
        ...(releaseTag ? ['--tag', releaseTag] : []),
        '--access',
        'public'
      ],
      {
        cwd: pkgRoot,
        stdio: 'pipe'
      }
    )
    console.log(chalk.green(`Successfully published ${pkgName}@${version}`))
  } catch (e) {
    if (e.stderr.match(/previously published/)) {
      // 发布过的，提示跳过已发布的包
      console.log(chalk.red(`Skipping already published: ${pkgName}`))
    } else {
      throw e
    }
  }
}
```











## 3 主函数

### 3.1 main 主函数
看完上面这些点后，再看主函数就很清晰了

```js
async function main() {
  
  let targetVersion = args._[0] 
  /* 获得指定版 
    因为package.json中只写了
    "release": "node scripts/release.js",
    如果我们执行yarn release 那么minimist解析后，没有与之相关的选项放于_中，
    但此处没有，targetVersion取值便为空

    当然我们也可以yarn release x.x.x
    去指定版本号，此时targetVersion便会取值x.x.x
  */

  if (!targetVersion) {
    // no explicit version, offer suggestions
    /* 交互提示获取发布类型和版本号，并存储在变量release中 */
    const { release } = await prompt({
      type: 'select',
      name: 'release',
      message: 'Select release type',
      choices: versionIncrements.map(i => `${i} (${inc(i)})`).concat(['custom'])
    })

    if (release === 'custom') {
      /* 如果为自定义版本，交互提示获取版本 */
      targetVersion = (
        await prompt({
          type: 'input',
          name: 'version',
          message: 'Input custom version',
          initial: currentVersion
        })
      ).version
    } else {
      /* 
        交互提示获取发布类型和版本号，正则取得版本号，
        因为release值大概长这样为patch(x.x.x)
        在 交互提示获取发布类型 的选中项中这样定义
        choices: versionIncrements.map(i => `${i} (${inc(i)})`) 这样定义的
      */
      targetVersion = release.match(/\((.*)\)/)[1]
    }
  }

  if (!semver.valid(targetVersion)) {
    /* 获取标准版本号，解析失败返回null，不标准则抛异常 */
    throw new Error(`invalid target version: ${targetVersion}`)
  }

  /* 再次询问，是否发布版本 */
  const { yes } = await prompt({
    type: 'confirm',
    name: 'yes',
    message: `Releasing v${targetVersion}. Confirm?`
  })

  /* 取消 直接return */
  if (!yes) {
    return
  }

  // run tests before release
  /* 青色文本提示 运行测试 */
  step('\nRunning tests...')
  if (!skipTests && !isDryRun) {
    /* jest测试框架测试 */
    await run(bin('jest'), ['--clearCache'])
    await run('yarn', ['test', '--bail'])
  } else {
    /* 如果跳过测试 或者 dry 标志  则用打印替代 */
    console.log(`(skipped)`)
  }

  // update all package versions and inter-dependencies
  /* 青色文本提示 更新依赖包版本和内部依赖 */
  step('\nUpdating cross dependencies...')
  // 更新主包和所有子包的package.json文件
  updateVersions(targetVersion)

  // build all packages with types
  // 提示打包所有包
  step('\nBuilding all packages...')
  if (!skipBuild && !isDryRun) {
    // 没有跳过打包，非dry模式
    // 执行yarn build --release 
    await run('yarn', ['build', '--release'])
    // test generated dts files
    // 验证类型声明
    step('\nVerifying type declarations...')
    // 执行yarn test-dts-only
    await run('yarn', ['test-dts-only'])
  } else {
    // 不打包则打印跳过
    console.log(`(skipped)`)
  }

  // generate changelog
  // 生成changelog
  await run(`yarn`, ['changelog'])

  // 比较工作区和暂存区差异
  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })
  if (stdout) { // 有差异
    step('\nCommitting changes...')
    // 工作区所有文件添加到暂存区 
    // 提交暂存区到本地仓库
    await runIfNotDry('git', ['add', '-A'])
    await runIfNotDry('git', ['commit', '-m', `release: v${targetVersion}`])
  } else {
    // 无差异则提示没有需要commit的
    console.log('No changes to commit.')
  }

  // publish packages
  step('\nPublishing packages...')
  for (const pkg of packages) {
    // packages目录下所有包都发布
    await publishPackage(pkg, targetVersion, runIfNotDry)
  }

  // push to GitHub
  step('\nPushing to GitHub...')
  // 非dry模式下，
  // git打标签记录版本
  // git 尝试删除远程同名标签
  // git 本地仓库提交到远程仓库
  await runIfNotDry('git', ['tag', `v${targetVersion}`])
  await runIfNotDry('git', ['push', 'origin', `refs/tags/v${targetVersion}`])
  await runIfNotDry('git', ['push'])

  if (isDryRun) {
    // dry模式结束提示 运行git diff 查看工作区和暂存区的包差异
    console.log(`\nDry run finished - run git diff to see package changes.`)
  }

  if (skippedPackages.length) {
    // 如果有跳过的包， 提示跳过发布的包
    console.log(
      chalk.yellow(
        `The following packages are skipped and NOT published:\n- ${skippedPackages.join(
          '\n- '
        )}`
      )
    )
  }
  console.log()
}

main().catch(err => { // 捕获报错 提示
  console.error(err)
})
```

### 3.2 流程
1. 获得版本 targetVersion     
     - 通过minimist解析获取
     - execa交互获取
     - semver用来生成版本，校验版本
     - 再次提示是否确认发布
2. 执行测试
     - jest 测试框架测试
     - yarn test --bail 跑测试
3. 更新包和子包所有package.json版本
     - vue 和 @vue/xxx(pacakge内的)都会更新版本
4. 打包
     - yarn build --release
     - yarn test-dts-only
5. 生成日志
     - yarn changelog
6. 提交git本地仓库
     - git diff 发现有工作区和暂存区有差异
     - git add -A 工作区所有文件添加到暂存区
     - git commit -m release:v版本号 提交暂存区到本地仓库
7. 发布包
     - 跳过skippedPackages的包不发布
     - yarn publish --new-version 版本号 [--tag releaseTag] --access public
8. 代码提交git远程仓库
     - git tag v版本号 打标签
     - git push origin :refs/tags/v版本号 尝试删除远程仓库标签
     - git push 本地仓库提交到远程仓库






## 疑问
以下是未解决或涉及内容过多，目前看不懂的。
- execa的传参，特别是 { stdio: 'inherit' } 等同于[process.stdin, process.stdout, process.stderr] or [0,1,2]，父子级别创建通道是什么意思。是node里哪个方面的知识点

- await run(bin('jest'), ['--clearCache'])
- await run('yarn', ['test', '--bail']
- peerDependencies
- await runIfNotDry(
      'yarn',
      [
        'publish',
        '--new-version',
        version,
        ...(releaseTag ? ['--tag', releaseTag] : []),
        '--access',
        'public'
      ],
      {
        cwd: pkgRoot,
        stdio: 'pipe'
      }
    )


## 参考资料
- <span id="1"></span>[1] [minimist：https://www.npmjs.com/package/minimist](https://www.npmjs.com/package/minimist) ===> [back](#$1)
- <span id="2"></span>[2] [fs：http://nodejs.cn/api/fs.html](http://nodejs.cn/api/fs.html) ===> [back](#$2)
- <span id="3"></span>[3] [模块作用域：http://nodejs.cn/api/modules.html](http://nodejs.cn/api/modules.html) ===> [back](#$3)
- <span id="4"></span>[4] [chalk：https://github.com/chalk/chalk](https://github.com/chalk/chalk) ===> [back](#$4)
- <span id="5"></span>[5] [semver：https://github.com/npm/node-semver](https://github.com/npm/node-semver) ===> [back](#$5)
- <span id="6"></span>[6] [enquirer：https://www.npmjs.com/package/enquirer#select-prompt](https://www.npmjs.com/package/enquirer#select-prompt) ===> [back](#$6)
- <span id="7"></span>[7] [execa：https://www.npmjs.com/package/execa](https://www.npmjs.com/package/execa) ===> [back](#$7)

