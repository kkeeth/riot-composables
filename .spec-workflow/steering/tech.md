# Technology Stack

## Project Type

**プロジェクトタイプ**: JavaScriptライブラリ（TypeScript実装）

`riot-composables`は，Riot.js向けのComposition APIを提供するnpmパッケージです．ブラウザとNode.js環境の両方で動作し，モダンなJavaScriptバンドラー（Rollup，Webpack，Viteなど）と統合できます．

## Core Technologies

### Primary Language(s)

- **Language**: TypeScript 5.3.3
- **Compiler**: tsc（TypeScript Compiler）
- **Language-specific tools**:
  - **Package Manager**: pnpm 10.16.0
  - **Build Tool**: Rollup 4.9.6
  - **Test Runner**: Vitest 1.2.0

**選定理由**：
- TypeScriptによる型安全性
- pnpmによる高速なインストールとディスク効率
- Rollupによる最適化されたバンドル生成

### Key Dependencies/Libraries

#### ランタイム依存関係

**ゼロ依存**（Peer Dependencyのみ）：

```json
{
  "peerDependencies": {
    "riot": ">=10.0.0"
  }
}
```

**理由**：
- バンドルサイズの最小化
- 依存関係の脆弱性リスク低減
- メンテナンスの容易さ
- Riot.jsの哲学（シンプルさ）との整合性

#### 開発依存関係

| 依存関係 | バージョン | 用途 |
|---------|-----------|------|
| riot | 10.0.1 | 型定義とテスト用 |
| typescript | 5.3.3 | TypeScriptコンパイル |
| rollup | 4.9.6 | バンドリング |
| @rollup/plugin-typescript | 11.1.6 | TypeScriptトランスパイル |
| @rollup/plugin-node-resolve | 16.0.3 | モジュール解決 |
| @rollup/plugin-terser | 0.4.4 | コード圧縮 |
| rollup-plugin-dts | 6.2.3 | 型定義ファイル生成 |
| vitest | 1.2.0 | テストランナー |
| jsdom | 27.0.0 | DOM環境シミュレーション |
| tslib | 2.6.2 | TypeScriptランタイムヘルパー |

### Application Architecture

**3層アーキテクチャ**：

```
┌─────────────────────────────────────────────────┐
│  Layer 3: Composables（公開API）                 │
│  - useReactive(), useEffect(), useComputed()     │
│  - 開発者が直接使用する高レベル関数               │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│  Layer 2: Enhanced API（内部API）                │
│  - $reactive(), $effect(), $computed()           │
│  - コンポーネントに追加されるメソッド             │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│  Layer 1: Core System（基盤）                    │
│  - riot.install()による統合                      │
│  - Proxyベースのリアクティビティ                 │
│  - ライフサイクル管理                            │
└─────────────────────────────────────────────────┘
```

**アーキテクチャパターン**：
- **Plugin-based**: `riot.install()`によるグローバル統合
- **Proxy-based Reactivity**: JavaScriptのProxyを使用した自動トラッキング
- **Lifecycle Integration**: Riot.jsのライフサイクルフックへの統合

### Data Storage

**該当なし**（ライブラリのため）

ただし，コンポーネント内部で以下のデータを保持：

- **states**: `Map<symbol, any>` - リアクティブステートの保存
- **effects**: `Map<symbol, EffectData>` - エフェクトデータの保存
- **computed**: `Map<symbol, ComputedData>` - 計算プロパティの保存
- **watchers**: `Map<symbol, WatchData>` - ウォッチャーの保存
- **cleanups**: `Array<() => void>` - cleanup関数の配列

### External Integrations

**該当なし**（スタンドアロンライブラリ）

Riot.js v10+とのみ統合します．

### Monitoring & Dashboard Technologies

**該当なし**（現時点では未実装）

将来的に以下を検討：
- ブラウザ開発者ツール拡張
- VSCode拡張機能
- リアクティブ状態の可視化ツール

## Development Environment

### Build & Development Tools

#### ビルドシステム

**Rollup 4.9.6**を使用：

**設定** (`rollup.config.js`):
```javascript
{
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.js', format: 'cjs' },      // CommonJS
    { file: 'dist/index.mjs', format: 'es' },      // ES Modules
    { file: 'dist/index.umd.js', format: 'umd' }   // UMD
  ],
  plugins: [
    nodeResolve(),
    typescript(),
    terser()  // 本番ビルド時のみ
  ]
}
```

**出力形式**：
1. **CommonJS** - Node.js環境向け
2. **ES Modules** - モダンバンドラー向け
3. **UMD** - ブラウザ直接読み込み向け
4. **TypeScript型定義** - `.d.ts`ファイル

#### パッケージ管理

**pnpm 10.16.0**：
- 高速なインストール
- ディスク効率の向上
- 厳格な依存関係管理

#### 開発ワークフロー

```bash
pnpm dev       # ウォッチモード（開発中）
pnpm build     # 本番ビルド
pnpm test      # テスト実行
pnpm typecheck # 型チェック
```

### Code Quality Tools

#### Static Analysis

