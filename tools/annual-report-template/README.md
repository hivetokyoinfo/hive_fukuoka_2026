# Hive Annual Report Template

Hiveの年度開催レポートを、PowerPoint形式で再制作するためのコードと手順です。

このフォルダには生成コードだけを保存します。参加者写真、アンケート原文、個人情報を含む資料はGitHubへ追加しません。

## 構成

```text
annual-report-template/
├── README.md
├── package.json
├── input-template.md
└── examples/
    └── 2026/
        ├── build-deck.js
        ├── PRODUCTION_NOTES.md
        └── assets/
            └── README.md
```

## 2026年版を再生成する

1. Node.js 20以降を用意します。
2. このフォルダで `npm install` を実行します。
3. 承認済みの写真としおり素材を、`examples/2026/assets/README.md` に従って配置します。
4. `npm run build:2026` を実行します。

出力先は次の場所です。

```text
examples/2026/build/HiveFukuoka2026_開催レポート.pptx
```

写真はSharpで配置枠と同じ比率へクロップしてからPowerPointへ挿入します。元画像の縦横比は変形しません。

## 次年度のレポートを作る

1. `input-template.md` に開催情報、タイムライン、登壇者、協力先、写真指定を記入します。
2. `examples/2026` を新しい年度名で複製します。
3. `build-deck.js` の文言、数値、写真番号、出力ファイル名を更新します。
4. PPTXを生成し、全ページを画像またはPDFで確認します。
5. 写真の時系列、人物の見切れ、掲載許諾、数値の母数、謝辞を確認します。

## 公開しないもの

- 元写真とその共有URL
- アンケートの回答者を特定できる情報
- 掲載NG人物に関する情報
- 運営用バックアップ
- 生成途中の画像、PDF、PPTX

完成した公開用PDFをサイトへ掲載するかどうかは、年度ごとに別途判断します。
