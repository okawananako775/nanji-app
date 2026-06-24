# NANJI? Token Architecture

**ステータス凡例**
- ✅ 確定（Figmaから実値取得済み）
- 🔲 構造確定・実値未取得
- 📐 Primitive参照なし・semantic単独定義

**Figma格納先凡例**
- `VAR` = Figma Variables
- `TEXT` = Figma Text Styles
- `EFFECT` = Figma Effect Styles

---

## 全体構造

```
Primitive layer  → 原始値（生の数値・色）             → Figma Variables / Text Styles
Semantic layer   → 役割名（コンポーネントはここを参照）→ Figma Variables / Text Styles / Effect Styles
```

コンポーネントはPrimitiveを直接参照しない。必ずSemanticを経由する。

**Figmaへの格納ルール**

| カテゴリ | 格納先 |
|---|---|
| Color（単色） | Variables |
| Typography（composite） | Text Styles |
| Shadow（composite） | Effect Styles |
| Number（spacing / radius / z-index / duration） | Variables |

---

## 1. Color `VAR`

### Primitive（既存）✅

#### Neutral palette

| Token | Hex |
|---|---|
| `Neutral/40` | `#ffffff` |
| `Neutral/100` | `#f6f8fd` |
| `Neutral/150` | `#e9ebf0` |
| `Neutral/200` | `#dcdee3` |
| `Neutral/250` | `#cfd1d6` |
| `Neutral/300` | `#c3c5ca` |
| `Neutral/500` | `#909297` |
| `Neutral/600` | `#5d5f64` |
| `Neutral/750` | `#36383d` |
| `Neutral/900` | `#101217` |

> Neutral/50〜950の中間ステップのうち未確認：350, 400, 450, 550, 650, 700, 800, 850, 950。

#### Time palette ✅（グラデーションCSSから全実値確定）

| Token | RGB | Hex | 時間帯 |
|---|---|---|---|
| `Time/50` | rgb(28, 42, 76) | `#1c2a4c` | 00:00 |
| `Time/100` | rgb(32, 41, 75) | `#20294b` | 01:00 |
| `Time/150` | rgb(47, 56, 94) | `#2f385e` | 02:00 |
| `Time/200` | rgb(55, 64, 105) | `#374069` | 03:00 |
| `Time/250` | rgb(98, 97, 135) | `#626187` | 04:00 |
| `Time/300` | rgb(140, 130, 165) | `#8c82a5` | 05:00 |
| `Time/350` | rgb(245, 200, 195) | `#f5c8c3` | 06:00 |
| `Time/400` | rgb(255, 215, 175) | `#ffd7af` | 07:00 |
| `Time/450` | rgb(245, 235, 210) | `#f5ebd2` | 08:00 |
| `Time/500` | rgb(240, 242, 218) | `#f0f2da` | 09:00 |
| `Time/550` | rgb(235, 248, 225) | `#ebf8e1` | 10:00 |
| `Time/600` | rgb(230, 248, 220) | `#e6f8dc` | 11:00 |
| `Time/650` | rgb(255, 228, 120) | `#ffe478` | 12:00 |
| `Time/700` | rgb(255, 214, 108) | `#ffd66c` | 13:00 |
| `Time/750` | rgb(255, 200, 95) | `#ffc85f` | 14:00 |
| `Time/800` | rgb(255, 188, 88) | `#ffbc58` | 15:00 |
| `Time/850` | rgb(255, 175, 80) | `#ffaf50` | 16:00 |
| `Time/900` | rgb(255, 150, 70) | `#ff9646` | 17:00 |
| `Time/950` | rgb(255, 110, 70) | `#ff6e46` | 18:00 |
| `Time/1000` | rgb(235, 80, 75) | `#eb504b` | 19:00 |
| `Time/1050` | rgb(190, 70, 85) | `#be4655` | 20:00 |
| `Time/1100` | rgb(154, 61, 81) | `#9a3d51` | 21:00 |
| `Time/1150` | rgb(86, 44, 74) | `#562c4a` | 22:00 |
| `Time/1200` | rgb(50, 35, 70) | `#322346` | 23:00 |

---

### Semantic ✅

#### surface

**設計原則：同じ値でも役割が違えばトークンは分ける。**
値が同じPrimitiveを参照していても、将来独立して変更できるよう役割単位でトークンを定義する。

