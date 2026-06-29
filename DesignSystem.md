# NANJI? Design System

**Version**: 5.1 (Source Han Sans JP導入・ローカライズルール追加・Date Tag hug幅・TagBar全BP折りたたみ・§18 Display City Tag・§19 Time Search Modal)
**Figma file**: `m5cRpfLlQaGrkws43f7XTd` — canvas "Design file" (node 48:4823)
**Last updated**: 2026-06-27
**Product**: NANJI? — World timezone comparison web application

---

## このドキュメントの使い方

このドキュメントは、AIがNANJI?の新しいページや機能をコーディングする際の設計ルールリファレンスです。コードの実態を正として記述している。

**基本的な使い方**:
1. 新しい要素を実装するとき → 「コンポーネント仕様」セクションを参照する
2. 色や余白を決めるとき → 必ず「トークン」セクションのCSS変数名を使う
3. 新しいページを作るとき → 「新規ページ作成チェックリスト」に従う
4. ルールに迷ったとき → 「Do/Don't」を確認する

**記号の意味**:
- ✅ Figmaで実値確認済み（コードと一致）
- ⚠️ 未確認または暫定値
- ❌ Figmaで未定義（コードのみに実装）

---

## デザイン原則

### Product Philosophy

1. **タイムラインが主役。** 時刻グラデーションがNANJI?のアイデンティティ。周囲のUIは色数・装飾を極限まで抑え、タイムラインの美しさを引き立てる存在に徹する。

2. **引いて、引いて、引く。** 追加の前に「これは削れないか」を問う。シンプルさはゴールではなく出発点。機能も装飾も、タイムラインという主役を奪う要素は入れない。

3. **一画面で、全員分。** 複数都市の時刻を同時に把握できることが最優先。レイアウト・情報密度の判断は常にスキャナビリティ基準で行う。

4. **次回もゼロから始めない。** グループ保存・状態の永続化はコア体験。ユーザーが毎回同じ設定をやり直す必要がないことで、ツールへの信頼が生まれる。

### デザインルール（実装ガイドライン）

1. **時刻は色で語る。** 時間帯ごとに対応する色がある。色は装飾ではなく、深夜・夜明け・朝・昼・夕・夜を一目で伝える情報である。

2. **ホーム都市がすべての基準。** ホーム都市のカードは常にダークで目立つ。他の都市はホームとの相対関係として存在する。

3. **密度はあるが、ノイズはない。** 最大6都市を同時表示しながら視覚的な混乱を起こさない。タイポは小さく、間隔は締まり、余白は意図的に使われている。

4. **モード切替は再設計ではなくフィルタリング。** Business hoursモードは既存スロットの色を変えるだけで、構造・レイアウトは変わらない。

5. **操作UIは無彩色。** ボタン・タグ・トグルはすべてモノクロ。色は時刻スケールのためだけに存在する。

---

## カラートークン ✅

> CSS変数名はトークン名をケバブケースにしたもの（例: `color.surface.default` → `--color-surface-default`）。

### Primitive — Neutral palette

Figmaのカラーパレットは `/50`〜`/950` の19ステップ構成。CSS変数名 `--neutral-40` は Figma Neutral/50 相当（#ffffff、純白）。Primitiveトークンは全てのSemanticトークンの参照先としてのみ扱う。

| Token（Figma） | CSS変数 | Hex |
|---|---|---|
| `Neutral/50`（CSS: `/40`） | `--neutral-40` | `#ffffff` |
| `Neutral/100` | `--neutral-100` | `#f6f8fd` |
| `Neutral/150` | `--neutral-150` | `#e9ebf0` |
| `Neutral/200` | `--neutral-200` | `#dcdee3` |
| `Neutral/250` | `--neutral-250` | `#cfd1d6` |
| `Neutral/300` | `--neutral-300` | `#c3c5ca` |
| `Neutral/350` | ⚠️ 未確認 | — |
| `Neutral/400` | ⚠️ 未確認 | — |
| `Neutral/450` | ⚠️ 未確認 | — |
| `Neutral/500` | `--neutral-500` | `#909297` |
| `Neutral/550` | ⚠️ 未確認 | — |
| `Neutral/600` | `--neutral-600` | `#5d5f64` |
| `Neutral/650` | ⚠️ 未確認 | — |
| `Neutral/700` | ⚠️ 未確認 | — |
| `Neutral/750` | ⚠️ 未確認 | — |
| `Neutral/800` | ⚠️ 未確認 | — |
| `Neutral/850` | ⚠️ 未確認 | — |
| `Neutral/900` | `--neutral-900` | `#101217` |
| `Neutral/950` | ⚠️ 未確認 | — |

> ⚠️ 未確認の値は Figma で確認次第 CSS変数を追加・Semanticトークンに参照させる。

---

### Primitive — Time palette ✅（24ステップ確定）

1時間 = 1スロット。Token名のステップは50刻み（Time/50 = 00:00、Time/100 = 01:00 … Time/1200 = 23:00）。

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

**禁止**: TimeトークンをUI surface（カード、ボタン、背景）に使用しないこと。時刻スロット背景専用。

---

### Semantic — surface ✅

**ページ・カード背景**

| CSS変数 | Primitive参照 | Light Hex | 役割 | 使用コンポーネント |
|---|---|---|---|---|
| `--color-surface-default` | 固有値 | `#fdffff` | ページ背景（わずかに青みがかった白） | ページ背景・NavBar・TagBar |
| `--color-surface-elevated` | `Neutral/50` | `#ffffff` | 浮いているカード・モーダル背景 | City heading（Other）・Modal dialog・Popover |
| `--color-surface-inverse` | ⚠️ 未確認 | `#2a2c31` | ダーク背景 | City heading（Home） |
| `--color-surface-subtle` | Neutral/40 × 15%α | `#ffffff26` | 半透明白オーバーレイ | Date tag背景 |

> `color.surface.default`（`#fdffff`）は純白（`#ffffff`）とは異なる。実装では値をそのまま使うこと。

**City heading専用エイリアス**:

| CSS変数 | 参照先 | Light Hex | 役割 |
|---|---|---|---|
| `--color-surface-cityheading-home` | `--color-surface-inverse` | `#2a2c31` | Home cardの背景 |
| `--color-surface-cityheading-other` | `--color-surface-elevated` | `#ffffff` | Other cardの背景 |

**フェードオーバーレイ**（Time frameの上下グラデーション用）

| CSS変数 | 参照先 | Light Hex | 説明 |
|---|---|---|---|
| `--color-surface-fade-100` | 固有値 | `#fdffff` | フェード不透明端（= surface.default） |
| `--color-surface-fade-0` | — | `#fdffff00` | フェード透明端 |

> Time frameの上部（124px）・下部（156px）のフェードはこの2トークンで実装する。

**操作UI背景**

| CSS変数 | Primitive参照 | Light Hex | 役割 | 使用コンポーネント |
|---|---|---|---|---|
| `--color-surface-control-tag` | `Neutral/100` | `#f6f8fd` | タグ型コントロールの背景 | City tag・Toggle container・Segment container |
| `--color-surface-control-action` | `Neutral/50` | `#ffffff` | アクション系の背景（純白） | Add city・Clear all・Button_Secondary・Input・Popover |
| `--color-surface-control-primary` | ⚠️ 未確認 | `#2a2c31` | プライマリコントロールの背景 | Button_Primary・City tag（Home）・Segment active |

**スイッチ（Toggle Switch）❌**

