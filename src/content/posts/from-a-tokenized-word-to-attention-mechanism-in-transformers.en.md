---
title: From a tokenized word to attention mechanism in Transformers
published: 2025-09-03T23:59:36+08:00
draft: true
tags:
  - NLP
  - LLMs
  - Transformers
  - architecture
category: code
lang: en
---

Recently, I was learning Transformers basics. If you are like me — struggling in this seemingly new field or getting a headache from the details — but still want to gather some ideas for your next ASR/NLP project and understand the mechanism a bit, this post is for you. I am not good at math, so I will try to explain things in a simple way.

# Introduce

The attention mechanism appears in many parts of Transformers. For now, I will focus on the ones inside the encoding layer.


![](https://cfr2-img.flynncao.uk/202509022317902.png)

Forget about this picture for a moment. Let’s talk about the **semantics** in a sentence: "I eat bread on the table." As an English learner, you can probably sense the relationships between these words. For example:


* "eat" is more relevant to "bread" than "table" cause I am a normal human, although technically, the table is edible
* "bread" has some relationships with "table" because
* "I" have relationship with both but here, as a sentence, the verb "eat" and objective "bread" are more important than "bread" and "table". Without "table" the sentence is still correct.
* "I" have relationship with myself.

Now, let’s only take "eat," "bread," and "table" to look at the relationships among them. We will skip the tokenization process and treat each word as one token. (So in the following, "token" = "word," and a "sentence" refers to an input sequence.)


## Prerequisites: Linear Algebra in Numpy

To find the relationships between tokens, I will simulate the process by calculating the attention score between each token. This requires some basics of linear algebra. You don’t need to dive deep into the math, but you should know how to use it.


Linear Algebra is a branch of mathematics that deals with vectors and matrices. In Python, we can use the numpy library to perform linear algebra operations. Here’s a quick example of how `numpy` can handle basic linear algebra tasks:

* Dot Product (1-D arrays)

```python
import numpy as np
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])
c = np.multiply(a, b)
print(c) # -> 1*4 + 2*5 + 3*6 = 32 
print(a@b) # -> 1*4 + 2*5 + 3*6 = 32 
```
* Matrix Multiplication (2-D arraries)
```python
A = np.array([[1, 2],
              [3, 4]])

B = np.array([[5, 6],
              [7, 8]])
C = A @ B
print("A:\n", A)
print("B:\n", B)
print("A @ B:\n", C) # ->  [[19 22] [43 50]]
```
That's it, that's all knowledge we need for the following chapters.

> You don't need to open an IDE to doing the calculation, just type `python` in your terminal and you'll get a python shell.

## Tokenization and encoding

As we all know, each word in a sentence has some sort of relationship with the other words. For example, the word "eat" in "I eat bread not table", its obvious that the word "eat" is more aligned with "bread" than "table". But how can we measure theses relationships mathematically and computationally?

In the original Transformer paper, a `d_model=512` is defined as the dimensionality of the model. And the dimensionality is used to describe the word embedding. The word embedding contains characters of this word such as its word's identity, context, syntax role and semantics.(I will explain this in other post)

But what the word embedding doesn't capture the contextual relationships words, especially in a non-autoregressive model like Transformers encoder processes the input sequence in parallel (non-recurrent, not step-by-step, sequence-by-sequence like RNNs), The tokens in Transformers instead "attend" to each other and we call it a "pair-wise" attention (or self-attention).

![](https://cfr2-img.flynncao.uk/202509022354178.png)

For simplicity, we will start with sample matrices where d_model=4. (In practice, the actual dimension might be 8, but we’ll keep using d_model=4 until the multi-head setup is introduced.) and `tokens=3` to represent 3 words (we assume $1token=1word$ here) in a sentence and each word has three distinct features. Suppose we have already done the postional encoding and so on, a $X$ matrix with shape $(3,4)$ thus is used to represent these three encoded tokens. 

$$X=\begin{bmatrix}1&0&1&0\\0&2&0&2\\1&1&1&1\end{bmatrix}$$

> each row represents 1 token

## Self-atention 

### Q,K,V(What are they?)

We already know characteristics and their placement of a word in a sentence the through cosine similarities in word embedding an positional encoding  but since we still process the tokens autoregressively (we generate sentences token-by-token in LLMs, as you may notice), its impossible to train the token relationships first without knowing how to predict the next one. Here is where attention score comes into a place.

==The full attention score formula is: $\dfrac{Q*K^T}{\sqrt(d_{k})}$ so before we start we need to know (1) why we need attention score (2) how to calculate Q,K,V and what are they?==

### Attention Score and Attention Mechanism

There are differences between cosine similarity in word embeddings and the attention scores in attention layer.

* Attention Mechanism evaluate the **probability** of the semantic relationships between two tokens,  ensuring that relationships are expressed as relative importance weights rather than arbitrary **raw scores**.
* While the scores change dynamically per input, the transformation process (dot product + scaling + softmax) is fixed and the **learned weights** control how the values shift.
* To ensure the mechanism mathematically stable, easier to train, and interpretable. We need to limit the range of probabilities into certain threshold.

But here the question comes, how to achieve these three? The answer lies not only in the way Q, K, V are derived, but more importantly in how they are shaped through the trainable weight matrices. Scientists chose to formulate them as Query, Key, and Value rather than just token-to-token matrices because this abstraction makes the mechanism both flexible and extendable—Q focuses on what is being asked, K defines how the information is indexed, and V decides what content is actually carried. In contrast, a direct token-vs-token matrix would lock the model into rigid similarity checks, offering less control and adaptability during training.

* Q=Query, its the subject or the thing we are looking for, it ask: “Who am I?”
* K=Key, its the thing we are looking at. It ask: “What I am looking at??”
* V=Value, it reveals the info the K carries. It ask: “What I am looking at??”

> Think of the input embeddings $X$ as raw ingredients. The weight matrices $W_Q, W_K, W_V$ we will mention later are the recipes, and the resulting Q, K, V are the prepared dishes ready to be served to the attention mechanism.

### W_Q, W_K and W_V, the trained weights

You may say, even without trained weights, the Q, K, V can still be calculated and used to measure similarity between tokens. But in reality, without tailored $W_{Q}, W_{K}, W_{V}$ the model cannot refine that similarity or decide which information (values) should be emphasized and passed along.

Moreover, just like FFN (feed-forward neural network, a.k.a. mini MLP), layer norms, and embeddings — these weight matrices are **trainable parameters**. They are updated step by step through backpropagation with an optimizer. During inference (after training), they become fixed, but each encoder layer (and each attention head inside that layer) keeps its own distinct set of $W_{Q}, W_{K}, W_{V}$. This design allows the model to learn different attention patterns across layers and heads, and to influence how information flows at multiple levels of the network.

Now that we understand why $W_{Q}, W_{K}, W_{V}$ matter and how they are trained, the next step is to see how they are actually applied. In practice, each token embedding $X$ is first projected by these weights to produce Q, K, and V, which then serve as the foundation for computing attention scores.

We will define the Q, K and V each as the same shape of input $X$ to keep consistency across the layers in architecture and gives us a same output $Z$ after the work is done in this layer. 

$$W_Q = X @ W_Q$$

To calculate the resulted Q, K and V each with shape (4,4), which is the shape of input matrix, it's obvious that we need a $(4,3)$ matrix to derive from.


$$
X =
\begin{bmatrix}
1 & 0 & 1 & 0 \\ 
0 & 2 & 0 & 2 \\ 
1 & 1 & 1 & 1
\end{bmatrix}, \qquad
W_Q =
\begin{bmatrix}
1 & 0 & 1 \\ 
1 & 0 & 0 \\ 
0 & 0 & 1 \\ 
0 & 1 & 1
\end{bmatrix}, \qquad
W_K =
\begin{bmatrix}
0 & 0 & 1 \\ 
1 & 1 & 0 \\ 
0 & 1 & 0 \\ 
1 & 1 & 0
\end{bmatrix}, \qquad
W_V =
\begin{bmatrix}
0 & 2 & 0 \\ 
0 & 3 & 0 \\ 
1 & 0 & 3 \\ 
1 & 1 & 0
\end{bmatrix}
$$



### X * W_Q = Q

After know what the trained weights being represented, the first task is to calculate Q, K, V.

We can see from the graph that the $Q_{bread} * K_{(all)}$ will give us a new vector of probabilities and obviously the relationship btw eat and bread is most promising.


$$Q = X W_Q, \qquad K = X W_K, \qquad V = X W_V.$$

$$
Q =
\begin{bmatrix}
1 & 0 & 1 & 0\\
0 & 2 & 0 & 2\\
1 & 1 & 1 & 1
\end{bmatrix}
\cdot
\begin{bmatrix}
1 & 0 & 1\\
1 & 0 & 0\\
0 & 0 & 1\\
0 & 1 & 1
\end{bmatrix}
=
\begin{bmatrix}
1 & 0 & 2\\
2 & 2 & 2\\
2 & 1 & 3
\end{bmatrix}
$$

### Raw attention scores

$$S = \frac{Q K^\top}{\sqrt{d_k}} \quad\text{(row i gives scores of query i against all keys)}.$$


> 💡Why is $\dfrac{1}{\sqrt{k}}$ ?? <br>
> (1) turning scores into weights (and the output is a probability distribution)<br>
> (2) because dot-product attention is much faster and more space-efficient in practice, since it can be implemented using highly optimized matrix multiplication code but grows magnitudely and makes softmax results unbalance. [[^1]]

$$\sqrt{d_k} = \sqrt{2} = 1$$

$$
S = \frac{1}{1}
\begin{bmatrix}
1 & 0 & 2\\
2 & 2 & 2\\
2 & 1 & 3
\end{bmatrix}
\begin{bmatrix}
0 & 4 & 2\\
1 & 4 & 3\\
1 & 0 & 1
\end{bmatrix}
=
\begin{bmatrix}
2 & 4 & 4\\
4 & 16 & 2\\
4 & 12 & 10
\end{bmatrix}
$$

After computing the raw attention scores, we know how strongly a query is “aligned” with each key. However, these scores are unbounded and lack a consistent scale, which makes them unsuitable as the final weights in our attention mechanism. To address this, we introduce the softmax function:

$$\mathrm{softmax}(s_j) = \frac{\exp(s_j)}{\sum_k \exp(s_k)}.$$

Softmax transforms a vector of arbitrary scores into a probability distribution: every weight becomes positive, and each row sums to 1. This normalization ensures that attention weights are stable, interpretable, and comparable across different tokens. As a result, each token’s representation becomes a blend of other tokens, with the mixture determined by these dynamic, probabilistic weights.

### Softmax 

Once we have the raw attention scores $S$, we normalize them row-wise with softmax:
$$
A=softmax(S)(apply softmax to each row of S)
$$
We will conduct this using code instead of diving into the detail of Softmax algorithms, attention_scores[0] stands for the token1 versus all tokens, so as for token2 and token3.

This ensures that the attention weights for each query form a probability distribution (all positive, each row summing to 1).

We can implement this directly:

attention_scores[0] = softmax(attention_scores[0])  # attention weights of Q1 versus all tokens 
attention_scores[1] = softmax(attention_scores[1])  # attention weights of Q2 versus all tokens 
attention_scores[2] = softmax(attention_scores[2])  # attention weights of Q3 versus all tokens 

At this point, each row of attention_scores tells us how much a query attends to the keys of all tokens, expressed as normalized probabilities.


### Concatenation and restoration to original input size (n, d_512)

Next, the normalized attention weights are used to compute a weighted sum of the value vectors:

$$Z=A ⋅ W_o$$

> A=(n,n), (row-wise softmax of scores); W_o=(n, d_model), a weighted matrix that is also pretrained.

Here $Z$ represents the new sequence of embeddings after attention — each token is now a mixture of value vectors from the whole sequence, scaled by the attention weights.

In **multi-head** attention we do the same steps in parallel across $k$ heads, Each head $i$ Concatenating heads along the feature dimension gives:

$$Z_{\text{multi}} = \mathrm{Concat}(Z_1, Z_2, \dots, Z_H) \in \mathbb{R}^{n\times (H,d_k)},d_k=\dfrac{d_{model}}{H}$$

Because by design $H d_k =d_{model}$, the concatenated tensor has shape $\mathbb{R}^{n\times (d_{model})}$
So in our example $n=3$ and $d_model=8$  with H=2, the each head has $d_k=4$ and 
$$
Z_1, Z_2 \in \mathbb{R}^{3\times 4},\quad
Z_{\text{multi}} \in \mathbb{R}^{3\times 8}.
$$

After concatenation, we usually apply an output projection:

$$\tilde Z = Z_{\text{multi}} W_O, \qquad W_O \in \mathbb{R}^{d_{\text{model}}\times d_{\text{model}}}$$

This step ensures that the final representation has the same shape as the original input, $(n, d_{\text{model}})$, keeping the model consistent layer to layer.


## TL;DR

A step-by-step overview of what happens in a self-attention layer (with d=512, h=8, s=20 for sequence length) is shown below:

![](https://cfr2-img.flynncao.uk/202508231916856.png)

I also drew a process diagram. At first, I keep the attention calculation unsplit, and only introduce the multi-head split at the end for clarity:

![](https://cfr2-img.flynncao.uk/multi-head-attention(pytorch).drawio_light.png)

Now that we’ve seen the step-by-step flow of a single self-attention layer, the next natural question is why the mechanism is split into multiple heads.

Multi-head attention is not a random hack but a practical design. Without splitting, attention still works, but the model loses diverse views (different aspects of token relationships like syntax, semantics, long-range dependencies) and efficiency in computation. The choice h = 8 and d_model = 512 (so each head has d_k = 64) comes from the original Transformer as a balanced setup — small enough per-head, rich enough overall, and stable to train.

1. X (s, d_model) * W_Q, W_K, W_V (d_model, d_model) → Q,K,V (s, d_model)

2. reshape → Q,K,V (s, h, d_k) → per-head Q_i,K_i,V_i (s, d_k)

3. per-head attention: softmax(Q_i K_i^T / sqrt(d_k)) → (s, s) attention map

4. per-head output: (s, s) @ (s, d_k) → (s, d_k)

5. concat heads: (s, h * d_k) = (s, d_model) → optionally W_O projection → final (s, d_model)


In the final output, the attention matrix is a $n \times 64$ matrix, where each row is a single token's attention matrix. Since the token vector isn't complete yet, we should combine (n, 64) to (n, 512).

By completing the whole process, not only do we apply trainable weights onto the sequence, but we also project the input into multiple subspaces, attend within each subspace, and recombine those views — giving the model diverse contextual signals while preserving the d_model shape for the next layer.

# References

^1: Vaswani, Ashish, Noam Shazeer, Niki Parmar, et al. ‘Attention Is All You Need’. arXiv:1706.03762. Preprint, arXiv, 2 August 2023. https://doi.org/10.48550/arXiv.1706.03762.↩︎

