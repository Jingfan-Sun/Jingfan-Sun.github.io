---
layout: notes
category: notes
tag: [knowledge]
title: "Parallel Patterns"
---

### Why Parallel with Patterns?

Given a problem, we want to think at a higher level instead of low-level implementation details. These high-level structures work as the building blocks to assemble the solutions to complex problems. Parallel patterns tell us **what** to compute, not **how** to compute. The idea is

- Focusing on ligh-level structures and patterns
- Higher level patterns are built from more fundamental patterns
- Let the programmers worry about how to implement the patters

### Reduce

_Many parallel threads need to generate a single result_

- order doesn't matter to the result
- associative operator (+, *, min/max, AND/OR, …)

{: .center}
![](https://ambaboo-github-io-assets.s3.amazonaws.com/2019-04-22-parallel-patterns-reduce.png){:height="40%" width="40%"}

Assuming the size of array to be $N$

- Reduction takes $\log(N)$ steps to complete. Step $i$ does $N/2^i$ independent operations. Each step is done inparallel, the overall complexity is $O(\log(N))$.
- The number of total operations done is $\sum_{i=1}^{\log(N)} 2^{N-i} = N-1 = O(N)$. Parallel reduction does not do more opeartions than the sequential one. It is efficient.
- Typically, given a large array, we do sequential reduction on each processor first, then do in parallel. Given $p$ processors, the time complexity is $O(\frac{N}{p} + log(p))$.

Optimization of parallel reduction on GPU [1]. 

### Scan (Prefix Sum)

_Each thread outputs the sum of all elements before it, inclusively or exclusively_

- binary associative operator [2]
- done in place

{: .center}
![](https://ambaboo-github-io-assets.s3.amazonaws.com/2019-04-22-parallel-patterns-scan.png){:height="90%" width="90%"}

Assuming all data resides in one thread block, a single phase scan

- takes $O(\log(N))$ steps
- in step $i$, each thread works with another thread that is $2^{i-1}$ offset away
- $N-2^{i-1}$ threads participate
- overall complexity $O(\log(N))$

If the data is too large to fit into one thread block, we take a two-phase approach

- on GPU, using $b$ thread blocks, $O(\log(\frac{N}{b}) + \log(b)) = O(\log(N))$:
    - Partition data to $N/b$ thread blocks, each block does parallel scan locally
    - Perform another parallel scan using the last element from each block, which is the sum of all elements within that block
    - Add the corresponding result from the second scan to all elements within each thread block

- on multi-core CPU with $p$ processors [3], $O(\frac{N}{p} + \log(p))$:
    - Partition data to $N/p$ processors, does equential scan locally on each processor
    - Perform parallel scan using the last element from each processor, which is the sum of all elements within that processor
    - Add the result of parallel scan on each processor to each of its local prefix sum

### Split, Compact, Expand

{: .center}
![](https://ambaboo-github-io-assets.s3.amazonaws.com/2019-04-22-parallel-patterns-split.png){:height="90%" width="90%"}

- _Split_: re-order an array with all elements whose key is 1 at the beginning
- _Compact_: remove null elements
- _Expand_: each thread has writes to index with variable stride

All these three patterns should answer **"where should each thred write its output?"** It all dependes on where other threads write. The position where each thread writes can be efficiently calculated with parallel scan.

### Segmented Scan

_Scan only within regions (seperated by `Key`, size only known on run-time)_

- Regions are seperated by barriers (`1`s) in `Key`
- Operations on `Value` don't propagate beyonf barriers
- `Key` and `Value` do scans at once (seperately)
    - `Key` scan normally using operator `OR`
    - `Value` only performs operation when its associated `Key` is `0` in current stage

{: .center}
![](https://ambaboo-github-io-assets.s3.amazonaws.com/2019-04-22-parallel-patterns-segment-scan.png){:height="90%" width="90%"}

- Doing lots of reductions of unpredictable size at the same time is the most common use
- Doing sums/max/count/any over arbitrary sub-domains of your data
- Common Usage Scenarios [4]:
    - Determine which region/tree/group/object class an element belongs to and assign that as its new ID
    - Sort based on that ID
    - Operate on all of the regions/trees/groups/objects in parallel, no matter what their size or number
- Doing divide-and-conquer type algorithms, following similar procedure like above

### Sort

- Sorting is useful for almost everything, we may sort the dataset by `Key` and process using segmented scan
- Sorting is a standard approach but may not be the optimized solution
- Sorting is helpful because it improves memory and execution coherence (move related data closer)
- Optimizaed GPU sorting already exists
	- Radix sort (bucket sort) is faster than comparison-based sorts, if you can generate fixed-size `Key`

**Example: Parallel Merge Sort**

<!-- Use no more than $\log(n)$ processors. -->

$$
\begin{equation}
\begin{split}
T(n, p) &= T(\frac{n}{2}, \frac{p}{2}) + O(n) \\
&= T(\frac{n}{4}, \frac{p}{4}) + O(\frac{n}{2}) + O(n) \\
&= ... \\
&= T(\frac{n}{p}, 1) + O(n + \frac{n}{2} + ... + \frac{n}{p/2}) \\
&= O(\frac{n}{p} \log \frac{n}{p} + n)
\end{split}
\end{equation}
$$

**Example: Bitonic Sort**

- Bitonic Sequence
	- increases first then decreases, OR
	- decreases first then increases, OR
	- you can shift the sequence to make the first two cases true
- Bitonic Split: split a bitonic sequence $l$ into two half, $l_{\min}$ and $l_{\max}$
	- $l_{\min} = \min(x_0, x_{n/2}), \min(x_1, x_{n/2+1}), ..., \min(x_{n/2-1}, x_{n-1})$
	- $l_{\max} = \max(x_0, x_{n/2}), \max(x_1, x_{n/2+1}), ..., \max(x_{n/2-1}, x_{n-1})$
	- the resulting $l_{\min}$ and $l_{\max}$ are still bitonic, and $\max(l_{\min}) \leq \min(l_{\max})$
- Bitonic Merge: turning a bitonic sequence into a sorted sequence using repeated bitonic split operations
	- $BM(p, p) = O(\log p)$

{: .center}
![](https://ambaboo-github-io-assets.s3.amazonaws.com/2019-04-22-parallel-patterns-bitonic.png){:height="60%" width="60%"}

The right arrows in the figure above refers to `CompareExchange` - compare two values and move smaller one along the arrow
$$
\begin{equation}
\begin{split}
T(p, p) &= BM(2, 2) + BM(4, 4) + ... + BM(p, p) \\
&= 1 + 2 + ... + \log p \\
&= O(\log^2 p)
\end{split}
\end{equation}
$$

When $n>p$
- sort $n/p$ locally on each processor - $O(\frac{n}{p} \log \frac{n}{p})$
- Run bitonic sort with `CompareExchange` replaced by `MergeSplit` - merge two sorted arrays and split into two
- $O(\frac{n}{p} \log \frac{n}{p} + \frac{n}{p} \log^2 p)$
	
<!-- ### MapReduce
	○ Combination of sort and reduction (scan)
	○ Map
		§ Map a function over a domain.
		§ Function is provided by the user. 
		§ Function can be anything which produces a (key, value) pair
			□ Value can just be a pointer to arbitrary data structure
	○ Sort
		§ All the (key, value) pairs are sorted based on their keys
		§ Happens implicitly
		§ Creates runs of (k, v) pairs with same key
		§ User usually has no control over sort function
	○ Reduce
		§ Reduce function is provided by the user
			□ Can be simple plus, max,…
		§ Library makes sure that values from one key don’t propagate to another (segscan)
		§ Final result is a list of keys and final values (or arbitrary data structures) -->

### Reference
[1]. <https://developer.download.nvidia.com/assets/cuda/files/reduction.pdf>

[2]. <http://mathonline.wikidot.com/associativity-and-commutativity-of-binary-operations>

[3]. CSE 6220 - High Performance Computing, Georgia Tech

[4]. <https://wrf.ecse.rpi.edu/Teaching/parallel-s2018/stanford/lectures/lecture_7/parallel_patterns_2.pdf>