var M = {
    ADMIN: 'admin',
    USER: 'user',
    SHARE: 'share',
    storageKey: 'bakery',

    $portal: $('.divPortal'),

    isDEV: localStorage.isDEV === '1',

    init: function() {
        M.initMENU();

        if (!M.requireLogin()) {
            M.$portal.find('.divHeader:not([data-mode="' + M.mode + '"]').remove();
            M.$portal.find('.divHeader').show();
            M.goPageLink();
        }

        window.onhashchange = function(e) {
            if (!M.requireLogin()) {
                M.goPageLink();
            }
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

        } else if (split.length === 2) {
            M.main = split[1] || '';
            M.mode = session.role;
            return null;
        }
        
        // attach logout
        // setTimeout(() => {
        //     var $btn = $('#btn-logout');
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
                    var script = new window.bakery[page]();
                    script.init($item);
                });
            },
            error: function () {
                console.log("โหลด HTML ไม่สำเร็จ");
            }
        });
    },

    callServer: function(method, path, data) {
    method = method || 'GET';
    return new Promise((resolve, reject) => {
        M.getValidAccessToken()
        .then((atok) => {
            var host = '';
            if (M.isDEV === '1') {
                host = 'http://localhost:10000';
            }
            var url = host + '/' + path; 
            var timeout = 5000;
            if (data._timeout) {
                timeout = data._timeout;
            }

            $.ajax({
                method: method,
                url: url,
                contentType: 'application/json',
                data: JSON.stringify(data),
                timeout: timeout,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + atok);
                },
                success: function(ret) {
                    resolve(ret);
                },
                error: function(xhr, status, error) {
                    console.warn("callServer fail: xhr,status,error = ..." + xhr, status, error);
                    reject(xhr, status, error);
                }
            });
        })
        .catch(reject);
    });
    },

    getValidAccessToken: function() {
    return new Promise((resolve, reject) => {
        if (!M.user) {
            resolve('');
            return;
        }
        var accessToken = M.getItemStorage('accessToken');
        if (!accessToken || M.isTokenExpired(accessToken)) {
            var refreshToken = M.getItemStorage('refreshToken');
            $.ajax({
                method: 'POST',
                url: '/api/refresh-token',
                contentType: 'application/json',
                data: { token: refreshToken },
                timeout: 5000,
                success: function(ret) {
                    M.setItemStorage('accessToken', accessToken);
                    resolve(accessToken);
                },
                error: function(xhr, status, error) {
                    console.warn("callServer fail: xhr,status,error = ..." + xhr, status, error);
                    reject(xhr, status, error);
                }
            });
            return;
        }
        resolve(accessToken);
    })},

    isTokenExpired: function(atok) {
        if (!atok) return true;
      
        var payload = JSON.parse(atob(atok.split('.')[1]));
        var now = Math.floor(Date.now() / 1000);
        return payload.exp < now;
    },

    setItemStorage: function(key, data) {
        var json = JSON.stringify(data);
        localStorage.setItem(M.storageKey + '_' + key, json);
    },

    getItemStorage: function(key) {
        var json = localStorage.getItem(M.storageKey + '_' + key);
        var data = JSON.parse(json);
        return data;
    },

    about: function() {
        console.log('[MAIN]')
    }
}

var LS_USERS = 'sweetlab_users';
var LS_SESSION = 'sweetlab_session';
var LS_ING = 'sweetlab_ingredients';
var LS_REC = 'sweetlab_recipes';
var LS_COST = 'sweetlab_costs';

function getUsers() {
    var list = readJSON(LS_USERS, []);
    if (!list.length) {
      var admin = {
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
    var v = localStorage.getItem(key);
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