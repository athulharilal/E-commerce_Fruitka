const express = require("express");
const router = express.Router();
const auth = require("../middleware/middleware");
const userControllers = require("../controllers/userController");
const cartControllers = require("../controllers/cart-Controllers");
const orderControllers = require("../controllers/orderController");
const wishListControllers = require("../controllers/wishListController");
const productControllers = require("../controllers/productControllers");

// User home route
router.get("/", userControllers.home);

// About route
router.get("/about", userControllers.about);

// Contact route
router.get("/contact", userControllers.getContact);

// Signup routes
router.get("/signup", userControllers.getSignup);
router.post("/signup", userControllers.postSignup);

// Login routes
router.get("/login", userControllers.getLogin);
router.post("/login", auth.loginUserCheck, userControllers.postLogin);
router.get("/logout", userControllers.getLogout);

// OTP routes
router.get("/otp-login", userControllers.getOtp);
router.post("/otp-login", userControllers.postOtp);

// Cart routes
router.get("/add-to-cart/:id", auth.user, auth.userCheck, cartControllers.getAddtocart);
router.get("/add-to-cart-fromWishlist/:id", auth.user, auth.userCheck, cartControllers.getAddtoCartFromWishlist);
router.get("/cart", auth.user, auth.userCheck, cartControllers.getCart);
router.get("/delete-cart-item/:proId/:cartId", auth.user, auth.userCheck, cartControllers.getDeleteCartItems);
router.post("/change-product-quantity", auth.user, auth.userCheck, cartControllers.postChangeproductquant);

// Wishlist routes
router.get("/add-to-wishlist/:id", auth.user, auth.userCheck, wishListControllers.getAddToWishlist);
router.get("/wishlists", auth.user, auth.userCheck, wishListControllers.getWhislist);
router.delete("/remove-wishlist/:id", auth.user, auth.userCheck, wishListControllers.getRemoveWishlist);

// Coupon route
router.post("/coupon-apply", auth.user, auth.userCheck, userControllers.postCouponApply);

// Place order routes
router.get("/placeorder", auth.user, auth.userCheck, userControllers.getPlaceOrders);
router.post("/place-order", auth.user, auth.userCheck, userControllers.postPlaceOrders);
router.post("/verify-payment", auth.user, auth.userCheck, userControllers.postverifyPayment);

// View orders route
router.get("/view-order-products/:id", auth.user, auth.userCheck, userControllers.getViewOrderedProducts);

// My profile routes
router.get("/my-profile", auth.user, auth.userCheck, userControllers.getMyProfile);
router.get("/edit-Personal-details", auth.user, auth.userCheck, userControllers.getEditPersonalDetails);
router.post("/edit-Personal-details", auth.user, auth.userCheck, userControllers.postEditPersonalDetails);
router.get("/edit-user-address", auth.user, auth.userCheck, userControllers.getEditUserAddress);
router.get("/add-address", auth.user, auth.userCheck, userControllers.getAddAddrress);
router.post("/add-address", auth.user, auth.userCheck, userControllers.postAddAddrress);
router.post("/placeorder-add-address", auth.user, auth.userCheck, userControllers.postPlaceOrderAddAddrress);
router.post("/edit-address", auth.user, auth.userCheck, userControllers.postEditAddress);
router.post("/place-order-edit-address", auth.user, auth.userCheck, userControllers.postEditAddress);
router.get("/deleteAddrsess/:addressId", auth.user, auth.userCheck, userControllers.PostDeleteAddress);
router.get("/view-products/:id", auth.user, auth.userCheck, productControllers.getViewSingleProducts);
router.get("/changePassword", auth.user, auth.userCheck, userControllers.getChangepassword);
router.post("/change-password", auth.user, auth.userCheck, userControllers.postChangePassword);
router.get("/loginnsecurity", auth.user, auth.userCheck, userControllers.getLoginSecurity);

// Order management routes
router.get("/orders", auth.user, auth.userCheck, orderControllers.getOrders);
router.get("/return-order/:id", auth.user, auth.userCheck, orderControllers.getReturnOrder);
router.get("/cancel-order/:id", auth.user, auth.userCheck, orderControllers.getCancelOrder);

// User invoice route
router.get("/invoice/:id", auth.user, auth.userCheck, userControllers.getInvoice);

// User search route
router.post("/search", auth.user, auth.userCheck, productControllers.getSearch);

// Sorting route
router.post("/sort", auth.user, auth.userCheck, productControllers.sortProducts);

// Filter route
router.post("/filter", auth.user, auth.userCheck, productControllers.getFilter);

module.exports = router;
