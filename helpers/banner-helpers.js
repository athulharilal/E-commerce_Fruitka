var db = require('../config/connection')
var collection = require('../config/collection');

const {
    response
} = require('../app');
const {
    AST
} = require('handlebars');
let objectId = require('mongodb').ObjectId

module.exports = {
    getAllBanners: async () => {

        return new Promise(async (resolve, reject) => {
            try {
                let allBanners = db.get().collection(collection.BANNER_COLLECTION).find().toArray()
                resolve(allBanners)
            } catch (error) {
                resolve(0)
            }
        }).catch((error) => {
            
        })


    },
    addBanner: (data) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.BANNER_COLLECTION).findOne({
                    name: data.name
                })
                .then((banner) => {
                    if (banner) {
                        reject();
                    } else {
                        db.get().collection(collection.BANNER_COLLECTION).insertOne(data)
                            .then((response) => {
                                resolve(response);
                            })
                            .catch((error) => {
                                reject(error);
                            });
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },
    getBannerDetaisl: (id) => {

        return new Promise((resolve, reject) => {
            db,
            get().collection(collection.BANNER_COLLECTION).findOne({
                _id: objectId(id)
            }).then((response => {
                resolve(response)
            })).catch((error) => {
                
            })
        });


    },
    editBanner: (data) => {

        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).updateOne({
                _id: objectId(data._id)
            }, {
                $set: {
                    name: data.name,
                    subname: data.subname,
                    offer: data.offer,
                }
            }).then((response) => {
                resolve()
            }).catch((error) => {
                
            })
        });


    },
    deleteBanner: (id) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).deleteOne({
                _id: objectId(id)
            }).then((response) => {
                resolve()
            })
        }).catch(() => {

        })


    }
}