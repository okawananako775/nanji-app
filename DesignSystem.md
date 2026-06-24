# NANJI? Design System

**Version**: 2.1 (Figma Variables 全取得・反映)
**Figma file**: `m5cRpfLlQaGrkws43f7XTd` — canvas "Design file" (node 48:4823)
**Last updated**: 2026-06-17
**Product**: NANJI? — World timezone comparison web application (desktop-first)

---

## このドキュメントの使い方

このドキュメントは、AIがNANJI?の新しいページや機能をコーディングする際の設計ルールリファレンスです。

**基本的な使い方**:
1. 新しい要素を実装するとき → 「コンポーネント仕様」セクションを参照する
2. 色や余白を決めるとき → 必ず「トークン」セクションのトークン名を使う。直接HEX値をハードコードしない
3. 新しいページを作るとき → 「新規ページ作成チェックリスト」に従う
4. ルールに迷ったとき → 「Do/Don't」を確認する

**記号の意味**:
- ✅ Figmaで実値確認済み
- ⚠️ 未確認（暫定値 — 実装前にFigmaで確認すること）
- ❌ Figmaで未定義（将来対応）

---

## デザイン原則

1. **時刻は色で語る。** 時間帯ごとに対応する色がある。色は装飾ではなく、深夜・夜明け・朝・昼・夕・夜を一目で伝える情報である。

2. **ホーム都市がすべての基準。** ホーム都市のカードは常にダークで目立つ。他の都市はホームとの相対関係として存在する。

3. **密度はあるが、ノイズはない。** 最大6都市を同時表示しながら視覚的な混乱を起こさない。タイポは小さく、間隔は締まり、余白は意図的に使われている。

4. **モード切替は再設計ではなくフィルタリング。** Business hoursモードは既存スロットの色を変えるだけで、構造・レイアウトは変わらない。

5. **操作UIは無彩色。** ボタン・タグ・トグルはすべてモノクロ。色は時刻スケールのためだけに存在する。

---

## カラートークン ✅

> Figma格納先: **Variables**（単色）。コンポーネントは必ずセマンティックトークンを経由すること。

### Primitive — Neutral palette

| Token | Hex | 主な用途 |
|---|---|---|
| `Neutral/40` | `#ffffff` | 暗い背景上のテキスト（Business/offhour・深夜スロット）= `Color/Icon/Inverse` |
| `Neutral/100` | `#f6f8fd` | `Color/Text/Inverse`・`Color/Surface/Control/Tag/Default` と同値 |
| `Neutral/150` | `#e9ebf0` | Date tagテキスト色 |
| `Neutral/250` | `#cfd1d6` | Shadow（Elevation/S）のカラー |
| `Neutral/300` | `#c3c5ca` | Shadow（Elevation/M）のカラー |
| `Neutral/500` | `#909297` | `Color/Text/Muted` と同値 |
| `Neutral/900` | `#101217` | `Color/Text/Primary` と同値 |

> Neutral/200, 350-450, 550-899, 950 は未確認。

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

| Token | Hex | 役割 | 使用コンポーネント |
|---|---|---|---|
| `color.surface.default` | `#fdffff` | ページ背景（わずかに青みがかった白） | ページ背景 |
| `color.surface.elevated` | `#ffffff` | 浮いているカード背景（純白） | City heading（Other） |
| `color.surface.inverse` | `#2a2c31` | ダーク背景 | City heading（Home）・Toggle active segment |
| `color.surface.subtle` | `#ffffff26` | 半透明白オーバーレイ | Date tag背景 |

**フェードオーバーレイ**（Time frameの上下グラデーション用）

| Token | Hex | 説明 |
|---|---|---|
| `color.surface.fade-overlay.100` | `#fdffff` | フェード不透明端（= surface.default と同値） |
| `color.surface.fade-overlay.0` | `#fdffff00` | フェード透明端 |

> Time frameの上部（124px）・下部（156px）のフェードはこの2トークンで `background: linear-gradient(to bottom, fade-overlay.100, fade-overlay.0)` を適用する。

**操作UI背景**

| Token | Hex | 役割 | 使用コンポーネント |
|---|---|---|---|
| `color.surface.control.tag.default` | `#f6f8fd` | タグ型コントロールの背景（やや青みがかった白） | City tag（City type）・Toggle container |
| `color.surface.control.action` | `#ffffff` | アクションボタンの背景（純白） | Add city・Clear all・Button_Secondary |
| `color.surface.control.primary.default` | `#2a2c31` | プライマリコントロールの背景（ダーク） | City tag（Home）・Button_Primary・Toggle active |
| `color.surface.button` | `#ffffff` | ← `control.action` の旧名称。現在は両方Figmaに存在。 | （移行中） |

> **control.tag vs control.action の使い分け**:  
> `control.tag` = 状態を持つUI（「〇〇を選択中」を示す）→ City tag, Toggle container  
> `control.action` = 操作を起動するUI（「何かをする」ボタン）→ Add city, Clear all, Button_Secondary  
> 視覚的に区別されるよう意図的に別値（tag: `#f6f8fd`、action: `#ffffff`）が割り当てられている。

> `color.surface.default`（`#fdffff`）は純白（`#ffffff`）とは異なる。肉眼では区別しにくいが実装では値をそのまま使うこと。

---

### Semantic — 時刻スロット surface ✅

**Default mode（グラデーション）**:
- 各スロットの背景は `gradient.time-of-day` を使用する（下記「グラデーション実装」参照）
- 個別のカラートークンではなくグラデーション背景を繰り返す方式

**Business mode（3状態）**:

| Token | Hex | 時間帯 | テキスト色 |
|---|---|---|---|
| `color.surface.timeslot.business.active` | `#eff0a4` | 09:00–16:00（業務時間） | `color.text.primary`（暗い） |
| `color.surface.timeslot.business.inactive` | `#d8dfe9` | 06:00–08:00 / 17:00–21:00（前後の時間帯） | `color.text.primary`（暗い） |
| `color.surface.timeslot.business.offhour` | `#374069` | 00:00–05:00 / 22:00–23:00（深夜） | `Neutral/40`（`#ffffff`、白） |

---

### Semantic — text ✅

| Token | Hex | 用途 |
|---|---|---|
| `color.text.primary` | `#101217` | 通常テキスト全般（明るい背景の上） |
| `color.text.inverse` | `#f6f8fd` | 暗い背景の上のテキスト（Toggle active・Button_Primary ラベル） |
| `color.text.muted` | `#909297` | ラベル・プレースホルダー・Toggle inactive text |
| `color.text.cityheadingtime` | `#36383d` | City heading（Other）の時刻大表示専用。primary より薄く、muted より濃い中間値 |

> **City heading（Home）のテキスト色**は `color.text.inverse` を使わずPrimitiveを直参照している:  
> 時刻（大） → `Neutral/40`（`#ffffff`、純白）  
> 都市名・日付 → `Neutral/200`（`#dcdee3`、オフホワイト）  
> これはHomeカード上で「時刻を最も目立たせる」ための意図的な3段階ヒエラルキー。セマンティックトークン化は今後の課題。

---

### Semantic — border ✅

