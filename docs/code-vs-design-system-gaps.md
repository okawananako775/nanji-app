# コード vs Design System 差異一覧

**作成日**: 2026-07-10  
**対象コード**: `main` @ `903737f` 以降  
**参照 DS**: `DesignSystem.md` v5.2（Last updated: 2026-07-10）  
**参照 Token**: `TokenArchitecture.md`（更新日記載なし）

---

## このドキュメントの目的

実装（`src/`）と Design System（DS）・Token Architecture の間で、**現時点で残っている差異**を洗い出し、修正優先度の判断材料とする。

> **注**: 要件定義書（PRD）はリポジトリ内に存在しない。本ドキュメントは DS を仕様の基準とする。

---

## サマリー

| 区分 | 件数（目安） | 主な内容 |
|---|---|---|
| 🔴 Critical | 4 | UXコピー不一致、DS内部矛盾、未実装の DS 要件 |
| 🟡 Medium | 15 | トークン適用漏れ、DS 記述の古い箇所、コードのみ機能 |
| 🟢 Low | 11 | デッドコード、ドキュメント整備、Figma 未定義 |

---

## 🔴 Critical

### C-1. オンボーディング tour4 とスロットタップ UX の不一致

| 項目 | DS / i18n | コード |
|---|---|---|
| 文言 | `onboarding.tour4Body`: 「セルをタップして**コピー**」 | `HomePage.tsx` `onSlotTap`: **範囲選択 → Convert パネル**を開く |
| 関連 | tour4 イラスト・スライドはコピー前提 | `CopySheet.tsx` は**未使用**（デッドコード） |

**影響**: 初回ユーザーが期待と異なる操作を体験する。

**推奨**: tour4 文言・イラストを範囲選択 UX に合わせる、またはコピー機能を復活させる。

---

### C-2. DS 内の都市数上限矛盾（6 vs 10）

| 箇所 | 値 |
|---|---|
| `DesignSystem.md` §Spacing「最大カラム数」 | **6** |
| `DesignSystem.md` §19 Convert Panel「上限 10 都市」 | **10** |
| `src/store/reducer.ts` `MAX_CITIES` | **10** |
| i18n `onboarding.tour2Body` / `search.max` | **10** |

**影響**: DS 内で仕様が矛盾。実装は 10 で統一。

**推奨**: §Spacing の「最大カラム数」を **10** に更新。

---

### C-3. Time frame 上フェード（124px）未実装

| DS（§Time frame / §24hours） | コード |
|---|---|
| 上 124px + 下 156px のグラデーション fade | **下 156px のみ**（`TimeTable.module.css` `.fadeBottom`） |
| `TimeTable.tsx` | `.fadeBottom` のみ描画 |

**影響**: タイムライン上部の視覚的フェードが DS と異なる。

---

### C-4. プロダクト名表記（DS vs アプリ）

| 箇所 | 表記 |
|---|---|
| `DesignSystem.md` タイトル・Product 行 | `NANJI?`（大文字） |
| `index.html` / `site.webmanifest` / i18n `logo` | `nanji?`（小文字） |
| `src/assets/logo.png` | 小文字ロゴ |

**影響**: ブランド表記が DS とユーザー向け表示で不一致。

**推奨**: DS の Product 名を `nanji?` に統一。

---

## 🟡 Medium

### M-1. Popover の Elevation

| DS | コード |
|---|---|
| `--shadow-floating`（Elevation S）を Popover に適用 | `CalendarDatePicker.module.css` `.popover` は **`--shadow-card`（Elevation M）** |

**ファイル**: `src/components/CalendarDatePicker.module.css`

---

### M-2. SidePanel shadow がトークン化されていない

| DS §20 SidePanel | コード |
|---|---|
| `shadow: -4px 0 16px rgba(0,0,0,0.06)`（記載あり） | `RangeSelectionModal.module.css` `.panel` — **同一のハードコード** |
| モバイル | `0 -4px 24px rgba(0,0,0,0.1)` — **トークンなし** |

DS と値は一致するが、`--shadow-*` セマンティックトークンとして未定義。

---

### M-3. `--color-timeline-slot-text` の参照関係

