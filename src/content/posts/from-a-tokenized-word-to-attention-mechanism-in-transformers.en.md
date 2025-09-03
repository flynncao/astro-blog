---
title: From a tokenized word to attention mechanism in Transformers
published: 2025-08-23T13:50:36+08:00
draft: true
tags:
  - javascript
  - frontend
  - browser
category: code
lang: en
---

Recently, I was learning Transformers basics, if you are like me struggling in this seemingly new field or get headache about the detail stuff to get some ideas for your new ASR/NLP projects and learn some ideas about its mechanism, this post is for you. I am not good at math, so I will try to explain things in a simple way.

# Introduce

The attention mechanism can be found at many places in Transformers, I will focus on the ones residing in the encoding layer for now.

![](https://cfr2-img.flynncao.uk/202509022317902.png)

Forget about this picture, lets talk about the **semantics** in a sentence "I eat bread on the table." As a English learner, one can easily find the relationships between theses words, for example:

* "eat" is more relevant to "bread" than "table" cause I am a normal human, although technically, the table is edible
* "bread" has some relationships with "table" because
* "I" have relationship with both but here, as a sentence, the verb "eat" and objective "bread" are more important than "bread" and "table". Without "table" the sentence is still correct.
* "I" have relationship with myself.

Now lets only take "eat", "bread" and "table" to see the relationship among them. And we will skip the tokenization process and make each word one token. (so "token" equals "word" in the following descriptions and a "sentence" is likely referring to a input sequence)

## Prerequisites: Linear Algebra in Numpy

To know the relationships between tokens, I will simulate the process by calculating the attention score between each token, which, will need basics of linear algebra. You don't need to know the maths behind it, but at least you need to know how to use it.

Linear Algebra is a branch of mathematics that deals with vectors and matrices. In Python, we can use the numpy library to perform linear algebra operations. Here is an example of how to use numpy to perform basic linear algebra operations:

```python
import numpy as np
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])
c = np.multiply(a, b)
print(c)
print(a@b) # -> 1*4 + 2*5 + 3*6 = 32 (matrix multiplication)
```
And a `a@b` operation is all we need.

~~You also should know in numpy even the two matrices are not the same shape, you can still do matrix multiplication.

For example:

Notice that $A$ is a 2x2 matrix and $B$ is a 1x2 matrix. But we can still do matrix multiplication using Numpy. Thats because we can think of $B$

</del>~~

> You don't need to open an IDE to doing the calculation, just type `python` in your terminal and you'll get a python shell.

## Tokenization and encoding

As we all know, each word in a sentence has some sort of relationship with the other words. For example, the word "eat" in "I eat bread not table", its obvious that the word "eat" is more aligned with "bread" than "table". But how can we measure theses relationships mathematically and computationally?

In the original Transformer paper, a `d_model=512` is defined as the dimensionality of the model. And the dimensionality is used to describe the word embedding. The word embedding contains characters of this word such as its word's identity, context, syntax role and semantics.(I will explain this in other post)

But what the word embedding doesn't capture the contextual relationships words, especially in a non-autoregressive model like Transformers encoder processes the input sequence in parallel (non-recurrent, not step-by-step, sequence-by-sequence like RNNs), The tokens in Transformers instead "attend" to each other and we call it a "pair-wise" attention (or self-attention).

![](https://cfr2-img.flynncao.uk/202509022354178.png)

## Multi-head attention, attention score and Q,K,V(What are they?)

We already know characteristics and their placement of a word in a sentence the through cosine similarities in word embedding an positional encoding  but since we still process the tokens autoregressively (we generate sentences token-by-token in LLMs, as you may notice), its impossible to train the token relationships first without knowing how to predict the next one. Here is where attention score comes into a place.

### Attention Score and Attention Mechanism

There are differences between cosine similarity in word embeddings and the attention scores in attention layer

* Attention Mechanism evaluate the **probability** of the semantic relationships between two tokens rather than a fixed, easy-to-catch score.
* The attention score and the probabilities are temporary values and can be easily changed through **trained weights**.
* When it comes to probabilities, keeping the range in a sane, logic range is widely accepted in both math and CS subjects. 

But here the question comes, how to achieve these three?



### W_Q, W_K and W_V, the trained weights

You may say, even without trained weights, the Q, K, V can still be calculated and determine the similarity between the tokens, but actually
without tailored $W_{Q}, W_{K}, W_{V}$ The model can’t tailor the similarity or decide what information to pass (values):

Moreover, just like FFN(feed-forward neural network, a.k.a mini MLP), layer norms, embeddings, etc —- are trainable parameters, they are updated step by step by backpropagation + optimizer.
During inference(after training), During inference (after training), they are fixed, but each encoder layer (and each head inside that layer) has its own separate set of  $W_{Q}, W_{K}, W_{V}$. And the model then has the ability to learn different weights for each encoder/decoder layer and influence them on the contrary.

### X * W_Q

The attention score is calculated by the dot product of Q and K, and the formula is $\dfrac{Q*K^T}{\sqrt(d_{k})}$

* Q=Query, its the subject or the thing we are looking for, it ask: “Who am I?”
* K=Key, its the thing we are looking at. It ask: “What I am looking at??”
* V=Value, it reveals the info the K carries. It ask: “What I am looking at??”

We can see from the graph that the $Q_{bread} * K_{(all)}$ will give us a new vector of probabilities and obviously the relationship btw eat and bread is most promising.

Now back to matrices, lets assume

- Sequence length $S=20$
- Model width $d_{model}=512$
- Heads $H=8⇒d_k=d_v=\frac{512}{8}=64$

** Why is $\dfrac{1}{\sqrt{k}}$ ?? **

(1) turning scores into weights (and the output is a probability distribution)

(2) because dot-product attention is much faster and more space-efficient in practice, since it can be implemented using highly optimized matrix multiplication code but grows magnitudely and makes softmax results unbalance. [[^1]]

So, to successfully recover the original shape of input features $(n, d_model)$

**Input embeddings (after add-pos-enc):**

![](https://cfr2-img.flynncao.uk/202508231916856.png)

This is the calculation procedure AI gives us, now lets see how we can re-write it manually on paper and in code.

* Use draw.io to draw the graph to replicate the calculation

* Use Numpy

### Lets train them together first, no heads

### Why do we need multi-head attention? and How to split them

After the training path, you can see that if we don't split them, the compute cost will be too high. The head=8 just as the $d_model=512$, are both a trade-off between the model size and the performance.

When splitting, just imagine these d_model will be d_model / H (H=8 for instance) long, thus combining them to get a final attention matrix representing all tokens are necessary.
In the final output, the attention matrix is a $H \times H$ matrix, where each row is a single token's attention matrix. Since the token vector isn't complete yet, we should combine (n, 64) to (n, 512).

```python
print("Step 8: Step 1 to 7 for inputs 1 to 3")
#We assume we have 3 results with learned weights (they were not trained in this example)
#We assume we are implementing the original Transformer paper. We will have 3 results of 64 dimensions each
attention_head1=np.random.random((3, 64))
print(attention_head1)
---
z0h1=np.random.random((3, 64))
z1h2=np.random.random((3, 64))
z2h3=np.random.random((3, 64))
z3h4=np.random.random((3, 64))
z4h5=np.random.random((3, 64))
z5h6=np.random.random((3, 64))
z6h7=np.random.random((3, 64))
z7h8=np.random.random((3, 64))
---
print("Step 10: Concatenation of heads 1 to 8 to obtain the original 8x64=512 output dimension of the model")
output_attention=np.hstack((z0h1,z1h2,z2h3,z3h4,z4h5,z5h6,z6h7,z7h8)) # h stack to Stack arrays in sequence horizontally (column wise).
print(output_attention)
```

# References

^1: Vaswani, Ashish, Noam Shazeer, Niki Parmar, et al. ‘Attention Is All You Need’. arXiv:1706.03762. Preprint, arXiv, 2 August 2023. https://doi.org/10.48550/arXiv.1706.03762.↩︎

