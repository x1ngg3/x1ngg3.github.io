---
title: Heap Related Data Structure
date: 2020-10-22
author: x1ngg3
description: "好难啊"
---

好难啊

<!-- more -->

### Arena, heap and chunk

Ptmalloc2通过几种数据结构来进行管理，主要有arena,heap,chunk三种层级。Chunk为分配给用户的内存的一个单位。 对于这一块内容如果感觉不是太懂，可以结合后面数据结构部分去看，其实arena和heap我感觉都是对chunk的一种组织方式，方便之后的分配，arena又是对heap的组织。

```
arena 对于32位系统，数量最多为核心数量2倍，64位则最多为核心数量8倍，可以用来保证多线程的堆空间分配的高效性。主要存储了较高层次的一些信息。有一个main_arena，是由主线程创建的，thread_arena则为各线程创建的，当arena满了之后就不再创建而是与其他arena共享一个arena，方法为依次给各个arena上锁（查看是否有其他线程正在使用该arena），如果上锁成功（没有其他线程正在使用），则使用该arena，之后一直使用这个arena，如果无法使用则阻塞等待。

heap heap的等级就比arena要低一些了，一个arena可以有多个heap，也是存储了堆相关的信息。

chunk chunk为分配给用户的内存的一个单位，每当我们分配一段内存的时候其实就是分配得到了一个chunk，我们就可以在chunk当中进行一定的操作了。不过为了进行动态分配，chunk本身也有一些数据（元数据），是用来指示其分配等等的数据。
```

我们这里给出分配的一个总体过程，使得有一个大致印象，根据后面的细节，如果有什么地方不太懂，可以参考这个过程。现在可能有一些名词还不是很明白，可以先阅读后文，再回来看这个过程。

```
Malloc: 根据线程的arena决定使用哪个arena的heap，然后根据大小确定使用哪种bin，然后在相应的bin中去寻找可以分配的合适的chunk，分配chunk之后将该chunk从相应的bin链表中移除。如果所有bin中都没有可以使用的chunk可以选择，则到top chunk当中取一段区域来使用，剩下的chunk作为remainder，也成为新的top chunk，如果top chunk不够了则使用系统调用来增加空间。Main_arena和thread_arena的系统调用方式不同，main_arena通过brk，这样可以直接在原来的基础上增加一块连续的区域，这样就只需要一个heap，而thread_arena通过mmap，如果要再进行申请就需要一个新的heap，一个新的heap结构，这些heap结构会组成一个链表。

Free: 根据需要释放的hunk的位置，查看其前后是否有空闲的chunk，如果有，合并。如果大小是fastbin范围，放入fastbin中，否则放入unsorted bin中。
```



### malloc_state

```c
struct malloc_state {
 mutex_t mutex;                 /* Serialize access. */
 int flags;                       /* Flags (formerly in max_fast). */
 #if THREAD_STATS
 /* Statistics for locking. Only used if THREAD_STATS is defined. */
 long stat_lock_direct, stat_lock_loop, stat_lock_wait;
 #endif
 mfastbinptr fastbins[NFASTBINS];    /* Fastbins */
 mchunkptr top;
 mchunkptr last_remainder;
 mchunkptr bins[NBINS * 2];
 unsigned int binmap[BINMAPSIZE];   /* Bitmap of bins */
 struct malloc_state *next;           /* Linked list */
 INTERNAL_SIZE_T system_mem;
 INTERNAL_SIZE_T max_system_mem;
 };
```

 malloc_state结构是我们最常用的结构，其中的重要字段如下：

```
fastbins：存储多个链表。每个链表由空闲的fastbin组成，是fastbin freelist。

top：top chunk，指向的是arena中剩下的空间。如果各种freelist都为空，则从top chunk开始分配堆块。

bins：存储多个双向链表。意义上和堆块头部的双向链表一样，并和其组成了一个双向环状空闲列表（freelist）。这里的bins位于freelist的结构上的头部，后向指针（bk）指向freelist逻辑上的第一个节点。分配chunk时从逻辑上的第一个节点分配寻找合适大小的堆块。
```

 一整个堆的结构大体如下：

