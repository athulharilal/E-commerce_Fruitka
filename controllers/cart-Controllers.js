const userHelpers = require('../helpers/user-helpers')
const cartHelpers = require('../helpers/cart-helpers')
const whishlistHelpers = require('../helpers/whishlistHelpers')



module.exports = {
    getCart: async (req, res) => {
        try {
            let products = await cartHelpers.getCartProducts(req.session.user._id)
            let totalValue = await cartHelpers.getTotalAmount(req.session.user._id)
            res.render('user/cart', {
                products,
                user: req.session.user,
                totalValue
            })
        } catch (error) {
            res.render('user/404', {
                user: true
            })
        }
    },
    getAddtocart: async (req, res) => {
        try {
            let count = await userHelpers.findProCount(req.session.user._id, req.params.id);
            let stock = await userHelpers.findStock(req.params.id);
            if (count === 3) {
                res.json({
                    limit: true
                });
            } else {
                if (count === stock) {
                    res.json({
                        noStock: true
                    });
                } else if (stock === 0) {
                    res.json({
                        noStock: true
                    });
                } else {
                    cartHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
                        res.json({
                            status: true
                        });
                    }).catch((error) => {
                        res.render('user/404', {
                            user: true
                        });
                    });
                }
            }
        } catch (error) {
            res.render('user/404', {
                user: true
            });
        }
    },
    getAddtoCartFromWishlist: async (req, res) => {
        try {
          let count = await userHelpers.findProCount(req.session.user._id, req.params.id);
          let stock = await userHelpers.findStock(req.params.id);
          if (count === 3) {
            res.json({
              limit: true
            });
          } else {
            if (count === stock) {
              res.json({
                noStock: true
              });
            } else if (stock === 0) {
              res.json({
                noStock: true
              });
            } else {
              // Add to cart and remove from wishlist
              await cartHelpers.addToCart(req.params.id, req.session.user._id);
              await whishlistHelpers.removeWishList(req.session.user._id, req.params.id);
              res.json({
                status: true
              });
            }
          }
        } catch (error) {
          res.render('user/404', {
            user: true
          });
        }
      }
      ,
    getDeleteCartItems: (req, res) => {
        try {
            proId = req.params.proId
            cartId = req.params.cartId
            userHelpers.deleteCartItem(proId, cartId).then((response) => {
                res.json({
                    status: true
                })
            })
        } catch (error) {
            res.render('user/404', {
                user: true
            })
        }
    },
    postChangeproductquant: async (req, res) => {

        let userID = req.body.user
        let proId = req.body.product
        let count = req.body.count
        let quantity = req.body.quantity
        let cartId = req.body.cart

        let proQuantity = await cartHelpers.findCartQuantity(userID, proId)


        // if (proQuantity == 3 && count ==1) {
        //     res.json({limitStock:true})
        // }else{
        userHelpers.changeProductQuantity(req.body).then(async (response) => {

            response.total = await cartHelpers.getTotalAmount(req.body.user)
            //   response.cartSubTotal = await cartHelpers.getCartSubTotal(userID,proId)
            res.json(response)

        }).catch(() => {
            res.json({
                noStock: true
            })
        })


    }
}