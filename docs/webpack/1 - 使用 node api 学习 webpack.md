---
title: webpack - 1 | 使用 node api 学习 webpack
date: 2022-08-16
tags:
 - webpack
categories: 
 - webpack
---
## 总结
1. 调试时，搜索关键字可以将查找里的区分大小写和全字匹配打开。
2. 不清楚函数在哪里被调用的时候，可以查找调用栈，在 VSCode 的调用栈模块按 `Ctrl + F` 搜索函数名。
3. `npx webpack` 和 `require('webpack')` 有很大不同。     
  - `npx webpack`：`npx` 会去寻找可执行文件，使用的是默认寻找 `/node_modules/.bin` 下的文件
  - `require('webpack')`：使用的是 webpack 包 `package.json` 的 `main` 字段 `"main": "lib/index.js"`，即 Webpack API

4. 执行 `npx webpack` 时，能看到 `process.argv` 为 `['xx/bin/node', '/node_modules/.bin/webpack]`，为什么是使用 `node` 去执行？因为 `/node_modules/.bin/webpack` sh 脚本写了使用 `node` 执行。 
    ```bash
      if [ -x "$basedir/node" ]; then
        exec "$basedir/node"  "$basedir/../webpack/bin/webpack.js" "$@"
      else
        exec node  "$basedir/../webpack/bin/webpack.js" "$@"
      fi
    ```

5. `package.json` 的 `bin` 字段：包命令行工具的入口，也用来安装包管理器例如 `npm` 的可执行文件。即生成 `/node_modules/.bin/` 下的可执行文件，且可执行文件执行应该指本包的哪个位置。
6. `package.json` 的 `main` 字段：`require` 入口






## 1. 前提提要、场景
webpack 的大部分项目中，都需要使用 webpack.config.js 来配置 webpack，但不建议使用 webpack.config.js 配置文件的方式来学习 webpack，太难调试了。

webpack-cli 用来学习不够存粹，逻辑复杂，有太多影响因素。    


