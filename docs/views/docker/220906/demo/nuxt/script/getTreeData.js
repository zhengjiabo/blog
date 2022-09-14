const fs = require('fs');
const path = require('path');
function getPromise(func) {
    return (...arg) => new Promise((resolve, reject) => {
        func(...arg, (err, data)=>{
            if(err) {
                reject(err);
            }else{
                resolve(data)
            }
        })
    })
}
function isDirect (url) {
    const func = getPromise(fs.stat)
    return func(url).then(data => data.isDirectory())
}

function readdir (...arg) {
    const func = getPromise(fs.readdir)
    return func(...arg)
}

function rename (...arg) {
    const func = getPromise(fs.rename)
    return func(...arg)
}

function rm (...arg) {
    const func = getPromise(fs.rm)
    return func(...arg)
}

const acceptType = ['html', 'htm', 'mp3', 'mp4', 'm4a', 'srt']
const regexp = new RegExp(`\.(${acceptType.map(str => `(${str})`).join('|')})$`)

export const getTreeData = async (url) => {
    const removePath = path.resolve()

    const traverse = async(url) => {
        url = path.resolve(url)
        const treeData = []
        const fileList = await readdir(url,'utf8')
        if(url.slice(-1) !== '/') {
            url += '/'
        }
        const { length } = fileList
        for (let i = 0; i < length; i++) {
            let fileName = fileList[i]

            const newFileName = fileName.replace(/[\?%？]/g, '')
            if(newFileName !== fileName) {
                await rename(url + fileName, url + newFileName)
                console.log(`改名： ${url + fileName} ==> ${url + newFileName}`)
                fileName = newFileName
            }
            
            const filePath = url + fileName
            const isDirectory = await isDirect(filePath)

            const obj = {
                label: fileName,
                value: filePath.replace(removePath, '').replace(/\\+/g, '/'),
                isDirectory
            }

            if(isDirectory) {
                obj.children = await traverse(filePath)
            } else {
                if (!regexp.test(fileName)) { // 其它文件  都删除
                    await rm(filePath)
                    console.log('删除成功:' + filePath)
                    continue;
                } else if (!(/\.htm(l)?$/).test(fileName)) { // 非html文件 无需推入
                    continue
                } 
            } 

            
           
            treeData.push(obj)

        }
        return treeData
    }

    return await traverse(url)
} 