![chunk_state](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/YlDZxVNahSoC4Gj.png)



### malloc_chunk

在程序的执行过程中，我们称由 malloc 申请的内存为 chunk 。当程序申请的 chunk 被 free 后，会被加入到相应的空闲管理列表中。

有意思的是，**无论一个 chunk 的大小如何，处于分配状态还是释放状态，它们都使用一个统一的结构**。

**虽然它们使用了同一个数据结构，但是根据是否被释放，它们的表现形式会有所不同。**



malloc_chunk结构如下：

```c
/*
  This struct declaration is misleading (but accurate and necessary).
  It declares a "view" into memory allowing access to necessary
  fields at known offsets from a given base. See explanation below.
*/
struct malloc_chunk {

  INTERNAL_SIZE_T      prev_size;  /* Size of previous chunk (if free).  */
  INTERNAL_SIZE_T      size;       /* Size in bytes, including overhead. */

  struct malloc_chunk* fd;         /* double links -- used only if free. */
  struct malloc_chunk* bk;

  /* Only used for large blocks: pointer to next larger size.  */
  struct malloc_chunk* fd_nextsize; /* double links -- used only if free. */
  struct malloc_chunk* bk_nextsize;
};
```



**每个字段的具体解释：**

- **prev_size**, 相邻的前一个堆块大小。这个字段只有在前一个堆块（且该堆块为normal chunk）处于释放状态时才有意义。这个字段最重要（甚至是唯一）的作用就是**用于堆块释放时快速和相邻的前一个空闲堆块融合**。该字段不计入当前堆块的大小计算。**如果该 chunk 的物理相邻的前一地址 chunk**（两个指针的地址差值为前一 chunk 大小）是空闲的话，那该字段记录的是前一个 chunk 的大小 (包括 chunk 头)。当前一个 chunk 在使用时，该字段可以用来存储物理相邻的前一个 chunk 的数据（可以作为前一个chunk的数据段，libc这么做的原因主要是可以节约4个字节的内存空间，但为了这点空间效率导致了很多安全问题。

- **size**，该 chunk 的大小，**大小必须是 2 * SIZE_SZ 的整数倍**。如果申请的内存大小不是 2 * SIZE_SZ 的整数倍，**会被转换**满足大小的最小的 2 * SIZE_SZ 的倍数。32 位系统中，SIZE_SZ 是 4；64 位系统中，SIZE_SZ 是 8。 **该字段的低三个比特位对 chunk 的大小没有影响（8字节对齐，固定为0），为了充分利用内存空间，对它们进行重用，从高到低分别表示：**
  
  ```
  - NON_MAIN_ARENA，记录当前 chunk 是否不属于主线程，1 表示不属于，0 表示属于。
  - IS_MAPPED，记录当前 chunk 是否是由 mmap 分配的。
  - PREV_INUSE，记录前一个 chunk 块是否被分配。一般来说，堆中第一个被分配的内存块的 size 字段的 P 位都会被设置为 1，以便于防止访问前面的非法内存。当一个 chunk 的 size 的 P 位为 0 时，我们能通过 prev_size 字段来获取上一个 chunk 的大小以及地址。这也方便进行空闲 chunk 之间的合并。
  ```
- **fd，bk**。 双向指针，用于组成一个双向空闲链表。故这两个字段只有在堆块free后才有意义。堆块在**alloc状态时，这两个字段内容是用户填充的数据**。chunk **空闲时，会被添加到对应的空闲管理链表中**。两个字段可以造成内存泄漏（libc的bss地址），Dw shoot等效果。其字段的含义如下

  - fd 指向下一个（非物理相邻）空闲的 chunk
  - bk 指向上一个（非物理相邻）空闲的 chunk
  - 通过 fd 和 bk 可以将空闲的 chunk 块加入到空闲的 chunk 块链表进行统一管理
  
