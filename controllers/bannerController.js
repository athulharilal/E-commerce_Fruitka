const bannerHelpers = require('../helpers/bannerHelpers');

module.exports = {
  getBannerManagement: async (req, res) => {
    try {
      const allBanners = await bannerHelpers.getAllBanners();
      res.render('admin/bannerManagement', {
        allBanners,
        login: req.session.adminLoggedIn,
      });
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
  },

  getAddBanner: (req, res) => {
    try {
      res.render('admin/addBanner', {
        login: req.session.adminLoggedIn,
      });
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
  },

  postAddBanner: async (req, res) => {
    try {
      const images = req.files.map((file) => file.filename);
      req.body.images = images;
      await bannerHelpers.addBanner(req.body);
      res.redirect('/admin/banner-management');
    } catch (error) {
      req.session.bannerRepeatError = 'Banner already added!!';
      res.redirect('/admin/banner-management');
    }
  },

  getEditBanner: async (req, res) => {
    try {
      const admin = req.session.admin;
      const id = req.params.id;
      const bannerDetails = await bannerHelpers.getBannerDetails(id);
      res.render('admin/editBanner', {
        admin,
        login: req.session.adminLoggedIn,
        bannerDetails,
      });
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
  },

  postEditBanner: async (req, res) => {
    try {
   
      await bannerHelpers.editBanner(req.body);
      if (req.files.image) {
        const image = req.files.image;
        image.mv('./public/asse');
      }
      res.redirect('/admin/banner-management');
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
  },

  deleteBanner: async (req, res) => {
    try {
      console.log(" api call");
      const bannerId = req.params.id;
      await bannerHelpers.deleteBanner(bannerId);
      res.redirect('/admin/banner-management');
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log("An error occured ",error);
    }
  },
};
