function main () {
    const crypto = require('node:crypto');
    const createHash = require("webpack/lib/util/createHash");
    const webpack_md4 = createHash('md4')
    const webpack_xxhash64 =  createHash('xxhash64')

    /* 
        参考webpack 中的源代码 
        \node_modules\webpack-sources\lib\RawSource.js

        if (this._valueAsBuffer === undefined) {
            this._valueAsBuffer = Buffer.from(this._value, "utf-8");
        }
        hash.update("RawSource");
        hash.update(this._valueAsBuffer); 
    */


    // 思路：模拟 webpack 的实现，取出文件文本后变成二进制交给 hash 算法
    // 目的是取一个大的文本数据，去测试各个 hash 算法性能

    const SIZE = 1024 * 1024 * 1024  // 1 GB，内存够的勇者可以往上加。
    const buf = Buffer.alloc(SIZE, '1', "utf-8")
    // let offset = 0
    // while(offset < SIZE) {
    //     const str = Math.random().toString(36).slice(-8) // 随机文本
    //     buf.write(str, offset)
    //     offset += Math.round(Math.random() * 10) // 随机增加偏移量
    // }

    const hashArr = crypto.getHashes().map(hashName => ({hashName, hash: crypto.createHash(hashName)})) // 取得所有 hash 算法
    hashArr.push({hashName: 'webpack_md4', hash: webpack_md4}, {hashName: 'webpack_xxhash64', hash: webpack_xxhash64}) // 推入 webpack 自带的

    for (item of hashArr) { 
        const { hashName, hash } = item

        console.time(hashName)
        hash.update("RawSource");
        hash.update(buf);
        hash.digest('hex') // 取 16 进制摘要
        console.timeEnd(hashName)
        
        item.hash = null
    }
}

main()


// console 输出的文本扔里面排序
function sort (str) {
    const arr = str.split('\n').filter(str => str)
    const getMs = str => {
        const result = str.match(/:\s([\d\.]+)(m?s)/)
        return result[1] * (result[2] === 's'? 1000 : 1)
    }
    arr.sort((a, b) =>  getMs(a) - getMs(b))
    console.log(arr.join('\n'))
}

// sort(`
// webpack_md4: 1.618s
// webpack_xxhash64: 161.71ms`)
