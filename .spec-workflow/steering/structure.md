# Project Structure

## Directory Organization

```
riot-composables/
├── .claude/                      # Claude Code設定
│   └── STEERING.md              # ステアリングドキュメント（廃止予定）
│
├── .spec-workflow/              # spec-workflow設定
│   ├── steering/                # ステアリングドキュメント（正式）
│   │   ├── product.md          # プロダクト概要
│   │   ├── tech.md             # 技術スタック
│   │   └── structure.md        # プロジェクト構造（このファイル）
│   ├── specs/                   # 仕様書
│   ├── approvals/               # 承認記録
│   ├── archive/                 # アーカイブ
│   ├── templates/               # テンプレート
│   ├── user-templates/          # ユーザーテンプレート
│   ├── config.example.toml      # 設定例
│   └── session.json             # セッション情報
│
├── src/                         # ソースコード（ライブラリ本体）
│   ├── core/                    # Layer 1: コアシステム（596行）
│   │   ├── plugin.ts            # プラグイン統合（159行）
│   │   ├── reactive.ts          # リアクティブシステム（129行）
│   │   ├── effect.ts            # 副作用管理（104行）
│   │   ├── computed.ts          # 計算プロパティ（86行）
│   │   └── watch.ts             # ウォッチャー（118行）
│   │
│   ├── composables/             # Layer 3: コンポーザブル（180行）
│   │   ├── useReactive.ts       # リアクティブステート（41行）
│   │   ├── useEffect.ts         # 副作用（79行）
│   │   ├── useComputed.ts       # 計算プロパティ（29行）
│   │   └── useWatch.ts          # ウォッチャー（31行）
│   │
│   ├── types.d.ts               # 型定義（ambient）（107行）
│   ├── types.ts                 # 型定義（export）（108行）
│   └── index.ts                 # エントリーポイント（73行）
│
├── examples/                    # サンプル（ライブラリには含まれない）
│   ├── useCounter.ts            # カウンター例（84行）
│   └── useToggle.ts             # トグル例（64行）
│
├── tests/                       # テストコード
│   ├── core/                    # コアモジュールのテスト
│   │   └── plugin.test.ts       # プラグインテスト（47行）
│   └── setup.ts                 # テスト環境セットアップ
│
├── dist/                        # ビルド出力（自動生成，Git無視）
│   ├── index.js                 # CommonJS
│   ├── index.mjs                # ES Modules
│   ├── index.umd.js             # UMD
│   ├── index.d.ts               # 型定義
│   └── *.map                    # ソースマップ
│
├── node_modules/                # 依存関係（自動生成，Git無視）
│
├── rollup.config.js             # Rollup設定
├── tsconfig.json                # TypeScript設定（開発用）
├── tsconfig.build.json          # TypeScript設定（ビルド用）
├── vitest.config.js             # Vitest設定
├── package.json                 # パッケージ設定
├── pnpm-lock.yaml               # pnpm lockfile
├── README.md                    # README
├── CONTRIBUTING.md              # 貢献ガイド
├── LICENSE                      # MITライセンス
├── .gitignore                   # Git無視設定
└── .npmignore                   # npm公開除外設定

合計コード量（src/のみ）: ~1,064行
```

### ディレクトリの役割

| ディレクトリ | 役割 | 公開 | Git管理 |
|------------|------|------|---------|
| `src/` | ライブラリのソースコード | ✅ | ✅ |
| `examples/` | カスタムコンポーザブルの例 | ❌ | ✅ |
| `tests/` | テストコード | ❌ | ✅ |
| `dist/` | ビルド出力 | ✅ | ❌ |
| `.spec-workflow/` | spec-workflow設定 | ❌ | ✅ |
| `.claude/` | Claude Code設定 | ❌ | ❌ |
| `node_modules/` | 依存関係 | ❌ | ❌ |

### モジュール別コード量

| モジュール | 行数 | 割合 | 説明 |
|-----------|------|------|------|
| `src/core/` | 596行 | 56% | コアシステム |
| `src/composables/` | 180行 | 17% | 公開API |
| `src/types.*` | 215行 | 20% | 型定義 |
| `src/index.ts` | 73行 | 7% | エントリーポイント |
| **合計** | **1,064行** | **100%** | - |

## Naming Conventions

### Files

#### ソースファイル

