# Hive Fukuoka website

GitHub Pagesで公開するHive Fukuoka公式サイトです。

## ページ構成

- `index.html`: Hive Japan、Hive Fukuoka、活動内容、地域展開、参加方法を伝える通年のトップページ
- `reports/2026/index.html`: 2026年度の開催内容を短く紹介するダイジェスト
- `invitation-2026.html`: 2026年の参加者募集時アーカイブ
- `assets/css/site.css`: トップ・開催レポート共通スタイル
- `assets/js/site.js`: 共通ナビゲーションと表示アニメーション
- `assets/images/`: Web用に最適化した公式写真・図版

サイトでは、情報を次の2層に分けています。

1. トップページ: Hive Fukuokaの考え方と通年の活動
2. 年度ページ: その年の出来事を短く振り返るダイジェスト

開催レポートPDFはサイトには掲載しません。

## 次年度レポートの追加

1. `reports/2026/` を `reports/YYYY/` に複製する。
2. 写真は縦横比を保持したWebPに変換し、`assets/images/` に追加する。
3. 年度ページの概要、写真、登壇者、フィールドワーク、アンケート、参加者の声を更新する。
4. 詳しいプログラム、参加者属性、謝辞はサイトには載せず、年度ページは要点に絞る。
5. トップページの最新年度への導線だけを更新し、参加人数などの年度固有の数字は載せない。
6. PC・スマートフォンで、顔の見切れ、文字の重なり、リンク切れを確認する。

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