| Token | 値 | 用途 |
|---|---|---|
| `color.border.default` | `#e9ebf0` | カード・City tag（In group=Falseの場合）の枠線 |
| `color.border.strong` | `#5d5f64` | Toggle button container の枠線・City tag（Group view=True + In group=True）の枠線 |
| `color.border.subtle` | `#f6f8fd` | 薄いボーダー（= Neutral/100）。将来用 |
| `color.border.timeslot` | `#ffffff26`（≒ rgba(255,255,255,0.15)） | 時刻スロット間の区切り線（Default modeのみ） |

---

### Semantic — icon ✅

| Token | 値 | 用途 |
|---|---|---|
| `color.icon.default` | `#83858a` | 標準アイコン色（テキストより薄いグレー） |
| `color.icon.inverse` | `#ffffff` | 暗い背景上のアイコン色（純白） |

---

### Semantic — accent ✅

| Token | 値 | 用途 |
|---|---|---|
| `color.accent.current-time` | `#e2483d` | 現在時刻ライン・バッジ背景 |

---

## グラデーション実装 ✅

Default modeの時刻カラム背景は、24時間分のグラデーションを繰り返すことで実装する。

```css
.time-column-default {
  background-image: linear-gradient(
    to bottom,
    #1c2a4c 0%,       /* Time/50    00:00 */
    #1c2a4c 2.083%,   /* Time/50    00:00  (00:00のピーク中央) */
    #20294b 6.25%,    /* Time/100   01:00 */
    #2f385e 10.417%,  /* Time/150   02:00 */
    #374069 14.583%,  /* Time/200   03:00 */
    #626187 18.75%,   /* Time/250   04:00 */
    #8c82a5 22.917%,  /* Time/300   05:00 */
    #f5c8c3 27.083%,  /* Time/350   06:00 */
    #ffd7af 31.25%,   /* Time/400   07:00 */
    #f5ebd2 35.417%,  /* Time/450   08:00 */
    #f0f2da 39.583%,  /* Time/500   09:00 */
    #ebf8e1 43.75%,   /* Time/550   10:00 */
    #e6f8dc 47.917%,  /* Time/600   11:00 */
    #ffe478 52.083%,  /* Time/650   12:00 */
    #ffd66c 56.25%,   /* Time/700   13:00 */
    #ffc85f 60.417%,  /* Time/750   14:00 */
    #ffbc58 64.583%,  /* Time/800   15:00 */
    #ffaf50 68.75%,   /* Time/850   16:00 */
    #ff9646 72.917%,  /* Time/900   17:00 */
    #ff6e46 77.083%,  /* Time/950   18:00 */
    #eb504b 81.25%,   /* Time/1000  19:00 */
    #be4655 85.417%,  /* Time/1050  20:00 */
    #9a3d51 89.583%,  /* Time/1100  21:00 */
    #562c4a 93.75%,   /* Time/1150  22:00 */
    #322346 97.917%,  /* Time/1200  23:00 */
    #322346 100%      /* Time/1200  23:00  (末端) */
  );
  background-size: 100% 1008px;  /* 24スロット × 42px = 1008px で1サイクル */
  background-repeat: no-repeat;
  background-position-y: calc(var(--start-hour, 0) * -42px);
}
```

**`--start-hour` の設定ルール**:

| 状況 | `--start-hour` の値 | 例（background-position-y） |
|---|---|---|
| 00:00から表示（通常） | `0` | `0px` |
| 06:00から表示 | `6` | `-252px` |
| 現在時刻から表示 | 現在の時（整数） | `calc(currentHour * -42px)` |

```html
<!-- 例: Tokyo列が04:00始まりの場合 -->
<div class="time-column-default" style="--start-hour: 4;">
  <!-- 04:00のTime/200（#374069）が先頭に来る -->
</div>
```

**パーセンテージの計算式**: `1スロット = 42px / 1008px = 100% / 24 ≈ 4.1667%`。各時刻の中央 = `(hour + 0.5) × 4.1667%`。

**仕様上の注意**:
- `background-size` は `1008px`（24スロット × 42px）。Time frameの表示高960pxと異なる点に注意
- `background-repeat: no-repeat` — 24時間を超える表示はしないため繰り返し不要
- 時間帯をまたぐ表示（例: 23:00〜02:00のローリングウィンドウ）が必要な場合は別途検討が必要

---

## 時刻テキスト色アルゴリズム

### Default mode

| 時間帯 | 時刻 | テキスト色 | 判定基準 |
|---|---|---|---|
| 深夜 | 00:00–05:00 | `Neutral/40`（`#ffffff`、白） | 背景が暗い（Time/50–300） |
| 夜明け以降〜夕方 | 06:00–17:00 | `color.text.primary`（`#101217`、黒） | 背景が明るい（Time/350–900） |
| 夕方〜深夜 | 18:00–23:00 | `Neutral/40`（`#ffffff`、白） | 背景が再び暗くなる（Time/950–1200） |

**実装ルール**: 00:00–05:00 と 18:00–23:00 は白テキスト。06:00–17:00 は `color.text.primary`。

### Business mode

| 状態 | 背景 | テキスト色 |
|---|---|---|
| `active`（09:00–16:00） | `#eff0a4`（明るい黄） | `color.text.primary` |
| `inactive`（06:00–08:00 / 17:00–21:00） | `#d8dfe9`（明るい青灰） | `color.text.primary` |
| `offhour`（00:00–05:00 / 22:00–23:00） | `#374069`（暗いネイビー） | `Neutral/40`（`#ffffff`） |

---

## タイポグラフィ ✅

> Figma格納先: **Text Styles**（Variablesではない）。

### フォントファミリー

| 役割 | フォント | 用途 |
|---|---|---|
| `font.family.ui` | **Hanken Grotesk** | ラベル・ボタン・タグ・時刻ラベルなどUI全般 |
| `font.family.display` | **Newsreader** | City headingの大きな時刻表示 |

### Figma Text Styles（確定）

| Style名 | family | size | weight | lineHeight | 使用箇所 |
|---|---|---|---|---|---|
| `Text/Bold/M` | Hanken Grotesk | 16px | SemiBold (600) | 1.3 | City名・Buttonラベル |
| `Text/Bold/S` | Hanken Grotesk | 14px | SemiBold (600) | 1.3 | City tag・Toggle |
| `Text/Bold/XS` | Hanken Grotesk | 12px | SemiBold (600) | 1.3 | Date tag |
| `Text/Regular/M` | Hanken Grotesk | 16px | Regular (400) | 1.3 | 時刻スロットラベル |
| `Text/Regular/XS` | Hanken Grotesk | 12px | Regular (400) | 1.3 | 日付・補足テキスト |
| `Heading/Regular/4XL` | Newsreader | 40px | Medium (500) | 1.3 | City headingの時刻表示 |

### セマンティックマッピング

| 用途 | 使うText Style |
|---|---|
| City headingの時刻（大） | `Heading/Regular/4XL` |
| City headingの都市名 | `Text/Bold/M` |
| City headingの日付 | `Text/Regular/XS` |
| 時刻スロットのラベル | `Text/Regular/M` |
| City tag・Toggle のラベル | `Text/Bold/S` |
| Buttonのラベル | `Text/Bold/M` |
| Date tag | `Text/Bold/XS` |

---

## スペーシング ✅（一部確定）

> Figma格納先: `Numbers/*` としてVariablesに格納。

### Primitive — Numbers

