---
title: 2020ctf
date: 2020-7-30
author: x1ngg3
description: "比赛中的几个题。"
category: NOTHING
tags:
- re
- ctf
---

比赛中的几个题。

<!-- more -->

## 网鼎杯2020

### signal

***

其他的没啥说的，摸透逻辑了就知道怎么做了，但是感觉这个题能写脚本我觉得完全是个意外，如果控制位和数据位太多一样的那结果就有点多了，写脚本难度感觉要猛增。

直接看关键函数逻辑吧。

```c
int __cdecl vm_operad(int *given, int num)
{
  int result; // eax
  char input[100]; // [esp+13h] [ebp-E5h]
  char unk[100]; // [esp+77h] [ebp-81h]
  char res; // [esp+DBh] [ebp-1Dh]
  int change; // [esp+DCh] [ebp-1Ch]
  int unk_num; // [esp+E0h] [ebp-18h]
  int v8; // [esp+E4h] [ebp-14h]
  int cmp; // [esp+E8h] [ebp-10h]
  int n; // [esp+ECh] [ebp-Ch]

  n = 0;
  cmp = 0;
  v8 = 0;
  unk_num = 0;
  change = 0;
  while ( 1 )
  {
    result = n;
    if ( n >= num )
      return result;
    switch ( given[n] )
    {
      case 1:
        unk[unk_num] = res;                     // 修改Unk_num，写脚本的关键参照，为一轮变换标志
        ++n;
        ++unk_num;
        ++cmp;
        break;
      case 2:
        res = given[n + 1] + input[cmp];        // 暂存,n+1为数据位
        n += 2;
        break;
      case 3:
        res = input[cmp] - LOBYTE(given[n + 1]);// 暂存，n+1为数据位
        n += 2;
        break;
      case 4:
        res = given[n + 1] ^ input[cmp];        // 暂存，n+1为数据位
        n += 2;
        break;
      case 5:
        res = given[n + 1] * input[cmp];        // 暂存，n+1为数据位
        n += 2;
        break;
      case 6:
        ++n;                                    // 单走一个++n
        break;
      case 7:
        if ( unk[v8] != given[n + 1] )          // 字符匹配
        {
          printf("what a shame...");
          exit(0);
        }
        ++v8;
        n += 2;
        break;
      case 8:
        input[change] = res;                    // 写脚本的关键参照，修改input，所以上一步必定涉及到res修改，判断上一步是
                                                // case 2，3，4，5类型的
                                                // 还是case 11,12类型的，因为case2，3，4，5的类型需要
                                                // 用到参数，得判定
        ++n;
        ++change;
        break;
      case 10:
        read(input);                            // 输入长度15的字符串
        ++n;
        break;
      case 11:
        res = input[cmp] - 1;                   // 暂存修改
        ++n;
        break;
      case 12:
        res = input[cmp] + 1;                   // 暂存修改
        ++n;
        break;
      default:
        continue;
    }
  }
}
```

这里可以看到case 3的时候出现了**LOBYTE(given[n + 1])**，测试一下。

```c++
#include<iostream>
#include<bits/stdc++.h>
#include <Windows.h>  
using namespace std;
int main()
{
	int i = 12345678; //0xbc614e
	cout<<"0xbc614e"<<endl;
	WORD bh = HIBYTE(i);    
    WORD bl = LOBYTE(i);
    std::cout << std::hex << "ih: " << bh << std::endl;  //61
    std::cout << std::hex << "il: " << bl << std::endl;	 //4e
    int j = 191; //0xbf
    cout<<"0xbf"<<endl;
    bh = HIBYTE(j);    
    bl = LOBYTE(j);
    std::cout << std::hex << "jh: " << bh << std::endl;  //0
    std::cout << std::hex << "jl: " << bl << std::endl;  //bf
}
```

OK上脚本，其实除了对于case 1的判断，其他的有点多余了，因为并没有出现特列。

```python
g = [10,4,16,8,3,5,1,4,32,8,5,3,1,3,2,8,11,1,12,8,4,4,1,5,3,8,
3,33,1,11,8,11,1,4,9,8,3,32,1,2,81,8,4,36,1,12,8,11,1,5,2,8,2,
37,1,2,54,8,4,65,1,2,32,8,5,1,1,5,3,8,2,37,1,4,9,8,3,32,1,2,65,
8,12,1]
g.reverse()
unk = [34,63,52,50,114,51,24,167,49,241,40,132,193,30,122]
unk.reverse()
inputchr = 0
unknum = 0
flag = []
res = 0
for i in range(0,len(g)):
	if(g[i] == 10):
		flag.append(inputchr)
	if(g[i] == 1 and g[i - 1] != 1):
		res = unk[unknum]
		unknum += 1
		flag.append(inputchr)
	if(g[i] == 2 and g[i + 1] != 2 and g[i + 1] != 3  and g[i + 1] != 4 and g[i + 1] != 5):
		inputchr = res - g[i - 1]
	if(g[i] == 3 and g[i + 1] != 2 and g[i + 1] != 3  and g[i + 1] != 4 and g[i + 1] != 5):
		inputchr = res + g[i - 1]
	if(g[i] == 4 and g[i + 1] != 2 and g[i + 1] != 3  and g[i + 1] != 4 and g[i + 1] != 5):
		inputchr = res ^ g[i - 1]
	if(g[i] == 5 and g[i + 1] != 2 and g[i + 1] != 3  and g[i + 1] != 4 and g[i + 1] != 5):
		inputchr = int(res / g[i - 1])
	if(g[i] == 8):
		res = inputchr
	if(g[i] == 11 and g[i + 1] != 2 and g[i + 1] != 3  and g[i + 1] != 4 and g[i + 1] != 5):
		inputchr = res + 1
	if(g[i] == 12 and g[i + 1] != 2 and g[i + 1] != 3  and g[i + 1] != 4 and g[i + 1] != 5):
		inputchr = res - 1
flag.reverse()
f = ''
for i in flag:
	f += chr(i)
print(f)
```

> 这里额外插一嘴，写脚本的时候，对于**unknum += 1**这句，我最开始写的是 **++unknum**，然后一直不对，后来查了一下，python解释器会把++a/--a解释成 +(+a)/-(-a) 所以相当于没变

## SCTF2020

### get_up

***

看题目就知道是个签到题了，俗话说的好啊，一杯茶，一包烟，一道签到签一天。

一顿瞎β操作后拖进IDA，找到主函数

```c++
int __cdecl main(int argc, const char **argv, const char **envp)
{
  sub_402700();                                 // 主要函数
  ((void (*)(void))dword_405000[0])();          // 指向.reioc段
  return 0;
}
```

继续跟进sub_4027000()

```c++
int sub_402700()
{
  char *v0; // ST14_4
  HMODULE lpAddress; // ST18_4
  DWORD flOldProtect; // [esp+Ch] [ebp-14h]
  char Dst; // [esp+10h] [ebp-10h]

  printf("you should give me a word:");
  memset(&Dst, 0, 0xAu);
  scanf_s("%s", &Dst, 10);                      // 读取输入
  if ( strlen(&Dst) > 6 || !dec_md5(&Dst) )     // 输入<=6且函数返回1
  {
    sub_401080(std::cout, "try again");
    exit(0);
  }
  v0 = sub_402B00(".reioc");
  lpAddress = GetModuleHandleW(0) + (*((_DWORD *)v0 + 3) >> 2);
  VirtualProtect(lpAddress, *((_DWORD *)v0 + 4), 0x40u, &flOldProtect);
  return sub_402610((int)lpAddress, &Dst);      // 这几行应该大概就是得到.reioc段的起始地址然后和输入一起送入sub_402610()
}
```

