---
title: Vue的NextTick用法及JavaScript异步原理
published: 2021-08-06T20:18:20.864Z
updated: 2025-09-07T20:03:11.864Z
description: ''
tags:
  - javascript
  - vue
  - vue3
draft: false
toc: true
lang: zh
---


# vue的nextTick函数及JavaScript异步原理


## 优先级

在JavaScript中，对于某一确定的函数内，可以按优先级分为以下三种：


1、同步任务

2、伪同步任务(nextTick)

3、异步任务（setTimeout、promise（microtask queue）、setTimeout、MutationObserver、DOM事件、Ajax等）



相关材料：[vue nextTick深入理解－vue性能优化、DOM更新时机、事件循环机制 - 蒲公英tt - 博客园 (cnblogs.com)](https://www.cnblogs.com/hity-tt/p/6729118.html)

这个例子中在控制台的输出结果如图：


![](https://cfr2-img.flynncao.uk/2282342-20210806180715143-861308543.png)


系统总会先执行某一个上下文中的同步任务，然后再考虑伪同步任务和异步任务，

另外，总结的规则如下：
　　　　　　a、在同一事件循环中，只有所有的数据更新完毕，才会调用nextTick；

　　　　　　b、仅在同步执行环境数据完全更新完毕，DOM才开始渲染，页面才开始展现；

　　　　　　c、在同一事件循环中，如果存在多个nextTick，将会按最初的执行顺序进行调用；

　　　　从用例1+用例4得出：

　　　　　　d、从同步执行环境中的四个tick对应的‘li’数量均为30000可看出，同一事件循环中，nextTick所在的视图是相同的；

　　　　从用例2得出：

　　　　　　e、只有同步环境执行完毕，DOM渲染完毕之后，才会处理异步callback

　　　　从用例3得出：

　　　　　　f、每个异步callback最后都会处在一个独立的事件循环中，对应自己独立的nextTick;

　　　　从用例1结论中可得出：

　　　　　　g、这个事件环境中的数据变化完成，在进行渲染［视图更新］，可以避免DOM的频繁变动，从而避免了因此带来的浏览器卡顿，大幅度提升性能；

　　　　从b可以得出：

　　　　　　h、在首屏渲染、用户交互过程中，要巧用同步环境及异步环境；首屏展现的内容，尽量保证在同步环境中完成；其他内容，拆分到异步中，从而保证性能、体验


## Vue3环境测试 

`nextTick`在Vue3中也是一种微任务，和DOM更新、异步函数等等一样。但不意味着他们在同一个任务内，请看测试：

```js
const purchase = async (price) => {
  setTimeout(() => {
    console.log('Wait 0 seconds.')
    console.log('setTimeout', document.querySelector('#currentBalance').innerHTML)
  }, 0)
  balance.value -= getRealPrice(price)
  console.log('Purchase successful!')
  
  await nextTick(() => {
    console.log('Wait for next tick.')
    datetime.value = new Date().toLocaleString()
    console.log('nextTick', document.querySelector('#currentBalance').innerHTML)
  })
}
```
输出结果为：
```
Purchase successful!
AboutView.vue:22 Wait for next tick.
AboutView.vue:24 nextTick 497.76
AboutView.vue:15 Wait 0 seconds.
AboutView.vue:16 setTimeout 497.76
```
如果将NextTick函数提前到`balance.value -= getRealPrice(price)`这行（下令修改DOM）之前，无论加不加`await` 都会得到：
```
Purchase successful!
AboutView.vue:22 Wait for next tick.
AboutView.vue:24 nextTick 500.00
AboutView.vue:15 Wait 0 seconds.
AboutView.vue:16 setTimeout 497.76
```
这时再加入异步函数等，优先级和其他**微任务**等同。例如我们按照`DOM更新->NextTick->异步函数）的顺序书写，希望结果也如此：

```js
const purchase = async (price) => {
  setTimeout(() => {
    console.log('Wait 0 seconds.')
    console.log('setTimeout', document.querySelector('#currentBalance').innerHTML)
  }, 0)
  balance.value -= getRealPrice(price)
  console.log('Purchase successful!')

  getMembershipDataAsync().then((data) => {
    console.log('Membership data:', data)
  })
  getExternalData().then((data) => {
    console.log('External data:', data)
  })

  getLocalData().then((data) => {
    console.log('Local data:', data)
  })

  nextTick(() => {
    console.log('Wait for next tick.')
    datetime.value = new Date().toLocaleString()
    console.log('nextTick', document.querySelector('#currentBalance').innerHTML)
  })
}
```

上述代码的表现结果是竞速，即谁执行的快谁先输出。其中nextTick > localData > getMembershipDataAsync (外部request) > getMembershipDataAsync (固定1s延迟) > setTimeOut

> 所有的async(Promise)函数只有在resolve/reject的似乎才会进入微任务队列（在之前是同步任务），因此会有了类似`promise.racing([promise1, promise2])`的错觉。

> 但setTimeOut本身不属于微任务，优先级较低，因此无论如何都会放到最后

加入await关键字后按照给定的顺序执行，复合预期。


--- 
完整代码请见：https://github.com/flynncao/vue3-playground/blob/nexttick-async/src/views/AboutView.vue

（原始地址：https://www.cnblogs.com/flynncao/p/15109874.html）

## 参考

https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/

https://vuejs.org/api/general#nexttick
