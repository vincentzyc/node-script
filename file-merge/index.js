const fs = require('fs').promises;
const path = require('path');
const terser = require('terser');
const { version } = require('../package.json');

const MERGED_PATH = path.resolve(__dirname, '../lib/');
const mergedJsName = `file-merge@${version}.js`;

// 配置文件路径和相关信息
const filesConfig = [
  { path: '../node_modules/vue/dist/vue.global.prod.js', beforeText: '', minify: false },
  { path: '../node_modules/vue-router/dist/vue-router.global.prod.js', beforeText: '', minify: false },
  { path: '../node_modules/pinia/node_modules/vue-demi/lib/index.iife.js', beforeText: '// vue-demi', minify: true },
  { path: '../node_modules/pinia/dist/pinia.iife.prod.js', beforeText: '', minify: false },
  { path: '../node_modules/axios/dist/axios.min.js', beforeText: '// axios', minify: false },
];

// 确保目标文件夹存在
async function ensureLibFolderExists(libPath) {
  try {
    await fs.access(libPath);
    await fs.rm(libPath, { recursive: true });
  } catch (error) {
    // 忽略不存在文件夹的错误
  } finally {
    await fs.mkdir(libPath, { recursive: true });
  }
}

// 读取和修改文件内容
async function readAndModifyFile(filePath, beforeText = '', minify = false) {
  try {
    let data = await fs.readFile(filePath, 'utf8');
    if (minify) {
      const result = await terser.minify(data);
      if (result.error) {
        throw new Error(`代码压缩出错: ${result.error}`);
      }
      data = result.code;
    }
    let modifiedData = data.replace(/\/\/# sourceMappingURL=.*\.map/g, '');
    if (beforeText) {
      modifiedData = `${beforeText}\n${modifiedData}`;
    }
    return modifiedData.trim();
  } catch (err) {
    throw new Error(`读取或修改文件出错: ${err.message}`);
  }
}

// 合并文件
async function mergeFiles() {
  try {
    const fileContentArray = await Promise.all(
      filesConfig.map(file => readAndModifyFile(path.resolve(__dirname, file.path), file.beforeText, file.minify))
    );

    const mergedContent = fileContentArray.join('\n');

    await ensureLibFolderExists(MERGED_PATH);
    await fs.writeFile(path.join(MERGED_PATH, mergedJsName), mergedContent);

    console.log('文件合并成功');
  } catch (err) {
    console.error(`文件处理出错: ${err.message}`);
  }
}

mergeFiles();