**TypeScript Compiler（厳格モード）**：

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**結果**: ✅ 型エラーゼロ

#### Formatting

現時点では未設定．将来的に以下を検討：
- Prettier - コードフォーマット
- ESLint - コード品質チェック

#### Testing Framework

**Vitest 1.2.0 + jsdom 27.0.0**：

**設定** (`vitest.config.js`):
```javascript
{
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
}
```

**現状**：
- テストファイル: 1ファイル（`plugin.test.ts`）
- テスト数: 4テスト
- 結果: ✅ 全てパス

**目標**：
- テストカバレッジ90%以上
- すべてのコアモジュールのテスト
- エッジケースのカバー

#### Documentation

**JSDocスタイル**：

```typescript
/**
 * Create a reactive state object that automatically triggers updates
 *
 * @param component - The Riot component instance
 * @param initialState - Initial state object
 * @returns Proxied reactive state
 *
 * @example
 * ```ts
 * const state = createReactive(component, { count: 0 })
 * state.count++ // Automatically triggers component.update()
 * ```
 */
export function createReactive<T extends object>(...) { ... }
```

### Version Control & Collaboration

#### VCS

**Git**を使用：

**最近のコミット履歴**：
```
c907a55 fix: typecheck errors
df84b15 chore: install necessary module
cd83075 chore: add each config files
991e842 feat: all necessary files by creating claude code
aaf1520 chore: installed modules
426c05f Initial commit
```

#### Branching Strategy

現在は単一ブランチ（`main`）で開発中．

将来的に以下を検討：
- GitHub Flow - シンプルなブランチ戦略
- Semantic Versioning - バージョン管理

#### Code Review Process

現時点では未設定．将来的に：
- Pull Requestベースのレビュー
- 必須レビュアー設定
- CIによる自動チェック

### Dashboard Development

**該当なし**（ライブラリのため）

## Deployment & Distribution

### Target Platform(s)

**マルチプラットフォーム対応**：

1. **ブラウザ**
   - モダンブラウザ（Proxyサポート必須）
   - Chrome, Firefox, Safari, Edge（最新版）
   - ❌ IE11非対応（Proxyはポリフィル不可）

2. **Node.js**
   - Node.js 14+（Proxyサポート）
   - 開発環境，ビルド環境，テスト環境

### Distribution Method

**npm経由**：

```bash
npm install riot-composables
# または
pnpm add riot-composables
# または
yarn add riot-composables
```

**パッケージ情報**：
- パッケージ名: `riot-composables`
- 現在のバージョン: 0.0.1
- ライセンス: MIT
- 作者: kkeeth

### Installation Requirements

**最小要件**：
- Riot.js v10.0.0以上
- モダンなJavaScript環境（Proxyサポート）
- Node.js 14+（開発時）

**推奨環境**：
- TypeScript 4.5+（型安全性）
- モダンバンドラー（Rollup，Webpack，Vite）

### Update Mechanism

**npm経由**：

```bash
npm update riot-composables
```

**セマンティックバージョニング**：
- `0.x.x` - アルファ版（破壊的変更あり）
- `1.x.x` - 安定版（破壊的変更なし）

## Technical Requirements & Constraints

### Performance Requirements

#### 目標指標

| 指標 | 目標値 | 現状 |
|-----|--------|------|
| バンドルサイズ（gzip） | 5KB以下 | 未測定 |
| 初期化時間 | 1ms以下 | 未測定 |
| メモリ使用量 | 最小限 | 未測定 |
| リアクティブ更新 | 16ms以内（60fps） | 未測定 |

#### パフォーマンス最適化

現在の最適化：
- ✅ Dirtyフラグによる計算プロパティのキャッシング
- ✅ `Object.is()`による厳密な比較
- ✅ 変更がない場合の更新スキップ

将来の最適化：
- ⬜ バッチ更新
- ⬜ メモ化の改善
- ⬜ 循環参照の検出

### Compatibility Requirements

#### プラットフォームサポート

**対応プラットフォーム**：
- ✅ モダンブラウザ（Proxy対応）
- ✅ Node.js 14+
- ❌ IE11（Proxy非対応）

**Riot.jsバージョン**：
- ✅ Riot.js v10.0.0以上
- ❌ Riot.js v9以下（API変更のため）

#### 依存関係バージョン

**Peer Dependency**：
- Riot.js: `>=10.0.0`

**開発依存関係**：
- TypeScript: `^5.3.3`
- Rollup: `^4.9.6`
- Vitest: `^1.2.0`

#### 標準準拠

- **ECMAScript**: ES2020準拠
- **TypeScript**: 厳格モード準拠
- **CommonJS**: Node.js互換
- **ES Modules**: ブラウザ/バンドラー互換

### Security & Compliance

#### セキュリティ要件

**ゼロ依存戦略**：
- Riot.js以外の依存なし
- 脆弱性リスクの最小化
- 定期的なセキュリティ監査（将来）

**コード品質**：
- TypeScript厳格モード
- 入力検証
- エラーハンドリング

#### コンプライアンス