- **fd_nextsize， bk_nextsize**，也是**只有 chunk 空闲的时候才使用**，不过其用于较大的 chunk（large chunk）。
  
  ```
  - fd_nextsize 指向前一个与当前 chunk 大小不同的第一个空闲块，不包含 bin 的头指针。
  - bk_nextsize 指向后一个与当前 chunk 大小不同的第一个空闲块，不包含 bin 的头指针。
  - 一般空闲的 large chunk 在 fd 的遍历顺序中，按照由大到小的顺序排列。这样做可以避免在寻找合适 chunk 时挨个遍历。
  ```
```
  
  

**下图是一个已经分配的chunk的结构**：

​```c
chunk-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
        |             Size of previous chunk, if unallocated (P clear)  |
        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
        |             Size of chunk, in bytes                     |A|M|P|
  mem-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
        |             User data starts here...                          .
        .                                                               .
        .             (malloc_usable_size() bytes)                      .
next    .                                                               |
chunk-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
        |             (size of chunk, but used for application data)    |
        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
        |             Size of next chunk, in bytes                |A|0|1|
        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```



**我们称前两个字段称为 chunk header (prev_size + size)，后面的部分称为 user data。每次 malloc 申请得到的内存指针，其实指向 user data 的起始处**。

当一个 chunk 处于使用状态时，它的下一个 chunk 的 prev_size 域无效，所以下一个 chunk 的该部分也可以被当前 chunk 使用。**这就是 chunk 中的空间复用**。如下图：

![chunk空间复用](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/IDC7POfl6GvzE5j.png)



**下图是 free 过后的 chunk 的结构**：（注意 fd 和 bk 出现在了数据段的开始）

```c
chunk-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
        |             Size of previous chunk, if unallocated (P clear)  |
        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
`head:' |             Size of chunk, in bytes                     |A|0|P|
  mem-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
        |             Forward pointer to next chunk in list             |
        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
        |             Back pointer to previous chunk in list            |
        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
        |             Unused space (may be 0 bytes long)                .
        .                                                               .
 next   .                                                               |
chunk-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
`foot:' |             Size of chunk, in bytes                           |
        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
        |             Size of next chunk, in bytes                |A|0|0|
        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

 可以发现，如果一个 chunk 处于 free 状态，那么会有两个位置记录其相应的大小

1. 本身的 size 字段会记录，
2. 它后面的 chunk 会记录（prev_size）。

**一般情况下**，物理相邻的两个空闲 chunk 会被合并为一个 chunk 。堆管理器会通过 prev_size 字段以及 size 字段合并两个物理相邻的空闲 chunk 块。



### Bins

用户释放掉的chunk不会马上归还给系统，ptmalloc会统一管理heap和mmap映射区域中的空闲chunk。当用户再次请求分配内存时，ptmalloc分配器会试图在空闲的chunk中挑选一块合适的给用户。这样做可以避免频繁的系统调用，降低内存分配的开销。

一个 bin 相当于一个 chunk 链表，我们把每个链表的头节点 chunk 作为 bins 数组，但是由于这个头节点作为 bin 表头，其 prev_size 与 size 字段是没有任何实际作用的，因此我们在存储头节点 chunk 的时候仅仅只需要存储头节点 chunk 的 fd 和 bk 即可，而其中的 prev_size 与 size 字段被重用为另一个 bin 的头节点的 fd 与 bk，这样可以节省空间，并提高可用性。因此**我们仅仅只需要 mchunkptr 类型的指针数组就足够存储这些头节点**，那 prev_size 与 size 字段到底是怎么重用的呢？这里我们以 32 位系统为例

