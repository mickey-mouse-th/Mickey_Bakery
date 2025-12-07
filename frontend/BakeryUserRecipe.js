window.bakery = window.bakery || {};
window.bakery.BakeryUserRecipe = function($scope) {
    this.logPrefix = '[BakeryUserRecipe] ';
}

window.bakery.BakeryUserRecipe.prototype = function() {
    var self = this;

    var init = function($scope) {
        self = this;
        self.$scope = $scope || $('#none');
        log('init ...', self);
        initPage();
        load();
        log('init DONE', self);
    };

    var initPage = function() {
        self.$container = document.getElementById('user-rec-list');
        self.$empty = document.getElementById('user-rec-empty');
    };

    var load = function() {
        const list = []; // TODO
        if (!list.length) {
            self.$empty.classList.remove('hidden');
            return;
        }
        list.forEach(r => {
            const div = document.createElement('div');
            div.className = 'rounded-2xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col gap-2';
            div.innerHTML = `
                <div class="text-sm font-semibold text-slate-50">${r.name}</div>
                <div class="text-[11px] text-slate-400">
                    วัตถุดิบ: ${r.ingredientUsages?.length || 0} รายการ • ขั้นตอน: ${r.steps?.length || 0} ข้อ
                </div>
                <a href="#/admin/form:recipe?id=${r.id}" class="mt-1 inline-flex items-center justify-center rounded-xl bg-sky-500/90 hover:bg-sky-500 px-3 py-1.5 text-xs font-medium text-white">
                    ดูรายละเอียด
                </a>
            `;
            self.$container.appendChild(div);
        });
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
//# sourceURL=BakeryUserRecipe.js
