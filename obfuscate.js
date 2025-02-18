// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const JavaScriptObfuscator = require('javascript-obfuscator');

const distDir = path.join(__dirname, 'dist');
const dist2Dir = path.join(__dirname, 'dist2');

// 递归遍历 dist 目录下的所有文件
function traverseDir(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      traverseDir(fullPath);
    } else if (stats.isFile() && file.endsWith('.js')) {
      obfuscateFile(fullPath);
    }
  });
}

// 混淆单个文件
function obfuscateFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');

  const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
    compact: true, // 缩小代码体积
    controlFlowFlattening: true, // 控制流扁平化
    identifierNamesGenerator: 'hexadecimal', // 使用十六进制名称
    // ... 其他混淆选项 ...
    sourceMap: true, // 生成 Source Map
    sourceMapFileName: path.basename(filePath) + '.map', // Source Map 文件名
  });

  const relativePath = path.relative(distDir, filePath);
  const outputPath = path.join(dist2Dir, relativePath);

  // 创建目录
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  // 写入混淆后的代码和 Source Map
  fs.writeFileSync(outputPath, obfuscationResult.getObfuscatedCode());
  fs.writeFileSync(outputPath + '.map', obfuscationResult.getSourceMap());
}

// 清空 dist2 目录
fs.rmSync(dist2Dir, { recursive: true, force: true });

// 创建 dist2 目录
fs.mkdirSync(dist2Dir);

// 开始混淆
traverseDir(distDir);

console.log('代码混淆完成！');
