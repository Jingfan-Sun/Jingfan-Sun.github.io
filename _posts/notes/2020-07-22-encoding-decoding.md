---
layout: notes
category: notes
tag: [knowledge]
title: Working with Encoding and Decoding with Examples
cover_img: "https://ambaboo-github-io-assets.s3.amazonaws.com/2019-05-09-shell-command-cover.png"
published: false
---

### Encoding Formats

#### UTF-8

#### Base64

### Python Examples

#### String

```bash
str = "hello"
# convert to UTF-8
# "hello" -> b'hello'
utf8_str = str.encode("UTF-8") 
# write binary string to file
file.write(utf8_str)
```

#### Int

```bash
num = 17171
# convert to binary
# 17171 -> b'\x17C'
num_bytes = num.to_bytes(2, byteorder="little")
# convert back to number
num_frombytes = int.from_bytes(num_bytes, byteorder="little")
```

#### Files