| 含义     | bin1 的 fd/bin2 的 prev_size | bin1 的 bk/bin2 的 size | bin2 的 fd/bin3 的 prev_size | bin2 的 bk/bin3 的 size |
| :------- | :--------------------------- | :---------------------- | :--------------------------- | :---------------------- |
| bin 下标 | 0                            | 1                       | 2                            | 3                       |



可以看出除了第一个 bin（unsorted bin）外，后面的每个 bin 的表头 chunk 会重用前面的 bin 表头 chunk 的 fd 与 bk 字段，将其视为其自身的 prev_size 和 size 字段。这里也说明了一个问题，**bin 的下标和我们所说的第几个 bin 并不是一致的。同时，bin 表头的 chunk 头节点 的 prev_size 与 size 字段不能随便修改，因为这两个字段是其它 bin 表头 chunk 的 fd 和 bk 字段。**

根据 bin 链成员的大小不同，分为以下几类：fast bin, unsorted bin, small bin, large bin.

其中 fastbin 是单链表，其他都是双向链表。

不同的bin链是由arena管理的。因此一个线程中会有很多的bin链，这些bin链都有arena所表示的struct malloc_state结构体的以下成员保存：

```
fastbinY数组：大小为10。记录的是fast bin链
bins数组：大小为129。记录的是unsorted bin（1）、small bin（2~63）、large bin链（64~126）
Bin 1 – Unsorted bin
Bin 2 to Bin 63 – Small bin
Bin 64 to Bin 126 – Large bin
```



![bin_](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/SrZ4HK5msI9qxTz.png)



### Fast Bin

大多数程序经常会申请以及释放一些比较小的内存块。如果将一些较小的 chunk 释放之后发现存在与之相邻的空闲的 chunk 并将它们进行合并，那么当下一次再次申请相应大小的 chunk 时，就需要对 chunk 进行分割，这样就大大降低了堆的利用效率。**因为我们把大部分时间花在了合并、分割以及中间检查的过程中**。因此，ptmalloc 中专门设计了 fast bin，对应的变量就是 malloc state 中的 fastbinsY

**chunk的大小在32字节~128字节（0x20~0x80）的chunk称为“fast chunk”**（大小不是malloc时的大小，而是在内存中struct malloc_chunk的大小，包含前2个成员，鉴于设计fast bin的初衷就是进行快速的小内存分配和释放，因此**系统将属于fast bin的chunk的PREV_INUSE位总是设置为1**，这样即使当fast bin中有某个chunk同一个free chunk相邻的时候，系统也不会进行自动合并操作，而是保留两者。虽然这样做可能会造成额外的碎片化问题，但瑕不掩瑜。

为了更加高效地利用 fast bin，glibc 采用单向链表对其中的每个 bin 进行组织，并且**每个 bin 采取 LIFO 策略**，最近释放的 chunk 会更早地被分配，所以会更加适合于局部性。也就是说，**当用户需要的 chunk 的大小小于 fastbin 的最大大小时， ptmalloc 会首先判断 fastbin 中相应的 bin 中是否有对应大小的空闲块**，如果有的话，就会直接从这个 bin 中获取 chunk。如果没有的话，ptmalloc 才会做接下来的一系列操作。

```
fastbinsY数组存储fastbins的规则：
1.每个fast bin链表都是单链表（使用fd指针）。因此，fast bin中无论是添加还是移除fast chunk，都是对“链表尾”进行操作，而不会对某个中间的fast chunk进行操作

2.单个fastbin链表中的chunk大小都是相同的，各个fastbin链表中的chunk大小是不同的

3.fastbinY数组中的每个bin链表的排序，是按照链表元素的大小进行排序的。数组的第一个元素的fast bin链表中的每个chunk的大小是32字节的，数组的第二个元素的fast bin链表中的每个chunk的大小是48字节的......每个元素都比前面的fast bin链大16字节，以此类推进行排序
```

**概念图如下：**

