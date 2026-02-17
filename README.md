# RakuWallet - 入院患者お小遣い管理システム

入院患者様のお小遣い（預かり金）を安全・正確に管理するための医療施設向け Web アプリケーションです。

## 機能

- **患者管理** - 入院患者の登録・情報管理・退院処理
- **入出金記録** - 預かり金の入金・出金の記録（商品明細対応）
- **月次出納帳** - 患者別の月次収支一覧
- **月末残高一覧** - 月末時点の患者別残高集計
- **ダッシュボード** - 管理患者数・総残高・月間入出金の概況

## 技術スタック

| 分類 | 技術 |
|------|------|
| フレームワーク | Next.js 14 (App Router) |
| 言語 | TypeScript |
| UI | Material-UI (MUI) v5 |
| データベース | SQLite |
| ORM | Prisma |
| 開発環境 | Docker + Dev Container |

## 開発環境のセットアップ

### 前提条件

- Docker Desktop がインストール済みであること
- VS Code + [Dev Containers 拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) がインストール済みであること

### 手順

1. リポジトリをクローン

   ```bash
   git clone <repository-url>
   cd raku-wallet
   ```

2. VS Code でフォルダを開き、コマンドパレット（`F1`）から **「Dev Containers: Reopen in Container」** を実行

   コンテナ起動後、以下が自動的に実行されます：
   - `npm install` - 依存パッケージのインストール
   - `npx prisma generate` - Prisma クライアント生成
   - `npx prisma db push` - データベーススキーマ同期
   - `npm run db:seed` - サンプルデータ投入
   - `npm run dev` - 開発サーバー起動

3. ブラウザで http://localhost:3000 にアクセス

### Docker なしで起動する場合

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

## 主要コマンド

```bash
npm run dev        # 開発サーバー起動
npm run build      # 本番ビルド
npm run db:push    # DBスキーマを schema.prisma に同期
npm run db:seed    # サンプルデータ投入
```

## プロジェクト構成

```
src/
├── app/
│   ├── api/              # API ルート（Next.js Route Handlers）
│   │   ├── dashboard/    # ダッシュボード集計
│   │   ├── patients/     # 患者 CRUD
│   │   ├── transactions/ # 取引 CRUD
│   │   └── balances/     # 月末残高集計
│   ├── patients/         # 患者管理ページ
│   ├── transactions/     # 入出金記録ページ
│   ├── ledger/           # 月次出納帳ページ
│   └── balances/         # 月末残高一覧ページ
├── components/
│   ├── Sidebar.tsx       # ナビゲーションサイドバー
│   └── ThemeRegistry.tsx # MUI テーマプロバイダー
└── lib/
    ├── prisma.ts         # Prisma クライアント（シングルトン）
    ├── format.ts         # 日付・金額フォーマット関数
    └── theme.ts          # MUI カスタムテーマ
```

## データベース構成

| テーブル | 説明 |
|----------|------|
| `Patient` | 患者マスタ（病棟・病室・入退院日など） |
| `Product` | 商品マスタ（売店商品・単価など） |
| `Transaction` | 入出金取引ヘッダー |
| `TransactionItem` | 取引明細（商品・数量・小計） |
| `ClosingPeriod` | 締め処理記録 |
| `BillingContact` | 請求連絡記録 |

## 環境変数

`.env.example` をコピーして `.env` を作成してください。

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `DATABASE_URL` | SQLite データベースファイルパス | `file:./dev.db` |
