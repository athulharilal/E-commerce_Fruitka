const adminHelpers = require('../helpers/admin-helpers')
const userHelpers = require('../helpers/user-helpers')
const productsHelpers = require('../helpers/products-helpers')
const dashboardHelpers = require('../helpers/dashboard-helpers')
const {
  Db
} = require('mongodb')
const couponHelpers = require('../helpers/coupon-helpers')
const categoryHelpers = require('../helpers/category-helpers')
const orderHelpers = require('../helpers/order-Helpers')




module.exports = {
  home:async(req, res)=>{
    try {
      let productCount = await dashboardHelpers.totalProducts()
      let userCount = await dashboardHelpers.getUserCount()
      let orderCount = await dashboardHelpers.totalOrders()
      let category = await categoryHelpers.getAllCategoriesforchart()
      let cancelCount = await dashboardHelpers.canelTotal()
      let totalCoupon = await couponHelpers.getAllCoupons()
      let totalRevenue = await dashboardHelpers.totalRevenue()
      let dailySales = await dashboardHelpers.dailySales()
      const options = {weekday: 'short' };
      const formattedDate = dailySales.toLocaleDateString('en-GB', options).replace(/\//g, '-');
        console.log(" Posted admin login credentials, which is: ");
        adminHelpers.doLogin(req.body).then(({ status, admin }) => {
      
            req.session.adminLoggedIn = true;
            req.session.admin = admin;
            res.render("admin/adminDashboard", {
                admin: true,
                login: req.session.adminLoggedIn,
                productCount,
                userCount,
                orderCount,
                cancelCount,
                totalRevenue,  
                formattedDate,
                category,
                totalCoupon             
              });          
        });
      
    } catch (error) {
      console.log(error);
    }
    },
  getAdminLogin: function (req, res) {
    try {

      if (req.session.adminLoggedIn) {
        userHelpers.getAllUsers().then((product) => {

          res.render("admin/adminDashboard", {
            admin: true,
            product,
            login: req.session.adminLoggedIn,
          });
        });
      } else {

        res.render("admin/adminlogin", {
          admin: true,
          loginErr: req.session.loginErr,
        });
      }
      req.session.loginErr = false;

    } catch (error) {

    }
  },
  postAdminLogin: async (req, res) => {
    try {
      adminHelpers.doLogin(req.body).then(({
        admin
      }) => {

        req.session.adminLoggedIn = true;
        req.session.admin = admin;
        res.redirect("/admin"

          // weeklyRevenue,
          // yearlyRevenue
        );
      });

    } catch (error) {

    }
  },
  getUserProfile: async (req, res) => {
    try {

      let user = req.params.id
      let products = await adminHelpers.userOrderDetails(user)
      let userAddress = await userHelpers.getUserData(user)
      let userDetails = await userHelpers.getOneUserDetails(user)



      res.render("admin/user-profile", {
        admin: true,
        login: req.session.adminLoggedIn,
        userDetails,
        userAddress,
        products

      });
    } catch (error) {

    }
  },
  // getAdminDashboard:(req,res)=>{
  //     return new Promise((resolve, reject) => {
  //         
  //     if (req.session.adminLoggedIn) {
  //       userHelpers.getAllUsers().then((product) => {
  //         
  //         res.render("admin/view-product", {
  //           admin: true,
  //           product,
  //           login: req.session.adminLoggedIn,
  //         });
  //       });
  //     } else {
  //       res.redirect("/admin/adminlogin");
  //     }
  // });
  // },
  getAllUsers: function (req, res) {
    try {

      if (req.session.adminLoggedIn) {
        userHelpers.getAllUsers().then((user) => {
          res.render("admin/all-users", {
            admin: true,
            user,
            login: req.session.adminLoggedIn,
          });
        });
      } else {
        res.redirect("/admin/adminlogin");
      }

    } catch (error) {

    }
  },
  getAddUsers: function (req, res) {
    try {

      if (req.session.adminLoggedIn) {
        userHelpers.getAllUsers().then((product) => {

          // 
          res.render("admin/add-users", {
            admin: true,
            login: req.session.adminLoggedIn,
          });
        });
      } else {
        res.redirect("/admin");
      }

    } catch (error) {

    }
  },
  postAddUsers: function (req, res) {
    try {
      if (req.session.adminLoggedIn) {
        userHelpers.addUser(req.body).then((data) => {


          res.redirect("/admin/allusers");
        });
      } else {
        res.render("admin/adminlogin");

      }

    } catch (error) {

    }
  },
  getProducts: function (req, res) {
    try {

      if (req.session.adminLoggedIn) {
        productsHelpers.getAllProducts().then((products) => {
          //resolve from products helpers ln:21 is used in then

          res.render("admin/view-product", {
            admin: true,
            products,
            login: req.session.adminLoggedIn,
          });
        });
      } else {
        res.redirect("/admin/adminlogin");
      }
    } catch (error) {

    }
  },

  getAdminLogout: (req, res) => {
    try {
      req.session.adminLoggedIn = false;
      req.session.admin = null;


      res.redirect("/admin");


    } catch (error) {

    }
    // req.session.destroy();
  },
  getDeleteUser: (req, res) => {
    try {
      if (req.session.adminLoggedIn) {
        let proId = req.params.id;

        userHelpers.deleteUser(proId).then((response) => {
          res.redirect("/admin/view-product");

        });
      } else {
        res.redirect("/admin");

      }

    } catch (error) {

    }
  },
  getEditUsers: async (req, res) => {
    try {
      if (req.session.adminLoggedIn) {
        let users = await userHelpers.getOneUser(req.params.id);

        res.render("admin/edit-users", {
          admin: true,
          users,
          login: req.session.adminLoggedIn,
        });

      } else {
        res.redirect("/admin");
      }

    } catch (error) {

    }
  },
  postEditUsers: async (req, res) => {
    try {

      userHelpers.updateUser(req.params, req.body).then(() => {
        res.redirect("/admin");

      });

    } catch (error) {

    }
  },

  getCancelOrders: (req, res) => {
    try {
      let admin = req.session.admin
      adminHelpers.cancelOrders(req.params.id).then(() => {
        res.redirect('/view-orders')
      })

    } catch (error) {

    }
  },
  getOrderProducts: async (req, res) => {
    try {

      let admin = req.session.admin
      let products = await userHelpers.getUserOrderProducts(req.params.id)

      res.render('admin/view-order-products', {
        admin: true,
        products,
        login: req.session.adminLoggedIn,
      })

    } catch (error) {

    }
  },
  getBlockUser: (req, res) => {
    try {

      adminHelpers.blockUser(req.params.id).then();
      res.redirect("/admin/allusers");
    } catch (error) {

    }
  },
  getUnblockUser: (req, res) => {
    try {

      adminHelpers.unblockUser(req.params.id).then();
      res.redirect("/admin/allusers");

    } catch (error) {

    }
  },

  getChartData: async (req, res) => {
    try {
      dashboardHelpers.getChartData().then(async (obj) => {
        const catData = await dashboardHelpers.catData();
        console.log(catData," catData");

        const paymentData = await dashboardHelpers.paymentData();
        const { result } = obj;
        const { weeklyReport } = obj;
        res.json({
          data: result, weeklyReport, catData, paymentData,
        });
      });
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }  ,
  getSalesReport: async (req, res) => {

    await adminHelpers.getSalesReport().then((response) => {
      let salesReport = response
      res.render('admin/sales-report', {
        admin: true,
        salesReport,
        login: req.session.adminLoggedIn
      })
    }).catch((error) => {

    })
  },

  postSalesDownload: async (req, res) => {


    await adminHelpers.getSalesFilter(req.body.startdate, req.body.enddate).then((response) => {
      let salesReport = response

      res.render('admin/sales-report', {
        admin: true,
        salesReport,
        login: req.session.adminLoggedIn
      })
    }).catch((error) => {

    })
  }
}