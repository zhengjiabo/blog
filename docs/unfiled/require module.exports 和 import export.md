---
title: require module.exports 和 import export
date: 2021-11-05
tags:
 - node
     
categories: 
 - backEnd
---

## 1. 学前疑问
1. require module.exports 和 import export是什么
2. 各自的应用场景是什么





## 2. 初步了解
通过查阅 **NodeJS中的require和import**[<sup id="$1">1</sup>](#1)、**遵循的模块化规范不一样**[<sup id="$2">2</sup>](#2)、**AMD、CMD、CommonJs、ES6的对比**[<sup id="$3">3</sup>](#3)、**CommonJS模块和ES6模块的区别**[<sup id="$4">4</sup>](#4)、**Module 的语法**[<sup id="$5">5</sup>](#5)     
  
可以得知
- require/exports：
    - JavaScript社区中的开发者自己草拟的规则，AMD/CMD/CommonJS规范
    - 在运行时调用
    - 本质是赋值过程，可运行在任何地方。
- import/export：
    - ES6语法标准
    - 编译时调用，需经过编译，编译成ES5
    - 本质是解构过程，前面不允许有其他逻辑代码，需要babel转换为require。import必须放在文件开头

模块化规范：
- AMD: RequireJS在推广过程中对模块定义的规范化产出，用于浏览器
- CMD: SeaJS在推广过程中对模块定义的规范化产出
- CommomJS：Nodejs采用的模块规范，用于服务器

时间线：
- AMD/CMD 2010年前后出生，到2014年基本没落
- 2014年，Nodejs模板规范CommonJS。webpack开始发展，用于打包CommonJS。
- 2015年，ES6发版，Nodejs和浏览器无法直接使用ES6，Webpack上使用babel-loader将其转为require/exports，ES6推广


结论：
- 目的是模块化，文件内的所有未暴露出去变量，外部都无法获取。
- 发展后，本质上还是打包成require/exports。



## 3. 普通用法
- require/exports
    ```js
    exports.fs = fs // 返回 {fs: fs}
    module.exports = fs // 返回 fs

    const fs = require('fs')
    ```

- import/export  （ES6）
    ````js
    export default fs
    export const fs
    export function readFile
    export { readFile, read } // 推荐 因为上面的比较零散，这个统一输出内容，一目了然
    export { myAdd as add } // 输出重命名
    export * from 'fs'

    import fs from 'fs'
    import { default as fs } from 'fs' // 等效于上一句
    import * as fs from 'fs'  // 所有输出都整合成fs对象
    import { readFile } from 'fs'
    import { readFile as read } from 'fs'
    import fs, { readFile } from 'fs'

    ````
两者都是输出一个具有多个属性、方法的对象。    


## 4 COMMONJS
### 4.1 COMMONJS中 exports 和 module.exports关系
结论：两者相等    
exports 是 module.exports 的引用
```js
// module.js
var say = () => {
    console.log('hello')
}

exports.say = say
console.log('module.exports: ', module.exports)
console.log('module.exports equal exports', exports === module.exports)


// index
var module = require('./module')
module.say()

// 输出
/*
module.exports: {say: f say()}
module.exports equal exports  true
*/


/* 查看打包后的源码加深印象 */
// __webpack_require__方法
function __webpack_require__(moduleId) {
    // ...code
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__) 
    // 可以看到第三个传参 就是module.exports
    // ...code
}

// 每个模块都会通过__webpack_require__去调用
// 这里第二个exports 就是上面的第三个传参module.exports
function(module, exports, __webpack_require__) {
    'use strict'

    var say = function say() {
        console.log('hello');
    };
    exports.say = say;
    console.log('module.exports: ', module.exports);
    console.log('module.exports equal exports', exports === module.exports);
}
```

注意：
- 属性/方法可以直接挂载在exports上，例如：exports.say = say
- 单一赋值，只能用modules.exports，例如：exports = say 将会切断exports和modules.exports的联系。需要用modules.exports = say替代



### 4.2 COMMONJS中的require
require等价于module.exports，module.exports后面内容是什么，require的结果就是什么。    
所以可以添加在任何地方, 看代码便于理解
```js
// counter.js
module.exports = {
    count: 0,
    increaseCount: () => {
        console.log('increase count to', ++module.exports.count)
    }
}

// commonjs.js
const { count } = require('./counter') // 第一处引用
console.log('commonjs count', count)
const { increaseCount } = require('./counter') // 第二处引用
increaseCount()
console.log('read count after increase in comonjs.js', count)
```
打包后如下
```js
// counter.js打包完代码如下
/* 3 */ /***/
function(module, exports, __webpack_require__) {
    "use strict";

    module.exports = {
        count: 0,
        increaseCount: function increaseCount() {
            console.log('increase count to', ++module.exports.count)
        }
    }
}

// commonjs.js
/* 2 */ /***/
function(module, exports, __webpack_require__) {
    "use strict";

    var _require = __webpack_require__(3), // 可以看出 这两处引用都是一样的 require等于模块输出 可添加在任何地方
        count = _require.count;
    
    console.log('commonjs count');

    var _require2 = __webpack_require__(3), // 可以看出 这两处引用都是一样的 require等于模块输出 可添加在任何地方
        increaseCount = _require2.increaseCount;

    increaseCount();
    console.log('read count after increase in comonjs.js', count);
}
```


## 5 ES6
### 5.1 ES6中 exports 和 exports.default
对应的是以下两种输出
- exprts: 命名输出
- export.default 默认输出

default是ES6的关键字，用于指定默认输出，而没有default关键字的是命名输出    
命名输出没有数量限制，默认输出只能有一个。     


### 5.2 ES6 export 命名输出
命名输出后面需要命名表达式 或 匿名对象  
本质是抽出命名变量作为exports属性    
```js
// export 命名输出后面需要命名表达式 或 匿名对象
/* 例子1 命名表达式 正确 */
export const func = () => {}

/* 例子2 匿名对象 正确 */
const func = () => {}
export { func }
// 例1和2打包后，都类似于
var func = exports.func = function func() {}


/* 例子3 错误 */
const func = () => {}
export func
// 打包错误 因为export后面需要命名表达式 或 匿名对象
```
结论：
1. 可以理解为export后面跟着输出接口，形式可以是变量声明：例子1
2. 形式也可以是{}，用来批量指定输出接口，例子2。本质还是例子1
3. 后面不能跟值，例子3，本质还是将值() => {}放在export后面

### 5.3 ES6 export default 默认输出 
本质是将后面的值或变量赋值给exports.default
```js
// export default 是将后面的值或变量赋值给exports.default
/* 例子1 正确 */
const func = () => {}
export default fs
// 打包后
var func = function func() {}
exports.default = func


/* 例子2 正确 */
export default () => {}
// 打包后
exports.default = function() {}


/* 例子3 正确 */
const func = () => {}
export default func 
// 打包后
var func = function func() {}
exports.default = func  // 对于输入模块来说，func命名就消失了， 只有default


/* 例子3 正确 */
const func = () => {}
export default { func } // 这样写也可以，输出就是个对象，一般不推荐
// 打包后
var func = function func() {}
exports.default = { func: func }



/* 例子5 错误 */
export default const func = () => {}
// 打包错误 因为export default是把后面的值赋值给exports.default。这里后面不是值，是个表达式
```




### 5.4 ES6 export default 默认输出的只读引用的特殊性
ES6，基础数据类型生成的是只读引用。    
但使用export default生成的只读引用有点特殊，后续的值更改，并不会重新赋值给exports.default。    

结论：export default 基本数据类型赋值给新变量，修改原变量，不影响新变量的取值。    
```js
export let num = 1
++num

let number = 1
export default number
++number

// 打包后
var num = exports.num = 1
exports.num = num += 1
// 可以看出 命名输出，后续参数更改，exports.num会进行同步更改，所以只读引用可取得最新的值。

var number = 1
exports.default = number
++number
// 可以看出++number 已经和exports.default无关了，虽然exports.default也是个只读引用，但原变量number的更改并不会对exports.default进行同步更改
```
主要原因是后续的对原变量number更改，并不会用原变量number对export.default重新赋值    






### 5.5 两个输出后续跟匿名对象的对比
可以概况为
- export：抽出命名变量作为exports属性  
- export default：将后面的值赋值给exports.default
```js
// 命名输出
const func = () => {}
export { func } // 跟匿名对象
// 打包后
var func = function func() {}
exports.func = func



// default 默认输出
const func = () => {}
export default { func } // 跟匿名对象
// 打包后
var func = function func() {}
exports.default = { func: func } // 匿名对象直接赋值给exports.default
```





### 5.6 ES6的export，经bable转化成ES5, 打包后的源码对比
COMMONJS
```js
// module.js
const count = 0
const func = () => {}
module.exports = {
    count,
    func
};

// 打包后代码
(function(module, exports, __webpack_require__) {
    "use strict";
    var count = 0;
    var func = function func() {}
    module.exports = {
        count,
        func
    };
});
```

ES6
```js
// module.js
const count = 0
const func = () => {}
exports {
    count,
    func
};

// 打包后代码
(function(module, exports, __webpack_require__) {
    "use strict";

    // 标志该输出已经被babel处理过。后续引入时，取默认值会核对该字段，决定是否将原对象赋值给default
    Object.defineProperty(exports, '__esModule', { 
        value: true
    });

    var count = 0;
    var func = function func() {}
    
    exports.count = count;
    exports.func = func;
});
```
结论：ES6经过bable转化后，
- 添加了bable处理标志__esModule，其他一致。可以在下面了解到该标志作用


### 5.7. import不同取值方式，打包后的源码对比
在5.6同一输出文件情况下，看import不同取值方式，打包后的源码对比
```js
// module.js
const count = 0
const func = () => {}
exports = {
    count,
    func
};
```
1. 取默认输出
    ```js
    /* 取默认输出 */
    import counter from './module.js'
    console.log(counter)

    // 打包后
    (function(module, exports, __webpack_require__) {
        "use strict";

        var _module = __webpack_require__(1);
        var _module2 = _interopRequireDefault(_module);

        // 如果有babel处理过的标志，直接返回。否则，添加default属性，指向原引用。
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
        }
        console.log(_module2.default); // undefined 因为输出文件没有default
    });
    ```
    结论：
    - 如果使用ES6的export输出，ES6引用import，就默认开发者是能明确认知到：是否需要default，所以引用时直接返回，不会添加default指向原引用。
    - 如果使用COMMONJS的module.exports，ES6引用import，会自动添加default指向原引用。（当然不推荐这么混合使用）

2. 取所有输出的集合
    ```js
    /* 取所有输出的集合 */
    import * as counter from './module.js'
    console.log(counter)

    // 打包后
    (function(module, exports, __webpack_require__) {
        "use strict";

        var _module = __webpack_require__(1);
        var counter = _interopRequireWildcard(_module)

        // 作用:import整个模块的所有属性时，会判断require的模块是否被babel处理过，返回模块引用。
        // 如果被处理过，正常返回。
        // 如果未被处理过，则浅拷贝一个新对象，且添加default指向原引用，返回新对象
        // 与上面的_interopRequireDefault相比，多了浅拷贝属性
        function _interopRequireWildcard(obj) {
            if (obj && obj.__esModule) { // babel处理过正常返回
                return obj;
            } else { // 未被babel处理过
                var newObj = {};
                if (obj != null) {
                    for (var key in obj) {
                        if (Object.prototype.hasOwnProperty.call(obj, key)) {
                            newObj[key] = obj[key];
                        }
                    }
                }
                newObj.default = obj // 添加default属性，指向原引用。
                return newObj;
            }
        }
        console.log(counter); // {count:0, func: f, __esModule: true}
    ```
    结论：因为是取所有输出的集合，所以用的是_interopRequireWildcard 返回一个浅拷贝对象，而不是_interopRequireDefault仅处理default。和默认输出也就这点差别。

3. 取指定输出
    ```js
    /* 取指定输出 */
    import { count } from './module.js'
    console.log(count)

    // 打包后
    (function(module, exports, __webpack_require__) {
        "use strict";

        var _module = __webpack_require__(1);
       
        console.log(_module2.count); // 0
    });
    ```
    结论：
    - 打包后最简单，没有读取defaul自然无需特殊的方法去处理default。
    - 执行时取模块module.exports的属性（只读引用），切记。不是取module.exports.default的属性（在下面有进一步讲解）


### 5.8 import的引用解构
`import fs from 'fs'`fs是默认输出，但如果使用解构，针对的是module.exports
```js
// func.js
const func = () => {}
export default { func }


/* 例子1 */
// import.js
import module from './func.js' 
// 此时module = exports.default = {func: func}
// 所以要调用func 需要调用 module.func

/* 例子2 */
import { func } from './func.js' // 此处的func是undefined
// 因为func = exports.func = undefined, 只是对exports进行解构，并不是直接针对exports.default
// 如果真的要用解构，也只是取出defaul，并不是对其解构t。可以看下面，等同例子1  有点脱裤子放屁的感觉
// 等同import module from './func.js'
import { default as module } from './func.js' 
```
所以可以得出结论：import时的解构
1. 是对exports起作用，而不是exports.default
2. 解构用于取出命名输出
3. 默认输出只有一个，没必要对其进行解构。


### 5.9 import的提升效果
以下代码不会报错，编译时会将import提升到模块的顶部
```js
foo();

import { foo } from 'my_module';
```








## 6 差异比较

### 6.1 引用差异
- require/exports： 基础数据类型（复制，即缓存）、引用类型（浅拷贝）。
- import/export（ES6）：导入模块的属性和方法是只读引用，包括基础数据类型。或称为动态绑定

可以从另一个角度来理解：    
- 因为require/exports在执行时调用，基础数据类型在执行时已经取值赋值给新变量了，后续原变量的修改了，不影响新变量的取值。    
- import/export(ES6)需要经过编译，编译后，在基础数据类型处，生成只读引用，等到脚本真正执行时，才去取值。后续原变量的修改了，影响取值，因为读取的还是原变量的值

直接看代码便于理解
```js
// counter.js
module.exports = {
    count: 0,
    increaseCount: () => {
        console.log('increase count to', ++module.exports.count)
    }
}

// commonjs.js
const { count, increaseCount } = require('./counter')
console.log('commonjs count', count)
increaseCount()
console.log('read count after increase in comonjs.js', count)

// es6.js
import { count, increaseCount } from './counter'
console.log('es6 count', count)
increaseCount()
console.log('read count after increase in es6.js', count)

// 分别引入commonjs.js 和 es6.js后输出
/*
commonjs count 0
increase count to 1
read count after increase in commonjs.js 0
*/

/*
es6 count 0
increase count to 1
read count after increase in es6.js 1
*/
```
通过输出可得出，
- required取得基础数据类型的值和原变量无关联，为缓存。
- import取得基础数据类型的值与原变量息息相关（与编译成只读引用有关）。
- 也可以理解为const 和 import的区别，都是ES6的关键字    
- 以上只是举例子，不推荐更改模块里的值，比较难查错，建议凡是输入的变量，都当作完全只读，不要轻易改变它的属性。






### 6.2 引用差异-打包文件对比
可以看打包后的源码，加深印象
```js
// counter.js打包完代码如下
/* 3 */ /***/
function(module, exports, __webpack_require__) {
    "use strict";

    module.exports = {
        count: 0,
        increaseCount: function increaseCount() {
            console.log('increase count to', ++module.exports.count)
        }
    }
}

// commonjs.js
/* 2 */ /***/
function(module, exports, __webpack_require__) {
    "use strict";

    var _require = __webpack_require__(3),
        count = _require.count, // 复制变量的值
        increaseCount = _require.increaseCount;
    
    console.log('commonjs count');
    increaseCount(); // 原变量修改 但count已经缓存完了，不影响count
    console.log('read count after increase in comonjs.js', count);
}
// 结论：基础数据类型在执行时已经取值赋值给新变量了，后续原变量的修改了，不影响新变量的取值。    



// es6.js
/* 0 */ /***/
function(module, exports, __webpack_require__) {
    "use strict";

    var _es6Export = __webpack_require__(3);
    
    console.log('es6 count');
    (0, _es6Export.increaseCount)(); // 请看扩展-this指向window，全局环境中调用increaseCount方法
    console.log('read count after increase in es6.js', _es6Export.count); // 只读引用， 读取的还是原变量
}
// 结论：在基础数据类型处，生成只读引用，等到脚本真正执行时，才去取值。后续原变量的修改了，影响取值，因为读取的还是原变量的值
```
    
以下内容是上方打包代码的扩展，可选择性阅读    
- 扩展：逗号操作符 (0, func)()    
    作用1：本质是逗号操作符，对每个操作对象求值（从左到右），返回**最后**一个操作对象的值
    ```js
    （‘OMG’，false, 1，2，3） // 3
    /* 从左到右，无论左边多少个，写的是什么类型、值，都不影响最后的输出 
        所以不一定要(0, func)()，只是大家保持统一。*/

    const x = (2, 3) // 3

    fot (var i = 1, j = 0; i < 10; i++, j++) {}
    // var i,j 并不是逗号操作符，不是存在于一个表达式，是var中的特殊符号
    // 但后面的i++,j++ 是逗号操作符，存在于一个表达式。
    ```
    作用2：改变方法的this指向，指向全局    
    作用和call 和 apply相当，为什么不用这两个呢，可能是怕原型链或这两个方法被人为改写。这个写法可以避开被改写问题
    ```js
    const person = {
        say: function () {
            console.log(this)
        }
    }
    person.say() // {say: f}
    (0, person.say)() // Window  网页里
    ```
    这时候对于webpack打包处理的，便可以理解了
    ```js
    // es6.js
    import { count, increaseCount } from './counter'
    increaseCount() // 可以看到increaseCount是在全局直接调用的，

    
    // 打包后
    /* 所以打包后的increaseCount的this也要指向window, 而不是_esExport */
    var _es6Export = __webpack_require__(3);
    
    console.log('es6 count');
    (0, _es6Export.increaseCount)(); // increaseCount方法的this指向全局






    /* 如果我们是以下这样写的，那打包结果不是指向全局，自然就不会用到逗号操作符了 */
    // es6.js
    import * as counter from './counter'
    counter.increaseCount() // this为counter

    // 打包后
    var _es6Export = __webpack_require__(3);
    var counter = _interopRequireWildcard(_es6Export)

    console.log('es6 count');
    counter.increaseCount(); // 因为打包前就是在counter下调用increaseCount
    ```




### 6.3 条件引用、动态引用的差异
- COMMONJS: 可以条件引用，可以动态引用
- ES11: 需要借助import()，可以条件引用，动态引用    

注意import()是ES11(ES2020)的规范

- 条件编译    
    COMMONJS 代码
    ```js
    /* COMMONJS 代码 */
    const flag = true
    let count
    if (flag) {
        count = require('./moduleA.js')
    } else {
        count = require('./moduleB.js')
    }
    console.log(count)


    // 打包后
    var flag = true;
    var count = viod 0;
    if (flag) { // 每个require 相当于module.exports， 在运行时调用
        count = __webpack_require__(3);
    } else {
        count = __webpack_require__(4);
    }
    console.log(count);
    ```
    ES6 代码 import
    ```js
    /* ES6 代码 import */
    const flag = true
    let count
    if (flag) {
        import count from './moduleA.js'
    } else {
        import count from './moduleB.js'
    }
    console.log(count)


    // 语法报错 
    // import在编译时调用， 此时flag的值都不确定。
    // import不可在条件语句中使用
    ```
    ES11 代码 import()
    ```js
    /* ES11 代码 import() */
    (async () => {
        const flag = true
        let count
        if (flag) {
            count = await import('./moduleA.js')
        } else {
            count = await import('./moduleB.js')
        }
        console.log(count)
    })()


    // 打包后代码
    (async () => {
        var flag = true
        var count = viod 0;
        if (flag) {
            count = await __webpack_require__.e(/* import() */ 2).then(__webpack_require__.t.bind(null, 3, 7)); // 最后才加载第一个模块分包  本质是__webpack_require__(id)
        } else {
            count = await __webpack_require__.e(/* import() */ 3).then(__webpack_require__.t.bind(null, 4, 7)); 
        }
        console.log(count)
    })()
    // 可以正常打包 多了__wepack_require__的e和t两个方法
    // e方法是异步加载script分包   t提供参数二为7时，为返回对应参数一的模块分包
    ```


- 动态引用    
    COMMONJS 代码
    ```js
    /* COMMONJS 代码 */
    /* 错误写法 -START- */
    const fileName = 'module';
    const path = './' + fileName;
    const myModual = require(path); // webpack需要预编译路径，不可以接收纯变量，否则无法预测
    // 一般提供目录 + 文件全名变量 
    /* 错误写法 -END- */

    /* 正确写法 -START- */
    const fileName = 'module';
    const myModual = require('./' + fileName);
    /* 正确写法 -END- */

    // 打包后
    function(module, exports, __webpack_require__)) {
        
        var fileName = 'module.js';
        var myModual = __webpack_require__(1)("./" + fileName); // 调取下面方法  本质上还是__webpack_require__
    }

    /* 1 */
    function(module, exports, __webpack_require__) {
        var map = { // 动态组件映射 且自动补充了js，没写后后缀也会尝试匹配
            "./import": 0,
            "./import.js": 0,
            "./module": 2,
            "./module.js": 2
        }

        function webpackContext(req) {
            var id = webpackContextResolve(req);
            return __webpack_require__(id); // 
        }
        function webpackContextResolve(req) {
            if(!__webpack_require__.o(map, req)){ // 判断属性在不在对象上 下面有代码
                var e = new Error("Cannot find            module '" + req + "'");
                e.code = 'MODULE_NOT_FOUND';
                throw e;
            }
            return map[req];
        }
        webpackContext.keys = function webpackContextKeys() {
            return Object.keys(map);
        };
        webpackContext.resolve = webpackContextResolve;
        module.exports = webpackContext; // 导出webpackContext
        webpackContext.id = 1;
    }

    /* __webpack_require__.o */
    // Object.prototype.hasOwnproperty.call
    __webpack_require__.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    }

    ```
    
    ES6 代码 import
    ```js
    /* ES6 代码 import */
    const fileName = 'module';
    const myModual = import './' + fileName;
    // 或者
    const myModual = import fileName;
    


    // 语法报错 
    // import在编译时调用， 此时flag的值都不确定。
    // import不可在动态引用中使用
    ```


    ES11 代码 import()
    ```js
    /* ES11 代码 import() */
    /* 错误写法 -START- */
    const fileName = 'module';
    const path = './' + fileName;
    const myModual = import(path); // webpack需要预编译路径，不可以接收纯变量，否则无法预测
    // 一般提供目录 + 文件全名变量 
    /* 错误写法 -END- */

    /* 正确写法 -START- */
    const fileName = 'module';
    const myModual = import('./' + fileName);
    /* 正确写法 -END- */


    // 打包后代码
    function(module, exports, __webpack_require__)) {
        
        var fileName = 'module.js';
        var myModual = __webpack_require__(1)("./" + fileName); // 调取下面方法  本质上还是__webpack_require__
    }

    /* 1 */
    function(module, exports, __webpack_require__) {
        var map = { // 动态组件映射 且自动补充了js，没写后后缀也会尝试匹配, 与COMMONJS不同的是，此处value为数组
            "./import": [0],
            "./import.js": [0],
            "./module": [2, 1],
            "./module.js": [2, 1]
        }
        function webpackAsyncContext(req) {
            if(!__webpack_require__.o(map, req)){ // 判断属性在不在对象上
                return Promise.resolve().then(function() { // 不在 报错
                    var e = new Error("Cannot find            module '" + req + "'");
                    e.code = 'MODULE_NOT_FOUND';
                    throw e;
                });
            }
            var ids = map[req], id = ids[0];
            return Promise.all(ids.slice(1).map(__webpack_require__.e)).then(function() { // 加载除了第一个模块分包外的所有分包。 第一个模块分包可能依赖后续script分包
                // e方法是异步加载script分包   t提供参数二为7时，为返回对应参数一的模块分包
                return __webpack_require__.t(id, 7); // 最后才加载第一个模块分包  本质是__webpack_require__(id)
            })
            return map[req];
        }


        webpackAsyncContext.keys = function webpackAsyncContextKeys() {
            return Object.keys(map);
        };

        webpackAsyncContext.id = 1;
        module.exports = webpackAsyncContext; // webpackAsyncContext
    }
    ```


### 6.3 循环引用




### 6.4 多次引用的差异







## 总结






## 课后疑问
1. AMD CMD COMMON规范？
2. import 怎么理解实质是加载指定方法，其他方法不加载，不把原引用整个加载。看完打包后源码和COMMONJS打包后源码没区别。
3. __wepack_require__的e和t两个方法扩展




## 参考资料
- <span id="1"></span>[1] [NodeJS中的require和import
：https://www.cnblogs.com/huancheng/p/10312822.html](https://www.cnblogs.com/huancheng/p/10312822.html) ===> [back](#$1)

- <span id="2"></span>[2] [遵循的模块化规范不一样：https://www.zhihu.com/question/56820346](https://www.zhihu.com/question/56820346) ===> [back](#$2)

- <span id="3"></span>[3] [AMD、CMD、CommonJs、ES6的对比：https://blog.csdn.net/tangxiujiang/article/details/81104174](https://blog.csdn.net/tangxiujiang/article/details/81104174) ===> [back](#$3)

- <span id="4"></span>[4] [CommonJS模块和ES6模块的区别：https://www.cnblogs.com/unclekeith/p/7679503.html](https://www.cnblogs.com/unclekeith/p/7679503.html) ===> [back](#$4)

- <span id="5"></span>[5] [Module 的语法：https://es6.ruanyifeng.com/#docs/module](https://es6.ruanyifeng.com/#docs/module) ===> [back](#$5)


