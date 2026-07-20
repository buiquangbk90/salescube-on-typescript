# 技術仕様書 — {ドメイン名}

- 対象パッケージ: `jp.co.arkinfosys.{domain}`
- 作成ツール: {claude|cursor|devin}
- 作成日: {YYYY-MM-DD}

## 1. アーキテクチャ位置づけ
{SAStruts action → service → S2JDBC entity → PostgreSQL の流れ}

## 2. クラス構成
| レイヤ | クラス | 責務 |
|---|---|---|
| Action | `...Action` | |
| Form | `...Form` | |
| Service | `...Service` | |
| DTO | `...Dto` | |
| Entity | `...` | |

## 3. DI / AOP 設定
{関連 .dicon、インジェクション、トランザクション境界（@Transactional 等）}

## 4. データアクセス
- 使用エンティティ / テーブル:
- 代表的なSQL・S2JDBCクエリ:
- トランザクション制御:

## 5. 外部連携・帳票
{JasperReports テンプレート、バッチ、ストアドプロシージャ}

## 6. 例外・ログ・セキュリティ
{エラーハンドリング、log4j、権限ロール}

## 7. 依存関係
{他ドメイン・共通クラスへの依存}

## 8. 未確定・推測事項
