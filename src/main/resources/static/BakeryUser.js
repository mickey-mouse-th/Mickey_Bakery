window.bakery = window.bakery || {};
window.bakery.BakeryUser = function($scope) {
    this.logPrefix = '[BakeryUser] ';
}

window.bakery.BakeryUser.prototype = function() {
    var self = this;
    var init = function ($scope, cb) {
		self = this;
		self.$scope = $scope || $('#none');
		self.cb = cb;
		log('init ..', self);
		initPageControl();
		// initFormControls();
		// initCustomControls();
		// onInitDone();
		log('init DONE', this);
	};

	var initPageControl = function() {
		var $username = self.$scope.find('[data-fld="username"]');
		var $password = self.$scope.find('[data-fld="password"]');
		var $err = self.$scope.find('#auth-error');
		
		self.$scope.on('click', '.btnLogin', function() {
			var deviceId = M.getItemStorage('deviceId');
			if (!deviceId) {
				deviceId = crypto.randomUUID();
				M.setItemStorage('deviceId', deviceId);
				M.deviceId = deviceId;
			}
			var req = {
				username: ($username.val() || '').trim(),
				password: ($password.val() || '').trim(),
				deviceOS: navigator.userAgent || 'Unknown',
				deviceName: navigator.platform || 'Unknown',
				deviceId: deviceId
			}
			M.callServer("POST", "bakery-api/user/login", req)
				.then(o => {
					if (o.status != 'OK') {
						M.showNotification('something went wrong', 'fail');
						return;
					}
					M.setItemStorage('user', o.user);
					M.goPageLink();
				})
				.catch(o => {
					var responseJSON = o.xhr.responseJSON;
					var reason = responseJSON.reason;
					M.showNotification(reason, 'fail');
				})
		});
		
		self.$scope.on('click', '#btn-register', function() {
			var u = ($username.val() || '').trim();
			var p = ($password.val() || '').trim();
			if (!u || !p) {
			$err.text('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
			return;
			}
			var users = getUsers();
		
			if (users.find(x => x.username === u)) {
			$err.text('มีชื่อผู้ใช้นี้แล้วในระบบ');
			return;
			}
		
			var nu = { id: 'u_' + Date.now(), username: u, password: p, role: M.USER, createdAt: Date.now() };
			users.push(nu);
			setUsers(users);
			setSession(nu);
			location.href = 'BakeryUserRecipe.html';
		});
	};

    var log = function (data) {
        console.log(self.logPrefix, data);
    };

    var about = function() {
        log();
    };

    var publicFunctions = {
		init: init,
		about: about
	};
	return publicFunctions;
}();
//# sourceURL=BakeryUser
