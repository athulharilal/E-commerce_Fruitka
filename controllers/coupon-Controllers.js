const couponHelpers = require("../helpers/coupon-helpers");

module.exports = {
  getCouponManagement: async (req, res) => {
    try {
      const admin = req.session.admin;
      const coupons = await couponHelpers.getAllCoupons();
      const coupExistErr = req.session.couponExist;
      req.session.couponExist = false;

      res.render('admin/coupon-management', {
        coupons,
        coupExistErr,
        admin,
        login: req.session.adminLoggedIn
      });
    } catch (error) {
      // Handle error
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
      res.render('admin/add-coupon', { admin, login: req.session.adminLoggedIn });
    } catch (error) {
      // Handle error
    }
  },

  getEditCoupon: async (req, res) => {
    try {
      const admin = req.session.admin;
      const coupon = await couponHelpers.getCoupon(req.params.id);
      res.render('admin/edit-coupon', { coupon, login: req.session.adminLoggedIn });
    } catch (error) {
      // Handle error
    }
  },

  postEditCoupon: (req, res) => {
    couponHelpers.deleteCoupon(req.params.id)
      .then(() => {
        res.redirect('/admin/coupon-management');
      })
      .catch((error) => {
        // Handle error
      });
  },

  getDeleteCoupon: (req, res) => {
    couponHelpers.deleteCoupon(req.params.id)
      .then(() => {
        res.redirect('/admin/coupon-management');
      })
      .catch((error) => {
        // Handle error
      });
  }
};