![fastbin1](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/xbjR3ACUH9F1tQg.jpg)



**详细图示：**

![fastbin2](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/V4kc57rfqJEY1QG.png)



#### fd指示位置：

![fastbin3](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/z2alGCFJneIE47L.png)

#### Malloc操作与Fastbins的初始化：

##### malloc

当应用层通过malloc函数**第一次申请**的chunk属于16字节~80字节之间时，因为初始化的时候fast bin支持的最大内存大小以及所有fast bin链表都是空的，所以它也不会交由fast bin来处理，而是向下传递交由small bin来处理，如果small bin也为空的话就交给unsorted bin处理。

#####  初始化

```
当我们第一次调用malloc(fast bin)的时候，系统执行_int_malloc函数，该函数首先会发现当前fast bin为空，就转交给small bin处理，进而又发现small bin 也为空，就调用malloc_consolidate函数对malloc_state结构体进行初始化。malloc_consolidate函数主要完成以下几个功能：
a.首先判断当前malloc_state结构体中的fast bin是否为空，如果为空就说明整个malloc_state都没有完成初始化，需要对malloc_state进行初始化

b.malloc_state的初始化操作由函数malloc_init_state(av)完成，该函数先初始化除fast bin之外的所有的bins，再初始化fast bins
那么当再次执行malloc(fast chunk)函数的时候，此时fast bin相关数据不为空了，就可以使用fast bin
```

##### free

```
这个操作很简单，主要分为两步：先通过chunksize函数根据传入的地址指针获取该指针对应的chunk的大小；然后根据这个chunk大小获取该chunk所属的fast bin，然后再将此chunk添加到该fast bin的链尾即可。整个操作都是在_int_free函数中完成
```



### Small Bin

small bins 中每个 chunk 的大小与其所在的 bin 的 index 的关系为：chunk_size = 2 * SIZE_SZ *index，第一个small bin链中chunk的大小为32字节，后续每个small bin中chunk的大小依次增加两个机器字长（32位相差8字节，64位相差16字节）.......以此类推，跟fastbinsY数组存储fastbin链的原理是相同的（用下图表示）

| 下标 | SIZE_SZ=4（32 位） | SIZE_SZ=8（64 位） |
| :--- | :----------------- | :----------------- |
| 2    | 16                 | 32                 |
| 3    | 24                 | 48                 |
| 4    | 32                 | 64                 |
| 5    | 40                 | 80                 |
| x    | 2*4*x              | 2*8*x              |
| 63   | 504                | 1008               |

此外，**small bins 中每个 bin 对应的链表采用 FIFO 的规则**，所以同一个链表中先被释放的 chunk 会先被分配出去。

**或许，大家会很疑惑，那 fastbin 与 small bin 中 chunk 的大小会有很大一部分重合啊，那 small bin 中对应大小的 bin 是不是就没有什么作用啊？** 其实不然，fast bin 中的 chunk 是有可能被放到 small bin 中去的。

#### Malloc操作与small bin的初始化

##### malloc

类似于fast bins，最初所有的small bin都是空的，因此在对这些small bin完成初始化之前，即使用户请求的内存大小属于small chunk也不会交由small bin进行处理，而是交由unsorted bin处理。
如果unsorted bin也不能处理的话，glibc malloc就依次遍历后续的所有bins，找出第一个满足要求的bin，如果所有的bin都不满足的话，就转而使用top chunk，如果top chunk大小不够，那么就扩充top chunk，这样就一定能满足需求了。
注意遍历后续bins以及之后的操作同样被large bin所使用，因此，将这部分内容放到large bin的malloc操作中加以介绍。

##### 初始化

那么glibc malloc是如何初始化这些bins的呢？因为这些bin属于malloc_state结构体，所以在初始化malloc_state的时候就会对这些bin进行初始化，代码如下：

