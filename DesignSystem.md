# nanji? Design System

**Version**: 6.1（モバイルRange panel初期スナップをhalfに変更）
**Last updated**: 2026-07-18
**Product**: nanji? — World timezone comparison web application

---

## このドキュメントの使い方

このドキュメントは、これから新しい機能・画面をつくるときに既存のUIと一貫したルールを適用するための参照。今の画面を一つ一つ事細かに記録するドキュメントではなく、「次に何かをつくるとき何を再利用すべきか」を示すルールブックとして書いている。

**使い方**:
1. 新しい要素を実装するとき → 「コンポーネント」の Usage / Best practices / Properties を参照する
2. 色・余白・角丸・影・フォントを決めるとき → 必ず「デザイントークン」のCSS変数を使う。新しい値を作らない
3. 新しいページをつくるとき → 「ページ構成ルール」に従う
4. 判断に迷ったとき → 各セクションの Best practices（Do / Don't）を確認する

**マーカー**:
- 🆕 既存ルール外 — 既存のトークン・パターンのどれにも当てはまらない実装。次にこの領域を触るときに「新ルールとして正式採用する」か「既存ルールに合わせて直す」かを判断する対象。

---

## Design Philosophy

A design system that prioritizes consistency, adaptability, and developer experience. Every decision flows from a few core ideas:

- **Components over primitives**: use components for everything they cover before reaching for raw HTML
- **Semantic tokens over hardcoded values**: colors, spacing, and radii are named by purpose, not appearance
- **Theme-agnostic code**: your app code never references specific colors or measurements, so themes and dark mode work automatically
- **Open internals**: every primitive is exported and composable, so you can build on top of it without fighting it

---

## デザイントークン

トークンは3層構造：**Primitive**（素材となる値のセット）→ **Semantic**（役割ごとの意味づけ）→ **Component**（各コンポーネントでの適用）。新しい色・余白・フォントが必要になったときは、まずPrimitiveから選び、Semanticとして命名してから使う。値を直接ハードコードしない。

### カラー — Primitive

**Neutral**（無彩色スケール、19段階）。すべてのSemanticカラートークンはここから参照する。値が空欄のステップ（350/400/450/550/650/700/800/850/950）はFigmaから未取得。値を作り出さず、確定次第追加する。**現在参照されているかどうかに関わらず、Primitiveは今後のデザインの材料として全て残す。**

| CSS変数 | Hex |
|---|---|
| `--neutral-40` | `#ffffff` |
| `--neutral-100` | `#f6f8fd` |
| `--neutral-150` | `#e9ebf0` |
| `--neutral-200` | `#dcdee3` |
| `--neutral-250` | `#cfd1d6` |
| `--neutral-300` | `#c3c5ca` |
| `--neutral-350` | — |
| `--neutral-400` | — |
| `--neutral-450` | — |
| `--neutral-500` | `#909297` |
| `--neutral-525` | `#83858a` |
| `--neutral-550` | — |
| `--neutral-600` | `#5d5f64` |
| `--neutral-650` | — |
| `--neutral-700` | — |
| `--neutral-750` | `#36383d` |
| `--neutral-800` | — |
| `--neutral-850` | — |
| `--neutral-900` | `#101217` |
| `--neutral-950` | — |
| `--neutral-ext-1` 🆕 | `#fdffff` |
| `--neutral-ext-2` 🆕 | `#3d424d` |
| `--neutral-ext-3` 🆕 | `#2f323a` |
| `--neutral-ext-4` 🆕 | `#2a2e38` |
| `--neutral-ext-5` 🆕 | `#2a2c31` |
| `--neutral-ext-6` 🆕 | `#b0b2b8` |
| `--neutral-ext-7` 🆕 | `#1c1e24` |
| `--neutral-ext-8` 🆕 | `#171a21` |

🆕 `--neutral-ext-*`：ダークモードのSemanticトークンが参照している実在の値だが、19段階の`/NNN`ステップ番号のどこにも対応しない（`350`〜`950`の空きスロット数より値の数が多く、単純な一連の階調では説明がつかない＝おそらくFigma側でダークモード用に個別に選定された色）。次にこの領域を触るときに、Figmaの正式なステップ番号を確認して統合するか、独立したダークモード用Primitiveとして正式に採用するかを検討する。

**Time**（時刻グラデーション用スケール、24段階）。1時間 = 1ステップ。**UI surface（カード・ボタン・背景）には使わない。時刻スロット背景専用。**

| Token | Hex | 時刻 | 背景の明暗 |
|---|---|---|---|
| `Time/50` | `#1c2a4c` | 00:00 | 暗い |
| `Time/100` | `#20294b` | 01:00 | 暗い |
| `Time/150` | `#2f385e` | 02:00 | 暗い |
| `Time/200` | `#374069` | 03:00 | 暗い |
| `Time/250` | `#626187` | 04:00 | 暗い |
| `Time/300` | `#8c82a5` | 05:00 | 暗い |
| `Time/350` | `#f5c8c3` | 06:00 | 明るい |
| `Time/400` | `#ffd7af` | 07:00 | 明るい |
| `Time/450` | `#f5ebd2` | 08:00 | 明るい |
| `Time/500` | `#f0f2da` | 09:00 | 明るい |
| `Time/550` | `#ebf8e1` | 10:00 | 明るい |
| `Time/600` | `#e6f8dc` | 11:00 | 明るい |
| `Time/650` | `#ffe478` | 12:00 | 明るい |
| `Time/700` | `#ffd66c` | 13:00 | 明るい |
| `Time/750` | `#ffc85f` | 14:00 | 明るい |
| `Time/800` | `#ffbc58` | 15:00 | 明るい |
| `Time/850` | `#ffaf50` | 16:00 | 明るい |
| `Time/900` | `#ff9646` | 17:00 | 明るい |
| `Time/950` | `#ff6e46` | 18:00 | 明るい |
| `Time/1000` | `#eb504b` | 19:00 | 明るい |
| `Time/1050` | `#be4655` | 20:00 | 明るい |
| `Time/1100` | `#9a3d51` | 21:00 | 明るい |
| `Time/1150` | `#562c4a` | 22:00 | 暗い |
| `Time/1200` | `#322346` | 23:00 | 暗い |

### カラー — Semantic

> `color.surface.default`（`#fdffff`）は純白（`#ffffff`）とは異なる値。同一視しない。

**テーマ切り替えの仕組み**: `<html data-theme="dark">` で切り替わる。CSSのカスケードにより`:root`のライト値が`[data-theme="dark"]`セレクターで上書きされる。ライトモード（デフォルト）は属性なし、または`data-theme="light"`。`<meta name="color-scheme" content="light dark">`でブラウザUIの自動調整も有効。以下の表の「Dark」列が空欄（—）のトークンはダークモードでも上書きされず、Light値のまま。Timeパレット・accent・`--neutral-*`・`--color-timeline-slot-text`はページ全体として上書き対象外。

**Surface（背景）**

