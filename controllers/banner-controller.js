const bannerHelpers = require('../helpers/banner-helpers');

module.exports = {
  getBannerManagement: async (req, res) => {
    try {
      const allBanners = await bannerHelpers.getAllBanners();
      res.render('admin/banner-management', {
        allBanners,
        login: req.session.adminLoggedIn,
      });
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log(error);
    }
  },

  getAddBanner: (req, res) => {
    try {
      res.render('admin/add-banner', {
        login: req.session.adminLoggedIn,
      });
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log(error);
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
      res.render('admin/edit-banner', {
        bannerDetails,
        admin,
      });
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log(error);
    }
  },

  postEditBanner: async (req, res) => {
    try {
      const id = req.body._id;
      await bannerHelpers.editBanner(req.body);
      if (req.files.image) {
        const image = req.files.image;
        image.mv('./public/asse');
      }
      res.redirect('/admin/banner-management');
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log(error);
    }
  },

  deleteBanner: async (req, res) => {
    try {
      const bannerId = req.params.id;
      await bannerHelpers.deleteBanner(bannerId);
      res.redirect('/admin/banner-management');
    } catch (error) {
      // Properly handle the error, such as logging or sending an error response
      console.log(error);
    }
  },
};