```c

static void
malloc_init_state (mstate av)
{
    int i;
    mbinptr bin;
    
    /* Establish circular links for normal bins */
    for (i = 1; i < NBINS; ++i)
    {
        bin = bin_at (av, i);
        bin->fd = bin->bk = bin;
    }
 
    ......
}
```

将bins数组中的第一个成员索引值设置为了1，而不是我们常用的0(在bin_at宏中，自动将i进行了减1处理)
从上面代码可以看出在初始化的时候glibc malloc将所有bin的指针都指向了自己——这就代表这些bin都是空的
过后，当再次调用malloc(small chunk)的时候，如果该chunk size对应的small bin不为空，就从该small bin链表中取得small chunk给malloc使用

##### free

small的free比较特殊。当释放small chunk的时候，先检查该chunk相邻的chunk是否为free，如果是的话就进行合并操作：将这些chunks合并成新的chunk，然后将它们从small bin中移除，最后将新的chunk添加到unsorted bin中，之后unsorted bin进行整理再添加到对应的bin链上。

### Large Bin

large bins 中一共包括 63 个 bin，**每个 bin 中的 chunk 的大小不一致，而是处于一定区间范围内**。此外，这 63 个 bin 被分成了 6 组，使用fd_nextsize、bk_nextsize连接起来的，每组 bin 中的 chunk 大小之间的公差一致，具体如下：

| 组   | 数量 | 公差    |
| :--- | :--- | :------ |
| 1    | 32   | 64B     |
| 2    | 16   | 512B    |
| 3    | 8    | 4096B   |
| 4    | 4    | 32768B  |
| 5    | 2    | 262144B |
| 6    | 1    | 不限制  |

**在同一个largebin中**，每个chunk的大小不一定相同，因此为了加快内存分配和释放的速度，就将同一个largebin中的所有chunk按照chunksize进行从大到小的排列：**最大的chunk放在一个链表的front end，最小的chunk放在rear end；相同大小的chunk按照最近使用顺序排序**

![largebin](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/eBSlwh9RGizVYNr.png)

#### Malloc操作与large bin的初始化

##### 初始化

初始化完成之前的操作类似于small bin
下面讨论large bins初始化完成之后的操作：

首先确定用户请求的大小属于哪一个large bin，然后判断该large bin中最大的chunk的size是否大于用户请求的size(只需要对比链表中front end的size即可)。如果大于，就从rear end开始遍历该large bin，找到第一个size相等或接近的chunk，分配给用户。如果该chunk大于用户请求的size的话，就将该chunk拆分为两个chunk：前者返回给用户，且size等同于用户请求的size；剩余的部分做为一个新的chunk添加到unsorted bin中
如果该large bin中最大的chunk的size小于用户请求的size的话，那么就依次查看后续的large bin中是否有满足需求的chunk，不过需要注意的是鉴于bin的个数较多(不同bin中的chunk极有可能在不同的内存页中)，如果按照上一段中介绍的方法进行遍历的话(即遍历每个bin中的chunk)，就可能会发生多次内存页中断操作，进而严重影响检索速度，所以glibc malloc设计了Binmap结构体来帮助提高bin-by-bin检索的速度。Binmap记录了各个bin中是否为空，通过bitmap可以避免检索一些空的bin。如果通过binmap找到了下一个非空的large bin的话，就按照上一段中的方法分配chunk，否则就使用top chunk来分配合适的内存。

##### free

类似small chunk



### Unsorted Bin

unsorted bin 可以视为空闲 chunk 回归其所属 bin 之前的缓冲区。unsorted bin 处于我们之前所说的 bin 数组下标 1 处。故而 unsorted bin 只有一个链表。unsorted bin 中的空闲 chunk 处于乱序状态，主要有两个来源:

```
1.当一个较大的 chunk 被分割成两半后，如果剩下的部分大于 MINSIZE，就会被放到 unsorted bin 中。
2.释放一个不属于 fast bin 的 chunk，并且该 chunk 不和 top chunk 紧邻时，该 chunk 会被首先放到 unsorted bin 中。
```

