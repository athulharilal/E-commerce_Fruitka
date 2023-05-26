let userHelpers = require("../helpers/user-helpers");
let productsHelpers = require("../helpers/products-helpers");
let categoryHelpers = require("../helpers/category-helpers");
let adminHelpers = require("../helpers/admin-helpers");
let orderHelpers = require("../helpers/order-Helpers");
let bannerHelpers = require("../helpers/banner-helpers")

const {
  response
} = require("../app");
const moment = require('moment');
const cartHelpers = require("../helpers/cart-helpers");
const whishlistHelpers = require("../helpers/whishlistHelpers");
const multer = require("multer");






module.exports = {

  getAddProducts: function (req, res) {
    try {

      let catgeory = categoryHelpers.viewCategory().then((category) => {


        res.render("admin/add-product", {
          admin: true,
          category,
          login: req.session.adminLoggedIn
        });
      });
    } catch (error) {

    }
  },
  // postEditProducts:async(req,res)=>{
  //   try {
  //     req.body.Quantity = parseInt(req.body.Quantity)
  //     req.body.Price = parseInt(req.body.Price)

  //     let product = await productsHelpers.getOneProduct(req.params.id)
  //     let oldImages = product.oldImages
  //     let [oldFirst,oldSecond,oldThird]=[...oldImages]
  //     let images = []
  //     if (req.files.image1) {
  //       images[0] = req.files.image1[0].filename
  //     }else{
  //       images[0] = oldFirst
  //     }
  //     if (req.files.image2) {
  //       images[1] = req.files.image2[0].filename
  //     }else{
  //       image[1] =  oldSecond
  //     }if (condition) {
  //       images[2] = req.files.image3[0].filename
  //     }else{
  //       image[1] =  oldThird
  //     }

  //     req.body.images = images
  //     productsHelpers.updateproduct(req.params.id,req.body).then(()=>{
  //       req.redirect('/admin/add-product')
  //     })

  //   } catch (error) {

  //   }
  // },
  postAddProducts: (req, res) => {


    req.body.Quantity = parseInt(req.body.Quantity)
    req.body.Price = parseFloat(req.body.Price)

    let images = req.files.map(files => files.filename)
    req.body.images = images
    req.body.listed = true
    req.body.count = 0

    productsHelpers.addProduct(req.body).then(() => {
      res.redirect('/admin/add-product')
    }).catch((error) => {

    })


  },

  getEditProducts: async (req, res) => {
    try {
      // let users = await userhelpers.getOneUsers(req.params.id)
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

    }
  },
  postEditProdcutImages: (req, res) => {


    let id = req.params.id
    let images = req.files.map(files => files.filename)
    req.body.images = images





    productsHelpers.updateProductImage(id, req.body).then(() => {

      res.redirect("/admin/products");

    }).catch((error) => {

    })


  },
  postDeleteProdcuts: async (req, res) => {
    try {
      let proId = req.params.id;
      await productsHelpers.deleteProduct(proId);
      res.redirect("/admin/products");
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  },
  postDeleteProdcutsImages: async (req, res) => {



    let id = req.params.id

    productsHelpers.deleteProductImage(id, req.body).then((response) => {
      res.redirect('/admin/products')
    })
  },
  getViewSingleProducts: async (req, res) => {
    try {


      let products = await productsHelpers.getOneProduct(req.params.id);

      res.render('user/view-product', {
        user: true,
        products
      })

    } catch (error) {

    }
  },
  getViewProducts: async (req, res) => {
    try {

      let admin = req.session.admin

      let userDetails = await userHelpers.getOneUserDetails(req.params.id)

      let orderData = await orderHelpers.getUserOrders(req.params.id)

      res.render('admin/view-orders', {
        admin: true,
        orderData,
        userDetails,
        login: req.session.adminLoggedIn
      })

    } catch (error) {

    }
  },
  postChangeOrderStatus: async (req, res) => {
    try {

      let user = req.body.user
      let admin = req.session.admin

      adminHelpers.changeOrderStatus(req.body).then(async () => {

        res.redirect('/admin/Order-management')
      })

    } catch (error) {

    }
  },
  getOrderManagement: async (req, res) => {
    try {
      let allOrders = await orderHelpers.getAllOrders()

      res.render('admin/Order-management', {
        admin: true,
        allOrders,
        login: req.session.adminLoggedIn
      })
    } catch (error) {

    }
  },
  getSearch: async (req, res) => {
    let banners = await bannerHelpers.getAllBanners();
    let user = await req.session.user
    let cartCount = null;
    if (user) {
      cartCount = await cartHelpers.getCartCount(req.session.user._id);
    }
    let category = await categoryHelpers.getAllCategories();
    let count = await cartHelpers.getCartCount(user._id)
    let wishlistCount = await whishlistHelpers.getWishlistCount(user._id)
    let pageNumber = 1;
    if (req.query.page > 1) {
      pageNumber = parseInt(req.query.page);
    }
    const perPage = 3;

    productsHelpers.search(req.body.search).then((products) => {
        return productsHelpers.paginateData(products, pageNumber, perPage);
      })
      .then((result) => {
        const pageCount = Math.ceil(result.totalCount / perPage);
        res.render('user/user-home', {
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
        })
      })

  },
  sortProducts: async (req, res) => {
    let pageNumber = 1
    if (req.body.page > 1) {
      pageNumber = parseInt(req.body.page)
    }
    const perPage = 3
    let user = req.session.user
    let count = await cartHelpers.getCartCount(user._id)
    let category = await categoryHelpers.getAllCategories();
    let wishlistCount = await whishlistHelpers.getWishlistCount(user._id)
    await productsHelpers.sortProducts(req.body.selectedValue)
      .then((data) => {
        return productsHelpers.paginateData(data, pageNumber, perPage);
      })
      .then((result) => {
        const pageCount = Math.ceil(count / perPage);
        res.render('user/sort', {
          user,
          data: result.data,
          pageCount,
          currentPage: pageNumber,
          category,
          wishlistCount,
          search: true
        });
      })
      .catch((error) => {

      });
  },
  getFilter: async (req, res) => {
    let pageNumber = 1
    if (req.body.page > 1) {
      pageNumber = parseInt(req.body.page)
    }
    const perPage = 3
    let user = req.session.user
    let count = await cartHelpers.getCartCount(user._id)


    await productsHelpers.filterProducts(req.body.selectedValue)
      .then((data) => {

        return productsHelpers.paginateData(data, pageNumber, perPage)
      }).then((result) => {
        const pageCount = Math.ceil(count / perPage);
        res.render('user/user-home', {
          user,
          pageCount,
          currentPage: pageNumber,
          data: result.data,
          filter: true
        })
      }).catch((error) => {

      })


  },
  postEditProduct: (req, res) => {


    let id = req.params.id

    productsHelpers.updateproduct(req.params.id, req.body).then(() => {
      res.redirect("/admin");


    });
  },


}