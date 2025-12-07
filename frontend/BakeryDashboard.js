window.bakery = window.bakery || {};
window.bakery.BakeryDashboard = function($scope) {
    this.logPrefix = '[BakeryDashboard] ';
};

window.bakery.BakeryDashboard.prototype = function() {
    var self = this;

    var init = function($scope, cb) {
        self = this;
        self.$scope = $scope || $('#none');
        self.cb = cb;

        self.recipes = []; // TODO
        self.costs = []; // TODO
        self.empty = document.getElementById('dash-empty');
        self.content = document.getElementById('dash-content');
        self.tbody = document.getElementById('dash-tbody');
        self.chartEl = document.getElementById('profitChart');

        renderTable();
        renderChart();

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
        if (!self.costs.length) {
            self.empty.classList.remove('hidden');
            return;
        }
        self.empty.classList.add('hidden');
        self.content.classList.remove('hidden');

        self.tbody.innerHTML = '';

        const grouped = {};
        self.costs.forEach(c => {
            if (!grouped[c.recipeId]) grouped[c.recipeId] = { cost:0, profit:0 };
            grouped[c.recipeId].cost += c.totalCost;
            grouped[c.recipeId].profit += c.totalProfit;
        });

        self.labels = [];
        self.profits = [];

        Object.entries(grouped).forEach(([rid, v]) => {
            const r = self.recipes.find(x => x.id === rid);
            const name = r ? r.name : '(เมนูถูกลบแล้ว)';
            self.labels.push(name);
            self.profits.push(v.profit);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-3 py-2">${name}</td>
                <td class="px-3 py-2">${v.cost.toFixed(2)}</td>
                <td class="px-3 py-2">${v.profit.toFixed(2)}</td>
            `;
            self.tbody.appendChild(tr);
        });
    };

    var renderChart = function() {
        if (!self.labels || !self.profits) return;

        new Chart(self.chartEl, {
            type: 'bar',
            data: {
                labels: self.labels,
                datasets: [{
                    label: 'กำไรรวม (บาท)',
                    data: self.profits,
                    backgroundColor: 'rgba(56,189,248,0.7)',
                    borderColor: 'rgb(56,189,248)',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
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
        about: about,
    };
    return publicFunctions;
}();
//# sourceURL=BakeryDashboard.js