| DS | コード |
|---|---|
| `.slotDark` 等 = `--color-timeline-slot-text`（= `text.primary` と記載） | `tokens.css`: **`var(--neutral-900)` 固定**（dark mode でも不変） |

**意図**: スロット背景色は dark mode でも変わらないため、テキストも `#101217` 固定は**正しい実装**。  
**差異**: DS の「= text.primary」という説明が dark mode では誤解を招く。

**推奨**: DS に「dark mode でも `#101217` 固定（`--neutral-900`）」と明記。

---

### M-4. レイアウト図の BottomBar（検索ボタン残存）

| DS §レイアウト ASCII | コード |
|---|---|
| `[Default \| Business hours]      [↩] [🔍]` | `[↩] + Default/Business toggle` のみ。検索は **`TimelineSideTabs`** |

**ファイル**: `DesignSystem.md` L716、`docs/mobile-viewport-gap-investigation.md`

---

### M-5. Button_Primary 表の Search 参照

| DS §8 Button_Primary | コード |
|---|---|
| icon-only 配置例: 「Bottom bar（**Search**）・TagBar（Save）」 | BottomBar に Search ボタンなし |
| `Icon_Search` をアイコン表に記載 | `IconSearch` は **`Icons.tsx` のみ**（未使用） |

---

### M-6. i18n: Convert タブラベル（日本語）

| キー | ja.json | 期待 |
|---|---|---|
| `timelineSideTabs.convert` | `"Convert"`（英語のまま） | 日本語 UI では「変換」等 |

`timelineSideTabs.jump` は「ジャンプ」でローカライズ済み。

---

### M-7. ContextualGuide 吹き出しの二重 shadow

| DS §22 | コード |
|---|---|
| Elevation S 1 枚の DROP_SHADOW 想定 | `.bubbleInner` + `.bubbleTail` + `.ring` に**個別** `box-shadow: var(--shadow-floating)` |

**ファイル**: `ContextualGuide.module.css`  
**影響**: 視覚的に DS の単一 shadow より重く見える可能性。

---

### M-8. Range selection overlay（コードのみ）

| 項目 | 状態 |
|---|---|
| `.rangeOverlay` / `.rangeOverlayPending` / `.rangeOverlayBadge` | `TimeTable.module.css` に実装 |
| DS | **未記載** |
| 色 | `rgba(226, 72, 61, 0.08/0.04)` ハードコード、badge は 10px/700（Date tag は 12px/600） |

---

### M-9. 祝日・週末の Business mode 降格

| 項目 | 状態 |
|---|---|
| `src/lib/nonBusinessDay.ts` | 週末・祝日は 9–16 を `inactive` に降格 |
| DS Business mode | **未記載** |

---

### M-10. `--z-bottom-fade` / モバイル bottomFade

| DS | コード |
|---|---|
| `--z-bottom-fade: 140` 記載あり | `HomePage.module.css` `.bottomFade` で使用 ✅ |
| DS §レイアウト図 | モバイル専用レイヤーとして図示なし |

実装は DS トークン定義と一致。レイアウト図の更新が未反映。

---

### M-11. TimelineSideTabs z-index（desktop）

| DS §21 | コード |
|---|---|
| z-index の詳細記載なし | desktop: `calc(var(--z-range-panel) + 1)` |
| | mobile: `var(--z-floating)`、パネル開時は `visibility: hidden` |

SidePanel より前面に出す意図的スタック。DS §21 への追記余地あり。

---

### M-12. 旧 TimeSearchModal CSS の継続利用

| 項目 | 状態 |
|---|---|
| `TimeSearchModal.tsx` | 削除済み |
| `TimeSearchModal.module.css` | `MultiCandidatePanel` 等から**引き続き参照** |
| `.tabs` / `.tabIndicator` | CSS 残存、**TSX から未使用** |

DS §19 は「旧 CSS を共通スタイルとして使用」と記載済み。未使用クラスの整理余地あり。

---

### M-13. DS §17アイコン表に新規アイコン3種が未記載

| アイコン | サイズ | 使用箇所 | DS §17 |
|---|---|---|---|
| `IconConvert` | 18×18 | `TimelineSideTabs.tsx`（Convertタブ） | 未記載 |
| `IconJump` | 18×18 | `TimelineSideTabs.tsx`（Jumpタブ） | 未記載 |
| `IconOnboarding` | 33×20 | `ContextualGuide.tsx`（吹き出し内） | 未記載 |