| CSS変数 | Primitive | Light | Dark |
|---|---|---|---|
| `--color-surface-default` | `Neutral-ext-1` | `#fdffff` | `#101217`（`Neutral/900`） |
| `--color-surface-elevated` | `Neutral/50` | `#ffffff` | `#1c1e24`（`Neutral-ext-7`） |
| `--color-surface-inverse` | `Neutral-ext-5` | `#2a2c31` | — |
| `--color-surface-subtle-dark` | `Neutral/525` × 50%α | `#83858a80` | — |
| `--color-surface-control-tag` | `Neutral/100` | `#f6f8fd` | `#2f323a`（`Neutral-ext-3`） |
| `--color-surface-control-action` | `Neutral/50` | `#ffffff` | `#2a2c31`（= `surface.inverse`と同値） |
| `--color-surface-control-primary` | `Neutral-ext-5` | `#2a2c31` | `#e9ebf0`（`Neutral/150`） |
| `--color-surface-segment-active` | `Neutral-ext-5` | `#2a2c31` | `#e9ebf0`（`Neutral/150`） |

**City heading専用エイリアス**（Home/Otherパターンの背景・枠線。Lightは`surface.inverse`/`surface.elevated`のエイリアスだが、Darkは独自のPrimitive値で上書きされる）

| CSS変数 | Light | Dark |
|---|---|---|
| `--color-surface-cityheading-home`（= `surface.inverse`のエイリアス） | `#2a2c31` | `#3d424d`（`Neutral-ext-2`） |
| `--color-surface-cityheading-other`（= `surface.elevated`のエイリアス） | `#ffffff` | `#171a21`（`Neutral-ext-8`） |
| `--color-border-cityheading-other` | `transparent` | `#2a2e38`（`Neutral-ext-4`） |

**Fade overlay**（Time frameのグラデーションフェード用。2系統ある）

| CSS変数 | Light | Dark | 使用箇所 |
|---|---|---|---|
| `--color-surface-fade-100` / `-0` | `#fdffff` / `#fdffff00` | `#101217` / `#10121700` | モバイル bottom fade レイヤー（`HomePage.module.css` `.bottomFade`） |
| `--color-timeline-fade-solid` / `-transparent` | `#fdffff` / `#fdffff00` | `#101217` / `#10121700` | Time frame本体の上下フェード（`TimeTable.module.css` `.fadeBottom`） |

**Switch**

| CSS変数 | Primitive | Light | Dark |
|---|---|---|---|
| `--color-surface-switch-off` | `Neutral/150` | `#e9ebf0` | `#5d5f64`（`Neutral/600`） |
| `--color-surface-switch-on` | `Neutral-ext-5`（= `surface.inverse`と同値） | `#2a2c31` | `#e9ebf0`（`Neutral/150`） |
| `--color-surface-switch-knob` | `Neutral/50` | `#ffffff` | — |
| `--color-surface-switch-knob-active` | `Neutral/50` | `#ffffff` | `#101217`（`Neutral/900`） |

**Business mode（時刻スロット3状態、ライト/ダーク共通・上書きなし）**

| CSS変数 | Hex | 時間帯 |
|---|---|---|
| `--color-timeslot-business-active` | `#eff0a4` | 09:00–16:00（就業中） |
| `--color-timeslot-business-inactive` | `#d8dfe9` | 06:00–08:00 / 17:00–21:00 |
| `--color-timeslot-business-offhour` | `#374069` | 00:00–05:00 / 22:00–23:00 |

**Shadow**（ダークは不透明度をrgba直指定。Elevationセクションも参照）

| CSS変数 | Light | Dark |
|---|---|---|
| `--shadow-card` | `0 8px 16px 0 #c3c5ca` | `0 8px 16px rgba(0,0,0,0.45)` |
| `--shadow-floating` | `0 4px 8px 0 #cfd1d6` | `0 4px 8px rgba(0,0,0,0.35)` |

**Text**

| CSS変数 | Primitive | Light | Dark |
|---|---|---|---|
| `--color-text-primary` | `Neutral/900` | `#101217` | `#f6f8fd`（`Neutral/100`） |
| `--color-text-inverse` | `Neutral/100` | `#f6f8fd` | — |
| `--color-text-muted` | `Neutral/500` | `#909297` | `#b0b2b8`（`Neutral-ext-6`） |
| `--color-text-on-primary` | `Neutral/100` | `#f6f8fd` | `#101217`（`Neutral/900`） |
| `--color-text-cityheadingtime` | `Neutral/750` | `#36383d` | `#dcdee3`（`Neutral/200`） |
| `--color-text-cityheading-home-time` | `Neutral/50` | `#ffffff` | — |
| `--color-text-cityheading-home-label` | `Neutral/200` | `#dcdee3` | — |
| `--color-text-cityheading-other-date` | `Neutral/600` | `#5d5f64` | `#909297`（`Neutral/500`） |
| `--color-text-timeslot-inverse` | `Neutral/50` | `#ffffff` | — |
| `--color-text-date-tag` | `Neutral/150` | `#e9ebf0` | — |
| `--color-timeline-slot-text` | `Neutral/900`（固定） | `#101217` | `#101217`（不変） |
| `--color-text-segment-active` | `Neutral/100` | `#f6f8fd` | `#101217`（`Neutral/900`） |

**Border**

| CSS変数 | Primitive | Light | Dark |
|---|---|---|---|
| `--color-border-default` | `Neutral/150` | `#e9ebf0` | `#5d5f64`（`Neutral/600`） |
| `--color-border-strong` | `Neutral/600` | `#5d5f64` | `#b0b2b8`（`Neutral-ext-6`） |
| `--color-border-subtle` | `Neutral/100` | `#f6f8fd` | `#2f323a`（`Neutral-ext-3`） |
| `--color-border-timeslot` | `Neutral/40` × 15%α | `#ffffff26` | — |
| `--color-border-timeslot-business` | Black × 6%α | `#0000000f` | — |

**Icon**

| CSS変数 | Primitive | Light | Dark |
|---|---|---|---|
| `--color-icon-default` | `Neutral/525` | `#83858a` | `#b0b2b8`（`Neutral-ext-6`） |
| `--color-icon-inverse` | `Neutral/50` | `#ffffff` | — |
| `--color-icon-on-primary` | `Neutral/50` | `#ffffff` | `#101217`（`Neutral/900`） |
| `--color-icon-segment-active` | `Neutral/40` | `#ffffff` | `#36383d`（`Neutral/750`） |

**Accent**（ライト/ダーク共通・上書きなし）

| CSS変数 | 値 | 用途 |
|---|---|---|
| `--color-accent-current-time` | `#e2483d` | 現在時刻ライン・バッジ背景・エラーテキスト・Destructiveボタンテキスト |

**Brand**

| CSS変数 | Light | Dark |
|---|---|---|
| `--logo-filter` | `none` | `brightness(0) invert(1)`（PNGを白反転） |

### タイポグラフィ

**フォントファミリー**