在unsorted bin中，对chunk的大小并没有限制，任何大小的chunk都可以归属到unsorted bin中。此外，Unsorted Bin 在使用的过程中，采用的遍历顺序是 FIFO 。	



### Top Chunk

程序第一次进行 malloc 的时候，heap 会被分为两块，一块给用户，剩下的那块就是 top chunk。其实，所谓的 top chunk 就是处于当前堆的物理地址最高的 chunk。这个 chunk 不属于任何一个 bin，它的作用在于当所有的 bin 都无法满足用户请求的大小时，如果其大小不小于指定的大小，就进行分配，并将剩下的部分作为新的 top chunk。否则，就对 heap 进行扩展后再进行分配。在 main arena 中通过 sbrk 扩展 heap，而在 thread arena 中通过 mmap 分配新的 heap。

需要注意的是，top chunk 的 prev_inuse 比特位始终为 1，否则其前面的 chunk 就会被合并到 top chunk 中。

**初始情况下，我们可以将 unsorted chunk 作为 top chunk。**



### last remainder

在用户使用 malloc 请求分配内存时，ptmalloc2 找到的 chunk 可能并不和申请的内存大小一致，这时候就将分割之后的剩余部分称之为 last remainder chunk ，unsort bin 也会存这一块。top chunk 分割剩下的部分不会作为 last remainder。



### 从一个linux堆分配例子中理解4种bins（复制的大佬的）

fast bin保存的chunk大小是16-80字节，unsorted bin 保存其他被free掉但不满足fast bin中的chunk，small bin保存的chunk大小是小于512字节，大于等于512字节的chunk保存到large bin中。（注意：这里的各种bin保存的是已经被free函数释放的内存，而不是已分配的内存，不要搞混了。）

那么从上面可以发现， fast bin中chunk的字节大小是small bin的子集，存在重叠，那什么时候chunk会保存到small bin呢？另一个问题就是，chunk被释放后，首先是保存在fast bin或者unsorted bin中的，那么什么时候会保存到large bin中呢？既然释放的chunk首先不会跑到small和large bin中，那么我们可以大胆猜想，在分配内存的时候，chunk可能会移动到这个2个bin中，也就是说，当unsorted bin被遍历时，其中的chunk就会相应地被放到small bin和large bin中。

这样猜想是有根据的，unsorted bin是链表结构，free掉的chunk会被插入到链表最后，这时候遍历不划算。而malloc的时候需要遍历unsorted bin中的chunk，找到合适的chunk，这时再将其他不满足的chunk保存到small bin和large bin中也是顺便的事情，所以从unsorted bin命名也可看成，这是一个未排序的bin，需要排序就需要遍历，遍历后的chunk就直接分类了。

具体分析可以看freebuf的2篇文章，文章详细描述了为什么linux内存管理是这样设计：

