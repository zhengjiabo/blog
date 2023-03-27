---
title: vue-next shared 工具类源码阅读
date: 2021-09-04
tags:
 - 源码阅读      
categories: 
 - frontEnd
---

## 疑问
1. 使用这些工具类能给我带来什么好处
2. 在我的项目里使用，有何注意项，团队过度有压力吗
## 1 index.ts
### 1.1 babelParserDefaultPlugins
用来声明用于【模板表达式转换】和【SFC脚本转换】的@babel/parser插件列表，会随着ES2020提案而更新
```js
const babelParserDefaultPlugins = [
  'bigInt',
  'optionalChaining',
  'nullishCoalescingOperator'
];
```

- bigInt： **BigInt is a new primitive that provides a way to represent whole numbers larger than 253**[<sup id="$1">1</sup>](#1) ，用来表示大于$2^{53}$的一种整数新单位。
- optionalChaining：**allows a developer to handle many of those cases without repeating themselves and/or assigning intermediate results in temporary variables**[<sup id="$2">2</sup>](#2)可选链，在深度读取对象值时，避免重复性地进行临时中间变量的存在判断，解决无意义判空。还有一篇**无报错链式取值的几种方法**[<sup id="$3">3</sup>](#3)可以学习下。
- nullishCoalescingOperator：**When performing property accesses, it is often desired to provide a default value if the result of that property access is null or undefined**[<sup id="$4">4</sup>](#4)空值合并？访问未定义值或空值时，可提供未默认值，且避免数字0/空字符串''/Boolean False被覆盖。解决无意义赋值。

### 1.2 EMPTY_OBJ
空对象   
Object.freeze(obj)：冻结对象，不能增删改该对象的熟悉，不过可以改该对象内部引用的对象的属性  

```js
const EMPTY_OBJ = (process .env.NODE_ENV !== 'production')
  ? Object.freeze({})
  : {};


const obj = {
  prop: 0,
  subObj: {
    subProp: 0
  }
};
Object.freeze(obj);

obj.prop = 1; // fail
obj.subObj.subProp = 1; //success

```
> `process.env.NODE_ENV` 环境变量，用来判断当前环境，如非生产用 `Object.freeze({})`，错误操作会提示错误信息。生产环境则无需这些错误信息

> 由于 Vitepress 搜跨插件有问题，代码快识别 `process.env.NODE_ENV` 会转成变量，所以后续代码中会故意空格，如 `process .env.NODE_ENV`。


### 1.3 EMPTY_ARR
空数组    

Object.freeze([])：冻结数组，数组也无法更改
```js
const EMPTY_ARR = (process .env.NODE_ENV !== 'production') ? Object.freeze([]) : [];


const arr = [0];
Object.freeze(arr);

arr[0] = 1; // fail
arr.pop(); // fail
arr.push(0); // fail
```

### 1.4 NOOP
空函数 

   
1. 便于判断
```js
const NOOP = () => { };


const instance = {
  render: NOOP
};

// 某些条件写会进行重写
if (flag) {
  instance.render = function() {
    // 带带弟弟
  };
}

// 判断是否改写
if(instance.render !== NOOP) {
  // 做些什么
}

```
2. 压缩代码

### 1.5 NO
返回false的函数，作用：压缩代码
```js
const NO = () => false;
```


### 1.6 isOn
判断是否on开头，后续小写字母的函数
```js
const onRE = /^on[^a-z]/;
const isOn = (key) => onRE.test(key);


isOn('onClick'); // false
isOn('onclick'); // true
isOn('onclick1'); // false
```

### 1.7 isModelListener
判断是否数据监听以onUpdate:开头的函数
```js
const isModelListener = (key) => key.startsWith('onUpdate:');


isModelListener('something onUpdate:'); // false
isModelListener('onUpdate:data'); // true
isModelListener('OnUpdate:data'); // false
```

### 1.8 extend
Object.assign的简写，继承/合并
```js
const extend = Object.assign;


const data = {
  name: 'John'
};
extend(data, {age: 18}); // { name: 'John', age: 18 }
extend(data, {name: '弟弟'}); // { name: '弟弟', age: 18 }
```

### 1.9 remove
在数组中删除指定元素的函数
```js
const remove = (arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) {
    arr.splice(i, 1);
  }
};


// 常量
const arr = ['a', 'b', 'c'];
remove(arr, 'b'); // [ 'a', 'c' ]

// 引用型需要注意
const father = {name: 'father'};
const morther = {name: 'morther'};
const son = {name: 'son'};
const family = [father, morther, son];

// 此对象并非son
remove(family, {name: 'son'}); // [ { name: 'father' }, { name: 'morther' }, { name: 'son' } ]

// 正确操作
remove(family, son); // [ { name: 'father' }, { name: 'morther' } ]
```

### 1.10 hasOwn
是否本身拥有的属性

```js
const hasOwnProperty = Object.prototype.hasOwnProperty;


const hasOwn = (obj, prop) => hasOwnProperty.call(obj, prop);

hasOwn({name: 'John'}, 'name') // true
hasOwn({}, 'hasOwnProperty') // false
```

### 1.11 isArray
Array.isArray的简写，是否数组

```js
const isArray = Array.isArray;


const fakeArr = {
  __proto__: Array.prototype, length: 0
};

isArray([]) // true
isArray(fakeArr) // false
fakeArr instanceof Array // true

```
instanceof是通过检查构造函数的prototype是否出现在实例对象的原型链上， 所以此处使用并不能准确判断

### 1.12 isMap
是否Map对象

```js
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const isMap = (val) => toTypeString(val) === '[object Map]';


const map = new Map();
const obj = {
  name: 'John'
};

map.set(obj, 'value');
map.get(obj); // value
```
对象是字符串-值的映射，Map是值-值的映射，适应性更广。

```js
// 例如映射关系，有时候键并非文本
const data = {};
const elementDiv = document.getElementById('myDiv');
const elementSpan = document.getElementById('mySpan');
data[elementDiv] = 'div'; // {[object HTMLHeadingElement]: 'div'}
// element被自动转为字符串[object HTMLDivElement] 这就不唯一了。

// 使用Map
const map = new Map();
map.set(elementDiv, 'div');
map.set(elementSpan, 'span');
map.get(elementDiv); // div
map.get(elementSpan); // span
```
    
可以参考阮一峰老师的文章 **ECMAScript 6 入门 - Map**[<sup id="$5">5</sup>](#5)


### 1.13 isSet
是否Set对象

```js
const isSet = (val) => toTypeString(val) === '[object Set]';


const set = new Set();
set.add('13');
isSet(set); // true
```

Set类似于数组，不会添加重复值，内部的值都是唯一的。
```js
let set = new Set([1, 2, 3, 3, 3]); // [1, 2, 3]
set.size // 3

set.add(1)
set.size // 3

// NaN 也唯一
set = new Set([NaN, NaN]); // [NaN]
set.size // 1
set.has(NaN) // true

// 对象不唯一
set = new Set([{}, {}]); // [{}, {}]
set.size // 2
set.has({}) // false
```

可以参考阮一峰老师的文章 **ECMAScript 6 入门 - Set**[<sup id="$6">6</sup>](#6)


### 1.14 isDate
是否为日期Date对象

```js
const isDate = (val) => val instanceof Date;


isDate(new Date()); // true
```
感觉用Object.prototype.toString.call() 去判断会更好

### 1.15 isFunction
是否为函数
```js
const isFunction = (val) => typeof val === 'function';


isFunction(() => {}) // true

```
typeof 可返回 'undefined'，'string'，'boolean'，'number'，'function'，'object'，'bigint'，'symbol' 8种

### 1.16 isString
是否为文本
```js
const isString = (val) => typeof val === 'string';


isString('') // true

```

### 1.17 isSymbol
是否为Symbol，独一无二的值
```js
const isSymbol = (val) => typeof val === 'symbol';


const s = Symbol(); // 无需new，Symbol是原始值，并非对象，不可以使用New
isSymbol(s) // true 


let s1 = Symbol('foo'); // 添加传参是便于区分
let s2 = Symbol('bar');

s1 // Symbol(foo)
s2 // Symbol(bar)

s1.toString() // "Symbol(foo)"
s2.toString() // "Symbol(bar)"
```

Symbol的目的是作为唯一值，
1. 解决对象内部，键名字符串重复问题
2. 作为值唯一，消除魔术字符串
```js
function getArea(shape, options) {
  let area = 0;

  switch(shape) {
    case 'Triangle': // 魔术字符串
      area = .5 * options.width * options.height;
      break;
    /* more code */
  }

  return area
}
getArea('Triangle', { width: 100, height: 100 }); // 魔术字符串


/* Triangle为常出现字段，与代码形成强耦合不利于维护，应该抽出 */
const shapeType = {
  triangle: 'Triangle'
}
function getArea(shape, options) {
  let area = 0;

  switch(shape) {
    case shapeType.triangle: // 魔术字符串
      area = .5 * options.width * options.height;
      break;
    /* more code */
  }

  return area
}
getArea(shapeType.triangle, { width: 100, height: 100 }); // 魔术字符串


/* shapeType.triangle值不重要，只要唯一不冲突即可 */
const shapeType = {
  triangle: new Symbol
}

```
特别是魔术字符串，值并不需要提交参与后台数据，仅仅作为前端逻辑判断的标志，在项目中出现的频次挺高的。

更多内容可以参考阮一峰老师的文章 **ECMAScript 6 入门 - Symbol**[<sup id="$7">7</sup>](#7)


### 1.18 isObject
是否为对象
```js
const isObject = (val) => val !== null && typeof val === 'object';

typeof null // object 所以要去除他

isObject(null) // false
isObject([]) // true
isObject({}) // true
```


### 1.19 isPromise
是否为Promise
```js
const isPromise = (val) => {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch);
};

isPromise(new Promise((resolve, reject) => resolve(''))); // true
```

### 1.20 objectToString
Object.prototype.toString简写，对象转字符串

```js
const objectToString = Object.prototype.toString;
// 跟call结合使用
```

### 1.21 toTypeString
获取其类型 返回字符串

```js
const toTypeString = (value) => objectToString.call(value);


toTypeString(new Date()) // '[object Date]'
```

### 1.22 toRawType
获取其原始类型 返回字符串

```js
const toRawType = (value) => {
    // extract "RawType" from strings like "[object RawType]"
    return toTypeString(value).slice(8, -1); // 截取RawType
};


toRawType(new Date()) // 'Date'
```


### 1.23 isPlainObject
是否纯粹的对象

```js
const isPlainObject = (val) => toTypeString(val) === '[object Object]';

isObject([]) // true 上面的isObject, 只判断typeof
isPlainObject([]) // false
isPlainObject(new Date()) // false
isPlainObject({}) // true
```


### 1.24 isIntegerKey
是否自然数文本，不可有小数

```js
const isIntegerKey = (key) => isString(key) &&
  key !== 'NaN' &&
  key[0] !== '-' &&
  '' + parseInt(key, 10) === key;


isIntegerKey('0') // true
isIntegerKey('1') // true
isIntegerKey('1.00') //false
isIntegerKey(1) // false
```

### 1.25 makeMap
传入一个以逗号隔开的文本，生成一个Map，并返回一个函数用来判断输入文本是否在该Map中。
参二可指定是否期望小写

```js
/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * IMPORTANT: all calls of this function must be prefixed with
 * \/\*#\_\_PURE\_\_\*\/
 * So that rollup can tree-shake them if necessary.
 */
function makeMap(str, expectsLowerCase) {
  const map = Object.create(null);
  const list = str.split(',');
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val];
}
```
使用该方法的函数，需要在使用前标志 **/\*#\_\_PURE\_\_\*/**，在必要条件下会对其tree-shake    

Object.create(proto,[propertiesObject])
- proto: 新创建对象的**原型对象**
- propertiesObject: 可选。要添加到新对象的可枚举（新添加的属性是其自身的属性，而不是其原型链上的属性）的属性。
  

为什么用Object.create(null)，而不是更简洁的{}。    
- 纯净的对象，原型链上没有任何属性，即不继承Object的任何东西。
- 在纯净的对象上的属性，都为其实例属性，不必多余判断。
  
更多可以参考**详解Object.create(null)**[<sup id="$8">8</sup>](#8)

### 1.26 isReservedProp
是否保留字段

```js
const isReservedProp = /*#__PURE__*/ makeMap(
// the leading comma is intentional so empty string "" is also included
',key,ref,' +
  'onVnodeBeforeMount,onVnodeMounted,' +
  'onVnodeBeforeUpdate,onVnodeUpdated,' +
  'onVnodeBeforeUnmount,onVnodeUnmounted');


// 第一个逗号故意留着的，空格也算
isReservedProp(''); // true
isReservedProp('key'); // true
```

### 1.27 cacheStringFunction
文本缓存函数    
提供一个函数，用于定义在无缓存情况下的值计算    
返回一个函数，提供文本读取缓存值

```js
const cacheStringFunction = (fn) => {
  const cache = Object.create(null);
  return ((str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  });
};
```

### 1.28 camelizeRE
驼峰正则    
匹配-[a-zA-Z0-9_] 并捕获 [a-zA-Z0-9_]

```js
const camelizeRE = /-(\w)/g;
```

### 1.29 camelize
连字符 转 驼峰，此方法以及后续方法用到了上面的缓存。    

```js
const camelize = cacheStringFunction((str) => {
    return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''));
});


camelize('on-click') // onClick
```


### 1.30 hyphenateRE
连字符正则    
非边缘大写字母捕获

```js
const hyphenateRE = /\B([A-Z])/g;
```


### 1.31 hyphenate
驼峰 转 连字符    

```js
const hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, '-$1').toLowerCase());


hyphenate('onClick') // on-click
```


### 1.32 capitalize
首字母转大写   

```js
const capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));


capitalize('click') // Click
```


### 1.33 toHandlerKey
取得事件处理规范命名  click => onClick    
监听

```js
const toHandlerKey = cacheStringFunction((str) => str ? `on${capitalize(str)}` : ``);


toHandlerKey('click') // onClick
```


### 1.34 hasChanged
判断是否有变化    
目的是用来判断值前后是否有变化，考虑到了NaN情况

```js
// compare whether a value has changed, accounting for NaN.
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);

// 或者 
const hasChanged = (value, oldValue) => {
  let flag
  if (x === y) {
    // 针对+0 不等于 -0的情况    Infinity 与 -Infinity对比
    flag =  x !== 0 || 1 / x === 1 / y;
  }
  // 针对NaN的情况
  flag = x !== x && y !== y;

  return !flag;
}

hasChanged('1', 1) // true
hasChanged(+0, -0); // true
hasChanged(NaN, NaN); // false
```
等号判断有以下场景无法满足    
- == 会转换类型    
- === +0等于-0 且 NaN不等于NaN    

Object.is为ES6的相等判断     
除了以下两点，其余等同===
1. +0不等于-0
2. NaN等于NaN    

更多内容可以参考阮一峰老师的文章 **ECMAScript 6 入门 -Object.is**[<sup id="$9">9</sup>](#9)


### 1.35 invokeArrayFns
执行数组里的函数

```js
const invokeArrayFns = (fns, arg) => {
    for (let i = 0; i < fns.length; i++) {
        fns[i](arg);
    }
};


const arr = [() => {console.log(tip + 'gege')}, (tip) => {console.log(tip + 'yaya')}];
invokeArrayFns(arr, 'Yeah~') // Yeah~gege   Yeah~yaya
```

### 1.36 def
定义对象里的键值

```js
const def = (obj, key, value) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    value
  });
};

const obj = {}
def(obj, 'Name', 'John') // {Name: 'John'}
```

数据描述符（其中属性为：enumerable，configurable，value，writable）与存取描述符（其中属性为enumerable，configurable，set()，get()）之间是有互斥关系的

> - value——当试图获取属性时所返回的值
> - writable——该属性是否可写。
> - enumerable——该属性在for in循环中是否会被枚举。
> - configurable——该属性是否可被删除。
> - set()——该属性的更新操作所调用的函数。
> - get()——获取属性值时所调用的函数。

更多可以参考**川神-JavaScript 对象所有API解析**[<sup id="$10">10</sup>](#10)


### 1.37 def
转数字
如果为转不了数字则保留原本

```js
const toNumber = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? val : n;
};


toNumber('1') // 1
toNumber('a1') // a1 
toNumber('1a') // 1
```


### 1.38 getGlobalThis
获取全局对象

```js
let _globalThis;
const getGlobalThis = () => {
  return (_globalThis ||
    (_globalThis =
      typeof globalThis !== 'undefined'
        ? globalThis
        : typeof self !== 'undefined'
          ? self
          : typeof window !== 'undefined'
            ? window
            : typeof global !== 'undefined'
              ? global
              : {}));
};

/**
 * 从缓存拿，有则使用
 * 没有则判断globalThis有无定义，有则使用 ；基本大部分环境有，但IE无法
 * 没有则判断self有无定义，有则使用 ； 在 Web Workers 中，只有 self 可以
 * 没有则判断window有无定义，有则使用； 在 Web 中，可以通过 window 访问
 * 没有则判断global有无定义，有责使用 ；在 Node.js 中，它们都无法获取，必须使用 global。
 * 没有则使用{}空对象；小程序上
 * /
```

> globalThis 提供了一个标准的方式来获取不同环境下的全局 this  对象（也就是全局对象自身）。不像 window 或者 self 这些属性，它确保可以在有无窗口的各种环境下正常工作。所以，你可以安心的使用 globalThis，不必担心它的运行环境。为便于记忆，你只需要记住，全局作用域中的 this 就是 globalThis。

更多可以参考**MDN globalThis** [<sup id="$11">11</sup>](#11)


## 参考资料
- [川神的笔记：https://juejin.cn/post/6994976281053888519](https://juejin.cn/post/6994976281053888519)
  
- <span id="1"></span>[1] [BigInt：https://github.com/tc39/proposal-bigint](https://github.com/tc39/proposal-bigint) ===> [back](#$1)
- <span id="2"></span>[2] [proposal-optional-chaining：https://github.com/tc39/proposal-optional-chaining](https://github.com/tc39/proposal-optional-chaining) ===> [back](#$2)
- <span id="3"></span>[3] [无报错链式取值的几种方法：https://zhuanlan.zhihu.com/p/29296692](https://zhuanlan.zhihu.com/p/29296692) ===> [back](#$3)
- <span id="4"></span>[4] [proposal-nullish-coalescing：https://github.com/tc39/proposal-nullish-coalescing](https://github.com/tc39/proposal-nullish-coalescing) ===> [back](#$4)
- <span id="5"></span>[5] [阮一峰-ECMAScript 6 入门-Map：https://es6.ruanyifeng.com/#docs/set-map#Map](https://es6.ruanyifeng.com/#docs/set-map#Map) ===> [back](#$5)
- <span id="6"></span>[6] [阮一峰-ECMAScript 6 入门-Set：https://es6.ruanyifeng.com/#docs/set-map#Set](https://es6.ruanyifeng.com/#docs/set-map#Set) ===> [back](#$6)
- <span id="7"></span>[7] [阮一峰-ECMAScript 6 入门-Symbol：https://es6.ruanyifeng.com/#docs/symbol](https://es6.ruanyifeng.com/#docs/symbol) ===> [back](#$7)
- <span id="8"></span>[8] [详解Object.create(null)：https://juejin.cn/post/6844903589815517192](https://juejin.cn/post/6844903589815517192) ===> [back](#$8)
- <span id="9"></span>[9] [阮一峰-ECMAScript 6 入门-Object.is：https://es6.ruanyifeng.com/#docs/object-methods#Object-is](https://es6.ruanyifeng.com/#docs/object-methods#Object-is) ===> [back](#$9)
- <span id="10"></span>[10] [川神-JavaScript 对象所有API解析：https://mp.weixin.qq.com/s?__biz=MzA5MjQwMzQyNw%3D%3D&idx=1&mid=2650744625&scene=21&sn=58a1d6f98d9f7f0298ab36a26f660427#wechat_redirect](https://mp.weixin.qq.com/s?__biz=MzA5MjQwMzQyNw%3D%3D&idx=1&mid=2650744625&scene=21&sn=58a1d6f98d9f7f0298ab36a26f660427#wechat_redirect) ===> [back](#$10)
- <span id="11"></span>[11] [MDN globalThis：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/globalThis](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/globalThis) ===> [back](#$11)


