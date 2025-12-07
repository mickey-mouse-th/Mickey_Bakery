window.bakery = window.bakery || {};
window.bakery.BakeryIngredientForm = function($scope) {
    this.logPrefix = '[BakeryIngredientForm] ';
}

window.bakery.BakeryIngredientForm.prototype = function() {
    var self = this;

    var init = function($scope, cb) {
        self = this;
        self.$scope = $scope || $('#none');
        self.cb = cb;
        log('init ..', self);
        initPageControl();
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
		// onLoadDone();
	};

    var initPageControl = function() {
        self.$titleEl = self.$scope.find('#form-title');
        self.$nameInput = self.$scope.find('#name');
        self.$unitInput = self.$scope.find('#unit');
        self.$amountInput = self.$scope.find('#amount');
        self.$quantityInput = self.$scope.find('#quantity');
        self.$noteInput = self.$scope.find('#note');
        self.$errorBox = self.$scope.find('#error-box');

        self.$scope.on('submit', '#ingredient-form', function(e) {
            e.preventDefault();
            submitForm();
        });
    };

    var doLoad = function() {
        const params = new URLSearchParams(window.location.search);
        self.id = params.get('id');

        if (self.id) {
            // TODO
            const ing = [].find(i => i.id === self.id);
            if (ing) {
                self.$titleEl.text('แก้ไขวัตถุดิบ');
                self.$nameInput.val(ing.name);
                self.$unitInput.val(ing.unit);
                self.$amountInput.val(ing.amount);
                self.$quantityInput.val(ing.quantity ?? '');
                self.$noteInput.val(ing.note || '');
            }
        }
    };

    var showError = function(msg) {
        self.$errorBox.text(msg || '');
    };

    var submitForm = function() {
        const name = self.$nameInput.val().trim();
        const unit = self.$unitInput.val().trim();
        const amount = parseFloat(self.$amountInput.val());
        const qty = parseFloat(self.$quantityInput.val());
        const note = self.$noteInput.val().trim();

        if (!name || !unit) return showError('กรุณากรอกชื่อและหน่วย');
        if (!qty || qty <= 0) return showError('ปริมาณทั้งหมดต้องมากกว่า 0');
        if (!amount || amount <= 0) return showError('ราคา/หน่วยต้องมากกว่า 0');

        let list = []; // TODO
        if (self.id) {
            list = list.map(i => i.id === self.id ? { id: self.id, name, unit, amount, quantity: qty, note } : i);
        } else {
            list.push({ id: 'ing_' + Date.now(), name, unit, amount, quantity: qty, note });
        }
        setIngredients(list);
    };

    var log = function(data) {
        console.log(self.logPrefix, data);
    };

    var about = function() {
        log();
    };

    var publicFunctions = {
        init: init,
        load: load,
        about: about
    };
    return publicFunctions;
}();
//# sourceURL=BakeryIngredientForm