| Variable名 | 値 | 用途 |
|---|---|---|
| `Numbers/5XS` | `0` | Shadow x-offset・spread |
| `Numbers/3XS` | `4px` | Shadow y-offset（Elevation/S） |
| `Numbers/2XS` | `8px` | Shadow y-offset（Elevation/M）・一部gap |
| `Numbers/M` | `16px` | Shadow blur（Elevation/M）・padding |

### セマンティック

| 用途 | 値 |
|---|---|
| ページ端のpadding | `16px` |
| City column間のgap | `24px` |
| カード内padding | `16px` |
| タグ内padding（上下） | `8px` |
| タグ内padding（左右） | `14px` / `16px`（バリアントによる） |
| City heading内のgap | `8px` |

### 主要コンポーネント寸法

| コンポーネント | W | H |
|---|---|---|
| City column幅 | 176px | — |
| City heading | 176px | 120px |
| Time box（1スロット） | 176px | 42px |
| Toggle button | 224px | 46px |

---

## ボーダー半径 ✅

> Figma格納先: Variables（`Radius/*`）。

### Token一覧

| Figma Variable | 値 | 適用コンポーネント |
|---|---|---|
| `Radius/Card` | `16px` | City heading card・Time frame |
| `Radius/Button` | `16px` | Button_Primary・Button_Secondary |
| `Radius/Control` | `999px`（pill） | City tag・Add city・Clear all・Toggle container |
| `Radius/Date badge` | `8px` | Date tag |

> **`Radius/Button` と `Radius/Card` は同値（16px）だが別トークン。**  
> ボタンが将来的にpillになったとき `Radius/Button` だけ変更できるよう分けて定義されている。

### radius/button vs radius/control の使い分けルール

| どちらを使うか | 対象 |
|---|---|
| `Radius/Button`（16px） | **Button_Primary・Button_Secondary のみ** |
| `Radius/Control`（999px） | City tag・Add city・Clear all・Toggle container・その他操作UI全般 |

> **新しい操作UIを追加するとき**: それが「ボタン（Button_Primary/Secondary）」なら `Radius/Button`、それ以外のタグ・コントロール・トグル系なら `Radius/Control` を使う。

---

## シャドウ / Elevation ✅

> Figma格納先: **Effect Styles**（Variablesではない）。

### Figma Effect Styles

| Style名 | type | color（hex） | x | y | blur | spread | 適用先 |
|---|---|---|---|---|---|---|---|
| `Elevation/M` | DROP_SHADOW | `#c3c5ca`（Neutral/300） | 0 | 8px | 16px | 0 | City heading card |
| `Elevation/S` | DROP_SHADOW | `#cfd1d6`（Neutral/250） | 0 | 4px | 4px | 0 | Button_Primary（フローティング） |

```css
/* Elevation/M */
box-shadow: 0 8px 16px 0 #c3c5ca;

/* Elevation/S */
box-shadow: 0 4px 4px 0 #cfd1d6;
```

---

## モーション ⚠️

> Figmaで未定義。以下は実装上の推奨値。

```
duration.instant =   0ms
duration.fast    = 100ms
duration.base    = 200ms
duration.slow    = 350ms

easing.standard = cubic-bezier(0.4, 0, 0.2, 1)
easing.enter    = cubic-bezier(0.0, 0.0, 0.2, 1)
easing.exit     = cubic-bezier(0.4, 0.0, 1.0, 1)
easing.spring   = cubic-bezier(0.34, 1.56, 0.64, 1)
```

| 用途 | duration | easing |
|---|---|---|
| hover時の背景色変化 | `duration.base` | `easing.standard` |
| Business/Defaultモード切替（全スロット一斉変化） | `duration.slow` | `easing.standard` |
| モーダル・パネルの出現 | `duration.base` | `easing.enter` |
| Add cityのブリンク | `duration.slow` + ループ | `easing.spring` |

---

## Z-index ⚠️

> Figmaで未定義。以下は実装上の推奨値。

| Token | 値 | 配置要素 |
|---|---|---|
| `zIndex.base` | 0 | 時刻スロット背景 |
| `zIndex.raised` | 10 | 現在時刻インジケーター |
| `zIndex.sticky` | 100 | NavBar・TagBar（スクロール追従） |
| `zIndex.floating` | 150 | Search button・Save button（底部フローティング） |
| `zIndex.overlay` | 200 | モーダル背景（将来） |
| `zIndex.modal` | 300 | モーダルコンテンツ（将来） |

---

## レイアウトシステム

### ページ構造（Home screen）

```
┌─────────────────────────────────────────────────┐
│ NAV BAR   h=97px                                │
│  [NANJI?👀]  [Group ラベル] [Group 1 ▾]  [⚙]  │
├─────────────────────────────────────────────────┤
│ TAG BAR   h=85px                                │
│  [🏠 Vancouver] [🇨🇦 城 ×] [+ Add city] [⊗]  │
│                              [📖 Save as group] │
├─────────────────────────────────────────────────┤
│ TIME TABLE   height = 可変（viewport残余）       │
│  ← 16px →                                      │
│  [City1] ←24px→ [City2] ←24px→ [City3] ...    │
│   176px            176px            176px       │
│                                                 │
│  ─────────── 10:07 ─────────── (現在時刻線)  ─ │
└─────────────────────────────────────────────────┤
│ BOTTOM BAR   overlay、bottom固定                │
│  [Business hours | Default]       [🔍 Search]   │
└─────────────────────────────────────────────────┘
```

### カラムグリッド

| プロパティ | 値 |
|---|---|
| カラム幅 | `176px` |
| カラム間gap | `24px` |
| 左端padding | `16px` |
| カラムstride | `200px`（176 + 24） |
| 最大カラム数 | 6（標準）|

**N番目の都市の左端X座標**: `16 + (N-1) × 200` px

### City bundle（各都市の縦構造）

```
City bundle（176px × 可変高）
  ├── City heading（176 × 120px） — カード
  └── Time frame（176 × 960px） — 時刻グリッド
      内部: 24 × Time box（176 × 42px）= 1008px
```

City headingとTime frameは縦に隣接（または微小な重なりで視覚的に接続）する。

---

## コンポーネント仕様

### 1. Logo（node: 48:4781）

| プロパティ | 値 |
|---|---|
| 表示寸法 | 200 × 33px |
| マスター寸法 | 540 × 90px |
| テキスト | "NANJI?👀" |
| カラー | `color.text.primary`（黒） |
| 配置 | NavBar左端 |
| バリアント | なし（1種） |

---

### 2. City Tag（node: 27:1151）

**構造**: 左アイコン + 都市名テキスト + 右アイコン（オプション）

**スタイル共通**:
- Height: `34px`（pill形状）
- Radius: `radius.control`（pill）
- Typography: `Text/Bold/S`
- padding-y: `8px`

**padding-xとgapはバリアントによって異なる**（アイコンの位置が左右で異なるため）:

| Type | padding-left | padding-right | gap |
|---|---|---|---|
| Home | `14px`（アイコン左） | `16px` | `8px` |
| City | `16px` | `14px`（アイコン右） | `4px` |

**バリアント一覧（7種）**:

