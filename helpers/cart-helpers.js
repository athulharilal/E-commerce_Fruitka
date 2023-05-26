let db = require('../config/connection')
let collection = require("../config/collection");
let ObjectId = require("mongodb").ObjectId;


module.exports = {

    addToCart: (proId, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                //Check if the user is blocked
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                    _id: ObjectId(userId)
                });
                if (user.isblocked) {
                    // User is blocked, return an error response
                    resolve({ status: 'blocked' });
                    return;
                }
    
                let proObj = {
                    item: ObjectId(proId),
                    quantity: 1
                };
    
                let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({
                    user: ObjectId(userId)
                });
    
                if (userCart) {
                    let productExist = userCart.products.findIndex(product => product.item.toString() === proId);
                    if (productExist !== -1) {
                        db.get().collection(collection.CART_COLLECTION).updateOne({
                            user: ObjectId(userId),
                            'products.item': ObjectId(proId)
                        }, {
                            $inc: {
                                'products.$.quantity': 1
                            }
                        }).then(() => {
                            resolve({ status: 'success' });
                        });
                    } else {
                        db.get().collection(collection.CART_COLLECTION).updateOne({
                            user: ObjectId(userId)
                        }, {
                            $push: {
                                products: proObj
                            }
                        }).then(() => {
                            resolve({ status: 'success' });
                        });
                    }
                } else {
                    let cartobj = {
                        user: ObjectId(userId),
                        products: [proObj]
                    };
                    db.get().collection(collection.CART_COLLECTION).insertOne(cartobj).then(() => {
                        resolve({ status: 'success' });
                    });
                }
            } catch (error) {
                console.log(error);
                resolve({ status: 'error' });
            }
        });
    }
    ,

    getCartProducts: (userId) => {
        try {

            return new Promise(async (resolve, reject) => {
                try {
                    let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([{
                            $match: {
                                user: ObjectId(userId)
                            }
                        },
                        {
                            $unwind: '$products'
                        },
                        {
                            $project: {
                                item: '$products.item',
                                quantity: "$products.quantity",
                            }
                        },
                        {
                            $lookup: {
                                from: "product",
                                localField: "item",
                                foreignField: "_id",
                                as: "product"
                            }
                        },
                        {
                            $project: {
                                item: 1,
                                quantity: 1,
                                product: {
                                    $arrayElemAt: ['$product', 0]
                                }
                            }
                        }
                    ]).toArray()
                    resolve(cartItems)

                } catch (error) {
                    resolve(0)

                }
            })
        } catch (error) {

        }
    },
    getCartCount: async (userId) => {

        return new Promise(async (resolve, reject) => {
            let count = 0
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({
                user: ObjectId(userId)
            })
            if (userCart) {
                count = userCart.products.length
            }
            resolve(count)
        }).catch((error) => {
            
        })


    },
    //   getCartSubTotal:(userId,proID)=>{
    //     return new Promise(async(resolve, reject) => {
    //         try {
    //             let cartSubTotal = await db.get().collection(collection.CART_COLLECTION).aggregate([
    //                 {
    //                     $match: { user: ObjectId(userId) }
    //                   },
    //                   {
    //                     $unwind: '$products'
    //                   },
    //                   {
    //                     $project: {
    //                       item: '$products.item',
    //                       quantity: "$products.quantity",
    //                     }
    //                   },
    //                   {
    //                     $lookup: {
    //                       from: 'product',
    //                       localField: 'item',
    //                       foreignField: '_id',
    //                       as: 'product'
    //                     }
    //                   },
    //                   {
    //                     $project: {
    //                       item: 1,
    //                       quantity: 1,
    //                       product: { $arrayElemAt: ['$product', 0] }
    //                     }
    //                   },
    //               {
    //                 $project:{
    //                   _id:null,
    //                   subTotal:{$sum:{$multiply:['$quantity','$unitprice']}}
    //                 }
    //               }
    //             ]).toArray()
    //             
    //             if (cartSubTotal.length>0) {
    //                 

    //               db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId), "products.item": ObjectId(proID) },
    //                     {
    //                         $set: {
    //                             'products.$.subtotal': cartSubTotal[0].subtotal
    //                         }
    //                     }).then((response) => {
    //                         resolve(cartSubTotal[0].subtotal)
    //                     })
    //             }
    //               


    //         } catch (error) {
    //             
    //             resolve(0)
    //         }
    //     });
    //   },

    changeProductQuantity: async (details) => {
        details.quantity = parseInt(details.quantity)
        details.count = parseInt(details.count)
        
        return new Promise(async (resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION).updateOne({
                    _id: ObjectId(details.cart)
                }, {
                    $pull: {
                        products: {
                            item: ObjectId(details.product)
                        }
                    }
                }).then((response) => {
                    resolve({
                        itemRemoved: true
                    })
                }).catch((error) => {
                    
                })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({
                        _id: ObjectId(details.cart),
                        'products.item': ObjectId(details.product)
                    }, {
                        $inc: {
                            'products.$.quantity': details.count
                        }
                    }).then((response) => {
                        resolve({
                            status: true
                        })
                    }).catch((error) => {
                        
                    })
            }
        }).catch((error) => {
            
        })
    },

    deleteCartItem: (proId, cartId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({
                _id: ObjectId(cartId),
                'products.item': objectId(proId)
            }, {
                $pull: {
                    products: {
                        item: objectId(proId)
                    }
                }
            }).then((response) => {
                resolve()
            }).catch((error) => {
                
            })
        })
    },

    getTotalAmount: async (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let total = await db.get().collection(collection.CART_COLLECTION).aggregate([{
                        $match: {
                            user: ObjectId(userId)
                        }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: "$products.quantity",
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
                            item: 1,
                            quantity: 1,
                            product: {
                                $arrayElemAt: ['$product', 0]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: {
                                $sum: {
                                    $multiply: ['$quantity', {
                                        $toDouble: '$product.Price'
                                    }]
                                }
                            }
                        }
                    }
                ]).toArray()
                if (total[0] && total[0].total) {
                    resolve(total[0].total)
                } else {
                    resolve(0)
                }
            } catch (error) {
                
                reject(error);
            }
        })
    },
    placeOrder: async (order, products, total) => {
        return new Promise((resolve, reject) => {
            let status = order['paymentMethod'] === 'COD' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    firstName: order.firstName,
                    mobile: order.mobile,
                    address: order.address,
                    town: order.town,
                    state: order.state,
                    pincode: order.pincode,
                },
                userId: objectId(order.user_id),
                PaymentMethod: order['paymentMethod'],
                products: products,
                totalAmount: total,
                status: status,
                date: new Date()
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({
                    user: ObjectId(order.user_id)
                })
                resolve(response.insertedId)
            }).catch((error) => {
                
            })
        }).catch((error) => {
            
        })

    },
    findCartQuantity: (userID, proId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let userCart = await db.get().collection(collection.CART_COLLECTION).aggregate([{
                        $match: {
                            user: ObjectId(userID)
                        },
                    },
                    {
                        $unwind: "$products",
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity',
                        },
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: "item",
                            foreignField: "_id",
                            as: "product"
                        },
                    },
                    {
                        $match: {
                            item: ObjectId(proId)
                        },
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            product: {
                                $arrayElemAt: ['$product', 0]
                            },
                        },
                    },
                    {
                        $project: {
                            unitprice: {
                                $toInt: "$product.price"
                            },
                            quantity: {
                                $toInt: "$quantity"
                            },
                        },
                    },
                ]).toArray()
                resolve(userCart[0].quantity)
                
            } catch (error) {
                resolve(0)
            }
        });
    },
    getCartProductList: async (userId) => {
        return new Promise(async (resolve, reject) => {
          let cart = await db.get().collection(collection.CART_COLLECTION).findOne({
            user: ObjectId(userId)
          })
      
          if (cart && cart.products) {
            resolve(cart.products);
          } else {
            resolve([]); // Return an empty array if cart or products are null
          }
        }).catch((error) => {
          reject(error);
        });
      }
      ,
}