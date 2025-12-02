var M = {
    MODE: {
        ADMIN: 'admin',
        USER: 'user'
    },

    init: function() {
        M.initMENU();

        if (!requireLogin()) {
            
        }
    },

    requireLogin: function(opts) {
        var session = getSession();
        if (!session) {
            window.location.href = '';
            return null;
        }
        if (opts && opts.adminOnly && session.role !== M.MODE.ADMIN) {
            window.location.href = 'user-recipe';
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

    about: function() {
        console.log('[MAIN]')
    }
}