## 2. 基于 webpack api 开发脚手架
如果你需要基于 webpack 做一个脚手架，那大概率是通过 webpack api 来完成。例如 Vue-cli、create-react-app 的 [react-scripts](https://github.com/facebook/create-react-app/tree/main/packages/react-scripts)，其[打包](https://github.com/facebook/create-react-app/blob/main/packages/react-scripts/scripts/build.js#L146)


可以通过编译结束后的 [`stat`](https://github.com/facebook/create-react-app/blob/f34d88e30c7d8be7181f728d1abc4fd8d5cd07d3/packages/react-scripts/scripts/build.js#L79) 对象拿到打包后所有资源体积，以及打包时间。当基于 webpack api 开发脚手架后，其脚手架的构建日志也可以进行自定义。
![](../assets/1%2033.png)




## 3. webpack api 简介
使用 `webpack api` 也特别容易，将以前 `webpack.config.js` 的配置，作为参数传递给 `webpack` 函数即可。详见文档 [webpack node api](https://webpack.js.org/api/node/#webpack)。

```javascript
const webpack = require('webpack')

const compiler = webpack({
  // webpack 的诸多配置置于此处
  entry: './index.js'
})

compiler.run((err, stat) => {
  // 在 stat 中可获取关于构建的时间及资源等信息
})
```

例如，使用它测试不同 `mode` 对打包资源的影响


```javascript
webpack([
  {
    entry: './index.js',
    mode: 'production', // 用于生产，移除注释，压缩代码成 1 行
    output: {
      filename: 'main.production.js'
    }
  },
  {
    entry: './index.js',
    mode: 'development', // 用于代码分析，保留注释
    output: {
      filename: 'main.development.js'
    }
  },
  {
    entry: './index.js', // mode 默认 production
    output: {
      filename: 'main.unknown.js'
    }
  }
]).run((err, stat) => {

})
```



> 如果 mode 未通过配置或 CLI 赋值，CLI 将使用可能有效的 NODE_ENV 值作为 mode。    



## 4. 编译时间（startTime/endTime）是如何计算的
1. stat.toJson().time
2. stat.endTime - stat.startTime
3. 多入口：stats.map((stat, index) => stat.endTime - stat.

webpack 运行是通过 `run` 方法的回调取得 `stat`，在回调中打断点。运行后。可以得到以下代码。

当找不到函数在哪里调用的时候，可以查找调用栈。
> 小技巧：在 VSCode 的调用栈模块按 `Ctrl + F` 搜索函数名。

```javascript
run(callback) {
  /* ----- 1 ----- */
  const finalCallback = (err, stats) => {
    /* codes */
    // 断点后，根据调用栈找到的外层的代码，callback 便是我们的回调。
    if (callback !== undefined) callback(err, stats); // callback 被调用
    /* codes */
  };


  // 接下去思路就是顺着调用栈继续找，看看 finalCallback 被谁调用
  class Stats {
    constructor(compilation) { // 直接存储一个对象
      this.compilation = compilation;
    }
  }
  
  /* ----- 2 ----- */
  const onCompiled = (err, compilation) => { // 打包完成
    /* codes */
    compilation.startTime = startTime;
    compilation.endTime = Date.now(); // endTime 的属性赋值

    const stats = new Stats(compilation); // stats 生成

    this.hooks.done.callAsync(stats, err => {
      if (err) return finalCallback(err); // finalCallback 被调用，错误流

      // 调用了 /* ----- 1 ----- */
      return finalCallback(null, stats);  // finalCallback 被调用，把 stats 作为第二个参数传递
    });			
  }


  // 接下去思路就是顺着调用栈继续找，看看 onCompiled 被谁调用

  
  /* ----- 3 ----- */
  // 有错提前返回  这块连续嵌套确实写得不太雅观，处理都一样
  const run = () => { // run 方法定义
    this.hooks.beforeRun.callAsync(this, err => { // 钩子 运行前
      if (err) return finalCallback(err); // finalCallback 被调用，错误流

      this.hooks.run.callAsync(this, err => { // 开始运行时
        if (err) return finalCallback(err); // finalCallback 被调用，错误流

        this.readRecords(err => { // 读取之前的 records 的方法，再在它的回调里执行 this.compile(onCompiled)
          if (err) return finalCallback(err); // finalCallback 被调用，错误流

          // 调用了 /* ----- 2 ----- */
          this.compile(onCompiled); // compile 被调用
        });
      });
    });/
  };


  // 接下去思路就是顺着调用栈继续找，看看 run 被谁调用

  const startTime = Date.now(); // startsTime 的赋值

  // 调用了 /* ----- 3 ----- */
  run(); // 执行 run
}
```



## 5. webpack/webpack-cli 间相互调用
```bash
npx webpack
```
1. 调用执行 `webpack` 包对应的 `bin/webpack.js` 文件，然后调用 `webpack-cli` 包
2. 调用执行 `webpack-cli` 包对应的 `bin/cli.js` 文件，然后继续调用 `require('webpack')` 
3. 调用执行 `webpack` 包的 `lib/index.js` 即 API

所以学习的时候，直接使用 `node` 调用 `webpack` 的 API 即可           
下面是代码分析，知道上面调用结论后，想要继续深入可以看，否则跳过。

### 5.1 webpack 包的调用
总结：
1. 当运行 `npx webpack` 后，会执行 `node_modules/.bin/webpack` 可执行文件，随后调用了 `node_modules/webpack/bin/webpack.js`
2. 在 `webpack` 包中，判断有无 `webpack-cli` 依赖包，有安装跳过第 2 步。
3. 无 `webpack-cli` 依赖包时询问是否安装，同意则会安装，否则退出执行。
4. 当有 `webpack-cli` 后调用 `node_modules/webpack-cli/packages.json` 的 `bin`语句。最终执行 `require("/node_modules/webpack-cli/bin/cli.js")`  


逐步拆解：
1. 当运行 `npx webpack` 后，会执行 `node_modules/.bin/webpack` 可执行文件
    ```bash
      if [ -x "$basedir/node" ]; then
        exec "$basedir/node"  "$basedir/../webpack/bin/webpack.js" "$@"
      else
        exec node  "$basedir/../webpack/bin/webpack.js" "$@"
      fi
    ```
    最终执行了 `webpack` 包里的 `bin/webpack.js` 文件        

2. 判断有无安装 `webpack-cli`
    ```javascript
    // node_modules/webpack/bin/webpack.js

    /* codes */
    const cli = {
      name: "webpack-cli",
      package: "webpack-cli",
      binName: "webpack-cli",
      installed: isInstalled("webpack-cli"),
      url: "https://github.com/webpack/webpack-cli"
    };


    // 是否安装某个包
    const isInstalled = packageName => {
      // 用户的变量环境，如果有 pnp 则认为包都拥有。
      // 有疑问，pnp 是什么
      // 找到相关文档 https://yarnpkg.com/advanced/pnpapi  不太懂
      if (process.versions.pnp) { 
        return true;
      }

      const path = require("path");
      const fs = require("graceful-fs");

      // 表示当前文件所在的目录
      // "/Users/xx/blog/node_modules/webpack/bin" 
      let dir = __dirname;
      
      // 判断目录下的 node_modules 文件夹下是否有 指定依赖包名字 的文件夹
      // 有的话返回 true
      // 没有的话则取目录的父目录，继续判断，循环遍历到根目录
      do {
        try {
          if (
            // 判断目录下的 node_modules 文件夹下是否有 指定依赖包名字 的文件夹
            fs.statSync(path.join(dir, "node_modules", packageName)).isDirectory()
          ) {
            return true;
          }
        } catch (_error) {
          // Nothing
        }
        // 取目录的父目录，继续判断，循环遍历到根目录
      } while (dir !== (dir = path.dirname(dir)));
      // 结束条件根目录 '/' === '/' 
      return false;
    };
    ```

3. 无 `webpack-cli` 依赖包时询问是否安装，同意则会安装，否则退出执行。 
    ```javascript
    // node_modules/webpack/bin/webpack.js

    /* codes */
    // 是否安装 webpack-cli 
    if (!cli.installed) {
      /* codes */
      
      let packageManager;

      // 指定包管理器，优先级 yarn -> pnpm -> npm。
      // 判断依据：代码执行目录的包管理器配置文件。 
      if (fs.existsSync(path.resolve(process.cwd(), "yarn.lock"))) {
        packageManager = "yarn";
      } else if (fs.existsSync(path.resolve(process.cwd(), "pnpm-lock.yaml"))) {
        packageManager = "pnpm";
      } else {
        packageManager = "npm";
      }
      // 安装命令
      const installOptions = [packageManager === "yarn" ? "add" : "install", "-D"];
      
      // 提示指定包管理器指定命令安装某个包
      console.error(
        `We will use "${packageManager}" to install the CLI via "${packageManager} ${installOptions.join(
          " "
        )} ${cli.package}".`
      );

      const question = `Do you want to install 'webpack-cli' (yes/no): `;

      /* codes */

      // 指定退出码
      // 当进程正常退出或在 process.exit() 未指定代码的情况下退出时，将作为进程退出代码的数字。
      // 可以此处将 1 代表异常流， 0 正常。
      process.exitCode = 1;
      
      // 交互式询问
      const questionInterface = readLine.createInterface({
        input: process.stdin,
        output: process.stderr
      });
      questionInterface.question(question, answer => {
        questionInterface.close();

        // 用户只要输入y开通即代表同意
        const normalizedAnswer = answer.toLowerCase().startsWith("y");

        // 不同意，退出执行
        if (!normalizedAnswer) {
          console.error(
            "You need to install 'webpack-cli' to use webpack via CLI.\n" +
              "You can also install the CLI manually."
          );

          return;
        }
        // 正常流
        process.exitCode = 0;

        // 提示正在安装
        console.log(
          `Installing '${
            cli.package
          }' (running '${packageManager} ${installOptions.join(" ")} ${
            cli.package
          }')...`
        );


        // 执行指令安装
        runCommand(packageManager, installOptions.concat(cli.package))
          .then(() => {
            // 安装好执行命令
            runCli(cli);
          })
          .catch(error => {
            console.error(error);
            // 异常流
            process.exitCode = 1;
          });
      });
    } else {
      // 已有 webpack-cli 直接执行命令
      runCli(cli);
    }
    ```

4. 当有 `webpack-cli` 后调用 `node_modules/webpack-cli/packages.json` 的 `bin` 语句。        
   `package.json` 的 `bin` 字段：包命令行工具的入口，也用来安装包管理器例如 `npm` 的可执行文件。即生成 `/node_modules/.bin/` 下的可执行文件，且可执行文件执行应该指本包的哪个位置。
    
    ```javascript
    // node_modules/webpack/bin/webpack.js

    const cli = {
      name: "webpack-cli",
      package: "webpack-cli",
      binName: "webpack-cli",
      installed: isInstalled("webpack-cli"),
      url: "https://github.com/webpack/webpack-cli"
    };

    // 在上一步中，最后会执行 runCli 方法
    runCli(cli);

    const runCli = cli => {
      const path = require("path");

      // 路径 /Users/xx/node_modules/webpack-cli/package.json
      const pkgPath = require.resolve(`${cli.package}/package.json`);


      // webpack-cli/package.json 文件
      /* 
        "bin": {
          "webpack-cli": "./bin/cli.js"
        },
      */
    
      // 取得 webpack-cli/package.json 配置
      const pkg = require(pkgPath);

      
      require(path.resolve(path.dirname(pkgPath), pkg.bin[cli.binName]));
      /* 
      path.resolve(path.dirname(pkgPath), pkg.bin[cli.binName])
      等价于以下
      path.resolve(
        "/node_modules/webpack-cli", 
        (webpack-cli的package.json).bin['webpack-cli'])  => "./bin/cli.js"
      )
      等价于以下
      path.resolve("/node_modules/webpack-cli", "./bin/cli.js");

      最终结果
      require("/node_modules/webpack-cli/bin/cli.js")
      */
    };
    ```
    最终执行 `require("/node_modules/webpack-cli/bin/cli.js")`





### 5.2 webpack-cli 包的调用
  以下代码，最终执行 `require('webpack')`                      

  最终还是回到了 `webpack` 包的 `lib/index.js`，即 API。
  ```javascript
    // /node_modules/webpack-cli/bin/cli.js

    #!/usr/bin/env node // shebang 指定解释器

    /* codes */

    const runCLI = require("../lib/bootstrap");

    /* codes */

    // 取的是当前命令行参数，与webpack 和 webpack-cl 之间的跳转无关
    // npx webpack 使用的就是 node 且寻找到 webpack package.json 的 bin 字段 "bin/webpack.js"
    // 也可以输入 npx webpack -fsjfjd 能看到命令行参数数组也添加了后面乱输入的内容。
    // process.argv: [
    //  'xx/bin/node',
    //  '/node_modules/.bin/webpack' 软连接，指向 `node_modules/webpack/
    // ]
    runCLI(process.argv);
  ```
  process.argv：当前进程的所有命令行参数
  ```bash
      node argv.js a b c
      # process.argv [ 'node', '/path/to/argv.js', 'a', 'b', 'c' ]
  ```

  当然可以继续往下探究，`runCLI` 为什么传入 `['xx/bin/node', '/node_modules/.bin/webpack']` 就会执行 `require('webpack')`        
    
  我的思路是，知道一定会调用 webpack，所以第一次调试时，会留意 webpack 字样的变量，找到了 `this.webpack` 字段。下一步就是找到其赋值的操作：`this.webpack = await this.loadWebpack();` 从而找到了下面的函数。     
 
  ```javascript
    // /node_modules/webpack-cli/lib/webpack-cli.js
    // module: 'webpack'
    async tryRequireThenImport(module, handleError = true) {
        let result; 
        try {
            result = require(module);
        }
        return result || {};
    }
  ```
  断点能发现，此时 `module` 为文本 `'webpack'`，所以通过 `require('webpack')` 就已经重新调用 `webpack` 包了。且调用的是 `webpack/lib`，即 Webpack Api


  结论已经有了。如果还要继续深入，可以继续往下看，但不推荐，因为比较枯燥，过于流水账。        
  接下来跟着调用栈，往回倒推，看看 `module` 变量是如何得到的。  

  根据调用栈发现 `module` 的定义
  ```javascript
    // /node_modules/webpack-cli/lib/webpack-cli.js
    const WEBPACK_PACKAGE = process.env.WEBPACK_PACKAGE || "webpack";
    async loadWebpack(handleError = true) {
        return this.tryRequireThenImport(WEBPACK_PACKAGE, handleError);
    }
  ```
  此时就有个疑惑，webpack 的加载 `loadWebpack`，好像跟 `runCLI` 的传参无关。如果有关的话，那肯定是决定 `loadWebpack` 方法是否被调用。

  继续根据调用栈往外找，可以发现以下代码
  ```javascript
      // /node_modules/webpack-cli/lib/webpack-cli.js
      // commandName: 'build'
      const loadCommandByName = async (commandName, allowToInstall = false) => {
              const isBuildCommandUsed = isCommand(commandName, buildCommandOptions);
              /* codes */
              if (isBuildCommandUsed) {
                /* codes */
                this.webpack = await this.loadWebpack();
                /* codes */     
              }
      }
  ```
  `loadWebpack` 函数是否被调用，取决于 `loadCommandByName` 函数的 `commandName` 参数是否为 `'build'`。    
  
  继续跟着调用栈找，可以发现以下代码
  ```javascript
      // /node_modules/webpack-cli/lib/webpack-cli.js
      // 这块代码可以略过，放在这里只是方便你调试时可以参考
      // 简化核心代码请看下块代码块
      this.program.action(async (options, program) => {
        const buildCommandOptions = {
          name: "build [entries...]",
          alias: ["bundle", "b"],
          description: "Run webpack (default command, can be omitted).",
          usage: "[entries...] [options]",
          dependencies: [WEBPACK_PACKAGE],
        };
        const { operands, unknown } = this.program.parseOptions(program.args);

        const defaultCommandToRun = getCommandName(buildCommandOptions.name); // 'build'

        const hasOperand = typeof operands[0] !== "undefined";
        const operand = hasOperand ? operands[0] : defaultCommandToRun; // 'build'

        let commandToRun = operand; // 'build'
        if (isKnownCommand(commandToRun)) { // true
            await loadCommandByName(commandToRun, true); // 传入 'build'
        }
      })
  ```

  上面的代码还是有点长，当看是否传 `'build'` 可以看简化后的核心部分
  ```javascript
      this.program.action(async (options, program) => {
        let commandToRun = program.args[0] ? program.args[0] : 'build'
        if(commandToRun === 'build') {
          await loadCommandByName(commandToRun, true); // 传入 'build'
        }
      })
  ```

  可以得知，想要传 `'build'` ，需要 `this.program.action` 函数的回调传参 `program.args[0]` 无值。下一个调试目的： `program` 的值。  

  接下来将断点打在 `action` 方法上，然后重新调试。以下为简化后的核心部分
  ```javascript
      action(fn) {
        const listener = (args) => {
          const actionResult = fn.apply(this, [{}, this]);
        };
        this._actionHandler = listener;
        return this;
      };
  ```
  只要 `fn` 代表回调，第二个参数 `this` 即我们要找的 `program`，所以只要 `Command` 实例的 `args` 为空即可。      

  搜索 `this.args` 关键字，找到 `this.args = operands.concat(unknown);` 打上断点，重新调试。
  ```javascript
      _parseCommand(operands, unknown) {
        this.args = operands.concat(unknown);
      }
  ```
  只要 `_parseCommand` 函数的传参 `operands`, `unknown` 都为空数组，上面的过程都算验证成功。    

  通过断点调试，进入 `\node_modules\commander\index.js`
  ```javascript
    // \node_modules\commander\index.js
    
    /* codes */
    // argv: ['xx/bin/node', '/node_modules/.bin/webpack']
    // parseOptions: undefined
    parse(argv, parseOptions) {
      /* codes */

      parseOptions = parseOptions || {}; 
      switch (parseOptions.from) {
        case undefined: // 此时因为 undefined 进入了
          this._scriptPath = argv[1]; // 'xx/bin/node'
          userArgs = argv.slice(2); // []
          break;
        /* codes */
      }

      this._parseCommand([], userArgs);
    }

    // 外层函数
    parseAsync(argv, parseOptions) {
      this.parse(argv, parseOptions);
    }

    // 更外层函数
    async run(args, parseOptions) {
      await this.program.parseAsync(args, parseOptions);
    }
    /* codes */ 
  ```
  我们的期盼是 `run` 函数的传参 `parseOptions` 为 `undefined` ，`this._parseCommand` 将会传两个空数组。

  终于要到头了，接下来就是找哪里调用了 `run` 函数，且看他第二个传参。  
  ```javascript
      const runCLI = async (args) => {
        const cli = new WebpackCLI();
        await cli.run(args);
      };
  ```
  回到了 `runClI` 这边，而且第二个参数未传。     

  总结：只要 `args` 传参符合规范，不在中途报错退出，一定会使用 `require('webpack')` 包。    
  
  本次未调试到 `args` 的影响，后续再深入查看 `args` 的影响


   


<!-- 

## 5. output.filename 的调试分析
```javascript
const func = f1
function f1 () {
  return webpack({
    entry: './index.js',
    mode: 'none',
    output: {
      iife: false, // 添加 IIFE 外层包裹生成的代码 默认 true 此处关了是方便调试
      pathinfo: 'verbose',
      filename: 'hello.js'
      /* 
        pathinfo：是否在 bundle 中引入「所包含模块信息」的相关注释
        生产环境(production)下，不应该使用
        如果使用 mode = 'development'，默认值为 true
        如果使用 mode = 'production'，默认值为 false
        值为 'verbose' 时，会显示更多信息
      */
    }
  })
}

