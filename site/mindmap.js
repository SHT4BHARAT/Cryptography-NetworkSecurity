// CNS Field Manual — Mind Map ("the evidence board"). Vanilla SVG + positioned
// divs, no charting/graph library and no WebGL — 25 nodes doesn't need one.
// Coordinates are in a 0-100 space shared by the SVG viewBox and the node
// left/top percentages, so they always line up regardless of container size.

const NODES = [
  { id: "course", label: "Cryptography & Network Security", group: "core", hub: true, x: 50, y: 50,
    href: "index.html",
    desc: "The complete course: five case files covering intrusion defense, cryptographic algorithms, authentication protocols, attack techniques, and network security architecture.",
    related: ["ids", "rsa", "digitalSignature", "malware", "firewall"] },

  { id: "ids", label: "Intrusion Detection (IDS)", group: "fundamentals", hub: true, unit: 1, x: 14, y: 15,
    href: "unit1.html#2-4-intrusion-detection",
    desc: "Monitors traffic for known attack signatures or anomalous behavior — the core defensive sensor of Unit I.",
    related: ["course", "cia", "pentest", "siv", "firewall"] },
  { id: "cia", label: "CIA Triad", group: "fundamentals", unit: 1, x: 28, y: 8,
    href: "unit1.html#2-2-security-terminologies-principles",
    desc: "Confidentiality, Integrity, Availability — the three goals every security control ultimately serves.",
    related: ["ids"] },
  { id: "pentest", label: "Penetration Testing", group: "fundamentals", unit: 1, x: 6, y: 32,
    href: "unit1.html#2-7-penetration-testing",
    desc: "Authorized, simulated attacks that actively exploit discovered weaknesses to prove real-world impact — goes beyond just finding flaws.",
    related: ["ids", "riskmgmt", "hacking"] },
  { id: "siv", label: "System Integrity Verifier", group: "fundamentals", unit: 1, x: 30, y: 30,
    href: "unit1.html#2-4-intrusion-detection",
    desc: "A specialized HIDS component (e.g. Tripwire) that hashes critical files at a known-good state and flags any later mismatch.",
    related: ["ids"] },
  { id: "riskmgmt", label: "Risk Management", group: "fundamentals", unit: 1, x: 16, y: 42,
    href: "unit1.html#2-8-risk-management",
    desc: "Identify assets and threats, assess risk quantitatively (ALE = SLE × ARO), then avoid, mitigate, transfer, or accept.",
    related: ["pentest"] },

  { id: "rsa", label: "RSA", group: "cryptography", hub: true, unit: 2, x: 46, y: 8,
    href: "unit2.html#2-5-rsa-algorithm",
    desc: "The most widely used public-key cryptosystem — security rests on the difficulty of factoring the product of two large primes.",
    related: ["course", "dh", "des", "ecc", "cryptanalysis", "digitalSignature"] },
  { id: "dh", label: "Diffie-Hellman", group: "cryptography", unit: 2, x: 62, y: 5,
    href: "unit2.html#2-12-diffie-hellman-dh-key-exchange",
    desc: "Lets two parties derive a shared secret over an insecure channel; security rests on the discrete logarithm problem — but offers no built-in authentication.",
    related: ["rsa"] },
  { id: "des", label: "DES", group: "cryptography", unit: 2, x: 34, y: 18,
    href: "unit2.html#2-6-data-encryption-standard-des",
    desc: "A 16-round Feistel block cipher with a 64-bit block and only a 56-bit effective key — broken by brute force, not by design flaw.",
    related: ["rsa"] },
  { id: "ecc", label: "Elliptic Curve Crypto", group: "cryptography", unit: 2, x: 64, y: 20,
    href: "unit2.html#2-13-elliptic-curve-cryptography-ecc",
    desc: "Achieves RSA-equivalent security with far smaller keys, because the elliptic-curve discrete log problem is much harder per bit.",
    related: ["rsa"] },
  { id: "cryptanalysis", label: "Cryptanalysis & Classical Ciphers", group: "cryptography", unit: 2, x: 50, y: 28,
    href: "unit2.html#2-3-cryptanalysis-and-code-breaking-methodologies",
    desc: "The science of breaking ciphers — from frequency analysis on Caesar/Vigenère to brute force on modern block ciphers.",
    related: ["rsa"] },

  { id: "digitalSignature", label: "Digital Signature", group: "authentication", hub: true, unit: 3, x: 80, y: 14,
    href: "unit3.html#2-11-digital-signatures-full-analysis",
    desc: "Sign with a private key, verify with the matching public key — gives integrity, authentication, and non-repudiation that a plain MAC cannot.",
    related: ["course", "hash", "kerberos", "ssl", "cert", "rsa"] },
  { id: "hash", label: "Hash Functions", group: "authentication", unit: 3, x: 93, y: 8,
    href: "unit3.html#2-1-hash-functions",
    desc: "One-way functions producing a fixed digest; collision resistance is bounded by the birthday paradox, not brute force.",
    related: ["digitalSignature"] },
  { id: "kerberos", label: "Kerberos", group: "authentication", unit: 3, x: 69, y: 22,
    href: "unit3.html#2-6-kerberos",
    desc: "A ticket-based authentication protocol where passwords never touch the network — only keys derived from them.",
    related: ["digitalSignature"] },
  { id: "ssl", label: "SSL / TLS", group: "authentication", unit: 3, x: 95, y: 28,
    href: "unit3.html#2-7-ssl-secure-sockets-layer-tls",
    desc: "Handshake protocol that negotiates a shared secret and authenticates the server via a CA-signed certificate.",
    related: ["digitalSignature", "cert"] },
  { id: "cert", label: "Digital Certificates", group: "authentication", unit: 3, x: 78, y: 34,
    href: "unit3.html#2-12-digital-certificates-x-509",
    desc: "X.509 documents binding a public key to an identity, signed by a CA — verified via a chain of trust back to a Root CA.",
    related: ["digitalSignature", "ssl"] },

  { id: "malware", label: "Malware & Web Attacks", group: "attacks", hub: true, unit: 4, x: 18, y: 70,
    href: "unit4.html#2-1-trojans-and-backdoors",
    desc: "Trojans, viruses, and worms that compromise a host, feeding the broader web/network attack surface covered in Unit IV.",
    related: ["course", "phishing", "dos", "xss", "sniffing"] },
  { id: "phishing", label: "Phishing", group: "attacks", unit: 4, x: 6, y: 82,
    href: "unit4.html#2-4-phishing",
    desc: "Social engineering via Bait → Hook → Catch — nine variants differ mainly in delivery/deception mechanism.",
    related: ["malware"] },
  { id: "dos", label: "DoS / DDoS", group: "attacks", unit: 4, x: 32, y: 64,
    href: "unit4.html#2-6-denial-of-service-dos-attacks",
    desc: "Exhausts a finite resource — bandwidth, CPU, memory, or the TCP backlog queue — to deny service to legitimate users.",
    related: ["malware", "firewall"] },
  { id: "xss", label: "XSS & SQL Injection", group: "attacks", unit: 4, x: 36, y: 86,
    href: "unit4.html#2-5-web-application-security",
    desc: "XSS injects script into the browser; SQL injection injects query syntax into the database — both stem from unsanitized input.",
    related: ["malware"] },
  { id: "sniffing", label: "Sniffing & Spoofing", group: "attacks", unit: 4, x: 9, y: 60,
    href: "unit4.html#2-3-sniffers",
    desc: "ARP spoofing redirects switched traffic through the attacker, enabling eavesdropping on cleartext protocols like Telnet and FTP.",
    related: ["malware"] },

  { id: "firewall", label: "Firewalls & IPSec", group: "defense", hub: true, unit: 5, x: 76, y: 70,
    href: "unit5.html#2-3-firewalls",
    desc: "The network's choke point — a default-deny rule set enforced between trust zones, from packet filters to next-gen DPI.",
    related: ["course", "forensics", "hacking", "ipsec", "ids", "dos"] },
  { id: "forensics", label: "Computer Forensics", group: "defense", unit: 5, x: 92, y: 80,
    href: "unit5.html#2-4-computer-forensics",
    desc: "The evidence-handling lifecycle — Identification, Preservation, Collection, Examination, Analysis, Presentation — kept legally admissible via chain of custody.",
    related: ["firewall"] },
  { id: "hacking", label: "Hacking Lifecycle", group: "defense", unit: 5, x: 64, y: 85,
    href: "unit5.html#2-5-hacking",
    desc: "Reconnaissance → Scanning → Gaining Access → Maintaining Access → Clearing Tracks — the same cycle a pentest mirrors, minus the cover-up.",
    related: ["firewall", "pentest"] },
  { id: "ipsec", label: "IPSec", group: "defense", unit: 5, x: 90, y: 62,
    href: "unit5.html#2-1-ip-security-ipsec",
    desc: "Network-layer security via AH (integrity only) or ESP (confidentiality); Tunnel mode wraps the whole packet for site-to-site VPNs.",
    related: ["firewall"] },
];

