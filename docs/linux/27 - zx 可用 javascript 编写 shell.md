---
title: zx 可用 javascript 编写 shell
date: 2022-11-14
tags:
 - linux
categories: 
 - linux
---


## 总结
- `#!/usr/bin/env zx`
- 使用 $&#96; &#96; 包裹命令， 将其命令的标准输出使用 `Promise` 包裹作为返回值返回  
- `zx` 的全局变量
  - `required()`: 引入第三方依赖，这就很恐怖了，体验生态的便捷和自由度拉满。
  - `cd()`: 与 `shell` 的 `cd` 一致
  - `fetch()`: 发送 `fetch` 请求
  - `question()`: 交互式询问输入，本质是封装了 node 的 [readline](https://nodejs.org/api/readline.html)。使用： `let bear = await question('What kind of bear is best? ')`
  - `sleep()`: 延迟，封装了 `setTimeout`
  - `echo()`: 打印输出
  - `minimist`: 提取参数做为脚本内的全局变量 `argv`。
  - `__filename`: 与 node 一致，提供了方便的全局变量
  - `__dirname`: 与 node 一致，提供了方便的全局变量





## 提问
- [ ] 1. 基于 `zx` 实现 `autojump`






## 1. 前提提要、场景
在 `bash` / `zsh` 中有很多不统一的东西，例如 `$0`。严格的空格限制，还有各种 `#`、`@` 难以理解的符号。
```sh
# = 号左右不能有空格
$ list=(3 4 5 6)

# zsh 的 index 从 1 开始，bash 的 index 从 0 开始
$ echo ${list[0]}

# 难以记忆的长度 #       以及全部数组 @
$ echo ${#list[@]}
```

因为上面的诸多不便，`Google` 推出一个可以使用 `javascript` 编写 shell 的工具 [ zx ](https://github.com/google/zx)。

对前端开发者要求：能用 `zx` 编写脚本，能读懂 `zsh/bash` 脚本

安装十分简单: `npm i -g zx`



## 2. zx 的初步使用
一般 shell 脚本为 `.sh` 后缀，`zx` 的后缀不太一样，为 `mjs`。

新建 `hello.mjs` 脚本文件
```js
#!/usr/bin/env zx

const [a, b, c] = await Promise.all([
  // 使用 $``，可直接调用 bash 脚本，并将 stdout 作为返回值
  $`echo 1`,
  $`echo 2`,
  $`echo 3`
])

console.log(a, b, c)
```
如果已经全局安装了 `zx` ，使用 `zx hello.mjs` 运行脚本 (不愿意在全局安装的，使用 `npx zx hello.mjs` )
可以先不管脚本内容跟着操作一遍，再继续往下看。



## 3. zx 的脚本编写

### 3.1 $ 标记 shell 命令
脚本内执行 `shell` 命令，可以使用 $&#96; &#96; 包裹命令， 将其命令的标准输出使用 `Promise` 包裹作为返回值返回。
> 反引号 &#96; 在 shell 中为直接执行内部命令，所以也可以理解为 `zx` 通过 `$` 将后面的反引号识别为 shell 的语法。
```js
const curlOutput = await $`curl --head https://www.baidu.com`

console.log(curlOutput)
```

### 3.2 内置 API
`zx` 集成了 `npm` 生态，内置了诸多 `API`，可作为脚本内的全局变量直接使用

- `required()`: 引入第三方依赖，这就很恐怖了，体验生态的便捷和自由度拉满。
- `cd()`: 与 `shell` 的 `cd` 一致
- `fetch()`: 发送 `fetch` 请求
- `question()`: 交互式询问输入，本质是封装了 node 的 [readline](https://nodejs.org/api/readline.html)。使用： `let bear = await question('What kind of bear is best? ')`
- `sleep()`: 延迟，封装了 `setTimeout`
- `echo()`: 打印输出
- `minimist`: 提取参数做为脚本内的全局变量 `argv`。
- `__filename`: 与 node 一致，提供了方便的全局变量
- `__dirname`: 与 node 一致，提供了方便的全局变量


可以尝试复杂一些的需求，例如用数字 0 - 99 创建 100 个文件夹，每个文件夹下有同名的 `.txt` 文件。
```js
#!/usr/bin/env zx

for (let i = 0; i < 100; i++) {
  // 创建 100 个文件夹
  await $`mkdir -p test-${i}`

  // 进入文件夹
  cd(`test-${i}`)

  // 并创建文件
  await $`echo ${i} > ${i}.txt`

  // 退出来
  cd('..')
}
```




