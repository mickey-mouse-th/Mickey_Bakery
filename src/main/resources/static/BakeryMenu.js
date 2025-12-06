var M = window.M || {};
M.initMENU = function() {
    M.MENU = M.MENU || {};

    var admin_page = {};
    admin_page['admin-recipe'] = 'BakeryAdminRecipe';
    admin_page['manage-role'] = 'BakeryManageRole';
    admin_page['ingredient'] = 'BakeryIngredient';
    admin_page['cost'] = 'BakeryCost';
    admin_page['dashboard'] = 'BakeryDashboard';
    
    var admin_form = {};
    admin_form['form:admin-recipe'] = 'BakeryAdminRecipeForm';
    admin_form['form:manage-role'] = 'BakeryManageRoleForm';
    admin_form['form:ingredient'] = 'BakeryIngredientForm';
    admin_form['form:cost'] = 'BakeryCostForm';
    admin_form['form:dashboard'] = 'BakeryDashboardForm';

    var user_page = {};
    
    var user_form = {};

    var share_page = {};
    share_page['login'] = 'BakeryUser';
    share_page['user-recipe'] = 'BakeryUserRecipe';

    var share_form = {};
    share_form['form:user-recipe'] = 'BakeryUserRecipeForm';

    M.MENU.admin = {
        page: admin_page,
        form: admin_form,
        default: 'BakeryAdminRecipe'
    };

    M.MENU.user = {
        page: user_page,
        form: user_form,
        default: 'BakeryUserRecipe'
    };
    
    M.MENU.share = {
        page: share_page,
        form: share_form,
        default: ''
    };
    
}