let express = require("express");
let router = express.Router();
const {
  response
} = require("../app");
const productsHelpers = require("../helpers/products-helpers");
const catergoryHelpers = require("../helpers/category-helpers");
const auth = require('../middleware/middleware');

let adminHelpers = require("../helpers/admin-helpers");
let userHelpers = require("../helpers/user-helpers");
const adminControllers = require("../controllers/adminControllers");
const categoryControllers = require("../controllers/categoryControllers");
const productControllers = require("../controllers/productControllers");
const bannerControllers = require("../controllers/banner-controller");
const couponControllers = require("../controllers/coupon-Controllers");


const imgupload = require('../middleware/multer')


const setAdminLayout = (req, res, next) => {
  res.locals.layout = "admin-layout";
  next();
};
// using admin layout...
router.use(setAdminLayout);

//admin-home
router.get("/", auth.admin, adminControllers.home);

//admin authentication
router.get("/adminlogin", adminControllers.getAdminLogin);

router.post("/adminlogin", adminControllers.postAdminLogin);

router.get("/adminLogOut", adminControllers.getAdminLogout);


//user-management
router.get("/allusers", auth.admin, adminControllers.getAllUsers);

router.get('/userProfile/:id', auth.admin, adminControllers.getUserProfile)

router.get("/block-user/:id", auth.admin, adminControllers.getBlockUser);

router.get("/unblock-user/:id", adminControllers.getUnblockUser);

//product-mangement
router.get("/add-product", auth.admin, productControllers.getAddProducts);

router.post('/add-product', auth.admin, imgupload.uploads, productControllers.postAddProducts);

router.get("/products", auth.admin, adminControllers.getProducts);

router.get("/edit-products/:id", auth.admin, productControllers.getEditProducts);

router.post("/edit-products-images/:id", auth.admin, imgupload.uploads, productControllers.postEditProdcutImages);

router.post("/delete-product/:id", auth.admin, productControllers.postDeleteProdcuts);

router.post("/delete-productImage/:id", auth.admin, productControllers.postDeleteProdcutsImages);

router.post("/edit-products/:id", auth.admin, productControllers.postEditProduct);


//cartogory-management
router.get("/add-categories", auth.admin, categoryControllers.getAddCategories);

router.post("/add-categories", auth.admin, categoryControllers.postAddCategories);

router.get("/view-category", auth.admin, categoryControllers.getViewCategory);

router.get("/edit-category/:id", auth.admin, categoryControllers.getEditCategory);

router.post("/edit-category", auth.admin, categoryControllers.postEditCategory);

router.post("/delete-categories/:id", auth.admin, categoryControllers.getDeleteCategories);

//coupon-management

router.get('/coupon-management', auth.admin, couponControllers.getCouponManagement)

router.get('/add-coupon', auth.admin, couponControllers.getAddCoupon)

router.post('/add-coupon', auth.admin, couponControllers.postAddCoupon)

router.get('/edit-coupon/:id', auth.admin, couponControllers.getEditCoupon)

router.post('/edit-coupon', auth.admin, couponControllers.postEditCoupon)

router.get('/delete-coupon/:id', auth.admin, couponControllers.getDeleteCoupon)

//order-management

router.get('/view-orders/:id', auth.admin, productControllers.getViewProducts)

router.get('/cancel-order/:id', auth.admin, adminControllers.getCancelOrders)

router.get('/view-order-products/:id', auth.admin, adminControllers.getOrderProducts)

router.post('/change-order-status', auth.admin, productControllers.postChangeOrderStatus)

router.get('/Order-management', auth.admin, productControllers.getOrderManagement)

//banner-management

router.get('/banner-management', auth.admin, bannerControllers.getBannerManagement)

router.get('/add-banner', auth.admin, bannerControllers.getAddBanner)

router.post('/add-banner', auth.admin, imgupload.uploads2, bannerControllers.postAddbanner)

router.get('/edit-banner/:id', auth.admin, bannerControllers.getEditBanner)

router.get('/edit-banner', auth.admin, bannerControllers.postEditBanner)

router.get('/delete-banner/:id', auth.admin, bannerControllers.deleteBanner)

//dashboard data
router.get('/sales-report', auth.admin, adminControllers.getSalesReport)

router.post('/sales-report-date', auth.admin, adminControllers.postSalesDownload)

router.get('/chart-data', auth.admin, adminControllers.getChartData)

router.post('/salesReportDate', auth.admin, adminControllers.postSalesDownload)

module.exports = router;