| CSS変数 | Primitive参照 | Light Hex | 役割 |
|---|---|---|---|
| `--color-surface-switch-off` | `Neutral/150` | `#e9ebf0` | Switch OFF トラック背景 |
| `--color-surface-switch-on` | ⚠️ 未確認 | `#2a2c31` | Switch ON トラック背景 |
| `--color-surface-switch-knob` | `Neutral/50` | `#ffffff` | Switch OFF ノブ色 |
| `--color-surface-switch-knob-active` | `Neutral/50` | `#ffffff` | Switch ON ノブ色（dark で Neutral/900 に反転） |

**Segment control（Toggle / タブ切替）専用**:

| CSS変数 | Primitive参照 | Light Hex | 役割 |
|---|---|---|---|
| `--color-surface-segment-active` | ⚠️ 未確認 | `#2a2c31` | アクティブセグメントの背景 |
| `--color-text-segment-active` | `Neutral/100` | `#f6f8fd` | アクティブセグメントのテキスト色 |
| `--color-icon-segment-active` | `Neutral/50` | `#ffffff` | アクティブセグメントのアイコン色 |

---

### Semantic — 時刻スロット surface ✅

**Default mode（グラデーション）**: 各スロットに `--gradient-time-of-day` を `background-image` として適用する（詳細は「グラデーション実装」参照）。

**Business mode（3状態）**:

| CSS変数 | Hex | 時間帯 | テキスト色 |
|---|---|---|---|
| `--color-timeslot-business-active` | `#eff0a4` | 09:00–16:00（業務時間） | `color.text.primary`（暗い） |
| `--color-timeslot-business-inactive` | `#d8dfe9` | 06:00–08:00 / 17:00–21:00 | `color.text.primary`（暗い） |
| `--color-timeslot-business-offhour` | `#374069` | 00:00–05:00 / 22:00–23:00（深夜） | `--color-text-timeslot-inverse`（白） |

---

### Semantic — text ✅

| CSS変数 | Primitive参照 | Light Hex | 用途 |
|---|---|---|---|
| `--color-text-primary` | `Neutral/900` | `#101217` | 通常テキスト全般（明るい背景） |
| `--color-text-inverse` | `Neutral/100` | `#f6f8fd` | 暗い背景上のテキスト全般 |
| `--color-text-muted` | `Neutral/500` | `#909297` | ラベル・プレースホルダー・Inactive状態 |
| `--color-text-cityheadingtime` | ⚠️ 未確認 | `#36383d` | City heading（Other）の時刻大表示専用 |
| `--color-text-on-primary` | `Neutral/100` | `#f6f8fd` | Button_Primary・アクティブSegmentのテキスト |
| `--color-text-cityheading-home-time` | `Neutral/50` | `#ffffff` | City heading（Home）の時刻大表示 |
| `--color-text-cityheading-home-label` | `Neutral/200` | `#dcdee3` | City heading（Home）の都市名・日付 |
| `--color-text-cityheading-other-date` | `Neutral/600` | `#5d5f64` | City heading（Other）の日付 |
| `--color-text-timeslot-inverse` | `Neutral/50` | `#ffffff` | 暗い時間帯スロットのテキスト・Now badge |
| `--color-text-date-tag` | `Neutral/150` | `#e9ebf0` | Date tagのテキスト色 |

---

### Semantic — border ✅

| CSS変数 | Primitive参照 | Light Hex | 用途 |
|---|---|---|---|
| `--color-border-default` | `Neutral/150` | `#e9ebf0` | カード・City tag・Input・各種コンポーネントの標準枠線 |
| `--color-border-strong` | `Neutral/600` | `#5d5f64` | Toggle container・City tag（In group）の強調枠線 |
| `--color-border-subtle` | `Neutral/100` | `#f6f8fd` | TagBar区切り・SettingsのSection区切り（薄いボーダー） |
| `--color-border-timeslot` | Neutral/50 × 15%α | `#ffffff26` | 時刻スロット間の区切り（Default mode） |
| `--color-border-timeslot-business` | Black × 6%α | `#0000000f` | 時刻スロット間の区切り（Business mode） |
| `--color-border-cityheading-other` | — | `transparent` | City heading（Other）の枠線（light modeでは不可視） |

---

### Semantic — icon ✅

| CSS変数 | Primitive参照 | Light Hex | 用途 |
|---|---|---|---|
| `--color-icon-default` | ⚠️ 未確認 | `#83858a` | 標準アイコン色 |
| `--color-icon-inverse` | `Neutral/50` | `#ffffff` | 暗い背景上のアイコン色 |
| `--color-icon-on-primary` | `Neutral/50` | `#ffffff` | Button_Primary・アクティブSegmentのアイコン |

---

### Semantic — accent ✅

| CSS変数 | 値 | 用途 |
|---|---|---|
| `--color-accent-current-time` | `#e2483d` | 現在時刻ライン・バッジ背景・エラーテキスト・Destructiveボタンテキスト |

---

## ダークモード ❌

### テーマ切り替えの仕組み

`<html>` 要素に `data-theme="dark"` 属性を付与することでダークモードに切り替わる。CSSのカスケードにより `:root` で定義されたライトモード値が `[data-theme="dark"]` セレクターで上書きされる仕組み。

- ライトモード（デフォルト）: 属性なし、または `data-theme="light"`
- ダークモード: `data-theme="dark"` を `<html>` に付与
- `<meta name="color-scheme" content="light dark">` でブラウザUIの自動調整も有効化済み
- Time パレット・accent・Now lineは上書きなし（ライト・ダーク共通）

### 上書きされるCSS変数

`<html data-theme="dark">` を付与することで切り替わる。

| CSS変数 | Dark値 | Primitive参照 |
|---|---|---|
| `--color-surface-default` | `#101217` | `Neutral/900` |
| `--color-surface-elevated` | `#1c1e24` | ⚠️ 未確認 |
| `--color-surface-control-tag` | `#2f323a` | ⚠️ 未確認 |
| `--color-surface-control-action` | `#2a2c31` | ⚠️ 未確認 |
| `--color-surface-control-primary` | `#e9ebf0` | `Neutral/150` |
| `--color-text-on-primary` | `#101217` | `Neutral/900` |
| `--color-icon-on-primary` | `#101217` | `Neutral/900` |
| `--color-surface-segment-active` | `#e9ebf0` | `Neutral/150` |
| `--color-text-segment-active` | `#101217` | `Neutral/900` |
| `--color-icon-segment-active` | `#36383d` | ⚠️ 未確認 |
| `--color-surface-switch-off` | `#5d5f64` | `Neutral/600` |
| `--color-surface-switch-on` | `#e9ebf0` | `Neutral/150` |
| `--color-surface-switch-knob-active` | `#101217` | `Neutral/900` |
| `--color-text-primary` | `#f6f8fd` | `Neutral/100` |
| `--color-text-cityheadingtime` | `#dcdee3` | `Neutral/200` |
| `--color-text-muted` | `#b0b2b8` | ⚠️ 未確認 |
| `--color-text-cityheading-other-date` | `#909297` | `Neutral/500` |
| `--color-border-default` | `#5d5f64` | `Neutral/600` |
| `--color-border-strong` | `#b0b2b8` | ⚠️ 未確認 |
| `--color-border-subtle` | `#2f323a` | ⚠️ 未確認 |
| `--color-icon-default` | `#b0b2b8` | ⚠️ 未確認 |
| `--color-surface-fade-100` | `#101217` | `Neutral/900` |
| `--color-surface-fade-0` | `#10121700` | — |
| `--shadow-card` | `0 8px 16px rgba(0,0,0,0.45)` | — |
| `--shadow-floating` | `0 4px 4px rgba(0,0,0,0.35)` | — |
| `--color-surface-cityheading-home` | `#3d424d` | ⚠️ 未確認 |
| `--color-surface-cityheading-other` | `#171a21` | ⚠️ 未確認 |
| `--color-border-cityheading-other` | `#2a2e38` | ⚠️ 未確認（darkのみ可視） |

