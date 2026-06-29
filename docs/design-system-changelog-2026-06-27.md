<!--
================================================================================
AI EDIT INSTRUCTIONS — DesignSystem.md 更新（2026-06-27 セッション実装分）
================================================================================

Purpose:
  このブロックは 2026-06-27 時点の UI 実装で確定したデザインルールを
  DesignSystem.md v5.0 に反映するための追記文案である。

Edit strategy:
  1. 既存セクションに「上書き更新」できるもの → 該当箇所を REPLACE
  2. 新規パターン → 「コンポーネント仕様」末尾に新セクション ADD（§18 以降）
  3. ローカライズ・文言 → 新サブセクション「ローカライズルール」ADD（タイポグラフィ直後推奨）
  4. Do/Don't → 該当行を APPEND
  5. Appendix コンポーネント一覧 → Time Search modal の行を更新
  6. Last updated を 2026-06-27 に更新

Do NOT:
  - Date Tag の固定幅（88px）ルールは採用しない（試行→撤回済み）
  - セキュリティ（CSP 等）・OG 画像差し替えは本ドキュメント対象外

Source of truth (code):
  - src/lib/timezone.ts          → formatDateHeading / formatDateTag
  - src/lib/cities.ts            → getCityDisplayName
  - src/features/home/TimeTable.module.css
  - src/features/home/TagBar.tsx / TagBar.module.css
  - src/features/time-search/TimeSearchModal.module.css
  - src/features/time-search/TimeSearchModal.tsx
  - src/features/time-search/MultiCandidatePanel.tsx
  - src/i18n/ja.json / en.json
  - src/tokens/tokens.css
  - src/styles/global.css

Status legend:
  ✅ コード実装済み・本文案で確定
  ❌ 試行後撤回（記載のみ・採用しない）
-->

# Design System Changelog — 2026-06-27

NANJI? DesignSystem.md への反映用文案。Claude 等の AI が `DesignSystem.md` を編集するときに参照する。

---

## [UPDATE] タイポグラフィ — フォント実装 ✅

### 日本語 UI フォント（global.css）

| 項目 | 値 |
|---|---|
| フォント名 | `"Source Han Sans JP"` |
| ファイル | `/public/fonts/SourceHanSansJP-VF.woff2` |
| weight range | `100 900`（可変フォント） |
| font-display | `swap` |
| 適用方法 | `@font-face` 定義 + `--font-ui` / `--font-display` の fallback として参照 |

**ルール**:
- Noto Sans JP は使用しない（Source Han Sans JP に置換済み）
- 英字 UI は引き続き Hanken Grotesk が primary
- CJK 文字はスタック内 fallback で Source Han Sans JP に自動フォールバック

**関連 CSS 変数（tokens.css）**:

```css
--font-ui: "Hanken Grotesk", "Source Han Sans JP", system-ui, sans-serif;
--font-display: "Newsreader", "Source Han Sans JP", Georgia, serif;
--font-city-heading-time: "Newsreader", "Source Han Sans JP", Georgia, serif;
```

---

## [UPDATE] ローカライズルール ✅（新規セクション推奨）

### 都市名表示

| 条件 | 表示 |
|---|---|
| `lang === "ja"` | `city.nameJa` |
| `lang === "en"` | `city.name` |

**実装**: 必ず `getCityDisplayName(city, lang)` を使用する（`src/lib/cities.ts`）  
**禁止**: 画面ごとに `city.name` / `city.nameJa` を直書きしない

**適用済み画面**:
- TimeTable（City heading）
- TagBar
- CitySearch / HomeCity / Settings / GroupEditor / Onboarding
- TimeSearch modal（タグ・コンボ）

### 文言（ja）

| キー | 値 | 備考 |
|---|---|---|
| `timeSearch.title` | `時間検索` | 旧「時間を検索」から短縮 |

### 日付フォーマット（2系統）

| 用途 | 関数 | ja | en |
|---|---|---|---|
| City heading 日付（列ヘッダー） | `formatDateHeading()` | `{YYYY}/{M}/{D}（{曜}）` 例: `2026/6/26（金）` | `EEE, MMM d` 例: `Thu, Jun 26` |
| Time box 内 Date Tag（00:00 スロット） | `formatDateTag()` | `{M}/{D}（{曜}）` 例: `6/26（金）` ※年なし | `EEE, MMM d` |
| CalendarDatePicker（Time Search 内） | date-fns locale | `yyyy年M月d日` / `yyyy年M月` | `MMM d, yyyy` / `MMMM yyyy` |

