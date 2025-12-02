window.bakery = window.bakery || {};
window.bakery.login = function($scope) {
    this.logPrefix = '[login] ';
}

window.bakery.login.prototype = function() {
    var self = this;
    var init = function ($scope, cb) {
		self = this;
		self.$scope = $scope || $('#none');
		self.cb = cb;
		log('init ..', self);

		// initFormControls();
		// initCustomControls();
		// onInitDone();
		log('init DONE', this);
	};

    var log = function (data) {
        console.log(self.logPrefix, data);
    };

    var about = function() {
        log();
    }

    var publicFunctions = {
		init: init,
		about: about
	};
	return publicFunctions;
}();
//# sourceURL=BakeryLogin
