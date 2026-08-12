# UNIT II — Cryptography: Classical & Modern Techniques, Public Key Cryptosystems, Key Management

**Overall exam weightage estimate (relative to the full 5-unit course): 25%** — this unit is the mathematical backbone of the entire course (RSA key generation, DES structure, Diffie-Hellman exchange, classical cipher arithmetic all yield guaranteed numerical questions), so it typically ties for the highest weightage of the five units, alongside Unit III.

---

## 1. TOPIC WEIGHTAGE ANALYSIS

| # | Topic | Internal Weightage | Tier | Why |
|---|-------|--------------------|------|-----|
| 1 | RSA (key generation, encryption/decryption, numericals) | 20% | **Must-Study** | Almost every exam carries a full RSA numerical (8–10 marks); also a favourite theory question ("explain and prove RSA works"). |
| 2 | Classical ciphers (Caesar, Monoalphabetic, Playfair, Hill, Vigenère, Rail Fence, Columnar) | 15% | **Must-Study** | Short, fast-to-grade numericals; appear almost every semester, low effort-to-marks ratio for students who practice them. |
| 3 | DES (Feistel structure, rounds, key schedule, weaknesses) | 15% | **Must-Study** | Structural/diagram-based theory question is extremely common; also a stepping stone to AES (Unit III/IV context). |
| 4 | Diffie–Hellman Key Exchange | 12% | **Must-Study** | Guaranteed numerical (compute public keys + shared secret); also tested as MITM-vulnerability theory. |
| 5 | Cryptanalysis & attack types (COA/KPA/CPA/CCA), brute-force, code-breaking methodology | 10% | **Must-Study** | Definitional/short-answer gold — easy marks, frequently a 2-mark or 5-mark sub-question. |
| 6 | RC4 / RC5 / RC6 / Blowfish | 10% | **Moderate** | Usually asked as "write short note on" or comparison table — rarely numerical, so high recall value but low computational depth. |
| 7 | Symmetric vs Asymmetric Cryptography, Principles of Public-Key Cryptosystems | 8% | **Must-Study** | Conceptual backbone question, frequently paired with RSA/DH as an intro sub-part. |
| 8 | Elliptic Curve Cryptography (ECC) | 5% | **Moderate/Low-Yield** | Growing importance in current syllabi but still asked mostly as short conceptual notes, not heavy numericals, at this level. |
| 9 | Key Management (generation, distribution, storage, revocation) | 5% | **Low-Yield** | Usually a 2–5 mark theory sub-question; rarely a full question on its own. |

**Why this distribution:** Numerically verifiable topics (RSA, DH, classical ciphers) dominate because they are the easiest for examiners to set as "solve and show steps" questions with an objectively checkable answer — these should be practiced until they can be done cold in under 10 minutes each. DES earns high weightage because its Feistel diagram is a classic "draw and explain" question. RC4/RC5/RC6/Blowfish and ECC are important for completeness and comparison tables but are lower yield per unit of study time since they rarely carry numericals at this course level.

---

## 2. COMPREHENSIVE THEORY

### 2.1 Basic Terminology and the Cryptographic Model

- **Plaintext (P):** the original, intelligible message.
- **Ciphertext (C):** the scrambled, unintelligible output of encryption.
- **Encryption (E):** the process of converting plaintext to ciphertext using an algorithm and a key.
- **Decryption (D):** the reverse process, recovering plaintext from ciphertext using an algorithm and a key.
- **Key (K):** a secret parameter that controls the transformation performed by the algorithm.
- **Cipher/Algorithm:** the mathematical function implementing encryption/decryption.
- **Cryptology** = **Cryptography** (the art/science of designing secure schemes) + **Cryptanalysis** (the art/science of breaking them).

**Generic encryption/decryption model:**

```
                        Key (K)
                          |
                          v
Plaintext (P)  ----> [ Encryption Algorithm E ] ----> Ciphertext (C)
                              C = E(K, P)

Ciphertext (C) ----> [ Decryption Algorithm D ] ----> Plaintext (P)
                              P = D(K, C)
                          ^
                          |
                        Key (K)
```

