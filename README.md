# セキュア認証・認可アプリ

Next.js と Prisma を使った、セッションベース認証の学習用アプリです。
JWT は使わず、DB 管理のセッションと HttpOnly Cookie でログイン状態を扱います。

## 実装した主な要件

- 新規登録: メールアドレス、パスワード、確認用パスワードを検証
- パスワード保護: bcrypt でハッシュ化して保存
- ログイン: bcrypt.compare で照合
- セッション認証: Cookie には生トークン、DB には SHA-256 ハッシュを保存
- Cookie 属性: HttpOnly、SameSite=Lax、Path=/、Max-Age、production 時 Secure
- ログアウト: DB セッションに revokedAt を設定し、Cookie を削除
- 認可: role による admin/user 制御
- アカウント状態: status による active/suspended 制御
- ログイン履歴: 成功、失敗、停止、レート制限を記録
- レート制限: 5分間に5回失敗したメールまたはIPを一時的に制限
- パスワード変更: 現在のパスワード確認、新パスワード確認、再ハッシュ化
- CSP: Next.js headers で Content-Security-Policy を設定

## 画面

- `/signup`: 新規登録
- `/login`: ログイン
- `/dashboard`: ログイン後のメインページ
- `/login-history`: ログイン履歴
- `/settings/password`: パスワード変更
- `/admin/users`: 管理者用ユーザー一覧、停止、解除
- `/member/about`: 既存の公開プロフィール編集

## DB設計

### users

- `id`
- `email`
- `passwordHash`
- `name`
- `role`: `ADMIN` または `USER`
- `status`: `ACTIVE` または `SUSPENDED`
- `createdAt`
- `updatedAt`
- `lastLoginAt`

### sessions

- `id`
- `userId`
- `sessionTokenHash`
- `userAgent`
- `ipAddress`
- `expiresAt`
- `createdAt`
- `revokedAt`

### login_history

- `id`
- `userId`
- `email`
- `ipAddress`
- `userAgent`
- `success`
- `reason`
- `createdAt`

## セキュリティ対策一覧

| 脅威                 | 対策                               |
| -------------------- | ---------------------------------- |
| パスワード漏洩       | bcrypt でハッシュ化                |
| ブルートフォース攻撃 | ログイン失敗回数によるレート制限   |
| 弱いパスワード       | クライアント側表示とサーバー側検証 |
| Cookie 窃取          | HttpOnly Cookie                    |
| CSRF                 | SameSite=Lax                       |
| XSS 被害拡大         | CSP                                |
| 権限外アクセス       | role による認可                    |
| 停止アカウント悪用   | status によるログイン拒否          |
| セッション残存       | ログアウト時にDBセッションを失効   |
| 不審ログインの発見   | ログイン履歴表示                   |

## セットアップ

```bash
npm i
```

`.env` を作成します。

```env
DATABASE_URL="file:./app.db"
```

DB を反映し、初期データを投入します。

```bash
npx prisma db push
npx prisma generate
npx prisma db seed
```

開発サーバーを起動します。

```bash
npm run dev
```

## テストユーザー

| role  | status    | email                 | password       |
| ----- | --------- | --------------------- | -------------- |
| ADMIN | ACTIVE    | admin01@example.com   | AdminPass1111! |
| USER  | ACTIVE    | user01@example.com    | UserPass1111!  |
| USER  | SUSPENDED | suspended@example.com | StopPass1111!  |

## 動作確認

```bash
npm run lint
npm run build
```

この環境では `npx` や `npm` が PowerShell の実行ポリシーで止まる場合があります。
その場合は `npx.cmd`、`npm.cmd` を使ってください。

## 実装上の注意

- セッションCookieの `Secure` は production でのみ有効にしています。localhost の開発環境でも動作確認できるようにするためです。
- Next.js の一部スタイル都合で CSP の `style-src` に `'unsafe-inline'` を許可しています。
- 公開リポジトリに `.env`、DB、APIキー、本番パスワード、個人情報を含めないでください。
- JWT 関連コードは削除し、セッションベース認証に統一しています。
