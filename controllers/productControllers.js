let userHelpers = require("../helpers/userHelpers");
let productsHelpers = require("../helpers/productsHelpers");
let categoryHelpers = require("../helpers/categoryHelpers");
let adminHelpers = require("../helpers/adminHelpers");
let orderHelpers = require("../helpers/orderHelpers");
let bannerHelpers = require("../helpers/bannerHelpers");
const cartHelpers = require("../helpers/cartHelpers");
const wishlistHelpers = require("../helpers/whishlistHelpers");

module.exports = {
  getAddProducts: async (req, res) => {
    try {
      const category = await categoryHelpers.viewCategory();
      res.render("admin/addProduct", {
        admin: true,
        category,
        login: req.session.adminLoggedIn,
      });
    } catch (error) {
      console.log("An error occured ",error);
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
      res.redirect('/admin/addProduct');
    } catch (error) {
      console.log("An error occured ",error);
    }
  },

  getEditProducts: async (req, res) => {
    try {
      if (req.session.adminLoggedIn) {
        let products = await productsHelpers.getOneProduct(req.params.id);
        res.render("admin/editProducts", {
          admin: true,
          products,
          login: req.session.adminLoggedIn,
        });
      } else {
        res.redirect("/admin");
      }
    } catch (error) {
      console.log("An error occured ",error);
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
      console.log("An error occured ",error);
    }
  },

  postDeleteProdcuts: async (req, res) => {
    try {
      console.log("API call");
      const proId = req.params.id;
      await productsHelpers.deleteProduct(proId);
      res.sendStatus(200); // Send a success response
    } catch (error) {
      console.log("An error occurred: ", error);
      res.sendStatus(500); // Send an error response
    }
  },

  postDeleteProdcutsImages: async (req, res) => {
    try {
      let id = req.params.id;
      await productsHelpers.deleteProductImage(id, req.body);
      res.redirect("/admin/products");
    } catch (error) {
      console.log("An error occured ",error);
    }
  },

  getViewSingleProducts: async (req, res) => {
    try {
      let products = await productsHelpers.getOneProduct(req.params.id);
      res.render("user/viewProduct", {
        user: true,
        products,
      });
    } catch (error) {
      console.log("An error occured ",error);
    }
  },

  getViewProducts: async (req, res) => {
    try {
      const userDetails = await userHelpers.getOneUserDetails(req.params.id);
      const orderData = await orderHelpers.getUserOrders(req.params.id);
      res.render("admin/view-orders", {
        admin: true,
        orderData,
        userDetails,
        login: req.session.adminLoggedIn,
      });
    } catch (error) {
      console.log("An error occured ",error);
    }
  },

  postChangeOrderStatus: async (req, res) => {
    try {
      await adminHelpers.changeOrderStatus(req.body);
      res.redirect("/admin/order-management");
    } catch (error) {
      // Handle error
    }
  },

  getOrderManagement: async (req, res) => {
    try {
      const allOrders = await orderHelpers.getAllOrders();
      res.render("admin/orderManagement", {
        admin: true,
        allOrders,
        login: req.session.adminLoggedIn,
      });
    } catch (error) {
      console.log("An error occured ",error);
    }
  },

  getSearch: async (req, res) => {
    try {
      const banners = await bannerHelpers.getAllBanners();
      const user = req.session.user;
      let cartCount = null;
      if (user) {
        cartCount = await cartHelpers.getCartCount(user._id);
      }
      const category = await categoryHelpers.getAllCategories();
      const count = await cartHelpers.getCartCount(user._id);
      const wishlistCount = await wishlistHelpers.getWishlistCount(user._id);
      let pageNumber = 1;
      if (req.query.page > 1) {
        pageNumber = parseInt(req.query.page);
      }
      const perPage = 3;
  
      const products = await productsHelpers.search(req.body.search);
      const result = await productsHelpers.paginateData(products, pageNumber, perPage);
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
      console.log("An error occured ",error);
    }
  },

  sortProducts: async (req, res) => {
    try {
      let pageNumber = 1;
      if (req.body.page > 1) {
        pageNumber = parseInt(req.body.page);
      }
      const perPage = 3;
      const user = req.session.user;
      const count = await cartHelpers.getCartCount(user._id);
      const category = await categoryHelpers.getAllCategories();
      const data = await productsHelpers.sortProducts(req.body.selectedValue);
      const result = await productsHelpers.paginateData(data, pageNumber, perPage);
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
      console.log("An error occured ",error);
    }
  },

  postEditProduct: async (req, res) => {
    try {
      let id = req.params.id;
      await productsHelpers.updateProduct(id, req.body);
      res.redirect("/admin");
    } catch (error) {
      console.log("An error occured ",error);
    }
  },
};