For a cipher to be usable, `D(K, E(K, P)) = P` must always hold. Security depends on the **secrecy of the key**, not the secrecy of the algorithm (**Kerckhoffs's Principle**) — the algorithm may be public; only the key must remain secret.

---

### 2.2 Classical Cryptographic Techniques

Classical ciphers are divided into two families: **substitution ciphers** (replace plaintext symbols with other symbols) and **transposition ciphers** (rearrange the order of plaintext symbols without changing them).

#### 2.2.1 Caesar Cipher (Mono-alphabetic Shift Substitution)

Each letter of the plaintext is replaced by a letter a fixed number of positions (**shift k**) down the alphabet.

**Formula:**
- Encryption: `C = (P + k) mod 26`
- Decryption: `P = (C − k) mod 26`
(letters mapped A=0, B=1, ..., Z=25)

**Weakness:** only 25 possible keys (k = 1..25) → trivially broken by brute force or frequency analysis.

#### 2.2.2 Monoalphabetic Substitution Cipher

Instead of a fixed shift, each plaintext letter is mapped to a unique ciphertext letter via an arbitrary permutation of the alphabet (the **key** is the entire 26-letter permutation).

- **Keyspace:** 26! ≈ 4 × 10²⁶ — far larger than Caesar's 25, so brute force is infeasible.
- **Weakness:** the mapping is still one letter → one letter, so it **preserves language letter-frequency statistics**. It is broken easily via **frequency analysis** (in English, E, T, A, O, I, N are the most frequent letters; matching ciphertext letter frequencies against known English frequencies reveals the key).

#### 2.2.3 Playfair Cipher (Digraph Substitution)

Encrypts pairs of letters (**digraphs**) instead of single letters using a 5×5 key matrix built from a keyword (I and J share a cell).

**Matrix construction rule:** write the keyword (removing duplicate letters), then fill remaining cells with unused alphabet letters in order.

**Encryption rules for a plaintext digraph:**
1. If both letters are in the **same row**, replace each with the letter immediately to its right (wrap around).
2. If both letters are in the **same column**, replace each with the letter immediately below it (wrap around).
3. Otherwise, the two letters form a **rectangle** — replace each letter with the letter in its own row but in the other letter's column.
4. If both letters of a pair are the same, insert a filler (X) between them; pad with X if the message has odd length.

**Worked mini-example.** Key = `MONARCHY`. Matrix (I/J combined):

```
M O N A R
C H Y B D
E F G I K
L P Q S T
U V W X Z
```

Plaintext = `HELLO` → digraphs: `HE`, `LX` (X inserted to break the double L), `LO`.

- `HE`: H(row1,col1), E(row2,col0) → rectangle rule → H→C (row1,col0), E→F (row2,col1) ⇒ **CF**
- `LX`: L(row3,col0), X(row4,col3) → rectangle rule → L→S (row3,col3), X→U (row4,col0) ⇒ **SU**
- `LO`: L(row3,col0), O(row0,col1) → rectangle rule → L→P (row3,col1), O→M (row0,col0) ⇒ **PM**

**Ciphertext = `CFSUPM`**

Playfair defeats simple single-letter frequency analysis (since it substitutes pairs) but digraph-frequency analysis can still break it.

#### 2.2.4 Hill Cipher (Matrix Substitution)

Treats blocks of `n` letters as a vector and encrypts using an `n×n` key matrix `K` over mod 26 arithmetic:

`C = K · P mod 26` (encryption), `P = K⁻¹ · C mod 26` (decryption, where `K⁻¹` is the modular inverse matrix of `K`).

**Requirement:** `K` must be invertible mod 26, i.e., `gcd(det(K), 26) = 1`.

**Worked mini-example (2×2):** Key `K = [[3,3],[2,5]]`, plaintext `HI` → H=7, I=8.

- `det(K) = 3×5 − 3×2 = 15 − 6 = 9`, `gcd(9,26)=1` ✓ (K is invertible, valid key)
- `C1 = (3×7 + 3×8) mod 26 = (21+24) mod 26 = 45 mod 26 = 19 → T`
- `C2 = (2×7 + 5×8) mod 26 = (14+40) mod 26 = 54 mod 26 = 2 → C`

**Ciphertext = `TC`**

Hill cipher hides single-letter frequencies completely (strong against simple frequency analysis) but is **linear**, so it is vulnerable to a **known-plaintext attack**: with `n` known plaintext/ciphertext digraph pairs, the key matrix can be solved for directly via linear algebra.

#### 2.2.5 Vigenère Cipher (Polyalphabetic Substitution)

Uses a repeating keyword; each plaintext letter is shifted by the corresponding keyword letter's value (like a Caesar cipher whose shift changes every letter).

**Formula:** `Ci = (Pi + Ki) mod 26`, where `Ki` is the i-th letter of the keyword repeated to match plaintext length.

Because each plaintext letter can map to different ciphertext letters depending on position, it **flattens the letter-frequency distribution**, making simple frequency analysis ineffective. It is broken using the **Kasiski examination**: find repeated substrings in the ciphertext, measure the distances between repetitions, and take the **GCD of these distances** to estimate the keyword length; once the length is known, each of the resulting sub-streams is a simple Caesar cipher solvable by frequency analysis. (A full worked numerical is given in Section 4.)

#### 2.2.6 Rail Fence Cipher (Transposition)

Plaintext letters are written in a zig-zag pattern across a set number of "rails," then read off row-by-row.

**Worked mini-example (3 rails):** Plaintext = `HELLOWORLD`

```
H . . . O . . . L .
. E . L . W . R . D
. . L . . . O . . .
```
Row0: `H O L`, Row1: `E L W R D`, Row2: `L O`

**Ciphertext = `HOLELWRDLO`**

#### 2.2.7 Columnar Transposition Cipher

Plaintext is written row-wise in a grid whose width equals the keyword length; columns are then read off in the **alphabetical order of the keyword's letters**.

**Worked mini-example:** Key = `CIPHER` (6 letters). Alphabetical rank of letters: C=1, E=2, H=3, I=4, P=5, R=6 → column order by keyword position: pos1(C)=1, pos2(I)=4, pos3(P)=5, pos4(H)=3, pos5(E)=2, pos6(R)=6.

Plaintext = `MEETMEATNOON` written in rows of 6:

```
M E E T M E
A T N O O N
```

Read columns in rank order (1,2,3,4,5,6 → positions 1,5,4,2,3,6):
- pos1: M,A → `MA`
- pos5: M,O → `MO`
- pos4: T,O → `TO`
- pos2: E,T → `ET`
- pos3: E,N → `EN`
- pos6: E,N → `EN`

**Ciphertext = `MAMOTOETENEN`**

Transposition ciphers preserve letter frequencies (only order changes), so they are broken by anagramming / trying different column widths, unlike substitution ciphers which are broken by frequency analysis.

---

### 2.3 Cryptanalysis and Code-Breaking Methodologies

**Cryptanalysis** is the science of studying a cryptosystem in order to recover plaintext or key without authorized access — the attacker's counterpart to cryptography.

**General code-breaking methodologies:**
- **Frequency analysis** — exploits statistical letter/digraph frequency of the underlying language (breaks Caesar, monoalphabetic, Playfair to an extent).
- **Kasiski examination / Index of Coincidence** — finds the period (keyword length) of polyalphabetic ciphers like Vigenère.
- **Linear algebra attack** — recovers Hill cipher keys from known plaintext-ciphertext digraph pairs.
- **Differential and linear cryptanalysis** — statistical techniques used against modern block ciphers (e.g., DES) by tracking how input differences propagate through rounds.
- **Side-channel analysis** — exploits implementation leakage (timing, power consumption, electromagnetic emission) rather than mathematical weakness.

**Types of cryptanalytic attacks (classified by what the attacker has access to):**

| Attack | Attacker has | Goal |
|---|---|---|
| **Ciphertext-only attack (COA)** | Only ciphertext(s), knows algorithm | Deduce plaintext/key using statistical patterns; weakest attacker position, strongest requirement for cipher security. |
| **Known-plaintext attack (KPA)** | Some plaintext-ciphertext pairs | Use known pairs to deduce the key and decrypt further ciphertexts (e.g., breaks Hill cipher). |
| **Chosen-plaintext attack (CPA)** | Can submit chosen plaintexts and see ciphertext output (encryption oracle) | Choose plaintexts strategically to reveal key structure. |
| **Chosen-ciphertext attack (CCA)** | Can submit chosen ciphertexts and see decrypted plaintext output (decryption oracle) | Exploit decryption responses (e.g., padding-oracle attacks) to recover plaintext/key. |

**Brute-Force Attack:** systematically tries **every possible key** in the keyspace until the correct one produces intelligible plaintext.
- Keyspace size for an `n`-bit key = **2ⁿ**.
- Average number of attempts needed to find the correct key = **2ⁿ⁻¹** (half the keyspace, on average).
- Time to break = keyspace ÷ (attempts tried per second) — this is the basis of all "how long to crack a key of length n" numericals (see Section 4).
- Countermeasure: increase key length exponentially increases brute-force cost (this is why DES's 56-bit key was replaced by AES's 128/192/256-bit keys).

**Use of Cryptography (applications):** confidentiality of data at rest/in transit, data integrity verification, entity authentication, non-repudiation (via digital signatures), access control. Real-world deployments: TLS/HTTPS for web traffic, IPSec/VPNs, full-disk encryption (BitLocker/LUKS), secure email (PGP/S-MIME), password/credential protection, blockchain and cryptocurrency, secure messaging apps (Signal protocol combining DH + symmetric encryption).

---

### 2.4 Symmetric vs Asymmetric Cryptography — Principles of Public-Key Cryptosystems

**Symmetric-key cryptography:** same key used for both encryption and decryption. Fast, efficient for bulk data, but suffers from the **key distribution problem** — the key must be shared secretly beforehand, and for `n` parties needing pairwise secure communication, `n(n-1)/2` keys must be generated, distributed, and managed.

**Asymmetric (public-key) cryptography:** uses a **mathematically linked key pair** — a **public key (PU)**, freely distributed, and a **private key (PR)**, kept secret. Data encrypted with one key of the pair can only be decrypted with the other.

**Why public-key cryptosystems solve the key-distribution problem:** each party generates one key pair and publishes only the public key. No secret needs to be exchanged in advance over a secure channel — anyone can encrypt a message to a recipient using the recipient's already-public key, and only the recipient's private key can decrypt it. This reduces the key management burden from `O(n²)` shared secrets to `O(n)` key pairs, and also enables **digital signatures** (sign with private key, verify with public key) for authentication and non-repudiation — something symmetric cryptography cannot provide on its own.

**Public/private key flow diagram:**

```
   Receiver generates key pair (PU, PR)
   Receiver publishes PU (public key) openly
                    |
Sender:             |
  Plaintext P  --[Encrypt using PU]-->  Ciphertext C
                    |
                    |  (sent over insecure channel)
                    v
Receiver:
  Ciphertext C --[Decrypt using PR]--> Plaintext P
```

**Principles required for a secure public-key cryptosystem:**
1. Computationally easy to generate a key pair (PU, PR).
2. Computationally easy for a sender to compute `C = E(PU, M)`.
3. Computationally easy for the receiver to compute `M = D(PR, C)`.
4. Computationally **infeasible** for an attacker, knowing PU, to determine PR.
5. Computationally infeasible for an attacker, knowing PU and C, to recover M.
6. (Optional, for signatures) `E` and `D` can be applied in either order: `E(PU, D(PR, M)) = M = D(PR, E(PU, M))`.

---

### 2.5 RSA Algorithm

RSA (Rivest–Shamir–Adleman) is the most widely used public-key cryptosystem, based on the practical difficulty of **factoring the product of two large primes**.

**Key Generation:**
1. Choose two large distinct prime numbers `p` and `q`.
2. Compute `n = p × q` (the modulus, used in both keys).
3. Compute Euler's totient: `φ(n) = (p−1)(q−1)`.
4. Choose an integer `e` (public exponent) such that `1 < e < φ(n)` and `gcd(e, φ(n)) = 1`.
5. Compute `d` (private exponent) such that `d × e ≡ 1 (mod φ(n))` — i.e., `d` is the modular multiplicative inverse of `e` mod `φ(n)`.
6. **Public Key = (e, n)**, **Private Key = (d, n)**. `p`, `q`, and `φ(n)` are discarded/kept secret.

**Encryption:** `C = M^e mod n` (using the receiver's public key)
**Decryption:** `M = C^d mod n` (using the receiver's private key)

**RSA flow diagram:**

```
KEY GENERATION
  choose p, q (large primes)
        |
  n = p*q         φ(n) = (p-1)(q-1)
        |
  choose e : gcd(e, φ(n)) = 1  ---> Public Key  = (e, n)
        |
  compute d : e*d ≡ 1 (mod φ(n)) ---> Private Key = (d, n)

ENCRYPTION (sender, using receiver's public key)
  Plaintext M  --->  C = M^e mod n  --->  Ciphertext C

DECRYPTION (receiver, using own private key)
  Ciphertext C  --->  M = C^d mod n  --->  Plaintext M
```

**Why RSA is secure — the factoring problem:** the public key exposes `n` but not its prime factors `p` and `q`. Computing `d` from `e` requires knowing `φ(n)`, which requires factoring `n`. For sufficiently large `n` (2048+ bits in practice), no known classical algorithm can factor `n` in feasible time — this is the **integer factorization problem**, and RSA's security rests entirely on its computational hardness (it would be broken by a practical quantum computer running Shor's algorithm, which is why post-quantum cryptography is an active research area, though outside this unit's scope).

---

### 2.6 Data Encryption Standard (DES)

DES is a **symmetric block cipher** standardized by NIST (1977) that operates on **64-bit blocks** using a **56-bit effective key** (stored/transmitted as 64 bits, with 8 bits used for parity, hence "64-bit key, 56 effective bits").

**Overall structure:**

```
        Plaintext (64 bits)
                |
        Initial Permutation (IP)
                |
        +----------------------+
        |   Round 1  (key K1)  |
        |   Round 2  (key K2)  |
        |        ...           |
        |   Round 16 (key K16) |
        +----------------------+
                |
        32-bit Swap (last round's swap undone)
                |
        Inverse Initial Permutation (IP^-1)
                |
        Ciphertext (64 bits)
```

**Feistel structure (each of the 16 rounds):** DES is a **Feistel cipher** — the 64-bit block is split into two 32-bit halves `L` and `R`. Each round:

```
        L(i-1)                      R(i-1)
          |                            |
          |                            +-------------------+
          |                            |                    |
          |                    E: Expansion (32->48 bits)     |
          |                            |                    |
          |                    XOR with round key Ki (48-bit) |
          |                            |                    |
          |                    S-boxes: substitution (48->32)|
          |                            |                    |
          |                    P: Permutation (32-bit)        |
          |                            |                    |
          +----------- XOR ------------+                    |
          |                                                  |
        L(i) = R(i-1)                        R(i) = L(i-1) XOR f(R(i-1), Ki)
```

- **Expansion (E):** expands the 32-bit `R` half to 48 bits by duplicating certain bits, so it can be XORed with the 48-bit round key.
- **XOR with round key:** the 48-bit expanded half is XORed with the 48-bit subkey `Ki` for that round.
- **S-boxes (Substitution boxes):** 8 S-boxes, each taking 6 input bits and producing 4 output bits (48→32 bits total), providing DES's non-linearity (its core source of cryptographic strength/confusion).
- **P-box (Permutation):** a fixed 32-bit permutation providing diffusion, spreading the influence of each S-box output across the next round.

**Key schedule:** the 64-bit key first passes through **Permuted Choice 1 (PC-1)**, which discards the 8 parity bits and permutes the remaining 56 bits, split into two 28-bit halves `C0` and `D0`. For each of the 16 rounds, both halves are **circularly left-shifted** (by 1 or 2 bits, per a fixed schedule), and **Permuted Choice 2 (PC-2)** selects 48 of the 56 bits to form that round's subkey `Ki`.

**Known weaknesses of DES:**
- **56-bit key is too small** for modern computing — the entire keyspace (2⁵⁶ ≈ 7.2×10¹⁶ keys) was demonstrated breakable by brute force in under 24 hours by dedicated hardware (EFF's "Deep Crack", 1998) and is trivial for modern hardware/cloud clusters.
- **Weak keys and semi-weak keys** exist (keys that produce identical or paired round subkeys).
- **Complementation property:** `DES(K̄, P̄) = C̄` (complementing key and plaintext complements the ciphertext), which slightly reduces effective brute-force effort.
- **Meet-in-the-middle attack** on naive Double-DES reduces its effective security to little more than single DES, which motivated Triple-DES's specific EDE construction.

**Evolution — 3DES and AES:** **Triple DES (3DES)** applies DES three times (Encrypt-Decrypt-Encrypt, EDE) with two or three keys, raising effective security to ~112 bits, but it is slow and still uses DES's small 64-bit block size. **AES (Advanced Encryption Standard, Rijndael)** replaced DES/3DES entirely — it uses a **substitution-permutation network (not Feistel)**, 128-bit blocks, and 128/192/256-bit keys with 10/12/14 rounds respectively, offering both stronger security and better performance (covered in depth as part of modern symmetric cryptography evolution).

---

### 2.7 RC4 (Stream Cipher)

RC4 (Ron's Code 4, designed by Ron Rivest) is a **symmetric stream cipher** that generates a pseudorandom **keystream** which is XORed with plaintext byte-by-byte.

- **Key Scheduling Algorithm (KSA):** initializes a 256-byte state array `S` with values 0..255, then uses the secret key (variable length, 40–2048 bits typically 40–128 bits in practice) to pseudo-randomly permute `S` through repeated swaps.
- **Pseudo-Random Generation Algorithm (PRGA):** using two indices `i` and `j` that are updated and used to swap entries of `S` each step, RC4 outputs one keystream byte per iteration, derived from `S`.
- **Encryption/decryption:** `Ciphertext byte = Plaintext byte XOR Keystream byte` (symmetric — same operation both ways).
- **Usage/weaknesses:** was widely used in **WEP** and early **SSL/TLS**; now **deprecated/prohibited** in TLS due to statistical biases in its keystream (particularly in the first bytes) that enable practical plaintext-recovery attacks.

### 2.8 RC5 (Block Cipher)

RC5 (also by Ron Rivest) is a **parametrized block cipher**, denoted `RC5-w/r/b` (word size `w`, number of rounds `r`, key length `b` bytes), typically `RC5-32/12/16` (32-bit words → 64-bit block, 12 rounds, 16-byte/128-bit key).

- Uses only three simple, fast operations: **XOR, modular addition (mod 2^w), and data-dependent left circular rotation**.
- The amount of rotation in each step depends on the data itself (not a fixed amount), which is RC5's key innovation for resisting differential/linear cryptanalysis.
- Key expansion generates `2r+2` subkeys from the user key.
- Lightweight and fast, was a candidate influence on the AES selection process.

### 2.9 RC6 (Block Cipher)

RC6 (Rivest, Sidney, Yin — evolution of RC5) was an **AES finalist**.

- **Block size:** 128 bits; **key sizes:** 128/192/256 bits; **default 20 rounds**.
- Uses **four 32-bit registers** (vs. RC5's two), enabling more parallel mixing per round.
- Adds **integer multiplication** as an operation (in addition to XOR, addition, and data-dependent rotation) specifically to achieve faster **diffusion** — multiplication spreads bit changes across a word much faster than rotation alone.
- Overall structure resembles a generalized Feistel-like round but is not a pure Feistel network.

### 2.10 Blowfish (Block Cipher)

Blowfish, designed by Bruce Schneier (1993), is a **Feistel cipher** intended as a fast, free, unpatented replacement for DES.

- **Block size:** 64 bits; **key length:** variable, **32 to 448 bits**; **16 rounds**.
- Uses a large set of **key-dependent S-boxes** (four S-boxes, each 8×32 bits, i.e., 256 entries of 32 bits) and an **18-entry 32-bit P-array**, both derived from the user key through an expensive key-setup phase (this slow key schedule deliberately hardens Blowfish against brute-force/precomputation attacks).
- Fast in software on 32-bit processors; no practical cryptanalytic break of the full cipher is known, but its **64-bit block size** is now considered a weakness for high-volume data (birthday-bound collision attacks such as **SWEET32** become feasible after ~2³² blocks encrypted under one key). Its successor, **Twofish**, uses a 128-bit block.

---

### 2.11 Key Management

Key management covers the entire lifecycle of cryptographic keys:

- **Key generation:** keys must be generated using a **cryptographically secure pseudorandom number generator (CSPRNG)**; predictable keys defeat even the strongest algorithm.
- **Key distribution:** the secure delivery of keys to communicating parties. Options include a trusted **Key Distribution Center (KDC)** that shares secret keys with each party and brokers session keys, or **public-key-based exchange** (e.g., Diffie–Hellman, or encrypting a symmetric session key with RSA) which avoids needing a pre-shared secret at all.
- **Key storage:** keys must be stored in tamper-resistant, access-controlled locations — **Hardware Security Modules (HSMs)**, secure enclaves, or encrypted key stores ("key wrapping," where a key-encrypting key protects the data key).
- **Key revocation/expiry:** keys must have a defined lifetime and a mechanism to invalidate them early if compromised (analogous to certificate revocation in PKI, covered further in Unit III) — this limits the damage window of a leaked key and enforces periodic **rekeying**.

**The key distribution problem:** in pure symmetric-key systems, every pair of communicating parties needs a distinct shared secret key; for `n` users needing full pairwise secure communication this requires `n(n-1)/2` keys, which becomes unmanageable as `n` grows. This is the central motivation for public-key cryptography (Section 2.4) and for protocols like Diffie–Hellman that let two parties derive a shared secret over an insecure channel without any prior secret exchange.

---

### 2.12 Diffie–Hellman (DH) Key Exchange

Diffie–Hellman (1976) was the first published public-key technique; it allows two parties to jointly establish a **shared secret key over an insecure channel**, without ever transmitting the secret itself.

**Public parameters (known to everyone, including attackers):** a large prime `p`, and a **primitive root (generator)** `g` of `p`.

**Protocol steps:**
1. Alice picks a private random integer `a` (`1 < a < p-1`) and computes her public value `A = g^a mod p`. She sends `A` to Bob.
2. Bob picks a private random integer `b` (`1 < b < p-1`) and computes his public value `B = g^b mod p`. He sends `B` to Alice.
3. Alice computes the shared secret: `K = B^a mod p`.
4. Bob computes the shared secret: `K = A^b mod p`.
5. Both arrive at the same value because `K = (g^b)^a mod p = (g^a)^b mod p = g^(ab) mod p`.

**Diagram:**

```
   Public parameters: prime p, generator g

   Alice (private a)                          Bob (private b)
        |                                            |
        A = g^a mod p   ------ A (public) ---------->|
        |<----------- B (public) ------ B = g^b mod p |
        |                                            |
   K = B^a mod p                                K = A^b mod p
        |                                            |
        +-------------  K = g^(ab) mod p  -----------+
                   (shared secret, identical on both sides)
```

**Why it's secure:** an eavesdropper sees `p`, `g`, `A`, and `B`, but computing `a` from `A = g^a mod p` (or `b` from `B`) requires solving the **discrete logarithm problem (DLP)**, which is computationally infeasible for large `p` — there is no known efficient classical algorithm for it.

**Man-in-the-middle (MITM) vulnerability:** basic DH provides **no authentication** of the two parties. An attacker (Mallory) sitting between Alice and Bob can intercept `A` and `B`, and instead establish **two separate DH exchanges** — one with Alice (as if Mallory were Bob) and one with Bob (as if Mallory were Alice). Both Alice and Bob then compute a shared secret with Mallory, believing it is with each other, allowing Mallory to transparently decrypt, read, and re-encrypt all traffic. **Mitigation:** authenticate the exchanged public values using digital signatures or certificates (e.g., as in authenticated DH / TLS handshake, a Unit III/IV topic) so each party can verify the other's identity before trusting the exchange.

---

### 2.13 Elliptic Curve Cryptography (ECC)

ECC is a public-key approach based on the algebraic structure of **elliptic curves over finite fields**, offering **equivalent security to RSA/DH with much smaller key sizes**.

**Curve equation (Weierstrass form):** `y² = x³ + ax + b (mod p)`, where `p` is a large prime and `4a³ + 27b² ≠ 0 mod p` (ensures the curve has no repeated roots / singular points). The set of points `(x, y)` satisfying this equation, plus a "point at infinity" `O` (acting as the identity element), forms an abelian group under a defined **point addition** operation.

**Point addition (geometric intuition):** to add two distinct points `P` and `Q` on the curve, draw the straight line through them; it intersects the curve at exactly one more point; reflecting that point across the x-axis gives `P + Q`.

**Point doubling:** to compute `P + P = 2P`, draw the **tangent line** at `P`, find its second intersection with the curve, and reflect it across the x-axis.

**Scalar multiplication:** repeated point addition, `kP = P + P + ... + P` (`k` times), computed efficiently via the "double-and-add" method (analogous to square-and-multiply for modular exponentiation). This is the core operation used as the "one-way function" of ECC.

**Elliptic Curve Discrete Logarithm Problem (ECDLP):** given points `P` and `Q = kP` on the curve, it is computationally infeasible to determine `k`. This problem is believed to be **much harder per bit** than the classical discrete log problem or integer factorization, which is why ECC achieves the same security level with far shorter keys.

**Why ECC is used — key size efficiency:**

| Symmetric-equivalent security | RSA/DH key size | ECC key size |
|---|---|---|
| 80-bit | 1024-bit | 160-bit |
| 112-bit | 2048-bit | 224-bit |
| 128-bit | 3072-bit | 256-bit |
| 192-bit | 7680-bit | 384-bit |
| 256-bit | 15360-bit | 521-bit |

Smaller keys mean faster computation, less bandwidth, and lower storage/power requirements — making ECC especially suited to mobile devices, smart cards, and IoT.

**ECDH (Elliptic Curve Diffie–Hellman) — briefly:** works exactly like classical DH but over curve points instead of modular exponentiation. Public parameters: an agreed curve and a base point `G`. Alice picks private scalar `dA`, publishes `QA = dA·G`; Bob picks private scalar `dB`, publishes `QB = dB·G`. Shared secret: Alice computes `dA·QB`, Bob computes `dB·QA`; both equal `dA·dB·G` — identical shared point, whose x-coordinate is used to derive the symmetric session key.

---

## 3. KEY POINTS & COMPARISONS

**Quick revision bullets:**
- Security of a cipher should rely on the key, not the algorithm's secrecy (**Kerckhoffs's Principle**).
- Substitution ciphers change **identity** of symbols; transposition ciphers change **position** of symbols.
- Monoalphabetic ciphers preserve letter frequency → broken by frequency analysis; polyalphabetic (Vigenère) flattens frequency → broken by Kasiski examination.
- Hill cipher is linear → vulnerable to known-plaintext attack even though it defeats basic frequency analysis.
- RSA security = **integer factorization problem**; DH/ECDH security = **discrete logarithm problem** (classical or elliptic-curve variant).
- Public-key crypto solves the `O(n²)` symmetric key-distribution problem by requiring only `O(n)` key pairs.
- DES is a **Feistel cipher** (encryption/decryption use the same structure, only subkey order reverses); AES is a **substitution-permutation network**, not Feistel.
- DES's fatal flaw is **key length (56 bits)**, not its internal round structure — its S-boxes/permutation design has withstood decades of cryptanalysis reasonably well.
- Basic Diffie-Hellman has **no authentication** → vulnerable to MITM; must be paired with signatures/certificates in practice.
- ECC gives RSA-equivalent security with roughly **10–15× smaller keys**.
- Brute-force cost doubles with every extra key bit: keyspace = 2ⁿ.

**Symmetric vs Asymmetric Cryptography:**

| Aspect | Symmetric | Asymmetric |
|---|---|---|
| Keys used | Single shared key for enc/dec | Key pair — public + private |
| Speed | Fast, low computational overhead | Slow, computationally expensive |
| Key distribution | Hard — needs secure channel, `O(n²)` keys for n users | Easy — public key openly shared, `O(n)` key pairs |
| Typical use | Bulk data encryption (DES, AES, RC4, Blowfish) | Key exchange, digital signatures, small data (RSA, DH, ECC) |
| Provides non-repudiation | No | Yes (via digital signatures) |
| Examples | DES, 3DES, AES, RC4, RC5, RC6, Blowfish | RSA, Diffie-Hellman, ECC, ElGamal |

**DES vs 3DES vs AES:**

| Feature | DES | 3DES | AES |
|---|---|---|---|
| Block size | 64 bits | 64 bits | 128 bits |
| Key size | 56 bits (effective) | 112/168 bits (effective ~112) | 128/192/256 bits |
| Structure | Feistel | Feistel (DES applied 3x, EDE) | Substitution-Permutation Network |
| Rounds | 16 | 48 (16×3) | 10/12/14 |
| Speed | Fast but insecure key length | Slower (3x DES operations) | Fast, hardware-accelerated (AES-NI) |
| Status | Broken by brute force (deprecated) | Legacy/deprecated, being phased out | Current standard |

**RC4 vs RC5 vs RC6 vs Blowfish:**

| Cipher | Type | Key size | Block size | Structure | Typical use |
|---|---|---|---|---|---|
| **RC4** | Stream cipher | 40–2048 bits | N/A (byte stream) | KSA + PRGA state permutation | Legacy WEP/SSL (now deprecated) |
| **RC5** | Block cipher | 0–2040 bits (param.) | 32/64/128 bits (param.) | Data-dependent rotations, XOR, mod-addition | Lightweight embedded encryption |
| **RC6** | Block cipher | 128/192/256 bits | 128 bits | RC5-based + integer multiplication, 4 registers | AES finalist, general-purpose |
| **Blowfish** | Block cipher (Feistel) | 32–448 bits | 64 bits | Key-dependent S-boxes + P-array, 16 rounds | Password hashing (bcrypt), file encryption |

**Classical Substitution vs Transposition Ciphers:**

| Aspect | Substitution | Transposition |
|---|---|---|
| Mechanism | Replace symbols with other symbols | Rearrange order of symbols |
| Letter frequency | Changed/hidden (varies by cipher) | Preserved (same letters, different order) |
| Examples | Caesar, Monoalphabetic, Playfair, Hill, Vigenère | Rail Fence, Columnar Transposition |
| Primary weakness | Frequency analysis (mono/Caesar); linear algebra (Hill) | Anagramming, trying different grid widths |
| Combined in practice | Modern ciphers (e.g., DES) combine both as **confusion** (substitution) and **diffusion** (transposition/permutation) | |

---

## 4. NUMERICALS & FORMULAS

**Master formula list:**

- **Caesar cipher:** `C = (P + k) mod 26`; `P = (C − k) mod 26`
- **Vigenère cipher:** `Ci = (Pi + Ki) mod 26` (key repeated cyclically)
- **Hill cipher:** `C = K·P mod 26`; `P = K⁻¹·C mod 26`
- **RSA key generation:** `n = p×q`; `φ(n) = (p−1)(q−1)`; choose `e` with `gcd(e, φ(n)) = 1`; find `d` with `e×d ≡ 1 (mod φ(n))`
- **RSA encryption/decryption:** `C = M^e mod n`; `M = C^d mod n`
- **Diffie-Hellman:** `A = g^a mod p`; `B = g^b mod p`; shared secret `K = B^a mod p = A^b mod p = g^(ab) mod p`
- **Brute-force keyspace:** total keys = `2ⁿ` for an n-bit key; average attempts to find key = `2ⁿ⁻¹`; time to break = `keyspace ÷ attempts-per-second`

---

### Numerical 1 — Full RSA Worked Example

**Step 1 — Choose primes:** `p = 5`, `q = 11`

**Step 2 — Compute modulus:** `n = p × q = 5 × 11 = 55`

**Step 3 — Compute totient:** `φ(n) = (p−1)(q−1) = 4 × 10 = 40`

**Step 4 — Choose public exponent e:** need `1 < e < 40` with `gcd(e, 40) = 1`. Choose `e = 3` (`gcd(3,40)=1` ✓). **Public Key = (e=3, n=55)**

**Step 5 — Compute private exponent d:** need `3d ≡ 1 (mod 40)`. Try `d = 27`: `3 × 27 = 81 = 2×40 + 1 ≡ 1 (mod 40)` ✓. **Private Key = (d=27, n=55)**

**Step 6 — Encrypt message M = 2:**
`C = M^e mod n = 2^3 mod 55 = 8 mod 55 = 8`
**Ciphertext C = 8**

**Step 7 — Decrypt C = 8 back to M (using square-and-multiply since 27 = 16+8+2+1):**
- `8^1 mod 55 = 8`
- `8^2 mod 55 = 64 mod 55 = 9`
- `8^4 mod 55 = 9^2 mod 55 = 81 mod 55 = 26`
- `8^8 mod 55 = 26^2 mod 55 = 676 mod 55 = 16` (55×12=660, 676−660=16)
- `8^16 mod 55 = 16^2 mod 55 = 256 mod 55 = 36` (55×4=220, 256−220=36)
- `8^27 = 8^16 × 8^8 × 8^2 × 8^1 mod 55 = 36 × 16 × 9 × 8 mod 55`
  - `36 × 16 = 576 mod 55 = 26` (55×10=550, 576−550=26)
  - `26 × 9 = 234 mod 55 = 14` (55×4=220, 234−220=14)
  - `14 × 8 = 112 mod 55 = 2` (112−110=2)

**Decrypted M = 2** ✓ (matches original plaintext)

---

### Numerical 2 — Diffie–Hellman Key Exchange

**Given:** prime `p = 23`, primitive root `g = 5`, Alice's private key `a = 6`, Bob's private key `b = 15`.

**Step 1 — Alice computes her public value:** `A = g^a mod p = 5^6 mod 23`
- `5^1 = 5`
- `5^2 = 25 mod 23 = 2`
- `5^3 = 5^2 × 5 = 2×5 = 10`
- `5^6 = (5^3)^2 = 10^2 = 100 mod 23 = 8` (23×4=92, 100−92=8)
**A = 8**

**Step 2 — Bob computes his public value:** `B = g^b mod p = 5^15 mod 23` (15 = 8+4+2+1)
- `5^1=5, 5^2=2, 5^4=2^2=4, 5^8=4^2=16`
- `5^15 = 5^8 × 5^4 × 5^2 × 5^1 = 16×4×2×5 mod 23`
  - `16×4 = 64 mod 23 = 18`
  - `18×2 = 36 mod 23 = 13`
  - `13×5 = 65 mod 23 = 19` (23×2=46, 65−46=19)
**B = 19**

**Step 3 — Alice computes the shared secret:** `K = B^a mod p = 19^6 mod 23`
- `19^2 = 361 mod 23 = 16` (23×15=345, 361−345=16)
- `19^3 = 19^2 × 19 = 16×19 = 304 mod 23 = 5` (23×13=299, 304−299=5)
- `19^6 = (19^3)^2 = 5^2 = 25 mod 23 = 2`
**K = 2**

**Step 4 — Bob computes the shared secret:** `K = A^b mod p = 8^15 mod 23` (15 = 8+4+2+1)
- `8^2 = 64 mod 23 = 18`
- `8^4 = 18^2 = 324 mod 23 = 2` (23×14=322, 324−322=2)
- `8^8 = 2^2 = 4`
- `8^15 = 8^8 × 8^4 × 8^2 × 8^1 = 4×2×18×8 mod 23`
  - `4×2 = 8`
  - `8×18 = 144 mod 23 = 6` (23×6=138, 144−138=6)
  - `6×8 = 48 mod 23 = 2` (48−46=2)
**K = 2**

**Both Alice and Bob independently arrive at the shared secret K = 2** ✓

---

### Numerical 3 — Classical Cipher: Caesar and Vigenère

**Plaintext = `HELLO`**

**(a) Caesar cipher, shift k = 3:** using `C = (P+3) mod 26` (A=0..Z=25)

| Letter | P value | (P+3) mod 26 | C letter |
|---|---|---|---|
| H | 7 | 10 | K |
| E | 4 | 7 | H |
| L | 11 | 14 | O |
| L | 11 | 14 | O |
| O | 14 | 17 | R |

**Caesar Ciphertext = `KHOOR`**

**(b) Vigenère cipher, keyword = `KEY`:** repeat keyword to match length → `K E Y K E`

| Plain (P) | P value | Key (K) | K value | (P+K) mod 26 | Cipher letter |
|---|---|---|---|---|---|
| H | 7 | K | 10 | 17 | R |
| E | 4 | E | 4 | 8 | I |
| L | 11 | Y | 24 | 35 mod 26 = 9 | J |
| L | 11 | K | 10 | 21 | V |
| O | 14 | E | 4 | 18 | S |

**Vigenère Ciphertext = `RIJVS`**

---

### Numerical 4 — Brute-Force Keyspace and Time-to-Break

**Given:** key length = 56 bits (DES), attacker capability = 1 billion (10⁹) key attempts per second.

**Step 1 — Total keyspace:** `2⁵⁶ = 72,057,594,037,927,936` keys (≈ 7.2 × 10¹⁶)

**Step 2 — Worst-case time to try every key:**
`Time = keyspace ÷ rate = 72,057,594,037,927,936 ÷ 1,000,000,000 = 72,057,594.04 seconds`

**Step 3 — Convert to human-readable units:**
- `÷ 60 = 1,200,959.9 minutes`
- `÷ 60 = 20,016.0 hours`
- `÷ 24 = 834.0 days`
- `÷ 365 ≈ 2.28 years` (worst case, trying the entire keyspace)

**Step 4 — Average-case time (expected to find key after searching half the keyspace):**
`Average time ≈ 834 / 2 ≈ 417 days ≈ 1.14 years`

**Conclusion:** at 10⁹ attempts/second, DES's 56-bit key can be exhausted in ~2.3 years worst-case (and this was achievable in **hours** with dedicated cracking hardware/FPGA clusters even in 1998) — this quantitatively demonstrates why 56-bit keys are considered insecure today, and why AES moved to 128+ bit keys (doubling key length to 112 bits alone would already require `2⁵⁶` times longer than this DES estimate).

---

## 5. PREVIOUS YEAR QUESTIONS (PYQs) & MOCK QUESTIONS

**Q1. Explain the RSA algorithm in detail. Given p=5, q=11, e=3, encrypt M=2 and decrypt back.** *(Theory + Numerical, ~10 marks)*
Model-answer outline:
- Define public-key cryptography in one line, state RSA's purpose.
- List key generation steps (n, φ(n), choice of e, computation of d) — write formulas explicitly.
- Write encryption/decryption formulas: `C=M^e mod n`, `M=C^d mod n`.
- Plug in given/chosen numbers, show every modular arithmetic step (use square-and-multiply if exponent is large).
- One line on security basis: hardness of factoring `n` into `p, q`.

**Q2. What is Diffie-Hellman key exchange? Explain the protocol with a diagram and discuss its vulnerability to man-in-the-middle attack. Given p=23, g=5, a=6, b=15, compute the shared secret.** *(Theory + Numerical, ~10 marks)*
Model-answer outline:
- State the purpose: secure shared-secret establishment over an insecure channel.
- Draw/describe the exchange diagram (Alice/Bob public parameter exchange).
- Write the math: `A=g^a mod p`, `B=g^b mod p`, `K=B^a mod p=A^b mod p`.
- Explain security basis: discrete logarithm problem.
- Explain MITM: no authentication → attacker performs two separate exchanges; mention mitigation (signed/certified exchange).
- Solve the given numerical showing all modular exponentiation steps, verify both sides match.

**Q3. Describe the structure of the DES algorithm with a neat diagram. What are its major weaknesses, and how do 3DES and AES address them?** *(Theory, ~10 marks)*
Model-answer outline:
- State DES parameters: 64-bit block, 56-bit effective key, 16 Feistel rounds.
- Draw overall structure: IP → 16 rounds → swap → IP⁻¹.
- Draw/explain one Feistel round: expansion, XOR with subkey, S-box substitution, permutation.
- Briefly explain key schedule: PC-1, left shifts, PC-2 producing 16 subkeys.
- List weaknesses: short 56-bit key (brute-forceable), weak keys, complementation property, meet-in-middle on double-DES.
- One line each on 3DES (EDE, ~112-bit effective security) and AES (SPN, 128/192/256-bit keys) as successors.

**Q4. Differentiate between symmetric and asymmetric key cryptography. Explain the principles of a public-key cryptosystem and how it solves the key distribution problem.** *(Theory, ~7-8 marks)*
Model-answer outline:
- Comparison table: key(s) used, speed, key distribution difficulty, examples.
- Explain the `n(n-1)/2` key distribution problem in symmetric systems.
- List the 4-6 principles required of a secure public-key system (easy key gen, easy encrypt/decrypt with correct key, infeasible to derive private from public, infeasible to decrypt without private key).
- Explain how public-key distribution reduces the problem to `O(n)` key pairs; mention added benefit of digital signatures/non-repudiation.

**Q5. What is cryptanalysis? Explain the different types of cryptanalytic attacks. Also explain the brute-force attack and calculate the time to break a 56-bit key at 10⁹ attempts/second.** *(Theory + Numerical, ~10 marks)*
Model-answer outline:
- Define cryptanalysis vs cryptography (one line each).
- Table/list of the 4 attack types (COA, KPA, CPA, CCA) with one-line definition + example each.
- Define brute-force attack, formula: keyspace = 2ⁿ, average attempts = 2ⁿ⁻¹.
- Compute `2^56`, divide by 10⁹, convert seconds → days → years, state both worst-case and average-case results.
- Conclude with one line linking result to why key length matters (motivates AES over DES).