| CSS変数 | 値（en） | 値（ja、`html[lang="ja"]`） | 用途 |
|---|---|---|---|
| `--font-ui` | Hanken Grotesk → Source Han Sans JP | 同左 | UI全般（ラベル・ボタン・タグ・スロット） |
| `--font-display` | Newsreader → Source Han Sans JP | Hanken Grotesk → Source Han Sans JP | 見出し用プリミティブ。単体では直接参照されず`--font-modal-title`（ja時）の参照元 |
| `--font-city-heading-time` | Newsreader → Source Han Sans JP（言語に関わらず固定） | 同左 | City heading時刻大表示専用 |
| `--font-modal-title` | Bricolage Grotesque | `= --font-display`（Hanken Grotesk + Source Han Sans JP） | Modal・SidePanelタイトル専用 |

```css
/* tokens.css */
--font-ui: "Hanken Grotesk", "Source Han Sans JP", system-ui, sans-serif;
--font-display: "Newsreader", "Source Han Sans JP", Georgia, serif;
--font-modal-title: "Bricolage Grotesque", system-ui, sans-serif;
--font-city-heading-time: "Newsreader", "Source Han Sans JP", Georgia, serif;

html[lang="ja"] {
  --font-ui: "Hanken Grotesk", "Source Han Sans JP", system-ui, sans-serif;
  --font-display: "Hanken Grotesk", "Source Han Sans JP", Georgia, serif;
  --font-modal-title: var(--font-display);
}
```

**フォントインポート（`global.css`）**: `@fontsource/hanken-grotesk`(400/500/600), `@fontsource/bricolage-grotesque`(500), `@fontsource/newsreader`(500)、および `Source Han Sans JP`（`/public/fonts/SourceHanSansJP-VF.woff2`、weight 100–900可変、`@font-face` + fallback指定）。

**ルール**: Noto Sans JP は使用しない。英字UIは常にHanken Grotesk primary、CJK文字はスタック内fallbackで自動切替。

**Primitive Text Styles**（Semanticトークンの参照元となる素材セット。`Text/`はHanken Grotesk、`Heading/`はNewsreader系。空欄は未確定 = 新しい見出しサイズが必要な場合はこのリストの空きステップから選び値を確定させてから使う。値を新規に作り出さない）

| Style名 | size | weight | lineHeight |
|---|---|---|---|
| `Text/Bold/XS` | 12px | 600 | 1.3 |
| `Text/Bold/S` | 14px | 600 | 1.3 |
| `Text/Bold/M` | 16px | 600 | 1.3 |
| `Text/Bold/L` | — | 600 | 1.3 |
| `Text/Bold/XL` | — | 600 | 1.3 |
| `Text/Bold/2XL` | — | 600 | 1.3 |
| `Text/Bold/3XL` | — | 600 | 1.3 |
| `Text/Bold/4XL` | — | 600 | 1.3 |
| `Text/Bold/5XL` | — | 600 | 1.3 |
| `Text/Regular/XS` | 12px | 400 | 1.3 |
| `Text/Regular/S` | — | 400 | 1.3 |
| `Text/Regular/M` | 16px | 400 | 1.3 |
| `Text/Regular/L` | — | 400 | 1.3 |
| `Text/Regular/XL` | — | 400 | 1.3 |
| `Text/Regular/2XL` | — | 400 | 1.3 |
| `Text/Regular/3XL` | — | 400 | 1.3 |
| `Text/Regular/4XL` | — | 400 | 1.3 |
| `Text/Regular/5XL` | — | 400 | 1.3 |
| `Heading/Regular/XS` | — | 500 | 1.3 |
| `Heading/Regular/S` | — | 500 | 1.3 |
| `Heading/Regular/M` | — | 500 | 1.3 |
| `Heading/Regular/L` | — | 500 | 1.3 |
| `Heading/Regular/XL` | — | 500 | 1.3 |
| `Heading/Regular/2XL` | 24px | 500 | 1.3 |
| `Heading/Regular/3XL` | — | 500 | 1.3 |
| `Heading/Regular/4XL` | 40px | 500 | 1.0（例外） |
| `Heading/Regular/5XL` | — | 500 | 1.3 |

**セマンティックマッピング**（実際に使われているスタイル）

| 用途 | Text Style | 実装 |
|---|---|---|
| City heading 時刻（大） | `Heading/Regular/4XL` | `--font-city-heading-time`, 40px/500（mobile: 36px） |
| Modal / SidePanel タイトル | `Heading/Regular/2XL` | `--font-modal-title`, 24px/500 |
| City heading 都市名・City tag・Toggle | `Text/Bold/S`〜`M` | `--font-ui`, 14–16px/600 |
| City heading 日付・スロットラベル | `Text/Regular/XS`〜`M` | `--font-ui`, 12–16px/400 |
| Date tag・Now badge・ラベル小 | `Text/Bold/XS` | `--font-ui`, 12px/600 |

### ローカライズ

**都市名**: `lang === "ja"` なら `city.nameJa`、`en` なら `city.name`。必ず `getCityDisplayName(city, lang)`（`src/lib/cities.ts`）を使う。画面ごとに `city.name` / `city.nameJa` を直書きしない。

**日付フォーマット**（用途別に関数を分ける。混同しない）

| 用途 | 関数 | ja | en |
|---|---|---|---|
| 列ヘッダー日付 | `formatDateHeading()` | `2026/6/26（金）` | `Thu, Jun 26` |
| Date Tag（00:00スロット） | `formatDateTag()` | `6/26（金）`（年なし） | `EEE, MMM d` |
| CalendarDatePicker | date-fns locale | `yyyy年M月d日` | `MMM d, yyyy` |

日本語の曜日括弧は全角 `（金）`。

**フォント・文言**: UI文言はすべてi18nキーで管理し直書きしない（詳細はタイポグラフィの言語別オーバーライド参照）。

---

## Spacing

### Primitive — Numbers

Figma Variables `Numbers/*` のT-shirtサイズ数値スケール。Semanticなspaceトークンはここから参照する。一部のみFigmaで確定済み。**現在参照されているかどうかに関わらず、今後の材料として全ステップを残す。**

| Figma Variable名 | 値 | 確認状態 |
|---|---|---|
| `Numbers/5XS` | `0` | 確定（Shadow offset x / spread） |
| `Numbers/3XS` | `4px` | 確定（Shadow offset y、Elevation/S） |
| `Numbers/2XS` | `8px` | 確定（Shadow offset y、Elevation/M・gap） |
| `Numbers/XS` | — | 未取得 |
| `Numbers/S` | — | 未取得 |
| `Numbers/M` | `16px` | 確定（Shadow blur、Elevation/M・padding） |
| `Numbers/L` | — | 未取得 |
| `Numbers/XL` | — | 未取得 |

### Semantic