| Token | Hex | 役割 | 使用コンポーネント |
|---|---|---|---|
| `color.surface.default` | `#fdffff` | 静的な背景（わずかに青みがかった白） | ページ背景 |
| `color.surface.elevated` | `#ffffff` | ページより上に浮くカード | City heading（Other） |
| `color.surface.inverse` | `#2a2c31` | ダーク背景 | City heading（Home）・Toggle（active segment） |
| `color.surface.subtle` | `#ffffff26` | 半透明の軽い背景 | Date tag |
| `color.surface.fade-overlay.100` | `#fdffff` | Time frameフェード（不透明端） | Time frame上端フェード |
| `color.surface.fade-overlay.0` | `#fdffff00` | Time frameフェード（透明端） | Time frame上端フェード |
| `color.surface.control.tag.default` | `#f6f8fd` | 選択タグの背景 | City tag（Others）・Toggle container |
| `color.surface.control.action` | `#ffffff` | アクションボタンの背景 | Button_Secondary・Add City・Clear All |
| `color.surface.control.primary.default` | `#2a2c31` | 主操作ボタンの背景 | City tag（Home）・Button_Primary |
| `color.surface.button` | `#ffffff` | （旧名。`control.action` に移行中） | 移行期のみ参照 |

**Business mode 時刻スロット（3状態）**

| Token | Hex | 時間帯 | テキスト色 |
|---|---|---|---|
| `color.surface.timeslot.business.active` | `#eff0a4` | 09:00–16:00（業務時間） | `color.text.primary` |
| `color.surface.timeslot.business.inactive` | `#d8dfe9` | 06:00–08:00 / 17:00–21:00（前後の時間帯） | `color.text.primary` |
| `color.surface.timeslot.business.offhour` | `#374069` | 00:00–05:00 / 22:00–23:00（深夜） | `Neutral/40`（白） |

> **`control.tag.default` vs `control.action`**: タグ（都市選択UI）は `#f6f8fd`（わずかに青みがかった白）、アクションボタン（Add/Clear/Secondary）は `#ffffff`（純白）で意図的に色を分けている。視覚的に「選択タグ」と「アクション」を区別するためのデザイン判断。

> Default mode の時刻カラム背景は `surface` tokenではなく `gradient.time-of-day` を使用。

#### text

| Token | Hex | 用途 |
|---|---|---|
| `color.text.primary` | `#101217` | 通常テキスト全般 |
| `color.text.cityheadingtime` | `#36383d` | City heading（Other）の時刻大表示 |
| `color.text.secondary` | 🔲 未取得 | 補足テキスト（将来用） |
| `color.text.muted` | `#909297` | ラベル・プレースホルダー・Toggle inactive |
| `color.text.inverse` | `#f6f8fd` | 暗い背景上のテキスト |
| `color.text.disabled` | 🔲 未取得 | 無効状態（将来用） |

**Default mode 時刻スロットのテキスト色ルール**

| 時間帯 | Time token | テキスト色 | 理由 |
|---|---|---|---|
| 00:00–05:00 | Time/50–300 | `Neutral/40`（白） | 背景が暗い |
| 06:00 | Time/350 | `Neutral/900`（黒） | 明るい背景へ切り替わり |
| 07:00–21:00 | Time/400–1100 | `Neutral/900`（黒） | 背景が明るい〜中程度 |
| 22:00–23:00 | Time/1150–1200 | `Neutral/40`（白） | 背景が暗くなる |

> Figmaコード上では 06:00 を境に text color が切り替わっている（`Neutral/900` へ）。

#### border

| Token | Hex | 用途 |
|---|---|---|
| `color.border.default` | `#e9ebf0` | カード・City tag（Others）枠 |
| `color.border.subtle` | `#f6f8fd` | 軽い区切り線 |
| `color.border.strong` | `#5d5f64` | Toggle button container枠 |
| `color.border.timeslot` | `rgba(255,255,255,0.15)` | 時刻スロット間の区切り線 |

#### icon

| Token | Hex | 用途 |
|---|---|---|
| `color.icon.default` | `#83858a` | 通常アイコン（明るい背景上） |
| `color.icon.inverse` | `#ffffff` | 反転アイコン（暗い背景上） |

#### accent

| Token | Hex | 用途 |
|---|---|---|
| `color.accent.current-time` | `#e2483d` | 現在時刻ライン・バッジ ✅ |

---

### Gradient ✅

