---
title: 长期更新｜境外服务食用、资源下载管理指南
published: 2025-03-12T13:50:36+08:00
draft: false
tags:
  - gfw
  - vpn
category: guide
lang: zh
---

一篇你在中国大陆无忧使用境外服务的必备指导书，长期更新。

如果有余力的话，支持下正版会比较好！

> 本文以windows平台为例。也涉及一些跨平台软件。

## 科学上网

一个**稳定**的自建或者机场提供商，是能让你稳定使用境外各种服务的基础。能让你的烦心事最大程度地减到最少。这里不推荐任何机场，但可以在这些repo里试用下自己访问速度快的，一般来说每月20cny的已经可以保证YouTube等较为流畅的访问：

注意！充值年费要慎重，警惕跑路风险。

### DNS转发

2025年，通过dns修改来访问google服务和github等已经变得繁琐且不稳定，但还是有一些服务没被污染值得修改hosts （位置在 `C:\Windows\System32\drivers\etc\hosts`，我目前在改的只有notion，在尾部添加即可。

```
104.26.4.98 www.notion.so

104.26.5.98 www.notion.so

```

有时候raw.githubusercontent.com这个域名会被错误解析为0.0.0.0
通过 www.ipaddress.com/ 查询 raw.githubusercontent.com 的IP，并在hosts中添加一个ipv4/v6地址就行了。

```
185.199.108.133 raw.githubusercontent.com
```

### CLash流量过滤