| CSS変数 | 値 | Primitive | 用途 |
|---|---|---|---|
| `--space-page-edge` | `16px` | `Numbers/M` | ページ端のpadding |
| `--space-column-gap` | `8px` | `Numbers/2XS` | City column間のgap |
| `--space-inset-sm` | `8px` | `Numbers/2XS` | 内部padding（小） |
| `--space-inset-md` | `16px` | `Numbers/M` | 内部padding（中）・Shadow blur |

**Layout constants**

| CSS変数 | 値 | 用途 |
|---|---|---|
| `--column-width` | `176px` | City columnの幅 |
| `--time-slot-height` | `42px` | 1スロットの高さ |
| `--time-slots-per-day` | `24` | 1日のスロット数 |
| `--time-cycle-height` | `1008px` | グラデーション1サイクル高（24 × 42px） |
| `--city-heading-height` | `118px`（mobile: `114px`） | City headingの高さ |
| `--city-heading-overlap` | `16px` | City heading → Time frameのオーバーラップ量 |
| `--navbar-height` | `97px` | NavBarの高さ |
| `--tagbar-height` | `85px` | TagBarの高さ |
| `--bottom-bar-height` | `122px` | Bottom bar の高さ |
| `--shadow-card-bleed` | `24px` | shadow-card のblur + offset 合計 |
| `--range-selection-panel-width` | `580px` | Convert / Jump SidePanel の幅（デスクトップ） |
| `--timeline-date-tag-sticky-top` | `calc(--city-heading-overlap + 11px)` | タイムライン内 sticky Date Tag の上端オフセット |

**カラムグリッド**: カラム幅 `176px`、間隔 `8px`、左端padding `16px`、stride `184px`（176+8）、**最大10カラム**。N番目の都市の左端X座標 = `16 + (N-1) × 184` px。

---

## Shape

| CSS変数 | 値 | 適用コンポーネント |
|---|---|---|
| `--radius-card` | `16px` | City heading card・Time frame |
| `--radius-button` | `16px` | Button類・Input・Select・Popover・Modal内フォームコントロール |
| `--radius-control` | `999px`（pill） | タグ・Toggle・Segment container・Toggle Switch |
| `--radius-date-badge` | `8px` | Date tag・Now badge・CalendarDatePicker日付セル |
| `--radius-modal` | `24px` | Modal dialog・SidePanel |

`--radius-button`はButtonに限らず、すべてのフォーム系インタラクティブ要素の統一角丸として使う。

---

## Elevation

**Shadow**

| CSS変数 | 値 | 適用先 |
|---|---|---|
| `--shadow-card` | `0 8px 16px 0 #c3c5ca` | City heading card・Modal dialog |
| `--shadow-floating` | `0 4px 8px 0 #cfd1d6` | Button_Primary icon-only・TagBar Save button・Popover |

**Z-index**

| CSS変数 | 値 | 配置要素 |
|---|---|---|
| `--z-base` | 0 | 時刻スロット背景 |
| `--z-raised` | 10 | 現在時刻インジケーター |
| `--z-sticky` | 100 | NavBar・TagBar |
| `--z-bottom-fade` | 140 | Time frame下フェードオーバーレイ（モバイル） |
| `--z-floating` | 150 | Bottom bar |
| `--z-range-panel` | 160（`floating + 10`） | Convert / Jump SidePanel |
| Convert / Jump tabs | 161（`range-panel + 1`） | TimelineSideTabs |
| `--z-modal` | 190（`range-panel + 30`） | Modal overlay（設定など） |
| `--z-popover` | 200（`modal + 10`） | CalendarDatePicker popover |
| `--z-toast` | 9999 | Snackbar |

---

## Motion

```css
--duration-base:  200ms
--duration-slow:  350ms
--duration-modal: 240ms
--easing-standard: cubic-bezier(0.4, 0, 0.2, 1)
--easing-modal:    cubic-bezier(0.33, 1, 0.68, 1)

/* TagBar collapse/expand専用 */
--duration-liquid-squish: 130ms
--duration-liquid-expand: 260ms
--duration-liquid:         420ms
--easing-liquid-squish: cubic-bezier(0.55, 0, 0.85, 0.45)
--easing-liquid-expand: cubic-bezier(0.22, 1, 0.36, 1)
```

| 用途 | duration | easing |
|---|---|---|
| hover時の色変化・Toggle active | `base` | `standard` |
| Business/Defaultモード切替 | `slow` | `standard` |
| Modal / SidePanel 入退場 | `modal` | `modal` |
| Segment indicator・Toggle Switchノブ移動 | `base` | `standard` |
| TagBar 折りたたみ（squish）/ 展開（expand） | `liquid-squish` / `liquid-expand` | 同名 |

Modal入退場: Overlay `opacity 0→1` + `backdrop-filter blur(0)→blur(3px)`、Dialog `opacity 0→1` + `filter blur(12px)→0` + `scale(0.988)→1`。`prefers-reduced-motion: reduce`で全transition無効化。

---

## グラデーション実装

グラデーションは**スロット（`.slot`）単位**で適用する。Time frame列全体には適用しない。

```css
/* tokens.css */
--gradient-time-of-day: linear-gradient(
  to bottom,
  #1c2a4c 0%, #1c2a4c 2.083%, #20294b 6.25%, #2f385e 10.417%,
  #374069 14.583%, #626187 18.75%, #8c82a5 22.917%, #f5c8c3 27.083%,
  #ffd7af 31.25%, #f5ebd2 35.417%, #f0f2da 39.583%, #ebf8e1 43.75%,
  #e6f8dc 47.917%, #ffe478 52.083%, #ffd66c 56.25%, #ffc85f 60.417%,
  #ffbc58 64.583%, #ffaf50 68.75%, #ff9646 72.917%, #ff6e46 77.083%,
  #eb504b 81.25%, #be4655 85.417%, #9a3d51 89.583%, #562c4a 93.75%,
  #322346 97.917%, #322346 100%
);
```

```css
.slotDefault {
  background-image: var(--gradient-time-of-day);
  background-size: 100% 1008px;        /* 24スロット × 42px */
  background-repeat: repeat-y;
  background-position-y: calc(var(--slot-local-hour) * -1 * 42px);
}
```

`--slot-local-hour`にはそのスロットが表す都市のローカル時（`0`〜`23`の整数）をインラインstyleで渡す。

```html
<div class="slot slotDefault" style="--slot-local-hour: 14;">14:00</div>
```

**時刻テキスト色**（Default mode）: 00:00–05:00 と 18:00–23:00 は白（`--color-text-timeslot-inverse`）、06:00–17:00 は黒（`--color-text-primary`）。Business modeでは `active`/`inactive` は黒、`offhour` は白。

---

## ページ構成ルール

新しいページは以下の4層構造を使う。

```
NAV BAR    height: fit-content（≈97px）
TAG BAR    height: fit-content
TIME TABLE height: 可変（viewport残余）
BOTTOM BAR position: absolute; bottom: 0; z-index: --z-floating
```

**City bundle**（各都市の縦構造）: City heading（176×118px カード）の`margin-bottom: -16px`（`--city-heading-overlap`）でTime frameと16px重なって接続される。

