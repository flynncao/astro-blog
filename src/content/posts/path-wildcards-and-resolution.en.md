---
title: Understanding Path Wildcards and Resolution Across Git, Node.js, and Python
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
  - path resolution
category: code
lang: en
---
## Gitignore

Let’s start with something every programmer deals with: `.gitignore`. We already know some common conventions:

- match globally
  - `/folderName` matches the folder directly under the repository root and all files under that folder (A)
  - `folderName/` matches folders with that exact name at any directory level (B)
  - `folderA/B/` only matches the `B` folder under `folderA`
  - `folderA/B` matches both `B.js` and the `B` directory

By adding a trailing slash to a pattern, we specify that we want to match a directory, not a file. You might argue that this distinction is unnecessary because a directory and a file cannot coexist under the same parent directory with the same name (for example, both named `temp` without an extension). However, consider the following example:

![](https://cfr2-img.flynncao.uk/202602082253369.png)

Here, there are literally two items with the same name, and Git has no problem handling them with simple ignore patterns. Now consider the following patterns:

```
/**/2025_12   # pattern1
/**/2025_12/  # pattern2
```

`/**/` is used to match any directory depth wrapping the target file or directory. In this case, `pattern1` matches both the folder and the file named `2025_12`, while `pattern2` matches only the `2025_12` directory (under `temp`).

You may notice the use of `/**/`. This can be viewed as a general way to match arbitrary directory levels, but it originates from early Unix tooling. Specifically, it comes from the globbing mechanism (`/etc/glob`) used by early Linux systems and later exposed as a library function.

## Glob patterns

The wildcard expansion performed by `/etc/glob` is known as *glob patterns*. These patterns expand wildcard expressions into a list of pathnames that match the pattern.

In general, glob patterns include three basic forms: `*`, `?`, and `[`.

The asterisk is widely used across filesystems. Simply put, `*` matches any sequence of characters except path separators (slashes `/`, and backslashes `\` on Windows). The double asterisk `**` is used to recursively match directories under the current directory.

For example, in `.gitignore`, we can write:

```gitignore
**/*/2025_12    # before 2025_12 there must be at least one parent folder
**/2025_12      # match any directory or file named 2025_12, same as `2025_12`
**/**/2025_12   # no additional restriction; effectively redundant
```

The Gitignore documentation explains that by specifying a pattern like `a/x/b`, we are effectively constraining the directory depth compared to a free `**`.

Based on this, we can quickly understand the difference between two seemingly similar patterns in `.gitignore`: `/temp` and `temp`.

Since `temp` is neither a wildcard nor ends with `/`, it matches all files and directories named `temp` at any level. In contrast, `/temp` is treated as a path rather than a general pattern. According to the documentation:

> If there is a separator at the beginning or middle (or both) of the pattern, then the pattern is relative to the directory level of the particular `.gitignore` file itself. Otherwise, the pattern may also match at any level below the `.gitignore` level.

As a result, `/temp` only ignores the `temp` directory located at the repository root. This is why only the root-level `temp` folder is ignored in the following example:

![](https://cfr2-img.flynncao.uk/202602082253437.png)

Now consider a more subtle case: what if we want to ignore all `temp` folders *except* the one at the repository root? This can also be achieved using wildcard patterns.

`*/temp`
Since `*` matches any single directory name, this pattern requires at least one parent directory. However, it becomes a global match, so both `node/node18/temp` and `node/temp` will be ignored. This is not ideal.

`**/temp`
`**` matches any path, including the root level. This again ignores the root `temp`, which we want to keep.

`**/**/temp`
This is effectively the same as `**/temp` and adds no meaningful constraint.

`**/*/temp`
This is the pattern we want. By forcing at least one directory level before `temp`, only `temp` directories wrapped by another folder are matched, while the root-level `temp` is excluded. Conceptually, this is different from `/**/*/temp`, but in practice they achieve the same result (and I recommend using `/**/*/temp` for clarity).

## How to parse paths in Node.js

If you are a frontend developer today, with powerful bundlers like Vite and Rollup, you are less likely to encounter path-related import issues compared to the Webpack era. Still, path handling can produce subtle and sometimes confusing behavior.

Consider the following example. Given the same working directory, only `path1` and `path4` appear to work as expected:

```javascript
const folderPath = './dummy_folder' // success
const folderPath2 = '/dummy_folder' // seemingly failed
const folderPath3 = '\\dummy_folder' // seemingly failed
const folderPath4 = '.\\dummy_folder' // success

try {
  const folderPath = '.\\dummy_folder2'
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath)
  }
  else {
    console.log('Folder already exists.')
  }
}
catch (error) {
  console.error('Error creating folder:', error)
}
```

But did `path2` and `path3` really fail? No error was logged, and when you re-run the script, the system reports “Folder already exists.” This seems strange at first. To understand what is happening, we need to look at how Windows resolves paths.

> On Windows, `/dummyFolder` and `\\dummyFolder` are treated as *drive-relative* paths. The actual location depends on the current working directory, which can be inspected using `process.cwd()`. If the script is executed from drive `D:`, the folder will be created under `D:\dummyFolder`.

![](https://cfr2-img.flynncao.uk/202602082253501.png)

The folder *was* successfully created. However, `/` is not a universal indicator of the filesystem root across operating systems. Instead, it is interpreted according to OS-specific path semantics. This is why, when interacting with files in a project codebase using `fs` or `node:fs`, relative paths are generally safer.

If you really want to create folders using absolute paths, only certain formats behave as expected. Other strings may still succeed, but produce unintended results:

```js
fs.mkdirSync('\\home\\flynncao\\code\\tommyRepo') // success, but creates a folder literally named '\home\flynncao\code\tommyRepo'
fs.mkdirSync('/home/flynncao/code/tommyRepo') // success, creates 'tommyRepo'
fs.mkdirSync('\home\flynncao\code\tommyRepo') // success, but not as intended
```

Because PowerShell and other Windows shells accept both `\\` and `/` as path separators, both of the following work as expected:

```js
fs.mkdirSync('C:/code/tommyRepo')
fs.mkdirSync('C:\\code\\tommyRepo')
```

## Python and cross-OS solutions

Python faces the same cross-OS path issues as Node.js, but its standard library provides clearer abstractions that help avoid many common pitfalls. The core issue is the same: **path resolution depends on both the operating system and the current working directory (CWD)**.

By default, Python resolves *relative paths* against the **current working directory**, not the location of the script itself. Historically, `os.path` has been used for path manipulation:

```py
print(os.getcwd())  # D:\flynncao\pathpath\py
print(__file__)     # D:\flynncao\pathpath\py\modules\utils.py

