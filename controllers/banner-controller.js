const {
    response
} = require('../app')
const bannerHelpers = require('../helpers/banner-helpers')

module.exports = {
    getBannerManagement: (req, res) => {
        try {
            bannerHelpers.getAllBanners().then((allbanners) => {
                res.render('admin/banner-management', {
                    allbanners,
                    login: req.session.adminLoggedIn
                })
            })

        } catch (error) {

        }
    },
    getAddBanner: (req, res) => {
        try {
            res.render('admin/add-banner', {
                login: req.session.adminLoggedIn
            })

        } catch (error) {

        }
    },
    postAddbanner: (req, res) => {
        try {



            let images = req.files.map(files => files.filename)
            req.body.images = images
            bannerHelpers.addBanner(req.body).then(() => {
                res.redirect('/admin/banner-management')
            }).catch(() => {
                req.sesion.bannerRpeatError = "Banner already Added!!"
                res.redirect('/admin/banner-management')
            })
        } catch (error) {

        }
    },
    getEditBanner: (req, res) => {
        try {
            let admin = req.sesion.admin
            let id = req.params.id
            bannerHelpers.getBannerDetaisl(id).then((bannerDetails) => {
                res.render('admin/edit-banner', {
                    bannerDetails,
                    admin
                })
            })

        } catch (error) {

        }
    },
    postEditBanner: (req, res) => {
        try {
            let id = req.body._id
            bannerHelpers.editBanner(req.body).then(() => {
                if (req.files.image) {
                    let image = req.files.image
                    image.mv('./public/asse')
                }
            })

        } catch (error) {

        }
    },
    deleteBanner: (req, res) => {

        let bannerId = req.params.id
        bannerHelpers.deleteBanner(bannerId).then((response) => {
            res.redirect('/admin/banner-management')

        })
    }


}