**TagBar折りたたみ**: 折りたたみトグルは全画面幅（PC・モバイル共通）で常時表示する。初期状態は640px以下で折りたたみ、641px以上で展開。

**新しいページを作るときのチェック**:
- [ ] 4層構造（NavBar / TagBar / TimeTable / BottomBar）を使う
- [ ] TimeトークンをUI surface（カード・ボタン・背景）に使わない。時刻スロット背景専用
- [ ] フォントサイズは Primitive Text Styles の値のいずれかを使う（新しい値を作らない）
- [ ] タグ・コントロールは `--radius-control`、Button類は `--radius-button`、Modal/SidePanelは `--radius-modal`
- [ ] Business modeは3状態（active / inactive / offhour）すべて実装する
- [ ] アイコンは `currentColor` で色を継承させる（例外は City Tag の `Icon_Show` のみ）
- [ ] 日本語都市名は `getCityDisplayName()` を使う

---

## コンポーネント

### Logo

**Usage**: NavBar左端に常設するブランドロゴ。

**Best practices**
- Do: `filter: var(--logo-filter)` を必ず適用し、ダークモードでの反転に対応させる
- Don't: 色反転をJSやSVG差し替えで実装しない（CSS filterで完結させる）

**Properties**

| Prop | 値 |
|---|---|
| 表示高 | `32px`（デスクトップ）/ `24px`（モバイル≤640px） |
| 形式 | `<img>`（PNG） |

```css
.logo {
  height: 32px;
  filter: var(--logo-filter);
}
```

---

### City Tag

**Usage**: TagBarで各都市を表す操作可能なタグ。表示/非表示・削除・グループ追加をこの上で行う。ホームバリアントと通常都市バリアントがある。

**Best practices**
- Do: グループビュー中のtemp都市（グループ未登録）には削除・表示切替・グループ追加の3アイコンを出す
- Do: `Icon_Show`のみfill、他は`currentColor`のstroke
- Don't: Hidden状態の判定をアイコンだけに頼らない（テキスト色も`text.muted`に変える）

**Properties**

**共通**: Height `34px`・Radius `--radius-control`（pill）・Typography `Text/Bold/S`（14px/600）・padding-y `8px`

**Homeバリアント**

| プロパティ | 値 |
|---|---|
| BG | `--color-surface-control-primary`（`#2a2c31`） |
| テキスト色 | `--color-text-on-primary` |
| アイコン色 | `--color-icon-on-primary` |
| Border | なし |
| padding-left / padding-right | `14px`（Icon_Home左）/ `16px` |
| gap | `8px` |
| アイコン | `Icon_Home`（左）・`Icon_Clear`（左） |

**Cityバリアント（State / Group view / In group、6パターン）**

アイコン表示ロジック（コード実態）:
- `showRemove` = グループビューでない、またはtemp都市（グループ未登録で追加した都市）
- `showAddToGroup` = グループビュー中 && temp都市
- `useStrongBorder` = グループビュー中 && グループ登録済み都市

| State | Group view | In group | BG | Border | テキスト色 | アイコン（左→テキスト→右） |
|---|---|---|---|---|---|---|
| Visible | False | False | `control.tag` | 1px `border.default` | `text.primary` | `Icon_Clear`・cityname・`Icon_Show` |
| Visible | True | True | `control.tag` | 1px `border.strong` | `text.primary` | cityname・`Icon_Show` |
| Visible | True | False（temp） | `control.tag` | 1px `border.default` | `text.primary` | `Icon_Clear`・cityname・`Icon_Show`・`Icon_Add` |
| Hidden | False | False | `control.tag` | 1px `border.default` | `text.muted` | `Icon_Clear`・cityname・`Icon_Hide` |
| Hidden | True | True | `control.tag` | 1px `border.strong` | `text.muted` | cityname・`Icon_Hide` |
| Hidden | True | False（temp） | `control.tag` | 1px `border.default` | `text.muted` | `Icon_Clear`・cityname・`Icon_Hide`・`Icon_Add` |

> グループビュー中にグループ未登録都市（temp）は**3アイコン**構成: `Icon_Clear`（左）・表示切替（右1）・`Icon_Add`（右2）。

padding-left: `16px`、padding-right: `14px`（アイコン右）、gap: `4px`（Homeバリアント以外）

---

### Add City / Clear All

**Usage**: TagBarの都市追加・一括クリア操作。City Tagと同じpillパターンを使うが、都市を表さないアクション用コントロール。

**Best practices**
- Do: Add Cityは`Blinking`バリアント（`box-shadow`パルス、`animation: blink 1.8s infinite`）で初回ユーザーの注意を引ける
- Don't: 都市追加・削除以外の汎用ボタンにこのパターンを流用しない（Button_Secondaryを使う）

**Properties**

| Prop | Add City | Clear All |
|---|---|---|
| Height | `34px` | `34px` |
| Border | 1px **dashed** `--color-border-default` | 1px **solid** `--color-border-default` |
| Radius | `--radius-control` | `--radius-control` |
| padding | `8px 16px 8px 14px` | `8px 16px 8px 14px` |
| Typography | `Text/Bold/S` | `Text/Bold/S` |
| Icon | `Icon_Add`（16px） | `Icon_ClearAll`（16px） |

---

### City Heading

**Usage**: 各都市列の先頭に置くカード。ホーム都市は常にダークで強調表示し、他都市はライトな背景にする（デザイン原則2「ホーム都市がすべての基準」）。

**Best practices**
- Do: 長い都市名（日本語含む）は1行ellipsisで省略し、`title`属性に`{国旗} {都市名}`全文を設定する
- Don't: 都市名の折り返し（wrap）でheading高さを押し広げない

**Properties**

| Prop | 値 |
|---|---|
| 寸法 | `176 × 118px`（モバイル: `114px`） |
| Radius / Shadow | `--radius-card` / `--shadow-card` |
| Padding / gap | `16px`（全辺） / `8px` |
| margin-bottom | `-16px`（Time frameとのオーバーラップ） |
| 時刻大表示 | `--font-city-heading-time`, 40px/500（mobile 36px） |
| 都市名 | `--font-ui`, 16px/600 |
| 日付 | `--font-ui`, 12px/400 |

| Variant | BG | Border | 時刻色 | 都市名色 | 日付色 | 左アイコン色 |
|---|---|---|---|---|---|---|
| Home | `--color-surface-cityheading-home` | なし | `--color-text-cityheading-home-time` | `--color-text-cityheading-home-label` | `--color-text-cityheading-home-label` | `--color-icon-on-primary` |
| Other | `--color-surface-cityheading-other` | `--color-border-cityheading-other`（light: transparent / dark: `#2a2e38`） | `--color-text-cityheadingtime` | `--color-text-primary` | `--color-text-cityheading-other-date` | — |

```css
.headingCityName {
  flex: 1; min-width: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  height: 20px; line-height: 20px;
}
```

---

### Timeline（Time Box / Date Tag / Time Frame）