targetPath = os.path.join("a", "b", "c")
print(targetPath)   # a\b\c
os.makedirs(targetPath)
# creates: D:\flynncao\pathpath\py\a\b\c
```

Note that the script file path and the working directory are **not necessarily the same**. Functions like `os.makedirs()` operate strictly relative to the **working directory** (i.e., where the Python interpreter is launched), not the script’s location.

To handle cross-platform paths more safely and avoid string-level bugs (such as incorrect path separators like `\` vs `/`), modern Python code should prefer `pathlib`:

```py
from pathlib import Path

targetPath = Path("a") / "b" / "c"
targetPath.mkdir()
# creates: D:\flynncao\pathpath\py\a\b\c
```

However, `pathlib` does not eliminate all platform-specific behavior. Similar to what we observed in the Node.js environment, expressions like `Path("/data/output").mkdir()` behave very differently on Windows and Linux.

In short, this mirrors how Windows and POSIX systems interpret a leading forward slash when constructing paths:

* `Path("data/summary") / "2025"`
   → Creates folders under the working directory
* `Path("/data/summary") / "2025"`
   → Refers to an absolute system path; on most systems, creation will fail due to insufficient permissions

## References

https://git-scm.com/docs/gitignore

https://www.malikbrowne.com/blog/a-beginners-guide-glob-patterns/

https://docs.python.org/3/library/glob.html

https://docs.python.org/3/library/pathlib.html
