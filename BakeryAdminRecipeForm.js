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
		log('init DONE', this);
	};

	var initPageControl = function() {
    const ingredients = getIngredients();
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
  
    const nameInput = document.getElementById('recipe-name');
    const ingContainer = document.getElementById('ingredient-rows');
    const stepContainer = document.getElementById('step-rows');
    const titleEl = document.getElementById('form-title');
    const errorBox = document.getElementById('error-box');
  
    function showError(msg) {
      errorBox.textContent = msg || '';
    }
  
    function addIngredientRow(existing) {
      const row = document.createElement('div');
      row.className = 'flex flex-col md:flex-row gap-2 items-stretch md:items-center';
  
      const sel = document.createElement('select');
      sel.className = 'flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500';
      sel.innerHTML = '<option value="">เลือกวัตถุดิบ</option>';
      ingredients.forEach(i => {
        const opt = document.createElement('option');
        opt.value = i.id;
        opt.textContent = `${i.name} (${i.unit})`;
        sel.appendChild(opt);
      });
  
      const qty = document.createElement('input');
      qty.type = 'number';
      qty.step = '0.01';
      qty.placeholder = 'ปริมาณ';
      qty.className = 'md:w-32 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500';
  
      const del = document.createElement('button');
      del.type = 'button';
      del.textContent = 'ลบ';
      del.className = 'inline-flex items-center justify-center rounded-xl bg-rose-500/90 hover:bg-rose-500 px-3 py-1.5 text-xs font-medium text-white';
      del.onclick = () => row.remove();
  
      if (existing) {
        sel.value = existing.ingredientId;
        qty.value = existing.quantity;
      }
  
      row.appendChild(sel);
      row.appendChild(qty);
      row.appendChild(del);
      row.getValue = () => ({
        ingredientId: sel.value,
        quantity: parseFloat(qty.value)
      });
      ingContainer.appendChild(row);
    }
  
    document.getElementById('btn-add-ingredient').addEventListener('click', () => addIngredientRow());
  
    function renumberSteps() {
      [...stepContainer.children].forEach((r, i) => {
        r.querySelector('.step-number').textContent = i + 1;
      });
    }
  
    function addStepRow(text) {
      const row = document.createElement('div');
      row.className = 'step-row flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2';
      row.draggable = true;
  
      const num = document.createElement('div');
      num.className = 'step-number w-7 text-center text-xs font-semibold bg-slate-800 rounded-lg px-1 py-1';
      num.textContent = '?';
  
      const drag = document.createElement('div');
      drag.className = 'drag-handle text-slate-400 text-xs';
      drag.textContent = '☰';
  
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'พิมพ์ขั้นตอนการทำ...';
      input.value = text || '';
      input.className = 'flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500';
  
      const del = document.createElement('button');
      del.type = 'button';
      del.textContent = 'ลบ';
      del.className = 'inline-flex items-center justify-center rounded-xl bg-rose-500/90 hover:bg-rose-500 px-3 py-1.5 text-xs font-medium text-white';
      del.onclick = () => { row.remove(); renumberSteps(); };
  
      row.appendChild(num);
      row.appendChild(drag);
      row.appendChild(input);
      row.appendChild(del);
  
      row.addEventListener('dragstart', e => {
        row.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      row.addEventListener('dragend', () => {
        row.classList.remove('dragging');
        renumberSteps();
      });
  
      row.getValue = () => input.value.trim();
      stepContainer.appendChild(row);
      renumberSteps();
    }
  
    document.getElementById('btn-add-step').addEventListener('click', () => addStepRow(''));
  
    stepContainer.addEventListener('dragover', e => {
      e.preventDefault();
      const dragging = document.querySelector('.dragging');
      if (!dragging) return;
      const siblings = [...stepContainer.querySelectorAll('.step-row:not(.dragging)')];
      const next = siblings.find(s => e.clientY <= s.getBoundingClientRect().top + s.offsetHeight / 2);
      if (next) stepContainer.insertBefore(dragging, next);
      else stepContainer.appendChild(dragging);
    });
  
    // Load edit
    if (id) {
      const rec = getRecipes().find(r => r.id === id);
      if (rec) {
        titleEl.textContent = 'แก้ไขเมนู';
        nameInput.value = rec.name;
        (rec.ingredientUsages || []).forEach(u => addIngredientRow(u));
        (rec.steps || []).forEach(s => addStepRow(s));
      }
    }
  
    document.getElementById('recipe-form').addEventListener('submit', e => {
      e.preventDefault();
      const name = nameInput.value.trim();
      if (!name) return showError('กรุณากรอกชื่อเมนู');
  
      const ingredientUsages = [...ingContainer.children].map(r => r.getValue()).filter(v => v.ingredientId && v.quantity > 0);
      if (!ingredientUsages.length) return showError('กรุณาเพิ่มวัตถุดิบอย่างน้อย 1 รายการ');
  
      const steps = [...stepContainer.children].map(r => r.getValue()).filter(x => x);
      if (!steps.length) return showError('กรุณาเพิ่มขั้นตอนอย่างน้อย 1 ข้อ');
  
      let list = getRecipes();
      const data = { id: id || 'rec_' + Date.now(), name, ingredientUsages, steps };
      if (id) list = list.map(r => r.id === id ? data : r);
      else list.push(data);
      setRecipes(list);
      window.location.href = 'BakeryAdminRecipe.html';
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
//# sourceURL=BakeryAdminRecipe

// const user = requireLogin({ adminOnly:true });
  // if (!user) return;
  // highlightNav('rec');
  // initNavbarUser(user);