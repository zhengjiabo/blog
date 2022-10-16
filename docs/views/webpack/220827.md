---
title: webpack - 3 | CJS 模块收集与 AST
date: 2022-08-27
tags:
 - webpack
categories: 
 - webpack
---
## 总结
1. `AST` 抽象语法树，是一种用来描述编程语言语法的数据结构。形成代码和编程语言语法的桥梁，可以通过 AST 数据结构了解语法内容并作出修改，最后通过 AST 重新生成编程语言语法内容。
   
2. 生成 `AST` 过程：
   1. 词法分析：生成 Token 数组，语法上不可能再分的、最小的单个字符或字符串。
   2. 语法分析：通过 Token 数组生成 AST。
   
3. 在语言转换上，实际就是对 AST 操作，后续转换回代码。
   1. Code -> AST (Parse)
   2. AST -> AST (Transform)
   3. AST -> Code (Generate)
   




## 提问
- [x] 如何根据入口文件搜索出所有需要打包的模块？            
深度优先搜索。
1. 将入口文件的路径传入构造方法中，方法内读取该文件内容，转换成 `AST`
2. 循环遍历 AST ，找到节点类型为 `'CallExpression'` 且函数名为 `'require'` 的节点，取出其字面量，即引用的文本
3. 将字面量文本继续传入构造方法中，形成递归调用
4. 递归调用完，最后得到出所有需要打包的模块

- [x] 如何去除代码中的所有 console.log
```javascript
const acorn = require("acorn");
const astring = require("astring");
const fs = require('node:fs')
const path = require('path')

const data = fs.readFileSync(path.resolve(__dirname, './index.js'), {encoding: 'utf-8'})
const ast = acorn.parse(data, { ecmaVersion: 2022 }) // Code => AST   parsse 获取 ast

// 参考文档 https://github.com/davidbonnet/astring#extending
// 在 https://www.astexplorer.net/ 中输入 console.log() 找到 对应的 "type": "Identifier", "name" 为 "console"
const code = astring.generate(ast, {
    generator: Object.assign({}, astring.GENERATOR, {
        ExpressionStatement: function (node, state) {
            const object =  node?.expression?.callee?.object || {}

            if(object.type === 'Identifier' && object.name === 'console') { // 提前返回
                return
            }
            
            this[node.expression.type](node.expression, state); // 其它表达式正常生成
        },
      })
})
console.log(code);

```

- [ ] 如何模拟实现运行时代码的生成，实现 mini-webpack       
实现思路：
1. 写死一份字面量模板，直接写入到输出文件中，但里面的所有模块数组 `__webpack_modules__` 需要方法生成。
2. `__webpack_modules__` 数组的生成有以下几步
   1. 利用生成函数的路径，加载文件内容。
   2. 生成 AST，并遍历 AST 将 `require(name)` 改为 `require(id)`，把 `AST` 重新转换为代码。这一步 利用 `babel` 的 `parser/generate` 或者 `acorn` 和 `astring` 进行操作
   3. 遍历 AST 过程中，收集依赖并返回重新封装的对象。用于后续的扁平化处理和生成包裹函数

暂无时间实现，后续补充




## 1. 前提提要、场景
`AST` 抽象语法树，是一种用来描述编程语言语法的数据结构。         

AST 涉及到工程化诸多环节的应用，比如:
1. Typescript => Javascript (typescript)
2. SASS/LESS => CSS (sass/less)
3. ES6+ => ES5 (babel)
4. Javascript 格式化 (eslint/prettier)

在语言转换上，实际就是对 AST 操作，后续转换回代码。
1. Code -> AST (Parse)
2. AST -> AST (Transform)
3. AST -> Code (Generate)



