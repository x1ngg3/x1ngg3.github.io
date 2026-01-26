---
title: x1ngg3's memo
date: 2020-10-3
author: x1ngg3
description: "我的备忘录"
---

我的备忘录

<!-- more -->

### linux turn off ALSR

```shell
echo 0 >/proc/sys/kernel/randomize_va_space 
0 - 表示关闭进程地址空间随机化。
1 - 表示将mmap的基址，stack和vdso页面随机化。
2 - 表示在1的基础上增加栈（heap）的随机化。
```

可通过该程序来检测：

```c
#include <stdio.h>
#include <unistd.h>
int bss_end;
int main(void)
{
    void *tret;
    printf("bss end:    %p\n", (char *)(&bss_end) + 4);
    tret = sbrk(0);
    if (tret != (void *)-1)
        printf ("heap start: %p\n", tret);
    return 0;
}
```



### linux multiple versions pyhton

```
/usr/bin/python3 -m pip install --upgrade pip
```



### 0xdeadbeef

做题的时候看到有把返回地址填成0Xdeadbeef的，0xdeadbeef 是一个16进制魔术数字，是一种类似Leet的英文单词转写形式，相当于汉语拼音吧。看下翻译就知道了。另外在32位的linux的操作系统中0xc0000000-0xffffffff是内核空间，所以0xdeadbeef是内核空间的一个地址，当用这个地址把eip劫持时，用户代码访问一定出错，即可快速判定我们的payload写的是否正确（eip是否是0xdeadbeef）。



### gdb view return address