v5.2でSidePanel/ContextualGuideを追加した際にアイコン表への反映が漏れている。

**ファイル**: `DesignSystem.md` §17 / `src/components/icons/Icons.tsx`

---

### M-14. `icon_onboarding.svg` が currentColor ルール違反

DSのアイコンルール（§17・Do/Don't表）は「アイコンは `currentColor` で色を継承する。直接HEXを指定しない。例外は `Icon_Show` のみ」と明記。しかし `src/assets/icons/icon_onboarding.svg` は `fill="#374069"` を直書きしており、例外リストにも含まれていない。

**ファイル**: `src/assets/icons/icon_onboarding.svg`

---

### M-15. Time frameフェードの参照トークンがDS記載と食い違う

DS「フェードオーバーレイ」節は「Time frameの上部・下部フェードは `--color-surface-fade-100` / `--color-surface-fade-0` で実装する」と明記。しかし `TimeTable.module.css` の `.fadeBottom` は、DS未記載の別名トークン `--color-timeline-fade-solid` / `--color-timeline-fade-transparent`（値は `--color-surface-fade-*` と同一だが別のCSS変数）を参照している。`--color-surface-fade-100`/`-0` を実際に使っているのは `HomePage.module.css` の `.bottomFade`（モバイル専用、M-10で言及の別レイヤー）のみで、トークンが実質重複している。

**ファイル**: `DesignSystem.md`（フェードオーバーレイ節）/ `src/tokens/tokens.css` / `src/features/home/TimeTable.module.css`

---

## 🟢 Low

### L-1. TokenArchitecture.md の陳腐化

| 項目 | TokenArchitecture | DS / コード |
|---|---|---|
| `space.layout.column-gap` | 24px | **8px**（`--space-column-gap`） |
| `background-size`（gradient） | 960px | **1008px**（24 × 42px） |
| Elevation S blur | 4px | **8px**（v5.2 / `tokens.css` で更新済み） |
| z-index overlay / modal | 200 / 300 | 未使用。コードは `floating + 10` = 160 |
| `shadow.modal` | 未定義 | Modal は `--shadow-card`（Elevation M）を使用 |
| `color.surface.subtle` | `#ffffff26` | コードは **`--color-surface-subtle-dark`** を Date tag に使用 |

---

### L-2. デッドコード

| ファイル | 内容 |
|---|---|
| `src/components/CopySheet.tsx` | スロットタップ UX 変更後未 import |
| `src/components/icons/Icons.tsx` `IconSearch` | BottomBar 検索削除後未使用 |

---

### L-3. ContextualGuide の `guide.tips`

| 項目 | 状態 |
|---|---|
| i18n `guide.tips` | 日英とも **"Tips!"** 固定（装飾ラベル） |

意図的な可能性あり。DS §22 では言及なし。

---

### L-4. DS チェックリストの古い記述

| 項目 | 状態 |
|---|---|
| 「Button_Primary icon-only / **Button_Secondary**: shadow `--shadow-floating`」 | Secondary に shadow なし（実装どおり） |
| 「Time Search の都市選択は Tag + Search の併用」 | パネル内では Tag 併用は継続。入口は SidePanel に変更済み |

---

### L-5. Figma 未定義コンポーネント（DS 記載済み・意図的差異）

以下は **コード先行・Figma 未設計** として DS Appendix に記載あり。差異というより未デザイン領域。

- SidePanel（Jump / Convert）
- TimelineSideTabs
- ContextualGuide
- Range selection overlay

---

### L-6. `displayCityTag` border-radius

`TimeSearchModal.module.css`: `border-radius: 999px`（=`--radius-control` と同値だがトークン未使用）

---

### L-7. og-image / ブランディング

コード側は `nanji?` + 新 OG 画像に更新済み。DS・TokenArchitecture のタイトル表記のみ古い。

---

### L-8. 要件定義書の不在

正式な PRD / 要件定義書がリポジトリにないため、機能要件（Convert / Jump / ガイド等）のトレーサビリティは DS + i18n + 実装のみに依存。

---

### L-9. 廃止済みのはずの `--start-hour` トークンが残存

