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
  return match && match[1] ? parseInt(match[1]) : null;
}

/**
 * 获取一个目录下所有的md文件.
 * @param {string} dirPath 目录路径.
 * @param {string} excludeFile 要排除的文件名.
 * @returns {array} md文件列表.
 */
function getMdFiles(dirPath, excludeFile) {
  // 读取目录下所有的md文件并过滤掉要排除的文件
  const files = fs.readdirSync(dirPath)
    .filter(file => path.extname(file) === '.md' && file !== excludeFile)
    .sort((a, b) => extractNumber(a) - extractNumber(b));
  return files;
}

/**
 * 生成子目录数组.
 * @param {object} navItem 导航条目.
 * @param {string} docsDirPath 文档目录路径.
 * @returns {array} 子目录数组.
 */
function getSubItems(navItem, docsDirPath) {
  // subItems用于保存子目录数组
  const subItems = [];
  // 获取需要处理的导航条目，如果有link属性，则只处理该条目，否则处理items数组中的所有条目
  const items = navItem.link ? [navItem] : navItem.items || [];

  // 遍历items数组处理子目录
  for (let item of items) {
    const subDirPath = path.resolve(path.join(docsDirPath, item.link, '..'));
    const files = getMdFiles(subDirPath, `0 - ${item.text}.md`);

    // 将子目录下所有md文件对应的对象放入subItems数组
    const subItemsArr = files.map(file => {
      const filePath = path.relative(docsDirPath, path.join(subDirPath, file)).replace(/\\/g, '/');
      return {
        text: file,
        link: `/${filePath}`,
      };
    });

    // 将该子目录及其下所有md文件对应的对象放入subItems数组
    subItems.push({
      text: item.text,
      link: item.link.replace(/\\/g, '/'),
      items: subItemsArr
    })
  }

  return subItems;
}

/**
 * 生成侧边栏数据.
 * @param {array} navbar 导航条目数组.
 * @param {string} docsDirPath 文档目录路径.
 * @returns {object} 侧边栏数据.
 */
function generateSidebar(navbar, docsDirPath) {
  const sidebarData = {};

  // 循环处理navbar中的每个对象
  for (let navItem of navbar) {
    const itemPath = `/${navItem.text}/`;
    // 向sidebarData对象添加子目录数组
    sidebarData[itemPath] = getSubItems(navItem, docsDirPath);
  }

  return sidebarData;
}

// 定义常量
const DOCS_DIR_PATH = './docs';
const NAV_JSON_FILE_PATH = path.join(DOCS_DIR_PATH, '.vitepress/generate/nav.json');
const SIDEBAR_JSON_FILE_PATH = path.join(DOCS_DIR_PATH, '.vitepress/generate/sidebar.json');

// 读取JSON对象数组
const navbarContent = fs.readFileSync(NAV_JSON_FILE_PATH, 'utf8');
const navbar = JSON.parse(navbarContent);

// 生成侧边栏数据并写入文件
const sidebarData = generateSidebar(navbar, DOCS_DIR_PATH)
fs.writeFileSync(SIDEBAR_JSON_FILE_PATH, JSON.stringify(sidebarData, null, 2));
