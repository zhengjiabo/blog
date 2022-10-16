---
title: Generator 函数
date: 2021-09-12
tags:
 - ES6     
categories: 
 - frontEnd
---

## 1. 学前疑问
学习co库时，提及了co库是用于 Generator 函数的自动执行。便带着疑问来学习Generator，目前有以下疑问
1. Generator是什么
2. 其解决了什么问题 或者 其是什么场景下的最优解





## 2. 初步了解
通过翻阅 **阮一峰老师 Generator 函数的语法**[<sup id="$1">1</sup>](#1)    
可以大概理解它是个状态机，在函数内封装了多个状态，通过调用 **next()** 方法，会依次返回状态值。    
状态值通过 **yield** 字段来定义，每次调用next()方法便会从函数头部或上一次停下来的地方开始执行，遇到下个yield字段或return便停下返回，返回一个遍历器对象（Iterator Object）。    

所以可以这么理解，yeild为暂停帧，next为播放键，每次点击播放，都会在暂停帧处停下，并返回对应参数。

```javascript
function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}

var hw = helloWorldGenerator();

hw.next()
// { value: 'hello', done: false }

hw.next()
// { value: 'world', done: false }

hw.next()
// { value: 'ending', done: true }

hw.next()
// { value: undefined, done: true }
```




## 3. 应用场景
Generator 是实现状态机的最佳结构，有以下优点
1. 状态封装在内部，无需额外的外部变量存储。
2. 状态不会被非法篡改。

```javascript
// 非Generator
var ticking = true;
var clock = function() {
  if (ticking)
    console.log('Tick!');
  else
    console.log('Tock!');
  ticking = !ticking;
}
clock()


// Generator
function* clock() {
  while (true) {
    console.log('Tick!');
    yield;
    console.log('Tock!');
    yield;
  }
}
clock.next()
```




## 4. 学习目标
知道其大概作用，以及应用场景后，想要学习更详细的内容，好在日常工作中把它应用起来。
1. 理解其原理或详细内容
2. 运用起来，写一个Demo




## 5. 详细内容

### 5.1 基础写法
Generator 函数是一个普通函数，但有几个特征：  
1. function右边有个*号（因为是普通函数，最好还是function后紧跟着*，不要中间间隔空格，虽然间隔也能正常运行）。
2. 内部使用 **yeild** 作为暂停标志或定义状态。
3. Generator函数()为一个暂缓执行函数，并不会立马执行，需要调用next方法才会真正开始执行。

```javascript
function* gen(x, y) {
  /* code */
  yield;
  /* code */
  yield;
  /* code */
  return;
}

const generator = gen();
gen.next();
```




### 5.2 yeild 暂停标志
Generator 函数返回的遍历器对象（Iterator Object），只有调用next方法才会继续遍历到下一个状态，下一个状态便可以使用yeild去定义。同时，也可以把它理解成一个暂停标志。





### 5.3 next 遍历下个状态
#### 5.3.1 遍历逻辑
跳转到下一个状态，遵循以下逻辑。    
1. 遇到 **yeild** 时，暂停后续操作，并把紧跟在yeild后的表达式，作为遍历器对象的vulue值返回。
2. 下次调用时，按照之前的位置继续执行，直至遇到下个yeild。
3. 遇到 **return** 时，停止后续操作，并把紧跟在return后的表达式，作为遍历器对象的vulue值返回，且遍历器对象的done值为true。
4. 没有 return 语句时，直到函数运行结束，返回的遍历器对象的value值为 **undefined** ，且遍历器对象的done值为true。

从以上逻辑不难看出，还是跟普通函数一样，只能执行一次 **return**，但可以有多个 **yeild**。


#### 5.3.2 传参
next(params)方法可以带一个参数，该参数就会被当作 **上一个yield表达式** 的返回值。   
其意义在于，可以在不同阶段下，传递不同的值，去调整函数的行为
```javascript
function* foo(x) {
  var y = 2 * (yield (x + 1));
  var z = yield (y / 3);
  return (x + y + z);
}

var a = foo(5);
a.next() // Object{value:6, done:false}
a.next() // Object{value:NaN, done:false}  
// NaN原因就是没传值 y = 2 * undefined  此时y/3就是NaN了

a.next() // Object{value:NaN, done:true}

var b = foo(5);
b.next() // { value:6, done:false }
// Started

b.next(12) // { value:8, done:false }
b.next(13) // { value:42, done:true }
```
从语义上讲，第一个next方法用来启动遍历器对象，所以不用带有参数。V8上直接忽略第一次使用next方法时的参数。    
但如果要让第一次使用时，便可以传参，以下可以实现
1. 需要包裹多一层，返回一个函数
2. 该函数内进行实例化，且调用第一次next
3. 将该实例返回    

只是将第一次调用封装了，所以这种实现方法，声明即执行了
```javascript
function wrapper(generatorFunction) {
  return function (...args) {
    let generatorObject = generatorFunction(...args);
    generatorObject.next();
    return generatorObject;
  };
}

const wrapped = wrapper(function* () {
  console.log('started')
  console.log(`First input: ${yield}`);
  console.log(`Second input: ${yield}`);
  return 'DONE';
});

const generator = wrapped()
// started

generator.next('hello!')
// First input: hello!
generator.next('hello!')
// Second input: hello!
```



### 5.4 常见报错
#### 5.4.1 普通函数中使用yield（需要在Generator函数中调用）
```javascript
(function (){
  yield 1;
})()
```


#### 5.4.2 普通函数使用yield另一种形式（可以使用for循环替代）
```javascript
var gen = function* () {
  [1, 2, 3].forEach(function (item) {
    yield item;
  });
};
var generator = gen();
generator.next();
// 报错


// 使用for循环替代
var gen = function* () {
  for(item of [1,2,3]) {
    yield item;
  }
};
var generator = gen();
generator.next();
```


#### 5.4.3 其它表达式中（需要加括号）
```javascript
function* demo() {
  console.log('Hello' + yield); // SyntaxError
  console.log('Hello' + yield 123); // SyntaxError

  console.log('Hello' + (yield)); // OK
  console.log('Hello' + (yield 123)); // OK
}

// 作为参数传参时无需括号，当然要保持习惯也可以加
function* demo() {
  foo(yield 'a', yield 'b'); // OK
  let input = yield; // OK
}


// 但我自己试了下，在声明foo后，执行以下代码，yield 'a'，在原传参位为undefined。不知道此种写法有什么用
function foo (a, b) {
  console.log('here', a, b);
}
var generator = demo();
generator.next(); // {value: 'a', done: false}
generator.next(); // {value: 'b', done: false}
generator.next(); 
// here undefined undefined
// {value: undefined, done: false}

```




### 5.5 Symbol.iterator
#### 5.5.1 对象添加 Iterator 接口
可以给任意一个对象的 **Symbol.iterator** 属性，赋值一个 **遍历器生成函数**， 从而使得该对象具有 Iterator 接口。   
Generator 函数就是遍历器生成函数。


```javascript
var myIterable = {};
myIterable[Symbol.iterator] = function* () {
  yield 1;
  yield 2;
  yield 3;
};

[...myIterable] // [1, 2, 3]  可以用...有Iterator 接口的体现
```
for...of循环，扩展运算符（...）、解构赋值和Array.from都可以调用，它们都是遍历器接口。

#### 5.5.2 Generator生成的遍历器对象
Generator 函数执行后，返回一个遍历器对象。  
该遍历器对象本身也具有Symbol.iterator属性，执行后返回自身。

```javascript
function* gen(){
  // some code
}

var g = gen();

g[Symbol.iterator]() === g // true
```


### 5.6 for...of 循环无需next
可以自动遍历Generator生成的Iterator对象，且无需执行next

```javascript
function* foo() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
  return 6;
}

var generator = foo()
for (let v of generator) {
  console.log(v);
}
// 1 2 3 4 5
```
特殊点：return的值，不包含在for...of中，所以6没打印出来




### 5.7 Generator.prototype.throw() 内部捕获错误
Generator函数返回的遍历器对象，可以在 **函数体外** 抛出错误，并且在 **Generator函数体内** 捕获错误

```javascript
var g = function* () {
  try {
    yield;
  } catch (e) {
    console.log('内部捕获', e);
  }
};

var i = g();
i.next();

try {
  i.throw('a');
  i.throw('b');
} catch (e) {
  console.log('外部捕获', e);
}
// 内部捕获 a
// 外部捕获 b
```
可以看出，第一次错误a，外部并没有捕获到。    
因为只执行一次next，此时代码来到try内部，暂停在yield字段上后，执行了i.throw('a')，此时Generator函数体内的try便捕获了错误，并打印出来。    
后续i.throw('b')，函数体内的暂停帧以及不在catch内部了（因为会附带执行一次next，看以下例子），无法再被内部捕获。该错误只能被外部捕获    


throw方法被捕获以后，会附带执行一次next    

```javascript
var gen = function* gen(){
  try { 
    // try catch 是必要的，否则一旦a报错
    // 后续无法执行，b c肯定不会打印
    yield console.log('a');
  } catch (e) {
    // ...
  }
  yield console.log('b');
  yield console.log('c');
}

var g = gen();
g.next() // a
g.throw() // b
g.next() // c
```

报错如果没被内部捕获，则后续代码不会继续执行，且下次next调用，会返回value: undefined, done: true
```javascript
function* g() {
  yield 1;
  console.log('throwing an exception');
  throw new Error('generator broke!');
  yield 2;
  yield 3;
}

function log(generator) {
  var v;
  console.log('starting generator');
  try {
    v = generator.next();
    console.log('第一次运行next方法', v);
  } catch (err) {
    console.log('捕捉错误', v);
  }
  try {
    v = generator.next();
    console.log('第二次运行next方法', v);
  } catch (err) {
    console.log('捕捉错误', v);
  }
  try {
    v = generator.next();
    console.log('第三次运行next方法', v);
  } catch (err) {
    console.log('捕捉错误', v);
  }
  console.log('caller done');
}

log(g());
// starting generator
// 第一次运行next方法 { value: 1, done: false }
// throwing an exception
// 捕捉错误 { value: 1, done: false }
// 第三次运行next方法 { value: undefined, done: true }
// caller done
```





### 5.8 Generator.prototype.return() 终结遍历
调用后，Generator的遍历便停止。调用后返回value为传入的参数，done为true
```javascript
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

var g = gen();

g.next()        // { value: 1, done: false }
g.return('foo') // { value: "foo", done: true }
g.next()        // { value: undefined, done: true }
```

如果执行到try代码块，调用了return，会进入finally代码块，直到finally代码块执行完，才真正返回return传入参数的状态。
```javascript
function* numbers () {
  yield 1;
  try {
    yield 2;
    yield 3;
  } finally {
    yield 4;
    yield 5;
  }
  yield 6;
}
var g = numbers();
g.next() // { value: 1, done: false }
g.next() // { value: 2, done: false }
g.return(7) // { value: 4, done: false }
g.next() // { value: 5, done: false }
g.next() // { value: 7, done: true }
```
可以看到，在执行`return(7)`后，并没有立马返回{value: 7, done: true}，而是知道finally函数块执行完，才返回。且不会执行finally函数块外部的yield 6。




### 5.9 next throw return 共同点
都是恢复执行，使用不同语句替换yield
- next 值替换yield
- throw throw语句替换yield
- return return语句替换yield





### 5.10 yield* Generator函数内执行另一个Generator，快捷遍历
Generator函数内执行另一个Generator，需要在前者内部去遍历后者    
可以将`yield`视为一个遍历循环，进行简写替代。
```javascript
// 实现方式1，手动遍历
function* foo() {
  yield 'a';
  yield 'b';
}

function* bar() {
  yield 'x';
  for (let v of foo()) {
    yield v;
  }
  yield 'y';
}

for (let v of bar()){
  console.log(v);
}
// "x"
// "a"
// "b"
// "y"

// 实现方式2，使用yield* 去完成这个遍历过程
function* bar() {
  yield 'x';
  yield* foo();
  yield 'y';
}


// 方式1 2 都等同以下结果
function* bar() {
  yield 'x';
  yield 'a';
  yield 'b';
  yield 'y';
}

```
yield* 为遍历简写，所以后面也可以跟着一个数组/字符串，数组/字符串原生支持遍历器。总而言之，只要有Iterator接口，都能被yeild* 遍历
```javascript
function* gen(){
  yield* ["a", "b", "c"];
}

gen().next() // { value:"a", done:false }


// -----
let read = (function* () {
  yield* 'hello';
})();

read.next().value // "h"
```
要理解好遍历
```javascript
function* genFuncWithReturn() {
  yield 'a';
  yield 'b';
  return 'The result';
}
function* logReturned(genObj) {
  // yield* 会将遍历器的yield遍历在此
  // 而遍历器中return的值会被获取
  // 只要记得 next throw return各种替换的语句即可
  let result = yield* genObj;
  console.log(result);
}

[...logReturned(genFuncWithReturn())]
// The result
// 值为 [ 'a', 'b' ]

```




### 5.11 yield* 遍历二叉树
```javascript
// 下面是二叉树的构造函数，
// 三个参数分别是左树、当前节点和右树
function Tree(left, label, right) {
  this.left = left;
  this.label = label;
  this.right = right;
}

// 下面是中序（inorder）遍历函数。
// 由于返回的是一个遍历器，所以要用generator函数。
// 函数体内采用递归算法，所以左树和右树要用yield*遍历
function* inorder(t) {
  if (t) {
    yield* inorder(t.left);
    yield t.label;
    yield* inorder(t.right);
  }
}

// 下面生成二叉树
function make(array) {
  // 判断是否为叶节点
  if (array.length == 1) return new Tree(null, array[0], null);
  return new Tree(make(array[0]), array[1], make(array[2]));
}
let tree = make([[['a'], 'b', ['c']], 'd', [['e'], 'f', ['g']]]);

// 遍历二叉树
var result = [];
for (let node of inorder(tree)) {
  result.push(node);
}

result
// ['a', 'b', 'c', 'd', 'e', 'f', 'g']
```




### 5.12 Generator作为对象的属性
```javascript
let obj = {
  *generator() {

  }
}

// 同等与

let obj = {
  generator: function* () {

  }
}
```




### 5.13 Generator的this
Generator函数规定它的一个遍历器，即它的实例。所以继承了它的原型上的方法属性
```javascript
function* g() {}

g.prototype.hello = function () {
  return 'hi!';
};

let obj = g();

obj instanceof g // true
obj.hello() // 'hi!'
```

返回实例，并非返回this对象，所以Generator函数内部this上的属性，在实例上是拿不到的。
```javascript
function* g() {
  this.a = 11;
}

let obj = g();
obj.next();
obj.a // undefined
```

如果想要Generator函数返回一个实例对象，可以使用next方法，又能正常获取this，那么需要使用到`call`
```javascript
function* F(){
  this.a = 1;
  yield this.b = 2;
  yield this.c = 3;
}
var obj = {}
var f = F.call(obj);

f.next();  // Object {value: 2, done: false}
f.next();  // Object {value: 3, done: false}
f.next();  // Object {value: undefined, done: true}

obj.a // 1
obj.b // 2
obj.c // 3
```
首先Generator函数内部的this，会绑定obj对象，然后返回Iterator对象。执行几次next后，会往obj对象捆绑属性。   
假如该对象是Generator的原型对象，那么便会往原型对象捆绑属性，便可以实现返回对象实例，可以使用next，又可以正常获取this(this指向 Generator.prototype).

```javascript
function* F() {
  this.a = 1;
  yield this.b = 2;
  yield this.c = 3;
}
var f = F.call(F.prototype);

f.next();  // Object {value: 2, done: false}
f.next();  // Object {value: 3, done: false}
f.next();  // Object {value: undefined, done: true}

f.a // 1
f.b // 2
f.c // 3
```

虽然Generator不可于new一起用，但还是扩展下    
`new` 关键字实例化的过程    
1. 创建空对象{}
2. 将构造函数的this指向空对象
3. 将空对象的__proto__指向构造函数的prototype
4. 执行构造函数的代码
```javascript

```




### 5.14 协程
概念：
- 后进先出的执行方式，只有当子函数完全执行完，才会继续执行父函数，这种称为子例程。
- 多个线程（单线程下为多个函数）可以并行执行，但只有1个线程处于正在运行状态，其它线程处于暂停状态。线程可以执行到一半，暂停执行，交换执行权给另一个线程，等稍后收回执行权，继续执行。这种可以并行执行，交换执行权的就叫作协程。
  

执行权:
- 在内存中，子例程只使用一个栈，而协程可以存在多个栈，但只有一个栈处于运行状态，以占用更多内存为代价，实现多任务并行。
- 普通线程是抢先式，由运行环境决定哪个线程优先得到资源。而协程是合作式，执行权由自己分配。
- JS是单线程语言，只有一个调用栈。但引用协程后，每个任务都可以保留自己的调用栈。例如抛出错误时，可以找到原始调用栈，不像异步回调一样，抛出错误时，原始调用栈早就结束了。
- Generator为半协程，不是协程的完全实现。只有Generator函数的调用者，才能将执行权还给Generator函数。如果是完全实现的协程，任何函数都可以让暂停的协程继续执行。
- 可以将多个互相协作的任务写成Generator函数，之间用yield表达式交换控制权。

上下文：
- 普通函数的执行，会产生函数运行的上下文环境，如果遇到子函数，又会在当前上下文环境的上层，产生一个新的函数运行的上下文，变成当前（active）的上下文，由此形成一个上下文环境的堆栈。后进先出原则，会将最后产生的上下文环境首先执行完成，弹出栈销毁，继续执行栈顶的上下文，直至代码运行完毕，栈清空。
- Generator函数的上下文并非如此，运行时产生上下文环境，遇到`yield`指令，便会弹出调用栈，但不会销毁，只是冻结上下文环境。等到`next`运行，会将刚刚冻结的上下文环境重新推入调用栈，恢复执行。






### 5.15 应用
Gnerator函数可以暂停函数，返回任意表达式的值。
1. 异步操作的同步表达    
   可以将异步操作写在yield表达式的下面，在调用next()后便会被执行
    ```javascript
    function* main() {
      var result = yield request("http://some.url"); // 2.调用request
      var resp = JSON.parse(result); // 4
        console.log(resp.value);
    }

    function request(url) {
      makeAjaxCall(url, function(response){  // 异步
        it.next(response); // 3. 将数据返回 并且调用next，使得主流程继续走下去
      });
    }

    var it = main();
    it.next(); // 1
    ```
    以上代码按照1-4的顺序执行

2. 控制流管理，避免回调地狱，避免链式调用-传参混乱。
    ```javascript
    // 回调地狱
    step1(function (value1) {
      step2(value1, function(value2) {
        step3(value2, function(value3) {
          step4(value3, function(value4) {
            // Do something with value4
          });
        });
      });
    });

    // Promise链式调用-传参混乱。 例如将step1返回的参数，传给step4
    // 此时就需要逐层传递或借用外部变量
    Promise.resolve(step1)
    .then(step2)
    .then(step3)
    .then(step4)
    .then(function (value4) {
      // Do something with value4
    }, function (error) {
      // Handle any error from step1 through step4
    })
    .done();


    // Generator改善以上缺点
    function* longRunningTask(value1) {
      try {
        var value2 = yield step1(value1);
        var value3 = yield step2(value2);
        var value4 = yield step3(value3);
        var value5 = yield step4(value4);
        // Do something with value4
      } catch (e) {
        // Handle any error from step1 through step4
      }
    }

    // 以上代码，需要实例一直调用next。可以用一个函数，自动去执行
    // 以下是task为同步代码，如果是异步，参考异步操作的同步表达例子。
    function scheduler(task) {
      var taskObj = task.next(task.value);
      // 如果Generator函数未结束，就继续调用
      if (!taskObj.done) {
        task.value = taskObj.value
        scheduler(task);
      }
    }

    scheduler(longRunningTask(initialValue));


    // 或者利用for...of循环 判断条件等同于while (!res.done)
    let steps = [step1Func, step2Func, step3Func];

    function* iterateSteps(steps){
      for (var i=0; i< steps.length; i++){
        var step = steps[i];
        yield step();
      }
    }

    let jobs = [job1, job2, job3];

    function* iterateJobs(jobs){
      for (var i=0; i< jobs.length; i++){
        var job = jobs[i];
        yield* iterateSteps(job.steps);
      }
    }

    for (var step of iterateJobs(jobs)){
      console.log(step.id);
    }
    ```

3. 作为数据结构，数组。
    ```javascript
    function* doStuff() {
      yield fs.readFile.bind(null, 'hello.txt');
      yield fs.readFile.bind(null, 'world.txt');
      yield fs.readFile.bind(null, 'and-such.txt');
    }

    // 等同以下
    function doStuff() {
      return [
        fs.readFile.bind(null, 'hello.txt'),
        fs.readFile.bind(null, 'world.txt'),
        fs.readFile.bind(null, 'and-such.txt')
      ];
    }

    for (task of doStuff()) {
      // task是一个函数，可以像回调函数那样使用它
    }
    ```





## 总结
1. yeild 可以理解成一个状态机的记录状态点，外部调用next，返回对应状态。甚至传参以在不同进程中处理不同的状态。
2. yeild 可以理解成一个回调，会在该标志处，等待结果返回。（外部next传参进去，对于Generator函数体内，可以理解为异步的回调）





## 课后疑问
1. 协程是什么，阮一峰老师 Generator 函数的语法 为什么提到携程
2. function* demo() {
  foo(yield 'a', yield 'b'); // OK
  let input = yield; // OK
}    
foo函数得到的参数为undefined，此种写法有什么场景吗？为何阮一峰老师举了这个例子。
3. Generator的this，var obj = {}; var f = F.call(obj);为什么说obj是F的实例
4. 例如抛出错误时，可以找到原始调用栈，不像异步回调一样，抛出错误时，原始调用栈早就结束了。 怎么理解，举例子
5. 可以将多个互相协作的任务写成Generator函数，之间用yield表达式交换控制权。怎么理解，举例子。能否应用到请求上






## 参考资料
- <span id="1"></span>[1] [阮一峰老师 Generator 函数的语法：https://es6.ruanyifeng.com/#docs/generator](https://es6.ruanyifeng.com/#docs/generator) ===> [back](#$1)



