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
    market: {
      gold: 100,
      tech: 150,
      energy: 80
    }
  }
};

let current = null;
let adminMode = false;

// ===== LOGIN =====
function login() {
  if (db.users[user.value] && db.users[user.value].pass === pass.value) {
    current = user.value;
    login.style.display = "none";
    game.classList.remove("hidden");
    init();
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

  profile.innerHTML = `
  ${current} | LVL ${u.level} | XP ${u.xp} | NUX ${Math.floor(u.nux)}
  `;

  renderBank();
  renderMarket();
  renderMissions();
}

// ===== XP SYSTEM =====
function addXP(x) {
  let u = me();
  u.xp += x;
  u.nux += x * db.economy.inflation;

  while (u.xp >= u.level * 150) {
    u.xp -= u.level * 150;
    u.level++;
  }

  save();
  render();
}

// ===== MISSIONS =====
function renderMissions() {
  missions.innerHTML = "<h3>משימות</h3>";

  let lvl = me().level;

  for (let i = 0; i < 3; i++) {
    let reward = Math.floor(Math.random() * 50) + lvl * 10;

    missions.innerHTML += `
    משימה רמה ${lvl}
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
    חובות: ${u.loans.length}<br>
    <button onclick="loan()">הלוואה</button>
  `;
}

function loan() {
  let u = me();

  let amount = 300 * db.economy.inflation;
  let interest = db.economy.interest;

  u.loans.push({
    amount,
    repay: amount * interest,
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
  let m = db.economy.market;
  let u = me();

  world.innerHTML = "<h3>שוק</h3>";

  for (let key in m) {
    world.innerHTML += `
    ${key}: ${m[key].toFixed(1)}
    <button onclick="buy('${key}')">קנה</button>
    <button onclick="sell('${key}')">מכור</button><br>
    `;
  }
}

function buy(asset) {
  let price = db.economy.market[asset];
  let u = me();

  if (u.nux >= price) {
    u.nux -= price;
    u.portfolio[asset] = (u.portfolio[asset] || 0) + 1;
  }

  save();
  render();
}

function sell(asset) {
  let u = me();

  if (u.portfolio[asset] > 0) {
    u.portfolio[asset]--;
    u.nux += db.economy.market[asset];
  }

  save();
  render();
}

// ===== WORLD LOOP =====
function worldLoop() {
  setInterval(() => {

    // תנודות שוק
    for (let key in db.economy.market) {
      db.economy.market[key] += (Math.random() - 0.5) * 10;
      if (db.economy.market[key] < 10) db.economy.market[key] = 10;
    }

    // אינפלציה
    db.economy.inflation += (Math.random() - 0.5) * 0.1;

    // בדיקת חובות
    let u = me();
    u.loans = u.loans.filter(l => {
      if (Date.now() > l.due) {
        u.nux -= l.repay;
        return false;
      }
      return true;
    });

    // קריסה
    if (u.nux < -500) {
      alert("פשיטת רגל!");
      u.nux = 100;
      u.level = 1;
    }

    save();
    render();

  }, 8000);
}

// ===== CHEATS 😈 =====
document.addEventListener("keydown", e => {
  if (e.key === "`") {
    let cmd = prompt("CMD:");

    if (cmd === "admin 9999") adminMode = true;

    if (adminMode) {
      if (cmd === "money") me().nux += 50000;
      if (cmd === "boost") me().level += 5;
      if (cmd === "inflate") db.economy.inflation += 2;
      if (cmd === "market up") {
        for (let k in db.economy.market) db.economy.market[k] *= 1.5;
      }
      if (cmd === "market crash") {
        for (let k in db.economy.market) db.economy.market[k] *= 0.5;
      }
    }

    save();
    render();
  }
});

// ===== SAVE =====
function save() {
  localStorage.setItem("NUX_DB", JSON.stringify(db));
}
