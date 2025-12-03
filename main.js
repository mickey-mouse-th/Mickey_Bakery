var M = {
    ADMIN: 'admin',
    USER: 'user',
    SHARE: 'share',

    $portal: $('.divPortal'),

    init: function() {
        M.initMENU();

        if (!M.requireLogin()) {
            M.$portal.find('.divHeader:not([data-mode="' + M.mode + '"]').remove();
            M.$portal.find('.divHeader').show();
            M.goPageLink();
        }
    },

    requireLogin: function(opts) {
        var session = getSession();
        if (!session) {
            M.main = 'login';
            M.mode = M.SHARE;
            return null;
        }
        if (opts && opts.adminOnly && session.role !== M.ADMIN) {
            M.main = 'user-recipe';
            M.mode = M.USER;
            return null;
        }
        var hash = window.location.hash || '';
        if (!hash) {
            M.main = '';
            M.mode = session.role;
            return null;
        }
        var split = hash.split('/');
        if (split.length === 3) {
            M.main = split[2] || '';
            M.mode = split[1] || '';
            return null;
        }
        
        // attach logout
        // setTimeout(() => {
        //     const $btn = $('#btn-logout');
        //     if ($btn.length) {
        //         $btn.on('click', () => {
        //         clearSession();
        //             window.location.href = '';
        //         });
        //     }
        // }, 0);
    
        return session;
    },


    goPageLink: function() {
        var menu = M.main || '';
        var map = M.MENU[M.mode] || {};
        var page = map.page[menu] || map.form[menu] || map.default;
        M.loadPage(page);
    },

    loadPage: function(page) {
        $.ajax({
            url: page + '.html',
            type: "GET",
            success: function (data) {
                var $divMainPage = $('.divMainPage');
                var $HF = $divMainPage.find('.HF');
                var $HL = $divMainPage.find('.HL');
                var $item = $(data);
                $item.attr('data-page', page);
                $HL.after($item);

                $.getScript(page + '.js', function () {
                    console.log("โหลด JS สำเร็จ และรันแล้ว");
                    var script = new window.bakery.BakeryUser();
                    script.init($item);
                });
            },
            error: function () {
                console.log("โหลด HTML ไม่สำเร็จ");
            }
        });
    },

    about: function() {
        console.log('[MAIN]')
    }
}

const LS_USERS = 'sweetlab_users';
const LS_SESSION = 'sweetlab_session';
const LS_ING = 'sweetlab_ingredients';
const LS_REC = 'sweetlab_recipes';
const LS_COST = 'sweetlab_costs';

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

function setSession(user) {
    writeJSON(LS_SESSION, { id: user.id, username: user.username, role: user.role });
}
  
function getSession() {
    return readJSON(LS_SESSION, null);
}
  
function clearSession() {
    localStorage.removeItem(LS_SESSION);
}