**Usage**: nanji?の中核体験。1都市 = 24個のTime Boxを縦積みしたTime Frame。Default modeでは時刻グラデーション、Business modeでは3状態カラーを表示する。

**Best practices**
- Do: グラデーションは必ずスロット単位（`repeat-y`）で適用する
- Do: Date TagはHug幅（コンテンツ幅）にし、固定widthを指定しない（日英で文字数が変わるため）
- Do: Date Tagは`formatDateTag()`、列ヘッダーは`formatDateHeading()`と関数を分ける
- Don't: Time Boxに`width: 176px`を直接指定しない（`width: 100%`が正しい。親のColumn幅に追従させる）
- Don't: offhour背景にDefaultモードと同じテキスト色を使わない

**Properties**

**Time Box**

| プロパティ | 値 |
|---|---|
| 幅 | `width: 100%`（親コンテナ176pxに追従） |
| 高さ | `42px`（固定） |
| padding | `12px 16px` |
| Typography | Hanken Grotesk 16px 400（`Text/Regular/M`） |
| text-align | `right`（通常）/ `space-between`（DateTag付き） |
| border-bottom | 1px `--color-border-timeslot` |

DateTag付き（00:00スロット）: `justify-content: space-between`、`padding-left: 8px; padding-right: 16px`

**テキストカラー（Default mode）**

| 時間帯 | CSSクラス | 色 |
|---|---|---|
| 00:00–05:00 / 18:00–23:00 | `.slotLight` | `--color-text-timeslot-inverse`（白） |
| 06:00–17:00 | `.slotDark` | `--color-timeline-slot-text`（= `text.primary`、`#101217`） |

**Business modeのCSS**

| 状態 | CSSクラス | BG | テキスト | border-bottom |
|---|---|---|---|---|
| active | `.slotBizActive` | `--color-timeslot-business-active` | `--color-timeline-slot-text` | `--color-border-timeslot-business` |
| inactive | `.slotBizInactive` | `--color-timeslot-business-inactive` | `--color-timeline-slot-text` | `--color-border-timeslot-business` |
| offhour | `.slotBizOff` | `--color-timeslot-business-offhour` | `--color-text-timeslot-inverse` | `--color-border-timeslot` |

**Date Tag**

| プロパティ | 値 |
|---|---|
| 高さ | `20px`（固定） |
| 幅 | **hug（コンテンツ幅）** — `inline-flex`、`width` 指定なし |
| BG | `--color-surface-subtle-dark`（`#83858a80`） |
| テキスト色 | `--color-text-date-tag`（`#e9ebf0`） |
| Typography | Hanken Grotesk 12px 600 |
| Radius | `--radius-date-badge`（8px） |
| padding | `0 8px` |
| flex-shrink | `0` |
| テキスト内容 | ja `M/D（曜）`（例`6/26（金）`） / en `EEE, MMM d`（例`Thu, Jun 26`） |

> Don't: 固定幅（`width: 88px`等）を指定しない。日英で文字数差があり、固定幅だとレイアウトが崩れる。

**24hours / Time Frame**

| コンポーネント | 寸法 | 説明 |
|---|---|---|
| `24hours` | 176 × 1008px | 24個のTime boxを縦積みした内部コンテンツ |
| `Time frame` | 176 × 可変高 | 24hoursをカードコンテナで包んだもの。Radius`--radius-card`・Shadow`--shadow-card`・`clip-path: inset(0 round 16px)`・上フェード124px／下フェード156px |

---

### Current Time Indicator

**Usage**: ホーム都市の現在時刻スロットに横線とバッジを表示する。1分ごとに再計算。

**Properties**

**配置**

| プロパティ | 値 |
|---|---|
| 幅 | Time tableの左端〜右端いっぱい |
| 縦位置 | ホーム都市の現在時刻スロットのY座標 |
| Z-index | `--z-raised`（10） |

**スタイル**

| プロパティ | 値 |
|---|---|
| 横線 | 1px、`--color-accent-current-time`（`#e2483d`） |
| バッジ | BG `--color-accent-current-time`、テキスト `--color-text-timeslot-inverse`（白）、Radius `--radius-date-badge`（8px）、padding `2px 8px`、left `16px`、`translateY(-50%)` |
| バッジ文字 | Hanken Grotesk 12px 600、"HH:MM"形式 |

---

### Toggle / Segment Control

**Usage**: Bottom barのDefault/Business hours切替に使うセグメントコントロール。SidePanel内のタブ切替にも同パターンを使う。

**Best practices**
- Do: アクティブ背景（インジケーター）は`transform` + `width`のトランジションでアニメーションさせる
- Don't: セグメント間のgapを詰めてタップ領域を狭くしない

**Properties**

| プロパティ | 値 |
|---|---|
| コンテナ | BG`--color-surface-control-tag`、Border 1px`--color-border-strong`、Radius`--radius-control`、padding`4px`（全辺）、gap`8px`（セグメント間） |
| インジケーター | BG`--color-surface-segment-active`、Radius`--radius-control`、Transition `transform` + `width`（`duration.base`/`easing.standard`） |

**セグメント状態**

| 状態 | padding | テキスト色 | アイコン |
|---|---|---|---|
| Active | `8px 16px` | `--color-text-segment-active` | `--color-icon-segment-active` |
| Inactive（左端） | `8px 0 8px 16px` | `--color-text-muted` | なし |
| Inactive（右端） | `8px 16px 8px 0` | `--color-text-muted` | なし |

**Bottom barでのセグメント配置**

| 位置 | ラベル | Active時のアイコン |
|---|---|---|
| 左 | "Default" | なし（テキストのみ） |
| 右 | "Business hours" | `Icon_Business`（14px） |

---

### Button

**Usage**: Primary（主軸アクション：確定・実行・保存・ジャンプ）、Secondary（副次的操作：設定・グループ切替・戻る）、Destructive（削除など破壊的操作。現状GroupEditor modalのみ）の3系統。

**Best practices**
- Do: text-onlyのpaddingは`14px`（全辺）にする
- Do: icon-onlyはPrimary/Secondary共通で`49×49px`にする
- Don't: UI操作ラベルに`--font-display`系トークンを使わない（見出し・Modal titleのみ正当な使用）

**Properties**

**Button_Primary**（BG`--color-surface-control-primary`・テキスト`--color-text-on-primary`・アイコン`--color-icon-on-primary`・Radius`--radius-button`）

| Variant | 内容 | W | H | Shadow | padding | 使用箇所 |
|---|---|---|---|---|---|---|
| `icon-only` | アイコン1個 | 49px | 49px | `--shadow-floating` あり | `0` | 現在未使用（`IconActionButton.primary`はコードに定義済みだが呼び出し箇所なし） |
| `text-only` | テキストのみ | 100% | — | なし | `14px`（全辺） | モーダル内アクション全般 |
| `icon + text` | アイコン+テキスト | Hug幅 | 49px | `--shadow-floating` あり | `0 16px 0 14px` | TagBar「グループとして保存」（`.saveGroupBtn`）。gap 8px。モバイル（≤640px）は幅49pxのicon-onlyに折りたたむ |

