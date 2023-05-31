const express = require("express");
const router = express.Router();
const adminControllers = require("../controllers/adminControllers");
const categoryControllers = require("../controllers/categoryControllers");
const productControllers = require("../controllers/productControllers");
const bannerControllers = require("../controllers/bannerController");
const couponControllers = require("../controllers/couponControllers");
const imgupload = require('../middleware/multer');
const auth = require('../middleware/middleware');

// Set admin layout middleware
router.use((req, res, next) => {
  res.locals.layout = "admin-layout";
  next();
});

// Admin routes
router.get("/", auth.admin, adminControllers.home);
router.get("/adminlogin", adminControllers.getAdminLogin);
router.post("/adminlogin", adminControllers.postAdminLogin);
router.get("/adminLogOut", adminControllers.getAdminLogout);

// User management routes
router.get("/allusers", auth.admin, adminControllers.getAllUsers);
router.get('/userProfile/:id', auth.admin, adminControllers.getUserProfile);
router.post("/block-user/:id", auth.admin, adminControllers.getBlockUser);
router.post("/unblock-user/:id", adminControllers.getUnblockUser);

// Product management routes
router.get("/add-product", auth.admin, productControllers.getAddProducts);
router.post('/add-product', auth.admin, imgupload.uploads, productControllers.postAddProducts);
router.get("/products", auth.admin, adminControllers.getProducts);
router.get("/edit-products/:id", auth.admin, productControllers.getEditProducts);
router.post("/edit-products-images/:id", auth.admin, imgupload.uploads, productControllers.postEditProdcutImages);
router.post("/delete-product/:id", auth.admin, productControllers.postDeleteProdcuts);
router.post("/delete-productImage/:id", auth.admin, productControllers.postDeleteProdcutsImages);
router.post("/edit-products/:id", auth.admin, productControllers.postEditProduct);

// Category management routes
router.get("/add-categories", auth.admin, categoryControllers.getAddCategories);
router.post("/add-categories", auth.admin, categoryControllers.postAddCategories);
router.get("/view-category", auth.admin, categoryControllers.getViewCategory);
router.get("/edit-category/:id", auth.admin, categoryControllers.getEditCategory);
router.post("/edit-category", auth.admin, categoryControllers.postEditCategory);
router.post("/delete-categories/:id", auth.admin, categoryControllers.getDeleteCategories);

// Coupon management routes
router.get('/coupon-management', auth.admin, couponControllers.getCouponManagement);
router.get('/add-coupon', auth.admin, couponControllers.getAddCoupon);
router.post('/add-coupon', auth.admin, couponControllers.postAddCoupon);
router.get('/edit-coupon/:id', auth.admin, couponControllers.getEditCoupon);
router.post('/edit-coupon', auth.admin, couponControllers.postEditCoupon);
router.get('/delete-coupon/:id', auth.admin, couponControllers.getDeleteCoupon);

// Order management routes
router.get('/view-orders/:id', auth.admin, productControllers.getViewProducts);
router.get('/cancel-order/:id', auth.admin, adminControllers.getCancelOrders);
router.get('/view-order-products/:id', auth.admin, adminControllers.getOrderProducts);
router.post('/change-order-status', auth.admin, productControllers.postChangeOrderStatus);
router.get('/order-management', auth.admin, productControllers.getOrderManagement);

// Banner management routes
router.get('/banner-management', auth.admin, bannerControllers.getBannerManagement);
router.get('/add-banner', auth.admin, bannerControllers.getAddBanner);
router.post('/add-banner', auth.admin, imgupload.uploads2, bannerControllers.postAddBanner);
router.get('/edit-banner/:id', auth.admin, bannerControllers.getEditBanner);
router.post('/edit-banner', auth.admin, bannerControllers.postEditBanner);
router.get('/delete-banner/:id', auth.admin, bannerControllers.deleteBanner);

// Dashboard data routes
router.get('/sales-report', auth.admin, adminControllers.getSalesReport);
router.post('/sales-report-date', auth.admin, adminControllers.postSalesDownload);
router.get('/chart-data', auth.admin, adminControllers.getChartData);

module.exports = router;
