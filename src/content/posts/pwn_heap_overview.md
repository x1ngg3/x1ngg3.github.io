---
title: Heap Overview
date: 2020-10-11
author: x1ngg3
description: "heap~"
---

heap~

<!-- more -->

### sbrk()&&brk()

**reference:**[sbrk(2) - Linux man page](https://linux.die.net/man/2/sbrk)



> ## Description
>
> **brk**() and **sbrk**() change the location of the *program break*, which defines the end of the process's data segment (i.e., the program break is the first location after the end of the uninitialized data segment). Increasing the program break has the effect of allocating memory to the process; decreasing the break deallocates memory.
>
> **brk**() sets the end of the data segment to the value specified by *addr*, when that value is reasonable, the system has enough memory, and the process does not exceed its maximum data size (see **[setrlimit](https://linux.die.net/man/2/setrlimit)**(2)).
>
> **sbrk**() increments the program's data space by *increment* bytes. Calling **sbrk**() with an *increment* of 0 can be used to find the current location of the program break.
>
> 
>
> ## Return Value
>
> On success, **brk**() returns zero. On error, -1 is returned, and *errno* is set to **ENOMEM**. (But see *Linux Notes* below.)
>
> On success, **sbrk**() returns the previous program break. (If the break was increased, then this value is a pointer to the start of the newly allocated memory). On error, *(void \*) -1* is returned, and *errno* is set to **ENOMEM**.



**大概就是：**

**sbrk()用来增加堆块的大小，但是调用sbrk(0)的话是会返回当前的program break;**

**brk()用来重新设置program break;**

**这里用ctf-wiki上的例子可以很好理解。**



```c
/* sbrk and brk example */
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>

int main()
{
        void *curr_brk, *tmp_brk = NULL;

        printf("Welcome to sbrk example:%d\n", getpid());

        /* sbrk(0) gives current program break location */
        tmp_brk = curr_brk = sbrk(0);
        printf("Program Break Location1:%p\n", curr_brk);
        getchar();

        /* brk(addr) increments/decrements program break location */
        brk(curr_brk+4096);

        curr_brk = sbrk(0);
        printf("Program break Location2:%p\n", curr_brk);
        getchar();

        brk(tmp_brk);

        curr_brk = sbrk(0);
        printf("Program Break Location3:%p\n", curr_brk);
        getchar();

        return 0;
}
/*
output:
Welcome to sbrk example:3336
Program Break Location1:0x55555557a000
a
Program break Location2:0x55555557b000
Program Break Location3:0x55555557a000
a
*/
```



**另外我进行了如下的测试，在程序开始的时候，我两次sbrk(0)，但是返回的值却不一样，但在这之后的sbrk(0)都能返回同一个值。**

**猜测可能是因为第一次返回的是bss_end的位置，第二次才是返回了正确的heap起始位置，**因为bss_end的位置和heap之间是有一段空缺的嘛，可以看下面的示意图。这些都是我的猜测，我也还没动调试一下，如果有错欢迎留言指正。



```c
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
int main()
{
	void *cur=NULL;

	cur = sbrk(0);
	printf("cur_brk at: %p\n", cur);

	cur = sbrk(0);
	printf("cur_brk at: %p\n", cur);

	cur = sbrk(0);
	printf("cur_brk at: %p\n", cur);

	cur = sbrk(0x1000);
	cur = sbrk(0);
	printf("cur_brk at: %p\n", cur);

	cur = sbrk(0x1000);
	cur = sbrk(0);
	printf("cur_brk at: %p\n", cur);
	
	cur = sbrk(0);
	printf("cur_brk at: %p\n", cur);
}
/*
output:
cur_brk at: 0x55e680100000
cur_brk at: 0x55e680121000
cur_brk at: 0x55e680121000
cur_brk at: 0x55e680122000
cur_brk at: 0x55e680123000
cur_brk at: 0x55e680123000
*/
```

![program_virtual_address_memory_space](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/VH8wAYEZe25qQfu.png)





### mmap

malloc 会使用 [mmap](http://lxr.free-electrons.com/source/mm/mmap.c?v=3.8#L1285) 来创建独立的匿名映射段。匿名映射的目的主要是可以申请以 0 填充的内存，并且这块内存仅被调用进程所使用。

> 使用cat /proc/进程 id/maps 查看c程序进程内存映射
>
> 1.首先把 c 程序编译成 a.out 文件 
>
> 2.gdb a.out
>
> 3.查看执行该文件对应的进程 #ps au
>
> 4.a.out 所对应的PID即为所需

