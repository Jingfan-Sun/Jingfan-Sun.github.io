---
layout: notes
category: notes
tag: [tech_tips]
title: "How to debug Fortran in PSCAD: Message, Warning, and Error"
---

#### Why we need this?
Yes, it is hard to code in Fortran, especially when we want to use it to design customized components in PSCAD. One of the most difficulties is the lack of debugging tools. I have been working on PSCAD since 2015, and it is only until recently that I found how to display *logs* to the console, so I can finally know which line the code is currently running at. I hope this note can help make your life a little easier :)

#### Usage
**Message (since v4.6.0)**

This routine can be inserted to anywhere in the `Script` section to display messages, warnings, and errors.
```fortran
CALL EMTDC_MESSAGE(ICALL_NO, $#Component, 1, 1, "Messages")
```
- `ICALL_NO` and `$#Component` are predefined and should not be changed
- `3rd` argument indicates the type of messages: `0` for message, `1` for warning, `2` for error
- `4th` argument should not be changed
- `5th` argument is the content of message to display

**Warning**

This routine can be used to display warnings in any PSCAD version.
```fortran
CALL EMTDC_WARN(ICALL_NO, $#Component, 1, "Messages")
```
- `ICALL_NO` and `$#Component` are predefined and should not be changed
- `3rd` argument should not be changed
- `4th` argument is the content of message to display

#### An example
Here is a minimal [example](https://ambaboo-github-io-assets.s3.amazonaws.com/message_test.pscx) with a single customized component. The only script is the message routine.

{: .center}
![](https://ambaboo-github-io-assets.s3.amazonaws.com/2019-01-23-PSCAD-debug-fig1.PNG){:height="25%" width="25%"}

{: .center}
![](https://ambaboo-github-io-assets.s3.amazonaws.com/2019-01-23-PSCAD-debug-fig2.PNG){:height="50%" width="50%"}

This routine will output warnings in the PSCAD console like this (I am using v4.6.0).

{: .center}
![](https://ambaboo-github-io-assets.s3.amazonaws.com/2019-01-23-PSCAD-debug-fig3.PNG){:height="90%" width="90%"}

You can insert this routine in any place you are interested in within your own Fortran script to track the execution of your code. You can also play with messages and errors in the given example. 

Good luck on your project and research!