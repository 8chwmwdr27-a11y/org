// ===== HELPERS =====
const $ = id => document.getElementById(id);

// ===== DATABASE =====
let db = JSON.parse(localStorage.getItem("NUX_DB")) || {
  users: {
    admin: {
      pass: "1234",
      level: 1,
      xp: 0,
      nux: 1000,
      loans: [],
      portfolio: {}
    }
  },
  economy: {
    inflation: 1,
    interest: 1.1,
    market: { gold: 100, tech: 150, energy: 80 }
  }
};

let current = null;
let adminMode = false;

// ===== LOGIN =====
function login() {
  let u = $("user").value;
  let p = $("pass").value;

  if (db.users[u] && db.users[u].pass === p) {
    current = u;
    $("login").style.display = "none";
    $("game").classList.remove("hidden");
    init();
  } else {
    alert("שגיאה");
  }
}

// ===== INIT =====
function init() {
  render();
  worldLoop();
}

// ===== USER =====
function me() {
  return db.users[current];
}

// ===== RENDER =====
function render() {
  let u = me();

  $("profile").innerHTML = `
    ${current} | LVL ${u.level} | XP ${u.xp} | NUX ${Math.floor(u.nux)}
  `;

  renderBank();
  renderMarket();
  renderMissions();
}

// ===== XP =====
function addXP(x) {
  let u = me();
  u.xp += x;
  u.nux += x;

  while (u.xp >= u.level * 150) {
    u.xp -= u.level * 150;
    u.level++;
  }

  save();
  render();
}

// ===== MISSIONS =====
function renderMissions() {
  let el = $("missions");
  el.innerHTML = "<h3>משימות</h3>";

  for (let i = 0; i < 3; i++) {
    let reward = Math.floor(Math.random() * 50) + 20;

    el.innerHTML += `
      משימה
      <button onclick="addXP(${reward})">בצע (+${reward})</button><br>
    `;
  }
}

// ===== BANK =====
function renderBank() {
  let u = me();

  $("bank").innerHTML = `
    <h3>בנק</h3>
    יתרה: ${Math.floor(u.nux)}<br>
    <button onclick="loan()">הלוואה</button>
  `;
}

function loan() {
  let u = me();

  let amount = 300;

  u.loans.push({
    repay: amount * 1.2,
    due: Date.now() + 60000
  });

  setTimeout(() => {
    u.nux += amount;
    save();
    render();
  }, 2000);
}

// ===== MARKET =====
function renderMarket() {
  let el = $("world");
  let m = db.economy.market;

  el.innerHTML = "<h3>שוק</h3>";

  for (let key in m) {
    el.innerHTML += `
      ${key}: ${m[key].toFixed(1)}
      <button onclick="buy('${key}')">קנה</button>
      <button onclick="sell('${key}')">מכור</button><br>
    `;
  }
}

function buy(a) {
  let u = me();
  let price = db.economy.market[a];

  if (u.nux >= price) {
    u.nux -= price;
    u.portfolio[a] = (u.portfolio[a] || 0) + 1;
  }

  save();
  render();
}

function sell(a) {
  let u = me();

  if (u.portfolio[a] > 0) {
    u.portfolio[a]--;
    u.nux += db.economy.market[a];
  }

  save();
  render();
}

// ===== WORLD LOOP =====
function worldLoop() {
  setInterval(() => {

    for (let k in db.economy.market) {
      db.economy.market[k] += (Math.random() - 0.5) * 5;
    }

    let u = me();

    u.loans = u.loans.filter(l => {
      if (Date.now() > l.due) {
        u.nux -= l.repay;
        return false;
      }
      return true;
    });

    save();
    render();

  }, 8000);
}

// ===== CHEATS =====
document.addEventListener("keydown", e => {
  if (e.key === "`") {
    let cmd = prompt("CMD:");

    if (cmd === "admin 9999") adminMode = true;

    if (adminMode) {
      if (cmd === "money") me().nux += 50000;
      if (cmd === "boost") me().level += 5;
    }

    save();
    render();
  }
});

// ===== SAVE =====
function save() {
  localStorage.setItem("NUX_DB", JSON.stringify(db));
}
