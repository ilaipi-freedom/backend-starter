const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const envFilePath = path.join(__dirname, '.env');
const tempEnvFilePath = path.join(__dirname, '.env.temp');

function modifyEnv(environment) {
  try {
    // 1. 复制 .env 到 .env.temp，如果 .env.temp 已存在，则覆盖
    fs.copyFileSync(envFilePath, tempEnvFilePath);

    // 2. 读取 .env 文件
    let fileContent = fs.readFileSync(envFilePath, 'utf-8');
    const lines = fileContent.split('\n');

    let targetLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === `# ${environment}`) {
        targetLineIndex = i;
        break;
      }
    }
    console.log('targetLineIndex', targetLineIndex);

    if (targetLineIndex !== -1 && targetLineIndex + 1 < lines.length) {
      // 3. 取消下一行的注释（如果存在）并修剪
      const nextLine = lines[targetLineIndex + 1].trim();
      console.log('nextLine', nextLine);
      if (nextLine.startsWith('# DATABASE_URL')) {
        lines[targetLineIndex + 1] = nextLine.substring(1).trim();
      }
    }

    // 4. 注释掉其他 DATABASE_URL 行
    for (let i = 0; i < lines.length; i++) {
      if (
        i !== targetLineIndex + 1 &&
        lines[i].trim().startsWith('DATABASE_URL') &&
        !lines[i].trim().startsWith('#')
      ) {
        lines[i] = `# ${lines[i].trim()}`;
      }
    }

    // 5. 将修改后的内容写回 .env
    fs.writeFileSync(envFilePath, lines.join('\n'));

    console.log(`.env 文件已成功修改，.env.temp 文件已重新生成。`);
  } catch (err) {
    console.error('发生错误:', err);
    process.exit(1);
  }
}

function restoreEnv() {
  try {
    // 将 .env.temp 的内容覆盖到 .env
    fs.copyFileSync(tempEnvFilePath, envFilePath);

    // 删除 .env.temp 文件
    fs.unlinkSync(tempEnvFilePath);

    console.log('.env 文件已还原，.env.temp 文件已删除。');
  } catch (err) {
    console.error('还原 .env 文件失败:', err);
    process.exit(1);
  }
}

function getAllEnvironments() {
  try {
    const fileContent = fs.readFileSync(envFilePath, 'utf-8');
    const lines = fileContent.split('\n');

    const environments = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      let isEnvLine = false;
      if (trimmedLine.startsWith('#')) {
        const environment = trimmedLine.substring(1).trim();
        if (!environment.startsWith('DATABASE_URL')) {
          continue;
        }
        isEnvLine = true;
      } else if (trimmedLine.startsWith('DATABASE_URL')) {
        isEnvLine = true;
      }
      if (isEnvLine) {
        const preLine = lines[i - 1].trim();
        environments.push(preLine.substring(1).trim());
      }
    }

    return environments;
  } catch (err) {
    console.error('获取 environment 失败:', err);
    process.exit(1);
  }
}

const environment = process.argv[2];
const prismaSchemaPath = path.join(__dirname, 'prisma');
const syncCommand = `npx prisma format --schema ${prismaSchemaPath} && npx prisma db push --schema ${prismaSchemaPath} && npx prisma generate --schema ${prismaSchemaPath}`;

if (environment === 'all') {
  const environments = getAllEnvironments();
  if (environments) {
    console.log('environments', environments);
    environments.forEach((env) => {
      modifyEnv(env);
      try {
        execSync(syncCommand, { stdio: 'inherit' });
      } catch (err) {
        console.error(`npx prisma db push 执行失败，环境：${env}`);
      } finally {
        restoreEnv();
      }
    });
  }
} else if (environment) {
  modifyEnv(environment);
  try {
    execSync(syncCommand, { stdio: 'inherit' });
    restoreEnv();
  } catch (err) {
    console.error(`npx prisma db push 执行失败，环境：${environment}`);
    restoreEnv();
  }
} else {
  console.error('请提供环境名称作为参数。');
  process.exit(1);
}