[Linux堆内存管理深入分析（上）](https://www.freebuf.com/articles/system/104144.html)
[Linux堆内存管理深入分析（下）](https://www.freebuf.com/articles/security-management/105285.html)

为验证上面的猜想，我们可以查看linux的源码，也可以做个小实验验证一下，我这里主要还是动态分析为主。

先来看一下实验的代码（经过多次测试并优化）：

```c
#include<stdio.h>

void ()
{
    void *a,*b,*c,*d,*e = NULL;

  
    a = malloc(0x500);
    b = malloc(0x100);        // 防止a，c释放后合并
    c = malloc(0x500);
    d = malloc(0x100);        // 防止c 释放后与top_chunk合并
 
  // 第 2 步
    free(a);    // 执行后unsorted bin有1个0x500的块
    free(c);    // 执行后unsorted bin有2个0x500的块
  
  // 第 3 步
    c = malloc(0x400);  // 从unsorted bin中分配，还剩下0x100的块2放到unsorted bin中，另一个0x500的块1放到了large bin中
    a = malloc(0x400);  // 从large bin中分配，还剩下0x100的块1放到unsorted bin中，原来0x100的块2放到small bin

  // 第 4 步   
    e = malloc(0x500);  // 从top_chunk分配，unsorted bin中的块1也放到small bin中

  // 第 5 步
    free(a);
    free(b);
    free(c);
    free(d);
    free(e);
}
```

接着用gcc编译生成程序，并使用安装了pwngdb插件的gdb来调试程序。

本来打算截取pwndbg输出的堆状态来说明，但是发现不够清晰，而且每个chunk还有头大小，导致不能够很好说明，所以我自己画了一个简化的堆状态图来说明。图中没有画出来的bin，默认都为空。其中，初始化堆图如下：

![1](https://i.loli.net/2020/11/18/7OJs1haf3MuQb9C.png)

首先程序运行完第一步，分配了abcd 4个内存块，其中b和d是为了防止a和c 释放后发生合并，此时简化的堆如下：

![2](https://i.loli.net/2020/11/18/GunJ1SmW2Vk8YN7.png)

第二步，程序释放了a和c的内存，此时的a和c对应的chunk保存到unsorted bin中，简化的堆如下：

![3](https://i.loli.net/2020/11/18/TSUMrF2sApHWqeh.png)

第三步，第1句，申请分配0x400大小的内存赋值给c，这时系统首先会遍历unsorted bin，发现块2的chunk大小是0x500，满足申请，返回0x400大小，剩下的0x100放回到unsorted bin中，并对其他chunk进行排序，这时的另一个0x500块1会被放到large bin中。简化的堆如下：

![4](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/JhboOCVqZMQPX4t.png)

第2句，申请0x400大小的内存赋值给a，此时系统还是遍历unsorted bin，发现没有满足的chunk，然后把其中0x100的chunk块2放到small bin中。接着搜索large bin，发现了一个0x500的chunk块1满足要求，返回0x400大小，剩下的0x100的chunk块1保存到unsorted bin中。简化的堆如下：

![5](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/dy51icUxJBNsPf4.png)

第四步：申请0x500大小的内存赋值给e，此时unsorted bin还是没有满足的chunk，而且0x100的chunk块1会被放到small bin中。接着large bin中也没有合适的chunk。最后系统从top chunk中分配内存。简化的堆如下：

![6](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/1HbPkvJeX4EZAgj.png)

第五步：释放所有内存，状态回到一开始：

![7](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/IBicylsAKXSGaEW.png)

上面的小实验解决了前面提到的2个问题：fast bin和small bin回收chunk的途径不一样，所以大小重叠也是正常，实验同时也说明了在申请内存的时候，unsorted bin被会遍历，这时就有可能会将满足条件的chunk移动到small bin和large bin中。

当然，上面只是一个很简单的场景，更详细的内容可以阅读linux源码和其他分析文章。

### 参考博客

[CTF-WIKI_堆相关数据结构](https://ctf-wiki.github.io/ctf-wiki/pwn/linux/glibc-heap/heap_structure-zh/#_1)

[堆漏洞挖掘:04---bins分类（fastbin、unsorted bin、small bin、large bin）](https://blog.csdn.net/qq_41453285/article/details/96865321)

[堆漏洞挖掘:10---bins的单向链表、双向链表存储结构](https://blog.csdn.net/qq_41453285/article/details/97613588)

[Libc堆管理机制及漏洞利用技术 (一）](https://blog.csdn.net/sdulibh/article/details/50443160)

[linux 堆溢出学习之malloc堆管理机制原理详解](https://blog.csdn.net/qq_29343201/article/details/59614863)

[从一个linux堆分配例子中理解4种bins(fast、unsorted、small和large bin)](https://www.dazhuanlan.com/2020/02/03/5e371c376b781/)