注意到if语句有个对输入的操作函数dec_md5（手动改的名字），可以看到一些熟悉的操作，轮次，右移32位，加密后32位长度，那我说这是个md5应该没人反对，在线破解出输入为**“sycsyc”**。

```c++
  Size = strlen(Str);
  for ( i = 0; i < 1000000; ++i )
    sub_402C90(Str, Size, (int)v9);
  memset(&Dst, 0, 0x28u);
  sub_4015C0("0123456789abcdef");
  v10 = 0;
  for ( j = 0; j < 16; ++j )
  {
    *(&Dst + 2 * j) = *(_BYTE *)sub_4019A0(&v5, (signed int)v9[j] >> 4);
    v8[2 * j] = *(_BYTE *)sub_4019A0(&v5, v9[j] % 16);
  }
  printf("\n");
  strcpy(&Str2, "32c1d123c193aecc4280a5d7925a2504");

```

下面进入sub_402610()，发现是个不复杂的异或操作

```c++
void __cdecl sub_402610(int a1, char *Str)
{
  char v2; // bl
  signed int i; // [esp+8h] [ebp-4h]

  for ( i = 0; i < 16; ++i )
  {
    v2 = *(_BYTE *)(i + a1);
    *(_BYTE *)(i + a1) = Str[i % strlen(Str)] ^ v2;
  }
}
```

那下面运用idapython来对其进行处理，代码如下，完成之后选中.reioc段数据，按u取消数据类型定义，再按p使其转成代码。

```python
dst = 0x405000
a = 'sycsyc'
for i in range(16):
    PatchByte(dst + i, Byte(dst + i)^ ord(a[i % 6]))
```

转化完成后：

![Snipaste_2020-08-08_12-08-14](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/lgpuZbrfWj25t8m.png)

再f5就可以直接反编译了，主要函数如下：

```c++
void sub_4027F0()
{
  char *v0; // ST18_4
  HMODULE lpAddress; // ST1C_4
  signed int i; // [esp+10h] [ebp-40h]
  DWORD flOldProtect; // [esp+14h] [ebp-3Ch]
  char Dst[40]; // [esp+18h] [ebp-38h]
  char Str[12]; // [esp+40h] [ebp-10h]

  memset(Dst, 0, 0x28u);
  memset(Str, 0, 0xAu);
  scanf_s("%s", Dst, 40);                       // 输入
  if ( strlen(Dst) != 30 )                      // 输入长度为30
  {
    sub_401080(std::cout, "try again");
    exit(0);
  }
  for ( i = 0; i < 5; ++i )                     // 读取输入前五位，官方格式是"SCTF{"
    Str[i] = Dst[i];
  v0 = sub_402B00(".ebata");
  lpAddress = GetModuleHandleW(0) + (*((_DWORD *)v0 + 3) >> 2);
  VirtualProtect(lpAddress, *((_DWORD *)v0 + 4), 0x40u, &flOldProtect);
  sub_4025B0((int)lpAddress, Str);              // 对.ebata段异或
  sub_404000();
}
```

再次用到idapython

```python
dst = 0x404000
a = 'SCTF{'
for i in range(16,96):
    PatchByte(dst + i, Byte(dst + i)^ ord(a[i % 5]))
```

这里就遇到一个大坑了，转化前是这样的：

![image-20200808121647213](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/LYNbVndscFyljwx.png)

转化后是这样的：

![image-20200808121710831](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/NlJijHFh21Wr3an.png)

因为可以看到在我们进行U和P之前，这里已经存在了一段汇编代码，然后我们进行异或的起点又是第16位，然后我就想当然觉得只要把后面的数据进行U和P就可以了，然后再解决sp analysis failed的错误就行，但是这样反汇编出来的代码特别特别难看，数据定义识别不准确，偏偏网上其他大佬的题解还都说是要分析sp analysis failed的，我真是信了他妈的邪了。

这里我们直接选中全部.ebata段，取消定义然后再转成代码就可以。转化完成后：

![image-20200808122420788](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/jk5yqT48ielsGmZ.png)

直接f5，舒服

```c++
int __cdecl sub_404000(char *Str)
{
  size_t v1; // eax
  int v3[300]; // [esp+0h] [ebp-9ACh]
  int v4; // [esp+4B0h] [ebp-4FCh]
  int v5; // [esp+4B4h] [ebp-4F8h]
  size_t i; // [esp+4B8h] [ebp-4F4h]
  unsigned int j; // [esp+4BCh] [ebp-4F0h]
  int k; // [esp+4C0h] [ebp-4ECh]
  int v9[300]; // [esp+4C4h] [ebp-4E8h]
  char Dst[40]; // [esp+974h] [ebp-38h]
  char v11; // [esp+99Ch] [ebp-10h]
  char v12; // [esp+99Dh] [ebp-Fh]
  char v13; // [esp+99Eh] [ebp-Eh]
  char v14; // [esp+99Fh] [ebp-Dh]
  char v15; // [esp+9A0h] [ebp-Ch]
  char v16; // [esp+9A1h] [ebp-Bh]
  char v17; // [esp+9A2h] [ebp-Ah]
  char v18; // [esp+9A3h] [ebp-9h]
  char v19; // [esp+9A4h] [ebp-8h]

  v11 = 115;
  v12 = 121;
  v13 = 99;
  v14 = 108;
  v15 = 111;
  v16 = 118;
  v17 = 101;
  v18 = 114;
  v19 = 0;
  memset(Dst, 0, 0x28u);
  for ( i = 0; i < strlen(Str); ++i )
    Dst[i] = Str[i];
  for ( j = 0; (signed int)j < 256; ++j )
  {
    v9[j] = j;
    v1 = strlen(&v11);
    v3[j] = *(&v11 + j % v1);
  }
  v5 = 0;
  for ( k = 0; k < 256; ++k )
  {
    v5 = (v3[k] + v9[k] + v5) % 256;
    v4 = v9[k];
    v9[k] = v9[v5];
    v9[v5] = v4;
  }
  return sub_401A70((int)v9, Dst);
}
```

然后再就是一些代码分析了，可以爆破出flag来，直接上最后的脚本:

```python
#include<bits/stdc++.h>
using namespace std;
int dec_1(int *a, char * str)
{
    int v5[30] = {0};
    int v12[] = {128,85,126,45,209,9,37,171,60,86,149,196,54,19,237,114,36,147,178,200,69,236,22,107,103,29,249,163,150,217};
    for(int i = 0;i<strlen(str);i++)
    {
        v5[i] = str[i];
    }
    int v11 = 0;
    int v10 = 0;
    int v6;
    for(int i = 0;i< strlen(str);++i)
    {
        v11 = (v11 + 1) % 256;
        v10 = (a[v11] + v10) % 256;
        a[v11] = a[v10] & ~a[v11] | a[v11] & ~a[v10];
        a[v10] = a[v10] & ~a[v11] | a[v11] & ~a[v10];
        a[v11] = a[v10] & ~a[v11] | a[v11] & ~a[v10];
        v6 = (a[v10] + a[v11]) % 256;
        v5[i] ^= a[v6];
    }
    for(int i = 0;i < 30;i++)
    {
        if(v5[i] != v12[i])
            return i;
    }
    return 0;
}

int dec_2(char *str)
{
    int a[300] = {0};
    int b[300] = {0};
    char dst[40] = {0};
    size_t v1;
    memset(dst, 0, 0x28u);
    char c[] = "syclover";
    for(int i =0;i < strlen(str);++i)
    {
        dst[i] = str[i];
    }
    for(int i = 0;i < 256;++i)
    {
        a[i] = i;
        v1 = strlen(c);
        b[i] = c[i % v1];
    }
    int d = 0;
    for(int i = 0; i < 256; ++i)
    {
        d = (b[i] + a[i] + d) % 256;
        int e = a[i];
        a[i] = a[d];
        a[d] = e;
    }
    return dec_1(a,dst);
}

int main()
{
    char flag[] = "SCTF{!!!!!!!!!!!!!!!!!!!!!!!!}";
    for(int j = 5;dec_2(flag);)
    {
        if(dec_2(flag) == j)
            flag[j]++;
        else
            j++;
    }
    cout<< flag <<endl;
    return 0;
}
```

