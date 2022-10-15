import path from 'path';
import { createReadStream } from 'node:fs';
import { readdir, writeFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';

import { navbar } from '../docs/.vuepress/config.js'

/**
 * 读取文件获得 title
 * @param {String} filePath 
 * @returns {String} 
 */
const getTitle = async filePath => { // 获取标题
  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath, {encoding: 'utf-8'});
    let allStr = '';

    stream.on('data', (str) => {
        allStr += str;
        const result = allStr.match(/(?<=-*?(?:[\r\n])+title:(?:\s)+?)[\w\W]*?(?=(?:[\r\n])+date)/)
        if(result) {
          resolve(result[0])
          stream.close() // 取到指定文本，提前关闭 readStream
        }
    })
    //监听文件读取完毕，会自动触发一次end事件，没有读取完是不会触发的
    stream.on('end', () => {
        reject()
    })

    // 监听错误
    stream.on('error', (err) => {
      reject(err);
    })
  })
}


/**
 * 根据顶部菜单，读取目录，生成左侧菜单。
 * 当然可以不仅顶部菜单
 * @param {Array} navbar 顶部菜单
 */
const generateSidebar = async (navbar = []) => {
  // 过滤掉不想要目录的顶部菜单
  const ignoreLink = ['/']
  navbar = navbar.filter(({link = ''}) => !ignoreLink.includes(link))
  
  let length = navbar.length
  for(let i = 0; i < length; i ++) {
    const { children = [] } = navbar[i]
    navbar.push(...children)
  }
  navbar = navbar.filter(({link = ''}) => link)


  const sidebar = {}
  length = navbar.length
  for(let i = 0; i < length; i ++) {
    const { text, link } = navbar[i]
    const children = []
    sidebar[link] = [
      {
        link,
        children
      }
    ]
    try {
      const dirPath = path.resolve(`./docs${link}`)
      let files = await readdir(dirPath);

      files = files.filter(filename => filename.endsWith('.md') && filename.toLowerCase() !== 'readme.md') // 只看文档，且不需要 readme

      // 获取文档内容里面的标题，和路径封装 { text: xx link: xx}
      for (const [index, file] of files.entries()) {
        try {
          const filePath = path.resolve(`${dirPath}`,`./${file}`)
          const text = await getTitle(filePath) // 读取文件获得 title
          children.push({ text: `${index + 1}. ${text}`, link: `${link}${file}`})
        } catch (err) {
          console.error(err);
        }
      }      
    } catch (err) {
      console.error(err);
    }
  }


  // 开始写入 /docs/.vuepress/generate/sidebar.json
  const data = new Uint8Array(Buffer.from(JSON.stringify(sidebar)));
  writeFile(path.resolve('./docs/.vuepress/generate/sidebar.json'), data)
}




generateSidebar(navbar)