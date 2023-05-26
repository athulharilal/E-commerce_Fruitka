let userHelpers = require("../helpers/user-helpers");
let productsHelpers = require("../helpers/products-helpers");
let whishlistHelpers = require("../helpers/whishlistHelpers")
let couponHelpers = require("../helpers/coupon-helpers")
let cartHelpers = require("../helpers/cart-helpers")
let bannerHelpers = require("../helpers/banner-helpers")
let orderHelpers = require("../helpers/order-Helpers")
const {
    response
} = require("../app");
let db = require("../config/connection");
const session = require("express-session");



module.exports = {
    home: async (req, res) => {
        try {
            let banners = await bannerHelpers.getAllBanners();
            let user = req.session.user;
            let cartCount = null;
            if (req.session.user) {
                cartCount = await cartHelpers.getCartCount(req.session.user._id);
            }
            let pageNumber = 1;
            if (req.query.page > 1) {
                pageNumber = parseInt(req.query.page);
            }
            const perPage = 3;

            productsHelpers
                .getAllProducts()
                .then((products) => {
                    return productsHelpers.paginateData(products, pageNumber, perPage);
                })
                .then((result) => {
                    const pageCount = Math.ceil(result.totalCount / perPage);
                    res.render("user/user-home", {
                        data: result.data,
                        pageCount,
                        currentPage: pageNumber,
                        user,
                        show: true,
                        cartCount,
                        banners
                    });
                })
                .catch(() => {
                    res.render("user/404", {
                        user: true
                    });
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
        })
    },
    getContact: (req, res) => {
        res.render('user/contact', {
            user: true
        })
    },
    getLogin: (req, res) => {
        try {
            if (req.session.loggedIn) {
                res.render("user/user-home");
            } else {
                res.render("user/login", {
                    loginError: req.session.loginErr
                });
                req.session.loginErr = false;
            }

        } catch (error) {
            res.render('user/404', {
                user: true
            })
        }
    },
    postLogin: (req, res) => {
        userHelpers.doLogin(req.body)
            .then((response) => {
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
            })
            .catch((error) => {
                res.render("error", {
                    message: "An error occurred during login."
                });
            });
    },

    getSignup: (req, res) => {
        try {
            res.render("user/signup");

        } catch (error) {
            res.render('user/404', {
                user: true
            })

        }

    },
    postSignup: async (req, res) => {



        userHelpers.doSignup(req.body).then((response) => {
            if (response) {
                res.redirect('/login')
            } else {
                req.session.signUpErr = "Email or mobile already exist"
                res.redirect('/signup')
            }
        }).catch(() => {
            req.session.referalErr = "Invalid referal Code"
            res.redirect('/signup')
        })



    },


    getLogout: (req, res) => {

        try {


            req.session.loggedIn = false;
            req.session.user = null; //saving the userdata to the server.request object


            res.redirect("/");


        } catch (error) {
            res.render('user/404', {
                user: true
            })
        }
    },
    getOtp: (req, res) => {
        try {
            let noUserErr = req.session.noUserErr;
            let blockErr = req.session.blockErr;
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
            })
        }
    },
    postOtp: (req, res) => {
        try {
            let noUserErr = req.session.noUserErr;
            let blockErr = req.session.blockErr;
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
            })
        }
    },
    getPlaceOrders: async (req, res) => {
        try {
            let userID = req.session.user._id
            let todayDate = new Date().toISOString().slice(0, 10)
            let startCouponOffer = await couponHelpers.startCouponOffer(todayDate)
            let cartCount = await cartHelpers.getCartCount(userID)
            let wishListCount = await whishlistHelpers.getWishlistCount(userID)
            let products = await cartHelpers.getCartProducts(userID)
            let userAddress = await userHelpers.getUserData(userID)
            let totalValue = await cartHelpers.getTotalAmount(userID)
            let wallet = await userHelpers.findWallet(userID)
            wallet = wallet.wallet

            if (wallet > totalValue) {
                walletStatus = true
            } else {
                walletStatus = false
            }
            res.render('user/placeorder', {
                products,
                totalValue,
                user: req.session.user,
                userAddress,
                startCouponOffer,
                cartCount,
                wishListCount,
                walletStatus
            })
        } catch (error) {
            console.log(error," error");
            res.render('user/404', {
                user: true
            })
        }
    },
    postPlaceOrders: async (req, res) => {
        try {
            let user = req.session.user._id
            let products = await cartHelpers.getCartProductList(user)
            let totalPrice = await cartHelpers.getTotalAmount(user)
            let wallet = await userHelpers.findWalletAmount(user)

            if (req.session.couponTotal) {
                totalPrice = req.session.couponTotal
            }

            orderHelpers.placeOrder(req.body, products, totalPrice, user).then((orderID) => {

                if (req.body['PaymentMethod'] === 'COD') {
                    req.session.couponTotal = null
                    res.json({
                        codSuccess: true
                    })
                } else if (req.body['PaymentMethod'] === 'Razorpay') {
                    userHelpers.generateRazorpay(orderID, totalPrice).then((response) => {
                        req.session.couponTotal = null
                        res.json(response)
                    })
                } else {
                    userHelpers.reduceWallet(req.session.user, totalPrice, wallet.wallet).then(() => {
                        req.session.couponTotal = null
                        res.json({
                            wallet: true
                        })
                    })
                }
                if (req.session.couponTotal) {
                    CouponName = req.body.coupon
                    discountValue = parseInt(req.session.discountValue)
                    couponTotal = req.session.couponTotal
                    couponHelpers.couponOrderUpdate(orderID, CouponName, discountValue, couponTotal).then(() => {
                        // Perform any necessary actions after coupon order update
                    })
                }
            })
        } catch (error) {
            res.render('user/404', {
                user: true
            })
        }
    },
    postverifyPayment: (req, res) => {
        try {

            userHelpers.verifyPayment(req.body).then(() => {
                userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {

                    res.json({
                        status: true
                    })
                })
            }).catch((err) => {

                res.json({
                    status: false
                })
            })

        } catch (error) {
            res.render('user/404', {
                user: true
            })

        }
    },
    getOrderPlaced: (req, res) => {
        try {

            res.render('user/order-placed', {
                order: true,
                user: true
            })

        } catch (error) {
            res.render('user/404', {
                user: true
            })

        }
    },
    getViewOrderedProducts: async (req, res) => {
        try {

            let products = await userHelpers.getUserOrderProducts(req.params.id)

            // 
            res.render("user/vieworderproducts", {
                user: true,
                products
            })
        } catch (error) {
            res.render('user/404', {
                user: true
            })

        }
    },
    getMyProfile: async (req, res) => {
        try {

            res.render('user/my-profile', {
                user: req.session.user
            })

        } catch (error) {
            res.render('user/404', {
                user: true
            })

        }
    },
    getEditPersonalDetails: async (req, res) => {
        try {
            let userDetails = await userHelpers.getOneUserDetails(req.session.user._id)

            res.render('user/edit-Personal-details', {
                user: req.session.user._id,
                userDetails
            })

        } catch (error) {
            res.render('user/404', {
                user: true
            })
        }
    },
    postEditPersonalDetails: async (req, res) => {
        try {


            userHelpers.editMyprofile(req.body, req.session.user._id).then(() => {
                res.redirect('/edit-Personal-details')
            })

        } catch (error) {
            res.render('user/404', {
                user: true
            })

        }
    },
    getEditUserAddress: async (req, res) => {
        try {
            let userDetails = await userHelpers.getOneUserDetails(req.session.user._id)

            res.render('user/edit-user-address', {
                user: true,
                userDetails
            })

        } catch (error) {
            res.render('user/404', {
                user: true
            })

        }
    },
    getAddAddrress: async (req, res) => {
        try {
            res.render('user/add-address', {
                user: true
            })

        } catch (error) {
            res.render('user/404', {
                user: true
            })

        }
    },
    postPlaceOrderAddAddrress: async (req, res) => {
        try {


            userHelpers.addAddress(req.body, req.session.user._id).then(() => {
                res.redirect('/placeorder')
            })

        } catch (error) {
            res.render('user/404', {
                user: true
            })

        }
    },
    postAddAddrress: async (req, res) => {
        try {

            userHelpers.addAddress(req.body, req.session.user._id).then(() => {
                res.redirect('/my-profile')
            })

        } catch (error) {
            res.render('user/404', {
                user: true
            })

        }
    },
    postEditAddress: async (req, res) => {
        try {



            userHelpers.editAddress(req.body, req.session.user._id).then((response) => {
                res.json({
                    status: true
                })
            }).catch((error) => {
                res.json({
                    status: false
                })
            })

        } catch (error) {
            res.render('user/404', {
                user: true
            })

        }
    },
    PostDeleteAddress: (req, res) => {
        const addressId = req.params.addressId; // Assuming the addressId parameter is passed in the URL
        const userId = req.session.user._id;
        console.log("api call");
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
    },

    getChangepassword: (req, res) => {
        try {
            res.render('user/changepassword', {
                user: true
            })

        } catch (error) {
            res.render('user/404', {
                user: true
            })

        }
    },
    postChangePassword: async (req, res) => {
        try {


            if (req.body.confirmNewPassword === req.body.newPassword) {

                userHelpers.changePassword(req.session.user._id, req.body).then(async (response) => {
                    if (response.status) {

                        req.session.loggedIn = false;
                        req.session.user = null; //saving the 
                        res.redirect('/')
                    } else {
                        let userDetails = await userHelpers.getOneUserDetails(req.session.user._id)
                        res.render('user/changepassword', {
                            user: true,
                            userDetails,
                            message: 'Incorrect Password'
                        })
                    }
                })
            } else {
                let userDetails = await userHelpers.getOneUserDetails(req.session.user._id)
                res.render('user/changepassword', {
                    user: true,
                    userDetails,
                    message: 'Enter the same Password'
                })
            }

        } catch (error) {
            res.render('user/404', {
                user: true
            })

        }
    },
    getInvoice: async (req, res) => {
        try {
            let user = req.session.user
            let orderID = req.params.id
            let invoice = await userHelpers.getUserInvoice(orderID)
            let products = await userHelpers.getUserOrderProducts(orderID)
            let orders = await orderHelpers.getUserOrders(orderID)
            res.render('user/invoice', {
                user,
                invoice,
                products,
                orders
            })

        } catch (error) {
            res.render('user/404', {
                user: true
            })

        }
    },
    getLoginSecurity: async (req, res) => {
        try {
            let userDetails = await userHelpers.getOneUserDetails(req.session.user._id)
            res.render('user/loginnsecurity', {
                user: true,
                userDetails
            })

        } catch (error) {
            res.render('user/404', {
                user: true
            })

        }
    },
    postCouponApply: (req, res) => {
        return new Promise(async (resolve, reject) => {
            try {

                let id = req.session.user._id
                let coupon = req.body.coupon

                let totalAmount = await cartHelpers.getTotalAmount(req.session.user._id)

                await couponHelpers.validateCoupon(req.body, id, totalAmount).then((response) => {
                    req.session.couponTotal = response.total
                    req.session.discountValue = response.discountValue

                    if (response.success) {


                        couponHelpers.upDateCoupon(req.body, id, coupon)

                        res.json({
                            couponSuccess: true,
                            total: response.total,
                            CouponName: response.CouponName,
                            discountValue: response.discountValue,
                            coupon
                        })
                    } else if (response.couponUsed) {
                        res.json({
                            couponUsed: true
                        })
                    } else if (response.couponExpired) {

                        res.json({
                            couponExpired: true
                        })
                    } else {
                        res.json({
                            invalidCoupon: true
                        })
                    }
                })

            } catch (error) {
                res.render('user/404', {
                    user: true
                })

            }

        })
    },



}