## 2. AST 数据结构
可以在 [AST Explorer](https://www.astexplorer.net/) 查看不同语言的 AST 格式

### 2.1 JS
```javascript
const n = 1 + 1
```

```json
{
  "type": "Program",
  "start": 0,
  "end": 13,
  "body": [
    {
      "type": "VariableDeclaration",
      "start": 0,
      "end": 13,
      "declarations": [ // 描述
        {
          "type": "VariableDeclarator", // 变量描述
          "start": 6,
          "end": 13,
          "id": {
            "type": "Identifier", // 标识符
            "start": 6,
            "end": 9,
            "name": "num"
          },
          "init": { // 初始化
            "type": "BinaryExpression", // 二元表达式
            "start": 10,
            "end": 15,
            "left": {
              "type": "Literal", // 字面量
              "start": 10,
              "end": 11,
              "value": 1,
              "raw": "1"
            },
            "operator": "+", // 操作符
            "right": {
              "type": "Literal",
              "start": 14,
              "end": 15,
              "value": 1,
              "raw": "1"
            }
          }
        }
      ],
      "kind": "const"
    }
  ],
  "sourceType": "module"
}
```



### 2.2 CSS
```css
div {
	padding: 5px;
}
```

```json
{
  "parentStyleSheet": null,
  "cssRules": [
    {
      "parentRule": null,
      "parentStyleSheet": "[Circular ~]",
      "selectorText": "div", // 选择器描述
      "style": {
        "0": "padding",
        "length": 1,
        "parentRule": "[Circular ~.cssRules.0]",
        "_importants": {
          "padding": ""
        },
        "__starts": 4,
        "padding": "5px"
      },
      "__starts": 0,
      "__ends": 22
    }
  ]
}
```




## 3. AST 的生成
AST 的生成这一步骤被称为解析(Parser)，而该步骤也有两个阶段: 词法分析(Lexical Analysis) 和 语法分析(Syntactic Analysis)

### 3.1 词法分析，也称分词
词法分析用以将代码转化为 `Token`，维护一个关于 `Token` 的数组。      
`Token` 指语法上不可能再分的、最小的单个字符或字符串。       
```javascript
var num = 1
```
涉及到了 4 个属性不一样的 Token：
1. 关键字 var
2. 标识符 num
3. 赋值运算符 = 
4. 字面量 1


```javascript
// Code
a = 3

// Token
[
  { type: { ... }, value: "a", start: 0, end: 1, loc: { ... } },
  { type: { ... }, value: "=", start: 2, end: 3, loc: { ... } },
  { type: { ... }, value: "3", start: 4, end: 5, loc: { ... } },
  ...
]
```

词法分析后的 `Token` 也有诸多应用，如:
1. 代码检查，如 eslint 判断是否以分号结尾，判断是否含有分号的 token
2. 语法高亮，如 highlight/prism 使之代码高亮



### 3.2 语法分析
语法分析将 `Token` 转化为结构化的 `AST`，方便操作
```json
{
  "type": "Program",
  "start": 0,
  "end": 5,
  "body": [
    {
      "type": "ExpressionStatement",
      "start": 0,
      "end": 5,
      "expression": {
        "type": "AssignmentExpression",
        "start": 0,
        "end": 5,
        "operator": "=",
        "left": {
          "type": "Identifier",
          "start": 0,
          "end": 1,
          "name": "a"
        },
        "right": {
          "type": "Literal",
          "start": 4,
          "end": 5,
          "value": 3,
          "raw": "3"
        }
      }
    }
  ],
  "sourceType": "module"
}
```






## 4. 生成 __webpack_modules__ 所有模块的数组

实现一个小型的 webpack 打包器，一般是通过 AST 解析配合模板生成类似于 webpack 的运行时代码，而其中最重要的一步便是构建出所有的依赖模块数组 `__webpack_modules__`。

主要以下步骤
1. 构建模块依赖树，构建过程中需要将 `require(name)` 转化为 `require(moduleId)`，此过程通过 `babel` 的 `parser/generate` 函数完成。(也可以使用 `swc/acorn`)
2. 将模块依赖树转化为模块数组。
3. 将模块数组的每一个模块通过 `module wrapper` 包裹。
4. 生成模板。


```javascript
const fs = require('fs')
const path = require('path')

// 负责 code -> ast
const { parse } = require('@babel/parser')
// 负责 ast -> ast
const traverse = require('@babel/traverse').default
// 负责 ast -> code
const generate = require('@babel/generator').default

let moduleId = 0
// 该函数用以解析该文件模块的所有依赖树。对所有目标代码根据 AST 构建为组件树的结构并添加 ID，ID 如果 webpack 一样为深度优先自增。数据结构为:
//
// const rootModule = {
//   id: 0,
//   filename: '/Documents/app/node_modules/hello/index.js',
//   deps: [ moduleA, moduleB ],
//   code: 'const a = 3; module.exports = 3',
// }
//
// 如果组件 A 依赖于组件B和组件C
//
// {
//   id: 0,
//   filename: A,
//   deps: [
//     { id: 1, filename: B, deps: [] },
//     { id: 2, filename: C, deps: [] },
//   ]
// }
function buildModule (filename) {
  // 如果入口位置为相对路径，则根据此时的 __dirname 生成绝对文件路径
  filename = path.resolve(__dirname, filename)

  // 同步读取文件，并使用 utf8 读做字符串
  const code = fs.readFileSync(filename, 'utf8')

  // 使用 babel 解析源码为 AST
  const ast = parse(code, {
    sourceType: 'module'
  })

  const deps = []
  const currentModuleId = moduleId

  traverse(ast, {
    enter({ node }) {
      // 根据 AST 定位到所有的 require 函数，寻找出所有的依赖
      if (node.type === 'CallExpression' && node.callee.name === 'require') {
        const argument = node.arguments[0]

        // 找到依赖的模块名称
        // require('lodash') -> lodash (argument.value)
        if (argument.type === 'StringLiteral') {

          // 深度优先搜索，当寻找到一个依赖时，则 moduleId 自增一
          // 并深度递归进入该模块，解析该模块的模块依赖树
          moduleId++;
          const nextFilename = path.join(path.dirname(filename), argument.value)

          // 如果 lodash 的 moduleId 为 3 的话
          // require('lodash') -> require(3)
          argument.value = moduleId
          deps.push(buildModule(nextFilename))
        }
      }
    }
  })
  return {
    filename,
    deps,
    code: generate(ast).code,
    id: currentModuleId
  }
}

// 把模块依赖由树结构更改为数组结构，扁平化，方便更快的索引
//
// {
//   id: 0,
//   filename: A,
//   deps: [
//     { id: 1, filename: B, deps: [] },
//     { id: 2, filename: C, deps: [] },
//   ]
// }
// ====> 该函数把数据结构由以上转为以下
// [
//   { id: 0, filename: A }
//   { id: 1, filename: B }
//   { id: 2, filename: C }
// ]
function moduleTreeToQueue (moduleTree) {
  const { deps, ...module } = moduleTree

  const moduleQueue = deps.reduce((acc, m) => {
    return acc.concat(moduleTreeToQueue(m))
  }, [module])

  return moduleQueue
}

// 构建一个浏览器端中虚假的 Commonjs Wrapper
// 注入 exports、require、module 等全局变量，注意这里的顺序与 CommonJS 保持一致，但与 webpack 不一致，但影响不大
// 在 webpack 中，这里的 code 需要使用 webpack loader 进行处理
function createModuleWrapper (code) {
  return `
  (function(exports, require, module) {
    ${code}
  })`
}

// 根据入口文件进行打包，也是 mini-webpack 的入口函数
function createBundleTemplate (entry) {
  // 如同 webpack 中的 __webpack_modules__，以数组的形式存储项目所有依赖的模块
  const moduleTree = buildModule(entry)
  const modules = moduleTreeToQueue(moduleTree)

  // 生成打包的模板，也就是打包的真正过程
  return `
// 统一扔到块级作用域中，避免污染全局变量
// 为了方便，这里使用 {}，而不用 IIFE
//
// 以下代码为打包的三个重要步骤：
// 1. 构建 modules
// 2. 构建 webpackRequire，加载模块，模拟 CommonJS 中的 require
// 3. 运行入口函数
{
  // 1. 构建 modules
  const modules = [
    ${modules.map(m => createModuleWrapper(m.code))}
  ]

  // 模块缓存，所有模块都仅仅会加载并执行一次
  const cacheModules = {}

  // 2. 加载模块，模拟代码中的 require 函数
  // 打包后，实际上根据模块的 ID 加载，并对 module.exports 进行缓存
  function webpackRequire (moduleId) {
    const cachedModule = cacheModules[moduleId]
    if (cachedModule) {
      return cachedModule.exports
    }
    const targetModule = { exports: {} }
    modules[moduleId](targetModule.exports, webpackRequire, targetModule)
    cacheModules[moduleId] = targetModule
    return targetModule.exports
  }

  // 3. 运行入口函数
  webpackRequire(0)
}
`
}

module.exports = createBundleTemplate

```




## 疑问
- [x] 











