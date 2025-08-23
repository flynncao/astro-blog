---
title: ESM-only在node22和TypeScript5环境下的实现
published: 2025-08-23T23:43:20.864Z
description: ''
updated: ''
tags:
  - esm
  - node
  - typescript
  - javascript
  - jest
  - unit-test
draft: false
toc: true
lang: zh
---

受antfu的[Move on to ESM-only](https://antfu.me/posts/move-on-to-esm-only)这篇文章启发，我最近开始将项目尽量规定ES Module使用，但在结合tsup调试jest的过程中，我遇到了一些问题。这篇文章会教你最大程度地灵活使用javascript, typescript到jest, viest, tsup这些流行bundler和测试库，解决他们的配置和兼容性。

## package.json

这里只有一个字段需要注意：
```json
"type": "module" // or "commonjs" or " " 
 ```
 使用 "type: module" 会：
 
• 强制所有的 `.js/.ts` 被识别为es-module
• 禁止这些文件里的require()语法
 
使用 "type: commonjs" 会：

• 强制所有的 `.js/.ts` 被识别为commonjs
• 禁止import/export等方式导入导出module

不使用 "type" 字段，那么默认是 "type: commonjs"


 > 如果使用`json5` 格式那么可以在脚本字段后添加`//`注释

我们这篇文章需要你先开启`"type": "module"`。但这不意味着你不能用require()语法导入esm， 这在node v22.12.0 以后是默认支持的，先前的node版本需要追加`--experimental-vm-modules` flag。


## Typescript5.8

既然要使用TypeScript，那么就离不开对`tsconfig.json`文件的配置。如果新初始化项目没有这个配置，可以用`tsc --init`命令生成一个默认的配置文件。（附带了很详细的配置）

- module: 控制输出的JS模块系统的表现（如import/export或者require的表现）。数值为： es2022/commonjs/AMD/UMD等等，`ts-jest` 推荐使用`es2022` 或者 `esnext`  搭配 `type:module` 使用; 如果使用`node16/node18/nodenext` ，相当于放权给`package.json`或者根据类型、语法自动进行判断
- target: es6/es5/es2022/esnext/es3, 编译typescript文件到目标的语法，这样生成的代码可以尽量兼容旧的node或者浏览器环境
- lib：type-checking相关，例如你的代码需要在浏览器中运行，那么想要 `window` 等对象在IDE也能被识别不报错，这里就要叠加上上 `DOM`  。
    > 一切原生不支持Typescript的库仍需要实用`npm add -D @types/eslint` 等形式手动安装types （如何解决“老项目的导入地狱”? 请待下回分解）
- moduleresolution: 控制TS在编译过程如何在模块里寻找源文件（算法），node16, node22必须显示规定file extension无论js/ts, 如果切换为bundler,一般都会给通过如tsup和vite（这里会要求你把module也改为esnext等）
    

## jest(ts-jest)

在使用jest应付以上esm-only环境时，一个最常见的问题是can't require(ESM)，即使在最新的node版本下也无法，原因是这个lib依赖的是`ts-node`（一个几乎两年无更新的项目）

![](https://cfr2-img.flynncao.uk/202508232333506.png)

而jest到现在为止仍然没有正式支持ESM引入单元测试，而且对mocking等功能的支持很差 ，虽然jest自身可以通过追加`--experimental-vm-modules`参数来支持，但ts-jest，作为一个ts->js的transformer没能力更改jest的引入行为。因此实用前两章的 `type:module` 配置+ES2022/ESNext仍然会出错。

ts-jest给出了如下直到
1. 遵循jest的esm支持官方引导 https://jestjs.io/docs/ecmascript-modules
2. 在package.json设置`type: "module"`，并设置`tsconfig`里的module为`Node16/Node18/NodeNext` ；或者 在package.json设置`type: "commonjs"`，并设置`tsconfig`里的module为`ES2015/ES2022/ESNEXT`

按照我们的需求，我们只能设置`type: "module"`。另外，想要显示声明文件拓展名导入ts文件（而不是用`js`后缀导入`ts`文件如 `import { foo } from './foo.ts'` 只需要在`tsconfig`里添加如下参数：

```json
    "moduleResolution": "nodenext",
    "allowImportingTsExtensions": true,
    "noEmit": true,
```


这时候我们可以开始写测试npm script了，按照（1）的要求

请使用`npm`或者`pnpm`安装`cross-env`包后使用
```json
    "test": "cross-env NODE_OPTIONS=\"$NODE_OPTIONS --experimental-vm-modules\"  jest --watchAll",
    "test:coverage": "cross-env  NODE_OPTIONS=\"$NODE_OPTIONS --experimental-vm-modules\"  jest --coverage "
```

》 

最终结果 unit test可以正常进行、coverage可以计算，也能正常使用typescript编写代码和测试文件、导入导出esm模块。

![](https://cfr2-img.flynncao.uk/202508240032209.png)

![](https://cfr2-img.flynncao.uk/202508240032301.png)

完整的`tsconfig.json`如下：

```json5
{
  "compilerOptions": {
    "lib": [
      "ESNext"
      "DOM"
    ],
    "outDir": "build",
    "removeComments": true,
    "module": "nodenext",
    "target": "ES6",
    "baseUrl": "./",
    "esModuleInterop": true,
    "moduleResolution": "nodenext",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "isolatedModules": true,
    "paths": {},
    // 这些都是默认配置
    "alwaysStrict": true,
    "allowUnreachableCode": false,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["./**/*.ts"],
  "exclude": [
    "node_modules/**/*"
  ]
}
```
这是我的tsup配置：

```ts
import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  return {
    entry: [
      './src/index.ts',
    ],
    splitting: true,
    sourcemap: false,
    clean: false,
    outDir: 'dist',
    format: ['esm'],
    minify: !options.watch,
  }
})
```
