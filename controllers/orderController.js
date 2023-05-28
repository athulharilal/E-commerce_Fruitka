
const userHelpers = require('../helpers/user-helpers');
const orderHelpers = require('../helpers/order-Helpers')
const cartHelpers = require('../helpers/cart-helpers');

module.exports = {
  getOrders: async (req, res) => {
    try {
      const user = req.session.user;
      const userDetails = await userHelpers.getOneUserDetails(user._id);
      const orderData = await orderHelpers.getUserOrders(user._id);
      res.render('user/orders', { user: true, orderData, userDetails, user });
    } catch (error) {
      res.render('user/404', { user: true });
    }
  },

  getReturnOrder: (req, res) => {
    orderHelpers.returnOrder(req.params.id)
      .then(() => {
        res.redirect('/orders');
      })
      .catch((error) => {
        res.render('user/404', { user: true });
      });
  },

  getCancelOrder: async (req, res) => {
    try {
      const products = await orderHelpers.getNeedtoCancelPrds(req.params.id);
      orderHelpers.cancelOrders(req.params.id, products)
        .then(() => {
          res.redirect('/orders');
        })
        .catch((error) => {
          res.render('user/404', { user: true });
        });
    } catch (error) {
      res.render('user/404', { user: true });
    }
  }
};
