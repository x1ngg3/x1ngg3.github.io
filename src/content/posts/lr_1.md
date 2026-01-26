---
title: 随便调调，关于暮色
date: 2020-6-17
author: x1ngg3
description: "突然出现的调色分享，yeah~"
---

突然出现的调色分享，yeah~

<!-- more -->

### 写在前面的话

***

最近一阵考试刚考完，趁着下一波考试还未到来之际，记录一下最近的调色（其实是之前调的，只是做了点微调）。



### 照片分析

***

![原图](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/6JpO1dG4beRFU93.png)

拍摄图片的时候，天其实已经很黑了，得益于大疆的防抖系统，我在ISO200下曝光了0.5s得到了一张还算纯净的照片（其实ISO还可以再高点，400不过分，我没测试过但3200下应该都能用）。对直方图简单分析一下发现图片其实是偏暗的，不少地方死黑了，中间调很少几乎要没了，高光部分倒是保留的很好。欣慰的是图书馆和教学楼的灯光保留的很不错。



### 调色思路

***

最近其实我一直很想拍一点暗调城市风的人文和建筑，但无奈纸面上还不能出校门，只能等放假回去了再拍了。

这里我打算采用比较经典的日落场景色调：高光偏黄，阴影偏蓝，低对比，中高饱和度。





### 实现部分

***

因为调色过程并不是按照面板顺序往下走的，所以我其实不知道如何准确的表达，那这里我直接取最后的面板数据，然后分享一下我的思路。



### 基本

***

​		因为这张照片曝光是不足的，所以可以先拉高一点曝光，这里注意到其实我并没有拉多少，为什么，因为这里的曝光度调整是对整个画面的，但是有些地方我们并不需要提太高，比如高光；**所以合理的做法应该是利用曲线工具来对不同明亮度区域进行不同的调整**，这里下一步会有体现。		

​		高光全压，阴影提高，基操。

​		纹理、清晰度和去朦胧主要看个人喜好了，有的人就是喜欢图片灰一点锐度低一点。

​		加鲜艳度是为了使那些不那么饱和的色彩变得饱和，这里主要对低饱和的颜色影响多。

​		然后再整体拉一点饱和下来。

![基本](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/qzh6aZvkAPY7GWU.png)





### 色调曲线

***

这里我对中间调做了非常大的提升，同时压制了高光，对阴影也只是微微拉了一点，理由看上一步。

![曲线-RGB](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/FmcANgdb2IPL8pl.png)

解释一下曲线，红色曲线使为了给高光加点红，蓝色曲线是为了给阴影加点蓝，没错就是这么直接。

​																![曲线-红](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/R7Y9gv5sN1S6lcO.png)![曲线-蓝](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/CBhvjTbMALmsr5e.png)



### 颜色/HSL

***

还是朝着我们的想法靠，高光偏黄，阴影偏蓝。

![HSL](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/WLaOrRYXbhfZiIU.png)





### 分离色调

***

50和210附近分别是黄色和蓝色，这个常用，要记住。

![分离色调](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/mi7Ne8EAX5lsbrV.png)



### 细节

***

注意噪点消除的话明亮度不能拉太高，不然会丢失过多细节，颜色就没问题可以随便拉。

![细节](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/mfNVTSRh546ePux.png)



### 校准

***

这一步可以和HSL同步进行，

​																									![校准](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/JXvlfgKtVdWa63w.png)



### 成品图

***

![image-20200617205028736](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/BbyoJvlznL7geTk.png)



### 立个flag

***

​		很多地方我没有细讲，考虑到每次如果都说一次太麻烦了，**之后放假了应该会写一篇关于如何正确使用这些工具的分享吧**（虽然没人看，但自己能学到很多），希望假期能拍到满意的作品，yeah~



### 图片分享

***

一起修的几张图片，希望大家喜欢~

 ![20.6.17- (3 - 6)](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/a3WzQAxyMqr4ceP.jpg)



![20.6.17- (2 - 6)](C:\Users\yi\Desktop\zy1RQio5d9DreVh.jpg)



![20.6.17- (5 - 6)](C:\Users\yi\Desktop\T3G69UKc5Cdr8Pp.jpg)



![20.6.17- (6 - 6)](C:\Users\yi\Desktop\O4tjBKISFrhA7gR.jpg)



![20.6.17- (1 - 6)](C:\Users\yi\Desktop\art6KCyxqsAdhwV.jpg)



![20.6.17- (4 - 6)](C:\Users\yi\Desktop\OCko8gcsFSxP52K.jpg)