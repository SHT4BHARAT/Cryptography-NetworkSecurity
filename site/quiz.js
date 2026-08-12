// CNS Quiz & Exam Simulator Engine

const QUIZ_QUESTIONS = [
  // --- UNIT 1 ---
  {
    unit: 1,
    unitTitle: "UNIT I",
    question: "Which security service ensures that data is protected against unauthorized modification or tampering?",
    options: ["Confidentiality", "Integrity", "Availability", "Non-repudiation"],
    answer: 1,
    explanation: "<strong>Integrity</strong> ensures data is protected against unauthorized creation, alteration, or deletion. Confidentiality protects privacy, Availability ensures access, and Non-repudiation prevents denial of an action."
  },
  {
    unit: 1,
    unitTitle: "UNIT I",
    question: "What is the primary operational difference between a Signature-based NIDS and an Anomaly-based NIDS?",
    options: [
      "Signature NIDS inspects encrypted traffic, Anomaly NIDS cannot",
      "Signature NIDS matches known attack patterns, while Anomaly NIDS detects deviations from a baseline profile",
      "Anomaly NIDS requires zero configuration, while Signature NIDS requires manual AI tuning",
      "Signature NIDS operates at Layer 3, while Anomaly NIDS operates exclusively at Layer 7"
    ],
    answer: 1,
    explanation: "<strong>Signature-based NIDS</strong> looks for known byte sequences or patterns (signatures). <strong>Anomaly-based NIDS</strong> establishes a statistical baseline of normal activity and flags significant deviations (ideal for zero-day attacks)."
  },
  {
    unit: 1,
    unitTitle: "UNIT I",
    question: "During Penetration Testing, what does the 'Black Box' testing methodology signify?",
    options: [
      "Tester has full internal access to source code and network diagrams",
      "Tester has partial knowledge of credentials and internal schema",
      "Tester has zero prior knowledge of the target's internal infrastructure",
      "Testing is restricted strictly to hardware appliances"
    ],
    answer: 2,
    explanation: "In <strong>Black Box testing</strong>, the pentester mimics an external attacker with zero insider knowledge of internal architecture."
  },
  {
    unit: 1,
    unitTitle: "UNIT I",
    question: "In Quantitative Risk Assessment, how is Annualized Loss Expectancy (ALE) calculated?",
    options: [
      "ALE = Single Loss Expectancy (SLE) × Annualized Rate of Occurrence (ARO)",
      "ALE = Asset Value (AV) ÷ Exposure Factor (EF)",
      "ALE = Exposure Factor (EF) × Threat Probability",
      "ALE = SLE ÷ ARO"
    ],
    answer: 0,
    explanation: "<strong>ALE = SLE × ARO</strong>, where SLE = Asset Value × Exposure Factor. This measures the projected financial loss of a risk per year."
  },
  {
    unit: 1,
    unitTitle: "UNIT I",
    question: "Which passive attack involves capturing traffic without modifying the transmitted messages?",
    options: ["Masquerade", "Replay Attack", "Eavesdropping / Release of Message Contents", "Denial of Service"],
    answer: 2,
    explanation: "<strong>Eavesdropping</strong> (traffic analysis or packet sniffing) is a passive attack because it reads data without altering system resources or traffic flow."
  },

  // --- UNIT 2 ---
  {
    unit: 2,
    unitTitle: "UNIT II",
    question: "In RSA encryption with p = 61 and q = 53, what is the value of Euler's totient function φ(n)?",
    options: ["3233", "3120", "3172", "3000"],
    answer: 1,
    explanation: "<strong>φ(n) = (p - 1)(q - 1)</strong> = (61 - 1)(53 - 1) = 60 × 52 = <strong>3120</strong>. Note: n = p × q = 3233."
  },
  {
    unit: 2,
    unitTitle: "UNIT II",
    question: "What is the primary vulnerability of the basic Diffie-Hellman Key Exchange when unauthenticated?",
    options: ["Brute-force attack on prime p", "Man-in-the-Middle (MitM) Attack", "Chosen Plaintext Attack", "Side-channel power analysis"],
    answer: 1,
    explanation: "Because basic Diffie-Hellman does not authenticate the endpoints, an active attacker can intercept public keys A and B and perform a <strong>Man-in-the-Middle (MitM) attack</strong> by establishing separate key exchanges with both Alice and Bob."
  },
  {
    unit: 2,
    unitTitle: "UNIT II",
    question: "What is the block size and key size of the standard Data Encryption Standard (DES)?",
    options: ["128-bit block, 128-bit key", "64-bit block, 56-bit effective key", "64-bit block, 128-bit key", "256-bit block, 56-bit key"],
    answer: 1,
    explanation: "DES operates on <strong>64-bit plaintext blocks</strong> using a 64-bit key where 8 bits are parity, giving an <strong>effective key length of 56 bits</strong>."
  },
  {
    unit: 2,
    unitTitle: "UNIT II",
    question: "Why does Elliptic Curve Cryptography (ECC) offer a significant advantage over RSA?",
    options: [
      "ECC does not require modulo arithmetic",
      "ECC provides equivalent security to RSA with significantly smaller key sizes (e.g., 256-bit ECC vs 3072-bit RSA)",
      "ECC is a symmetric cipher, making it 1000x faster than AES",
      "ECC relies on prime factorization rather than discrete logarithms"
    ],
    answer: 1,
    explanation: "ECC achieves the same cryptographic strength as RSA with much smaller key lengths (256-bit ECC ≈ 3072-bit RSA), making it ideal for mobile devices, IoT, and constrained environments."
  },
  {
    unit: 2,
    unitTitle: "UNIT II",
    question: "In AES-128, how many rounds of processing are performed on the State matrix?",
    options: ["10 rounds", "12 rounds", "14 rounds", "16 rounds"],
    answer: 0,
    explanation: "AES round counts depend on key length: <strong>AES-128 = 10 rounds</strong>, AES-192 = 12 rounds, AES-256 = 14 rounds."
  },

  // --- UNIT 3 ---
  {
    unit: 3,
    unitTitle: "UNIT III",
    question: "Which cryptographic property ensures that it is computationally infeasible to find ANY two distinct inputs x and y such that H(x) = H(y)?",
    options: ["Pre-image Resistance", "Second Pre-image Resistance", "Collision Resistance", "Non-repudiation"],
    answer: 2,
    explanation: "<strong>Collision Resistance</strong> requires that it is hard to find <em>any</em> two different messages x and y that yield the same hash output H(x) = H(y)."
  },
  {
    unit: 3,
    unitTitle: "UNIT III",
    question: "What entity issues and digitally signs identity tickets in the Kerberos authentication protocol?",
    options: ["Certificate Authority (CA)", "Key Distribution Center (KDC) / Ticket Granting Server (TGS)", "Secure Socket Layer Gatekeeper", "Diffie-Hellman Relayer"],
    answer: 1,
    explanation: "Kerberos uses a trusted <strong>Key Distribution Center (KDC)</strong> containing an Authentication Server (AS) and Ticket Granting Server (TGS) to issue encrypted tickets."
  },
  {
    unit: 3,
    unitTitle: "UNIT III",
    question: "How does a sender generate a Digital Signature using asymmetric cryptography?",
    options: [
      "Encrypting the full plaintext with the Receiver's Public Key",
      "Encrypting the hash digest of the message with the Sender's Private Key",
      "Encrypting the hash digest of the message with the Receiver's Private Key",
      "Hashing the message using a symmetric secret key"
    ],
    answer: 1,
    explanation: "A digital signature is created by hashing the message and encrypting that hash using the <strong>Sender's Private Key</strong>. Anyone can verify it using the Sender's Public Key."
  },
  {
    unit: 3,
    unitTitle: "UNIT III",
    question: "In the TLS/SSL handshake, what purpose does the Server Certificate serve?",
    options: [
      "It encrypts the entire HTTP payload before TCP handshake",
      "It provides the client with the server's verified public key and identity",
      "It generates a random AES session key for the server",
      "It bypasses firewall packet inspection"
    ],
    answer: 1,
    explanation: "The <strong>Server Certificate</strong> binds the server's public key to its domain identity, signed by a trusted CA, allowing the client to verify authenticity before establishing session keys."
  },

  // --- UNIT 4 ---
  {
    unit: 4,
    unitTitle: "UNIT IV",
    question: "Which type of malware appears to be legitimate or useful software but conceals malicious payload inside?",
    options: ["Worm", "Trojan Horse", "Ransomware", "Macro Virus"],
    answer: 1,
    explanation: "A <strong>Trojan Horse</strong> disguises itself as benign software to trick users into installing it. Unlike worms, Trojans do not self-replicate independently."
  },
  {
    unit: 4,
    unitTitle: "UNIT IV",
    question: "What web application vulnerability occurs when user input is rendered in the browser without sanitization, executing malicious JavaScript?",
    options: ["SQL Injection (SQLi)", "Cross-Site Scripting (XSS)", "Cross-Site Request Forgery (CSRF)", "Buffer Overflow"],
    answer: 1,
    explanation: "<strong>Cross-Site Scripting (XSS)</strong> allows attackers to inject client-side scripts into web pages viewed by other users."
  },
  {
    unit: 4,
    unitTitle: "UNIT IV",
    question: "How does a Distributed Denial of Service (DDoS) attack differ from a traditional DoS attack?",
    options: [
      "DDoS attacks exclusively target DNS servers",
      "DDoS uses a distributed botnet of multiple compromised hosts to flood the target simultaneously",
      "DDoS requires physical access to network routers",
      "DDoS attacks alter database records rather than exhausting bandwidth"
    ],
    answer: 1,
    explanation: "A <strong>DDoS attack</strong> utilizes a botnet—thousands of compromised systems (zombies)—controlled concurrently to overwhelm network bandwidth or system resources."
  },
  {
    unit: 4,
    unitTitle: "UNIT IV",
    question: "What defense mechanism prevents SQL Injection vulnerabilities in backend database queries?",
    options: ["Client-side HTML form validation", "Prepared Statements / Parameterized Queries", "MD5 Password Hashing", "HTTPS Encryption"],
    answer: 1,
    explanation: "<strong>Prepared Statements (Parameterized Queries)</strong> separate query code from user input data, ensuring input parameters are treated strictly as data literals and never executed as SQL code."
  },

  // --- UNIT 5 ---
  {
    unit: 5,
    unitTitle: "UNIT V",
    question: "In IPSec, which protocol mode encrypts BOTH the original IP header and the IP payload by encapsulating it in a new IP packet?",
    options: ["Transport Mode", "Tunnel Mode", "AH Only Mode", "Promiscuous Mode"],
    answer: 1,
    explanation: "<strong>Tunnel Mode</strong> encrypts the entire original IP packet (header + payload) and adds a new IP header, commonly used in gateway-to-gateway VPN tunnels."
  },
  {
    unit: 5,
    unitTitle: "UNIT V",
    question: "What is the primary role of the Encapsulating Security Payload (ESP) protocol in IPSec?",
    options: [
      "Provides data integrity only without encryption",
      "Provides message confidentiality (encryption), data origin authentication, and anti-replay services",
      "Negotiates SSL certificates during initial TCP handshake",
      "Resolves domain names to IP addresses securely"
    ],
    answer: 1,
    explanation: "<strong>IPSec ESP</strong> provides confidentiality through payload encryption, along with authentication and anti-replay protection. (AH only provides authentication/integrity, no encryption)."
  },
  {
    unit: 5,
    unitTitle: "UNIT V",
    question: "In Digital Forensics, what is the 'Chain of Custody'?",
    options: [
      "A software tool that decrypts suspect hard drives automatically",
      "A chronological log tracking the seizure, custody, control, transfer, and analysis of digital evidence",
      "The legal agreement signed between pentester and target firm",
      "The list of administrative users on a compromised server"
    ],
    answer: 1,
    explanation: "The <strong>Chain of Custody</strong> documents every person who handled evidence, timestamps, and locations to ensure legal admissibility in court."
  },
  {
    unit: 5,
    unitTitle: "UNIT V",
    question: "Which type of firewall inspects packets up to the Application Layer (Layer 7) and maintains context about ongoing application sessions?",
    options: ["Packet Filtering Firewall", "Stateful Inspection Firewall", "Application-Level Gateway (Proxy Firewall)", "Circuit-Level Gateway"],
    answer: 2,
    explanation: "An <strong>Application-Level Gateway (Proxy Firewall)</strong> evaluates application-layer protocols (HTTP, FTP, SMTP), inspecting deep payload content."
  }
];

