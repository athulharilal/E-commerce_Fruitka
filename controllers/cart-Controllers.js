const userHelpers = require('../helpers/user-helpers');
const cartHelpers = require('../helpers/cart-helpers');
const whishlistHelpers = require('../helpers/whishlistHelpers');

module.exports = {
  getCart: async (req, res) => {
    try {
      const products = await cartHelpers.getCartProducts(req.session.user._id);
      const totalValue = await cartHelpers.getTotalAmount(req.session.user._id);
      res.render('user/cart', {
        products,
        user: req.session.user,
        totalValue,
      });
    } catch (error) {
      res.render('user/404', {
        user: true,
      });
    }
  },

  getAddToCart: async (req, res) => {
    try {
      const userId = req.session.user._id;
      const productId = req.params.id;
      const count = await userHelpers.findProCount(userId, productId);
      const stock = await userHelpers.findStock(productId);

      if (count === 3) {
        res.json({
          limit: true,
        });
      } else {
        if (count === stock || stock === 0) {
          res.json({
            noStock: true,
          });
        } else {
          await cartHelpers.addToCart(productId, userId);
          res.json({
            status: true,
          });
        }
      }
    } catch (error) {
      res.render('user/404', {
        user: true,
      });
    }
  },

  getAddToCartFromWishlist: async (req, res) => {
    try {
      const userId = req.session.user._id;
      const productId = req.params.id;
      const count = await userHelpers.findProCount(userId, productId);
      const stock = await userHelpers.findStock(productId);

      if (count === 3) {
        res.json({
          limit: true,
        });
      } else {
        if (count === stock || stock === 0) {
          res.json({
            noStock: true,
          });
        } else {
          await cartHelpers.addToCart(productId, userId);
          await whishlistHelpers.removeWishList(userId, productId);
          res.json({
            status: true,
          });
        }
      }
    } catch (error) {
      res.render('user/404', {
        user: true,
      });
    }
  },

  getDeleteCartItems: async (req, res) => {
    try {
      const proId = req.params.proId;
      const cartId = req.params.cartId;
      await userHelpers.deleteCartItem(proId, cartId);
      res.json({
        status: true,
      });
    } catch (error) {
      res.render('user/404', {
        user: true,
      });
    }
  },

  postChangeProductQuantity: async (req, res) => {
    try {
      const response = await userHelpers.changeProductQuantity(req.body);
      response.total = await cartHelpers.getTotalAmount(req.body.user);
      res.json(response);
    } catch (error) {
      res.json({
        noStock: true,
      });
    }
  },
};
