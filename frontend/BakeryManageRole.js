window.bakery = window.bakery || {};
window.bakery.BakeryManageRole = function($scope) {
    this.logPrefix = '[BakeryManageRole] ';
}

window.bakery.BakeryManageRole.prototype = function() {
    var self = this;

    var init = function($scope, cb) {
        self = this;
        self.$scope = $scope || $('#none');
        self.cb = cb;
        log('init ..', self);
        initPageControl();
        load();
        log('init DONE', this);
    };

    var initPageControl = function() {
        self.$tbody = self.$scope.find('#role-tbody');

        self.$tbody.on('change', '.role-select', function() {
            // TODO
        });
    };

    var load = function() {
        log('load at ' + new Date().toISOString());
        self.$tbody.empty();

        var list = []; // TODO load user
        if (!list.length) {
            log('No users found');
            return;
        }

        list.forEach(u => {
            var tr = $(`
                <tr>
                    <td class="px-3 py-2">${u.username}</td>
                    <td class="px-3 py-2">
                        <select data-uid="${u.id}" class="role-select rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100">
                            <option value="user" ${u.role === M.USER ? 'selected' : ''}>User</option>
                            <option value="admin" ${u.role === M.ADMIN ? 'selected' : ''}>Admin</option>
                        </select>
                    </td>
                    <td class="px-3 py-2 text-right text-xs text-slate-400">
                        สร้างเมื่อ: ${new Date(u.createdAt || Date.now()).toLocaleString('th-TH')}
                    </td>
                </tr>
            `);
            self.$tbody.append(tr);
        });
    };

    var log = function(data) {
        console.log(self.logPrefix, data);
    };

    var about = function() {
        log();
    };

    return {
        init: init,
        load: load,
        about: about
    };
}();
//# sourceURL=BakeryManageRole
