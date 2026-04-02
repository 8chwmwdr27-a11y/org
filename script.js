// ===== DATABASE =====
let db = JSON.parse(localStorage.getItem("NUX_DB")) || {
  users: {
    admin: {
      pass: "1234",
      level: 1,
      xp: 0,
      nux: 1000,
      loans: [],
      investments: []
    }
  },
  economy: {
    inflation: 1,
    interest: 1.1
  },
  logs: []
};

let current = null;
let adminMode = false;

// ===== LOGIN =====
function login() {
  let u = user.value;
  let p = pass.value;

  if (db.users[u] && db.users[u].pass === p) {
    current = u;
    login.style.display = "none";
    game.classList.remove("hidden");
    init();
  } else alert("שגיאה");
}

// ===== INIT =====
function init() {
  render();
  worldEngine();
}

// ===== USER =====
function me() {
  return db.users[current];
}

// ===== RENDER =====
function render() {
  let u = me();

  profile.innerHTML = `
    ${current} | LVL ${u.level} | XP ${u.xp} | NUX ${Math.floor(u.nux)}
    <br> אינפלציה: ${db.economy.inflation.toFixed(2)}
  `;

  renderBank();
  renderMissions();
  renderWorld();
}

// ===== LEVEL =====
function addXP(x) {
  let u = me();
  u.xp += x;
  u.nux += x * 0.5;

  while (u.xp >= u.level * 100) {
    u.xp -= u.level * 100;
    u.level++;
  }

  save();
  render();
}

// ===== MISSIONS =====
function renderMissions() {
  missions.innerHTML = "<h3>משימות</h3>";

  for (let i = 0; i < 3; i++) {
    let reward = Math.floor(Math.random() * 50) + 20;

    missions.innerHTML += `
      משימה ${i+1}
      <button onclick="addXP(${reward})">בצע (+${reward})</button><br>
    `;
  }
}

// ===== BANK =====
function renderBank() {
  let u = me();

  bank.innerHTML = `
    <h3>בנק</h3>
    יתרה: ${Math.floor(u.nux)}<br>
    <button onclick="loan()">הלוואה</button>
    <button onclick="invest()">השקעה</button>
  `;
}

function loan() {
  let u = me();
  let amount = 200 * db.economy.inflation;

  u.loans.push({
    amount,
    due: Date.now() + 60000
  });

  setTimeout(() => {
    u.nux += amount;
    save();
    render();
  }, 3000);
}

function invest() {
  let u = me();

  let risk = Math.random();

  setTimeout(() => {
    if (risk > 0.7) u.nux += 500;
    else if (risk > 0.4) u.nux += 150;
    else u.nux -= 200;

    save();
    render();
  }, 5000);
}

// ===== WORLD ENGINE =====
function worldEngine() {
  setInterval(() => {

    // אינפלציה משתנה
    db.economy.inflation += (Math.random() - 0.5) * 0.05;

    // ריבית משתנה
    db.economy.interest += (Math.random() - 0.5) * 0.02;

    // אירוע עולמי
    if (Math.random() > 0.8) {
      emergency.innerText = "⚠️ משבר כלכלי!";
      emergency.style.display = "block";

      setTimeout(() => emergency.style.display = "none", 3000);

      db.economy.inflation += 0.2;
    }

    save();
    render();

  }, 10000);
}

// ===== WORLD =====
function renderWorld() {
  world.innerHTML = `
    <h3>עולם</h3>
    אינפלציה: ${db.economy.inflation.toFixed(2)}<br>
    ריבית: ${db.economy.interest.toFixed(2)}
  `;
}

// ===== UI =====
function show(id) {
  document.querySelectorAll(".tab").forEach(t => t.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// ===== CHEAT SYSTEM 😈 =====
document.addEventListener("keydown", e => {
  if (e.key === "`") {
    let cmd = prompt("CMD:");

    if (cmd === "admin 9999") {
      adminMode = true;
      alert("ADMIN MODE");
    }

    if (adminMode) {
      if (cmd === "money") me().nux += 10000;
      if (cmd === "inflate") db.economy.inflation += 1;
      if (cmd === "crash") me().nux = 0;
    }

    save();
    render();
  }
});

// ===== SAVE =====
function save() {
  localStorage.setItem("NUX_DB", JSON.stringify(db));
}