- **Composables**: `use[Name].ts` (camelCase)
  - 例: `useReactive.ts`，`useEffect.ts`，`useComputed.ts`

- **Core Modules**: `[name].ts` (camelCase)
  - 例: `reactive.ts`，`effect.ts`，`computed.ts`

- **Types**: `types.ts`，`types.d.ts`
  - `types.ts` - エクスポート可能な型定義
  - `types.d.ts` - ambient型定義

- **Tests**: `[filename].test.ts`
  - 例: `plugin.test.ts`，`reactive.test.ts`

#### 設定ファイル

- **Build**: `rollup.config.js`
- **TypeScript**: `tsconfig.json`，`tsconfig.build.json`
- **Test**: `vitest.config.js`
- **Package**: `package.json`

### Code

#### 型（Types）

- **Interfaces/Types**: PascalCase
  - 例: `EnhancedComponent`，`ComposablesContext`，`EffectData`

#### 関数（Functions）

- **Composables**: `use[Name]` (camelCase)
  - 例: `useReactive`，`useEffect`，`useComputed`

- **Core Functions**: `create[Name]` (camelCase)
  - 例: `createReactive`，`createEffect`，`createComputed`

- **Helper Functions**: `[verb][Noun]` (camelCase)
  - 例: `isReactive`，`toRaw`，`installComposables`

#### 変数（Variables）

- **Local Variables**: camelCase
  - 例: `component`，`initialState`，`effectData`

- **Constants**: UPPER_SNAKE_CASE
  - 例: `NODE_ENV`（環境変数）

#### メソッド（Methods）

- **Enhanced Component Methods**: `$[name]` (camelCase，`$`プレフィックス)
  - 例: `$reactive`，`$effect`，`$computed`，`$watch`

#### プライベートプロパティ

- **Internal Context**: `__[name]__` (camelCase，`__`プレフィックス・サフィックス)
  - 例: `__composables__`

## Import Patterns

### Import Order

**標準的な順序**：

```typescript
// 1. External dependencies（外部依存）
import { install, uninstall } from 'riot';
import type { RiotComponent } from 'riot';

// 2. Internal modules（内部モジュール）
import { createReactive } from './reactive';
import { createEffect } from './effect';

// 3. Type imports（型のみのインポート）
import type { EnhancedComponent, EffectFunction } from '../types';

// 4. Constants（定数）
// （該当する場合）
```

### Module/Package Organization

#### 絶対インポート vs 相対インポート

**現在の方針**：
- ✅ **相対インポート**を使用（`./`，`../`）
- ❌ 絶対インポートは未使用（将来的に検討）

**例**：

```typescript
// src/composables/useReactive.ts
import type { EnhancedComponent } from '../types';  // 相対パス

// src/core/plugin.ts
import { createReactive } from './reactive';  // 同じディレクトリ
import type { EnhancedComponent } from '../types';  // 親ディレクトリ
```

#### エクスポートパターン

**`src/index.ts`** - すべてのエクスポートを集約：

```typescript
// Core Plugin
export { installComposables, uninstallComposables } from './core/plugin';

// Core Functions
export { createReactive, isReactive, toRaw } from './core/reactive';

// Composables
export { useReactive } from './composables/useReactive';
export { useEffect, useMount, useUnmount } from './composables/useEffect';

// Types
export type { EnhancedComponent, ComposablesContext, ... } from './types';
```

## Code Structure Patterns

### Module/Class Organization

**標準的なファイル構造**：

```typescript
/**
 * モジュールの説明（ファイルの先頭）
 */

// 1. Imports/includes/dependencies
import { ... } from '...';
import type { ... } from '...';

// 2. Constants and configuration（該当する場合）
const DEFAULT_VALUE = 10;

// 3. Type/interface definitions（該当する場合）
interface LocalData {
  ...
}

// 4. Main implementation（主要な実装）
export function mainFunction(...) {
  ...
}

// 5. Helper/utility functions（ヘルパー関数）
function helperFunction(...) {
  ...
}

// 6. Exports/public API（再エクスポートなど）
```

### Function/Method Organization

**関数内部の構造**：

