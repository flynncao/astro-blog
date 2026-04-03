---
title: 理解Git、Node.js与Python中的路径通配符与解析机制
published: 2026-02-08T23:59:36+08:00
updated: 2026-02-08T23:59:36+08:00
draft: false
tags:
  - python
  - javascript
  - powershell
  - bash
  - linux
  - path
  - 路径解析
category: code
lang: zh
---

## Gitignore

让我们从每个程序员都会接触的`.gitignore`开始。我们已经了解一些常见约定：

- 全局匹配
  - `/folderName` 匹配仓库根目录下的同名文件夹及其所有子文件
  - `folderName/` 匹配任意目录层级的同名文件夹
  - `folderA/B/` 仅匹配`folderA`下的`B`文件夹
  - `folderA/B` 同时匹配`B.js`文件和`B`目录

通过在模式末尾添加斜杠，我们指定要匹配的是目录而非文件。你可能会认为这种区分没有必要，因为目录和文件无法在相同父目录下以相同名称共存（例如都叫`temp`且无扩展名）。但考虑以下示例：

![](https://cfr2-img.flynncao.uk/202602082253369.png)

这里确实存在两个同名项，而Git通过简单的忽略模式就能处理它们。现在观察以下模式：

```
/**/2025_12   # 模式1
/**/2025_12/  # 模式2
```

`/**/`用于匹配任意深度的目录层级。此时`模式1`会同时匹配名为`2025_12`的文件夹和文件，而`模式2`仅匹配`temp`目录下的`2025_12`文件夹。

你可能注意到`/**/`的使用。这可以视为匹配任意目录层级的通用方式，但其起源可追溯到早期的Unix工具链。具体来说，它源自早期Linux系统使用的通配扩展机制（`/etc/glob`），后来作为库函数对外开放。

## Glob模式

由`/etc/glob`执行的通配符扩展被称为*glob模式*。这类模式能将通配表达式展开为匹配该模式的路径名列表。

通常，glob模式包含三种基本形式：`*`、`?`和`[`。

星号在文件系统中被广泛使用。简而言之，`*`匹配除路径分隔符（斜杠`/`，Windows中反斜杠`\`）外的任意字符序列。双星号`**`用于递归匹配当前目录下的所有目录。

例如在`.gitignore`中可写作：

```gitignore
**/*/2025_12    # 2025_12前必须至少存在一层父文件夹
**/2025_12      # 匹配任意名为2025_12的目录或文件，等同于`2025_12`
**/**/2025_12   # 无额外限制，实际上冗余
```

Gitignore文档说明，通过指定`a/x/b`这类模式，我们实际上比自由使用`**`增加了目录层级的限制。

基于此，我们可以快速理解`.gitignore`中两个看似相似模式的区别：`/temp`与`temp`。

由于`temp`既非通配符也非以`/`结尾，它会匹配所有层级的同名文件和目录。而`/temp`被视为路径而非通用模式。根据文档说明：

> 如果模式开头或中间（或两者）存在分隔符，则该模式相对于特定`.gitignore`文件所在的目录层级。否则，模式也可能匹配`.gitignore`层级之下的任意层级。

因此，`/temp`仅忽略仓库根目录下的`temp`目录。这正是下例中仅根级`temp`文件夹被忽略的原因：

![](https://cfr2-img.flynncao.uk/202602082253437.png)

现在考虑更微妙的情况：如果我们想忽略所有`temp`文件夹，*除了*仓库根目录的那个呢？这同样可以通过通配模式实现。

`*/temp`
由于`*`匹配任意单层目录名，该模式要求至少存在一层父目录。但这会变成全局匹配，导致`node/node18/temp`和`node/temp`都被忽略，并不理想。

`**/temp`
`**`匹配包括根层级在内的任意路径。这又会忽略我们想要保留的根级`temp`。

`**/**/temp`
这实际上等同于 `**/temp`，并未增加有意义的限制条件。

`**/*/temp`
这才是我们需要的模式。通过强制在 `temp` 前至少存在一个目录层级，只有被另一个文件夹包裹的 `temp` 目录会被匹配，而根层级的 `temp` 则被排除。从概念上讲，这与 `/**/*/temp` 不同，但在实践中它们能达到相同效果（为清晰起见，我推荐使用 `/**/*/temp`）。

## 如何在 Node.js 中解析路径

对于当今的前端开发者而言，借助 Vite 和 Rollup 等强大的打包工具，相比 Webpack 时代，遇到路径相关导入问题的可能性已大大降低。然而，路径处理仍可能产生微妙且有时令人困惑的行为。

考虑以下示例。在相同工作目录下，只有 `path1` 和 `path4` 似乎按预期工作：

```javascript
const folderPath = './dummy_folder' // 成功
const folderPath2 = '/dummy_folder' // 看似失败
const folderPath3 = '\\dummy_folder' // 看似失败
const folderPath4 = '.\\dummy_folder' // 成功

try {
  const folderPath = '.\\dummy_folder2'
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath)
  }
  else {
    console.log('文件夹已存在。')
  }
}
catch (error) {
  console.error('创建文件夹时出错：', error)
}
```

但 `path2` 和 `path3` 真的失败了吗？没有错误被记录，当你重新运行脚本时，系统会报告“文件夹已存在”。这起初看起来很奇怪。要理解发生了什么，我们需要了解 Windows 如何解析路径。

> 在 Windows 上，`/dummyFolder` 和 `\\dummyFolder` 被视为*驱动器相对*路径。实际位置取决于当前工作目录，可通过 `process.cwd()` 查看。如果脚本是从 `D:` 驱动器执行的，文件夹将在 `D:\dummyFolder` 下创建。

![](https://cfr2-img.flynncao.uk/202602082253501.png)

文件夹*确实*成功创建了。然而，`/` 并非跨操作系统的通用文件系统根目录指示符，而是根据操作系统特定的路径语义进行解释。这就是为什么在使用 `fs` 或 `node:fs` 与项目代码库中的文件交互时，相对路径通常更安全。

如果你确实想使用绝对路径创建文件夹，只有某些格式会按预期工作。其他字符串可能仍会成功，但会产生意想不到的结果：

```js
fs.mkdirSync('\\home\\flynncao\\code\\tommyRepo') // 成功，但创建了一个字面名为 '\home\flynncao\code\tommyRepo' 的文件夹
fs.mkdirSync('/home/flynncao/code/tommyRepo') // 成功，创建 'tommyRepo'
fs.mkdirSync('\home\flynncao\code\tommyRepo') // 成功，但不符合预期
```

因为 PowerShell 和其他 Windows shell 接受 `\\` 和 `/` 作为路径分隔符，所以以下两种方式都能按预期工作：

```js
fs.mkdirSync('C:/code/tommyRepo')
fs.mkdirSync('C:\\code\\tommyRepo')
```

## Python 与跨操作系统解决方案

Python 面临与 Node.js 相同的跨操作系统路径问题，但其标准库提供了更清晰的抽象，有助于避免许多常见陷阱。核心问题相同：**路径解析既依赖于操作系统，也依赖于当前工作目录（CWD）**。

默认情况下，Python 根据**当前工作目录**解析*相对路径*，而不是脚本本身的位置。历史上，`os.path` 被用于路径操作：

```py
print(os.getcwd())  # D:\flynncao\pathpath\py
print(__file__)     # D:\flynncao\pathpath\py\modules\utils.py

