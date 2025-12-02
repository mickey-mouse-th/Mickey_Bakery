var M = {
    ADMIN: 'admin',
    USER: 'user',
    SHARE: 'share',

    LS_USERS: 'sweetlab_users',
    LS_SESSION: 'sweetlab_session',
    LS_ING: 'sweetlab_ingredients',
    LS_REC: 'sweetlab_recipes',
    LS_COST: 'sweetlab_costs',

    init: function() {
        M.initMENU();

        if (!M.requireLogin()) {
            M.goPageLink();
        }
    },

    requireLogin: function(opts) {
        var session = M.getSession();
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

    readJSON: function(key, def) {
        try {
            const v = localStorage.getItem(key);
            if (!v) return def;
            return JSON.parse(v);
        } catch (e) {
            return def;
        }
    },

    writeJSON: function(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    setSession: function(user) {
        M.writeJSON(M.LS_SESSION, { id: user.id, username: user.username, role: user.role });
    },
    
    getSession: function() {
        return M.readJSON(M.LS_SESSION, null);
    },
      
    clearSession: function() {
        localStorage.removeItem(M.LS_SESSION);
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
                var $HT = $divMainPage.find('.HT');
                var $HI = $HT.clone().removeClass('HT').addClass('HI');
                $HI.attr('data-page', page);
                $HI.html(data);
                $HI.show();
                $HI.insertBefore($HL);

                $.getScript(page + '.js', function () {
                    console.log("โหลด JS สำเร็จ และรันแล้ว");
                    var script = new window.bakery.BakeryUser();
                    script.init($HI);
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