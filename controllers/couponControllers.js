const couponHelpers = require("../helpers/couponHelpers");

module.exports = {
  getCouponManagement: async (req, res) => {
    try {
      const admin = req.session.admin;
      const coupons = await couponHelpers.getAllCoupons();
      const coupExistErr = req.session.couponExist;
      req.session.couponExist = false;

      res.render('admin/couponManagement', {
        coupons,
        coupExistErr,
        admin,
        login: req.session.adminLoggedIn
      });
    } catch (error) {
      console.log("An error occured ",error);
    }
  },

  postAddCoupon: (req, res) => {
    couponHelpers.addCoupon(req.body)
      .then(() => {
        res.redirect('/admin/coupon-management');
      })
      .catch((error) => {
        req.session.couponExist = "Coupon Already Exists!";
        res.redirect('/admin/coupon-management');
      });
  },

  getAddCoupon: (req, res) => {
    try {
      const admin = req.session.admin;
      res.render('admin/addCoupon', { admin, login: req.session.adminLoggedIn });
    } catch (error) {
      console.log("An error occured ",error);
    }
  },

  getEditCoupon: async (req, res) => {
    try {
      const coupon = await couponHelpers.getCoupon(req.params.id);
      res.render('admin/editCoupon', { coupon, login: req.session.adminLoggedIn });
    } catch (error) {
      console.log("An error occured ",error);
    }
  },

  postEditCoupon: (req, res) => {
    couponHelpers.editCoupon(req.body)
      .then(() => {
        res.redirect('/admin/coupon-management');
      })
      .catch((error) => {
        console.log("An error occured ",error);
      });
  },

  getDeleteCoupon: (req, res) => {
    couponHelpers.deleteCoupon(req.params.id)
      .then(() => {
        res.redirect('/admin/coupon-management');
      })
      .catch((error) => {
        console.log("An error occured ",error);
      });
  }
};