```typescript
export function createReactive<T extends object>(
  component: EnhancedComponent,
  initialState: T,
): T {
  // 1. バリデーション（該当する場合）
  if (component.__composables__.states.has(stateId)) {
    console.warn('[riot-composables] State already exists');
    return existingState;
  }

  // 2. 内部関数の定義
  const createProxy = (target: any, path: string[] = []): any => {
    // ...
  };

  // 3. メイン処理
  const proxy = createProxy(initialState);

  // 4. ステート保存
  component.__composables__.states.set(stateId, proxy);

  // 5. 戻り値
  return proxy;
}
```

### File Organization Principles

#### コメントスタイル

**JSDocコメント**（パブリックAPI）：

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

**インラインコメント**（複雑なロジック）：

```typescript
// Check if value actually changed
if (oldValue === value) {
  return true;
}

// Trigger component update
try {
  component.update();
} catch (error) {
  console.error('[riot-composables] Error during update:', error);
}
```

## Code Organization Principles

### 1. Single Responsibility（単一責任）

各ファイルは1つの明確な責務を持ちます．

**例**：
- `reactive.ts` - リアクティブシステムのみ
- `effect.ts` - 副作用管理のみ
- `computed.ts` - 計算プロパティのみ

### 2. Modularity（モジュール性）

コードは再利用可能なモジュールに分割されています．

**例**：
- Core層 - 基盤機能
- Composables層 - 高レベルAPI
- 明確な境界

### 3. Testability（テスト容易性）

コードはテストしやすい構造になっています．

**例**：
- 純粋関数の使用
- 依存注入（コンポーネントをパラメータとして受け取る）
- 明確なインターフェース

### 4. Consistency（一貫性）

コードベース全体で一貫したパターンを使用しています．

**例**：
- すべてのコア関数は`create*`命名
- すべてのコンポーザブルは`use*`命名
- すべての公開APIにJSDocコメント

## Module Boundaries

### Core vs Composables

**境界定義**：

```
Core (Layer 1 & 2)
├── 低レベルAPI
├── riot.install()との統合
├── 内部実装の詳細
└── コンポーネント拡張メソッド（$reactive，$effect...）

Composables (Layer 3)
├── 高レベルAPI
├── 開発者が直接使用
├── Coreのラッパー
└── 使いやすいインターフェース（useReactive，useEffect...）
```

**依存関係の方向**：

```
Composables → Core (OK)
Core → Composables (NG)
```

### Public API vs Internal

**Public API** (`src/index.ts`でエクスポート)：

```typescript
// ✅ Public - 開発者が使用
export { useReactive, useEffect, useComputed, useWatch };
export { installComposables, uninstallComposables };

// ❌ Internal - 内部使用のみ（エクスポートしない）
// createProxy, effectData, computedData...
```

### Stable vs Experimental

**現状**：
- すべてのAPIが実験的（v0.0.1）
- v1.0.0で安定版APIを確定

**将来的な分離**：
```typescript
// 安定版API
export { useReactive, useEffect };

// 実験的API
export { useExperimentalFeature } from './experimental';
```

### Dependencies Direction

**許可される依存関係**：

```
Layer 3 (Composables)
    ↓
Layer 2 (Enhanced API)
    ↓
Layer 1 (Core)
    ↓
External (Riot.js)
```

**禁止される依存関係**：
- ❌ Core → Composables
- ❌ Enhanced API → Composables
- ❌ 循環依存

## Code Size Guidelines

### ファイルサイズ

**現状**：

| ファイル | 行数 | 評価 |
|---------|------|------|
| `plugin.ts` | 159行 | ✅ 適切 |
| `reactive.ts` | 129行 | ✅ 適切 |
| `effect.ts` | 104行 | ✅ 適切 |
| `computed.ts` | 86行 | ✅ 適切 |
| `watch.ts` | 118行 | ✅ 適切 |

**ガイドライン**：
- **ファイルサイズ**: 200行以下が理想
- **超過する場合**: モジュール分割を検討

### 関数サイズ

**ガイドライン**：
- **関数サイズ**: 50行以下が理想
- **複雑な関数**: 内部関数に分割

**例**：

```typescript
// ✅ Good - 内部関数に分割
export function createReactive<T extends object>(...) {
  const createProxy = (target, path) => { ... };  // 内部関数
  const proxy = createProxy(initialState);
  return proxy;
}

// ❌ Bad - 1つの長い関数
export function createReactive<T extends object>(...) {
  // 100行以上のコード...
}
```