**ライセンス**: MIT License
- 商用利用可能
- 修正・再配布可能
- 著作権表示必須

**データ収集**: なし
- 使用状況の追跡なし
- 個人情報の収集なし
- プライバシーに配慮

### Scalability & Reliability

#### 想定負荷

**コンポーネント数**：
- 小規模: 10-50コンポーネント
- 中規模: 50-200コンポーネント
- 大規模: 200+コンポーネント（要パフォーマンステスト）

**リアクティブステート**：
- コンポーネントあたり1-10個
- 合計100-1000個の状態管理

#### 可用性要件

**ライブラリの信頼性**：
- ✅ テストによる品質保証
- ✅ TypeScriptによる型安全性
- ⬜ E2Eテストによる統合確認（将来）

**エラーハンドリング**：
- try-catch による例外処理
- console.errorによる警告
- 開発モードでの詳細なエラー情報（将来）

## Technical Decisions & Rationale

### Decision Log

#### 1. なぜProxyを使用するのか？

**決定**: Proxyベースのリアクティビティ

**理由**：
- ✅ 自動トラッキング（明示的なgetter/setterが不要）
- ✅ Deep reactivity（ネストされたオブジェクトも自動対応）
- ✅ シンプルなAPI（通常のオブジェクトと同じように扱える）

**代替案**：
- ❌ Getter/Setter: 冗長，手動定義が必要
- ❌ Immutable: パフォーマンスオーバーヘッド

**トレードオフ**:
- IE11非対応（許容可能 - Riot.js v10もモダンブラウザターゲット）

---

#### 2. なぜriot.install()を使用するのか？

**決定**: グローバルプラグインシステム

**理由**：
- ✅ すべてのコンポーネントに自動適用
- ✅ 一貫性のあるAPI
- ✅ メンテナンスが容易

**代替案**：
- ❌ Mixin: Riot.js v4+で削除済み
- ❌ 手動統合: エラーが発生しやすい，一貫性がない

**トレードオフ**:
- グローバル汚染の可能性（許容可能 - 明示的なインストールが必要）

---

#### 3. なぜゼロ依存なのか？

**決定**: Riot.js以外の依存を持たない

**理由**：
- ✅ バンドルサイズの最小化
- ✅ セキュリティリスクの低減
- ✅ Riot.jsの哲学との整合性

**代替案**：
- ❌ 外部ライブラリ使用: 依存関係の増加

**トレードオフ**:
- すべて自前で実装（許容可能 - コア機能は複雑でない）

---

#### 4. なぜ3層アーキテクチャなのか？

**決定**: Layer 1（Core），Layer 2（Enhanced API），Layer 3（Composables）

**理由**：
- ✅ 責務の明確な分離
- ✅ テストのしやすさ
- ✅ 拡張性

**代替案**：
- ❌ フラット構造: 責務が不明確
- ❌ 2層構造: 柔軟性が低い

**トレードオフ**:
- 多少の複雑さ（許容可能 - メリットが上回る）

---

#### 5. なぜpnpmを使用するのか？

**決定**: パッケージマネージャーにpnpmを採用

**理由**：
- ✅ 高速なインストール
- ✅ ディスク効率の向上
- ✅ 厳格な依存関係管理

**代替案**：
- npm: 標準的だがパフォーマンスが劣る
- yarn: 良いがpnpmより遅い

**トレードオフ**:
- pnpmのインストールが必要（許容可能 - 開発者のみ）

## Known Limitations

### 技術的制約

#### 1. Proxyサポート必須

**制限**: IE11非対応

**影響**:
- モダンブラウザのみサポート
- ポリフィル不可

**回避策**: なし（Proxyは必須）

**将来の対応**: なし（Riot.js v10の方針と一致）

---

#### 2. Deep watching未実装

**制限**: `createWatchObject`の`deep`オプションは警告を表示するのみ

**影響**:
- ネストされたオブジェクトの深い監視ができない
- 回避策: 個別のプロパティを監視

**将来の対応**: v0.2.0で実装予定

---

#### 3. 関数型コンポーネント非対応

**制限**: Riot.jsがオブジェクトベースのコンポーネント

**影響**:
- React HooksやVue 3 Composition APIとは異なるAPI
- 関数型の簡潔さはない

**回避策**: なし（Riot.jsの設計による）

**将来の対応**: なし（Riot.jsの哲学に従う）

---

#### 4. テストカバレッジ不足

**制限**: コアモジュールのテストが1ファイルのみ

**影響**:
- バグの見逃しリスク
- リファクタリングの困難さ

**将来の対応**: v0.1.0で90%以上を目標

---

#### 5. ドキュメント不足

**制限**: API詳細ドキュメントがない

**影響**:
- 学習曲線が高い
- トラブルシューティングが困難

**将来の対応**: v0.3.0で完全なドキュメント整備

---

#### 6. バッチ更新未実装

**制限**: 複数の状態変更が個別に更新をトリガー

**影響**:
- パフォーマンスの低下（大量更新時）

**将来の対応**: v0.2.0で実装予定
