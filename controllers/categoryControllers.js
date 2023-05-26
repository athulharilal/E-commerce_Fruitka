const {
  response
} = require('../app');
const adminHelpers = require('../helpers/admin-helpers')
let categoryHelpers = require("../helpers/category-helpers");



module.exports = {
  getAddCategories: async (req, res) => {
    try {
      let admin = req.session.admin

      res.render("admin/add-categories", {
        catAddErr: req.session.catAddErr,
        admin: true,
        login: req.session.adminLoggedIn
      });
      req.session.catAddErr = false

    } catch (error) {

    }
  },
  postAddCategories: async (req, res) => {

    categoryHelpers.addcategories(req.body).then((response) => {

      res.redirect('/admin/view-category')
      // if (response.status) {
      //   categoryHelpers.viewCategory().then((category) => {
      //       //resolve from products helpers ln:21 is used in then
      //       
      //       res.render("admin/view-category", {
      //         admin: true,
      //         category,
      //         login: req.session.adminLoggedIn,
      //       });
      //     }).catch((error)=>{
      //       
      //     })
      // }else{
      //   req.session.catAddErr = "Category Already Exist"
      //   res.redirect('/admin/add-categories')
      // }
    }).catch((error) => {
      req.session.catAddErr = " Category Already Exists"

      res.redirect('/admin/add-categories')
    })
  },
  getViewCategory: (req, res) => {

    categoryHelpers.viewCategory().then((category) => {
      //resolve from products helpers ln:21 is used in then

      res.render("admin/view-category", {
        admin: true,
        category,
        login: req.session.adminLoggedIn,
      });
    }).catch((error) => {

    })


  },
  getEditCategory: async (req, res) => {
    try {
      // let users = await userhelpers.getOneUsers(req.params.id)
      let category = await categoryHelpers.getOneCategory(req.params.id);
      res.render("admin/edit-category", {
        admin: true,
        category,
        login: req.session.adminLoggedIn,
      });

    } catch (error) {

    }
  },
  postEditCategory: async (req, res) => {
    await categoryHelpers.getOneCategory(req.params.id);
    categoryHelpers.updateCategory(req.body).then(() => {
      res.redirect("/admin/view-category");
    }).catch((error) => {
    })
  },
  getDeleteCategories: async (req, res) => {
    try {
      const response = await categoryHelpers.viewCategory();
      let catId = req.params.id;
      const deleteResponse = await categoryHelpers.deleteCategory(catId);
      // Check the resolved message
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
  }
  ,
}