var M = {
    init: function() {
        
    },

    requireLogin: function(opts) {
        var session = getSession();
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
    },

    about: function() {
        console.log('[MAIN]')
    }
}