func().run((err, stat) => {
  console.log(JSON.stringify(stat.toJson()))
})
```

相关文档：
- [output.pathinfo](https://webpack.docschina.org/configuration/output/#outputpathinfo)
- [optimization.runtimeChunk](https://webpack.docschina.org/configuration/optimization/#optimizationruntimechunk)


在 `run` 函数中打断点，`F11` 进入该函数，来到了  `\node_modules\webpack\lib\Compiler.js` 文件。       

我们的目的很明确，搜索 `filename` 关键字，发现 `includesHash` 函数，为其打上断点，按 `F5` 直接运行到下个断点，发现代码运行完成，没进入。
```javascript
const includesHash = (filename, hashes) => {
	if (!hashes) return false;
	if (Array.isArray(hashes)) {
		return hashes.some(hash => filename.includes(hash));
	} else {
		return filename.includes(hashes);
	}
};
```

搜索 `includesHash` 关键字，看看哪里调用了，发现以下代码，打上断点重新运行，可以发现 `targetFile` 变量便是我们配置的 `'hello.js'`，接下来根据调用栈，开始查找外层传参，看看是如何产生且传进来的。
```javascript
asyncLib.forEachLimit( // 该函数会把 assets 做为参数，传给后面的回调做为第一个参
				assets,
				15,
				({ name: file, source, info }, callback) => { // {} 解构了 assets 
					let targetFile = file; // 我们要找的变量，
					let immutable = info.immutable;
					const queryStringIdx = targetFile.indexOf("?");
					if (queryStringIdx >= 0) {
						targetFile = targetFile.slice(0, queryStringIdx);
						immutable =
							immutable &&
							(includesHash(targetFile, info.contenthash) ||
								includesHash(targetFile, info.chunkhash) ||
								includesHash(targetFile, info.modulehash) ||
								includesHash(targetFile, info.fullhash));
					}
          /* codes */
        }
)

