## Started

```bash
cp env.example .env
```

修改 `.env` ，填写正确的值

## dev

```bash
npx prisma db push // 根据 schema.prisma 自动生成数据库表

npx nest start --watch
```

## production

```bash
docker build -t backend-starter:1.0 .

docker run -dit --name backend-starter --env-file .env backend-starter:1.0
```