> Timeパレット・accentトークン・`--neutral-40` 〜 `--neutral-900` は上書きなし（time gradientとnow lineは常に同じ値）。

---

## グラデーション実装 ✅

**実装方式**: グラデーションは**スロット（.slot）単位**で適用する。Time frame列全体には適用しない。

```css
/* tokens.cssに定義済み */
--gradient-time-of-day: linear-gradient(
  to bottom,
  #1c2a4c 0%,
  #1c2a4c 2.083%,
  #20294b 6.25%,
  #2f385e 10.417%,
  #374069 14.583%,
  #626187 18.75%,
  #8c82a5 22.917%,
  #f5c8c3 27.083%,
  #ffd7af 31.25%,
  #f5ebd2 35.417%,
  #f0f2da 39.583%,
  #ebf8e1 43.75%,
  #e6f8dc 47.917%,
  #ffe478 52.083%,
  #ffd66c 56.25%,
  #ffc85f 60.417%,
  #ffbc58 64.583%,
  #ffaf50 68.75%,
  #ff9646 72.917%,
  #ff6e46 77.083%,
  #eb504b 81.25%,
  #be4655 85.417%,
  #9a3d51 89.583%,
  #562c4a 93.75%,
  #322346 97.917%,
  #322346 100%
);
```

```css
/* スロット単位で適用 */
.slotDefault {
  background-image: var(--gradient-time-of-day);
  background-size: 100% 1008px;        /* 24スロット × 42px = 1008px で1サイクル */
  background-repeat: repeat-y;          /* スロット高42pxに対してグラデーション繰り返し */
  background-position-y: calc(var(--slot-local-hour) * -1 * 42px);
}
```

**`--slot-local-hour` の設定ルール**:

| 状況 | `--slot-local-hour` の値 |
|---|---|
| そのスロットが表す都市のローカル時 | `0`〜`23`（整数） |

```html
<!-- 例: 東京の14:00スロット -->
<div class="slot slotDefault" style="--slot-local-hour: 14;">14:00</div>
```

> 旧バージョン（v2.1以前）の「列コンテナ全体に適用・`--start-hour`・`background-repeat: no-repeat`」方式は廃止。

---

## 時刻テキスト色アルゴリズム

### Default mode

| 時間帯 | 時刻 | テキスト色 | CSS変数 |
|---|---|---|---|
| 深夜 | 00:00–05:00 | 白 | `--color-text-timeslot-inverse`（`#ffffff`） |
| 夜明け〜夕方 | 06:00–17:00 | 黒 | `--color-text-primary`（`#101217`） |
| 夕方〜深夜 | 18:00–23:00 | 白 | `--color-text-timeslot-inverse`（`#ffffff`） |

### Business mode

| 状態 | 時間帯 | テキスト色 |
|---|---|---|
| `active` | 09:00–16:00 | `--color-text-primary` |
| `inactive` | 06:00–08:00 / 17:00–21:00 | `--color-text-primary` |
| `offhour` | 00:00–05:00 / 22:00–23:00 | `--color-text-timeslot-inverse`（白） |

---

## タイポグラフィ ✅

### フォントファミリー

| CSS変数 | フォント | 言語 | 用途 |
|---|---|---|---|
| `--font-ui` | Hanken Grotesk | 英語UI | UI全般（ラベル・ボタン・タグ・スロット） |
| `--font-ui`（fallback） | Source Han Sans JP | 日本語UI | CJK文字のUI表示（自動フォールバック） |
| `--font-display` | Newsreader | 見出し全般 | **見出し全般**（City heading 時刻大表示・Modal タイトル） |
| `--font-display`（fallback） | Source Han Sans JP | CJK見出し | CJK文字の見出しフォールバック |
| `--font-city-heading-time` | `= --font-display` | — | City heading時刻専用エイリアス（同値） |

**Source Han Sans JP 実装（`global.css`）**:

| 項目 | 値 |
|---|---|
| ファイル | `/public/fonts/SourceHanSansJP-VF.woff2` |
| weight range | `100 900`（可変フォント） |
| font-display | `swap` |
| 適用方法 | `@font-face` 定義 + `--font-ui` / `--font-display` の fallback として参照 |

**関連 CSS 変数（tokens.css）**:

```css
--font-ui: "Hanken Grotesk", "Source Han Sans JP", system-ui, sans-serif;
--font-display: "Newsreader", "Source Han Sans JP", Georgia, serif;
--font-city-heading-time: "Newsreader", "Source Han Sans JP", Georgia, serif;
```

**ルール**:
- Noto Sans JP は使用しない（Source Han Sans JP に置換済み）
- 英字 UI は引き続き Hanken Grotesk が primary
- CJK 文字はスタック内 fallback で Source Han Sans JP に自動フォールバック

### Primitive Text Styles（Figma登録全量）

Figmaには `Text/` と `Heading/` の2系統がある。`Text/` はHanken Grotesk、`Heading/` はNewsreader（ja時 Shippori Mincho）。⚠️ = アプリ未使用・値未確認。

**Text/ 系（Hanken Grotesk）**

| Style名 | size | weight | lineHeight | 確認状態 |
|---|---|---|---|---|
| `Text/Bold/XS` | 12px | 600 | 1.3 | ✅ |
| `Text/Bold/S` | 14px | 600 | 1.3 | ✅ |
| `Text/Bold/M` | 16px | 600 | 1.3 | ✅ |
| `Text/Bold/L` | ⚠️ | 600 | 1.3 | ⚠️ |
| `Text/Bold/XL` | ⚠️ | 600 | 1.3 | ⚠️ |
| `Text/Bold/2XL` | ⚠️ | 600 | 1.3 | ⚠️ |
| `Text/Bold/3XL` | ⚠️ | 600 | 1.3 | ⚠️ |
| `Text/Bold/4XL` | ⚠️ | 600 | 1.3 | ⚠️ |
| `Text/Bold/5XL` | ⚠️ | 600 | 1.3 | ⚠️ |
| `Text/Regular/XS` | 12px | 400 | 1.3 | ✅ |
| `Text/Regular/S` | ⚠️ | 400 | 1.3 | ⚠️ |
| `Text/Regular/M` | 16px | 400 | 1.3 | ✅ |
| `Text/Regular/L` | ⚠️ | 400 | 1.3 | ⚠️ |
| `Text/Regular/XL` | ⚠️ | 400 | 1.3 | ⚠️ |
| `Text/Regular/2XL` | ⚠️ | 400 | 1.3 | ⚠️ |
| `Text/Regular/3XL` | ⚠️ | 400 | 1.3 | ⚠️ |
| `Text/Regular/4XL` | ⚠️ | 400 | 1.3 | ⚠️ |
| `Text/Regular/5XL` | ⚠️ | 400 | 1.3 | ⚠️ |

**Heading/ 系（Newsreader / Shippori Mincho）**

