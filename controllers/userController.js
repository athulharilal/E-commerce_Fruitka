const userHelpers = require("../helpers/userHelpers");
const productsHelpers = require("../helpers/productsHelpers");
const cartHelpers = require("../helpers/cartHelpers");
const bannerHelpers = require("../helpers/bannerHelpers");
const couponHelpers = require("../helpers/couponHelpers");
const whishlistHelpers = require("../helpers/whishlistHelpers");
const orderHelpers = require("../helpers/orderHelpers");

module.exports = {
  home: async (req, res) => {
    try {
      const banners = await bannerHelpers.getAllBanners();
      const user = req.session.user;
      let cartCount = null;

      if (req.session.user) {
        cartCount = await cartHelpers.getCartCount(req.session.user._id);
      }

      let pageNumber = parseInt(req.query.page) || 1;
      const perPage = 3;

      const products = await productsHelpers.getAllProducts();
      const result = await productsHelpers.paginateData(products, pageNumber, perPage);
      const pageCount = Math.ceil(result.totalCount / perPage);

      res.render("user/userHome", {
        data: result.data,
        pageCount,
        currentPage: pageNumber,
        user,
        show: true,
        cartCount,
        banners
      });
    } catch (error) {
      console.log(error);
      res.render("user/404", {
        user: true
      });
    }
  },

  about: (req, res) => {
    res.render('user/about', {
      user: true
    });
  },

  getContact: (req, res) => {
    res.render('user/contact', {
      user: true
    });
  },

  getLogin: (req, res) => {
    try {
    
      if (req.session.loggedIn) {
        res.render("user/userHome");
      } else {
        res.render("user/login", {
          loginError: req.session.loginErr
        });
        req.session.loginErr = false;
      }
    } catch (error) {
      console.log(error);
      res.render('user/404', {
        user: true
      });
    }
  },

  postLogin: async (req, res) => {
    try {
      const response = await userHelpers.doLogin(req.body);

      if (response.status) {
        if (response.user.isBlocked) {
          req.session.loginErr = true;
          res.render("user/login", {
            loginError: true,
            blocked: true
          });
        } else {
          req.session.loggedIn = true;
          req.session.user = response.user;
          res.redirect("/");
        }
      } else {
        req.session.loginErr = true;
        res.redirect("/login");
      }
    } catch (error) {
      res.render("error", {
        message: "An error occurred during login."
      });
    }
  },

  getSignup: (req, res) => {
    try {
      res.render("user/signup");
    } catch (error) {
      res.render('user/404', {
        user: true
      });
    }
  },

  postSignup: async (req, res) => {
    try {
      const response = await userHelpers.doSignup(req.body);

      if (response) {
        res.redirect('/login');
      } else {
        req.session.signUpErr = "Email or mobile already exist";
        res.redirect('/signup');
      }
    } catch (error) {
      req.session.referalErr = "Invalid referral Code";
      res.redirect('/signup');
    }
  },

    getLogout: (req, res) => {
      try {
        // req.session.destroy();
        req.session.loggedIn = false;
        req.session.user = null;
        res.redirect("/");
      } catch (error) {
        console.log(error);
        res.render('user/404', {
          user: true
        });
      }
    },
  
    getOtp: (req, res) => {
      try {
        const noUserErr = req.session.noUserErr;
        const blockErr = req.session.blockErr;
        res.render("users/otp-login", {
          noUserErr,
          blockErr,
          validation: true
        });
        req.session.noUserErr = false;
        req.session.blockErr = false;
      } catch (error) {
        res.render('user/404', {
          user: true
        });
      }
    },
  
    postOtp: (req, res) => {
      try {
        const noUserErr = req.session.noUserErr;
        const blockErr = req.session.blockErr;
        res.render("users/otp-login", {
          noUserErr,
          blockErr,
          validation: true
        });
        req.session.noUserErr = false;
        req.session.blockErr = false;
      } catch (error) {
        res.render('user/404', {
          user: true
        });
      }
    },
  
    getPlaceOrders: async (req, res) => {
      try {
        const userID = req.session.user._id;
        const todayDate = new Date().toISOString().slice(0, 10);
        const startCouponOffer = await couponHelpers.startCouponOffer(todayDate);
        const cartCount = await cartHelpers.getCartCount(userID);
        const wishListCount = await whishlistHelpers.getWishlistCount(userID);
        const products = await cartHelpers.getCartProducts(userID);
        const userAddress = await userHelpers.getUserData(userID);
        const totalValue = await cartHelpers.getTotalAmount(userID);
        const wallet = await userHelpers.findWallet(userID);
        const walletStatus = wallet.wallet > totalValue;
  
        res.render('user/placeOrder', {
          products,
          totalValue,
          user: req.session.user,
          userAddress,
          startCouponOffer,
          cartCount,
          wishListCount,
          walletStatus
        });
      } catch (error) {
        console.log(error, " error");
        res.render('user/404', {
          user: true
        });
      }
    },
  
    postPlaceOrders: async (req, res) => {
      try {
        console.log(req.session.user," user");
        const user = req.session.user._id;
        const products = await cartHelpers.getCartProductList(user);
        let totalPrice = await cartHelpers.getTotalAmount(user);
        const wallet = await userHelpers.findWalletAmount(user);
        
        if (req.session.couponTotal) {
          totalPrice = req.session.couponTotal;
        }
        
        const orderID = await orderHelpers.placeOrder(req.body, products, totalPrice, user);
        
        if (req.body['PaymentMethod'] === 'COD') {
          req.session.couponTotal = null;
          res.json({
            codSuccess: true
          });
        } else if (req.body['PaymentMethod'] === 'Razorpay') {
          const response = await userHelpers.generateRazorpay(orderID, totalPrice);
          req.session.couponTotal = null;
          res.json(response);
        } else {
          await userHelpers.reduceWallet(req.session.user, totalPrice, wallet.wallet);
          req.session.couponTotal = null;
          res.json({
            wallet: true
          });
        }
  
        if (req.session.couponTotal) {
          const couponName = req.body.coupon;
          const discountValue = parseInt(req.session.discountValue);
          const couponTotal = req.session.couponTotal;
          await couponHelpers.couponOrderUpdate(orderID, couponName, discountValue, couponTotal);
          // Perform any necessary actions after coupon order update
        }
      } catch (error) {
        res.render('user/404', {
          user: true
        });
      }
    },
  
    postverifyPayment: (req, res) => {
      try {
        userHelpers.verifyPayment(req.body).then(() => {
          userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
            res.json({
              status: true
            });
          });
        }).catch((err) => {
          res.json({
            status: false
          });
        });
      } catch (error) {
        res.render('user/404', {
          user: true
        });
      }
    },
  
    getOrderPlaced: (req, res) => {
      try {
        res.render('user/order-placed', {
          order: true,
          user: true
        });
      } catch (error) {
        res.render('user/404', {
          user: true
        });
      }
    },
  
    getViewOrderedProducts: async (req, res) => {
      try {
        const products = await userHelpers.getUserOrderProducts(req.params.id);
        res.render("user/viewOrderProducts", {
          user: true,
          products
        });
      } catch (error) {
        res.render('user/404', {
          user: true
        });
      }
    },
  
    getMyProfile: async (req, res) => {
      try {
        res.render('user/myProfile', {
          user: req.session.user
        });
      } catch (error) {
        res.render('user/404', {
          user: true
        });
      }
    },

    getEditPersonalDetails: async (req, res) => {
    try {
      const userDetails = await userHelpers.getOneUserDetails(req.session.user._id);

      res.render('user/editPersonalDetails', {
        user: req.session.user._id,
        userDetails
      });
    } catch (error) {
      res.render('user/404', {
        user: true
      });
    }
  },

  postEditPersonalDetails: async (req, res) => {
    try {
      await userHelpers.editMyprofile(req.body, req.session.user._id);
      res.redirect('/editPersonalDetails');
    } catch (error) {
      res.render('user/404', {
        user: true
      });
    }
  },

  getEditUserAddress: async (req, res) => {
    try {
      const userDetails = await userHelpers.getOneUserDetails(req.session.user._id);
      res.render('user/edit-user-address', {
        user: true,
        userDetails
      });
    } catch (error) {
      res.render('user/404', {
        user: true
      });
    }
  },

  getAddAddrress: async (req, res) => {
    try {
      res.render('user/add-address', {
        user: true
      });
    } catch (error) {
      res.render('user/404', {
        user: true
      });
    }
  },

  postPlaceOrderAddAddrress: async (req, res) => {
    try {
      await userHelpers.addAddress(req.body, req.session.user._id);
      res.redirect('/placeOrder');
    } catch (error) {
      res.render('user/404', {
        user: true
      });
    }
  },

  postAddAddrress: async (req, res) => {
    try {
      await userHelpers.addAddress(req.body, req.session.user._id);
      res.redirect('/myProfile');
    } catch (error) {
      res.render('user/404', {
        user: true
      });
    }
  },

  postEditAddress: async (req, res) => {
    try {
      await userHelpers.editAddress(req.body, req.session.user._id);
      res.json({
        status: true
      });
    } catch (error) {
      res.json({
        status: false
      });
    }
  },

  postDeleteAddress: (req, res) => {
    try {
      const addressId = req.params.addressId;
      const userId = req.session.user._id;
      userHelpers.deleteAddress(addressId, userId)
        .then(() => {
          res.json({
            status: true,
            message: 'Address deleted successfully'
          });
        })
        .catch((error) => {
          res.json({
            status: false,
            message: 'Failed to delete address'
          });
        });
    } catch (error) {
      res.render('user/404', {
        user: true
      });
    }
  },

  getChangepassword: (req, res) => {
    try {
      res.render('user/changePassword', {
        user: true
      });
    } catch (error) {
      res.render('user/404', {
        user: true
      });
    }
  },

  postChangePassword: async (req, res) => {
    try {
      if (req.body.confirmNewPassword === req.body.newPassword) {
        const response = await userHelpers.changePassword(req.session.user._id, req.body);

        if (response.status) {
          req.session.loggedIn = false;
          req.session.user = null;
          res.redirect('/');
        } else {
          const userDetails = await userHelpers.getOneUserDetails(req.session.user._id);
          res.render('user/changePassword', {
            user: true,
            userDetails,
            message: 'Incorrect Password'
          });
        }
      } else {
        const userDetails = await userHelpers.getOneUserDetails(req.session.user._id);
        res.render('user/changePassword', {
          user: true,
          userDetails,
          message: 'Enter the same Password'
        });
      }
    } catch (error) {
      res.render('user/404', {
        user: true
      });
    }
  },

  getInvoice: async (req, res) => {
    try {
      const user = req.session.user;
      const orderID = req.params.id;
      const invoice = await userHelpers.getUserInvoice(orderID);
      const products = await userHelpers.getUserOrderProducts(orderID);
      const orders = await orderHelpers.getUserOrders(orderID);

      res.render('user/invoice', {
        user,
        invoice,
        products,
        orders
      });
    } catch (error) {
      res.render('user/404', {
        user: true
      });
    }
  },

  getLoginSecurity: async (req, res) => {
    try {
      const userDetails = await userHelpers.getOneUserDetails(req.session.user._id);

      res.render('user/loginNSecurity', {
        user: true,
        userDetails
      });
    } catch (error) {
      res.render('user/404', {
        user: true
      });
    }
  },

  postCouponApply: async (req, res) => {
    try {
      const id = req.session.user._id;
      const coupon = req.body.coupon;
      const totalAmount = await cartHelpers.getTotalAmount(req.session.user._id);
      const response = await couponHelpers.validateCoupon(req.body, id, totalAmount);

      req.session.couponTotal = response.total;
      req.session.discountValue = response.discountValue;

      console.log(response," response");

      if (response.success) {
        couponHelpers.upDateCoupon(req.body, id, coupon);
        res.json({
          couponSuccess: true,
          total: response.total,
          CouponName: response.CouponName,
          discountValue: response.discountValue,
          coupon
        });
      } else if (response.couponUsed) {
        res.json({
          couponUsed: true
        });
      } else if (response.couponExpired) {
        res.json({
          couponExpired: true
        });
      } else {
        res.json({
          invalidCoupon: true
        });
      }
    } catch (error) {
      res.render('user/404', {
        user: true
      });
    }
  }
}