| Type | State | Group view | In group | BG | Border | テキスト色 | アイコン |
|---|---|---|---|---|---|---|---|
| Home | Visible | False | True | `surface.control.primary.default`（`#2a2c31`） | なし | `text.inverse` | Icon_Home（左） |
| City | Visible | False | False | `surface.control.tag.default`（`#f6f8fd`） | 1px `border.default` | `text.primary` | Icon_Show（右）＋ Icon_Clear（右端） |
| City | Visible | True | True | `surface.control.tag.default` | 1px `border.strong` | `text.primary` | Icon_Show（右） |
| City | Visible | True | False | `surface.control.tag.default` | 1px `border.default` | `text.primary` | Icon_Show（右）＋ Icon_Add（右端） |
| City | Hidden | False | False | `surface.control.tag.default` | 1px `border.default` | `text.muted` | Icon_Hide（右）＋ Icon_Clear（右端） |
| City | Hidden | True | True | `surface.control.tag.default` | 1px `border.strong` | `text.muted` | Icon_Hide（右） |
| City | Hidden | True | False | `surface.control.tag.default` | 1px `border.default` | `text.muted` | Icon_Hide（右）＋ Icon_Add（右端） |

**プロパティの意味**:
- **Type=Home**: ホーム都市に適用 / **Type=City**: その他の都市に適用
- **State=Visible**: タイムラインに表示中 / **State=Hidden**: タイムラインから非表示中
- **Group view=True**: グループ表示モード中 / **Group view=False**: 通常（グループ以外）表示中
- **In group=True**: 現在選択中のグループに含まれる都市 / **In group=False**: グループに含まれない都市

**バリアント詳細（用途・見た目）**:

| Type | State | Group view | In group | 用途 | 見た目の特徴 |
|---|---|---|---|---|---|
| Home | Visible | False | True | ホーム都市。グループ以外のビューで常時固定表示 | ダーク背景（#2a2c31）・Icon_Home（左）・白テキスト・ボーダーなし |
| City | Visible | False | False | 通常ビューでタイムラインに表示中の都市 | 薄い背景・デフォルト枠・黒テキスト・Icon_Show＋Icon_Clear（削除） |
| City | Visible | True | True | グループ表示中、グループ内、タイムライン表示中 | 薄い背景・**強調枠**（#5d5f64）・黒テキスト・Icon_Showのみ |
| City | Visible | True | False | グループ表示中、グループ外、タイムライン表示中 | 薄い背景・デフォルト枠・黒テキスト・Icon_Show＋Icon_Add（グループへ追加） |
| City | Hidden | False | False | 通常ビューでタイムラインから非表示の都市 | 薄い背景・デフォルト枠・**ミュートテキスト**・Icon_Hide＋Icon_Clear（削除） |
| City | Hidden | True | True | グループ表示中、グループ内、タイムライン非表示 | 薄い背景・**強調枠**（#5d5f64）・ミュートテキスト・Icon_Hideのみ |
| City | Hidden | True | False | グループ表示中、グループ外、タイムライン非表示 | 薄い背景・デフォルト枠・ミュートテキスト・Icon_Hide＋Icon_Add（グループへ追加） |

> **In group=True と border.strong の関係**: グループに属する都市（In group=True）は強調枠（border.strong）で視覚的にグループ所属を示す。グループ外の都市はデフォルト枠のまま。

---

### 3. City heading（node: 24:2030）

**構造**:
- 行1（上）: Homeアイコン（Home patternのみ）+ 国旗emoji + 都市名
- 行2（中）: 大きな時刻表示
- 行3（下）: 曜日・日付

| プロパティ | 値 |
|---|---|
| 寸法 | 176 × 120px（固定） |
| Radius | `radius.card`（16px） |
| Shadow | `Elevation/M` |
| Padding | 16px（全辺） |
| 内部gap | 8px |

**バリアント**:

| Pattern | 背景 | 左アイコン |
|---|---|---|
| Home | `color.surface.inverse`（`#2a2c31`） | Homeアイコン（`color.icon.inverse`） |
| Other | `color.surface.elevated`（`#ffffff`） | なし |

**テキスト色（Homeパターン）**: セマンティックトークンではなくPrimitive直参照（意図的な3段階ヒエラルキー）

| 要素 | Token | 値 |
|---|---|---|
| 時刻（大） | `Neutral/40` | `#ffffff`（純白、最も目立つ） |
| 都市名 | `Neutral/200` | `#dcdee3`（オフホワイト） |
| 日付 | `Neutral/200` | `#dcdee3`（オフホワイト） |

**テキスト色（Otherパターン）**:

| 要素 | Token | 値 |
|---|---|---|
| 時刻（大） | `color.text.cityheadingtime` | `#36383d` |
| 都市名 | `color.text.primary` | `#101217` |
| 日付 | `color.border.strong` と同値の `Neutral/600` | `#5d5f64` |

**Typography**:
- 時刻大表示: `Heading/Regular/4XL`（Newsreader 40px Medium）
- 都市名: `Text/Bold/M`（Hanken Grotesk 16px SemiBold）
- 日付: `Text/Regular/XS`（Hanken Grotesk 12px Regular）

---

### 4. Time Box（node: 24:234）

1時間分の時刻スロット。24個積み重ねて24hoursを構成する。

| プロパティ | 値 |
|---|---|
| 幅 | **`width: 100%`**（親コンテナを満たす。176pxはコンテナ側の指定） |
| 高さ | `42px`（固定） |
| padding-y | 12px |
| padding-x | 16px |

> **⚠️ 実装注意**: Time box 自体に `width: 176px` を指定しないこと。親コンテナ（24hours / Time frame）が176px幅を持ち、Time boxはそれを`width: 100%`で満たす。固定値を指定するとコンテナに追従しない。

**テキスト**: `Text/Regular/M`（Hanken Grotesk 16px Regular）

**テキストカラールール**:

| モード | 時間帯 | Text color | トークン |
|---|---|---|---|
| Default | 00:00–05:00 / 18:00–23:00 | Inverse（白） | `text.inverse` |
| Default | 06:00–17:00 | Primary（黒） | `text.primary` |
| Business | 00:00–05:00 / 22:00–23:00 | Inverse（白） | `text.inverse` |
| Business | 06:00–21:00 | Primary（黒） | `text.primary` |

**Date tag**: `Date tag = true` バリアントは **00:00 のスロットのみ**に適用。日付変わり目の表示。layout は `justify-content: space-between; padding-left: 8px; padding-right: 16px`（date-tag 左・時刻右）。

**バリアント一覧**:

| Text color | Date tag | 使用条件 |
|---|---|---|
| Dark（Primary） | False | 通常スロット（時間帯依存） |
| Light（Inverse） | False | 深夜スロット（時間帯依存） |
| Light（Inverse） | True | 00:00 スロット（日付変わり目） |

---

### 5. Date Tag（node: 24:3937）

時刻スロット内に重ねて表示する日付変わり目インジケーター。

| プロパティ | 値 |
|---|---|
| 寸法 | 90 × 20px |
| 背景 | `color.surface.subtlw`（`rgba(255,255,255,0.15)`） |
| テキスト色 | `Neutral/150`（`#e9ebf0`） |
| Typography | `Text/Bold/XS`（12px SemiBold） |
| Radius | `radius.badge.date-tag`（8px） |

---

### 6. 24hours / Time frame（node: 33:1650 / 33:3064）