| Style名 | size | weight | lineHeight | 確認状態 |
|---|---|---|---|---|
| `Heading/Regular/XS` | ⚠️ | 500 | 1.3 | ⚠️ |
| `Heading/Regular/S` | ⚠️ | 500 | 1.3 | ⚠️ |
| `Heading/Regular/M` | ⚠️ | 500 | 1.3 | ⚠️ |
| `Heading/Regular/L` | ⚠️ | 500 | 1.3 | ⚠️ |
| `Heading/Regular/XL` | ⚠️ | 500 | 1.3 | ⚠️ |
| `Heading/Regular/2XL` | 24px | 500 | 1.3 | ✅ |
| `Heading/Regular/3XL` | ⚠️ | 500 | 1.3 | ⚠️ |
| `Heading/Regular/4XL` | 40px | 500 | 1.0 | ✅ |
| `Heading/Regular/5XL` | ⚠️ | 500 | 1.3 | ⚠️ |

> ⚠️ サイズ未確認のスタイルは Figma で確認次第値を追加する。AIが新しい値を作り出す前に、このリストから選択すること。

### セマンティックマッピング

| 用途 | Text Style | CSS実装 |
|---|---|---|
| City heading 時刻（大） | `Heading/Regular/4XL` | font-family: `--font-display`, 40px, 500 |
| City heading 都市名 | `Text/Bold/M` | 16px 600 |
| City heading 日付 | `Text/Regular/XS` | 12px 400 |
| 時刻スロットラベル | `Text/Regular/M` | 16px 400 |
| City tag・Toggle | `Text/Bold/S` | 14px 600 |
| Button_Primary / Button_Secondary ラベル | `Text/Bold/M` | 16px 600 |
| Date tag・Now badge | `Text/Bold/XS` | 12px 600 |
| Modal タイトル | `Heading/Regular/2XL` | font-family: `--font-display`, 24px, 500 |
| ラベル・セクションヘッダ（小） | `Text/Bold/XS` | 12px 600、muted色 |

---

## ローカライズルール ✅

### 都市名表示

| 条件 | 表示 |
|---|---|
| `lang === "ja"` | `city.nameJa` |
| `lang === "en"` | `city.name` |

**実装**: 必ず `getCityDisplayName(city, lang)` を使用する（`src/lib/cities.ts`）  
**禁止**: 画面ごとに `city.name` / `city.nameJa` を直書きしない

**適用済み画面**: TimeTable（City heading）・TagBar・CitySearch / HomeCity / Settings / GroupEditor / Onboarding・TimeSearch modal（タグ・コンボ）

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

## Spacing ✅

### Primitive — Numbers

**Spacing**

| CSS変数 | 値 | 用途 |
|---|---|---|
| `--space-page-edge` | `16px` | ページ端のpadding |
| `--space-column-gap` | `8px` | City column間のgap |
| `--space-inset-sm` | `8px` | 内部padding（小） |
| `--space-inset-md` | `16px` | 内部padding（中）・Shadow blur |

**Layout constants**

| CSS変数 | 値 | 用途 |
|---|---|---|
| `--column-width` | `176px` | City columnの幅 |
| `--time-slot-height` | `42px` | 1スロットの高さ |
| `--time-slots-per-day` | `24` | 1日のスロット数 |
| `--time-cycle-height` | `1008px` | グラデーション1サイクル高（24 × 42px） |
| `--city-heading-height` | `118px` | City headingの高さ |
| `--city-heading-overlap` | `16px` | City heading → Time frameのオーバーラップ量 |
| `--navbar-height` | `97px` | NavBarの高さ |
| `--tagbar-height` | `85px` | TagBarの高さ |
| `--bottom-bar-height` | `122px` | Bottom bar の高さ |
| `--shadow-card-bleed` | `24px` | shadow-card のblur + offset 合計（スクロール余白計算用） |

### セマンティック

| 用途 | 値 |
|---|---|
| ページ端padding | `16px` |
| City column間gap | `8px` |
| カード内padding | `16px` |
| タグ内padding（上下） | `8px` |
| タグ内padding（左右） | `14px` / `16px`（バリアントによる） |
| City heading内gap | `8px` |
| City heading → Time frameのオーバーラップ | `16px`（`--city-heading-overlap`） |

### 主要コンポーネント寸法

| コンポーネント | W | H |
|---|---|---|
| City column幅 | 176px（`--column-width`） | — |
| City heading | 176px | 118px（`--city-heading-height`） |
| City heading（モバイル ≤640px） | 176px | 114px |
| Time box（1スロット） | 176px | 42px（`--time-slot-height`） |
| Button_Primary icon-only | 49px | 49px |
| Button_Secondary icon-only | 49px | 49px |
| Toggle Switch | 48px | 28px |
| Modal（デフォルト） | min(480px, 100%) | max min(640px, 100dvh-32px) |
| Modal（wide variant） | min(580px, 100%) | — |
| NavBar | 幅100% | fit-content（`margin: 8px 0`） |
| TagBar | 幅100% | fit-content |

### カラムグリッド

| プロパティ | 値 |
|---|---|
| カラム幅 | `176px` |
| カラム間gap | `8px` |
| 左端padding | `16px` |
| カラムstride | `184px`（176 + 8） |
| 最大カラム数 | 6 |

**N番目の都市の左端X座標**: `16 + (N-1) × 184` px

---

## Shape ✅

### Token一覧

| CSS変数 | 値 | 適用コンポーネント |
|---|---|---|
| `--radius-card` | `16px` | City heading card・Time frame |
| `--radius-button` | `16px` | Button_Primary・Button_Secondary・Input・Select・Popover・Modal内フォームコントロール全般 |
| `--radius-control` | `999px`（pill） | City tag・Add city・Clear all・Toggle container・Segment container・Toggle Switch |
| `--radius-date-badge` | `8px` | Date tag・Now badge・CalendarDatePicker 日付セル |
| `--radius-modal` | `24px` | Modal dialog ❌ |

> `Radius/Button（16px）` はButtonに限らず、すべてのフォーム系インタラクティブ要素（Input・Select等）の統一角丸として使用されている。

---

## Elevation ✅

### Shadow

| CSS変数 | 値 | 適用先 |
|---|---|---|
| `--shadow-card` | `0 8px 16px 0 #c3c5ca` | City heading card・Modal dialog |
| `--shadow-floating` | `0 4px 4px 0 #cfd1d6` | Button_Primary icon-only・Popover |

### Z-index

| CSS変数 | 値 | 配置要素 |
|---|---|---|
| `--z-base` | 0 | 時刻スロット背景 |
| `--z-raised` | 10 | 現在時刻インジケーター |
| `--z-sticky` | 100 | NavBar・TagBar |
| `--z-floating` | 150 | Bottom bar・Search button |
| `--z-popover` | 170（`floating + 20`） | CalendarDatePicker popover ❌ |
| Modal overlay | 160（`floating + 10`） | Modal背景 ❌ |
| `--z-toast` | 9999 | Snackbar ❌ |

---

## Motion ✅

### Duration & Easing

```
--duration-base:  200ms
--duration-slow:  350ms
--duration-modal: 240ms

--easing-standard: cubic-bezier(0.4, 0, 0.2, 1)
--easing-modal:    cubic-bezier(0.33, 1, 0.68, 1)
```

**Liquid アニメーション**（TagBar collapse/expand）:

```
--duration-liquid-squish: 130ms
--duration-liquid-expand: 260ms
--duration-liquid:         420ms

--easing-liquid-squish: cubic-bezier(0.55, 0, 0.85, 0.45)
--easing-liquid-expand: cubic-bezier(0.22, 1, 0.36, 1)
```