吸收被steam偷跑200g流量的惨痛教训，以及一些机场并不会提供很缜密的分流规则，我在使用的是某大佬写的[Clash Verge Rev 全局扩展脚本](https://gist.github.com/flynncao/f397d9b2834ab9fe17d658ee159a7b5f)（懒人配置，Clash的其他版本也可参考）：

安装后在WIN+R输入 `steam://open/console` 然后键入 `user_info`, 像这样 `IP_COUNTRY` 显示为 CN就说明只会走国内流量下载了
```
user_info

Server Time: Sat Feb 22 11:41:17 2025

IPCountry: CN

Offline Mode: no
```

也可到Steam窗口左上角点击【Steam】->【Setting】-> 【Downloads】更改到邻近的下载服务器节点：

![](https://cfr2-img.flynncao.uk/202502221140023.png)

## 软件

列出我平时最常用的软件和工具，几乎全部开源免费。

* 邮件客户端：Thunderbird（Windows）， Spark（iOS）
* 浏览器：Chrome，Brave
* 密码：Bitwarden
* 时间追踪：TogglTrack， Wakatime
* 办公：Microsoft Office 365
* 读书：Google Play Books (全平台), 微信读书, Calibre(管理Kindle的书籍和转换格式)
* RSS阅读器：follow.is（Windows），NetnewsWire(iOS)
* 记账： 鲨鱼记账（人民币）、Expendee（外币)
* 笔记：Obsidian（笔记和草稿），Notion（GTD任务规划）
	在用的Obsidian Plugins:
	```json
	[
  "emoji-shortcodes",
  "obsidian-system-dark-mode",
  "cm-chs-patch",
  "dataview",
  "templater-obsidian",
  "editing-toolbar",
  "tag-summary-plugin",
  "tag-word-cloud",
  "tag-search",
  "obsidian-underline",
  "consistent-attachments-and-links",
  "wikilinks-to-mdlinks-obsidian",
  "obsidian-plugin-toc",
  "github-embeds",
  "obsidian-importer",
  "obsidian-rich-links",
  "obsidian-vault-statistics-plugin",
  "table-editor-obsidian",
  "obsidian-image-auto-upload-plugin",
  "image-captions",
  "lazy-plugins",
  "nl-syntax-highlighting",
  "code-styler"
	```
* 输入法：RIME+雾凇拼音
* 词典：欧路词典
* 截图：ScreenToGif，Snipaste
* 视频录制：OBS Studio
* 睡眠管理：AutoSleep（iOS，只需两元）

我平时还在用哔哩哔哩和YouTube，但我也在用[Youtube Unhook](https://unhook.app/)来修改主界面减少沉浸感和算法推荐。
如果你平时用Twitter比较多也可使用[Control Panel For Twitter](https://github.com/insin/control-panel-for-twitter)去掉讨厌的时间线等推送。

## 换源/镜像站

### 一般

[chsrc](https://github.com/RubyMetric/chsrc) 基本上可以覆盖常用的编程语言（node, python) 及winget、bash等系统软件包管理工具。

### git（GitHub）

而作为程序员用的最多的SVN，我推荐直接修改命令来避免直接重定向git到gitclone.com或者其他镜像网站的debuff (如git push在private库定位不到repo的git地址)

只需要在PS输入`echo $profile`就可以查看当前powershell配置文件的位置
如：`C:\Users\westw\Documents\PowerShell\Microsoft.PowerShell_profile.ps1`

直接用notepad或者其他编辑器在ps1文件底部添加上：

```powershell
function gc {
    param (
        [string]$url
    )
    # Check if the URL starts with 'https://github.com/'
    if ($url.StartsWith("https://github.com/")) {
        # Replace 'https://github.com/' with 'https://gitclone.com/'
        $url = $url -replace "https://github.com/", "https://gitclone.com/"
    }
    # Run git clone with the updated URL
    git clone $url
}

# Alias for git push (no modification needed)
function gp {
    git push $args
}
Remove-Item Alias:gc -Force -ErrorAction Ignore
Remove-Item Alias:gp -Force -ErrorAction Ignore
```

记得修改之后要重新开一个terminal窗口才会让配置生效。

![image.png](https://cfr2-img.flynncao.uk/202502221155195.png)

## huggingface & ollama

目前我采用的方案，使用`huggingface-cli` 下载dataset和model。

https://zhuanlan.zhihu.com/p/684178533

## 资源下载

### 番剧
习惯用Telegram追番的，可以试试我的[bot](https://github.com/flynncao/afanime)先。对于平时惯用安卓和Windows且不太想折腾只想离开B站和盗版看番站但有不失弹幕体验的，我推荐一站式在线弹幕追番平台[Animeko](https://myani.org) 来直接下载和缓存观看。

如果有兴趣使用BT或者比较喜欢自己存放，可以试试这个方法：

1. 打开[蜜柑计划](https://mikanani.me/) 官网，搜索想看的番剧
![image.png](https://cfr2-img.flynncao.uk/202502221227241.png)

2. 选择合适的字幕组（如何挑选质量较高的字幕组？可以看我[这篇文章](https://flynncao.uk/posts/translation-group-review)参考）
3. 点击字幕组标题右边的RSS图标
![89dc53bccfa81fc228d67accb4f47466.png](https://cfr2-img.flynncao.uk/202502221228478.png)
1. 在打开的网页复制地址栏的内容（这就是rss feed link，也可以放在其他RSS阅读器里直接使用）
2. 回到你的bt下载工具，如QbitTorrent
3. 在RSS的标签页点击【New Subscription】，输入刚才复制的连接
![image.png](https://cfr2-img.flynncao.uk/202502221231160.png)
 然后就可以等待它订阅自动下载了（需要日常挂机）

* 设置过滤规则
点击刚才RSS标签tab里的RSS Downloader，可以自定义过滤规则，我这里只对【简日】标题进行了过滤，看官可以根据自己需要建立规则，也可以使用正则匹配（autobangumi/animeko也有类似机制）
注意在applay rules to Feeds里勾选特定的番剧订阅源即可，如Ani（巴哈姆特）源的番剧只有一种视频就【默认不过滤】。
![image.png](https://cfr2-img.flynncao.uk/202502221235564.png)

![image.png](https://cfr2-img.flynncao.uk/202502221237148.png)

下载完成的番剧也可以使用[弹弹play](https://www.dandanplay.com/)管理和装载弹幕。

如果你有NAS或者本地硬盘还蛮大的，想搭建自己的流媒体，我推荐使用[autobangumi](https://github.com/EstrellaXD/Auto_Bangumi) 真正解放双手追番。

如果你用Telegram比较多且不差流量，那快来试试[realsearch](https://search.acgn.es/)和我基于RS开发的[追番bot](https://github.com/flynncao/afanime)吧！

### 书籍

纸质书当然自己买就可以了，在线资源除了在各大阅读平台（如微信读书、Amazon、Bookwalker）等正规渠道电子书之外

也可以到全球最大的电子图书馆z-library找一找（经常被封，建议直接私信我），大部分书都有资源。

### 软件

只列出几个我最常用的：

* [果壳剥壳](https://www.ghxi.com/)
* [432Down](https://www.423down.com/)
