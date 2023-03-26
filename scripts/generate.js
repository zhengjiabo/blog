const fs = require('fs');
const path = require('path');

/**
 * 判断当前目录是否在黑名单中。
 * @param {string} dirName 文件夹名称。
 * @param {Array<string>} blacklist 黑名单数组。
 * @returns {boolean} 当前目录是否在黑名单中。
 */
function isInBlacklist(dirName, blacklist) {
  for (const pattern of blacklist) {
    const regExp = new RegExp(pattern);
    if (regExp.test(dirName)) {
      return true;
    }
  }

  return false;
}

/**
 * 生成指定目录下所有文件和文件夹的对象数组。
 * @param {string} rootDir 根目录路径。
 * @param {Array<string>} blacklist 黑名单数组。
 * @param {string} rootPath 相对根目录的相对路径。
 * @returns {Promise<Array<Object>>} 指定目录下所有文件和文件夹的对象数组。
 */
async function getFilesAndDirs(rootDir, blacklist, rootPath = '/') {
  const result = [];

  // 处理每个文件夹和文件
  const fileList = fs.readdirSync(rootDir).filter(file => !file.includes('demo') && !isInBlacklist(file, blacklist))

  for (const fileOrDir of fileList) {
    const filePath = path.join(rootDir, fileOrDir);
    const stat = fs.statSync(filePath);

    // 如果是不是文件夹则继续下一轮
    if (!stat.isDirectory()) {
      continue;
    }

    const subdir = {
      text: fileOrDir,
    };

    const child = fs.readdirSync(filePath).filter(file => !file.includes('demo') && !isInBlacklist(file, blacklist))
    const hasDir = child.some(file => {
      const childPath = path.join(filePath, file);
      const stat = fs.statSync(childPath);
      return stat.isDirectory()
    })

    // 如果当前目录下还有其他类型的文件夹，则将其加入结果数组
    if (hasDir) {
      subdir.items = await getFilesAndDirs(filePath, blacklist, path.join(rootPath, fileOrDir))
    } else {
      try {
        const filePath = path.join(rootDir, `${fileOrDir}/0 - ${fileOrDir}.md`);
        fs.accessSync(filePath, fs.constants.F_OK);
        const link = path.join(rootPath, `${fileOrDir}/0 - ${fileOrDir}.md`);
        subdir.link = link
      } catch (err) {
      }
    }

    // 有链接或子目录则保留
    (subdir.link || subdir.items) && result.push(subdir);
  }

  return result;
}

/**
 * 将指定数据覆盖写入指定文件。
 * @param {string} filePath 文件路径。
 * @param {string} data 要写入的数据。
 * @returns {Promise<void>}
 */
async function overwriteFile(filePath, data) {

  // const filePath = path.join(rootDir, fileOrDir);
  await fs.promises.writeFile(filePath, data);
}

/**
 * 生成对象数组并覆盖写入指定文件。
 * @param {string} rootDir 根目录路径。
 * @param {Array<string>} blacklist 黑名单数组。
 * @param {string} filePath 写入的文件路径。
 * @returns {Promise<void>}
 */
async function generateFilesAndDirs(rootDir, blacklist, filePath) {
  const data = await getFilesAndDirs(rootDir, blacklist);
  const json = JSON.stringify(data, null, 2);

  await overwriteFile(filePath, json);
}
const ROOT_DIR = './docs';
const BLACKLIST = ['\.vitepress', 'assets'];
const FILE_PATH = './docs/.vitepress/generate/nav.json';

generateFilesAndDirs(ROOT_DIR, BLACKLIST, FILE_PATH)
  .then(() => console.log('Done'))
  .catch((err) => console.error(err));