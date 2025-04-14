---
title: 图床选择和自部署指南
published: 2024-12-12T00:00:00.000+00:00
tags:
  - self-hosting
  - 私有云
categories:
  - tutorial
keywords: 私有云,图床
lang: zh
---

用最稳定和省米的方式部署属于你自己的长期图床。

## 如何上传？

有很多方式，但我目前用过的最方便的方式无非是[picgo](https://picgo.github.io/PicGo-Doc/zh/guide/)  。如果你是Typora使用者可以搭配[picgo-core](https://picgo.github.io/PicGo-Core-Doc/zh/guide/)，~~这样又少了一个开机启动项。~~

## 图床选择

### Github

✅优点：不限制上传图的大小和数量，同步方式多种多样配置方便。

🚫 缺点：中国可能会无法直接访问，另外你的图片一定会是**公开的**（私有库不能当图床）

具体方法如下：

假设你已经[注册](https://github.com/signup)好了Github，请直接访问 [https://github.com/new](https://github.com/new) 来新建一个仓库（这里就直接用英文页面了，机翻痛苦），输入仓库名，选择 `public` 后点击【New Repository】来新建一个公开库。

![](https://cfr2-img.flynncao.uk/202412122141966.png)

然后你就可以使用Git工具（如果不想额外学习也可以使用 [Github-Desktop](https://desktop.github.com/download/)工具来同步git库）向这个库里上传图片或者其他资源了！当然这个空的库页面也提供了一个极简的命令行上传教程：

假设我上传的文件名为 `bread.jpeg` ，上传完成后访问这个特定资源的URL如下：

[https://github.com/flynncao/blog-img-sample/blob/main/bread.jpeg](https://github.com/flynncao/blog-img-sample/blob/main/bread.jpeg)

> 格式为：`https://github.com/你的github用户名/你的仓库名/blob/默认分支名/资源文件名

### 国外对象存储提供商
**💡Cloudflare（10GB/流量 每月） 和 AWS（5GB/流量 每月）均有免费的额度, 前提需要添加受支持的付款方式：*⚠️以上存储量也会参考访问带宽，但桶里的数据超出这个存储量一定会被计费**

✅优点：可以借助Cloudflare（以下简称为CF或者cf）和AWS的cdn节点来进行流量优化，几乎不用担心国内或者其它地区无法访问的问题。

🚫缺点：免费存储额有限制，超出需要氪金；配置略微繁琐。

- AWS

> AWS 接受哪些付款方式？
AWS 接受大多数主流信用卡和借记卡。如果您是 AWS Inc. 客户，您可以使用支持美元货币交易的中国银联（CUP）信用卡注册。如果您是 Amazon Web Services India Private Limited 客户，则可以使用 Visa、MasterCard 或 American Express。注意：某些信用卡可能需要从您的银行获得额外授权才能用于支付账单。有关详细信息，请与您的信用卡发卡银行联系。如果您符合某些要求，AWS 还接受美国银行账户的 ACH 直接付款或欧洲银行账户的 SEPA 直接付款。如果您的付款/结算方式未在上方列出，请联系我们 以详细了解接受的付款方式。
>
- CloudFlare

Cloudflare 仅接受 Visa、Mastercard、American Express、Discover、PayPal 和 UnionPay。目前不支持其他付款方式（例如 Maestro）。 [source](https://developers.cloudflare.com/support/account-management-billing/billing-cloudflare-plans/cloudflare-billing-policy/#approved-payment-methods)

完成上述付款方式（payment methods）添加之后，以CloudFlare为例就可以前往控制面板的【R2 Object Storage】直接用【Create Bucket】新建一个桶就行了

![](https://cfr2-img.flynncao.uk/202412122141944.png)

![](https://cfr2-img.flynncao.uk/202412122142035.png)

创建完成之后你就可以用CloudFlare自带的上传工具上传图片或者其他媒体文件。但如果想用到第一章所说的picgo省去繁琐的上传和获取公开URL链接，可以查看之后的“和PicGo结合→Cloudflare”章节。

### SM.MS

✅优点：无需visa或者万事达卡，上传和配置最为方便，默认提供全球cdn加速。

🚫缺点：有上传大小限制，容量相比cf和aws无明显优势[（5GB）](https://smms.app/pricing)。

注册完成就可以直接上传，如果 [sm.ms](http://sm.ms) 本体网站无法访问可以使用 [smms.app](http://smms.app)。

![](https://cfr2-img.flynncao.uk/202412122144854.png)
可以得到最直白的各种链接。

## 和PicGo结合，解放双手

### Github

直接访问 [`https://github.com/settings/tokens`](https://github.com/settings/tokens) 下的【personal access tokens】→ 【tokensclassic】来创建仓库的资源管理密钥，选择经典（classic）方式可以少去很多配置的麻烦。

![](https://cfr2-img.flynncao.uk/github1-202412122144497.png)
`Note` 是名称，可以随便写。过期时间  `Expiration` 我一般习惯会选择一年，看个人喜好。重要的是给这个token选择合适的适用范畴（scopes），这里直接勾选 `repo` 下的所有选项即可：

![](https://cfr2-img.flynncao.uk/github2-202412122145306.png)

然后你就可以看到唯一的一个token值，需要保存起来！因为下次你就看不到了。

![](https://cfr2-img.flynncao.uk/github3-202412122145262.png)

然后回到PicGo主界面左侧菜单找到【Github】，填入刚刚获取的token到“设定Token”里，仓库名的格式参考“用户名+仓库名”，我这里是 `flynncao/blog-img-sample` 。分支名就写默认的 `main` 。可以点击【设为默认图床】每次上传就无需选择图床了。

![](https://cfr2-img.flynncao.uk/picgo1-202412122146815.png)
回到上传区，测试！

![](https://cfr2-img.flynncao.uk/picgo2-202412122146417.png)

默认你会得到一个以下的markdown图片链接地址，通过给出的URL也可以替换为其他格式。当然也可以在上传区选择默认链接格式。

![](https://raw.githubusercontent.com/flynncao/blog-img-sample/main/akane.jpg](https://raw.githubusercontent.com/flynncao/blog-img-sample/main/akane.jpg))

### Cloudflare

去PicGo主程序的【插件设置】里搜索 `Cloudflare` 安装如图的插件

![](https://cfr2-img.flynncao.uk/picgo3-202412122146801.png)

然后回到主菜单【图床选择】就能看到 Cloudflare-r2的字样，需要输入以下信息

![](https://cfr2-img.flynncao.uk/picgo4-202412122147085.png)
这里我会一一说明来源：

- AccountID: 这个是Cloudflare对象存储的个人id，和桶本身无关，可以在【R2对象存储】主页面右侧的【账户详细信息】下找到。

![](https://cfr2-img.flynncao.uk/accountid-202412122147418.png)

- Accesskeyid+SecretAccessKey，同样也是刚刚的界面，我们需要点击【管理R2 API令牌】来创建一个令牌。这里需要选择管理员读写权限。

![](https://cfr2-img.flynncao.uk/Accesskeyid&SecretAccessKey-202412122148895.png)

点击【生成密钥】就可以看到我们需要的信息，具体如下：

![](https://cfr2-img.flynncao.uk/generatepasskey-202412122149472.png)
⚠️ 注意这里的密钥只能在这里查看一次，需要及时保存！Github的密钥也是一样的

- customDomain

自定义域名可以帮助我们更好地定位资源，具体如：

`https://cfr2.abc.com/mai.jpg` 或者 [`https://pub-065e737f79f247c598e6cc3336922ad2.r2.dev/beep.mp3`](https://pub-065e737f79f247c598e6cc3336922ad2.r2.dev/beep.mp3)

在R2对象存储主页面找到我们刚创建的桶名字（如”traveller”），点击进入管理，找到【设置】这个标签，向下可以找到【公开访问】的选项，这里进行二选一：

![](https://cfr2-img.flynncao.uk/publicaccess-202412122150129.png)

这次我们使用R2.dev子域，拷贝CF提供的域名（注意需要去掉前面的 `https://` ） 回到PicGO的CloudFlare R2插件的配置页输入上面需要的信息，存储桶名字就是创建的时候设置的名称，我这里是 `traveller` 。然后点击【设置为默认图床】（上传区也可以切换图床，但略麻烦）

设置完成的效果如图：

![](https://cfr2-img.flynncao.uk/202412122150273.png)

然后就可以回到上传区测试：

![](https://cfr2-img.flynncao.uk/202412122151839.png)

上传完毕我们就得到了一个 markdown格式的链接！

`![]([https://pub-065e737f79f247c598e6cc3336922ad2.r2.dev/yaorena.jpeg](https://pub-065e737f79f247c598e6cc3336922ad2.r2.dev/yaorena.jpeg))`

在上传区可以切换你想上传之后生成的链接模式，当然是基于我们之前设置的“自定义域名”。

### SM.MS

直接访问 [https://smms.app/home/apitoken](https://smms.app/home/apitoken) 点击【Generate Secret Token】创建一个token。

![](https://cfr2-img.flynncao.uk/202412122152635.png)

然后回到PicGO的设置菜单找到【SM.MS】，在“设定Token”填入刚刚生成的token，测试上传即可。

> 注：如果你像我一样PicGo默认提供的sm.ms插件不可用，可以去【插件设置】搜索安装 `smms-user` 这个插件，把刚刚的token填入auth选项中即可。 [ref](https://github.com/PicGo/PicGo-Core/issues/154)

> ![](https://cfr2-img.flynncao.uk/202412122151247.png)

## CDN加速，提升国内访问速度

经过上述方法部署的图床虽然好上手，但中国大陆的访问速度可能堪忧。尤其Github部署的图床能不能访问得到都是个未知数：

![](https://cfr2-img.flynncao.uk/image-hosting-guide-202412201646828.png)

通过这里测试你的图床链接（当然任何形式的URL都可以）的各地区访问速度：

这是我在cloudflare部署的图床经过cf自有的CDN加速访问情况：

### jsdeliver
jsdeliver提供免费托管静态资源并提供分发加速，经过测试只需要将**原链接**替换为如下格式可以将经常抽风的github图片加载速度缩短到毫秒之间。（同名的话，默认会拉取最新版本的文件）

`https://github.com/flynncao/blog-img-sample/blob/main/akane.jpg`

替换为

`https://cdn.jsdelivr.net/gh/flynncao/blog-img-sample@latest/akane.jpg`

> https://cdn.jsdelivr.net/gh/你的用户名/你的仓库名/文件路径

除了缓存会慢一些，这种方式来加速github图床是我首推的，只需要替换原来的链接名即可。

### 第三方CDN加速商（付费）

任何国内CDN服务商加速的流量都需要先给**域名备案**使用，博主是不喜备案人士。因此这里先挖个坑待填。

[又拍云](https://www.upyun.com/)提供现金券和SSL证书奖励，可以用来尝鲜：

![](https://cfr2-img.flynncao.uk/image-hosting-guide-202412201631026.png)

## 参考

https://www.yuhuizhen.com/2022/11/27/image-bed/index.html