[get return address GDB](https://stackoverflow.com/questions/32345320/get-return-address-gdb)

之前在做校赛的时候用到了这个，当时不知道，好一顿找才找到。用stackoverflow上的例子解释。

To get the location of the stored return address of a specific function, you can place a breakpoint at that function and use the `info frame` command.

Here is an example:

```
gdb /path/to/binary
(gdb) br main
(gdb) run
Starting program: /path/to/binary 

Breakpoint 1, 0x08048480 in main ()
(gdb) info frame
Stack level 0, frame at 0xffffd700:
eip = 0x8048480 in main; saved eip = 0xf7e3ca63
Arglist at 0xffffd6f8, args: 
Locals at 0xffffd6f8, Previous frame's sp is 0xffffd700
Saved registers:
ebp at 0xffffd6f8, eip at 0xffffd6fc
```

Note the `saved eip = 0xf7e3ca63` and `eip at 0xffffd6fc`. In this case you will want to overwrite the value at `0xffffd6fc` so that when the function returns execution will continue at the value you stored there.



### gdb view assembly code

[用gdb 查看,执行汇编代码](https://blog.csdn.net/hejinjing_tom_com/article/details/26704487)

使用`disassemble`和`x`命令

```
disassemble /m main 源码和汇编一起排列
disassemble /r main 查看十六进制代码
```

`x/i`查看

```
x/15i main
```

`$pc`指向程序当前运行地址

```
x/5i $pc
```

最常用的显示法

```
x/30gx
```



### fgets

[fgets()函数](https://blog.csdn.net/zhongyoubing/article/details/77652150)

`fgets()`函数原型如下

```
char*  fgets(char* s int n, FILE* stream)
```

参数：

         s: 字符型指针，指向存储读入数据的缓冲区的地址。
    
         n: 从流中读入n-1个字符
    
         stream ： 指向读取的流。譬如stdin，从输入流读



### C_format_string

[C语言中的格式化字符串](https://blog.csdn.net/MyLinChi/article/details/53116760)

```
字符                                    意义
a                 浮点数、十六进制数字和p-计数法(C99)
A                 浮点数、十六进制数字和p-计数法(C99)
c                 输出单个字符
d                 以十进制形式输出带符号整数(正数不输出符号)
e                 以指数形式输出单、双精度实数
E                 以指数形式输出单、双精度实数
f                  以小数形式输出单、双精度实数
g                 以%f%e中较短的输出宽度输出单、双精度实数,%e格式在指数小于-4或者大 于等于精度时使用
G                以%f%e中较短的输出宽度输出单、双精度实数,%e格式在指数小于-4或者大于等于精度时使用
i                  有符号十进制整数(与%d相同)
o                 以八进制形式输出无符号整数(不输出前缀O)
p                 指针
s                  输出字符串
x                  以十六进制形式输出无符号整数(不输出前缀OX)
X                  以十六进制形式输出无符号整数 (不输出前缀OX)
u                  以十进制形式输出无符号整数
```



### fflush（stdout）

```
在使用多个输出函数连续进行多次输出时，有可能发现输出错误。因为下一个数据再上一个数据还没输出完毕，还在输出缓冲区中时，下一个printf就把另一个数据加入输出缓冲区，结果冲掉了原来的数据，出现输出错误。 在 prinf（）；后加上fflush(stdout); 强制马上输出，避免错误。
```



### rebase IDA to match GDB

#### method 1

比如对于在 gdb 中找到该 data 段的数据，ida中显示如下

```
.data:0000000000202018 off_202018      dq offset unk_202040    ; DATA XREF: sub_B6D+15↑o
```

gdb 中指令如下

```
pwndbg> b *$rebase(0x202018)
Breakpoint 2 at 0x555555756018
```

#### method 2

使用如下指令，而选一就行

```
info proc mappings
vmmap
```

gdb 中显示

```
pwndbg> info proc mappings 
process 4789
Mapped address spaces:

          Start Addr           End Addr       Size     Offset objfile
      0x555555554000     0x555555556000     0x2000        0x0 /home/x1ngg3/Desktop/heap/books
      0x555555755000     0x555555756000     0x1000     0x1000 /home/x1ngg3/Desktop/heap/books
      0x555555756000     0x555555757000     0x1000     0x2000 /home/x1ngg3/Desktop/heap/books
      0x555555757000     0x555555779000    0x22000        0x0 [heap]
      0x7ffff7a0d000     0x7ffff7bcd000   0x1c0000        0x0 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7ffff7bcd000     0x7ffff7dcd000   0x200000   0x1c0000 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7ffff7dcd000     0x7ffff7dd1000     0x4000   0x1c0000 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7ffff7dd1000     0x7ffff7dd3000     0x2000   0x1c4000 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7ffff7dd3000     0x7ffff7dd7000     0x4000        0x0 
      0x7ffff7dd7000     0x7ffff7dfd000    0x26000        0x0 /lib/x86_64-linux-gnu/ld-2.23.so
      0x7ffff7fdb000     0x7ffff7fde000     0x3000        0x0 
      0x7ffff7ff7000     0x7ffff7ffa000     0x3000        0x0 [vvar]
      0x7ffff7ffa000     0x7ffff7ffc000     0x2000        0x0 [vdso]
      0x7ffff7ffc000     0x7ffff7ffd000     0x1000    0x25000 /lib/x86_64-linux-gnu/ld-2.23.so
      0x7ffff7ffd000     0x7ffff7ffe000     0x1000    0x26000 /lib/x86_64-linux-gnu/ld-2.23.so
      0x7ffff7ffe000     0x7ffff7fff000     0x1000        0x0 
      0x7ffffffde000     0x7ffffffff000    0x21000        0x0 [stack]
  0xffffffffff600000 0xffffffffff601000     0x1000        0x0 [vsyscall]
pwndbg> vmmap
LEGEND: STACK | HEAP | CODE | DATA | RWX | RODATA
    0x555555554000     0x555555556000 r-xp     2000 0      /home/x1ngg3/Desktop/heap/books
    0x555555755000     0x555555756000 r--p     1000 1000   /home/x1ngg3/Desktop/heap/books
    0x555555756000     0x555555757000 rw-p     1000 2000   /home/x1ngg3/Desktop/heap/books
    0x555555757000     0x555555779000 rw-p    22000 0      [heap]
    0x7ffff7a0d000     0x7ffff7bcd000 r-xp   1c0000 0      /lib/x86_64-linux-gnu/libc-2.23.so
    0x7ffff7bcd000     0x7ffff7dcd000 ---p   200000 1c0000 /lib/x86_64-linux-gnu/libc-2.23.so
    0x7ffff7dcd000     0x7ffff7dd1000 r--p     4000 1c0000 /lib/x86_64-linux-gnu/libc-2.23.so
    0x7ffff7dd1000     0x7ffff7dd3000 rw-p     2000 1c4000 /lib/x86_64-linux-gnu/libc-2.23.so
    0x7ffff7dd3000     0x7ffff7dd7000 rw-p     4000 0      
    0x7ffff7dd7000     0x7ffff7dfd000 r-xp    26000 0      /lib/x86_64-linux-gnu/ld-2.23.so
    0x7ffff7fdb000     0x7ffff7fde000 rw-p     3000 0      
    0x7ffff7ff7000     0x7ffff7ffa000 r--p     3000 0      [vvar]
    0x7ffff7ffa000     0x7ffff7ffc000 r-xp     2000 0      [vdso]
    0x7ffff7ffc000     0x7ffff7ffd000 r--p     1000 25000  /lib/x86_64-linux-gnu/ld-2.23.so
    0x7ffff7ffd000     0x7ffff7ffe000 rw-p     1000 26000  /lib/x86_64-linux-gnu/ld-2.23.so
    0x7ffff7ffe000     0x7ffff7fff000 rw-p     1000 0      
    0x7ffffffde000     0x7ffffffff000 rw-p    21000 0      [stack]
0xffffffffff600000 0xffffffffff601000 r-xp     1000 0      [vsyscall]
```

这样可以知道基地址，再根据ida中的偏移算出真实地址。



### gdb view function address

```
(gdb) set print object on
(gdb) p function
```