const GROUP_COLORS = {
  core: "var(--paper)",
  fundamentals: "var(--red)",
  cryptography: "var(--amber)",
  authentication: "var(--teal)",
  attacks: "var(--violet)",
  defense: "var(--blue)",
};

(function () {
  const byId = new Map(NODES.map((n) => [n.id, n]));
  const edges = [];
  const seen = new Set();
  NODES.forEach((n) => {
    (n.related || []).forEach((rid) => {
      const key = [n.id, rid].sort().join("|");
      if (seen.has(key) || !byId.has(rid)) return;
      seen.add(key);
      edges.push([n.id, rid]);
    });
  });

  let activeId = "course";

  function renderBoard() {
    const svg = document.getElementById("mmSvg");
    const board = document.getElementById("mmBoard");
    svg.innerHTML = edges
      .map(([a, b]) => {
        const na = byId.get(a), nb = byId.get(b);
        const lit = a === activeId || b === activeId;
        return `<line x1="${na.x}" y1="${na.y}" x2="${nb.x}" y2="${nb.y}" class="${lit ? "lit" : ""}" data-a="${a}" data-b="${b}"></line>`;
      })
      .join("");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");

    board.querySelectorAll(".node").forEach((el) => el.remove());
    NODES.forEach((n) => {
      const el = document.createElement("div");
      el.className = "node" + (n.hub ? " hub" : "") + (n.id === activeId ? " active" : "");
      el.style.left = n.x + "%";
      el.style.top = n.y + "%";
      el.dataset.group = n.group;
      el.textContent = n.label;
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.addEventListener("click", () => selectNode(n.id));
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectNode(n.id); }
      });
      board.appendChild(el);
    });
  }

  function selectNode(id) {
    activeId = id;
    const node = byId.get(id);
    if (!node) return;

    document.querySelectorAll(".node").forEach((el) => {
      el.classList.toggle("active", el.textContent === node.label);
    });
    document.querySelectorAll("#mmSvg line").forEach((line) => {
      line.classList.toggle("lit", line.dataset.a === id || line.dataset.b === id);
    });

    document.getElementById("mmLabel").textContent = node.label;
    document.getElementById("mmGroup").textContent = node.group + (node.unit ? ` · Unit ${node.unit}` : "");
    document.getElementById("mmDesc").textContent = node.desc;

    const openLink = document.getElementById("mmOpen");
    openLink.href = node.href;

    const relatedWrap = document.getElementById("mmRelated");
    const relatedIds = new Set(node.related || []);
    edges.forEach(([a, b]) => {
      if (a === id) relatedIds.add(b);
      if (b === id) relatedIds.add(a);
    });
    relatedWrap.innerHTML = "";
    Array.from(relatedIds).forEach((rid) => {
      const rn = byId.get(rid);
      if (!rn) return;
      const btn = document.createElement("button");
      btn.textContent = rn.label;
      btn.addEventListener("click", () => selectNode(rid));
      relatedWrap.appendChild(btn);
    });
  }

  function wireSearch() {
    const input = document.getElementById("mmSearch");
    const results = document.getElementById("mmResults");
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      if (!q) { results.innerHTML = ""; results.hidden = true; return; }
      const matches = NODES.filter((n) => n.label.toLowerCase().includes(q) || n.desc.toLowerCase().includes(q));
      results.innerHTML = matches
        .map((n) => `<button data-id="${n.id}">${n.label}</button>`)
        .join("") || "<button disabled>No matches</button>";
      results.hidden = false;
      results.querySelectorAll("button[data-id]").forEach((b) => {
        b.addEventListener("click", () => {
          selectNode(b.dataset.id);
          input.value = "";
          results.hidden = true;
        });
      });
    });
    document.addEventListener("click", (e) => {
      if (!results.contains(e.target) && e.target !== input) results.hidden = true;
    });
  }

  function renderLegend() {
    const legend = document.getElementById("mmLegend");
    legend.innerHTML = Object.entries(GROUP_COLORS)
      .map(([g, c]) => `<span><i style="background:${c}"></i>${g}</span>`)
      .join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("mmBoard")) return;
    renderLegend();
    renderBoard();
    selectNode("course");
    wireSearch();
  });
})();