```css
gradient.time-of-day = linear-gradient(
  to bottom,
  {Time/50}    4%,
  {Time/100}   8%,
  {Time/150}   12%,
  {Time/200}   16%,
  {Time/250}   20%,
  {Time/300}   24%,
  {Time/350}   28%,
  {Time/400}   32%,
  {Time/450}   36%,
  {Time/500}   40%,
  {Time/550}   44%,
  {Time/600}   48%,
  {Time/650}   52%,
  {Time/700}   56%,
  {Time/750}   60%,
  {Time/800}   64%,
  {Time/850}   68%,
  {Time/900}   72%,
  {Time/950}   76%,
  {Time/1000}  80%,
  {Time/1050}  84%,
  {Time/1100}  88%,
  {Time/1150}  92%,
  {Time/1200}  95.902%
)
```

| プロパティ | 値 |
|---|---|
| `background` | `gradient.time-of-day` |
| `background-size` | `100% 960px` |
| `background-repeat` | `repeat-y` |
| `background-position` | `0 0` |

繰り返し時の境目（Time/1200 → Time/50）は視認可能。意図的な仕様。

---

## 2. Typography `TEXT`

> Figmaでの格納先は **Text Styles**（Variablesではない）。コンポーネントはText Styleで参照する。

### Primitive（フォントファミリー）✅

```
font.family.ui      = "Hanken Grotesk"
font.family.display = "Newsreader"
```

### Figma Text Styles（確定）✅

| Figma Style名 | family | size | weight | style | lineHeight |
|---|---|---|---|---|---|
| `Text/Bold/M` | Hanken Grotesk | 16px | 600 | SemiBold | 1.3 |
| `Text/Bold/S` | Hanken Grotesk | 14px | 600 | SemiBold | 1.3 |
| `Text/Bold/XS` | Hanken Grotesk | 12px | 600 | SemiBold | 1.3 |
| `Text/Regular/M` | Hanken Grotesk | 16px | 400 | Regular | 1.3 |
| `Text/Regular/XS` | Hanken Grotesk | 12px | 400 | Regular | 1.3 |
| `Heading/Regular/4XL` | Newsreader | 40px | 500 | Medium | 1.3 |

### Semantic（役割 → Figma Text Styleのマッピング）

| Semantic名 | Figma Text Style | 使用箇所 |
|---|---|---|
| `text.time-large` | `Heading/Regular/4XL` | City headingの時刻大表示 |
| `text.city-name` | `Text/Bold/M` | City headingの都市名 |
| `text.date` | `Text/Regular/XS` | City headingの日付 |
| `text.slot-label` | `Text/Regular/M` | 時刻スロットラベル |
| `text.tag-label` | `Text/Bold/S` | City tag・Toggle |
| `text.button-label` | `Text/Bold/M` | Button_Primary label |
| `text.date-tag` | `Text/Bold/XS` | Date tag（日付変わり目） |

> ロゴ「NANJI?」のText Styleは未確認。別途取得が必要。

---

## 3. Spacing `VAR`

> Figmaでは `Numbers/*` として Variables に格納されている。

### Primitive（Numbers）✅（一部確定）

| Figma Variable名 | 値 | 用途 |
|---|---|---|
| `Numbers/5XS` | `0` | Shadow offset x / spread |
| `Numbers/3XS` | `4px` | Shadow offset y（Elevation/S） |
| `Numbers/2XS` | `8px` | Shadow offset y（Elevation/M）・gap |
| `Numbers/M` | `16px` | Shadow blur（Elevation/M）・padding |

> Numbers/XS, S, L など他のステップは未取得。

### Semantic

| Token | 値 | 用途 |
|---|---|---|
| `space.layout.page-edge` | `16px` | ビューポート端〜コンテンツ左端 |
| `space.layout.column-gap` | `24px` | City column間のgap |
| `space.component.inset-sm` | `8px` | タグ内側padding（py） |
| `space.component.inset-md` | `16px` | カード・ボタン内側padding |
| `space.component.stack-xs` | `4px` | アイコン–テキスト間gap（Toggle） |
| `space.component.stack-sm` | `8px` | アイコン–テキスト間gap（Button） |

---

## 4. Radius `VAR`

### Figma Variables（確定）✅

| Figma Variable名 | 値 | 適用コンポーネント |
|---|---|---|
| `Radius/Card` | `16px` | City heading card・Time frame |
| `Radius/Button` | `16px` | Button_Primary・Button_Secondary のみ |
| `Radius/Control` | `999px`（pill） | City tag・Add city・Clear all・Toggle container・その他操作UI |
| `Radius/Date badge` | `8px` | Date tag |