| コンポーネント | 説明 | 寸法 |
|---|---|---|
| `24hours` | 24個のTime boxを縦積みした内部コンテンツ | 176 × 1008px |
| `Time frame` | 24hoursをカードコンテナで包んだもの | 176 × 960px |

**バリアント（Mode）**:

| Mode | 背景実装 |
|---|---|
| Default | グラデーション（`gradient.time-of-day`） |
| Business | 各スロットに `color.surface.timeslot.business.*` を時間帯別に適用 |

**Time frameのコンテナ**:
- Radius: `radius.card`（16px）
- スロット間の区切り: `color.border.timeslot`（`rgba(255,255,255,0.15)`）、1px

---

### 7. Toggle / Toggle button（node: 33:4350 / 33:4368）

Business hours / Default modeを切り替えるセグメントコントロール。2つのFigmaコンポーネントで構成される。

**Toggle（33:4350）** — 個別セグメント:

| Variant | 内容 | 寸法 |
|---|---|---|
| State=On | Icon_Business + "Business hours"、`surface.inverse`（`#2a2c31`）、pill radius、px-16 py-8 gap-4 | 145px |
| State=Off | "Defalut"（タイポ）テキストのみ、`text.muted`（`#909297`）、pl-16 pr-0 py-8、icon なし | 79px |

**Toggle button（33:4368）** — 2セグメントを組み合わせたコンテナ:

| プロパティ | 値 |
|---|---|
| Radius | `radius.control`（pill） |
| Container BG | `color.surface.control.tag.default`（`#f6f8fd`） |
| Container Border | 1px `color.border.strong`（`#5d5f64`） |
| Container padding | `4px`（全辺） |
| 内部gap | `8px` |
| 幅 | Mode=Business: 224px、Mode=Default: 206px（テキスト長の違いによる差） |

**セグメント配置**: 左="Default" / 右="Business hours"（固定）

**セグメント状態**:

| Variant | 左（"Default"） | 右（"Business hours"） |
|---|---|---|
| Mode=Business | inactive: `text.muted`、アイコンなし | active: `surface.inverse`、Icon_Business |
| Mode=Default | active: `surface.inverse`、Icon_Business | inactive: `text.muted`、アイコンなし |

**アクティブセグメント**: px-16 py-8 gap-4、pill radius、Icon_Business（14px）+ テキスト
**インアクティブセグメント**: pl-16 pr-0 py-8、アイコンなし（内側padding=0）

**Typography**: `Text/Bold/S`（14px SemiBold）

> Figmaのラベルに "Defalut"（Toggle / State=Off）のタイポがあるが、実際の表示テキストは "Default" が正しい。

---

### 8. Button_Primary（node: 33:4301）

| バリアント | 内容 | 寸法 | 配置 |
|---|---|---|---|
| Text label=True | Icon_Save + "Save this as a group" | 202 × 53px | TagBar右端 |
| Text label=False | Icon_Search（24px） | 56 × 56px | Bottom bar右端（フローティング） |

**スタイル**:
- BG: `color.surface.control.primary.default`（`#2a2c31`）
- テキスト色: `color.text.inverse`（`#f6f8fd`）
- アイコン色: `color.icon.inverse`（`#ffffff`）
- Radius: **`Radius/Button`（16px）** — pillではなく16px角丸
- Shadow: `Elevation/S`（両バリアント共通）

**役割・使用場面**:
ユーザーフローの主軸となるポジティブなアクションに使用する。「保存」「決定」「検索実行」など、アプリの中心機能を前進させる行動に使う。画面内に1つが原則。Button_Secondaryと迷ったとき、そのアクションがユーザーフローを前進させるかどうかで判断する。

---

### 9. Button_Secondary（node: 48:4622）

| バリアント | 内容 | 寸法 | 配置 |
|---|---|---|---|
| Text label=True | Icon_Group + "Group 1" + Icon_arrow | 139 × 45px | NavBar |
| Text label=False | Icon_Setting（18px） | 49 × 49px | NavBar右端 |

**スタイル**:
- BG: `color.surface.control.action`（`#ffffff`）
- Border: 1px `color.border.default`（`#e9ebf0`）
- テキスト色: `color.text.primary`
- アイコン色: `color.icon.default`（`#83858a`）
- Radius: **`Radius/Button`（16px）** — pillではなく16px角丸

**役割・使用場面**:
Button_Primaryほど重要度が高くない、メイン機能に副次的な役割を果たすアクションに使用する。グループ管理・設定など、主フローをサポートする補助的な操作に使う。「このボタンがなくても主タスクは完了できる」ものがSecondary。

---

### 10. Add City（node: 31:1505）

| プロパティ | 値 |
|---|---|
| 寸法 | ~103 × 34px |
| BG | `color.surface.control.action`（`#ffffff`） |
| Border | 1px dashed `color.border.default` |
| Radius | `Radius/Control`（999px pill） |
| Typography | `Text/Bold/S` |
| アイコン | Icon_Add（16px）+ "Add city" |

**バリアント**:
- `State=Default`: 通常表示
- `State=Blinking`: パルスアニメーション（注意喚起）— `motion.animation.blink` 使用

---

### 11. Clear All（node: 27:1262）

| プロパティ | 値 |
|---|---|
| 寸法 | ~104 × 34px |
| BG | `color.surface.control.action`（`#ffffff`） |
| Border | 1px solid `color.border.default` |
| Radius | `Radius/Control`（999px pill） |
| アイコン | Icon_ClearAll（16px）+ "Clear all" |

---

### 12. Current time（node: 65:2581）✅

**配置ルール**:
- **幅**: Time tableの左端〜右端（表示中の全都市カラム幅いっぱい）。列数 × 200px - 24px。はみ出し禁止
- **縦位置**: ホーム都市の現在時刻スロットのY座標に合わせる
- **重なり順**: `zIndex.raised`（10）— Time boxより前面、NavBarより背面

**スタイル**:
- 横線: 1px水平線、`color.accent.current-time`（`#e2483d`）
- バッジ: `Radius/date-badge`（8px）、bg=`color.accent.current-time`（`#e2483d`）、text=`Neutral/40`（白）
- バッジ文字: `Text/Bold/XS`（12px SemiBold）、"HH:MM"形式
- バッジpadding: px-8 py-2

---

### 13. アイコン（node: 48:4966）

| Icon名 | size | 用途 |
|---|---|---|
| `Icon_Home` | 14×14px | City tag（Home）・City heading（Home） |
| `Icon_Show` | 14×14px | 都市を表示する |
| `Icon_Hide` | 14×14px | 都市を非表示にする |
| `Icon_Clear` | 14×14px | 都市をタグから削除（×） |
| `Icon_Add` | 16×16px | Add city |
| `Icon_ClearAll` | 16×16px | Clear all |
| `Icon_Save` | 18×18px | Save as group（Button_Primary） |
| `Icon_Setting` | 18×18px | 設定（Button_Secondary） |
| `Icon_Group` | 18×18px | グループ（Button_Secondary） |
| `Icon_arrow` | 15×15px | ドロップダウン矢印 |
| `Icon_Search` | 24×24px | 検索（Button_Primary icon-only） |
| `Icon_Business` | 14×14px | Business hours toggle |
| `Icon_return` | 18×18px | タイムラインへ戻る（node: 80:2562） |

**ルール**: アイコンは親要素から色を継承する（`currentColor`）。直接HEX値を指定しない。