targetPath = os.path.join("a", "b", "c")
print(targetPath)   # a\b\c
os.makedirs(targetPath)
# 创建：D:\flynncao\pathpath\py\a\b\c
```

请注意，脚本文件路径和工作目录**不一定相同**。像 `os.makedirs()` 这样的函数严格相对于**工作目录**（即启动 Python 解释器的位置）操作，而不是脚本的位置。

为了更安全地处理跨平台路径并避免字符串级别的错误（例如错误的路径分隔符如 `\` 与 `/`），现代 Python 代码应优先使用 `pathlib`：

```py
from pathlib import Path

targetPath = Path("a") / "b" / "c"
targetPath.mkdir()
# 创建：D:\flynncao\pathpath\py\a\b\c
```

然而，`pathlib` 并未消除所有平台相关的行为。类似于我们在 Node.js 环境中观察到的情况，像 `Path("/data/output").mkdir()` 这样的表达式在 Windows 和 Linux 系统上的表现差异显著。

简而言之，这反映了 Windows 和 POSIX 系统在构建路径时对前导正斜杠的不同解读：

* `Path("data/summary") / "2025"`
   → 在工作目录下创建文件夹
* `Path("/data/summary") / "2025"`
   → 指向一个绝对系统路径；在大多数系统上，由于权限不足，创建操作将会失败

## 参考资料

https://git-scm.com/docs/gitignore

https://www.malikbrowne.com/blog/a-beginners-guide-glob-patterns/

https://docs.python.org/3/library/glob.html

https://docs.python.org/3/library/pathlib.html
