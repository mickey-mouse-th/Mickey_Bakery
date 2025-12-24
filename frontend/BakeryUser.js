var BakeryUser = function($scope) {
    this.logPrefix = '[BakeryUser] ';
	this.$scope = $scope || $('#none');
};

BakeryUser.prototype.init = function (cbInitDone) {
	var form = this;
	form.cbInitDone = cbInitDone;
	form.log('init ..', form);
	form.initPageControl();
	// initFormControls();
	// initCustomControls();
	form.onInitDone();
	form.log('init DONE', this);
};

BakeryUser.prototype.load = function(info, cbLoadDone, cbPageBack) {
	var form = this;
	form.log('load at ' + new Date().toISOString(), info);
	form.info = info;
	form.cbLoadDone = cbLoadDone;
	form.cbPageBack = cbPageBack;

	// Clear Filter
	form.$scope.find(':input.txtSearch').val("");

	// doLoad();
	form.onLoadDone();
};

BakeryUser.prototype.initPageControl = function() {
	var form = this;
	var $divLogin = form.$scope.find('.divLogin');
	var $username = $divLogin.find('[data-fld="username"]');
	var $password = $divLogin.find('[data-fld="password"]');
	var $divRegisterModal = form.$scope.find('.divRegisterModal');
	
	$divLogin.on('click', '.btnLogin', function () {
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
	
		var host = !!M.isDEV ? M.hostDebug : M.hostService;
		var url = host + '/bakery-api/user/login';
	
		M.showLoader();
		$.ajax({
			method: "POST",
			url: url,
			data: JSON.stringify(req),
			contentType: 'application/json',
			timeout: 30*1000, // 30 sec
			xhrFields: { withCredentials: true },
			success: function (ret) {
				M.hideLoader();
				if (ret.status !== 'OK') {
					M.showNotification('something went wrong', 'fail');
					return;
				}
				if (form.cbLoadBack) {
					form.cbLoadBack.call(null, ret);
				}
			},
			error: function (xhr, status, error) {
				M.hideLoader();
				var responseJSON = xhr.responseJSON || {};
				var reason = responseJSON.reason || "Login failed";
				M.showNotification(reason, 'fail');
			}
		});

		form.$scope.on('click', '.btnLogout', function() {
            M.callServer('POST', 'bakery-api/user/logout')
			.finally(() => {
				M.clearStorage();
				location.reload();
			});
        });
	});
	
	$divLogin.on('click', '.btnRegister', function () {
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
	
		var host = !!M.isDEV ? M.hostDebug : M.hostService;
		var url = host + '/bakery-api/user/register';
		
		M.showLoader();
		$.ajax({
			method: "POST",
			url: url,
			data: JSON.stringify(req),
			contentType: 'application/json',
			timeout: 30*1000, // 30 sec
			xhrFields: { withCredentials: true },
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

BakeryUser.prototype.doLoginUser = function(info, cbLoadDone, cbLoadBack) {
	var form = this;
	form.info = info;
	form.cbLoadDone = cbLoadDone;
	form.cbLoadBack = cbLoadBack;

	form.onLoadDone();
};

BakeryUser.prototype.onInitDone = function() {
	var form = this;
	if (form.cbInitDone) {
		form.cbInitDone.call(null);
		form.cbInitDone = null;
	}
};

BakeryUser.prototype.onLoadDone = function() {
	var form = this;
	if (form.cbLoadDone) {
		form.cbLoadDone.call(null);
	}
};

BakeryUser.prototype.log = function (data) {
	var form = this;
	console.log(form.logPrefix, data);
};

BakeryUser.prototype.about = function() {
	var form = this;
	form.log('about call');
};
//# sourceURL=BakeryUser.js
