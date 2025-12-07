window.bakery = window.bakery || {};
window.bakery.BakeryIngredient = function($scope) {
    this.logPrefix = '[BakeryIngredient] ';
};

window.bakery.BakeryIngredient.prototype = function() {
    var self = this;

    var init = function($scope, cb) {
        self = this;
        self.$scope = $scope || $('#none');
        self.cb = cb;

        self.tbody = document.getElementById('ing-tbody');
        self.empty = document.getElementById('ing-empty');

        renderTable();

        if (self.cb) self.cb();
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

    var renderTable = function() {
        const list = []; // TODO
        if (!list.length) {
            self.empty.classList.remove('hidden');
            return;
        }

        self.empty.classList.add('hidden');
        self.tbody.innerHTML = '';

        list.forEach(i => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-3 py-2">${i.name}</td>
                <td class="px-3 py-2">${i.quantity ?? ''}</td>
                <td class="px-3 py-2">${i.unit}</td>
                <td class="px-3 py-2">${i.amount}</td>
                <td class="px-3 py-2">${i.note || ''}</td>
                <td class="px-3 py-2 text-right space-x-1">
                    <a href="#/admin/form:ingredient?id=${i.id}" class="text-xs text-sky-300 hover:underline">แก้ไข</a>
                    <button data-id="${i.id}" class="btn-del text-xs text-rose-400 hover:underline">ลบ</button>
                </td>
            `;
            self.tbody.appendChild(tr);
        });

        self.tbody.addEventListener('click', handleDelete);
    };

    var handleDelete = function(e) {
        if (e.target.classList.contains('btn-del')) {
            const id = e.target.getAttribute('data-id');
            if (!confirm('ลบวัตถุดิบนี้?')) return;

            // TODO
            const list = [].filter(x => x.id !== id);
            setIngredients(list);
            location.reload();
        }
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
        about: about,
    };
    return publicFunctions;
}();
//# sourceURL=BakeryIngredient.js
