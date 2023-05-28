const adminHelpers = require('../helpers/admin-helpers');
const categoryHelpers = require('../helpers/category-helpers');

module.exports = {
  getAddCategories: async (req, res) => {
    try {
      const admin = req.session.admin;
      res.render("admin/add-categories", {
        catAddErr: req.session.catAddErr,
        admin: true,
        login: req.session.adminLoggedIn
      });
      req.session.catAddErr = false;
    } catch (error) {
      // Handle errors
    }
  },

  postAddCategories: async (req, res) => {
    try {
      await categoryHelpers.addcategories(req.body);
      res.redirect('/admin/view-category');
    } catch (error) {
      req.session.catAddErr = "Category Already Exists";
      res.redirect('/admin/add-categories');
    }
  },

  getViewCategory: async (req, res) => {
    try {
      const category = await categoryHelpers.viewCategory();
      res.render("admin/view-category", {
        admin: true,
        category,
        login: req.session.adminLoggedIn,
      });
    } catch (error) {
      // Handle errors
    }
  },

  getEditCategory: async (req, res) => {
    try {
      const category = await categoryHelpers.getOneCategory(req.params.id);
      res.render("admin/edit-category", {
        admin: true,
        category,
        login: req.session.adminLoggedIn,
      });
    } catch (error) {
      // Handle errors
    }
  },

  postEditCategory: async (req, res) => {
    try {
      await categoryHelpers.updateCategory(req.body);
      res.redirect("/admin/view-category");
    } catch (error) {
      // Handle errors
    }
  },

  getDeleteCategories: async (req, res) => {
    try {
      const catId = req.params.id;
      const deleteResponse = await categoryHelpers.deleteCategory(catId);
      let message = deleteResponse.message;
      if (deleteResponse.message === "There are products under this category") {
        message = "Cannot delete category. There are products under this category.";
      }
      res.redirect("/admin/view-category?message=" + encodeURIComponent(message));
      console.log("API call inside redirect");
    } catch (error) {
      res.render("error", {
        message: error.message
      });
    }
  },
};
