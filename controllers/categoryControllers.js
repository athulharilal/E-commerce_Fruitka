const adminHelpers = require('../helpers/adminHelpers');
const categoryHelpers = require('../helpers/categoryHelpers');

module.exports = {
  getAddCategories: async (req, res) => {
    try {
      res.render("admin/addCategories", {
        catAddErr: req.session.catAddErr,
        admin: true,
        login: req.session.adminLoggedIn
      });
      req.session.catAddErr = false;
    } catch (error) {
      console.log("An error occured ",error);
    }
  },

  postAddCategories: async (req, res) => {
    try {
      
      await categoryHelpers.addCategory(req.body);
      res.redirect('/admin/viewCategory');
    } catch (error) {
      req.session.catAddErr = "Category Already Exists";
      res.redirect('/admin/addCategories');
    }
  },

  getViewCategory: async (req, res) => {
    try {
      const category = await categoryHelpers.viewCategory();
      res.render("admin/viewCategory", {
        admin: true,
        category,
        login: req.session.adminLoggedIn,
      });
    } catch (error) {
      console.log("An error occured ",error);
    }
  },

  getEditCategory: async (req, res) => {
    try {
      const category = await categoryHelpers.getOneCategory(req.params.id);
      res.render("admin/editCategory", {
        admin: true,
        category,
        login: req.session.adminLoggedIn,
      });
    } catch (error) {
      console.log("An error occured ",error);
    }
  },

  postEditCategory: async (req, res) => {
    try {
      await categoryHelpers.updateCategory(req.body);
      res.redirect("/admin/viewCategory");
    } catch (error) {
      console.log("An error occured ",error);
    }
  },

  getDeleteCategories: async (req, res) => {
    try {
      const catId = req.params.id;
      const deleteResponse = await categoryHelpers.deleteCategory(catId);
      let message;
    
      if (deleteResponse === null) {
        message = "Cannot delete category. There are products under this category.";
      } else if (deleteResponse === true) {
        message = "Category deleted successfully";
      } else {
        message = "An error occurred during category deletion";
      }
    
      if (req.xhr) {
        res.json({ message: message }); // Send JSON response for AJAX request
      } else {
        res.redirect("/admin/viewCategory?message=" + encodeURIComponent(message));
      }
    } catch (error) {
      res.render("error", {
        message: error.message
      });
    }
  }
}
