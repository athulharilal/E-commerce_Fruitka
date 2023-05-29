let userHelpers = require("../helpers/user-helpers");
let productsHelpers = require("../helpers/products-helpers");
let categoryHelpers = require("../helpers/category-helpers");
let adminHelpers = require("../helpers/admin-helpers");
let orderHelpers = require("../helpers/order-Helpers");
let bannerHelpers = require("../helpers/banner-helpers");
const cartHelpers = require("../helpers/cart-helpers");
const whishlistHelpers = require("../helpers/whishlistHelpers");

module.exports = {
  getAddProducts: async (req, res) => {
    try {
      let category = await categoryHelpers.viewCategory();
      res.render("admin/add-product", {
        admin: true,
        category,
        login: req.session.adminLoggedIn,
      });
    } catch (error) {
      // Handle error
    }
  },

  postAddProducts: async (req, res) => {
    try {
      req.body.Quantity = parseInt(req.body.Quantity);
      req.body.Price = parseFloat(req.body.Price);
      let images = req.files.map((file) => file.filename);
      req.body.images = images;
      req.body.listed = true;
      req.body.count = 0;
      await productsHelpers.addProduct(req.body);
      res.redirect('/admin/add-product');
    } catch (error) {
      // Handle error
    }
  },

  getEditProducts: async (req, res) => {
    try {
      if (req.session.adminLoggedIn) {
        let products = await productsHelpers.getOneProduct(req.params.id);
        res.render("admin/edit-products", {
          admin: true,
          products,
          login: req.session.adminLoggedIn,
        });
      } else {
        res.redirect("/admin");
      }
    } catch (error) {
      // Handle error
    }
  },

  postEditProdcutImages: async (req, res) => {
    try {
      let id = req.params.id;
      let images = req.files.map((file) => file.filename);
      req.body.images = images;
      await productsHelpers.updateProductImage(id, req.body);
      res.redirect("/admin/products");
    } catch (error) {
      // Handle error
    }
  },

  postDeleteProdcuts: async (req, res) => {
    try {
      let proId = req.params.id;
      await productsHelpers.deleteProduct(proId);
      res.redirect("/admin/products");
    } catch (error) {
      // Handle error
    }
  },

  postDeleteProdcutsImages: async (req, res) => {
    try {
      let id = req.params.id;
      await productsHelpers.deleteProductImage(id, req.body);
      res.redirect("/admin/products");
    } catch (error) {
      // Handle error
    }
  },

  getViewSingleProducts: async (req, res) => {
    try {
      let products = await productsHelpers.getOneProduct(req.params.id);
      res.render("user/view-product", {
        user: true,
        products,
      });
    } catch (error) {
      // Handle error
    }
  },

  getViewProducts: async (req, res) => {
    try {
      let userDetails = await userHelpers.getOneUserDetails(req.params.id);
      let orderData = await orderHelpers.getUserOrders(req.params.id);
      res.render("admin/view-orders", {
        admin: true,
        orderData,
        userDetails,
        login: req.session.adminLoggedIn,
      });
    } catch (error) {
      // Handle error
    }
  },

  postChangeOrderStatus: async (req, res) => {
    try {
      await adminHelpers.changeOrderStatus(req.body);
      res.redirect("/admin/Order-management");
    } catch (error) {
      // Handle error
    }
  },

  getOrderManagement: async (req, res) => {
    try {
      let allOrders = await orderHelpers.getAllOrders();
      res.render("admin/Order-management", {
        admin: true,
        allOrders,
        login: req.session.adminLoggedIn,
      });
    } catch (error) {
      // Handle error
    }
  },

  getSearch: async (req, res) => {
    try {
      let banners = await bannerHelpers.getAllBanners();
      let user = req.session.user;
      let cartCount = null;
      if (user) {
        cartCount = await cartHelpers.getCartCount(req.session.user._id);
      }
      let category = await categoryHelpers.getAllCategories();
      let count = await cartHelpers.getCartCount(user._id);
      let wishlistCount = await whishlistHelpers.getWishlistCount(user._id);
      let pageNumber = 1;
      if (req.query.page > 1) {
        pageNumber = parseInt(req.query.page);
      }
      const perPage = 3;

      let products = await productsHelpers.search(req.body.search);
      let result = await productsHelpers.paginateData(products, pageNumber, perPage);
      const pageCount = Math.ceil(result.totalCount / perPage);

      res.render("user/user-home", {
        data: result.data,
        currentPage: pageNumber,
        user,
        show: true,
        banners,
        cartCount,
        user,
        category,
        count,
        wishlistCount,
        pageCount,
      });
    } catch (error) {
      // Handle error
    }
  },

  sortProducts: async (req, res) => {
    try {
      let pageNumber = 1;
      if (req.body.page > 1) {
        pageNumber = parseInt(req.body.page);
      }
      const perPage = 3;
      let user = req.session.user;
      let count = await cartHelpers.getCartCount(user._id);
      let category = await categoryHelpers.getAllCategories();
      let data = await productsHelpers.sortProducts(req.body.selectedValue);
      let result = await productsHelpers.paginateData(data, pageNumber, perPage);
      const pageCount = Math.ceil(count / perPage);

      res.render("user/sort", {
        user,
        data: result.data,
        pageCount,
        currentPage: pageNumber,
        category,
        wishlistCount,
        search: true,
      });
    } catch (error) {
      // Handle error
    }
  },

  getFilter: async (req, res) => {
    try {
      let pageNumber = 1;
      if (req.body.page > 1) {
        pageNumber = parseInt(req.body.page);
      }
      const perPage = 3;
      let user = req.session.user;
      let count = await cartHelpers.getCartCount(user._id);
      let data = await productsHelpers.filterProducts(req.body.selectedValue);
      let result = await productsHelpers.paginateData(data, pageNumber, perPage);
      const pageCount = Math.ceil(count / perPage);

      res.render("user/user-home", {
        user,
        pageCount,
        currentPage: pageNumber,
        data: result.data,
        filter: true,
      });
    } catch (error) {
      // Handle error
    }
  },

  postEditProduct: async (req, res) => {
    try {
      let id = req.params.id;
      await productsHelpers.updateproduct(id, req.body);
      res.redirect("/admin");
    } catch (error) {
      // Handle error
    }
  },
};
