// CNS Field Manual — Flashcards. Vanilla JS, no build step, matches app.js's style.
// ponytail: plain array + localStorage, no spaced-repetition scheduler — add SM-2 if daily use outgrows "again/good".

const FLASHCARDS = [
  // Unit I
  { id: "u1-1", unit: 1, front: "What does the CIA triad stand for?", back: "Confidentiality, Integrity, Availability — the three core goals every security control serves." },
  { id: "u1-2", unit: 1, front: "Differentiate a vulnerability from a threat.", back: "A vulnerability is a weakness that could be exploited; a threat is the potential actor/event that could exploit it." },
  { id: "u1-3", unit: 1, front: "Passive vs Active attack — which is easier to detect?", back: "Active attacks are easy to detect (data is altered) but hard to prevent; passive attacks are hard to detect but easy to prevent via encryption." },
  { id: "u1-4", unit: 1, front: "Name the four types of attacks classified by target.", back: "Operating System attacks, Application-level attacks, Shrink-wrap code attacks, Misconfiguration attacks." },
  { id: "u1-5", unit: 1, front: "Signature-based vs anomaly-based IDS — which catches zero-days?", back: "Anomaly-based (flags deviations from a baseline); signature-based only catches known attack patterns." },
  { id: "u1-6", unit: 1, front: "What is a False Negative in IDS terms, and why is it the worst outcome?", back: "A real attack that goes undetected — the breach happens with no alert at all." },
  { id: "u1-7", unit: 1, front: "Difference between Vulnerability Assessment and Penetration Testing?", back: "VA identifies and ranks flaws; PT actively exploits them to prove real-world impact." },
  { id: "u1-8", unit: 1, front: "Black-box vs White-box pentest — which simulates a real external attacker?", back: "Black-box — the tester has zero prior knowledge of the target." },
  { id: "u1-9", unit: 1, front: "What is a System Integrity Verifier (SIV)?", back: "A tool (e.g. Tripwire) that hashes critical files at a known-good state and flags any later mismatch." },
  { id: "u1-10", unit: 1, front: "Formula for Annualized Loss Expectancy (ALE)?", back: "ALE = SLE × ARO, where SLE = Asset Value × Exposure Factor." },

  // Unit II
  { id: "u2-1", unit: 2, front: "What problem does Kerckhoffs's Principle address?", back: "A cipher's security should depend only on the secrecy of the key, never on keeping the algorithm secret." },
  { id: "u2-2", unit: 2, front: "Caesar cipher formula?", back: "C = (P + k) mod 26." },
  { id: "u2-3", unit: 2, front: "Why is the Hill cipher, despite hiding letter frequency, still breakable?", back: "It's linear — a known-plaintext attack can solve for the key matrix via linear algebra." },
  { id: "u2-4", unit: 2, front: "What problem does RSA's security rest on?", back: "The integer factorization problem — factoring n = p×q back into its prime factors." },
  { id: "u2-5", unit: 2, front: "RSA formulas for encryption and decryption?", back: "C = M^e mod n (encrypt); M = C^d mod n (decrypt)." },
  { id: "u2-6", unit: 2, front: "What problem does Diffie-Hellman's security rest on?", back: "The discrete logarithm problem." },
  { id: "u2-7", unit: 2, front: "What is DES's fatal weakness?", back: "Its 56-bit key length — brute-forceable, not its internal Feistel/S-box design." },
  { id: "u2-8", unit: 2, front: "What operation does RC6 add over RC5, and why?", back: "Integer multiplication, to achieve faster diffusion across a word." },
  { id: "u2-9", unit: 2, front: "Why does ECC use much smaller keys than RSA for the same security?", back: "The elliptic-curve discrete logarithm problem is much harder per bit than integer factorization." },
  { id: "u2-10", unit: 2, front: "Basic Diffie-Hellman's core vulnerability?", back: "No authentication — vulnerable to man-in-the-middle unless paired with signatures/certificates." },

  // Unit III
  { id: "u3-1", unit: 3, front: "MAC vs digital signature — which gives non-repudiation?", back: "A MAC uses a shared secret key so either party could have produced it (no non-repudiation); a digital signature uses the sender's private key, giving non-repudiation." },
  { id: "u3-2", unit: 3, front: "What are the three hash function properties?", back: "Pre-image resistance, second pre-image resistance, collision resistance." },
  { id: "u3-3", unit: 3, front: "Why is an n-bit hash only ~n/2-bit collision-resistant?", back: "The birthday paradox — collisions become likely after roughly √(2ⁿ) attempts, not 2ⁿ." },
  { id: "u3-4", unit: 3, front: "Why is MD5 considered broken?", back: "Practical collision attacks (Wang et al., 2004) and chosen-prefix collisions (exploited by Flame malware) make it trivially forgeable." },
  { id: "u3-5", unit: 3, front: "In Kerberos, does the client ever send its password to the AS?", back: "No — only the client ID and requested service ID in the clear; the password never crosses the network." },
  { id: "u3-6", unit: 3, front: "What's the single biggest limitation of Kerberos's architecture?", back: "The KDC is a single point of failure and a single point of attack." },
  { id: "u3-7", unit: 3, front: "What does a TLS certificate actually authenticate?", back: "The server's identity, via a CA-signed binding of public key to domain, preventing MITM." },
  { id: "u3-8", unit: 3, front: "SSH vs SSL/TLS — how does each usually verify the server?", back: "SSH uses a host-key fingerprint (trust-on-first-use); SSL/TLS uses a CA-based X.509 certificate chain." },
  { id: "u3-9", unit: 3, front: "ElGamal signature — what must never be reused across signatures?", back: "The random ephemeral key k — reusing it leaks the private key." },
  { id: "u3-10", unit: 3, front: "What is the \"chain of trust\" in PKI?", back: "Root CA signs Intermediate CA, which signs the end-entity certificate; a verifier walks this chain back to an already-trusted Root CA." },

  // Unit IV
  { id: "u4-1", unit: 4, front: "Core distinguishing trait: virus vs worm?", back: "A virus needs a host file and user action to spread; a worm is standalone and self-propagates over the network automatically." },
  { id: "u4-2", unit: 4, front: "What is a covert channel?", back: "A communication path that abuses unintended protocol fields/resources to hide data or commands from monitoring tools." },
  { id: "u4-3", unit: 4, front: "What enables sniffing on a switched network?", back: "ARP spoofing — forged gratuitous ARP replies poison the ARP cache, redirecting traffic through the attacker (MITM)." },
  { id: "u4-4", unit: 4, front: "Name three cleartext protocols vulnerable to sniffing.", back: "Telnet, FTP, and HTTP (also SNMP v1/v2c and POP3) — all send credentials unencrypted." },
  { id: "u4-5", unit: 4, front: "What's the general phishing process?", back: "Bait → Hook → Catch." },
  { id: "u4-6", unit: 4, front: "DNS-based phishing is also known as?", back: "Pharming." },
  { id: "u4-7", unit: 4, front: "Reflected vs Stored XSS — which needs a crafted link click?", back: "Reflected XSS (payload is in the request); Stored XSS is saved server-side and fires for every viewer automatically." },
  { id: "u4-8", unit: 4, front: "How do parameterized queries stop SQL injection?", back: "User input is bound as literal data, separate from the query structure, so it can never be reinterpreted as SQL code." },
  { id: "u4-9", unit: 4, front: "What does a Smurf attack exploit?", back: "ICMP broadcast amplification — spoofed pings to a broadcast address make every host on that network flood the victim with replies." },
  { id: "u4-10", unit: 4, front: "Spoofing vs Hijacking — what's the timing difference?", back: "Spoofing fakes an identity before a session exists; hijacking seizes an already-authenticated, live session." },

  // Unit V
  { id: "u5-1", unit: 5, front: "AH vs ESP in IPSec — which provides confidentiality?", back: "ESP (encryption); AH provides only integrity and authentication, no encryption." },
  { id: "u5-2", unit: 5, front: "Transport mode vs Tunnel mode — which hides the original source/destination IP?", back: "Tunnel mode (wraps the whole original packet in a new outer IP header); Transport mode keeps the original header." },
  { id: "u5-3", unit: 5, front: "What's the #1 firewall design principle?", back: "Default-deny (fail-safe defaults) — block everything unless explicitly allowed." },
  { id: "u5-4", unit: 5, front: "What sits in a DMZ, and why two firewalls?", back: "Public-facing servers (web/mail/DNS); the external firewall faces the internet, the internal firewall protects the trusted LAN even if a DMZ server is compromised." },
  { id: "u5-5", unit: 5, front: "What are the six stages of a forensic investigation?", back: "Identification → Preservation → Collection → Examination → Analysis → Presentation/Reporting." },
  { id: "u5-6", unit: 5, front: "How does incident handling differ from forensic investigation?", back: "Forensics is about legally sound evidence handling; incident handling is the operational response lifecycle (Preparation → Identification → Containment → Eradication → Recovery → Lessons Learned)." },
  { id: "u5-7", unit: 5, front: "Difference between a Grey Hat and a White Hat hacker?", back: "A White Hat has explicit authorization; a Grey Hat probes/exploits without authorization but without malicious intent." },
  { id: "u5-8", unit: 5, front: "Footprinting vs Scanning — which is passive?", back: "Footprinting (no direct contact with the target); Scanning actively probes the target." },
  { id: "u5-9", unit: 5, front: "What's the final step of the System Hacking Cycle, and its defensive mirror in a pentest?", back: "Clearing Tracks (attacker) mirrors Reporting (pentester) — same 5-stage cycle, opposite final intent." },
  { id: "u5-10", unit: 5, front: "What three properties must a Reference Monitor satisfy?", back: "Complete mediation, tamper-proof isolation, and verifiability (small enough to be fully analyzed)." },
];

