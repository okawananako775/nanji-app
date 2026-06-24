# スマホ下部余白問題 — 現状と修正の経緯まとめ

## 目指している表示（デザイン仕様）

| 項目 | 意図 |
|------|------|
| タイムラインの縦幅 | NavBar・TagBar の下から、画面下端いっぱいまで伸びる |
| タイムライン下の余白 | タイムラインカードの下端と画面下端の間に **16px**（`--space-inset-md`） |
| ドロップシャドウ | 下側は **意図的に切れた状態**（`overflow` でクリップ） |
| BottomBar | 画面下端付近にオーバーレイ（トグル・検索ボタン） |

---

## 症状の変化

1. **スマホ**でタイムライン下に不自然な余白、トグル・検索ボタンが画面下端から浮く
2. **PC でもスマホでも**トグル・検索ボタンが消えた（一時的）
3. **設定モーダル**を開くと、ぼかし背景の下に白い帯が見え、ブラウザのナビバーとの間に隙間
4. スクショを撮ると一時的に正常に見えることもある
5. **現状（2026-06-24 時点）**：上記の白い余白はまだ残っている

---

## 推測している原因（複数が重なっている可能性）

### ① モバイルブラウザのビューポート問題（本命）

iOS Safari / Chrome では URL バー・下部ナビが **表示領域の高さを動的に変える**。

- `100vh` / `100svh` / `100dvh` は、初回表示時に実際の見えている領域とずれることがある
- `visualViewport.height` だけを高さに使うと、アプリが **途中で止まり、その下に `body` の背景（白）が見える**
- スクショ時に UI が隠れてビューポートが変わると、一時的にぴったり見える

スクショで見えていた構造（推定）：

```
URLバー
─────────────
アプリ（#root）  ← ここまでしか伸びていない
白い余白         ← body 背景（約50px）
ブラウザナビバー
```

### ② `visualViewport.offsetTop` の未考慮

URL バー表示時、表示領域は上にずれる（`offsetTop`）。高さだけ合わせて上位置を無視すると、レイアウト全体と表示領域がずれる。

### ③ タイムライン周りの padding / overflow

- `.xScroll` の `padding-bottom: 16px` は **意図した余白**
- 一方で `padding-bottom` の削除・`overflow-clip-margin` の変更で、シャドウやレイアウトが別のずれを生んだ時期もあった

### ④ BottomBar の配置ミス（ボタン消失）

`BottomBar` を `.page` の外に出し `position: absolute` にした際、**親要素がなく配置が壊れ**、PC・スマホ両方でボタンが見えなくなった。

### ⑤ `position: fixed` と `#root` の組み合わせ

`overflow: hidden` の親や、fixed の基準ビューポートの違いで、下部 UI の位置がずれることがある。

---

## 行った修正の流れ

### フェーズ1：タイムライン・BottomBar まわり（CSS）

| 変更 | 狙い |
|------|------|
| モバイル `100svh` → `100dvh` | アドレスバーに追従 |
| `.xScroll` の `padding-bottom` 削除 | 余計な隙間の解消 |
| `BottomBar` を `.page` の外へ | fixed の親問題回避 |
| `interactive-widget=overlays-content` | Chrome の下部 UI 対策 |
| モバイル `.page` を `position: fixed; inset: 0` | 画面いっぱいに固定 |

→ タイムライン下 16px が消えたり、別の余白が残るなど **一進一退**

### フェーズ2：16px 余白の復元

- `.xScroll` に `padding-bottom: 16px` を戻す（デザイン仕様）
- シャドウは下側クリップのまま（`overflow-clip-margin` 下 = 0）

### フェーズ3：JavaScript によるビューポート同期

**`src/lib/syncAppHeight.ts`** を追加し、`main.tsx` で起動。

| 段階 | 内容 |
|------|------|
| 初版 | `visualViewport.height` → `--app-height` |
| 第2版 | `offsetTop` → `--app-offset-top` を追加 |
| 第3版 | `#root` を `top + height` で固定 |
| **現版** | `height` をやめ `top + bottom: 0` に変更 |

### フェーズ4：BottomBar・シェル構造

| 変更 | 狙い |
|------|------|
| `BottomBar` を `.page` 内に戻す | `position: absolute` の基準を確保 |
| `.page { position: relative }` | BottomBar の配置親 |
| `appShell` ラッパー追加（`App.tsx`） | `#root` 直下の高さチェーンを安定化 |
| モーダル overlay も `top + bottom: 0` | 設定画面のぼかしも全画面に |

### 現状の主要コード構造

```
#root          position: fixed; top: var(--app-offset-top); bottom: 0
  appShell     height: 100%; position: relative
    .page      height: 100%; position: relative
      NavBar / TagBar / main(TimeTable) / BottomBar(absolute bottom)
```

`syncAppHeight` は **`offsetTop` だけ同期**し、高さは CSS の `bottom: 0` に任せる方針。

### 関連ファイル一覧

| ファイル | 役割 |
|---------|------|
| `index.html` | `viewport-fit=cover`, `interactive-widget=overlays-content` |
| `src/styles/global.css` | `#root` の fixed 配置、`--app-offset-top` |
| `src/styles/appShell.css` | アプリシェルの高さチェーン |
| `src/lib/syncAppHeight.ts` | ビューポート同期 JS |
| `src/main.tsx` | `syncAppHeight()` 起動 |
| `src/features/home/HomePage.module.css` | `.page` レイアウト |
| `src/features/home/TimeTable.module.css` | タイムライン・16px 余白 |
| `src/features/home/BottomBar.module.css` | 下部ボタン（`absolute`） |
| `src/components/Modal.module.css` | モーダル overlay |

---

## まだ解消していないこと

- **iPhone 実機**で、ブラウザナビバー直上に白い余白（約50px）が残る
- アプリ（`#root`）が **レイアウトビューポートの下端まで伸びていない**可能性が高い

---

## 次に試す候補（未実施）

1. **`bottom: 0` が効かない環境**の確認  
   - iOS Chrome 特有の `interactive-widget` / 下部ツールバーとの相性
2. **`window.innerHeight` と `visualViewport` の差**をログで実機確認  
   - 初回ロード時の `offsetTop` / `innerHeight` / `vv.height` の値
3. **`#root` ではなく `html/body` に `min-height: 100%` + fixed シェル** という別パターン
4. **Safe Area**  
   - 下部余白が `env(safe-area-inset-bottom)` と重なっているか（BottomBar には適用済み、ルートには未適用）
5. **Vite 開発サーバー + `192.168.x.x`** 固有の挙動かどうかの切り分け

---

## 触っていない／維持している仕様

- タイムライン下 **16px**（`.xScroll` の `padding-bottom`）
- 下側シャドウの **クリップ**（意図した見た目）
- 現在地取得（`geolocationRequest.ts`）の修正は別件