Typography（text-only）: Hanken Grotesk 16px 600

**Button_Secondary**（BG`--color-surface-control-action`・Border 1px`--color-border-default`・テキスト`--color-text-primary`・アイコン`--color-icon-default`・Radius`--radius-button`）

| Variant | 内容 | W | H | 使用箇所 |
|---|---|---|---|---|
| `icon-only` | アイコン1個（`Icon_Setting` / `Icon_Return`） | 49px | 49px | NavBar右端（設定）・Bottom bar（Back to now）・TimelineSideTabs |
| `icon + text` | `Icon_Group` + グループ名 + `Icon_arrow` | 可変 | 45px | NavBar（groupBtn）。`font-weight: 500`（他のButtonラベルは600） |

**Button_Destructive**（削除など破壊的アクション専用。現在はGroupEditor modalのみで使用）

| プロパティ | 値 |
|---|---|
| BG | `--color-surface-control-action` |
| Border | 1px `--color-border-default` |
| テキスト色 | `--color-accent-current-time`（`#e2483d`） |
| Radius | `--radius-button` |
| W × H | 100% × — |
| padding | `14px`（全辺） |
| Typography | Hanken Grotesk 16px 600 |

---

### Toggle Switch

**Usage**: ON/OFF設定。Settings modal・GroupEditor modal・HomeCity modalで使用。

**Properties**

| Prop | 値 |
|---|---|
| トラック | `48 × 28px`、Radius`--radius-control` |
| ノブ | `22 × 22px`円形、初期位置`top/left: 3px`、ON時`translateX(20px)` |
| トラックBG | OFF `--color-surface-switch-off` / ON `--color-surface-switch-on` |
| ノブBG | OFF `--color-surface-switch-knob` / ON `--color-surface-switch-knob-active` |
| Transition | `transform duration.base easing.standard` |

---

### Modal

**Usage**: 都市検索・グループ編集・設定など、フルスクリーン遷移せず完結する操作全般。上寄せ配置で高さ可変に対応する。

**Best practices**
- Do: overlayは`align-items: flex-start`で上端固定する
- Don't: 高さ可変モーダルを`center`配置のままにしない（コンテンツが長いとはみ出す）

**Properties**

| Prop | 値 |
|---|---|
| Overlay | `position: fixed`、`top: var(--app-offset-top)`（通常は0。モバイルのアドレスバー分を動的補正）、BG`rgba(16,18,23,0.32)`、`backdrop-filter: blur(3px)`、padding`16px`、`align-items: flex-start`（上寄せ）・`justify-content: center`、Transition`duration.modal`/`easing.modal` |
| Dialog | 幅`min(480px,100%)`（wide: `min(580px,100%)`）、max-height`min(640px, 100dvh-32px)`、BG`--color-surface-elevated`、Radius`--radius-modal`、Shadow`--shadow-card` |
| Header | padding`16px`、border-bottom`--color-border-subtle`、タイトル`--font-modal-title`24px/500 |
| Close button | `32×32px`、`--radius-control` |
| Body | padding`16px`、`overflow-y: auto` |

---

### Snackbar

**Usage**: コピー完了・エラーなどの一時的な通知。

**Properties**

| Prop | 値 |
|---|---|
| BG / テキスト | `--color-surface-inverse` / `--color-text-inverse` |
| padding / Radius | `10px 20px` / `--radius-button` |
| Typography | `--font-ui`, 14px/600 |
| 配置（floating） | `position: fixed; bottom: 100px; left: 50%; translateX(-50%)`、`--z-toast` |
| 配置（inline） | `position: static; margin-top: 16px; text-align: center` |

---

### Icons

**Usage**: すべてのアイコンは`currentColor`で色を継承させ、配置先のテキスト/アイコンカラートークンに追従させる。

**Best practices**
- Do: サイズは14 / 15 / 16 / 18 / 20 / 24pxのいずれかを使う
- Don't: アイコンに直接HEXカラーを指定しない（例外: City Tagの`Icon_Show`のみ`fill="currentColor"`）

**Properties**

| Icon | size | 用途 | 実装 |
|---|---|---|---|
| `Icon_Home` | 14×14 | City tag（Home）・City heading（Home） | stroke |
| `Icon_Show` | 14×14 | 都市を表示する | **fill**（例外） |
| `Icon_Hide` | 14×14 | 都市を非表示にする | stroke |
| `Icon_Clear` | 14×14 | タグから削除（×） | stroke |
| `Icon_Business` | 14×14 | Business hours toggle | stroke |
| `Icon_Add` | 16×16 | Add city・グループへ追加 | stroke |
| `Icon_ClearAll` | 16×16 | Clear all | stroke |
| `Icon_Save` | 18×18 | Save as group | stroke |
| `Icon_Setting` | 18×18 | 設定 | stroke |
| `Icon_Group` | 18×18 | グループ | stroke |
| `Icon_Return` | 18×18 | タイムラインへ戻る | stroke |
| `Icon_Convert` | 18×18 | TimelineSideTabs Convertタブ | stroke |
| `Icon_Jump` | 18×18 | TimelineSideTabs Jumpタブ | stroke |
| `Icon_arrow` | 15×15 | ドロップダウン矢印 | stroke |
| `Icon_Search` | 24×24 | 検索（City Search modal） | stroke |
| `Icon_Onboarding` | 33×20 | ContextualGuide吹き出し内 | 🆕 `fill="#374069"`直書き |

🆕 `Icon_Onboarding`（`src/assets/icons/icon_onboarding.svg`）は`currentColor`を使わず`fill="#374069"`を直書きしており、「アイコンは`currentColor`で色を継承する」というBest practiceに違反している（例外は`Icon_Show`のみのはずだった）。次にこのアイコンを触るときに、`currentColor`に修正して例外なしのルールに揃えるか、意図的な例外として正式に追加するかを検討する。

---

### Display City Tag

**Usage**: Convert / Jump SidePanel内で「表示中の都市」から基準都市・対象都市をタグ選択するUI。City Tagとは別コンポーネント（サイズ・トーンが軽量）。

**Best practices**
- Do: 基準都市は対象都市タグから除外し、基準都市変更時は対象リストから新基準都市を自動除外する

**Properties**

| Prop | 値 |
|---|---|
| Height / padding | `28px` / `0 12px` |
| Radius / Border | `999px` / 1px `--color-border-strong` |
| Background | `transparent`（未選択時） |
| Typography | `--font-ui`, 11px/600 |
| gap（コンテナ） | `--space-inset-sm`（8px） |
| 選択状態 | BG`--color-surface-segment-active`、テキスト`--color-text-segment-active` |
| ホーム都市 | Border`--color-border-strong`、ラベルprefix `🏠` + 国旗 + 都市名 |

| 対象 | 選択モード | 動作 |
|---|---|---|
| 基準都市 | 単一 | クリックで基準都市変更 |
| 対象都市 | 複数（トグル、上限10都市） | クリックで追加/削除 |

