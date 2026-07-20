# Devin セットアップ（SalesCube リバースエンジニアリング）

Devin はリポジトリ直下の `AGENTS.md` をネイティブに読み込むため、基本の指示はそちらに集約している。
本作業は**静的解析のみ**（ビルド・DB 構築は不要）なのでセットアップスクリプトは用意しない。

## Devin 側で行う設定

1. **リポジトリ接続**: `git@github.com:salescube/SalesCube.git`、作業ブランチ `re/devin`。
2. **Machine snapshot**: 追加インストール不要（コード閲覧のみ）。ビルドコマンドは設定しない。
3. **Knowledge**: 下記 `knowledge.md` の内容を Devin の Knowledge に登録すると、
   セッション横断で規約が効く。

## タスク指示テンプレート（Devin へ渡す）

> AGENTS.md に従い、業務ドメイン `<domain>` をリバースエンジニアリングして、
> 要件定義書・技術仕様書・設計書を日本語で作成し、
> `docs/_generated/devin/{requirements,technical,design}/` に出力してください。
> ソース(WEB/, DB/)は改変しないこと。
