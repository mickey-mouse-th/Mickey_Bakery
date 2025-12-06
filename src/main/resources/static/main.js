var M = {
    ADMIN: 'admin',
    USER: 'user',
    SHARE: 'share',
    storageKey: 'bakery',
    roleTypeMap: {
        '0': M.USER,
        '1': M.ADMIN
    },

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
        M.$portal.on('click', '#btn-logout', function() {
            clearSession();
            window.location.href = '';
        });
    },

    requireLogin: function(opts) {
        var user = M.getItemStorage('user');
        if (!user) {
            M.main = 'login';
            M.mode = M.SHARE;
            return null;
        }

        var role = roleTypeMap[user.roleType] || M.USER;
        if (opts && opts.adminOnly && role != M.ADMIN) {
            M.main = 'user-recipe';
            M.mode = '';
            return null;
        }
        var hash = window.location.hash || '';
        if (!hash) {
            M.main = '';
            M.mode = role;
            return null;
        }
        var split = hash.split('/');
        if (split.length === 3) {
            M.main = split[2] || '';
            M.mode = split[1] || '';
            return null;

        } else if (split.length === 2) {
            M.main = split[1] || '';
            M.mode = role;
            return null;
        }
        
        return user;
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
    method = (method || 'GET').toUpperCase();
    path = path.replace(/^\/+/, '');
    data = data || {};

    return new Promise((resolve, reject) => {
        if (!path) {
            reject('No path to call');
            return;
        }

        M.getValidAccessToken()
        .then((atok) => {

            var tokenStr = atok ? atok.token : '';

            var host = (M.isDEV === '1') ? 'http://localhost:8080' : '';
            var url = host + '/' + path;

            var timeout = 5000;
            if (data._timeout) {
                timeout = data._timeout;
                delete data._timeout;
            }

            var option = {
                method: method,
                url: url,
                timeout: timeout,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + tokenStr);
                },
                success: function(ret) {
                    resolve(ret);
                },
                error: function(xhr, status, error) {
                    reject({ xhr, status, error });
                }
            };

            if (method === 'POST' || method === 'PUT') {
                option.data = JSON.stringify(data);
                option.contentType = 'application/json';
            } else {
                option.data = data;
            }

            $.ajax(option);
        })
        .catch(reject);
    });
    },
    
    getValidAccessToken: function() {
    return new Promise((resolve, reject) => {
        var user = M.getItemStorage('user')
        if (!user) {
            resolve(null);
            return;
        }

        var accessTokenItem = M.getItemStorage('accessTokenItem');
        if (!accessTokenItem || M.isTokenExpired(accessTokenItem)) {
            var refreshToken = M.getItemStorage('refreshToken');
            if (!refreshToken) {
                reject({ logout: true });
                return;
            }

            $.ajax({
                method: 'POST',
                url: '/api/refresh-token',
                contentType: 'application/json',
                data: JSON.stringify({ token: refreshToken }),
                timeout: 5000,
                success: function(ret) {

                    if (ret.status !== "OK") {
                        reject({ status: ret.status || "FAIL", reason: ret.reason || "Unknown error" });
                        return;
                    }

                    var expire_minute = ret.expire_minute || 15;
                    accessTokenItem = {
                        token: ret.token,
                        expireTs: Date.now() + (expire_minute * 60 * 1000)
                    };

                    M.setItemStorage('accessTokenItem', accessTokenItem);
                    resolve(accessTokenItem);
                },
                error: function(xhr, status, error) {
                    reject({ xhr, status, error });
                }
            });

            return;
        }

        resolve(accessTokenItem); // <<< ส่ง object
    });
    },
    
    isTokenExpired: function(atok) {
        if (!atok) return true;
    
        if (!atok.expireTs) return true;
    
        var now = Date.now();
        return now > atok.expireTs;
    },
    

    setItemStorage: function(key, data) {
        var json = JSON.stringify(data);
        localStorage.setItem(M.storageKey + '_' + key, json);
    },

    getItemStorage: function(key) {
        var json = localStorage.getItem(M.storageKey + '_' + key);
        if (!json) return null;
    
        try {
            return JSON.parse(json);
        } catch (e) {
            return null;
        }
    },

    showNotification: function(msg, status) {
        status = status || 'done';
        var $container = M.$portal.find("#notification-container");
    
        var $notif = $("<div></div>")
        $notif.addClass('flex items-center p-3 rounded-lg shadow-lg text-white min-w-[250px] transition-transform transform translate-x-20 opacity-0');
    
        var iconSvg = "";
        if (status === "done") {
            $notif.addClass("bg-green-500");
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6 mr-2 flex-shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>`;
        } else if (status === "fail") {
            $notif.addClass("bg-red-500");
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6 mr-2 flex-shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>`;
        } else {
            $notif.addClass("bg-gray-600");
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6 mr-2 flex-shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 6a9 9 0 110 18 9 9 0 010-18z"/>
            </svg>`;
        }
    
        $notif.html(iconSvg + `<span>${msg}</span>`);
        $container.append($notif);
    
        // Animate in
        requestAnimationFrame(() => {
            $notif.removeClass("translate-x-20", "opacity-0");
            $notif.addClass("translate-x-0", "opacity-100");
        });
    
        // Auto remove
        setTimeout(() => {
            $notif.addClass("translate-x-20", "opacity-0");
            setTimeout(() => $notif.remove(), 300);
        }, 3000);
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