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
		var $uInput = self.$scope.find('#auth-username');
		var $pInput = self.$scope.find('#auth-password');
		var $err = self.$scope.find('#auth-error');
	   
		self.$scope.on('click', '#btn-login', function() {
		  var u = ($uInput.val() || '').trim();
		  var p = ($pInput.val() || '').trim();
		  var users = getUsers();
		  var found = users.find(x => x.username === u && x.password === p);
	  
		  if (!found) {
			$err.text('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
			return;
		  }
		  setSession(found);
		  if (found.role === 'admin') location.href = 'BekeryIngredient.html';
		  else location.href = 'BakeryUserRecipe.html';
		});
	  
		$('#btn-register').on('click', () => {
		  const u = ($uInput.val() || '').trim();
		  const p = ($pInput.val() || '').trim();
		  if (!u || !p) {
			$err.text('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
			return;
		  }
		  let users = getUsers();
	  
		  if (users.find(x => x.username === u)) {
			$err.text('มีชื่อผู้ใช้นี้แล้วในระบบ');
			return;
		  }
	  
		  const nu = { id: 'u_' + Date.now(), username: u, password: p, role: 'user', createdAt: Date.now() };
		  users.push(nu);
		  setUsers(users);
		  setSession(nu);
		  location.href = 'BakeryUserRecipe.html';
		});
	  }

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