> **例外**: `Icon_Show` のみ `stroke` ではなく `fill` を使用する（`fill="currentColor"`）。他の11アイコンはすべて `stroke="currentColor"`。

### SVGパスデータ（Figma実データ）

```svg
<!-- Icon_Home  14×14 -->
<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
<path d="M1.75 6.65004L7 2.33337L12.25 6.65004" stroke="currentColor" stroke-width="0.991667" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3.2085 5.7168V11.3751H10.7918V5.7168" stroke="currentColor" stroke-width="0.991667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Icon_Show  14×14  ★fillを使用（strokeではない） -->
<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd" d="M4.8125 7C4.8125 6.41984 5.04297 5.86344 5.4532 5.4532C5.86344 5.04297 6.41984 4.8125 7 4.8125C7.58016 4.8125 8.13656 5.04297 8.5468 5.4532C8.95703 5.86344 9.1875 6.41984 9.1875 7C9.1875 7.58016 8.95703 8.13656 8.5468 8.5468C8.13656 8.95703 7.58016 9.1875 7 9.1875C6.41984 9.1875 5.86344 8.95703 5.4532 8.5468C5.04297 8.13656 4.8125 7.58016 4.8125 7ZM7 5.6875C6.6519 5.6875 6.31806 5.82578 6.07192 6.07192C5.82578 6.31806 5.6875 6.6519 5.6875 7C5.6875 7.3481 5.82578 7.68194 6.07192 7.92808C6.31806 8.17422 6.6519 8.3125 7 8.3125C7.3481 8.3125 7.68194 8.17422 7.92808 7.92808C8.17422 7.68194 8.3125 7.3481 8.3125 7C8.3125 6.6519 8.17422 6.31806 7.92808 6.07192C7.68194 5.82578 7.3481 5.6875 7 5.6875Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M2.52175 6.21017C2.27733 6.5625 2.1875 6.83842 2.1875 7C2.1875 7.16158 2.27733 7.4375 2.52175 7.78983C2.75858 8.12992 3.10975 8.49917 3.55425 8.84042C4.445 9.52408 5.66592 10.0625 7 10.0625C8.33408 10.0625 9.555 9.52408 10.4457 8.84042C10.8902 8.49917 11.2414 8.12992 11.4782 7.78983C11.7227 7.4375 11.8125 7.16158 11.8125 7C11.8125 6.83842 11.7227 6.5625 11.4782 6.21017C11.2414 5.87008 10.8902 5.50083 10.4457 5.15958C9.555 4.47592 8.33408 3.9375 7 3.9375C5.66592 3.9375 4.445 4.47592 3.55425 5.15958C3.10975 5.50083 2.75858 5.87008 2.52175 6.21017ZM3.02108 4.46542C4.03083 3.69075 5.43433 3.0625 7 3.0625C8.56567 3.0625 9.96917 3.69075 10.9783 4.46542C11.4841 4.85333 11.9017 5.28617 12.1969 5.71142C12.4839 6.125 12.6875 6.57825 12.6875 7C12.6875 7.42175 12.4833 7.875 12.1969 8.28858C11.9017 8.71383 11.4841 9.14608 10.9789 9.53458C9.96975 10.3092 8.56567 10.9375 7 10.9375C5.43433 10.9375 4.03083 10.3092 3.02167 9.53458C2.51592 9.14667 2.09825 8.71383 1.80308 8.28858C1.51667 7.875 1.3125 7.42175 1.3125 7C1.3125 6.57825 1.51667 6.125 1.80308 5.71142C2.09825 5.28617 2.51592 4.85392 3.02108 4.46542Z" fill="currentColor"/>
</svg>

<!-- Icon_Hide  14×14 -->
<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
<path d="M1.75 5.83337C2.25113 6.44061 2.84112 6.96865 3.5 7.39962M3.5 7.39962C4.20962 7.86263 5.00186 8.18447 5.83333 8.34754C6.60406 8.49562 7.39594 8.49562 8.16667 8.34754C8.99814 8.18447 9.79037 7.86263 10.5 7.39962M3.5 7.39962L2.625 8.45837M12.25 5.83337C11.7489 6.44061 11.1589 6.96865 10.5 7.39962M10.5 7.39962L11.375 8.45837M5.83333 8.34696L5.54167 9.62504M8.16667 8.34696L8.45833 9.62504" stroke="currentColor" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Icon_Clear  14×14 -->
<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
<path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Icon_Add  16×16 -->
<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
<path d="M7.93235 3.6355V12.2287M3.63574 7.93211H12.229" stroke="currentColor" stroke-width="1.12373" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Icon_ClearAll  16×16  circle with × inside -->
<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
<path d="M7.93206 13.6169C11.0717 13.6169 13.6168 11.0718 13.6168 7.93218C13.6168 4.79258 11.0717 2.24744 7.93206 2.24744C4.79246 2.24744 2.24731 4.79258 2.24731 7.93218C2.24731 11.0718 4.79246 13.6169 7.93206 13.6169Z" stroke="currentColor" stroke-width="1.12373" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6.08142 6.0813L9.78312 9.78299M9.78312 6.0813L6.08142 9.78299" stroke="currentColor" stroke-width="1.12373" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Icon_Save  18×18  bookmark/ribbon shape (NOT floppy disk) -->
<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
<path d="M4.62732 2.84753H12.4578V14.2374L8.54257 11.6747L4.62732 14.2374V2.84753Z" stroke="currentColor" stroke-width="1.21017" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Icon_Setting  18×18  gear with center circle -->
<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
<path d="M9 11.25C10.2426 11.25 11.25 10.2426 11.25 9C11.25 7.75736 10.2426 6.75 9 6.75C7.75736 6.75 6.75 7.75736 6.75 9C6.75 10.2426 7.75736 11.25 9 11.25Z" stroke="currentColor" stroke-width="1.24475" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14.5501 10.7999C14.4481 11.0325 14.4179 11.2902 14.4633 11.5401C14.5087 11.79 14.6278 12.0206 14.8051 12.2024L14.8501 12.2474C15.1316 12.5288 15.2897 12.9106 15.2897 13.3086C15.2897 13.7067 15.1316 14.0884 14.8501 14.3699C14.5687 14.6513 14.1869 14.8095 13.7889 14.8095C13.3908 14.8095 13.0091 14.6513 12.7276 14.3699L12.6826 14.3249C12.5008 14.1475 12.2702 14.0285 12.0203 13.9831C11.7705 13.9376 11.5127 13.9679 11.2801 14.0699C11.0511 14.1681 10.8559 14.3312 10.7186 14.5392C10.5813 14.7471 10.508 14.9907 10.5076 15.2399V15.7499C10.5076 16.1477 10.3496 16.5292 10.0683 16.8105C9.78698 17.0918 9.40545 17.2499 9.00762 17.2499C8.6098 17.2499 8.22827 17.0918 7.94696 16.8105C7.66566 16.5292 7.50762 16.1477 7.50762 15.7499V15.6824C7.50243 15.4263 7.42023 15.1777 7.27174 14.969C7.12325 14.7603 6.91535 14.6012 6.67512 14.5124C6.44254 14.4104 6.18478 14.3801 5.93491 14.4256C5.68503 14.471 5.45441 14.59 5.27262 14.7674L5.22762 14.8124C5.08826 14.9517 4.92281 15.0623 4.74072 15.1377C4.55863 15.2131 4.36346 15.252 4.16637 15.252C3.96928 15.252 3.77412 15.2131 3.59203 15.1377C3.40994 15.0623 3.24449 14.9517 3.10512 14.8124C2.96576 14.673 2.85521 14.5076 2.77978 14.3255C2.70436 14.1434 2.66554 13.9482 2.66554 13.7511C2.66554 13.554 2.70436 13.3589 2.77978 13.1768C2.85521 12.9947 2.96576 12.8292 3.10512 12.6899L3.15012 12.6449C3.32748 12.4631 3.4465 12.2325 3.49193 11.9826C3.53737 11.7327 3.50714 11.475 3.40512 11.2424C3.30692 11.0134 3.14377 10.8182 2.93583 10.6809C2.7279 10.5436 2.48429 10.4702 2.23512 10.4699H2.25012C1.8523 10.4699 1.47077 10.3118 1.18946 10.0305C0.908157 9.74923 0.750122 9.3677 0.750122 8.96988C0.750122 8.57205 0.908157 8.19052 1.18946 7.90922C1.47077 7.62791 1.8523 7.46988 2.25012 7.46988H2.31762C2.5737 7.46469 2.82227 7.38249 3.03096 7.234C3.23965 7.08551 3.39878 6.87761 3.48762 6.63738C3.58964 6.40479 3.61987 6.14704 3.57443 5.89716C3.529 5.64728 3.40998 5.41667 3.23262 5.23488L3.18762 5.18988C2.88726 4.90842 2.71102 4.51917 2.69766 4.10776C2.68429 3.69635 2.83491 3.29649 3.11637 2.99613C3.39783 2.69577 3.78708 2.51952 4.19849 2.50616C4.6099 2.4928 5.00976 2.64342 5.31012 2.92488L5.35512 2.96988C5.53691 3.14723 5.76753 3.26626 6.01741 3.31169C6.26728 3.35712 6.52504 3.32689 6.75762 3.22488H6.75012C6.97492 3.12331 7.16542 2.95872 7.29854 2.75105C7.43167 2.54338 7.50169 2.30155 7.50012 2.05488V2.24988C7.50012 1.85205 7.65816 1.47052 7.93946 1.18922C8.22077 0.907913 8.6023 0.749878 9.00012 0.749878C9.39795 0.749878 9.77948 0.907913 10.0608 1.18922C10.3421 1.47052 10.5001 1.85205 10.5001 2.24988V2.31738C10.4986 2.56405 10.5686 2.80588 10.7017 3.01355C10.8348 3.22122 11.0253 3.38581 11.2501 3.48738C11.4827 3.58939 11.7405 3.61962 11.9903 3.57419C12.2402 3.52876 12.4708 3.40973 12.6526 3.23238L12.6976 3.18738C12.9791 2.90592 13.3608 2.74779 13.7589 2.74779C14.1569 2.74779 14.5387 2.90592 14.8201 3.18738C15.1016 3.46884 15.2597 3.85058 15.2597 4.24863C15.2597 4.64667 15.1016 5.02842 14.8201 5.30988L14.7751 5.35488C14.5978 5.53667 14.4787 5.76728 14.4333 6.01716C14.3879 6.26704 14.4181 6.52479 14.5201 6.75738V6.74988C14.6217 6.97467 14.7863 7.16518 14.994 7.2983C15.2016 7.43142 15.4435 7.50144 15.6901 7.49988H15.7501C16.1479 7.49988 16.5295 7.65791 16.8108 7.93922C17.0921 8.22052 17.2501 8.60205 17.2501 8.99988C17.2501 9.3977 17.0921 9.77923 16.8108 10.0605C16.5295 10.3418 16.1479 10.4999 15.7501 10.4999H15.6826C15.405 10.5269 15.1439 10.6442 14.9393 10.8339C14.7348 11.0236 14.598 11.2751 14.5501 11.5499V10.7999Z" stroke="currentColor" stroke-width="1.24475" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Icon_Group  18×18  folder shape (NOT stacked layers) -->
<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
<path d="M2.1355 5.26785C2.1355 4.89025 2.2855 4.52812 2.5525 4.26112C2.8195 3.99412 3.18163 3.84412 3.55923 3.84412H6.05075C6.42629 3.84947 6.7845 4.00298 7.04736 4.27123L7.75923 4.9831C8.02209 5.25135 8.3803 5.40487 8.75584 5.41022H13.5253C13.9029 5.41022 14.2651 5.56022 14.5321 5.82722C14.7991 6.09422 14.9491 6.45635 14.9491 6.83395V11.5323C14.9491 11.9098 14.7991 12.272 14.5321 12.539C14.2651 12.806 13.9029 12.956 13.5253 12.956H3.55923C3.18163 12.956 2.8195 12.806 2.5525 12.539C2.2855 12.272 2.1355 11.9098 2.1355 11.5323V5.26785Z" stroke="currentColor" stroke-width="1.21017" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Icon_arrow  15×15  chevron down -->
<svg width="15" height="15" viewBox="0 0 15 15" fill="none">
<path d="M3.05078 5.1864L7.32197 9.45759L11.5932 5.1864" stroke="currentColor" stroke-width="1.03729" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Icon_Search  24×24 -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
<path d="M10.9997 17.3999C14.5344 17.3999 17.3997 14.5345 17.3997 10.9999C17.3997 7.46523 14.5344 4.59985 10.9997 4.59985C7.46511 4.59985 4.59973 7.46523 4.59973 10.9999C4.59973 14.5345 7.46511 17.3999 10.9997 17.3999Z" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M19.9997 20L15.6997 15.7" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Icon_Business  14×14  briefcase -->
<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
<path d="M10.8496 4.43359H3.14958C2.50524 4.43359 1.98291 4.95593 1.98291 5.60026V10.0336C1.98291 10.6779 2.50524 11.2003 3.14958 11.2003H10.8496C11.4939 11.2003 12.0162 10.6779 12.0162 10.0336V5.60026C12.0162 4.95593 11.4939 4.43359 10.8496 4.43359Z" stroke="currentColor" stroke-width="0.991667" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4.90015 4.43339V3.55839C4.90015 3.24897 5.02306 2.95222 5.24186 2.73343C5.46065 2.51464 5.75739 2.39172 6.06681 2.39172H7.93348C8.2429 2.39172 8.53965 2.51464 8.75844 2.73343C8.97723 2.95222 9.10015 3.24897 9.10015 3.55839V4.43339" stroke="currentColor" stroke-width="0.991667" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M1.98291 7.23352H12.0162" stroke="currentColor" stroke-width="0.991667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Icon_return  18×18  node: 80:2562 -->
<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
<path d="M4.875 3L2.25 5.25L4.875 7.875" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2.25 5.25H10.8727C13.4539 5.25 15.6458 7.3575 15.7463 9.9375C15.8528 12.6637 13.6001 15 10.8727 15H4.49925" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

---

## 新規ページ作成チェックリスト

新しい画面やページを実装する際に、以下の順番で確認する:

**基本構造**
- [ ] NavBar（高さ97px）+ TagBar（高さ85px）+ メインコンテンツの3層構造を使う
- [ ] Bottom barはoverlay（position: fixed）でz-index: `zIndex.floating`（150）

**カラー**
- [ ] 背景色は `color.surface.default`（`#fdffff`）を使う
- [ ] テキストは `color.text.primary`（`#101217`）を使う
- [ ] TimeトークンとNeutral primitiveを直接使わず、必ずSemanticトークンを経由する
- [ ] 時刻スロット背景はDefault mode: `gradient.time-of-day`、Business mode: 3状態のsurface tokenを使う

