var M = window.M || {};
M.initMENU = function() {
    M.MENU = M.MENU || {};

    var admin_page = {};
    admin_page['admin-recipe'] = 'BakeryAdminRecipe';
    admin_page['manage-role'] = 'BakeryManageRole';

    var admin_form = {};
    admin_form['admin-recipe'] = 'BakeryAdminRecipeForm';
    admin_form['manage-role'] = 'BakeryManageRoleForm';

    var user_page = {};
    user_page['user-recipe'] = 'BakeryUserRecipe';
    
    var user_form = {};
    user_form['user-recipe'] = 'BakeryUserRecipeForm';

    var share_page = {};
    share_page['login'] = 'BakeryUser';

    var share_form = {};

    M.MENU.admin = {
        page: admin_page,
        form: admin_form,
        default: 'BakeryUser'
    };

    M.MENU.user = {
        page: user_page,
        form: user_form,
        default: 'BakeryUser'
    };
    
    M.MENU.share = {
        page: share_page,
        form: share_form,
        default: 'BakeryManageRole'
    };
    
}