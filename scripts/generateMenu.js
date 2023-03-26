const fs = require('fs');
const path = require('path');

/**
 * 获取指定目录下所有不包含 demo 字符串且未被列入黑名单的文件夹路径。
 * @param {string} dirPath 目录路径。
 * @returns {Array<string>} 不包含 demo 字符串且未被列入黑名单的文件夹路径数组。
 */
function getAllFoldersWithoutDemoAndBlacklist(dirPath, blacklist) {
  let folders = [];

  // 遍历目录下所有文件和文件夹
  fs.readdirSync(dirPath).forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (!stat.isDirectory()) {
      return 
    }

    // 如果是文件夹且不包含 demo 字符串，且不在黑名单中，则将其加入结果数组中
    if (!file.includes('demo')) {
      if (!blacklist.includes(file)) {
        folders.push(filePath);
      }
      // 如果是其他类型的文件夹，则递归查找子文件夹
      folders = folders.concat(getAllFoldersWithoutDemoAndBlacklist(filePath, blacklist));
    }
  });

  return folders;
}


/**
 * 获取指定目录下所有的 .md 文件名。
 * @param {string} folderPath 目录路径。
 * @returns {Array<string>} .md 文件名数组。
 */
function getMdFilesInFolder(folderPath) {
  let mdFiles = [];

  // 遍历目录下所有文件
  fs.readdirSync(folderPath).forEach((file) => {
    const filePath = path.join(folderPath, file);
    const stat = fs.statSync(filePath);

    // 如果是 .md 文件，则将其加入结果数组中
    if (stat.isFile() && path.extname(file) === '.md') {
      mdFiles.push(file);
    }
  });

  return mdFiles;
}

/**
 * 检查指定文件名是否在黑名单列表中。
 * @param {string} fileName 文件名。
 * @param {Array<string>} blacklist 黑名单列表。
 * @returns {boolean} 指定文件名是否在黑名单列表中。
 */
function isFileNameInBlacklist(fileName, blacklist) {
  return blacklist.includes(fileName);
}

/**
 * 获取从起始路径到目标路径的相对路径。
 * @param {string} fromPath 起始路径。
 * @param {string} toPath 目标路径。
 * @returns {string} 从起始路径到目标路径的相对路径。
 */
function getRelativePath(fromPath, toPath) {
  const relativePath = path.relative(fromPath, toPath);
  return relativePath.replace(/\\/g, '/');
}


/**
 * 将结果保存到文件中。
 * @param {string} folderPath 文件夹路径。
 * @param {Array<string>} result 结果数组。
 */
function writeResultFile(folderPath, result) {
  const resultFilePath = path.join(folderPath, `0 - ${path.basename(folderPath)}.md`);
  const content = result.join('\n');

  // 将结果覆盖写入到文件中
  fs.writeFileSync(resultFilePath, content, { encoding: 'utf-8', flag: 'w' });
}

/**
 * 处理指定文件夹中的 .md 文件，生成链接列表并将结果保存到文件中。
 * @param {string} folderPath 文件夹路径。
 */
function processFolder(folderPath) {
  // 获取该文件夹下所有的 .md 文件
  const mdFiles = getMdFilesInFolder(folderPath);
  // 设置黑名单列表（不包含该文件夹名称）
  const blacklist = [`0 - ${path.basename(folderPath)}.md`];
  // 存储链接文本的数组
  const result = [];

  // 遍历该文件夹下所有的 .md 文件
  mdFiles.forEach((fileName) => {
    // 如果文件名在黑名单列表中，则跳过
    if (isFileNameInBlacklist(fileName, blacklist)) {
      return;
    }

    // 获取该文件的路径，并将其转化成相对于该文件夹的路径
    const filePath = path.join(folderPath, fileName);
    const relativePath = getRelativePath(folderPath, filePath);

    // 构造链接文本并将其加入结果数组
    const linkText = `- [ ${fileName} ]( ${relativePath.replace(/ /g, "%20").replace(/\$/g, '\\$')} )`;
    result.push(linkText);
  });

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

  /**
   * 对给定的文本数组按照前面的数字进行排序。
   * @param {Array<string>} arr 待排序的文本数组。
   * @returns {Array<string>} 排序后的文本数组。
   */
  function sortTextArrayByNumber(arr) {
    arr.sort((a, b) => {
      const aNum = extractNumber(a);
      const bNum = extractNumber(b);
      if (aNum === null) {
        return -1;
      } else if (bNum === null) {
        return 1;
      } else {
        return aNum - bNum;
      }
    });
    return arr;
  }

  // 数字排序
  sortTextArrayByNumber(result)

  // 如果有 md 文档, 才将结果保存到文件中
  result.length && writeResultFile(folderPath, result);
}

// 指定目录路径
const dirPath = './docs';

// 设置黑名单列表（不包含该文件夹名称）
const blacklist = ['.obsidian', '.vitepress', 'assets', 'demo'];

// 获取所有不包含 demo 字符串且未被列入黑名单的文件夹路径
const folders = getAllFoldersWithoutDemoAndBlacklist(dirPath, blacklist);


// 处理每个文件夹
folders.forEach((folderPath) => {
    processFolder(folderPath);
});