### クラス/モジュール複雑度

**現状**：
- クラスは未使用（関数ベース）
- 循環的複雑度は低い

**ガイドライン**：
- 分岐は最小限に
- ネストは3レベル以下

### ネスト深度

**ガイドライン**：
- **最大ネストレベル**: 3レベル

**例**：

```typescript
// ✅ Good - ネスト2レベル
if (condition) {
  if (anotherCondition) {
    doSomething();
  }
}

// ⚠️ Warning - ネスト4レベル（避けるべき）
if (a) {
  if (b) {
    if (c) {
      if (d) {  // 深すぎる
        doSomething();
      }
    }
  }
}
```

## Dashboard/Monitoring Structure

**該当なし**（ライブラリのため）

将来的に以下を検討：

```
riot-composables/
└── devtools/              # 開発者ツール（将来）
    ├── browser-extension/ # ブラウザ拡張
    ├── vscode-extension/  # VSCode拡張
    └── standalone/        # スタンドアロンツール
```

## Documentation Standards

### パブリックAPI

**必須**：
- ✅ JSDocコメント
- ✅ パラメータの説明
- ✅ 戻り値の説明
- ✅ 使用例

**例**：

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

### 複雑なロジック

**推奨**：
- インラインコメントで説明
- なぜそうするのか（Why）を記述

**例**：

```typescript
// Only update if value actually changed
// これにより不要な再レンダリングを防ぐ
if (oldValue === value) {
  return true;
}
```

### モジュールREADME

**現状**：
- ルートの`README.md`のみ
- モジュール別READMEは未実装

**将来的に検討**：
- `src/core/README.md` - コアシステムの説明
- `src/composables/README.md` - コンポーザブルの説明

### 言語固有の規約

**TypeScript**：
- TSDocスタイルのコメント
- `@param`，`@returns`，`@example`タグ
- 型定義でのコメント

```typescript
/**
 * Enhanced Riot component with composables support
 */
export interface EnhancedComponent extends BaseRiotComponent {
  /**
   * Create a reactive state object
   */
  $reactive<T extends object>(initialState: T): T;
}
```

## Export Strategy

### エントリーポイント

**`src/index.ts`** - すべてのエクスポートを集約：

```typescript
// ============================================================================
// Core Plugin
// ============================================================================
export {
  installComposables,
  uninstallComposables,
  isComposablesInstalled,
} from './core/plugin';

// ============================================================================
// Core Functions
// ============================================================================
export { createReactive, isReactive, toRaw } from './core/reactive';
export { createEffect } from './core/effect';
export { createComputed, createComputedObject } from './core/computed';
export { createWatch, createWatchMultiple, createWatchObject } from './core/watch';

// ============================================================================
// Composables (Main API)
// ============================================================================
export { useReactive } from './composables/useReactive';
export { useEffect, useMount, useUnmount } from './composables/useEffect';
export { useComputed } from './composables/useComputed';
export { useWatch } from './composables/useWatch';

// ============================================================================
// TypeScript Types
// ============================================================================
export type {
  EnhancedComponent,
  ComposablesContext,
  Composable,
  ComposablesPlugin,
  EffectFunction,
  EffectCleanup,
  EffectData,
  DepsGetter,
  ComputedData,
  WatchCallback,
  WatchData,
} from './types';
```

### Tree-shaking対応

**ES Modules形式**で出力し，tree-shakingをサポート：

```javascript
// ユーザーは必要なものだけインポート
import { useReactive, useEffect } from 'riot-composables';

// 未使用のuseComputed，useWatchなどはバンドルから除外される
```

## Version Control Patterns

### Git無視設定（`.gitignore`）

```gitignore
# Dependencies
node_modules/

# Build output
dist/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Temporary
*.log
*.tmp
```

### npm公開除外設定（`.npmignore`）

```npmignore
# Source files
src/

# Tests
tests/
*.test.ts

# Examples
examples/

# Config files
tsconfig.json
tsconfig.build.json
vitest.config.js
rollup.config.js

# Spec workflow
.spec-workflow/

# Claude Code
.claude/

# Git
.git/
.gitignore
```

**公開されるファイル**：
- ✅ `dist/` - ビルド出力
- ✅ `README.md` - ドキュメント
- ✅ `LICENSE` - ライセンス
- ✅ `package.json` - パッケージ設定
