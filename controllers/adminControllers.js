const adminHelpers = require('../helpers/adminHelpers');
const userHelpers = require('../helpers/userHelpers')
const productsHelpers = require('../helpers/productsHelpers')
const dashboardHelpers = require('../helpers/dashboardHelpers')
const {
  Db
} = require('mongodb')
const couponHelpers = require('../helpers/couponHelpers')
const categoryHelpers = require('../helpers/categoryHelpers')
const orderHelpers = require('../helpers/orderHelpers')


module.exports = {
  home: async (req, res) => {
    try {
      const productCount = await dashboardHelpers.totalProducts();
      const userCount = await dashboardHelpers.getUserCount();
      const orderCount = await dashboardHelpers.totalOrders();
      const category = await categoryHelpers.getAllCategoriesForChart();
      const cancelCount = await dashboardHelpers.canelTotal();
      const totalCoupon = await couponHelpers.getAllCoupons();
      const totalRevenue = await dashboardHelpers.totalRevenue();
  
      const { admin } = await adminHelpers.doLogin(req.body);
  
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
        category,
        totalCoupon
      });
    } catch (error) {
      console.log("An error occured ",error);
    }
  },  

  getAdminLogin: async function (req, res) {
    try {
      if (req.session.adminLoggedIn) {
        const product = await userHelpers.getAllUsers();
        res.render("admin/adminDashboard", {
          admin: true,
          product,
          login: req.session.adminLoggedIn,
        });
      } else {
        res.render("admin/adminLogin", {
          admin: true,
          loginErr: req.session.loginErr,
        });
      }
      req.session.loginErr = false;
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);

    }
  },

  postAdminLogin: async function (req, res) {
    try {
      const { admin } = await adminHelpers.doLogin(req.body);
      req.session.adminLoggedIn = true;
      req.session.admin = admin;
      res.redirect("/admin");
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
  },

  getUserProfile: async function (req, res) {
    try {
      const user = req.params.id;
      const products = await adminHelpers.userOrderDetails(user);
      const userAddress = await userHelpers.getUserData(user);
      const userDetails = await userHelpers.getOneUserDetails(user);
  
      res.render("admin/userProfile", {
        admin: true,
        login: req.session.adminLoggedIn,
        userDetails,
        userAddress,
        products
      });
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
  },

  getAllUsers: async function (req, res) {
    try {
      if (req.session.adminLoggedIn) {
        const user = await userHelpers.getAllUsers();
        res.render("admin/allUsers", {
          admin: true,
          user,
          login: req.session.adminLoggedIn,
        });
      } else {
        res.redirect("/admin/adminLogin");
      }
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
  },

  getAddUsers: async function (req, res) {
    try {
      if (req.session.adminLoggedIn) {
        // Retrieve all users (if necessary)
        // const users = await userHelpers.getAllUsers();
  
        res.render("admin/add-users", {
          admin: true,
          login: req.session.adminLoggedIn,
          // Pass users if needed
          // users
        });
      } else {
        res.redirect("/admin");
      }
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
  },

  postAddUsers: async function (req, res) {
    try {
      if (req.session.adminLoggedIn) {
        await userHelpers.addUser(req.body);
        res.redirect("/admin/allusers");
      } else {
        res.render("admin/adminLogin");
      }
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
  },

  getProducts: async function (req, res) {
    try {
      if (req.session.adminLoggedIn) {
        const products = await productsHelpers.getAllProducts();
        res.render("admin/viewProduct", {
          admin: true,
          products,
          login: req.session.adminLoggedIn,
        });
      } else {
        res.redirect("/admin/adminLogin");
      }
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
  },

  getAdminLogout: function (req, res) {
    try {
      req.session.adminLoggedIn = false;
      req.session.admin = null;
  
      res.redirect("/admin");
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
    // req.session.destroy();
  },

  getDeleteUser: async function (req, res) {
    try {
      if (req.session.adminLoggedIn) {
        const userId = req.params.id;
  
        await userHelpers.deleteUser(userId);
        res.redirect("/admin/view-product");
      } else {
        res.redirect("/admin");
      }
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
  },

  getEditUsers: async (req, res) => {
    try {
      if (req.session.adminLoggedIn) {
        const users = await userHelpers.getOneUser(req.params.id);
  
        res.render("admin/edit-users", {
          admin: true,
          users,
          login: req.session.adminLoggedIn,
        });
      } else {
        res.redirect("/admin");
      }
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
  },
  
  postEditUsers: async (req, res) => {
    try {
      await userHelpers.updateUser(req.params, req.body);
      res.redirect("/admin");
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
  },
  
  getCancelOrders: async (req, res) => {
    try {
      await adminHelpers.cancelOrders(req.params.id);
      res.redirect("/viewOrders");
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
  },
  
  getOrderProducts: async (req, res) => {
    try {
      const products = await userHelpers.getUserOrderProducts(req.params.id);
      res.render("admin/viewOrderProducts", {
        admin: true,
        products,
        login: req.session.adminLoggedIn,
      });
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
  },
  
  getBlockUser: async (req, res) => {
    try {
      await adminHelpers.blockUser(req.params.id);
      res.redirect("/admin/allusers");
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
  },
  
  getUnblockUser: async (req, res) => {
    try {
      await adminHelpers.unblockUser(req.params.id);
      res.redirect("/admin/allusers");
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
  },
  
  getChartData: async (req, res) => {
    try {
      const obj = await dashboardHelpers.getChartData();
      const catData = await dashboardHelpers.catData();
      const paymentData = await dashboardHelpers.paymentData();
      const { result, weeklyReport } = obj;
  
      res.json({
        data: result,
        weeklyReport,
        catData,
        paymentData,
      });
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log('An error occurred:', error);
    }
  },
  
  getSalesReport: async (req, res) => {
    try {
      const salesReport = await adminHelpers.getSalesReport();
      res.render("admin/salesReport", {
        admin: true,
        salesReport,
        login: req.session.adminLoggedIn,
      });
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
  },

  postSalesDownload: async (req, res) => {
    try {
      const salesReport = await adminHelpers.getSalesFilter(req.body.startdate, req.body.enddate);
      res.render("admin/salesReport", {
        admin: true,
        salesReport,
        login: req.session.adminLoggedIn,
      });
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
  }
}  