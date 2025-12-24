var M = {
    ADMIN: 'admin',
    USER: 'user',
    SHARE: 'share',
    storageKey: 'bakery',
    roleTypeMap: {
        0: 'user',
        1: 'admin'
    },

    $portal: $('.divPortal'),

    isDEV: localStorage.isDEV === '1',
    hostService: 'https://bakery-backend-mzwv.onrender.com',
    hostDebug: 'http://localhost:8080',

    init: function() {
        M.initMENU();

        if (!M.requireLogin()) {
            M.goPageLink();
        }

        window.onhashchange = function(e) {
            if (!M.requireLogin()) {
                M.goPageLink();
            }
        }
        M.$portal.on('click', '.btnLogout', function() {
            M.clearStorage();
            window.location.href = '';
        });

        // TODO Fix
        var drawer = M.$portal.find("#mobileDrawer");
        var backdrop = M.$portal.find("#mobileDrawer-backdrop");
      
        // เปิดเมนู
        M.$portal.find("#btn-ham").on("click", function () {
          drawer.removeClass("hidden").removeClass("translate-x-full");
          backdrop.removeClass("hidden");
        });
      
        // ปิดเมนู
        M.$portal.find("#btn-close-drawer, #mobileDrawer-backdrop").on("click", function () {
          drawer.addClass("translate-x-full");
          setTimeout(() => drawer.addClass("hidden"), 300);
          backdrop.addClass("hidden");
        });

        M.$portal.on('click', '.HI[data-form][fid] .btnEdit', function() {
            var $btn = $(this);
            var $HI = $btn.closest('.HI');
            var form = $HI.attr('data-form');
            var fid = $HI.attr('fid');
            if (!form || !fid) {
                console.log('cannot find form or fid: form/fid=' + form + '/' + fid);
                return;
            }
            location.hash = '#/' + M.mode + '/form:' + form + '/fid:' + fid;
        });
    },

    // TODO เข้า link ตรงได้อยู่
    requireLogin: function(opts) {
        var user = M.getItemStorage('user');
        if (!user) {
            M.main = 'login';
            M.mode = M.SHARE;
            return null;
        }

        var role = M.roleTypeMap[Number(user.roleType)] || M.USER;
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


    goPageLink: function(menu, info) {
        var user = M.getItemStorage('user');
        if (!!user) {
            M.$portal.find('.divHeader:not([data-mode="' + M.mode + '"]').remove();
            M.$portal.find('.divHeader').removeClass('hidden');
        }

        menu = menu || M.main || '';
        var map  = M.MENU[M.mode] || {};
        var page = map.page[menu] || map.form[menu] || map.default;
        M.loadPage(page, info);
    },
    
    loadPage: function(page, info) {
        var $divMainPage = M.$portal.find('.divMainPage');
        $divMainPage.children('[data-page]').addClass('hidden');
    
        var $exist = $divMainPage.children('[data-page="' + page + '"]');
    
        M.showLoader();
        if ($exist.length > 0) {
            var ctx0 = $exist.data('ctx');
            if (ctx0.load) ctx0.load(info, M.hideLoader);
            $exist.removeClass('hidden');
            return;
        }
    
        M.loadHtml(page, function($item){
            M.loadJs(page, function(){
                if (window.bakery[page] && typeof window.bakery[page] === 'function') {
                    var ctx = new window.bakery[page]();
                    $item.data('ctx', ctx);
    
                    if (ctx.init) ctx.init($item);
                    if (ctx.load) ctx.load(info, M.hideLoader);
                }
            });
        });
    },
    
    loadHtml: function(page, callback) {
        $.ajax({
            url: page + '.html',
            type: "GET",
            success: function(data) {
                var $divMainPage = $('.divMainPage');
                var $HL = $divMainPage.children('.HL');
    
                var $item = $(data).attr('data-page', page);
                $item.insertBefore($HL);
    
                if (callback) callback($item);
            },
            error: function() {
                console.log("โหลด HTML ไม่สำเร็จ:", page);
            }
        });
    },
    
    loadJs: function(page, callback) {
        $.getScript(page + '.js', function(){
            console.log("โหลด JS สำเร็จ:", page);
            if (callback) callback();
        }).fail(function(){
            console.log("โหลด JS ไม่สำเร็จ:", page);
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

        var host = !!M.isDEV ? M.hostDebug : M.hostService;
        var url = host + '/' + path;

        var timeout = 10000;
        if (data._timeout) {
            timeout = data._timeout;
            delete data._timeout;
        }

        var option = {
            method: method,
            url: url,
            timeout: timeout,
            xhrFields: { withCredentials: true },
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
    });
    },
    
    getValidAccessToken: function() {
    return new Promise((resolve, reject) => {
        var user = M.getItemStorage('user')
        if (!user) {
            resolve(null);
            return;
        }
        
        var accessTokenItem = user.accessTokenItem;
        if (!accessTokenItem || M.isTokenExpired(accessTokenItem)) {
            var refreshTokenItem = user.refreshTokenItem;
            if (!refreshTokenItem || M.isTokenExpired(refreshTokenItem)) {
                reject({ logout: true });
                return;
            }

            var host = !!M.isDEV ? M.hostDebug : M.hostService;
            var refreshToken = refreshTokenItem.token || '';
            $.ajax({
                method: 'POST',
                url: host + '/bakery-api/user/getAccessToken',
                contentType: 'application/json',
                data: JSON.stringify({ token: refreshToken }),
                timeout: 5000,
                success: function(ret) {

                    if (ret.status !== "OK") {
                        reject({ status: ret.status || "FAIL", reason: ret.reason || "Unknown error" });
                        return;
                    }

                    user.accessTokenItem = ret.accessTokenItem;
                    M.setItemStorage('user', user);
                    resolve(user.accessTokenItem);
                },
                error: function(xhr, status, error) {
                    console.log('xhr, status, error= ', { xhr, status, error });
                    reject({ logout: true });
                }
            });

            return;
        }
        resolve(accessTokenItem);
    });
    },
    
    isTokenExpired: function(token) {
        if (!token) return true;
        if (!token.expire) return true;
    
        var now = Date.now();
        return now > token.expire;
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
    clearStorage: function() {
        for(var key in localStorage) {
            if (key.startsWith(M.storageKey) && key != (M.storageKey + "_deviceId")) {
                localStorage.removeItem(key);
            }
        }
    },

    showNotification: function(msg, status) {
        status = status || 'done';

        var $container = M.$portal.find("#notification-container");

        var $notif = $('<div class="flex items-center p-4 rounded-lg shadow-lg text-white min-w-[300px] gap-3 transform translate-x-20 opacity-0 transition-all duration-300"></div>');

        var iconSvg = "";
        if (status === "done") {
            $notif.addClass("bg-green-500");
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6 flex-shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>`;
        } else if (status === "fail") {
            $notif.addClass("bg-red-500");
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6 flex-shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>`;
        } else {
            $notif.addClass("bg-gray-600");
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6 flex-shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 6a9 9 0 110 18 9 9 0 010-18z"/>
            </svg>`;
        }

        $notif.html(iconSvg + `<span class="flex-1">${msg}</span>`);
        $container.append($notif);

        setTimeout(function() {
            $notif.removeClass("translate-x-20 opacity-0").addClass("translate-x-0 opacity-100");
        }, 10);

        setTimeout(function() {
            $notif.removeClass("translate-x-0 opacity-100").addClass("translate-x-20 opacity-0");
            setTimeout(function() {
                $notif.remove();
            }, 300);
        }, 3000);
    },

    showLoader: function() {
        M.$portal.find(".divLoading").removeClass("hidden");
    },
    hideLoader: function() {
        M.$portal.find(".divLoading").addClass("hidden");
    },

    about: function() {
        console.log('[MAIN]')
    }
}
