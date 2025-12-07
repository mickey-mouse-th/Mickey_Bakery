window.bakery = window.bakery || {};
window.bakery.BakeryUserRecipeForm = function($scope) {
    this.logPrefix = '[BakeryUserRecipeForm] ';
}

window.bakery.BakeryUserRecipeForm.prototype = function() {
    var self = this;

    var init = function($scope) {
        self = this;
        self.$scope = $scope || $('#none');
        log('init ..', self);

        const params = new URLSearchParams(window.location.search);
        self.id = params.get('id');

        self.titleEl = document.getElementById('recipe-title');
        self.errorBox = document.getElementById('error-box');
        self.ingredientList = document.getElementById('ingredient-list');
        self.stepList = document.getElementById('step-list');

        loadRecipe();
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

    var loadRecipe = function() {
        const recipes = []; // TODO
        const ingredients = []; // TODO

        if (!self.id) {
            showError('ไม่พบเมนูนี้ในระบบ');
            return;
        }

        const rec = recipes.find(r => r.id === self.id);
        if (!rec) {
            showError('ไม่พบเมนูนี้ในระบบ');
            return;
        }

        renderRecipe(rec, ingredients);
    };

    var renderRecipe = function(rec, ingredients) {
        self.titleEl.textContent = rec.name || 'ไม่ระบุชื่อ';

        // render ingredients
        self.ingredientList.innerHTML = '';
        (rec.ingredientUsages || []).forEach(u => {
            const ing = ingredients.find(i => i.id === u.ingredientId);
            if (ing) {
                const li = document.createElement('li');
                li.textContent = `${ing.name} – ${u.quantity} ${ing.unit}`;
                self.ingredientList.appendChild(li);
            }
        });

        // render steps
        self.stepList.innerHTML = '';
        (rec.steps || []).forEach(s => {
            const li = document.createElement('li');
            li.textContent = s;
            self.stepList.appendChild(li);
        });
    };

    var showError = function(msg) {
        self.errorBox.textContent = msg || '';
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
//# sourceURL=BakeryUserRecipeForm.js
