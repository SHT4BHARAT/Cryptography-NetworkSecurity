// CNS Workbench Tools Logic

// Helper: Greatest Common Divisor
function gcd(a, b) {
  while (b) {
    let t = b;
    b = a % b;
    a = t;
  }
  return a;
}

// Helper: Extended Euclidean Algorithm (returns [gcd, x, y] such that ax + by = gcd)
function extGCD(a, b) {
  if (b === 0) return [a, 1, 0];
  const [g, x1, y1] = extGCD(b, a % b);
  return [g, y1, x1 - Math.floor(a / b) * y1];
}

// Helper: Modular Inverse (d = e^-1 mod phi)
function modInverse(e, phi) {
  const [g, x] = extGCD(e, phi);
  if (g !== 1) return null;
  return ((x % phi) + phi) % phi;
}

// Helper: Fast Modular Exponentiation (base^exp mod mod) using BigInt
function modExp(base, exp, mod) {
  let res = 1n;
  let b = BigInt(base);
  let e = BigInt(exp);
  let m = BigInt(mod);
  b = b % m;
  while (e > 0n) {
    if (e % 2n === 1n) res = (res * b) % m;
    e = e / 2n;
    b = (b * b) % m;
  }
  return Number(res);
}

// Helper: Simple Primality Test
function isPrime(n) {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

// --- 1. RSA CALCULATOR ---
function runRSA() {
  const p = parseInt(document.getElementById("rsa-p").value, 10);
  const q = parseInt(document.getElementById("rsa-q").value, 10);
  const e = parseInt(document.getElementById("rsa-e").value, 10);
  const M = parseInt(document.getElementById("rsa-m").value, 10);
  const out = document.getElementById("rsa-result");

  if (isNaN(p) || isNaN(q) || isNaN(e) || isNaN(M)) {
    out.innerHTML = "<span style='color:var(--red);'>Error: All inputs must be valid integers.</span>";
    return;
  }
  if (!isPrime(p) || !isPrime(q)) {
    out.innerHTML = `<span style='color:var(--red);'>Warning: p (${p}) and q (${q}) should be prime numbers for RSA.</span>`;
  }

  const n = p * q;
  const phi = (p - 1) * (q - 1);

  if (gcd(e, phi) !== 1) {
    out.innerHTML = `<span style='color:var(--red);'>Error: e (${e}) is not coprime to φ(n) (${phi}). gcd(${e}, ${phi}) = ${gcd(e, phi)}. Pick another e.</span>`;
    return;
  }

  const d = modInverse(e, phi);
  if (!d) {
    out.innerHTML = `<span style='color:var(--red);'>Error: Unable to compute modular inverse d.</span>`;
    return;
  }

  if (M >= n) {
    out.innerHTML = `<span style='color:var(--red);'>Error: Message M (${M}) must be strictly smaller than modulus n (${n}).</span>`;
    return;
  }

  const C = modExp(M, e, n);
  const decryptedM = modExp(C, d, n);

  out.innerHTML = `
    <div class="step-line">Step 1: Compute Modulus <strong>n = p × q</strong> = ${p} × ${q} = <span class="highlight">${n}</span></div>
    <div class="step-line">Step 2: Euler's Totient <strong>φ(n) = (p-1)(q-1)</strong> = ${p - 1} × ${q - 1} = <span class="highlight">${phi}</span></div>
    <div class="step-line">Step 3: Public Exponent <strong>e = ${e}</strong> (Verified coprime with φ(n))</div>
    <div class="step-line">Step 4: Private Key <strong>d = e⁻¹ mod φ(n)</strong> = <span class="highlight">${d}</span></div>
    <div class="step-line">Step 5: Public Key = <strong>(${e}, ${n})</strong> | Private Key = <strong>(${d}, ${n})</strong></div>
    <hr style="border-color:var(--navy-3); margin:0.6rem 0;">
    <div class="step-line">Encryption: <strong>C = Mᵉ mod n</strong> = ${M}<sup>${e}</sup> mod ${n} = <span class="highlight" style="color:var(--amber); font-size:1.1em;">${C}</span></div>
    <div class="step-line">Decryption: <strong>M = Cᵈ mod n</strong> = ${C}<sup>${d}</sup> mod ${n} = <span class="highlight" style="color:var(--teal); font-size:1.1em;">${decryptedM}</span> ${decryptedM === M ? "✓ (Verified Correct)" : "✗ Error"}</div>
  `;
}

// --- 2. DIFFIE-HELLMAN SIMULATOR ---
function runDH() {
  const p = parseInt(document.getElementById("dh-p").value, 10);
  const g = parseInt(document.getElementById("dh-g").value, 10);
  const a = parseInt(document.getElementById("dh-a").value, 10);
  const b = parseInt(document.getElementById("dh-b").value, 10);
  const out = document.getElementById("dh-result");

  if (isNaN(p) || isNaN(g) || isNaN(a) || isNaN(b)) {
    out.innerHTML = "<span style='color:var(--red);'>Error: All inputs must be integers.</span>";
    return;
  }

  const A = modExp(g, a, p); // Alice Public Key
  const B = modExp(g, b, p); // Bob Public Key

  const secretAlice = modExp(B, a, p);
  const secretBob = modExp(A, b, p);

  const match = secretAlice === secretBob;

  out.innerHTML = `
    <div class="step-line">Public Parameters: Prime <strong>p = ${p}</strong>, Generator <strong>g = ${g}</strong></div>
    <div class="step-line">Alice computes Public Key: <strong>A = gᵃ mod p</strong> = ${g}<sup>${a}</sup> mod ${p} = <span class="highlight" style="color:var(--amber);">${A}</span></div>
    <div class="step-line">Bob computes Public Key: <strong>B = gᵇ mod p</strong> = ${g}<sup>${b}</sup> mod ${p} = <span class="highlight" style="color:var(--amber);">${B}</span></div>
    <div class="step-line"><em>[Alice & Bob exchange A and B over public network]</em></div>
    <div class="step-line">Alice calculates Shared Secret: <strong>S_Alice = Bᵃ mod p</strong> = ${B}<sup>${a}</sup> mod ${p} = <span class="highlight" style="color:var(--teal); font-size:1.1em;">${secretAlice}</span></div>
    <div class="step-line">Bob calculates Shared Secret: <strong>S_Bob = Aᵇ mod p</strong> = ${A}<sup>${b}</sup> mod ${p} = <span class="highlight" style="color:var(--teal); font-size:1.1em;">${secretBob}</span></div>
    <div class="step-line">${match ? "✓ <strong>SUCCESS: Both parties share identical secret key!</strong>" : "✗ Error: Secret mismatch"}</div>
  `;
}

// --- 3. CLASSIC CIPHERS (Caesar & Vigenère) ---
function runClassic(encrypt = true) {
  const mode = document.getElementById("classic-mode").value;
  const text = document.getElementById("classic-text").value.toUpperCase();
  const out = document.getElementById("classic-result");

  if (mode === "caesar") {
    const shift = (parseInt(document.getElementById("caesar-shift").value, 10) || 0) % 26;
    const finalShift = encrypt ? shift : (26 - shift) % 26;
    let res = "";
    for (let char of text) {
      if (char >= "A" && char <= "Z") {
        const code = ((char.charCodeAt(0) - 65 + finalShift) % 26) + 65;
        res += String.fromCharCode(code);
      } else {
        res += char;
      }
    }
    out.innerHTML = `<strong>Mode:</strong> Caesar Cipher (${encrypt ? "Encryption" : "Decryption"}, Shift = ${shift})<br><strong>Result:</strong> <span style="color:var(--amber); font-size:1.15em;">${res}</span>`;
  } else {
    const key = document.getElementById("vigenere-key").value.toUpperCase().replace(/[^A-Z]/g, "");
    if (!key) {
      out.innerHTML = "<span style='color:var(--red);'>Error: Keyword must contain alphabetic letters.</span>";
      return;
    }
    let res = "";
    let keyIdx = 0;
    for (let char of text) {
      if (char >= "A" && char <= "Z") {
        const kShift = key.charCodeAt(keyIdx % key.length) - 65;
        const finalShift = encrypt ? kShift : (26 - kShift) % 26;
        const code = ((char.charCodeAt(0) - 65 + finalShift) % 26) + 65;
        res += String.fromCharCode(code);
        keyIdx++;
      } else {
        res += char;
      }
    }
    out.innerHTML = `<strong>Mode:</strong> Vigenère Cipher (${encrypt ? "Encryption" : "Decryption"}, Keyword = "${key}")<br><strong>Result:</strong> <span style="color:var(--amber); font-size:1.15em;">${res}</span>`;
  }
}

// --- 4. HASH & SIGNATURE SIMULATOR ---
async function runHashSignature() {
  const text = document.getElementById("hash-text").value;
  const out = document.getElementById("hash-result");

  if (!text) {
    out.innerHTML = "<span style='color:var(--red);'>Error: Please enter text to hash and sign.</span>";
    return;
  }

  // Use Web Crypto API for real SHA-256 hash if available, fallback to custom hash
  let hashHex = "";
  if (window.crypto && window.crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback hash simulation
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    hashHex = Math.abs(hash).toString(16).padStart(64, 'a');
  }

  // Simulate RSA Signing on the Hash
  const hashInt = parseInt(hashHex.substring(0, 4), 16) % 3127; // taking subset for small RSA
  const p = 61, q = 53, n = 3233, e = 17, d = 2753;
  const sig = modExp(hashInt, d, n);
  const verifiedHashInt = modExp(sig, e, n);

  out.innerHTML = `
    <div class="step-line">Message Digest (SHA-256): <span style="color:var(--amber); word-break:break-all;">${hashHex}</span></div>
    <div class="step-line">Truncated Digest for Signing: <strong>${hashInt}</strong></div>
    <div class="step-line">Sender Signs Digest using Private Key d (${d}): <strong>Signature S = Digestᵈ mod n</strong> = <span class="highlight" style="color:var(--teal); font-size:1.1em;">${sig}</span></div>
    <div class="step-line">Receiver Verifies Signature using Public Key e (${e}): <strong>Digest' = Sᵉ mod n</strong> = <span class="highlight">${verifiedHashInt}</span></div>
    <div class="step-line">${verifiedHashInt === hashInt ? "✓ <strong>DIGITAL SIGNATURE VALID: Message Integrity & Non-Repudiation Verified!</strong>" : "✗ Invalid Signature"}</div>
  `;
}

// Event Listeners & Tab Switching
document.addEventListener("DOMContentLoaded", () => {
  // Tab Switching
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tool-card").forEach(c => c.style.display = "none");
      btn.classList.add("active");
      const targetId = btn.dataset.target;
      document.getElementById(targetId).style.display = "block";
    });
  });

  // Cipher Mode Toggle in Classic Ciphers
  const modeSelect = document.getElementById("classic-mode");
  if (modeSelect) {
    modeSelect.addEventListener("change", (e) => {
      const isCaesar = e.target.value === "caesar";
      document.getElementById("caesar-key-group").style.display = isCaesar ? "block" : "none";
      document.getElementById("vigenere-key-group").style.display = isCaesar ? "none" : "block";
    });
  }

  // Button Listeners
  document.getElementById("btn-rsa-calc")?.addEventListener("click", runRSA);
  document.getElementById("btn-dh-calc")?.addEventListener("click", runDH);
  document.getElementById("btn-classic-encrypt")?.addEventListener("click", () => runClassic(true));
  document.getElementById("btn-classic-decrypt")?.addEventListener("click", () => runClassic(false));
  document.getElementById("btn-hash-calc")?.addEventListener("click", runHashSignature);
});
