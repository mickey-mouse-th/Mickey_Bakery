// Core localStorage keys
const LS_USERS = 'sweetlab_users';
const LS_SESSION = 'sweetlab_session';
const LS_ING = 'sweetlab_ingredients';
const LS_REC = 'sweetlab_recipes';
const LS_COST = 'sweetlab_costs';

function readJSON(key, def) {
  try {
    const v = localStorage.getItem(key);
    if (!v) return def;
    return JSON.parse(v);
  } catch (e) {
    return def;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Users
function getUsers() {
  const list = readJSON(LS_USERS, []);
  if (!list.length) {
    const admin = {
      id: 'u_admin',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      createdAt: Date.now()
    };
    writeJSON(LS_USERS, [admin]);
    return [admin];
  }
  return list;
}
function setUsers(list) { writeJSON(LS_USERS, list); }

function setSession(user) {
  writeJSON(LS_SESSION, { id: user.id, username: user.username, role: user.role });
}
function getSession() {
  return readJSON(LS_SESSION, null);
}
function clearSession() {
  localStorage.removeItem(LS_SESSION);
}

// Ingredients
function getIngredients() { return readJSON(LS_ING, []); }
function setIngredients(list) { writeJSON(LS_ING, list); }

// Recipes
function getRecipes() { return readJSON(LS_REC, []); }
function setRecipes(list) { writeJSON(LS_REC, list); }

// Costs
function getCosts() { return readJSON(LS_COST, []); }
function setCosts(list) { writeJSON(LS_COST, list); }

// Auth helpers
function initAuthPage() {
  const $uInput = $('#auth-username');
  const $pInput = $('#auth-password');
  const $err = $('#auth-error');
 
  $('#btn-login').on('click', () => {
    const u = ($uInput.val() || '').trim();
    const p = ($pInput.val() || '').trim();
    const users = getUsers();
    const found = users.find(x => x.username === u && x.password === p);

    if (!found) {
      $err.text('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      return;
    }
    setSession(found);
    if (found.role === 'admin') location.href = 'BakeryIngredient.html';
    else location.href = 'BakeryUserRecipe.html';
  });

  $('#btn-register').on('click', () => {
    const u = ($uInput.val() || '').trim();
    const p = ($pInput.val() || '').trim();
    if (!u || !p) {
      $err.text('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }
    let users = getUsers();

    if (users.find(x => x.username === u)) {
      $err.text('มีชื่อผู้ใช้นี้แล้วในระบบ');
      return;
    }

    const nu = { id: 'u_' + Date.now(), username: u, password: p, role: 'user', createdAt: Date.now() };
    users.push(nu);
    setUsers(users);
    setSession(nu);
    location.href = 'BakeryUserRecipe.html';
  });
}

// Require login
function requireLogin(opts) {
  const session = getSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  if (opts && opts.adminOnly && session.role !== 'admin') {
    window.location.href = 'BakeryUserRecipe.html';
    return null;
  }

  // attach logout
  setTimeout(() => {
    const $btn = $('#btn-logout');
    if ($btn.length) {
      $btn.on('click', () => {
        clearSession();
        window.location.href = 'index.html';
      });
    }
  }, 0);

  return session;
}

// Navbar helpers
function initNavbarUser(user) {
  $('#nav-username').text(user.username);
  $('#nav-role').text(user.role === 'admin' ? 'Administrator' : 'User');
}

function highlightNav(key) {
  const map = {
    ing: '.nav-ing',
    rec: '.nav-rec',
    cost: '.nav-cost',
    dash: '.nav-dash',
    role: '.nav-role'
  };
  const sel = map[key];
  if (!sel) return;

  $(sel).addClass('bg-sky-500/20 text-sky-300 border border-sky-500/40');
}