(function () {
  const PROGRESS_KEY = "cns-flashcard-progress";
  const getProgress = () => { try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; } catch { return {}; } };
  const saveProgress = (p) => localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));

  let filterUnit = "all";
  let deck = FLASHCARDS;
  let index = 0;
  let flipped = false;

  const els = {};

  function applyFilter(unit) {
    filterUnit = unit;
    deck = unit === "all" ? FLASHCARDS : FLASHCARDS.filter((c) => String(c.unit) === String(unit));
    index = 0;
    flipped = false;
    document.querySelectorAll(".flash-filters button").forEach((b) => b.classList.toggle("active", b.dataset.unit === String(unit)));
    render();
  }

  function render() {
    const card = deck[index];
    if (!card) return;
    els.front.textContent = card.front;
    els.back.textContent = card.back;
    els.cardEl.classList.toggle("flipped", flipped);
    els.eyebrow.textContent = `Unit ${card.unit} · Card ${index + 1} of ${deck.length}`;
    els.progress.textContent = `${index + 1} / ${deck.length}`;

    const progress = getProgress();
    const stats = {
      total: FLASHCARDS.length,
      reviewed: Object.keys(progress).length,
      mastered: Object.values(progress).filter((p) => p.correct >= 2).length,
    };
    els.statTotal.textContent = stats.total;
    els.statReviewed.textContent = stats.reviewed;
    els.statMastered.textContent = stats.mastered;
  }

  function flip() {
    flipped = !flipped;
    els.cardEl.classList.toggle("flipped", flipped);
  }

  function next() { index = (index + 1) % deck.length; flipped = false; render(); }
  function prev() { index = (index - 1 + deck.length) % deck.length; flipped = false; render(); }

  function mark(correct) {
    const card = deck[index];
    const progress = getProgress();
    const entry = progress[card.id] || { correct: 0, seen: 0 };
    entry.seen += 1;
    entry.correct = correct ? entry.correct + 1 : 0;
    progress[card.id] = entry;
    saveProgress(progress);
    next();
  }

  function init() {
    els.cardEl = document.getElementById("flashCard");
    els.front = document.getElementById("flashFront");
    els.back = document.getElementById("flashBack");
    els.eyebrow = document.getElementById("flashEyebrow");
    els.progress = document.getElementById("flashProgress");
    els.statTotal = document.getElementById("statTotal");
    els.statReviewed = document.getElementById("statReviewed");
    els.statMastered = document.getElementById("statMastered");
    if (!els.cardEl) return;

    els.cardEl.addEventListener("click", flip);
    els.cardEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
    });

    document.getElementById("flashPrev").addEventListener("click", prev);
    document.getElementById("flashNext").addEventListener("click", next);
    document.getElementById("flashAgain").addEventListener("click", () => mark(false));
    document.getElementById("flashGood").addEventListener("click", () => mark(true));

    document.querySelectorAll(".flash-filters button").forEach((b) => {
      b.addEventListener("click", () => applyFilter(b.dataset.unit));
    });

    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
