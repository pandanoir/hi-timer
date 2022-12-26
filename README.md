https://auth0.com/docs/quickstart/webapp/nextjs#install-the-auth0-next-js-sdk を参考に auth0 を入れている

## Set up

### vercel のセットアップ

環境変数をセットする。

これらは Auth0 のダッシュボードの値を張り付ける

- AUTH0_SECRET
- AUTH0_ISSUER_BASE_URL
- AUTH0_CLIENT_ID
- AUTH0_CLIENT_SECRET

残り

- AUTH0_BASE_URL: デプロイ先の URL (このリポジトリでいえば https://todo-nextjs-zeta.vercel.app)
- DATA_BASE_URL: データベースへの URL (mysql://xxx みたいな)

### auth0 のセットアップ

Application URIs を設定する必要がある。他はデフォルトで問題ない。

- Allowed Callback URLs: `http://localhost:3000/api/auth/callback` と実際のアプリの URL をカンマ区切りで指定
- Allowed Logout URLs: `http://localhost:3000` と実際のアプリの URL をカンマ区切りで指定

### ローカルにデータベースを持つ

```
echo DATABASE_URL='mysql://root:root@127.0.0.1:13306/todo-nextjs' >> .env.local
```

ローカルデータベースに対する操作は dotenv を使うとよい

```
dotenv -e .env.local npx prisma migrate dev
dotenv -e .env.local npx prisma studio
```

## Getting Started

```bash
npm run dev
# or
yarn dev
```

[http://localhost:3000](http://localhost:3000) にページが表示される。