DSは「旧バージョン（v2.1以前）の...`--start-hour`...方式は廃止」と明記しているが、`tokens.css` の `:root` に `--start-hour: 0;` がまだ定義されている。コード内での参照はゼロ（デッドトークン）。

**ファイル**: `src/tokens/tokens.css`

---

### L-10. `--color-surface-subtle-light` が未使用トークン

DSは「半透明白オーバーレイ」として定義するが「使用コンポーネント」欄が空欄。実装側でも `src/` 全体で一切参照されていない未使用トークン。

**ファイル**: `src/tokens/tokens.css` / `DesignSystem.md`

---

### L-11. ⚠️要確認: Modal overlayの位置指定に未文書化の動的オフセット機構

DS §15は Modal Overlay を「`position: fixed`、`inset: 0`」と記載。実装（`Modal.module.css`）は `top: var(--app-offset-top)` を使い、`src/lib/syncAppHeight.ts` がモバイルのアドレスバー表示量をJSで動的計算して注入する仕組みになっている。デフォルト値は0pxのため通常時は視覚上ほぼ等価だが、DSはこの動的オフセット機構自体に触れていない。意図的な仕様拡張かDS記述の更新漏れかは要確認。

**ファイル**: `src/components/Modal.module.css` / `src/lib/syncAppHeight.ts`

---

## 整合している主要項目（参考）

以下は v5.2 更新後、コードと DS が概ね一致している領域。

| 領域 | 状態 |
|---|---|
| Convert / Jump SidePanel 構成 | DS §19–§21 に反映済み |
| `--shadow-floating` blur 8px | DS / `tokens.css` 一致 |
| `--font-modal-title`（en: Bricolage / ja: Shippori） | DS / コード一致 |
| `--range-selection-panel-width: 580px` | DS / コード一致 |
| SidePanel 左角 `--radius-modal` | DS §20 / `RangeSelectionModal.module.css` 一致 |
| モバイル bottom sheet 3 snap + 開時 `full` | DS §20 / `useMobileBottomSheet.ts` 一致 |
| ContextualGuide 3 ステップ | DS §22 / `HomePage.tsx` 一致 |
| TagBar Save button（desktop icon+text / mobile icon-only） | DS §8 記載と一致 |
| `--z-range-panel` / `--z-bottom-fade` | DS z-index 表 / `tokens.css` 一致 |
| Date tag `--color-surface-subtle-dark` | DS / コード一致 |

---

## 推奨アクション（優先順）

| 優先 | アクション | 対象 |
|---|---|---|
| 1 | tour4 文言・イラストを範囲選択 UX に合わせる | i18n, OnboardingIllustrations |
| 2 | DS §Spacing「最大カラム数」を 10 に修正 | `DesignSystem.md` |
| 3 | DS プロダクト名を `nanji?` に統一 | `DesignSystem.md`, `TokenArchitecture.md` |
| 4 | Time frame 上フェード 124px を実装 | `TimeTable.tsx`, `TimeTable.module.css` |
| 5 | Popover を Elevation S に変更 | `CalendarDatePicker.module.css` |
| 6 | `timelineSideTabs.convert` の日本語化 | `ja.json` |
| 7 | TokenArchitecture.md を DS v5.2 に同期 | `TokenArchitecture.md` |
| 8 | デッドコード削除（CopySheet, IconSearch, 未使用 CSS） | `src/components/` |
| 9 | Range overlay / 祝日 Business mode を DS に追記 | `DesignSystem.md` |
| 10 | 要件定義書の整備（または外部 URL 記載） | 新規ドキュメント |

---

## 更新履歴

| 日付 | 内容 |
|---|---|
| 2026-07-10 | 初版作成（DS v5.2 / main @ 903737f 時点） |
| 2026-07-10 | 既存Critical 4件（C-1〜C-4）をコードで再検証（すべて正確と確認）。新規差異6件を追加：M-13（DS §17アイコン表の記載漏れ3種）、M-14（`icon_onboarding.svg` の currentColor ルール違反）、M-15（Time frameフェードのトークン食い違い）、L-9（`--start-hour` デッドトークン残存）、L-10（`--color-surface-subtle-light` 未使用トークン）、L-11（Modal overlayの動的オフセット機構が未文書化・⚠️要確認） |
