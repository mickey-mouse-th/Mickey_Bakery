window.bakery = window.bakery || {};
window.bakery.BakeryAdminRecipe = function($scope) {
    this.logPrefix = '[BakeryAdminRecipe] ';
}

window.bakery.BakeryAdminRecipe.prototype = function() {
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
        load(); // TODO mmove
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

        self.$list = self.$scope.find('.divItemList');
        self.$divItemNone = self.$scope.find('.divItemNone');

        self.$scope.on('click', '.btnDelete', function() {
            if (!confirm('ลบเมนูนี้?')) return;
            // TODO sent request to delete via server
            // TODO delete this item on screen
        });
	};

    var doLoad = function() {
        var list = []; // TODO list via server
        onLoad(list);
    };

    var onLoad = function(list) {
        if (!list.length) {
            self.$divItemNone.removeClass('hidden');
            return;
        }
        self.$list.removeClass('hidden');
        
        var $HF = self.$list.find('.HF');
        var $HL = self.$list.find('.HL');
        var $HT = self.$list.find('.HT');

        for (var i=0; i<list.length; i++) {
            var item = list[i];
            var $item = $HT.clone().removeClass('HT').addClass('HI');
            $item.attr('fid', item.id);
            $item.find('[data-fld="name"]').text(item.name || '');
            $item.find('[data-fld="total-ingredient"]').text(item.ingredientUsages?.length || 0);
            $item.find('[data-fld="total-step"]').text(item.steps?.length || 0);
            $item.removeClass('hidden');
            $item.insertBefore($HL);
        }
    };

    var onLoadDone = function() {
        log('onLoadDone ...');
    };

    var log = function (data) {
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
//# sourceURL=BakeryAdminRecipe.js
