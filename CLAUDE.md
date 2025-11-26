# CLAUDE.md

このファイルは、このリポジトリで作業する際にClaude Code (claude.ai/code) にガイダンスを提供します。
回答については日本語で行ってください。

## プロジェクト概要

AWS Nova Canvas APIを使用したバーチャル試着デモアプリケーション。プロジェクトは以下で構成されています：
- **Backend**: バーチャル試着処理のためにAWS Bedrock Nova CanvasとインターフェースするPython Lambda関数
- **Frontend**: 画像アップロードと結果表示のためのReact + TypeScript + Viteアプリケーション

## アーキテクチャ

### Backend (Python + AWS Lambda)

バックエンドは `/backend` に配置され、AWS Lambda関数として実行されるように設計されています。

**主要コンポーネント:**
- `main.py`: 試着処理を統括するLambdaハンドラ
  - `lambda_handler()`: モデル/インプット画像のS3キーとモードを受け取るエントリーポイント
  - `invoke_api()`: S3から画像を取得し、Bedrock Nova Canvasを呼び出し、出力をS3に保存
  - 生成された画像の署名付きURLを返却
- `image_helper.py`: Nova Canvas APIパラメータを構築
  - `build_inference_params()`: `VIRTUAL_TRY_ON` リクエストペイロードを構築
  - `convert_mode()`: フロントエンドのモード文字列 ("full", "top", "bottom") をNova Canvasのガーメントクラス (FULL_BODY, UPPER_BODY, LOWER_BODY) にマッピング
- `prepare_file_upload.py`: ファイルアップロード用の署名付きS3 URLを生成

**AWSサービス:**
- Bedrock Runtime (Nova Canvasモデル: `amazon.nova-canvas-v1:0` in `us-east-1`)
- S3 (入力画像と生成された出力を保存、SPAアプリを公開)
- API Gateway (Lambda呼び出し用)
- CloudFront(サイト配信)

**環境変数:**
- `BUCKET_NAME`: 画像を保存するS3バケット

### Frontend (React + TypeScript + Vite)

フロントエンドは `/frontend` に配置され、モダンなReactツールで構築されています。

**主要コンポーネント:**
- `src/App.tsx`: `ImageUploadComponent` をレンダリングするエントリーポイント
- `src/components/ImageUpload.tsx`: モデル/インプット画像のアップロード、試着モード選択、結果表示のためのメインUIコンポーネント
- `src/components/Image.tsx`: 画像表示コンポーネント

**APIサービス:**
- `src/api/imageUploadService.ts`:
  - 署名付きURLを介したS3への画像アップロードを処理
  - Nova Canvasの制約を満たすための自動画像リサイズ機能を含む (最大2048×2048ピクセル)
- `src/api/tryOnService.ts`: 試着処理を実行するためにバックエンドLambdaを呼び出す

**型定義:**
- `src/types/tryOnMode.ts`: `TryOnMode` enum (Full, Top, Bottom) を定義

**スタイリング:**
- TailwindCSSを使用
- `src/resource/` にカスタムCSS

**APIエンドポイント (サービスファイルにハードコード):**
- `https://uur25qs2q8.execute-api.ap-northeast-1.amazonaws.com/prod/prepare`: 署名付きアップロードURLを取得
- `https://uur25qs2q8.execute-api.ap-northeast-1.amazonaws.com/prod/try-on`: バーチャル試着を実行

## 開発コマンド

### Backend

```bash
cd backend

# 依存関係のインストール
pipenv install

# ローカル実行 (環境変数とローカル画像が必要)
pipenv run start
```

**要件:**
- Python 3.13
- 環境変数: `AWS_BEARER_TOKEN_BEDROCK` (ローカルテスト用)
- 環境変数: `BUCKET_NAME` (S3バケット名)

### Frontend

```bash
cd frontend

# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# コードのリント
npm run lint

# 本番ビルドのプレビュー
npm run preview
```

## 主要なワークフロー

### バーチャル試着プロセス

1. **画像アップロード**: ユーザーがフロントエンド経由でモデル画像（人物）とインプット画像（衣服）をアップロード
2. **リサイズ & アップロード**: フロントエンドが必要に応じて画像を自動リサイズし、署名付きURLを介してS3にアップロード
3. **モード選択**: ユーザーがガーメントタイプ（全身、上半身、下半身）を選択
4. **API呼び出し**: フロントエンドがS3キーとモードを使ってLambdaを呼び出す
5. **Nova Canvas処理**: LambdaがS3から画像を取得し、試着パラメータを使ってBedrock Nova Canvasを呼び出す
6. **結果保存**: 生成された画像が `output/` プレフィックス配下のS3に保存される
7. **表示**: フロントエンドが署名付きURLを受け取り、結果を表示

### 画像サイズの制約

Nova Canvasは最大2048×2048ピクセルの解像度を持ちます。フロントエンドはアスペクト比を維持しながら大きな画像を自動的にリサイズします（`imageUploadService.ts:22-52`）。

## 重要な注意事項

- バックエンドはAWS Lambdaデプロイ用に設計されており、ローカル実行用ではありません（ただし、コメント内にローカルテスト用コードは存在します）
- API Gatewayエンドポイントはフロントエンドのサービスファイルにハードコードされています
- 生成された画像はタイムスタンプ付きファイル名を使用して衝突を回避しています
- 署名付きURLは1時間（3600秒）後に期限切れになります
- CORSヘッダーはフロントエンドからのクロスオリジンリクエスト用に設定されています