**タイポグラフィ**
- [ ] UIテキストは Hanken Grotesk（`font.family.ui`）を使う
- [ ] 時刻の大表示（City heading）は Newsreader（`font.family.display`）を使う
- [ ] FontサイズはFigma Text Stylesのいずれかを使う（12/14/16/40px）

**コンポーネント**
- [ ] 操作UIのRadiusは `Radius/Control`（999px pill）を使う。ただし Button_Primary・Button_Secondary のみ `Radius/Button`（16px）
- [ ] Cardコンテナには `Elevation/M` shadow（0 8px 16px `#c3c5ca`）を適用する
- [ ] アイコンはサイズ一覧（14/15/16/17/18/24px）から選ぶ。新しいサイズを作らない

**Business mode**
- [ ] 3状態（active/inactive/offhour）すべてを実装する
- [ ] offhourのテキストは必ず白（`Neutral/40` = `#ffffff`）にする
- [ ] modeは全都市カラム同時に切り替わる（都市単位で切り替えない）

---

## 拡張ルール（新機能を追加するとき）

### 新しいカラーが必要になったとき

1. まず既存のSemanticトークンで代替できないか確認する
2. どうしても必要な場合、Neutral primitiveを新たなSemanticトークンにマッピングして追加する
3. TimeトークンはTime palette専用。別目的で流用しない

