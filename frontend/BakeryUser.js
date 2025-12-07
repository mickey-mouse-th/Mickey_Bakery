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
		var $divRegisterModal = self.$scope.find('.divRegisterModal');
		
		self.$scope.on('click', '.btnLogin', function () {
			var deviceId = M.getItemStorage('deviceId');
			if (!deviceId) {
				deviceId = crypto.randomUUID();
				M.setItemStorage('deviceId', deviceId);
			}
		
			var req = {
				username: ($username.val() || '').trim(),
				password: ($password.val() || '').trim(),
				deviceOS: navigator.userAgent || 'Unknown',
				deviceName: navigator.platform || 'Unknown',
				deviceId: deviceId
			};
		
			var host = (M.isDEV === '1') ? M.hostDebug : M.hostService;
			var url = host + '/bakery-api/user/login';
		
			M.showLoader();
			$.ajax({
				method: "POST",
				url: url,
				data: JSON.stringify(req),
				contentType: 'application/json',
				timeout: 5000,
				success: function (ret) {
					M.hideLoader();
					if (ret.status !== 'OK') {
						M.showNotification('something went wrong', 'fail');
						return;
					}
		
					M.setItemStorage('user', ret.user);
					M.goPageLink();
				},
				error: function (xhr, status, error) {
					M.hideLoader();
					var responseJSON = xhr.responseJSON || {};
					var reason = responseJSON.reason || "Login failed";
					M.showNotification(reason, 'fail');
				}
			});
		});
		
		self.$scope.on('click', '.btnRegister', function () {
			$divRegisterModal.find('[data-fld="name"]').val('');
			$divRegisterModal.find('[data-fld="username"]').val('');
			$divRegisterModal.find('[data-fld="password"]').val('');
			$divRegisterModal.removeClass('hidden').addClass('flex');
		});
		$divRegisterModal.on('click', '.btnCloseModal', function () {
			$divRegisterModal.addClass('hidden').removeClass('flex');
		});
		$divRegisterModal.on('click', '.btnRegisterSubmit', function () {
		
			var req = {
				name: ($divRegisterModal.find('[data-fld="name"]').val() || '').trim(),
				username: ($divRegisterModal.find('[data-fld="username"]').val() || '').trim(),
				password: ($divRegisterModal.find('[data-fld="password"]').val() || '').trim()
			};
		
			if (!req.name || !req.username || !req.password) {
				M.showNotification('กรุณากรอกข้อมูลให้ครบ', 'fail');
				return;
			}
		
			var host = (M.isDEV === '1') ? M.hostDebug : M.hostService;
			var url = host + '/bakery-api/user/register';
			
			M.showLoader();
			$.ajax({
				method: "POST",
				url: url,
				data: JSON.stringify(req),
				contentType: 'application/json',
				timeout: 5000,
				success: function (ret) {
					M.hideLoader();
					if (ret.status !== 'OK') {
						if (ret.reason === 'USERNAME_EXISTS') {
							M.showNotification('ชื่อผู้ใช้นี้มีอยู่แล้ว', 'fail');
							return;
						}

						M.showNotification(ret.reason || 'สมัครสมาชิกไม่สำเร็จ', 'fail');
						return;
					}
		
					$divRegisterModal.addClass('hidden').removeClass('flex');
					M.showNotification('สมัครสมาชิกสำเร็จ', 'done');
					M.goPageLink();
				},
				error: function (xhr) {
					M.hideLoader();
					var responseJSON = xhr.responseJSON || {};
					var reason = responseJSON.reason || 'Register failed';
					M.showNotification(reason, 'fail');
				}
			});
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
