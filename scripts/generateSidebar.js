const fs = require('fs');
const path = require('path');


/**
 * 从字符串中提取数字部分。
 * @param {string} str 待处理的字符串。
 * @returns {?number} 提取出来的数字，如果无法提取，则返回 null。
 */
function extractNumber(str) {
  const regex = /(\d+)/;
  const match = str.match(regex);
  if (match && match[1]) {
    return parseInt(match[1]);
  } else {
    return null;
  }
}

function getSubItems(navItem) {
  const ret = []
  
  const arr = []
  if (navItem.link) {
    arr.push(navItem)
  } else if (navItem.items) {
    arr.push(...navItem.items)
  }

  arr.forEach(nav => {
    const items = []

    //处理子目录
    const subDirPath = path.resolve(path.join(DOC_PATH, nav.link, '..'));
    const files = fs.readdirSync(subDirPath).filter(file => {
      return path.extname(file) === '.md' && file !== '0 - ' + nav.text + '.md';
    });

    files.sort((file1, file2) => {
      const name1 = extractNumber(file1);
      const name2 = extractNumber(file2);
      return name1 - name2;
    });


    for (let file of files) {
      const filePath = path.relative(DOC_PATH, path.join(subDirPath, file)).replace(/\\/g, '/');
      items.push({
        text: file,
        link: `/${filePath}`,
      });
    }

    ret.push({
      text: nav.text,
      link: nav.link.replace(/\\/g, '/'),
      items
    })
  })

  return ret 
}


function generateSidebar(navbar) {
  const ret = {};

  //循环处理navArray中的每个对象
  for (let navItem of navbar) {
      const itemPath = `/${navItem.text}/`;
      //向RET对象添加T数组
      ret[itemPath] = getSubItems(navItem);
  }
  return ret
}

const DOC_PATH = './docs';
const NAV_PATH = './docs/.vitepress/generate/nav.json';
const FILE_PATH = './docs/.vitepress/generate/sidebar.json';

/**
 * 读取JSON对象数组
 */
const content = fs.readFileSync(NAV_PATH, 'utf8');
const navbar = JSON.parse(content);

const data = generateSidebar(navbar)

/**
 * 将RET对象写入文件
 */
fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));


