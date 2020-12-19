# Reference Relations

此文档记录模块之间的引用关系和引用约束，以下描述以 `./src/es/` 为根目录。

## 引用关系

- `./functional` 中 `helpers.js` 引用 `./internal/base.js`
- `./internal/base.js` 无引用
- `./functional` 中 `combinators.js` 引用 `helpers.js`

## 引用约束

- `./functional` 中各文件引用 `./internal` 必须具体到文件，如：`import { asIs } from '../internal/base.js'`;
- `./internal` 中各文件引用 `./functional` 必须具体到文件，如：`import { invoker } from '../functional/helpers.js'`;
- `./functional` & `./internal` 中各文件均不得引用 `./atom`;
- `./functional` & `./internal` 中各文件均不得引用 `./external`;
- `./atom` & `./external` 尽可能保持相对独立，互不引用;
- `./semantic.js` 不被任何上游模块文件引用;
