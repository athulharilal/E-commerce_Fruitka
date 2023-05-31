const whishlistHelpers = require('../helpers/whishlistHelpers');

module.exports = {
  getAddToWishlist: (req, res) => {
    const proId = req.params.id;
    const userId = req.session.user._id;

    whishlistHelpers.addToWishlist(userId, proId)
      .then(() => {
        res.json({
          status: true
        });
      })
      .catch(() => {
        res.json({
          status: true
        });
      });
  },

  getWhislist: async (req, res) => {
    try {
      let cartCount = null;
      let whishlistCount = null;
      whishlistCount = await whishlistHelpers.getWishlistCount(req.session.user._id);
      const user = req.session.user;
      const products = await whishlistHelpers.getWishlists(req.session.user._id);

      res.render('user/wishlists', {
        user,
        products,
        cartCount,
        whishlistCount,
        quantMsg: req.session.quantError
      });
    } catch (error) {
      res.render('user/404', {
        user: true
      });
    }
  },

  getRemoveWishlist: async (req, res) => {
    try {
      await whishlistHelpers.removeWishList(req.params.id, req.session.user._id);
      res.json({
        status: true
      });
    } catch (error) {
      res.render('user/404', {
        user: true
      });
    }
  }
};