### 用途マッピング

| 用途 | duration | easing |
|---|---|---|
| hover時の色変化・Toggle active | `base` | `standard` |
| Business/Defaultモード切替 | `slow` | `standard` |
| Modal 入退場 | `modal` | `modal` |
| Segment indicator移動 | `base` | `standard` |
| Toggle Switch ノブ移動 | `base` | `standard` |
| TagBar 折りたたみ（squish） | `liquid-squish` | `liquid-squish` |
| TagBar 展開（expand） | `liquid-expand` | `liquid-expand` |

### Modal アニメーション詳細

- Overlay: `opacity 0→1`、`background transparent→rgba(16,18,23,0.32)`、`backdrop-filter blur(0)→blur(3px)`
- Dialog: `opacity 0→1`、`filter blur(12px)→blur(0)`、`transform scale(0.988)→scale(1)`
- `prefers-reduced-motion: reduce` 対応あり（全transition無効化）

---

## レイアウトシステム

### ページ構造（Home screen）

```
┌─────────────────────────────────────────────────┐
│ NAV BAR   height: fit-content（≈97px）           │
│  [NANJI? logo]  [Group 1 ▾]            [⚙]     │
├─────────────────────────────────────────────────┤
│ TAG BAR   height: fit-content                   │
│  [toolbar: collapse toggle]                     │
│  [🏠 Vancouver] [🇨🇦 城 ×] [+ Add city] [⊗]  │
│                                         [💾]    │
├─────────────────────────────────────────────────┤
│ TIME TABLE   height = 可変（viewport残余）       │
│  ← 16px →                                      │
│  [City1] ←8px→ [City2] ←8px→ [City3] ...      │
│   176px           176px           176px         │
│                                                 │
│  ─────────── 10:07 ─────────── (現在時刻線)    │
└─────────────────────────────────────────────────┤
│ BOTTOM BAR   position:absolute bottom固定        │
│  [Default | Business hours]      [↩] [🔍]      │
└─────────────────────────────────────────────────┘
```

### TagBar の構造（詳細）

```
TagBar（幅100%）
  ├── toolbar row（常時表示）
  │    └── [collapse toggle: "▾ Cities (N)"]
  └── bar row（モバイルでは折りたたみ可能）
       ├── [Home tag] [City tag × N] [Add city] [Clear all / Edit group]
       └── right: [Save as group button]
```

**折りたたみトグル**:

| 項目 | ルール |
|---|---|
| 表示 | **全画面幅で表示**（PC でもモバイルでも） |
| 初期状態 | 640px 以下: 折りたたみ（collapsed）/ 641px 以上: 展開 |
| 折りたたみ時 | `.barCollapsed { display: none }` でタグ行を非表示 |
| トグル UI | `.collapseToggle` — 13px / weight 600 / 高さ 32px |

### City bundle（各都市の縦構造）

```
City bundle（176px × 可変高）
  ├── City heading（176 × 118px）— カード、margin-bottom: -16px でフレームに重なる
  └── Time frame（176 × 可変高）— 時刻グリッド
      内部: 24 × Time box（176 × 42px）= 1008px
```

City headingのmargin-bottom: -16px（`--city-heading-overlap`）により、HeadingとTime frameが16px重なって接続される。

---

## コンポーネント仕様

### 1. Logo（node: 48:4781）

| プロパティ | 値 |
|---|---|
| 表示高 | 32px（デスクトップ）・24px（モバイル≤640px） |
| 形式 | `<img>` タグ（PNG） |
| 配置 | NavBar左端 |

---

### 2. City Tag（node: 27:1151）

**共通**:
- Height: `34px`
- Radius: `--radius-control`（pill）
- Typography: `Text/Bold/S`（14px 600）
- padding-y: `8px`

**Homeバリアント**:

| プロパティ | 値 |
|---|---|
| BG | `--color-surface-control-primary`（`#2a2c31`） |
| テキスト色 | `--color-text-on-primary` |
| アイコン色 | `--color-icon-on-primary` |
| Border | なし |
| padding-left | `14px`（Icon_Home左） |
| padding-right | `16px` |
| gap | `8px` |
| アイコン | Icon_Home（左）・Icon_Clear（左） |

**Cityバリアント（State/Group/InGroup 7パターン）**:

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

> グループビュー中にグループ未登録都市（temp）は **3アイコン** 構成: `Icon_Clear`（左）・表示切替（右1）・`Icon_Add`（右2）。

padding-left: `16px`、padding-right: `14px`（アイコン右）、gap: `4px`

---

### 3. City heading（node: 24:2030）

| プロパティ | 値 |
|---|---|
| 寸法 | 176 × 118px（モバイル: 114px） |
| Radius | `--radius-card`（16px） |
| Shadow | `--shadow-card` |
| Padding | 16px（全辺） |
| 内部gap | 8px |
| margin-bottom | `-16px`（Time frameとのオーバーラップ） |

**Homeパターン**:

| 要素 | CSS変数 | Light Hex |
|---|---|---|
| BG | `--color-surface-cityheading-home` | `#2a2c31` |
| 時刻（大）色 | `--color-text-cityheading-home-time` | `#ffffff` |
| 都市名色 | `--color-text-cityheading-home-label` | `#dcdee3` |
| 日付色 | `--color-text-cityheading-home-label` | `#dcdee3` |
| 左アイコン | `--color-icon-on-primary` | `#ffffff` |

**Otherパターン**:

| 要素 | CSS変数 | Light Hex |
|---|---|---|
| BG | `--color-surface-cityheading-other` | `#ffffff` |
| Border | `--color-border-cityheading-other` | `transparent`（dark: `#2a2e38`） |
| 時刻（大）色 | `--color-text-cityheadingtime` | `#36383d` |
| 都市名色 | `--color-text-primary` | `#101217` |
| 日付色 | `--color-text-cityheading-other-date` | `#5d5f64` |

**Typography**:
- 時刻大表示: `--font-display` 40px 500（desktop）・36px 500（mobile）
- 都市名: Hanken Grotesk 16px 600
- 日付: Hanken Grotesk 12px 400

**都市名 ellipsis**:

| 要素 | ルール |
|---|---|
| `.headingCityName` | `flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; height: 20px; line-height: 20px` |
| アクセシビリティ | `title` 属性に `{countryFlag} {cityName}` 全文を設定（省略時ホバーで確認） |

**Do**: 長い都市名（日本語含む）は1行 ellipsis  
**Don't**: 折り返し（wrap）で heading 高さを押し広げない

---

### 4. Time Box（node: 24:234）

| プロパティ | 値 |
|---|---|
| 幅 | `width: 100%`（親コンテナ176pxに追従） |
| 高さ | `42px`（固定） |
| padding | `12px 16px` |
| Typography | Hanken Grotesk 16px 400（`Text/Regular/M`） |
| text-align | `right`（通常）/ `space-between`（DateTag付き） |
| border-bottom | 1px `--color-border-timeslot` |

**DateTag付き（00:00スロット）**:
- `justify-content: space-between`
- `padding-left: 8px; padding-right: 16px`

**テキストカラー**（Default mode）:

| 時間帯 | CSSクラス | 色 |
|---|---|---|
| 00:00–05:00 / 18:00–23:00 | `.slotLight` | `--color-text-timeslot-inverse`（白） |
| 06:00–17:00 | `.slotDark` | `--color-timeline-slot-text`（= `text.primary`、`#101217`） |

**Business modeのCSS**:

| 状態 | CSSクラス | BG | テキスト | border-bottom |
|---|---|---|---|---|
| active | `.slotBizActive` | `--color-timeslot-business-active` | `--color-timeline-slot-text` | `--color-border-timeslot-business` |
| inactive | `.slotBizInactive` | `--color-timeslot-business-inactive` | `--color-timeline-slot-text` | `--color-border-timeslot-business` |
| offhour | `.slotBizOff` | `--color-timeslot-business-offhour` | `--color-text-timeslot-inverse` | `--color-border-timeslot` |

---

### 5. Date Tag（node: 24:3937）

| プロパティ | 値 |
|---|---|
| 高さ | `20px`（固定） |
| 幅 | **hug（コンテンツ幅）** — `inline-flex`、`width` 指定なし |
| BG | `--color-surface-subtle`（`#ffffff26`） |
| テキスト色 | `--color-text-date-tag`（`#e9ebf0`） |
| Typography | Hanken Grotesk 12px 600 |
| Radius | `--radius-date-badge`（8px） |
| padding | `0 8px` |
| flex-shrink | `0` |

**テキスト内容（locale 別）**:

| locale | 形式 | 例 |
|---|---|---|
| ja | `M/D（曜）` | `6/26（金）` |
| en | `EEE, MMM d` | `Thu, Jun 26` |

> ❌ 撤回済み: `width: 88px` による固定幅（日英文字数差でレイアウト崩れが出るため不採用）

---

### 6. 24hours / Time frame（node: 33:1650 / 33:3064）

| コンポーネント | 寸法 | 説明 |
|---|---|---|
| `24hours` | 176 × 1008px | 24個のTime boxを縦積みした内部コンテンツ |
| `Time frame` | 176 × 可変高 | 24hoursをカードコンテナで包んだもの |

**Time frame**:
- Radius: `--radius-card`（16px）
- Shadow: `--shadow-card`
- `clip-path: inset(0 round 16px)` で角丸クリッピング
- 上フェード: 124px（`linear-gradient(to bottom, fade-100, fade-0)`）
- 下フェード: 156px（`linear-gradient(to top, fade-100, fade-0)`）

**Mode**:
- Default: 各スロットに `--gradient-time-of-day`
- Business: 各スロットに3状態のsurface token

---

### 7. Toggle / Segment control（node: 33:4350 / 33:4368）

**Bottom barのDefault/Business切替**に使用するセグメントコントロール。TimeSearch modalのタブ切替にも同パターンを使用。

**コンテナ**:

| プロパティ | 値 |
|---|---|
| BG | `--color-surface-control-tag`（`#f6f8fd`） |
| Border | 1px `--color-border-strong`（`#5d5f64`） |
| Radius | `--radius-control`（pill） |
| Padding | `4px`（全辺） |
| Gap（セグメント間） | `8px` |

**インジケーター**（active backgroundをアニメーション）:

| プロパティ | 値 |
|---|---|
| BG | `--color-surface-segment-active`（`#2a2c31`） |
| Radius | `--radius-control`（pill） |
| Transition | `transform` + `width`、`duration.base`、`easing.standard` |

**セグメント状態**:

| 状態 | padding | テキスト色 | アイコン |
|---|---|---|---|
| Active | `8px 16px` | `--color-text-segment-active` | `--color-icon-segment-active` |
| Inactive（左端） | `8px 0 8px 16px` | `--color-text-muted` | なし |
| Inactive（右端） | `8px 16px 8px 0` | `--color-text-muted` | なし |

**Bottom barでのセグメント配置**:

| 位置 | ラベル | Active時のアイコン |
|---|---|---|
| 左 | "Default" | なし（テキストのみ） |
| 右 | "Business hours" | Icon_Business（14px） |

> Figmaラベルに "Defalut"（タイポ）があるが、実装テキストは "Default" が正しい。

---

### 8. Button_Primary（node: 33:4301）

**共通スタイル**:
- BG: `--color-surface-control-primary`（`#2a2c31`）
- テキスト色: `--color-text-on-primary`（`#f6f8fd`）
- アイコン色: `--color-icon-on-primary`（`#ffffff`）
- Radius: `--radius-button`（16px）

**3バリアント**:

| Variant | 内容 | W | H | Shadow | padding | 配置 |
|---|---|---|---|---|---|---|
| `icon-only` | アイコン1個 | 49px | 49px | `--shadow-floating` あり | `0` | Bottom bar（Search）・TagBar（Save） |
| `text-only` | テキストのみ | 100% | — | なし | `14px`（全辺） | モーダル内アクション全般 |
| `icon + text` ⚠️ | アイコン+テキスト | 202px | 53px | `--shadow-floating` あり | — | 現在未使用（Figmaにのみ定義） |

**Typography**（text-only）: Hanken Grotesk 16px 600

**役割**: ユーザーフローを前進させる主軸アクション（確定・実行・保存・ジャンプ）。

---

### 9. Button_Secondary（node: 48:4622）

**共通スタイル**:
- BG: `--color-surface-control-action`（`#ffffff`）
- Border: 1px `--color-border-default`（`#e9ebf0`）
- テキスト色: `--color-text-primary`
- アイコン色: `--color-icon-default`（`#83858a`）
- Radius: `--radius-button`（16px）

**2バリアント**:

| Variant | 内容 | W | H | 配置 |
|---|---|---|---|---|
| `icon-only` | アイコン1個（Icon_Setting / Icon_Return） | 49px | 49px | NavBar右端・Bottom bar（Back to now） |
| `icon + text` | Icon_Group + グループ名 + Icon_arrow | 可変 | 45px | NavBar（groupBtn） |

**NavBar groupBtnの特記**: `font-weight: 500`（他のButtonラベルは600）

**役割**: 主フローを補助する副次的な操作（設定・グループ切替・前の画面に戻る）。

---

### 10. Button_Destructive ❌

削除など破壊的アクション専用。現在はGroupEditor modalのみで使用。

| プロパティ | 値 |
|---|---|
| BG | `--color-surface-control-action`（`#ffffff`） |
| Border | 1px `--color-border-default` |
| テキスト色 | `--color-accent-current-time`（`#e2483d`） |
| Radius | `--radius-button`（16px） |
| W × H | 100% × — |
| padding | `14px`（全辺） |
| Typography | Hanken Grotesk 16px 600 |

---

### 11. Add City（node: 31:1505）

| プロパティ | 値 |
|---|---|
| H | `34px` |
| BG | `--color-surface-control-action`（`#ffffff`） |
| Border | 1px **dashed** `--color-border-default` |
| Radius | `--radius-control`（pill） |
| padding | `8px 16px 8px 14px` |
| Typography | `Text/Bold/S`（14px 600） |
| テキスト色 | `--color-text-primary` |
| アイコン | Icon_Add（16px）、`--color-icon-default` |
| gap | `6px` |

**バリアント**:
- `Default`: 通常
- `Blinking`: `animation: blink 1.8s infinite`（`box-shadow` パルス）

---

### 12. Clear All（node: 27:1262）

| プロパティ | 値 |
|---|---|
| H | `34px` |
| BG | `--color-surface-control-action` |
| Border | 1px **solid** `--color-border-default` |
| Radius | `--radius-control`（pill） |
| padding | `8px 16px 8px 14px` |
| Typography | `Text/Bold/S`（14px 600） |
| アイコン | Icon_ClearAll（16px） |

---

### 13. Current time（node: 65:2581）✅

**配置**:
- 幅: Time tableの左端〜右端いっぱい
- 縦位置: ホーム都市の現在時刻スロットのY座標
- Z-index: `--z-raised`（10）

