const whishlistHelpers = require('../helpers/whishlistHelpers')
const userHelpers = require('../helpers/user-helpers')

module.exports = {
    getAddToWishlist: (req, res) => {


        let proId = req.params.id


        let userId = req.session.user._id


        whishlistHelpers.addToWishlist(userId, proId).then(() => {
            res.json({
                status: true
            })
        }).catch(() => {
            res.json({
                status: true
            })
        })



    },
    getWhislist: async (req, res) => {

        try {
            let cartCount = null
            let whishlistCount = null
            // cartCount = await userHelpers.getCartCount(req.session.user._id)
            whishlistCount = await whishlistHelpers.getWishlistCount(req.session.user._id)

            let user = req.session.user
            let products = await whishlistHelpers.getWishlists(req.session.user._id)


            res.render('user/wishlists', {
                user,
                products,
                cartCount,
                whishlistCount,
                quantMsg: req.session.quantError
            })

        } catch (error) {

            res.render('user/404', {
                user: true
            })

        }

    },
    getRemoveWishlist: async (req, res) => {


        await whishlistHelpers.removeWishList(req.params.id, req.session.user._id).then((response) => {
            res.json({
                status: true
            })
        }).catch((error) => {
            res.render('user/404', {
                user: true
            })

        })




    },
}