> **`Radius/Button` と `Radius/Card` は同値（16px）だが別トークン。** 役割で分けておくことで将来の変更に対応できる。

### 使い分けルール

| トークン | 対象 |
|---|---|
| `Radius/Button` | **Button_Primary・Button_Secondaryのみ** |
| `Radius/Control` | それ以外の全操作UI（タグ・コントロール・トグル系） |
| `Radius/Card` | カードコンテナ（City heading・Time frame） |
| `Radius/Date badge` | Date tag |

---

## 5. Shadow / Elevation `EFFECT`

> Figmaでの格納先は **Effect Styles**（Variablesではない）。

### Figma Effect Styles ✅

| Figma Style名 | type | color | offset | radius | spread |
|---|---|---|---|---|---|
| `Elevation/M` | DROP_SHADOW | `Neutral/300`（`#c3c5ca`） | (0, 8px) | 16px | 0 |
| `Elevation/S` | DROP_SHADOW | `Neutral/250`（`#cfd1d6`） | (0, 4px) | 4px | 0 |

### Semantic

| Token | Figma Effect Style | 適用コンポーネント |
|---|---|---|
| `shadow.card` | `Elevation/M` | City heading card |
| `shadow.floating` | `Elevation/S` | Button_Primary（フローティング） |
| `shadow.modal` | 🔲 未定義 | モーダル（将来用） |

---

## 6. Motion `VAR`

### Primitive ✅

```
motion.duration.instant    =   0ms
motion.duration.fast       = 100ms
motion.duration.base       = 200ms
motion.duration.slow       = 350ms

motion.easing.standard = cubic-bezier(0.4, 0, 0.2, 1)
motion.easing.enter    = cubic-bezier(0, 0, 0.2, 1)
motion.easing.exit     = cubic-bezier(0.4, 0, 1, 1)
motion.easing.spring   = cubic-bezier(0.34, 1.56, 0.64, 1)
```

### Semantic

| Token | duration | easing | 使用場面 |
|---|---|---|---|
| `motion.transition.color` | base | standard | hover時の背景色変化 |
| `motion.transition.mode-switch` | slow | standard | Business/Default切替（全カラム一斉変化） |
| `motion.transition.appear` | base | enter | モーダル・パネルの出現 |
| `motion.animation.blink` | slow | spring + loop | Add city ブリンク状態 |

---

## 7. Z-index `VAR`

### Semantic 📐

| Token | 値 | 配置要素 |
|---|---|---|
| `zIndex.below` | -1 | 使用禁止 |
| `zIndex.base` | 0 | Time slot背景 |
| `zIndex.raised` | 10 | 現在時刻インジケーター |
| `zIndex.sticky` | 100 | NavBar・TagBar（スクロール追従） |
| `zIndex.floating` | 150 | Search button・Save button |
| `zIndex.overlay` | 200 | モーダル背景（将来） |
| `zIndex.modal` | 300 | モーダルコンテンツ（将来） |
| `zIndex.tooltip` | 400 | ツールチップ（将来） |

---

## トークン総数サマリー

| カテゴリ | Primitive | Semantic | 格納先 |
|---|---|---|---|
| Color（Neutral） | 10確定 + 残未取得 | — | VAR |
| Color（Time） | 24確定 | — | VAR |
| Color（surface） | — | 10確定 | VAR |
| Color（text） | — | 4確定 + 1（cityheadingtime）+ 2未取得 | VAR |
| Color（border） | — | 4確定 | VAR |
| Color（icon） | — | 2確定 | VAR |
| Color（accent） | — | 1確定 | VAR |
| Gradient | — | 1確定 | （コード定義） |
| Typography | 2（font family） | 7（Text Style mapping） | TEXT |
| Spacing（Numbers） | 4確定 + 残未取得 | 6 | VAR |
| Radius | 4確定 | 4 | VAR |
| Shadow | — | 2確定 + 1未定義 | EFFECT |
| Motion | 8 | 4 | VAR |
| Z-index | — | 8 | VAR |

---

## 未解決事項

| 項目 | 内容 |
|---|---|
| ロゴのText Style | Figma上のText Style名未確認 |
| `color.text.secondary` / `color.text.disabled` | 将来用トークン。実値未取得 |
| Neutral palette中間ステップ | 350, 400, 450, 550, 650, 700, 800, 850, 950 未取得 |
| Numbers スケール（XS, S, L など） | 残りのステップ未取得 |
| `color.surface.button` 移行 | 旧トークン名。`color.surface.control.action` への移行が完了したら削除する |
