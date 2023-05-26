
const { response } = require('express')
var db = require('../config/connection')
var collection = require('../config/collection')
const { ObjectID } = require('bson')
let ObjectId = require("mongodb").ObjectId;




module.exports={

    getWishlistCount:(userId)=>{
        try {
            return new Promise(async(resolve, reject) => {
                let count = 0
                let wishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:ObjectId(userId)})
                if (wishlist) {
                    count = wishlist.products.length
                }
                resolve(count)
            });
            
        } catch (error) {
            res.render('user/404',{user:true})

        }
    },
    addToWishlist:(userId,proId)=>{
        try {
            
            let proObj = {
                item:ObjectId(proId)
            }
            return new Promise(async(resolve, reject) => {
                let userWishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:ObjectId(userId)})
                if (userWishlist) {
                    let proExist = userWishlist.products.findIndex(product => product.item == proId)
                    if (proExist!= -1) {
                        db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:ObjectId(userId),'prodcuts.item':ObjectId(proId)},{
                            $pull:{products:{item:ObjectId(proId)}}
                        }).then(()=>{
                            
                            reject()
                        }).catch((error)=>{
                            
                        })
                    }else{
                        db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:ObjectId(userId)},{
                            $push:{products:{items:ObjectId(proId)}}
                        }).then(()=>{
                            
                            resolve()
                        }).catch((error)=>{
                            
                        })
                    }
                }else{
                   wishobj ={
                    user:ObjectId(userId),
                    products:[proObj]
                   }
                   db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishobj).then(()=>{
                    
                    resolve()
                   }).catch((error)=>{
                    
                   })
                }
            });
        } catch (error) {
            res.render('user/404',{user:true})

        }
    },
    getWishlists:async(userId)=>{
            return new Promise(async(resolve, reject) => {
                let wishlistItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                    {
                        $match: { user: ObjectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                        }
                    },
                    {
                        $lookup: {
                            from: 'product',
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    }
                ]).toArray()
                resolve(wishlistItems)
            }).catch((error)=>{
                res.render('user/404',{user:true})

            })
        
    },
    removeWishList:async(proId,userID)=>{
        return new Promise(async(resolve, reject) => {
          await  db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:ObjectID(userID),'products.item':ObjectID(proId)},
          {
            $pull:{products:{item:ObjectId(proId)}}
          }).then((reponse)=>{
            resolve()
          })
        }).catch((error)=>{
            
        })
    }
}

