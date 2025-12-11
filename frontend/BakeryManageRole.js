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

    var load = function(info, cbLoadDone, cbPageBack) {
		log('load at ' + new Date().toISOString(), info);
		self.info = info;
		self.cbLoadDone = cbLoadDone;
		self.cbPageBack = cbPageBack;

		// Clear Filter
		self.$scope.find(':input.txtSearch').val("");

		doLoad();
		onLoadDone();
	};

    var initPageControl = function() {
        self.$tbody = self.$scope.find('#role-tbody');

        self.$tbody.on('change', '.role-select', function() {
            // TODO
        });
    };

    var doLoad = function() {
        M.callServer("POST", "bakery-api/user/list", {})
        .then(function(res) {
            if (res.status != 'OK') {
                M.showNotification('Cannot load user', 'warn');
                return;
            }
            var list = res.list || [];
            onLoadList(list);
        })
        .catch(function(err) {
            log('err=', err);
        });
    };

    var onLoadList = function(list) {
        self.$tbody.empty();

        if (!list.length) {
            log('No users found');
            return;
        }

        list.forEach(u => {
            var tr = $(`
                <tr>
                    <td class="px-3 py-2">${u.name}</td>
                    <td class="px-3 py-2">
                        <select data-uid="${u.accId}" class="role-select rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100">
                            <option value="user" ${u.roleType === 0 ? 'selected' : ''}>User</option>
                            <option value="admin" ${u.roleType === 1 ? 'selected' : ''}>Admin</option>
                        </select>
                    </td>
                    <td class="px-3 py-2 text-right text-xs text-slate-400">
                        สร้างเมื่อ: ${new Date(u.creDate || Date.now()).toLocaleString('th-TH')}
                    </td>
                </tr>
            `);
            self.$tbody.append(tr);
        });
    };

    var onLoadDone = function() {
        log('onLoadDone ...');
        if (self.cbLoadDone) {
          self.cbLoadDone.call(null);
        }
    };

    var log = function(data) {
        console.log(self.logPrefix, data);
    };

    var about = function() {
        log('about call');
    };

    var publicFunctions = {
        init: init,
        load: load,
        about: about
    };
    return publicFunctions;
}();
//# sourceURL=BakeryManageRole.js