let currentQuestions = [];
let currentIndex = 0;
let userAnswers = {};
let timerInterval = null;
let secondsRemaining = 900; // 15 mins

function initQuiz(unitFilter = "all") {
  if (unitFilter === "all") {
    currentQuestions = [...QUIZ_QUESTIONS];
  } else {
    const uNum = parseInt(unitFilter, 10);
    currentQuestions = QUIZ_QUESTIONS.filter(q => q.unit === uNum);
  }

  currentIndex = 0;
  userAnswers = {};
  secondsRemaining = currentQuestions.length * 60; // 1 min per question

  document.getElementById("scoreCard").style.display = "none";
  document.getElementById("quizCard").style.display = "block";

  startTimer();
  renderQuestion();
}

function startTimer() {
  clearInterval(timerInterval);
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    secondsRemaining--;
    updateTimerDisplay();
    if (secondsRemaining <= 0) {
      clearInterval(timerInterval);
      finishQuiz();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(secondsRemaining / 60).toString().padStart(2, '0');
  const s = (secondsRemaining % 60).toString().padStart(2, '0');
  const timerElem = document.getElementById("quizTimer");
  if (timerElem) timerElem.textContent = `⏱ ${m}:${s}`;
}

function renderQuestion() {
  const q = currentQuestions[currentIndex];
  if (!q) return;

  document.getElementById("quizUnitBadge").textContent = q.unitTitle;
  document.getElementById("quizProgressText").textContent = `Question ${currentIndex + 1} of ${currentQuestions.length}`;
  document.getElementById("questionText").textContent = q.question;

  const optionsContainer = document.getElementById("optionsList");
  optionsContainer.innerHTML = "";

  const savedAnswer = userAnswers[currentIndex];
  const isSubmitted = savedAnswer !== undefined && savedAnswer.submitted;

  q.options.forEach((optText, idx) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    
    let labelChar = String.fromCharCode(65 + idx); // A, B, C, D
    btn.innerHTML = `<strong>${labelChar}.</strong> <span>${optText}</span>`;

    if (savedAnswer !== undefined && savedAnswer.selected === idx) {
      btn.classList.add("selected");
    }

    if (isSubmitted) {
      if (idx === q.answer) {
        btn.classList.add("correct");
      } else if (savedAnswer.selected === idx) {
        btn.classList.add("incorrect");
      }
    }

    btn.addEventListener("click", () => {
      if (isSubmitted) return; // locked after submission
      document.querySelectorAll(".option-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      userAnswers[currentIndex] = { selected: idx, submitted: false };
    });

    optionsContainer.appendChild(btn);
  });

  const expBox = document.getElementById("explanationContainer");
  const expText = document.getElementById("explanationText");

  if (isSubmitted) {
    expBox.style.display = "block";
    expText.innerHTML = q.explanation;
    document.getElementById("btnNext").textContent = currentIndex === currentQuestions.length - 1 ? "Finish Drill" : "Next Question →";
  } else {
    expBox.style.display = "none";
    document.getElementById("btnNext").textContent = "Submit Answer";
  }

  const prevBtn = document.getElementById("btnPrev");
  prevBtn.style.visibility = currentIndex > 0 ? "visible" : "hidden";
}

function handleNext() {
  const ans = userAnswers[currentIndex];
  if (!ans) {
    alert("Please select an answer before proceeding.");
    return;
  }

  if (!ans.submitted) {
    ans.submitted = true;
    renderQuestion();
    return;
  }

  if (currentIndex < currentQuestions.length - 1) {
    currentIndex++;
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function handlePrev() {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
}

function finishQuiz() {
  clearInterval(timerInterval);
  
  let correctCount = 0;
  currentQuestions.forEach((q, idx) => {
    const userAns = userAnswers[idx];
    if (userAns && userAns.selected === q.answer) {
      correctCount++;
    }
  });

  const total = currentQuestions.length;
  const pct = Math.round((correctCount / total) * 100);

  const initialTime = total * 60;
  const timeSpent = Math.max(0, initialTime - secondsRemaining);
  const tm = Math.floor(timeSpent / 60).toString().padStart(2, '0');
  const ts = (timeSpent % 60).toString().padStart(2, '0');

  document.getElementById("quizCard").style.display = "none";
  document.getElementById("scoreCard").style.display = "block";

  document.getElementById("scorePercent").textContent = `${pct}%`;
  document.getElementById("scoreCorrect").textContent = `${correctCount}/${total}`;
  document.getElementById("scoreTime").textContent = `${tm}:${ts}`;
}

document.addEventListener("DOMContentLoaded", () => {
  // Mode selection buttons
  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      initQuiz(btn.dataset.unit);
    });
  });

  document.getElementById("btnNext")?.addEventListener("click", handleNext);
  document.getElementById("btnPrev")?.addEventListener("click", handlePrev);
  document.getElementById("btnRestart")?.addEventListener("click", () => initQuiz("all"));

  initQuiz("all");
});
