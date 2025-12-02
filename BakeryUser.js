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
//# sourceURL=BakeryUser
