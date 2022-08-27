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
