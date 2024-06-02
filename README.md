## Started

```bash
cp env.example .env
```

修改 `.env` ，填写正确的值

## dev

本地开发的时候，如果是Windows，可以在终端中执行： `$env:APP_INSTANCE="Dwz"`

在当前窗口，启动的就是 `Dwz` app。

开多个窗口，通过指定不同的APP_INSTANCE，可以同时启动多个app。


```bash
npx prisma db push // 根据 schema.prisma 自动生成数据库表

npx nest start --watch
```

## production

```bash
docker build -t backend-starter:1.0 .

docker run -dit --name backend-starter --env-file .env backend-starter:1.0
```

## cli-helper

使用方法：

```
# 第一个参数是 nest module 名字，第二个是 src/apps/ 下面的文件夹名字
# 创建： mo co s，然后把文件夹从 src 下面移动到 src/apps/admin 下面
.\cli-helper.bat test admin
```