SCTF{zzz~(|3[___]_rc4_5o_e4sy}



### signin

***

好的废话 不多说我们直接拖IDA，然后就看到顶部的红色警告，这一度让我怀疑程序是不是加壳了，然后一查才知道是pyhton打包过的，那说是加壳也不过分。

这类文件的特点就是，前面和后面多个“_”，如下图

![image-20200809214541754](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/VjGyDQz4t18K9np.png)

那现在开始反编译，以下两种方法都可以

#### archive_viewer.py

***

使用archive_viewer.py反编译文件，另外pyc文件有个magic head，然后pyinstaller生成exe的时候会把Pyc的magic部分去掉，所以反编译之后需要补齐，一个小技巧是可以从struct文件的前16个字节获取。

> python archive_viewer.py signin.exe
>
> 1. U: go Up one level
> 2. O <name>: open embedded archive name
> 3. X <name>: extract name
> 4. Q: quit

![image-20200809215523719](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/qr9Cje2xmkJhSsM.png)

![image-20200809215931329](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/9IsyrBfCwLbFue8.png)

![image-20200809215946809](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/Y1ishedq6EGTIxv.png)

![image-20200809220037551](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/5tFbCH1uGaOIpLS.png)

```python
#-----------------------------------------------------------------------------
# Copyright (c) 2013-2020, PyInstaller Development Team.
#
# Distributed under the terms of the GNU General Public License (version 2
# or later) with exception for distributing the bootloader.
#
# The full license is in the file COPYING.txt, distributed with this software.
#
# SPDX-License-Identifier: (GPL-2.0-or-later WITH Bootloader-exception)
#-----------------------------------------------------------------------------


"""
Viewer for archives packaged by archive.py
"""

import argparse
import os
import pprint
import sys
import tempfile
import zlib

from PyInstaller.loader import pyimod02_archive
from PyInstaller.archive.readers import CArchiveReader, NotAnArchiveError
from PyInstaller.compat import stdin_input
import PyInstaller.log

stack = []
cleanup = []


def main(name, brief, debug, rec_debug, **unused_options):

    global stack

    if not os.path.isfile(name):
        print(name, "is an invalid file name!", file=sys.stderr)
        return 1

    arch = get_archive(name)
    stack.append((name, arch))
    if debug or brief:
        show_log(arch, rec_debug, brief)
        raise SystemExit(0)
    else:
        show(name, arch)

    while 1:
        try:
            toks = stdin_input('? ').split(None, 1)
        except EOFError:
            # Ctrl-D
            print(file=sys.stderr)  # Clear line.
            break
        if not toks:
            usage()
            continue
        if len(toks) == 1:
            cmd = toks[0]
            arg = ''
        else:
            cmd, arg = toks
        cmd = cmd.upper()
        if cmd == 'U':
            if len(stack) > 1:
                arch = stack[-1][1]
                arch.lib.close()
                del stack[-1]
            name, arch = stack[-1]
            show(name, arch)
        elif cmd == 'O':
            if not arg:
                arg = stdin_input('open name? ')
            arg = arg.strip()
            try:
                arch = get_archive(arg)
            except NotAnArchiveError as e:
                print(e, file=sys.stderr)
                continue
            if arch is None:
                print(arg, "not found", file=sys.stderr)
                continue
            stack.append((arg, arch))
            show(arg, arch)
        elif cmd == 'X':
            if not arg:
                arg = stdin_input('extract name? ')
            arg = arg.strip()
            data = get_data(arg, arch)
            if data is None:
                print("Not found", file=sys.stderr)
                continue
            filename = stdin_input('to filename? ')
            if not filename:
                print(repr(data))
            else:
                with open(filename, 'wb') as fp:
                    fp.write(data)
        elif cmd == 'Q':
            break
        else:
            usage()
    do_cleanup()


def do_cleanup():
    global stack, cleanup
    for (name, arch) in stack:
        arch.lib.close()
    stack = []
    for filename in cleanup:
        try:
            os.remove(filename)
        except Exception as e:
            print("couldn't delete", filename, e.args, file=sys.stderr)
    cleanup = []


def usage():
    print("U: go Up one level", file=sys.stderr)
    print("O <name>: open embedded archive name", file=sys.stderr)
    print("X <name>: extract name", file=sys.stderr)
    print("Q: quit", file=sys.stderr)


def get_archive(name):
    if not stack:
        if name[-4:].lower() == '.pyz':
            return ZlibArchive(name)
        return CArchiveReader(name)
    parent = stack[-1][1]
    try:
        return parent.openEmbedded(name)
    except KeyError:
        return None
    except (ValueError, RuntimeError):
        ndx = parent.toc.find(name)
        dpos, dlen, ulen, flag, typcd, name = parent.toc[ndx]
        x, data = parent.extract(ndx)
        tempfilename = tempfile.mktemp()
        cleanup.append(tempfilename)
        with open(tempfilename, 'wb') as fp:
            fp.write(data)
        if typcd == 'z':
            return ZlibArchive(tempfilename)
        else:
            return CArchiveReader(tempfilename)


def get_data(name, arch):
    if isinstance(arch.toc, dict):
        (ispkg, pos, length) = arch.toc.get(name, (0, None, 0))
        if pos is None:
            return None
        with arch.lib:
            arch.lib.seek(arch.start + pos)
            return zlib.decompress(arch.lib.read(length))
    ndx = arch.toc.find(name)
    dpos, dlen, ulen, flag, typcd, name = arch.toc[ndx]
    x, data = arch.extract(ndx)
    return data


def show(name, arch):
    if isinstance(arch.toc, dict):
        print(" Name: (ispkg, pos, len)")
        toc = arch.toc
    else:
        print(" pos, length, uncompressed, iscompressed, type, name")
        toc = arch.toc.data
    pprint.pprint(toc)


def get_content(arch, recursive, brief, output):
    if isinstance(arch.toc, dict):
        toc = arch.toc
        if brief:
            for name, _ in toc.items():
                output.append(name)
        else:
            output.append(toc)
    else:
        toc = arch.toc.data
        for el in toc:
            if brief:
                output.append(el[5])
            else:
                output.append(el)
            if recursive:
                if el[4] in ('z', 'a'):
                    get_content(get_archive(el[5]), recursive, brief, output)
                    stack.pop()


def show_log(arch, recursive, brief):
    output = []
    get_content(arch, recursive, brief, output)
    # first print all TOCs
    for out in output:
        if isinstance(out, dict):
            pprint.pprint(out)
    # then print the other entries
    pprint.pprint([out for out in output if not isinstance(out, dict)])


def get_archive_content(filename):
    """
    Get a list of the (recursive) content of archive `filename`.
    This function is primary meant to be used by runtests.
    """
    archive = get_archive(filename)
    stack.append((filename, archive))
    output = []
    get_content(archive, recursive=True, brief=True, output=output)
    do_cleanup()
    return output


class ZlibArchive(pyimod02_archive.ZlibArchiveReader):

    def checkmagic(self):
        """ Overridable.
            Check to see if the file object self.lib actually has a file
            we understand.
        """
        self.lib.seek(self.start)  # default - magic is at start of file.
        if self.lib.read(len(self.MAGIC)) != self.MAGIC:
            raise RuntimeError("%s is not a valid %s archive file"
                               % (self.path, self.__class__.__name__))
        if self.lib.read(len(self.pymagic)) != self.pymagic:
            print("Warning: pyz is from a different Python version",
                  file=sys.stderr)
        self.lib.read(4)


def run():
    parser = argparse.ArgumentParser()
    parser.add_argument('-l', '--log',
                        default=False,
                        action='store_true',
                        dest='debug',
                        help='Print an archive log (default: %(default)s)')
    parser.add_argument('-r', '--recursive',
                        default=False,
                        action='store_true',
                        dest='rec_debug',
                        help='Recursively print an archive log (default: %(default)s). '
                        'Can be combined with -r')
    parser.add_argument('-b', '--brief',
                        default=False,
                        action='store_true',
                        dest='brief',
                        help='Print only file name. (default: %(default)s). '
                        'Can be combined with -r')
    PyInstaller.log.__add_options(parser)
    parser.add_argument('name', metavar='pyi_archive',
                        help="pyinstaller archive to show content of")

    args = parser.parse_args()
    PyInstaller.log.__process_options(parser, args)

    try:
        raise SystemExit(main(**vars(args)))
    except KeyboardInterrupt:
        raise SystemExit("Aborted by user request.")

if __name__ == '__main__':
    run()
```



#### pyinstxtractor.py

***

> python pyinstxtractor.py signin.exe

打包后回生成个文件夹，里面的main和struct文件就是我们要的

推荐是用这个的，用这个可以看到版本信息等其他信息，很方便。

![image-20200809220835060](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/pBwIO4hEcumyg6Z.png)

比如说本题中uncompyle6就得用pyhton3.8的环境

```python
#!/usr/bin/python

"""
PyInstaller Extractor v1.8 (Supports pyinstaller 3.2, 3.1, 3.0, 2.1, 2.0)
Author : Extreme Coders
E-mail : extremecoders(at)hotmail(dot)com
Web    : https://0xec.blogspot.com
Date   : 28-April-2017
Url    : https://sourceforge.net/projects/pyinstallerextractor/
For any suggestions, leave a comment on
https://forum.tuts4you.com/topic/34455-pyinstaller-extractor/
This script extracts a pyinstaller generated executable file.
Pyinstaller installation is not needed. The script has it all.
For best results, it is recommended to run this script in the
same version of python as was used to create the executable.
This is just to prevent unmarshalling errors(if any) while
extracting the PYZ archive.
Usage : Just copy this script to the directory where your exe resides
        and run the script with the exe file name as a parameter
C:\path\to\exe\>python pyinstxtractor.py <filename>
$ /path/to/exe/python pyinstxtractor.py <filename>
Licensed under GNU General Public License (GPL) v3.
You are free to modify this source.
CHANGELOG
================================================
Version 1.1 (Jan 28, 2014)
-------------------------------------------------
- First Release
- Supports only pyinstaller 2.0
Version 1.2 (Sept 12, 2015)
-------------------------------------------------
- Added support for pyinstaller 2.1 and 3.0 dev
- Cleaned up code
- Script is now more verbose
- Executable extracted within a dedicated sub-directory
(Support for pyinstaller 3.0 dev is experimental)
Version 1.3 (Dec 12, 2015)
-------------------------------------------------
- Added support for pyinstaller 3.0 final
- Script is compatible with both python 2.x & 3.x (Thanks to Moritz Kroll @ Avira Operations GmbH & Co. KG)
Version 1.4 (Jan 19, 2016)
-------------------------------------------------
- Fixed a bug when writing pyc files >= version 3.3 (Thanks to Daniello Alto: https://github.com/Djamana)
Version 1.5 (March 1, 2016)
-------------------------------------------------
- Added support for pyinstaller 3.1 (Thanks to Berwyn Hoyt for reporting)
Version 1.6 (Sept 5, 2016)
-------------------------------------------------
- Added support for pyinstaller 3.2
- Extractor will use a random name while extracting unnamed files.
- For encrypted pyz archives it will dump the contents as is. Previously, the tool would fail.
Version 1.7 (March 13, 2017)
-------------------------------------------------
- Made the script compatible with python 2.6 (Thanks to Ross for reporting)
Version 1.8 (April 28, 2017)
-------------------------------------------------
- Support for sub-directories in .pyz files (Thanks to Moritz Kroll @ Avira Operations GmbH & Co. KG)
"""

"""
Author: In Ming Loh
Email: inming.loh@countercept.com
Changes have been made to Version 1.8 (April 28, 2017).
CHANGELOG
================================================
- Function extractFiles(self, custom_dir=None) has been modfied to allow custom output directory.
"""

import os
import struct
import marshal
import zlib
import sys
import imp
import types
from uuid import uuid4 as uniquename


class CTOCEntry:
    def __init__(self, position, cmprsdDataSize, uncmprsdDataSize, cmprsFlag, typeCmprsData, name):
        self.position = position
        self.cmprsdDataSize = cmprsdDataSize
        self.uncmprsdDataSize = uncmprsdDataSize
        self.cmprsFlag = cmprsFlag
        self.typeCmprsData = typeCmprsData
        self.name = name


class PyInstArchive:
    PYINST20_COOKIE_SIZE = 24           # For pyinstaller 2.0
    PYINST21_COOKIE_SIZE = 24 + 64      # For pyinstaller 2.1+
    MAGIC = b'MEI\014\013\012\013\016'  # Magic number which identifies pyinstaller

    def __init__(self, path):
        self.filePath = path


    def open(self):
        try:
            self.fPtr = open(self.filePath, 'rb')
            self.fileSize = os.stat(self.filePath).st_size
        except:
            print('[*] Error: Could not open {0}'.format(self.filePath))
            return False
        return True


    def close(self):
        try:
            self.fPtr.close()
        except:
            pass


    def checkFile(self):
        print('[*] Processing {0}'.format(self.filePath))
        # Check if it is a 2.0 archive
        self.fPtr.seek(self.fileSize - self.PYINST20_COOKIE_SIZE, os.SEEK_SET)
        magicFromFile = self.fPtr.read(len(self.MAGIC))

        if magicFromFile == self.MAGIC:
            self.pyinstVer = 20     # pyinstaller 2.0
            print('[*] Pyinstaller version: 2.0')
            return True

        # Check for pyinstaller 2.1+ before bailing out
        self.fPtr.seek(self.fileSize - self.PYINST21_COOKIE_SIZE, os.SEEK_SET)
        magicFromFile = self.fPtr.read(len(self.MAGIC))

        if magicFromFile == self.MAGIC:
            print('[*] Pyinstaller version: 2.1+')
            self.pyinstVer = 21     # pyinstaller 2.1+
            return True

        print('[*] Error : Unsupported pyinstaller version or not a pyinstaller archive')
        return False


    def getCArchiveInfo(self):
        try:
            if self.pyinstVer == 20:
                self.fPtr.seek(self.fileSize - self.PYINST20_COOKIE_SIZE, os.SEEK_SET)

                # Read CArchive cookie
                (magic, lengthofPackage, toc, tocLen, self.pyver) = \
                struct.unpack('!8siiii', self.fPtr.read(self.PYINST20_COOKIE_SIZE))

            elif self.pyinstVer == 21:
                self.fPtr.seek(self.fileSize - self.PYINST21_COOKIE_SIZE, os.SEEK_SET)

                # Read CArchive cookie
                (magic, lengthofPackage, toc, tocLen, self.pyver, pylibname) = \
                struct.unpack('!8siiii64s', self.fPtr.read(self.PYINST21_COOKIE_SIZE))

        except:
            print('[*] Error : The file is not a pyinstaller archive')
            return False

        print('[*] Python version: {0}'.format(self.pyver))

        # Overlay is the data appended at the end of the PE
        self.overlaySize = lengthofPackage
        self.overlayPos = self.fileSize - self.overlaySize
        self.tableOfContentsPos = self.overlayPos + toc
        self.tableOfContentsSize = tocLen

        print('[*] Length of package: {0} bytes'.format(self.overlaySize))
        return True


    def parseTOC(self):
        # Go to the table of contents
        self.fPtr.seek(self.tableOfContentsPos, os.SEEK_SET)

        self.tocList = []
        parsedLen = 0

        # Parse table of contents
        while parsedLen < self.tableOfContentsSize:
            (entrySize, ) = struct.unpack('!i', self.fPtr.read(4))
            nameLen = struct.calcsize('!iiiiBc')

            (entryPos, cmprsdDataSize, uncmprsdDataSize, cmprsFlag, typeCmprsData, name) = \
            struct.unpack( \
                '!iiiBc{0}s'.format(entrySize - nameLen), \
                self.fPtr.read(entrySize - 4))

            name = name.decode('utf-8').rstrip('\0')
            if len(name) == 0:
                name = str(uniquename())
                print('[!] Warning: Found an unamed file in CArchive. Using random name {0}'.format(name))

            self.tocList.append( \
                                CTOCEntry(                      \
                                    self.overlayPos + entryPos, \
                                    cmprsdDataSize,             \
                                    uncmprsdDataSize,           \
                                    cmprsFlag,                  \
                                    typeCmprsData,              \
                                    name                        \
                                ))

            parsedLen += entrySize
        print('[*] Found {0} files in CArchive'.format(len(self.tocList)))


    def extractFiles(self, custom_dir=None):
        print('[*] Beginning extraction...please standby')
        if custom_dir is None:
            extractionDir = os.path.join(os.getcwd(), os.path.basename(self.filePath) + '_extracted')

            if not os.path.exists(extractionDir):
                os.mkdir(extractionDir)

            os.chdir(extractionDir)
        else:
            if not os.path.exists(custom_dir):
                os.makedirs(custom_dir)
            os.chdir(custom_dir)

        for entry in self.tocList:
            basePath = os.path.dirname(entry.name)
            if basePath != '':
                # Check if path exists, create if not
                if not os.path.exists(basePath):
                    os.makedirs(basePath)

            self.fPtr.seek(entry.position, os.SEEK_SET)
            data = self.fPtr.read(entry.cmprsdDataSize)

            if entry.cmprsFlag == 1:
                data = zlib.decompress(data)
                # Malware may tamper with the uncompressed size
                # Comment out the assertion in such a case
                assert len(data) == entry.uncmprsdDataSize # Sanity Check

            with open(entry.name, 'wb') as f:
                f.write(data)

            if entry.typeCmprsData == b'z':
                self._extractPyz(entry.name)


    def _extractPyz(self, name):
        dirName =  name + '_extracted'
        # Create a directory for the contents of the pyz
        if not os.path.exists(dirName):
            os.mkdir(dirName)

        with open(name, 'rb') as f:
            pyzMagic = f.read(4)
            assert pyzMagic == b'PYZ\0' # Sanity Check

            pycHeader = f.read(4) # Python magic value

            if imp.get_magic() != pycHeader:
                print('[!] Warning: The script is running in a different python version than the one used to build the executable')
                print('    Run this script in Python{0} to prevent extraction errors(if any) during unmarshalling'.format(self.pyver))

            (tocPosition, ) = struct.unpack('!i', f.read(4))
            f.seek(tocPosition, os.SEEK_SET)

            try:
                toc = marshal.load(f)
            except:
                print('[!] Unmarshalling FAILED. Cannot extract {0}. Extracting remaining files.'.format(name))
                return

            print('[*] Found {0} files in PYZ archive'.format(len(toc)))

            # From pyinstaller 3.1+ toc is a list of tuples
            if type(toc) == list:
                toc = dict(toc)

            for key in toc.keys():
                (ispkg, pos, length) = toc[key]
                f.seek(pos, os.SEEK_SET)

                fileName = key
                try:
                    # for Python > 3.3 some keys are bytes object some are str object
                    fileName = key.decode('utf-8')
                except:
                    pass

                # Make sure destination directory exists, ensuring we keep inside dirName
                destName = os.path.join(dirName, fileName.replace("..", "__"))
                destDirName = os.path.dirname(destName)
                if not os.path.exists(destDirName):
                    os.makedirs(destDirName)

                try:
                    data = f.read(length)
                    data = zlib.decompress(data)
                except:
                    print('[!] Error: Failed to decompress {0}, probably encrypted. Extracting as is.'.format(fileName))
                    open(destName + '.pyc.encrypted', 'wb').write(data)
                    continue

                with open(destName + '.pyc', 'wb') as pycFile:
                    pycFile.write(pycHeader)      # Write pyc magic
                    pycFile.write(b'\0' * 4)      # Write timestamp
                    if self.pyver >= 33:
                        pycFile.write(b'\0' * 4)  # Size parameter added in Python 3.3
                    pycFile.write(data)


def main():
    if len(sys.argv) < 2:
        print('[*] Usage: pyinstxtractor.py <filename>')

    else:
        arch = PyInstArchive(sys.argv[1])
        if arch.open():
            if arch.checkFile():
                if arch.getCArchiveInfo():
                    arch.parseTOC()
                    arch.extractFiles()
                    arch.close()
                    print('[*] Successfully extracted pyinstaller archive: {0}'.format(sys.argv[1]))
                    print('')
                    print('You can now use a python decompiler on the pyc files within the extracted directory')
                    return

            arch.close()


if __name__ == '__main__':
    main()
```



现在我们已经得到的.pyc文件了，下面我们把pyc转成py就可以了，但是很尴尬的是必须是3.8的环境，然后各个宣称支持3.8的在线破解网站也纷纷失败，没办法只得虚拟机下搞了个3.8，真的恼火

> uncompyle6 main.pyc > main.py



打开py，开始代码分析

```python
# uncompyle6 version 3.7.3
# Python bytecode 3.8 (3413)
# Decompiled from: Python 3.8.5 (default, Jul 20 2020, 19:48:14) 
# [GCC 7.5.0]
# Embedded file name: main.py
# Compiled at: 1995-09-28 00:18:56
# Size of source mod 2**32: 272 bytes
import sys
from PyQt5.QtCore import *
from PyQt5.QtWidgets import *
from signin import *
from mydata import strBase64
from ctypes import *
import _ctypes
from base64 import b64decode
import os

class AccountChecker:

    def __init__(self):
        self.dllname = './tmp.dll'
        self.dll = self._AccountChecker__release_dll()
        self.enc = self.dll.enc
        self.enc.argtypes = (c_char_p, c_char_p, c_char_p, c_int)
        self.enc.restype = c_int
        self.accounts = {b'SCTFer': b64decode(b'PLHCu+fujfZmMOMLGHCyWWOq5H5HDN2R5nHnlV30Q0EA')}
        self.try_times = 0

    def __release_dll(self):
        with open(self.dllname, 'wb') as (f):
            f.write(b64decode(strBase64.encode('ascii')))
        return WinDLL(self.dllname)

    def clean(self):
        _ctypes.FreeLibrary(self.dll._handle)
        if os.path.exists(self.dllname):
            os.remove(self.dllname)

    def _error(self, error_code):
        errormsg = {0:'Unknown Error', 
         1:'Memory Error'}
        QMessageBox.information(None, 'Error', errormsg[error_code], QMessageBox.Abort, QMessageBox.Abort)
        sys.exit(1)

    def __safe(self, username: bytes, password: bytes):
        pwd_safe = b'\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
        status = self.enc(username, password, pwd_safe, len(pwd_safe))
        return (pwd_safe, status) #

    def check(self, username, password):
        self.try_times += 1
        if username not in self.accounts:
            return False
        encrypted_pwd, status = self._AccountChecker__safe(username, password)
        if status == 1:
            self._AccountChecker__error(1)
        if encrypted_pwd != self.accounts[username]:
            return False
        self.try_times -= 1
        return True


class SignInWnd(QMainWindow, Ui_QWidget):

    def __init__(self, checker, parent=None):
        super().__init__(parent)
        self.checker = checker
        self.setupUi(self)
        self.PB_signin.clicked.connect(self.on_confirm_button_clicked)

    @pyqtSlot()
    def on_confirm_button_clicked(self):
        username = bytes((self.LE_usrname.text()), encoding='ascii')
        password = bytes((self.LE_pwd.text()), encoding='ascii')
        if username == b'' or password == b'':
            self.check_input_msgbox()
        else:
            self.msgbox(self.checker.check(username, password))

    def check_input_msgbox(self):
        QMessageBox.information(None, 'Error', 'Check Your Input!', QMessageBox.Ok, QMessageBox.Ok)

    def msgbox(self, status):
        msg_ex = {0:'', 
         1:'', 
         2:"It's no big deal, try again!", 
         3:'Useful information is in the binary, guess what?'}
        msg = 'Succeeded! Flag is your password' if status else 'Failed to sign in\n' + msg_ex[(self.checker.try_times % 4)]
        QMessageBox.information(None, 'SCTF2020', msg, QMessageBox.Ok, QMessageBox.Ok)


if __name__ == '__main__':
    app = QApplication(sys.argv)
    checker = AccountChecker()
    sign_in_wnd = SignInWnd(checker)
    sign_in_wnd.show()
    app.exec()
    checker.clean()
    sys.exit()
# okay decompiling main.pyc
```

大概就是调用tmp.dll的enc函数对传进来的username和password进行加密，password加密后送入pwd_safe。最后用户名为“SCTFer”，密码为b64decode(b'PLHCu+fujfZmMOMLGHCyWWOq5H5HDN2R5nHnlV30Q0EA')

然后我就陷入了tmp.dll到底在哪的难题，一通百度谷歌猛如虎，然后一查题解在运行的时候会在同目录下生成一个tmp.dll程序关闭就没了。

拖入IDA，找到enc函数，开始分析

```c++
  if ( v10 <= len )
  {
    while ( v10 < 32 )
      pwd[v10++] = 0;                           // pwd长度32 置0
    v12 = 0;
    for ( j = 0; j < 4; ++j )
    {
      _mm_lfence();
      memset(&Dst, 0, sizeof(Dst));
      j_memcpy(&Dst, &pwd[v12], 8ui64);         // 四次，每次八个字节
      Dst = sub_180011311(Dst);
      j_memcpy((void *)(v12 + pwd_safe), &Dst, 8ui64);// 加密后的pwd存到pwd_safe
      v12 += 8;
    }
    for ( k = 0; k < 32; ++k )
    {
      v16 = k;
      *(_BYTE *)(pwd_safe + k) ^= username[k % v11];// 用username给pwd_safe循环异或加密
    }
    *(_BYTE *)(pwd_safe + 32) = 0;
    v6 = 0i64;
  }
```

```c++
  for ( j = 0; j < 64; ++j )
  {
    if ( _dst >= 0 )
      _dst = sub_18001130C(2 * _dst);           // 取首位进行判断（说实话没看懂为啥是取首位，人家题解是这么说的）
    else
      _dst = sub_18001130C(2 * _dst ^ 0xB0004B7679FA26B3ui64);
  }
```

然后就是写脚本了，然后才发现我的python水平是真的烂，一脸懵逼不知道怎么写，直接放网上大佬的脚本。

```python
from base64 import *

username = "SCTFer"
pwd_safe = b64decode('PLHCu+fujfZmMOMLGHCyWWOq5H5HDN2R5nHnlV30Q0EA')

num = ["%02x" % x for x in pwd_safe]   
print(num)
hex_num = [int(x, 16) for x in num]    
print(hex_num)
print(num)

for i in range(32):
    hex_num[i] ^= ord(username[i % len(username)]) 

hex_nums = bytes.fromhex(''.join([hex(x)[2:].rjust(2, '0') for x in hex_num]))

print (hex_nums)

secret = []

for i in range(4):
    secret.append(int.from_bytes(hex_nums[i*8:(i + 1) * 8], byteorder="little"))

print (secret)

key = 0xB0004B7679FA26B3

flag = ""
for s in secret:
    for i in range(64):
        sign = s & 1
        if sign == 1:
            s ^= key
        s //= 2
        if sign == 1:
            s |= 0x8000000000000000
    print(hex(s))
    j = 0
    while j < 8:
        flag += chr(s&0xFF)
        s >>= 8
        j += 1
print(flag)
```

SCTF{We1c0m3_To_Sctf_2020_re_!!}

这个题算不上很完整的复现了，有个别细节没搞懂，也有点懒得搞了，先这样吧。

## 2020国赛

### z3

***

其他还好就是复制粘贴有点累人

```python
from z3 import *
v4 = [0x4f17,0x9cf6,0x8ddb,0x8ea6,0x6929,0x9911,0x40a2,0x2f3e,0x62b6,0x4b82,0x486c,0x4002,0x52d7,0x2def,
0x28dc,0x640d,0x528f,0x613b,0x4781,0x6b17,0x3237,0x2a93,0x615f,0x50be,0x598e,0x4656,0x5b31,0x313a,0x3010,
0x67fe,0x4d5f,0x58db,0x3799,0x60a0,0x2750,0x3759,0x8953,0x7122,0x81f9,0x5524,0x8971,0x3a1d]
print(len(v4))
v46 = Int('v46')
v47 = Int('v47')
v48 = Int('v48')
v49 = Int('v49')
v50 = Int('v50')
v51 = Int('v51')
v52 = Int('v52')
v53 = Int('v53')
v54 = Int('v54')
v55 = Int('v55')
v56 = Int('v56')
v57 = Int('v57')
v58 = Int('v58')
v59 = Int('v59')
v60 = Int('v60')
v61 = Int('v61')
v62 = Int('v62')
v63 = Int('v63')
v64 = Int('v64')
v65 = Int('v65')
v66 = Int('v66')
v67 = Int('v67')
v68 = Int('v68')
v69 = Int('v69')
v70 = Int('v70')
v71 = Int('v71')
v72 = Int('v72')
v73 = Int('v73')
v74 = Int('v74')
v75 = Int('v75')
v76 = Int('v76')
v77 = Int('v77')
v78 = Int('v78')
v79 = Int('v79')
v80 = Int('v80')
v81 = Int('v81')
v82 = Int('v82')
v83 = Int('v83')
v84 = Int('v84')
v85 = Int('v85')
v86 = Int('v86')
v87 = Int('v87')
s = Solver()
s.add(v4[0] == 34 * v49 + 12 * v46 + 53 * v47 + 6 * v48 + 58 * v50 + 36 * v51 + v52)
s.add(v4[1] == 27 * v50 + 73 * v49 + 12 * v48 + 83 * v46 + 85 * v47 + 96 * v51 + 52 * v52)
s.add(v4[2] == 24 * v48 + 78 * v46 + 53 * v47 + 36 * v49 + 86 * v50 + 25 * v51 + 46 * v52)
s.add(v4[3] == 78 * v47 + 39 * v46 + 52 * v48 + 9 * v49 + 62 * v50 + 37 * v51 + 84 * v52)
s.add(v4[4] == 48 * v50 + 14 * v48 + 23 * v46 + 6 * v47 + 74 * v49 + 12 * v51 + 83 * v52)
s.add(v4[5] == 15 * v51 + 48 * v50 + 92 * v48 + 85 * v47 + 27 * v46 + 42 * v49 + 72 * v52)
s.add(v4[6] == 26 * v51 + 67 * v49 + 6 * v47 + 4 * v46 + 3 * v48 + 68 * v52)
s.add(v4[7] == 34 * v56 + 12 * v53 + 53 * v54 + 6 * v55 + 58 * v57 + 36 * v58 + v59)
s.add(v4[8] == 27 * v57 + 73 * v56 + 12 * v55 + 83 * v53 + 85 * v54 + 96 * v58 + 52 * v59)
s.add(v4[9] == 24 * v55 + 78 * v53 + 53 * v54 + 36 * v56 + 86 * v57 + 25 * v58 + 46 * v59)
s.add(v4[10] == 78 * v54 + 39 * v53 + 52 * v55 + 9 * v56 + 62 * v57 + 37 * v58 + 84 * v59)
s.add(v4[11] == 48 * v57 + 14 * v55 + 23 * v53 + 6 * v54 + 74 * v56 + 12 * v58 + 83 * v59)
s.add(v4[12] == 15 * v58 + 48 * v57 + 92 * v55 + 85 * v54 + 27 * v53 + 42 * v56 + 72 * v59)
s.add(v4[13] == 26 * v58 + 67 * v56 + 6 * v54 + 4 * v53 + 3 * v55 + 68 * v59)
s.add(v4[14] == 34 * v63 + 12 * v60 + 53 * v61 + 6 * v62 + 58 * v64 + 36 * v65 + v66)
s.add(v4[15] == 27 * v64 + 73 * v63 + 12 * v62 + 83 * v60 + 85 * v61 + 96 * v65 + 52 * v66)
s.add(v4[16] == 24 * v62 + 78 * v60 + 53 * v61 + 36 * v63 + 86 * v64 + 25 * v65 + 46 * v66)
s.add(v4[17] == 78 * v61 + 39 * v60 + 52 * v62 + 9 * v63 + 62 * v64 + 37 * v65 + 84 * v66)
s.add(v4[18] == 48 * v64 + 14 * v62 + 23 * v60 + 6 * v61 + 74 * v63 + 12 * v65 + 83 * v66)
s.add(v4[19] == 15 * v65 + 48 * v64 + 92 * v62 + 85 * v61 + 27 * v60 + 42 * v63 + 72 * v66)
s.add(v4[20] == 26 * v65 + 67 * v63 + 6 * v61 + 4 * v60 + 3 * v62 + 68 * v66)
s.add(v4[21] == 34 * v70 + 12 * v67 + 53 * v68 + 6 * v69 + 58 * v71 + 36 * v72 + v73)
s.add(v4[22] == 27 * v71 + 73 * v70 + 12 * v69 + 83 * v67 + 85 * v68 + 96 * v72 + 52 * v73)
s.add(v4[23] == 24 * v69 + 78 * v67 + 53 * v68 + 36 * v70 + 86 * v71 + 25 * v72 + 46 * v73)
s.add(v4[24] == 78 * v68 + 39 * v67 + 52 * v69 + 9 * v70 + 62 * v71 + 37 * v72 + 84 * v73)
s.add(v4[25] == 48 * v71 + 14 * v69 + 23 * v67 + 6 * v68 + 74 * v70 + 12 * v72 + 83 * v73)
s.add(v4[26] == 15 * v72 + 48 * v71 + 92 * v69 + 85 * v68 + 27 * v67 + 42 * v70 + 72 * v73)
s.add(v4[27] == 26 * v72 + 67 * v70 + 6 * v68 + 4 * v67 + 3 * v69 + 68 * v73)
s.add(v4[28] == 34 * v77 + 12 * v74 + 53 * v75 + 6 * v76 + 58 * v78 + 36 * v79 + v80)
s.add(v4[29] == 27 * v78 + 73 * v77 + 12 * v76 + 83 * v74 + 85 * v75 + 96 * v79 + 52 * v80)
s.add(v4[30] == 24 * v76 + 78 * v74 + 53 * v75 + 36 * v77 + 86 * v78 + 25 * v79 + 46 * v80)
s.add(v4[31] == 78 * v75 + 39 * v74 + 52 * v76 + 9 * v77 + 62 * v78 + 37 * v79 + 84 * v80)
s.add(v4[32] == 48 * v78 + 14 * v76 + 23 * v74 + 6 * v75 + 74 * v77 + 12 * v79 + 83 * v80)
s.add(v4[33] == 15 * v79 + 48 * v78 + 92 * v76 + 85 * v75 + 27 * v74 + 42 * v77 + 72 * v80)
s.add(v4[34] == 26 * v79 + 67 * v77 + 6 * v75 + 4 * v74 + 3 * v76 + 68 * v80)
s.add(v4[35] == 34 * v84 + 12 * v81 + 53 * v82 + 6 * v83 + 58 * v85 + 36 * v86 + v87)
s.add(v4[36] == 27 * v85 + 73 * v84 + 12 * v83 + 83 * v81 + 85 * v82 + 96 * v86 + 52 * v87)
s.add(v4[37] == 24 * v83 + 78 * v81 + 53 * v82 + 36 * v84 + 86 * v85 + 25 * v86 + 46 * v87)
s.add(v4[38] == 78 * v82 + 39 * v81 + 52 * v83 + 9 * v84 + 62 * v85 + 37 * v86 + 84 * v87)
s.add(v4[39] == 48 * v85 + 14 * v83 + 23 * v81 + 6 * v82 + 74 * v84 + 12 * v86 + 83 * v87)
s.add(v4[40] == 15 * v86 + 48 * v85 + 92 * v83 + 85 * v82 + 27 * v81 + 42 * v84 + 72 * v87)
s.add(v4[41] == 26 * v86 + 67 * v84 + 6 * v82 + 4 * v81 + 3 * v83 + 68 * v87)
print(s.check())
print(s.model())
```



### hyperthreading

***

比赛的时候愣是没做出来，比完之后的半夜突然懂了，原来是数据没转成函数.......

之前在XCTF有接触到过一道HOOK的题目，也不能说对HOOK完全不理解，大概就是构造一个长得一样的函数然后通过手段替换掉（不知道这样说对不对），所以关键就是找到这个函数了。

跟HOOK相关的也就那么几行，就是一个一个点也能试出来。

![image-20200822020917166](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/K4bJWL7QPv1uojV.png)

过去之后这样，我也没感觉有啥不对，push ebp. move ebp, esp. 感觉是个很规范的开头，然后就没有然后了。

![image-20200822021156277](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/8NwKFQ7sSMrDOIm.png)

时间就来到今晚，再次看到上面那一大段数据，菜鸡心里突然感到一阵不安，然后一顿u+p，好家伙，果然是段程序。

![image-20200822021718310](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/YMvTpcLIRjFhntC.png)

![image-20200822021857318](https://x1ngg3-pic.oss-cn-beijing.aliyuncs.com/myimg/WPzniO4Mf7GcCkY.png)



我们需要关注的就是主函数中参与最终比较的**byte_40336C**。这段代码是可以反汇编的，但是下面的那个再加上0x23的那段函数并不在反汇编出来的函数之中，因为毕竟是我们u+P出来的，有点错误可以接受，猜测应该是jmp那里出了问题没有反编译完整，所以好的做法是根据汇编代码中**byte_40336C**的高亮提示逐步排查一下。

脚本：

```python
a = [ 0xDD, 0x5B, 0x9E, 0x1D, 0x20, 0x9E, 0x90, 0x91, 0x90, 0x90, 
  0x91, 0x92, 0xDE, 0x8B, 0x11, 0xD1, 0x1E, 0x9E, 0x8B, 0x51, 
  0x11, 0x50, 0x51, 0x8B, 0x9E, 0x5D, 0x5D, 0x11, 0x8B, 0x90, 
  0x12, 0x91, 0x50, 0x12, 0xD2, 0x91, 0x92, 0x1E, 0x9E, 0x90, 
  0xD2, 0x9F]
flag = ''
for i in range(len(a)):
    for j in range(32,127):
        x = j >> 2
        y = j << 6
        z = (((x ^ y) ^ 0x23) + 0x23) & 0xff
        if z == a[i]:
            flag += chr(j)
print(flag)
```



### bd

***

本来啥也不懂，然后群里学长指路说是wiener's attack，那知道攻击方法了就没啥了

记录一下网上大佬的脚本：


```python
import gmpy2
def transform(x,y):       #使用辗转相处将分数 x/y 转为连分数的形式
    res=[]
    while y:
        res.append(x//y)
        x,y=y,x%y
    return res
    
def continued_fraction(sub_res):
    numerator,denominator=1,0
    for i in sub_res[::-1]:      #从sublist的后面往前循环
        denominator,numerator=numerator,i*numerator+denominator
    return denominator,numerator   #得到渐进分数的分母和分子，并返回

    
#求解每个渐进分数
def sub_fraction(x,y):
    res=transform(x,y)
    res=list(map(continued_fraction,(res[0:i] for i in range(1,len(res)))))  #将连分数的结果逐一截取以求渐进分数
    return res

def get_pq(a,b,c):      #由p+q和pq的值通过维达定理来求解p和q
    par=gmpy2.isqrt(b*b-4*a*c)   #由上述可得，开根号一定是整数，因为有解
    x1,x2=(-b+par)//(2*a),(-b-par)//(2*a)
    return x1,x2

def wienerAttack(e,n):
    for (d,k) in sub_fraction(e,n):  #用一个for循环来注意试探e/n的连续函数的渐进分数，直到找到一个满足条件的渐进分数
        if k==0:                     #可能会出现连分数的第一个为0的情况，排除
            continue
        if (e*d-1)%k!=0:             #ed=1 (mod φ(n)) 因此如果找到了d的话，(ed-1)会整除φ(n),也就是存在k使得(e*d-1)//k=φ(n)
            continue
        
        phi=(e*d-1)//k               #这个结果就是 φ(n)
        px,qy=get_pq(1,n-phi+1,n)
        if px*qy==n:
            p,q=abs(int(px)),abs(int(qy))     #可能会得到两个负数，负负得正未尝不会出现
            d=gmpy2.invert(e,(p-1)*(q-1))     #求ed=1 (mod  φ(n))的结果，也就是e关于 φ(n)的乘法逆元d
            return d
    print("该方法不适用")
    
    
e = 46867417013414476511855705167486515292101865210840925173161828985833867821644239088991107524584028941183216735115986313719966458608881689802377181633111389920813814350964315420422257050287517851213109465823444767895817372377616723406116946259672358254060231210263961445286931270444042869857616609048537240249
n = 86966590627372918010571457840724456774194080910694231109811773050866217415975647358784246153710824794652840306389428729923771431340699346354646708396564203957270393882105042714920060055401541794748437242707186192941546185666953574082803056612193004258064074902605834799171191314001030749992715155125694272289
d=wienerAttack(e,n)
print("d=",d)
```

***

今天发这篇博客纯属意外，白天和老妈吵了一架，晚上听着窗外夜雨实在难以入眠，所以干脆先记录一下，之后几天还有其他的比赛，可能没心思再回顾了，睡觉了，世界晚安。