**Date Tag ルール**:
- 00:00 スロットのみ表示（既存ルール維持）
- 列ヘッダーと Date Tag でフォーマット関数を分ける（混同禁止）
- 日本語の曜日括弧は **全角** `（金）`

---

## [UPDATE] §3 City heading — 都市名 ellipsis ✅

**既存 §3 Typography 行の後に追記**:

| 要素 | 追加ルール |
|---|---|
| `.headingCityName` | `flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; height: 20px; line-height: 20px` |
| アクセシビリティ | `title` 属性に `{countryFlag} {cityName}` 全文を設定（省略時ホバーで確認） |

**Do**: 長い都市名（日本語含む）は1行 ellipsis  
**Don't**: 折り返し（wrap）で heading 高さを押し広げない

---

## [UPDATE] §5 Date Tag — フォーマット・サイズ ✅

**既存 §5 の「寸法 90×20px」行を以下に REPLACE**:

| プロパティ | 値 |
|---|---|
| 高さ | `20px`（固定） |
| 幅 | **hug（コンテンツ幅）** — `inline-flex`、`width` 指定なし |
| padding | `0 8px` |
| BG | `--color-surface-subtle` |
| テキスト色 | `--color-text-date-tag` |
| Typography | 12px / weight `600` |
| Radius | `--radius-date-badge`（8px） |
| flex-shrink | `0` |

**テキスト内容（locale 別）**:

| locale | 形式 | 例 |
|---|---|---|
| ja | `M/D（曜）` | `6/26（金）` |
| en | `EEE, MMM d` | `Thu, Jun 26` |

**撤回済み ❌（採用しない）**:
- `--date-tag-width: 88px` による固定幅
- 理由: 日英混在・文字数差でレイアウト崩れが目立つため

---

## [UPDATE] §15 Modal — 配置 ✅

**既存記載と一致（確認用・変更不要）**:

| プロパティ | 値 |
|---|---|
| overlay align-items | `flex-start`（上端固定） |
| overlay justify-content | `center` |
| 意図 | モーダル内容の高さ変化でダイアログが縦中央からずれない |

**Time Search 複数候補タブ**:
- dialog に `modalWide` クラス → `width: min(580px, 100%)`

---

## [UPDATE] TagBar — 折りたたみ ✅

**「レイアウトシステム > TagBar の構造（詳細）」に追記**:

| 項目 | ルール |
|---|---|
| 折りたたみトグル | **全画面幅で表示**（PC でもモバイルでも） |
| 初期状態 | 640px 以下: 折りたたみ（collapsed） / 641px 以上: 展開 |
| 折りたたみ時 | `.barCollapsed { display: none }` でタグ行非表示 |
| トグル UI | `.collapseToggle` — 13px / weight 600 / 高さ 32px |

---

## [ADD] §18 Display City Tag（Time Search 用）✅

Figma node: ❌ 未定義（コードのみ）

**用途**: Time Search modal 内で「表示中の都市」をタグ選択する UI  
**使用箇所**:
- 単一日時タブ → 対象都市（トグル選択）
- 複数候補タブ → 基準都市（単一選択）・対象都市（複数トグル）

### ベーススタイル（`.displayCityTag`）

| プロパティ | 値 | CSS 変数 |
|---|---|---|
| display | `inline-flex` | — |
| height | `28px` | — |
| padding | `0 12px` | — |
| border-radius | `999px`（pill） | — |
| border | 1px solid | `--color-border-strong` |
| background | `transparent` | — |
| font-size | `11px` | — |
| font-weight | `600` | — |
| color | — | `--color-text-primary` |
| gap（コンテナ） | `8px` | `--space-inset-sm` |

### 選択状態（`.displayCityTagSelected`）

| プロパティ | 値 |
|---|---|
| background | `--color-surface-segment-active` |
| color | `--color-text-segment-active` |

### ホーム都市（`.displayCityTagHome.displayCityTagSelected`）

| プロパティ | 値 |
|---|---|
| border-color | `--color-border-strong` |
| ラベル prefix | `🏠` + 国旗 + 都市名 |

### インタラクション

| タブ | 選択モード | 動作 |
|---|---|---|
| 単一日時・対象都市 | 単一（トグル） | クリックで選択 / 再クリックで解除 |
| 複数候補・基準都市 | 単一 | クリックで基準都市変更 |
| 複数候補・対象都市 | 複数（トグル） | クリックで追加/削除。上限 10 都市 |

**除外ルール**:
- 基準都市は対象都市タグから除外
- 基準都市変更時、対象リストから新基準都市を自動除外

---

## [ADD] §19 Time Search Modal — フィールド構成 ✅

