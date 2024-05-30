const fs = require('fs');
const path = require('path');

const currentPath = './';
const sourcePath = './xxx/pages/h5';
const extraFolder = ['.git', '.vscode'];

fs.readdir(currentPath, { withFileTypes: true }, (err, files) => {
  if (err) throw err;

  // 过滤出所有是文件夹的元素
  const folders = files.filter(file => file.isDirectory());

  console.log('文件夹数：', folders.length - extraFolder.length);

  let finishFolder = 0;
  // 遍历所有文件夹
  folders.forEach(folder => {
    const targetPath = path.join(folder.name, 'pages/h5');
    // 排除不需要复制的文件夹
    if (extraFolder.includes(folder.name)) return;
    //进行复制替换
    copyFolder(sourcePath, targetPath, () => {
      finishFolder++;
      console.log(finishFolder, folder.name);
    });
  });
});

function copyFolder(src, dest, callback) {
  fs.mkdirSync(dest, { recursive: true }); // 确保目标路径存在

  fs.readdir(src, { withFileTypes: true }, (err, files) => {
    if (err) throw err;

    let completed = 0; // 已完成的文件和文件夹数量
    const total = files.length; // 文件和文件夹的总数

    files.forEach(file => {
      const srcPath = path.join(src, file.name);
      const destPath = path.join(dest, file.name);

      if (file.isDirectory()) {
        // 递归复制子文件夹
        copyFolder(srcPath, destPath, () => {
          completed++;
          if (completed === total) callback(); // 检查是否完成操作
        });
      } else {
        fs.copyFileSync(srcPath, destPath); // 复制文件
        completed++;
        if (completed === total) callback(); // 检查是否完成操作
      }
    });
  });
}
