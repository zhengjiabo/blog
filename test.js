
const fs = require('fs');
const path = require('path');

function getAllMdFiles(dirPath) {
  let mdFiles = [];

  // 遍历目录下所有文件和文件夹
  fs.readdirSync(dirPath).forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    // 如果是文件夹，则递归获取其中所有的 .md 文件
    if (stat.isDirectory()) {
      mdFiles = mdFiles.concat(getAllMdFiles(filePath));
    }
    // 如果是 .md 文件，则将其加入结果数组中
    else if (path.extname(file) === '.md') {
      mdFiles.push(filePath);
    }
  });

  return mdFiles;
}

function getTitleFromMdFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const regex = /^title:\s+(.*)$/im;
  const match = regex.exec(content);

  if (match) {
    return match[1]
      .replace(/[\\\/<>:\|?*"]/g, '-')
      .trim();
  }

  return null; // 如果找不到 title 字段，则返回 null
}

function renameMdFile(filePath, newName) {
  const newPath = path.join(path.dirname(filePath), `${newName}.md`);
  fs.renameSync(filePath, newPath);
}

const dirPath = 'E:\\web\\items\\blog\\docs\\frontEnd';
const mdFiles = getAllMdFiles(dirPath);

let counter = 1;

mdFiles.forEach((filePath) => {
  const title = getTitleFromMdFile(filePath);
  
  if (title) {
    const newName = `${title}`;
    console.log(newName)

    renameMdFile(filePath, newName);
    counter++;
  }
});