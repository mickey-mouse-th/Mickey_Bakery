window.bakery = window.bakery || {};
window.bakery.BakeryCost = function($scope) {
    this.logPrefix = '[BakeryCost] ';
};

window.bakery.BakeryCost.prototype = function() {
    var self = this;

    var init = function($scope, cb) {
        self = this;
        self.$scope = $scope || $('#none');
        self.cb = cb;

        log('init ..', self);
        initPageControl();
        log('init DONE', self);
    };

    var load = function(info, cbLoadDone, cbPageBack) {
		log('load at ' + new Date().toISOString(), info);
		self.info = info;
		self.cbLoadDone = cbLoadDone;
		self.cbPageBack = cbPageBack;

		// Clear Filter
		self.$scope.find(':input.txtSearch').val("");

		// doLoad();
		onLoadDone();
	};

    var initPageControl = function() {
        var select = self.$scope.find('#cost-recipe');
        var errorBox = self.$scope.find('#error-box');
        var tbody = self.$scope.find('#cost-tbody');
        var empty = self.$scope.find('#cost-empty');

        function showError(msg) { errorBox.text(msg || ''); }

        // ดึงเมนูและ populate select
        var recipes = []; // TODO
        select.html('<option value="">เลือกเมนู</option>');
        recipes.forEach(r => {
            var opt = $('<option></option>').val(r.id).text(r.name);
            select.append(opt);
        });

        function renderTable() {
            tbody.html('');
            var list = []; // TODO
            if (!list.length) {
                empty.removeClass('hidden');
                return;
            }
            empty.addClass('hidden');
            list.forEach(c => {
                var rec = recipes.find(r => r.id === c.recipeId);
                var name = rec ? rec.name : '(เมนูถูกลบแล้ว)';
                var tr = $(`
                    <tr>
                        <td class="px-3 py-2">${name}</td>
                        <td class="px-3 py-2">${c.totalCost.toFixed(2)}</td>
                        <td class="px-3 py-2">${c.quantity}</td>
                        <td class="px-3 py-2">${c.pricePerPiece.toFixed(2)}</td>
                        <td class="px-3 py-2">${c.profitPerPiece.toFixed(2)}</td>
                        <td class="px-3 py-2">${c.totalProfit.toFixed(2)}</td>
                    </tr>
                `);
                tbody.append(tr);
            });
        }

        renderTable();

        // Handle form submit
        self.$scope.find('#cost-form').on('submit', function(e) {
            e.preventDefault();

            var recipeId = select.val();
            var total = parseFloat(self.$scope.find('#cost-total').val());
            var qty = parseFloat(self.$scope.find('#cost-qty').val());
            var price = parseFloat(self.$scope.find('#cost-price').val());

            if (!recipeId) return showError('กรุณาเลือกเมนู');
            if (!total || total <= 0) return showError('กรุณากรอกต้นทุนรวม');
            if (!qty || qty <= 0) return showError('กรุณากรอกจำนวนชิ้น');
            if (!price || price <= 0) return showError('กรุณากรอกราคาขาย/ชิ้น');

            var costPerPiece = total / qty;
            var profitPerPiece = price - costPerPiece;
            var totalProfit = profitPerPiece * qty;

            var list = []; // TODO
            list.push({
                id: 'cost_' + Date.now(),
                recipeId,
                totalCost: total,
                quantity: qty,
                pricePerPiece: price,
                profitPerPiece,
                totalProfit
            });

            setCosts(list);
            showError('');
            renderTable();
        });
    };

    var onLoadDone = function() {
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
//# sourceURL=BakeryCost.js