---

### SidePanel（Jump / Convert）

**Usage**: タイムライン右端に常設する`TimelineSideTabs`（Convert / Jump）から開閉する2つの機能パネル。デスクトップは右固定パネル、モバイルはドラッグ可能なボトムシート。

- **Jump**: 都市・日付・時刻を指定してタイムライン上の該当セルへジャンプ＋ハイライトする
- **Convert**: 基準都市＋複数日程候補（タイムライン2タップ選択 or 手動追加）を対象都市の時刻に一括変換し、結果リスト＋コピーを提供する

**Best practices**
- Do: Jump / Convertは排他表示にする（片方を開くと他方は閉じる）
- Do: 対象都市のデフォルトは「現在タイムラインに表示中の都市（基準都市を除く）」にする
- Don't: 対象都市の追加をSearch単独 / Tag単独に限定しない（併用させる）

**Properties**

| Prop | デスクトップ | モバイル（≤640px） |
|---|---|---|
| 表示 | `position: fixed`、右端固定、幅`--range-selection-panel-width`（580px） | ボトムシート、3段階スナップ：peek(72px) / half(viewport×0.45, 最大400px) / full(viewport×0.88) |
| Radius | `--radius-modal`（左側角のみ） | `--radius-modal`（上2角のみ） |
| Shadow | `-4px 0 16px rgba(0,0,0,0.06)` | `0 -4px 24px rgba(0,0,0,0.1)` |
| z-index | `--z-range-panel` | `--z-range-panel` |
| タイトル | `--font-modal-title`, 24px/500 | 同左 |

モバイルは開くたびに`half`にリセット。ヘッダーをドラッグして高さ変更、タップで`peek`⇔`half`をトグル。

**Jump Panel フィールド構成**（タイトル: `jump.title` = 「ジャンプ」）

| フィールド | UI | デフォルト |
|---|---|---|
| 基準都市 | CityCombo | ホーム都市 |
| 日付 | CalendarDatePicker | 基準都市における今日 |
| 時刻 | hour + minute select | 基準都市の現在時刻（分は30分刻みに丸め） |
| 確定ボタン | `jump.apply` = 「この時間に移動」 | — |

**Convert Panel フィールド構成**（入力ビュー: `rangeSelection.title` = 「選択済み範囲」／結果ビュー: `timeSearch.resultsTitle` = 「検索結果」）

| フィールド | UI | デフォルト |
|---|---|---|
| 基準都市 | Display City Tag + CityCombo | ホーム都市 |
| 基準都市ヒント（ja） | fieldHint | `下記から選択するか、検索して基準都市を選択してください。` |
| 日程候補 | DateCandidateListEditor（日付 + 開始/終了時刻、最大10件） | タイムライン2タップ選択で自動追加、または手動追加 |
| 対象都市 | Display City Tag + Group Tag + 選択済み chip + CityCombo | 現在タイムラインに表示中の都市（基準都市を除く） |
| 対象都市ヒント（ja） | fieldHint | `下記から選択するか、検索して追加してください。` |
| 確定ボタン | `rangeSelection.convert` = 「変換」 | 押下で結果ビューへ切り替え |

対象都市 — 選択済みchip（`.targetTag`。Display City Tagとは別で、選択中の全都市を表示）:

| プロパティ | 値 |
|---|---|
| height | `34px` |
| padding | `0 10px 0 12px` |
| border-radius | `--radius-control` |
| border | 1px `--color-border-default` |
| background | `--color-surface-control-tag` |
| font-size / weight | `14px` / `600` |
| 削除 | × ボタン（IconClear 12px） |

グループタグ（`.groupTag`）:

| 状態 | 見た目 |
|---|---|
| 通常 | pill / 11px 600 / border `--color-border-strong` |
| 追加済み | opacity `0.4` + `disabled` |

共通フィールドスタイル: `.label`（12px/600/`text.muted`、フィールド見出し）・`.fieldHint`（11px/`text.muted`、ラベル直下の説明文）・`.subLabel`（11px/600/`text.muted`、グループタグ見出し等）

**TimelineSideTabs**（開閉トリガー）

| Prop | 値 |
|---|---|
| 配置（デスクトップ） | `position: absolute; right: 0; top: 50%`（パネル展開時は`right: --range-selection-panel-width`） |
| 配置（モバイル） | `position: fixed; bottom`、横並び、49×49px |
| ラベル（デスクトップ） | `writing-mode: vertical-rl`、14px/600 |
| Active時 | BG`--color-surface-control-primary`、テキスト/アイコン `on-primary` |
| 件数バッジ | `--color-accent-current-time`背景、`--radius-date-badge`。Convertタブのみ、候補1件以上 かつ パネル非表示時に表示 |

🆕 **Range selection overlay**（タイムライン上のドラッグ選択・候補ハイライト表示）: `rgba(226, 72, 61, 0.08/0.04)` のハードコード値を使用しており、既存のsurfaceトークンから参照していない。badgeサイズも10px/700でDate tagの12px/600と異なる。次にこの領域を触るときに、accent系のセマンティックトークンとして正式採用するか、既存のDate tagパターンに揃えるかを検討する。

---

### ContextualGuide

**Usage**: 初回機能ツアー完了後、都市が2つ以上になった時点で「グループとして保存 → Jump → Convert」の3ステップを吹き出しで順に案内する。

**Best practices**
- Do: SidePanel（Jump/Convert）が開いている間はガイドを表示しない
- Do: 進行状態は`UserSettings.contextualGuideStep`（0〜4）で永続化する

**Properties**

| Prop | 値 |
|---|---|
| 構成 | 対象要素へのリング + 吹き出し（tooltip） |
| ステップ | 1: Save as groupボタン / 2: Jumpタブ / 3: Convertタブ |

🆕 吹き出し本体（`.bubbleInner`）・矢羽根（`.bubbleTail`）・リング（`.ring`）にそれぞれ個別に`box-shadow: var(--shadow-floating)`を適用しており、1サーフェス1シャドウという他コンポーネントの原則から外れている。次に触るときに、吹き出し全体で1つのshadowにまとめるか、複数シャドウを正式パターンとして採用するかを検討する。

---

## Do / Don't（横断原則）

複数コンポーネントにまたがる原則のみここに置く。単一コンポーネントに閉じたDo/Don'tは各コンポーネントのBest practicesを参照。

| Do ✅ | Don't ❌ |
|---|---|
| 色・余白・角丸・影は必ずトークン経由で使う | 値をハードコードする |
| `--radius-control`はタグ・pill系、`--radius-button`はボタン・フォーム系と役割を分ける | 役割を跨いで角丸トークンを流用する |
| Timeパレットは時刻スロット背景専用にする | Timeパレットをカード・ボタン等のsurfaceに使う |
| `--color-surface-default`（`#fdffff`）と`#ffffff`を区別する | 同一視して直接`#ffffff`を書く |