Figma node: ❌ 未定義（コードのみ）  
**ファイル**: `src/features/time-search/TimeSearchModal.tsx`, `MultiCandidatePanel.tsx`

### 共通 UI パターン

| 要素 | スタイル | 用途 |
|---|---|---|
| `.label` | 12px / weight 600 / `--color-text-muted` | フィールド見出し |
| `.fieldHint` | 11px / `--color-text-muted` / margin-bottom 10px | ラベル直下の説明文 |
| `.subLabel` | 11px / weight 600 / `--color-text-muted` | グループタグ見出し等 |
| Segment tabs | §7 Toggle/Segment control と同一パターン | 単一日時 / 相対 / 複数候補 |

### 単一日時タブ

| フィールド | UI | デフォルト |
|---|---|---|
| 基準都市 | CityCombo | ホーム都市 |
| 対象都市 | Display City Tag + CityCombo | 未選択（任意） |
| 日付 | CalendarDatePicker | ホーム TZ の今日 |
| 時刻 | hour + minute select | 現在時刻（分は 0 or 30） |

**対象都市 placeholder（ja）**: `都市を検索して追加...`

### 複数候補タブ

| フィールド | UI | デフォルト |
|---|---|---|
| 基準都市 | Display City Tag + CityCombo | **ホーム都市** |
| 基準都市ヒント（ja） | fieldHint | `下記から選択するか、検索して基準都市を選択してください。` |
| 日程候補 | 日付 + 開始/終了時刻（最大 10） | 1 件 |
| 対象都市 | Display City Tag + Group Tag + 選択済み chip + CityCombo | **表示中都市（基準除く）** |
| 対象都市ヒント（ja） | fieldHint | `下記から選択するか、検索して追加してください。` |

### 対象都市 — 選択済み chip（`.targetTag`）

Display City Tag とは別。検索追加分も含め **選択中の全都市** を表示。

| プロパティ | 値 |
|---|---|
| height | `34px` |
| padding | `0 10px 0 12px` |
| border-radius | `--radius-control` |
| border | 1px `--color-border-default` |
| background | `--color-surface-control-tag` |
| font-size | `14px` / weight `600` |
| 削除 | × ボタン（IconClear 12px） |

### グループタグ（`.groupTag`）

| 状態 | 見た目 |
|---|---|
| 通常 | pill / 11px 600 / border `--color-border-strong` |
| 追加済み | opacity `0.4` + `disabled` + `--groupTagAdded` |

---

## [UPDATE] Do / Don't — 追記行

| Do ✅ | Don't ❌ |
|---|---|
| 日本語都市名は `getCityDisplayName()` を使う | `city.name` / `city.nameJa` を画面直書きする |
| Date Tag（スロット内）は `formatDateTag()` を使う | 列ヘッダー用 `formatDateHeading()` をスロット内に流用する |
| Date Tag 幅は hug（コンテンツ幅）にする | Date Tag に固定 width を指定する |
| Modal overlay は `align-items: flex-start` で上端固定 | 高さ可変モーダルを `center` 配置のままにする |
| TagBar 折りたたみトグルは全 BP で表示 | PC のみトグルを非表示にする |
| Time Search の都市選択は Tag + Search の併用 | Search のみ / Tag のみに限定しない |

---

## [UPDATE] Appendix — コンポーネント一覧 追記

| コンポーネント名 | Figma node | ステータス | 備考 |
|---|---|---|---|
| Display City Tag | — | ✅ コード実装 | Time Search 専用。§18 参照 |
| Time Search modal | — | ✅ 実装済み | 単日/相対/複数候補。§19 参照 |

---

## [META] 変更サマリー（人間向け）

| カテゴリ | 変更内容 |
|---|---|
| Typography | Source Han Sans JP 導入 |
| Localization | 都市名 ja/en 切替、Date Tag 短縮表記、Calendar 和暦風表記 |
| Timeline | City heading ellipsis、Date Tag `6/26（金）` |
| Modal | 上端固定（既存）、Time Search wide 580px |
| TagBar | PC でも折りたたみ |
| Time Search | Display City Tag パターン、複数候補の基準/対象 UX |
| Rejected | Date Tag 固定幅 88px |

---

## Claude への渡し方（例）

```
DesignSystem.md を更新してください。

1. docs/design-system-changelog-2026-06-27.md の Edit strategy に従う
2. [UPDATE] セクションは既存該当箇所を上書き
3. [ADD] §18 / §19 はコンポーネント仕様末尾に追加
4. 「ローカライズルール」はタイポグラフィ直後に新設
5. Last updated を 2026-06-27 に更新
```