**スタイル**:
- 横線: 1px、`--color-accent-current-time`（`#e2483d`）
- バッジ: BG=`--color-accent-current-time`、テキスト=`--color-text-timeslot-inverse`（白）、Radius=`--radius-date-badge`（8px）、padding=`2px 8px`、left=`16px`、`translateY(-50%)`
- バッジ文字: Hanken Grotesk 12px 600、"HH:MM"形式

---

### 14. Toggle Switch ❌

ON/OFFを切り替えるスイッチ。Settings modal・GroupEditor modal・HomeCity modal で使用。

| プロパティ | 値 |
|---|---|
| W × H | 48px × 28px |
| Radius | `--radius-control`（pill） |
| BG（OFF） | `--color-surface-switch-off`（`#e9ebf0`） |
| BG（ON） | `--color-surface-switch-on`（`#2a2c31`） |

**ノブ**:

| プロパティ | 値 |
|---|---|
| W × H | 22px × 22px（円形） |
| top / left（初期位置） | 3px / 3px |
| BG（OFF） | `--color-surface-switch-knob`（`#ffffff`） |
| BG（ON） | `--color-surface-switch-knob-active`（`#ffffff` light / `#101217` dark） |
| ON時位置 | `translateX(20px)` |
| Transition | `transform duration.base easing.standard` |

---

### 15. Modal ❌

**Overlay**:

| プロパティ | 値 |
|---|---|
| position | `fixed`、inset: 0 |
| Z-index | `--z-floating + 10`（160） |
| BG | `rgba(16,18,23,0.32)` |
| backdrop-filter | `blur(3px)` |
| padding | `16px` |
| align | `flex-start`（上寄せ）、`justify-content: center` |
| Transition | `duration.modal`、`easing.modal` |

**Dialog**:

| プロパティ | 値 |
|---|---|
| W | `min(480px, 100%)`（wide: `min(580px, 100%)`） |
| max-height | `min(640px, 100dvh - 32px)` |
| BG | `--color-surface-elevated` |
| Radius | `--radius-modal`（24px） |
| Shadow | `--shadow-card` |
| Enter animation | `scale(0.988)→1` + `blur(12px)→0` + `opacity 0→1` |

**Header**:
- padding: `16px`
- border-bottom: 1px `--color-border-subtle`
- Title: `--font-display` 24px 500（`Heading/Regular/2XL`）
- Close button: 32×32px、`--radius-control`

**Body**: padding `16px`、overflow-y: auto

---

### 16. Snackbar ❌

一時的な通知表示。

| プロパティ | 値 |
|---|---|
| BG | `--color-surface-inverse`（`#2a2c31`） |
| テキスト色 | `--color-text-inverse`（`#f6f8fd`） |
| padding | `10px 20px` |
| Radius | `--radius-button`（16px） |
| Typography | Hanken Grotesk 14px 600 |
| Z-index（floating） | `--z-toast`（9999） |
| 配置（floating） | `position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%)` |
| 配置（inline） | `position: static; margin-top: 16px; text-align: center` |

---

### 17. アイコン（node: 48:4966）

| Icon名 | size | 用途 | 実装 |
|---|---|---|---|
| `Icon_Home` | 14×14px | City tag（Home）・City heading（Home） | stroke |
| `Icon_Show` | 14×14px | 都市を表示する | **fill**（例外） |
| `Icon_Hide` | 14×14px | 都市を非表示にする | stroke |
| `Icon_Clear` | 14×14px | 都市をタグから削除（×） | stroke |
| `Icon_Add` | 16×16px | Add city・グループへ追加 | stroke |
| `Icon_ClearAll` | 16×16px | Clear all | stroke |
| `Icon_Save` | 18×18px | Save as group | stroke |
| `Icon_Setting` | 18×18px | 設定 | stroke |
| `Icon_Group` | 18×18px | グループ | stroke |
| `Icon_arrow` | 15×15px | ドロップダウン矢印 | stroke |
| `Icon_Search` | 24×24px | 検索 | stroke |
| `Icon_Business` | 14×14px | Business hours toggle | stroke |
| `Icon_Return` | 18×18px | タイムラインへ戻る（node: 80:2562） | stroke |

**ルール**: アイコンは `currentColor` で色を継承する。直接HEXを指定しない。例外は `Icon_Show` のみ `fill="currentColor"`。

**サイズ標準化方針**: 現状のFigmaコンポーネントはサイズがバラバラ（14・15・16・18・24px）。今後の推奨方針として、Figmaコンポーネントを一律 `20×20px` で登録し、UIへの配置時にサイズを指定して拡大縮小する運用とする。

---

### 18. Display City Tag（Time Search 用）❌

Figma node: 未定義（コードのみ）

**用途**: Time Search modal 内で「表示中の都市」をタグ選択する UI  
**使用箇所**: 単一日時タブ → 対象都市（トグル選択）／複数候補タブ → 基準都市（単一選択）・対象都市（複数トグル）

**ベーススタイル（`.displayCityTag`）**:

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

**選択状態（`.displayCityTagSelected`）**:

| プロパティ | 値 |
|---|---|
| background | `--color-surface-segment-active` |
| color | `--color-text-segment-active` |

**ホーム都市（`.displayCityTagHome.displayCityTagSelected`）**:

| プロパティ | 値 |
|---|---|
| border-color | `--color-border-strong` |
| ラベル prefix | `🏠` + 国旗 + 都市名 |

**インタラクション**:

| タブ | 選択モード | 動作 |
|---|---|---|
| 単一日時・対象都市 | 単一（トグル） | クリックで選択 / 再クリックで解除 |
| 複数候補・基準都市 | 単一 | クリックで基準都市変更 |
| 複数候補・対象都市 | 複数（トグル） | クリックで追加/削除。上限 10 都市 |

**除外ルール**: 基準都市は対象都市タグから除外。基準都市変更時、対象リストから新基準都市を自動除外。

---

### 19. Time Search Modal — フィールド構成 ❌

Figma node: 未定義（コードのみ）  
**ファイル**: `src/features/time-search/TimeSearchModal.tsx`, `MultiCandidatePanel.tsx`

**共通 UI パターン**:

| 要素 | スタイル | 用途 |
|---|---|---|
| `.label` | 12px / weight 600 / `--color-text-muted` | フィールド見出し |
| `.fieldHint` | 11px / `--color-text-muted` / margin-bottom 10px | ラベル直下の説明文 |
| `.subLabel` | 11px / weight 600 / `--color-text-muted` | グループタグ見出し等 |
| Segment tabs | §7 Toggle/Segment control と同一パターン | 単一日時 / 相対 / 複数候補 |

**単一日時タブ**:

| フィールド | UI | デフォルト |
|---|---|---|
| 基準都市 | CityCombo | ホーム都市 |
| 対象都市 | Display City Tag + CityCombo | 未選択（任意） |
| 日付 | CalendarDatePicker | ホーム TZ の今日 |
| 時刻 | hour + minute select | 現在時刻（分は 0 or 30） |

対象都市 placeholder（ja）: `都市を検索して追加...`

**複数候補タブ**:

| フィールド | UI | デフォルト |
|---|---|---|
| 基準都市 | Display City Tag + CityCombo | **ホーム都市** |
| 基準都市ヒント（ja） | fieldHint | `下記から選択するか、検索して基準都市を選択してください。` |
| 日程候補 | 日付 + 開始/終了時刻（最大 10） | 1 件 |
| 対象都市 | Display City Tag + Group Tag + 選択済み chip + CityCombo | **表示中都市（基準除く）** |
| 対象都市ヒント（ja） | fieldHint | `下記から選択するか、検索して追加してください。` |

