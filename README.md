# Hive Fukuoka website

GitHub Pagesで公開するHive Fukuoka公式サイトです。

- 本番: https://hivejapaninfo.github.io/hive_fukuoka_2026/
- 確認用: https://hive-fukuoka-site-preview.vercel.app/
- GitHub: https://github.com/HiveJapanInfo/hive_fukuoka_2026

ローカルの正本は `/Users/arisa/ai-dev/apps/hive-fukuoka-site` です。デスクトップ側に複製を増やさず、このリポジトリを更新します。

## ページ構成

- `index.html`: Hive Japan、Hive Fukuoka、活動内容、地域展開、参加方法を伝える通年のトップページ
- `reports/2026/index.html`: 2026年度の開催内容を短く紹介するダイジェスト
- `invitation-2026.html`: 2026年の参加者募集時アーカイブ
- `assets/css/site.css`: トップ・開催レポート共通スタイル
- `assets/js/site.js`: 共通ナビゲーションと表示アニメーション
- `assets/images/shared/`: 年度をまたいで使うHive Japan・各地域の写真や図版
- `assets/images/YYYY/`: その年度の掲載許諾済みWeb画像
- `assets/meta/`: OGPなど検索・SNS表示用の画像
- `tools/annual-report-template/`: 開催レポート資料の再現用コード
- `docs/ANNUAL_RELEASE_CHECKLIST.md`: 次年度公開時の確認手順
- `docs/DEVELOPMENT_LOG_2026.md`: 2026年度の資料・サイト制作記録

サイトでは、情報を次の2層に分けています。

1. トップページ: Hive Fukuokaの考え方と通年の活動
2. 年度ページ: その年の出来事を短く振り返るダイジェスト

開催レポートPDFはサイトには掲載しません。

## 次年度レポートの追加

1. `reports/2026/` を `reports/YYYY/` に複製する。
2. `assets/images/YYYY/` を作り、掲載許諾済みの写真だけを配置する。
3. 年度ページの概要、写真、登壇者、フィールドワーク、アンケート、参加者の声を更新する。
4. 詳しいプログラム、参加者属性、謝辞はサイトには載せず、年度ページは要点に絞る。
5. 年度用OGP画像を `assets/meta/` に追加し、年度ページのメタ情報を更新する。
6. トップページの最新年度への導線だけを更新し、参加人数などの年度固有の数字は載せない。
7. `docs/ANNUAL_RELEASE_CHECKLIST.md` に沿ってPC・タブレット・スマートフォンを確認する。

写真はCSSで引き伸ばさず、`object-fit: cover` または `contain` を使います。集合写真はモバイルで `contain` に切り替え、左右の人物が切れないようにしています。

## 開催レポート資料の再制作

PowerPoint版の開催レポートを再制作するコードと次年度用の入力シートは、`tools/annual-report-template/` にまとめています。

- `tools/annual-report-template/README.md`: 生成手順と運用ルール
- `tools/annual-report-template/input-template.md`: 次年度の入力シート
- `tools/annual-report-template/examples/2026/`: Hive Fukuoka 2026の生成コード

参加者写真、アンケート原文、掲載NG情報はGitHubに保存しません。

## ローカル確認

```bash
python3 -m http.server 4173
```

ブラウザで `http://localhost:4173/` を開きます。

## リポジトリに入れないもの

- 元写真、写真共有サービスのURL
- アンケート原文や個人情報
- 掲載NG人物に関する情報
- PPTX、PDF、ページ画像などの生成物
- `node_modules/`、Playwrightの一時ファイル、Vercelのローカル設定