### 新しいコンポーネントを作るとき

1. 操作UIは `Radius/Control`（pill）を使う。ただし Button_Primary・Button_Secondary のみ `Radius/Button`（16px）
2. BG色は `color.surface.*` から選ぶ
3. テキストは `color.text.*` から選ぶ
4. アニメーションは `duration.*` と `easing.*` を使う

### 新しいモードを追加するとき（将来用）

- Default/Businessと同様に、「モードは構造を変えず色だけ切り替える」原則を守る
- 新モードのスロット表面色は `color.surface.timeslot.{mode}.*` の形式で追加する

---

## Do / Don't

| Do ✅ | Don't ❌ |
|---|---|
| SemanticトークンでBGと文字色を指定する | Timeトークンを時刻スロット以外に使う |
| タグ・コントロールには `Radius/Control`（999px）を使う | ボタン以外に `Radius/Button`（16px）を使う |
| Button_Primary・Button_Secondaryには `Radius/Button`（16px）を使う | `Radius/Card` をボタンに使う（同値だが役割が違う） |
| Time boxの高さを42px（DateTag付きは45px）に固定する | グラデーションの停止位置を0%から始める |
| Business modeは3状態（active/inactive/offhour）で実装する | アイコンに直接HEXカラーを当てる（`color.icon.*`を使う） |
| offhour背景（`#374069`）のテキストを `Neutral/40`（白）にする | UIテキストにNewsreaderを使う（display専用） |
| アクションボタン（Add/Clear/Secondary）BGは `control.action`（`#ffffff`） | タグのBGに `control.action` を使う（`control.tag.default` が正しい） |
| DateTagのRadiusを `Radius/Date badge`（8px）にする | `color.surface.default`（`#fdffff`）と `#ffffff` を同一視する |
| Time frameフェードには `color.surface.fade-overlay.*` を使う | Time frameフェードに `#f5f5f5` などをハードコードする |

---

## 未確認・未実装の項目

| 項目 | ステータス | 補足 |
|---|---|---|
| `color.accent.current-time` | ✅ 確認済み | `#e2483d`（コードから確認） |
| Current Time Indicator | ✅ コンポーネント化済み | 幅=全タイムテーブル幅、縦位置=ホーム都市の現在時刻Y座標 |
| `color.text.secondary` / `color.text.disabled` | ⚠️ 未定義 | 将来用。現時点では `text.muted` で代用 |
| Neutral palette中間ステップ | ⚠️ 一部未確認 | Neutral/150（`#e9ebf0`）, /250（`#cfd1d6`）, /300（`#c3c5ca`）, /600（`#5d5f64`）は確認済み。/350-/550 等は未確認 |
| ロゴのText Style | ⚠️ 未確認 | "NANJI?" ワードマーク |
| Search / City picker modal | ❌ 未設計 | 「+ Add city」を押した後の画面 |
| Settings panel | ❌ 未設計 | ⚙ボタンのリンク先 |
| Group dropdown | ❌ 未設計 | "Group 1 ▾" のリンク先 |
| Empty state | ❌ 未設計 | 都市が0の状態 |
| 全インタラクティブ要素のHover/Focus/Disabled状態 | ❌ 未設計 | |
| Mobile / Tablet レイアウト | ❌ 未設計 | 現在デスクトップ（1764px / 1920px）のみ |

---

## Appendix — コンポーネント一覧

| コンポーネント名 | Figma node | バリアント数 | ステータス |
|---|---|---|---|
| Logo | 48:4781 | 1 | ✅ 完成 |
| City Tag | 27:1151 | 7 | ✅ 完成 |
| City_tag_group | 31:1382 | 3 | ✅ 完成 |
| Add City | 31:1505 | 2 | ✅ 完成 |
| Clear All | 27:1262 | 1 | ✅ 完成 |
| City Heading | 24:2030 | 2 | ✅ 完成 |
| Time Box | 24:234 | 3 | ✅ 完成 |
| 24hours | 33:1650 | 2 | ✅ 完成 |
| Time Frame | 33:3064 | 2 | ✅ 完成 |
| Date Tag | 24:3937 | 1 | ✅ 完成 |
| Button_Primary | 33:4301 | 2（Text label=True/False） | ⚠️ States未定義 |
| Button_Secondary | 48:4622 | 2（Text label=True/False） | ⚠️ States未定義 |
| Toggle | 33:4350 | 2（State=On/Off） | ⚠️ Typo残存（"Defalut"） |
| Toggle button | 33:4368 | 2（Mode=Business/Default） | ✅ 完成 |
| Current time | 65:2581 | 1 | ✅ 完成 |
| アイコン（12種） | 48:4966 | 12 | ✅ 完成 |

---

## Appendix — 命名の問題点（Figmaで修正推奨）

| 現在の名前 | 問題 | 推奨名 / 状況 |
|---|---|---|
| `Defalut`（Toggle / State=Off のラベルテキスト） | タイポ | "Default" が正しい — Figmaで修正推奨 |
| `State=Defalut`（Add city） | タイポ（バリアント名） | `State=Default` |
| `color.surface.subtlw` | タイポ（Figma Variables） | `color.surface.subtle.overlay` |

> 修正済み（前バージョンから変更）:
> - `プロパティ1=デフォルト` → `Text label=True`  ✅
> - `プロパティ1=バリアント2` → `Text label=False`  ✅
> - `Mode=Defalut`（24hours）→ `Mode=Default`  ✅
> - `State=Default`（City tag）→ `State=Visible`  ✅

---

*このドキュメントはFigma MCPによる実値取得に基づいて作成されました。⚠️ は実装前にFigmaで値を確認してください。*