**対象都市 — 選択済み chip（`.targetTag`）**（Display City Tag とは別。選択中の全都市を表示）:

| プロパティ | 値 |
|---|---|
| height | `34px` |
| padding | `0 10px 0 12px` |
| border-radius | `--radius-control` |
| border | 1px `--color-border-default` |
| background | `--color-surface-control-tag` |
| font-size | `14px` / weight `600` |
| 削除 | × ボタン（IconClear 12px） |

**グループタグ（`.groupTag`）**:

| 状態 | 見た目 |
|---|---|
| 通常 | pill / 11px 600 / border `--color-border-strong` |
| 追加済み | opacity `0.4` + `disabled` + `--groupTagAdded` |

---

## 新規ページ作成チェックリスト

**基本構造**
- [ ] NavBar + TagBar + TimeTable + BottomBar の4層構造を使う
- [ ] BottomBar は `position: absolute; bottom: 0`、z-index: `--z-floating`

**カラー**
- [ ] ページ背景: `--color-surface-default`（`#fdffff`）
- [ ] テキスト: `--color-text-primary`（`#101217`）
- [ ] TimeトークンをUI surface（カード・ボタン・背景）に使用しない
- [ ] 時刻スロット背景: Default=`--gradient-time-of-day`（スロット単位）、Business=3状態token

**タイポグラフィ**
- [ ] UIテキスト: `--font-ui`（Hanken Grotesk）
- [ ] 時刻の大表示: `--font-display`（Newsreader）
- [ ] フォントサイズ: 11・12・13・14・16・24・40pxのいずれかを使う

**コンポーネント**
- [ ] タグ・コントロール: `--radius-control`（pill）
- [ ] Button_Primary / Button_Secondary: `--radius-button`（16px）
- [ ] Input / Select / Popover: `--radius-button`（16px）
- [ ] Modal: `--radius-modal`（24px）
- [ ] カードには `--shadow-card` を適用
- [ ] Button_Primary icon-only / Button_Secondary: shadow `--shadow-floating`

**Business mode**
- [ ] 3状態（active / inactive / offhour）すべて実装
- [ ] offhourテキストを `--color-text-timeslot-inverse`（白）にする
- [ ] Business用スロット区切りは `--color-border-timeslot-business`（dark border）

---

## Do / Don't

| Do ✅ | Don't ❌ |
|---|---|
| スロット単位でグラデーション（`repeat-y`）を適用する | 列コンテナにグラデーションをまとめて適用する |
| タグ・コントロールに `--radius-control`（999px）を使う | ボタン以外に `--radius-button` を流用する（役割が違う） |
| Button_Primary・Secondaryに `--radius-button`（16px）を使う | タグに `--radius-button` を使う |
| Time boxの高さを `42px` に固定する | Time boxに `width: 176px` を直接指定する（`width: 100%` が正しい） |
| Business modeは3状態で実装する | offhour背景にデフォルトと同じテキスト色を使う |
| アイコンは `currentColor` で色を継承させる | アイコンに直接HEXカラーを当てる |
| Button_Primary text-only のpadding は `14px`（全辺）にする | UI操作ラベルに `--font-display` を使う（見出し・Modal titleは正当な使用） |
| Input・Select・Popoverの角丸は `--radius-button`（16px）にする | `--color-surface-default`（`#fdffff`）と `#ffffff` を同一視する |
| 日本語都市名は `getCityDisplayName()` を使う | `city.name` / `city.nameJa` を画面直書きする |
| Date Tag（スロット内）は `formatDateTag()` を使う | 列ヘッダー用 `formatDateHeading()` をスロット内に流用する |
| Date Tag 幅は hug（コンテンツ幅）にする | Date Tag に固定 width を指定する |
| Modal overlay は `align-items: flex-start` で上端固定 | 高さ可変モーダルを `center` 配置のままにする |
| TagBar 折りたたみトグルは全 BP で表示 | PC のみトグルを非表示にする |
| Time Search の都市選択は Tag + Search の併用 | Search のみ / Tag のみに限定しない |

---


## 未確認・未実装の項目

| 項目 | ステータス | 補足 |
|---|---|---|
| `color.accent.current-time` | ✅ 確認済み | `#e2483d` |
| Current Time Indicator | ✅ 実装済み | |
| Dark mode | ✅ 実装済み | Figmaには未定義 |
| Toggle Switch | ✅ 実装済み | Figmaには未定義 |
| Modal | ✅ 実装済み | Figmaには未定義 |
| Snackbar | ✅ 実装済み | Figmaには未定義 |
| City Search modal | ✅ 実装済み | Figmaには未設計 |
| Time Search modal | ✅ 実装済み | Figmaには未設計 |
| Settings modal | ✅ 実装済み | Figmaには未設計 |
| Group Editor modal | ✅ 実装済み | Figmaには未設計 |
| HomeCity modal | ✅ 実装済み | Figmaには未設計 |
| Onboarding page | ✅ 実装済み | Figmaには未設計 |
| Button_Primary icon+text（text label=True） | ⚠️ Figmaに定義あり | 現在コードで未使用 |
| `color.text.secondary` / `color.text.disabled` | ❌ 未定義 | 将来用。現在は `text.muted` で代用 |
| Neutral palette中間ステップ | ⚠️ 一部未確認 | /350-/550等は未確認 |
| 全インタラクティブ要素のHover/Focus/Disabled状態 | ❌ 未設計 | |
| Mobile layout（タイムテーブル） | ❌ 部分対応 | NavBar・TagBar・City headingのモバイル調整のみ |

---

## Appendix — コンポーネント一覧

| コンポーネント名 | Figma node | ステータス |
|---|---|---|
| Logo | 48:4781 | ✅ |
| City Tag | 27:1151 | ✅ |
| City_tag_group | 31:1382 | ✅ |
| Add City | 31:1505 | ✅ |
| Clear All | 27:1262 | ✅ |
| City Heading | 24:2030 | ✅ |
| Time Box | 24:234 | ✅ |
| 24hours | 33:1650 | ✅ |
| Time Frame | 33:3064 | ✅ |
| Date Tag | 24:3937 | ✅ |
| Button_Primary | 33:4301 | ✅（3バリアント） |
| Button_Secondary | 48:4622 | ✅ |
| Button_Destructive | — | ❌ Figma未定義 |
| Toggle / Segment control | 33:4350 / 33:4368 | ✅ |
| Toggle Switch | — | ❌ Figma未定義 |
| Modal | — | ❌ Figma未定義 |
| Snackbar | — | ❌ Figma未定義 |
| Current time | 65:2581 | ✅ |
| アイコン（13種） | 48:4966 | ✅ |
| Display City Tag | — | ❌ Figma未定義（コード実装済み） |
| Time Search modal | — | ❌ Figma未定義（実装済み）|

---

## Appendix — 命名の問題点

| 現在の名前 | 問題 | 推奨名 |
|---|---|---|
| `Defalut`（Toggle / State=Off ラベル） | タイポ | "Default" |
| `State=Defalut`（Add city バリアント名） | タイポ | `State=Default` |
| `color.surface.subtlw` | タイポ（Figma Variables） | `color.surface.subtle` |

---

*このドキュメントはコード実態を正として記述。❌ はFigmaに未定義のコード実装。*