```

接下来看 `assets` 如何获得 
```javascript
const assets = compilation.getAssets();

// compilation
getAssets() {
  const array = [];
  for (const assetName of Object.keys(this.assets)) { // 1. 下一个要找的是 this.assets，因为是取他的键名 key
    /* codes */
    array.push({
      name: assetName, // 'hello.js'
    });
    /* codes */
  }
  return array;
}

// 2. 寻找 this.assets 的属性赋值，找到了以下赋值。
emitAsset(file, source, assetInfo = {}) {
  this.assets[file] = source; // 此时的 file 便是 'hello.js' 
}

// 3. 看执行栈，继续往外找，emitAsset 调用时的传参 file，可以追溯到 
asyncLib.forEach(
					manifest,
					(fileManifest, callback) => {
          // 遍历 manifest 每一个对象，每个对象即fileManifest，且 fileManifest.filenameTemplate 字段便是 file
})

// 4. 下一步，便是 manifest 如何获得，这一步会比较难，因为进入到构造函数内部
// /node_modules/tapable/lib/HookCodeFactory.js


```
 -->



## 6. webpack 的简单分析        
webpack 传入配置 options，最终是返回一个编译器 compiler。
```javascript
  /* codes */

  /* 主入口 */
  const webpack = (options, callback) => {
    // 通过 create 函数创建一个编译器 compiler，并返回
    if (callback) {
      try {
        const { compiler, watch, watchOptions } = create();
        /* codes */
        return compiler;
      } catch (err) {
        process.nextTick(() => callback(err));
        return null;
      }
    } else {
      const { compiler, watch } = create();
      /* codes */
      return compiler;
    }

    
    /* 1. 校验 options 配置是否正确
        2. 根据 options 构建编译器
    */
    const create = () => {
      // 校验 options 配置是否有错误。 options 转成数组，每个配置都进行预编译校验
      // webpackOptionsSchema：校验规则，一个 json 配置文件。
      if (!asArray(options).every(webpackOptionsSchemaCheck)) {
        getValidateSchema()(webpackOptionsSchema, options);

        // 有错抛错
        util.deprecate(
          () => {},
          "webpack bug: Pre-compiled schema reports error while real schema is happy. This has performance drawbacks.",
          "DEP_WEBPACK_PRE_COMPILED_SCHEMA_INVALID"
        )();
      }

      let compiler;
      let watch = false;
      let watchOptions;

      // 根据 options 新建 编译器
      if (Array.isArray(options)) {
        compiler = createMultiCompiler(
          options,
        );
        watch = options.some(options => options.watch);
        watchOptions = options.map(options => options.watchOptions || {});
      } else {
        const webpackOptions = (options);
        compiler = createCompiler(webpackOptions);
        watch = webpackOptions.watch;
        watchOptions = webpackOptions.watchOptions || {};
      }
      // 将编译器封装返回。
      return { compiler, watch, watchOptions };
    };



    /* 构建编译器 */
    const createCompiler = rawOptions => {
      // 为用户的 options 补全规范化声明。用户没声明到的都给补全了
      const options = getNormalizedWebpackOptions(rawOptions);

      // 为用户的配置做初始化，应用基础的默认值。主要负责日志方面的赋值。
      applyWebpackOptionsBaseDefaults(options);

      // 以上两步合并出基础配置


      const compiler = new Compiler(options.context, options);

      // NodeEnvironmentPlugin 主要负责文件I/O还有监听文件内容改变
      new NodeEnvironmentPlugin({
        infrastructureLogging: options.infrastructureLogging
      }).apply(compiler);


      // 插件的调用
      if (Array.isArray(options.plugins)) {
        for (const plugin of options.plugins) {
          if (typeof plugin === "function") {
            plugin.call(compiler, compiler);
          } else {
            plugin.apply(compiler);
          }
        }
      }
      
      // 为用户配置应用默认值，基本所有默认值都在这赋值。
      // 在这个函数内，可以看到会根据 mode，为不同配置赋值不同值。
      applyWebpackOptionsDefaults(options);

      compiler.hooks.environment.call(); // 调用钩子
      compiler.hooks.afterEnvironment.call(); // 调用钩子

      // WebpackOptionsApply 模块主要是根据options选项的配置，设置compile的相应的插件，属性。
      // 里面写了大量的 apply(compiler); 使得模块的this指向compiler，没有对options做任何处理
      new WebpackOptionsApply().process(options, compiler);

      compiler.hooks.initialize.call(); // 调用钩子
      
      return compiler;
    };
    
    /* codes */
  }
  ```

<!-- 

### 5.2 了解 Stat/Compilation
webpack 编译结束后，可拿到 `Stat` 对象，其中包含诸多编译时期的信息。       
比如，可通过该对象获取到打包后所有资源体积以及编译时间。
![](./220816/2.png)

也通过打断点或者以下方式查看
```bash
# jq 需要手动安装，是一个 JSON 处理器
$ node build2.js | jq -C "." | less
```


### 5.3 初步了解以下数据结构
- Asset
- Chunk
- Module
- Entry -->





## 疑问
- [ ] 既然直接将参数传递给 `webpack` 函数即可，那 `webpack-cli` 的主要作用岂不是读取文件？既然是读取文件，那为何跳来跳去，甚至会多出一个 `webpack-cli` 的包呢
- [ ] `process.versions.pnp` pnp 是什么。找到相关文档 https://yarnpkg.com/advanced/pnpapi  不太懂
- [ ] 使用 `npx webpack` 走的是 package 的 `"bin"`， `require('webpack')` 走的是 package.json 的 `"main"`？






## 提问
- [x] 如何计算每次 webpack 构建时间
  1. stat.toJson().time
  2. stat.endTime - stat.startTime
  3. 多入口：stats.map((stat, index) => console.log(`第${index+1}次打包, 打包时间: ${stat.endTime - stat.startTime}`) 


- [x] 断点调试 webpack 源码，了解其编译时间（startTime/endTime）是如何计算的        
见文章










