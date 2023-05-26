let db = require("../config/connection");
let collection = require("../config/collection");
let ObjectId = require("mongodb").ObjectId;
const moment = require('moment');
const {
  resolve
} = require("path");
const {
  error
} = require("console");



module.exports = {
  getUserOrders: async (userId) => {
    return new Promise(async (resolve, reject) => {
      
      let distinctUserIds = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .distinct("userId", {
          userId: ObjectId(userId)
        });

      

      if (distinctUserIds.length > 0) {
        let orders = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .find({
            userId: ObjectId(userId)
          })
          .sort({
            date: -1
          })
          .toArray();

        

        for (let index = 0; index < orders.length; index++) {
          orders[index].date = moment(orders[index].date).format("DD-MM-YYYY");
        }

        resolve(orders);
      } else {
        resolve(0);
      }
    }).catch((error) => {
      
    });
  },

  placeOrder: async (order, products, total, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(order," order");
    
        const deliveryAddressId = order.deliveryAddress;
        const user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) });
        const addressArray = user.address;
        const deliveryAddress = addressArray.find((address) => String(address._id) === deliveryAddressId);

        let status = order['PaymentMethod'] === 'COD' || order['PaymentMethod'] === 'Wallet' ? 'placed' : 'pending';
  
        let orderObj = {
          deliveryDetails: {
            name: deliveryAddress ? deliveryAddress.name : order.firstName || user.name || '',
            mobile: deliveryAddress ? deliveryAddress.phone : order.mobile || user.mobile || '',
            deliveryAddress: deliveryAddress ? deliveryAddress.address : order.deliveryAddress || '',
            town: deliveryAddress ? deliveryAddress.town : order.town || '',
            state: deliveryAddress ? deliveryAddress.state : order.state || '',
            pincode: deliveryAddress ? deliveryAddress.pincode : order.pincode || ''
          },
          billingaddress: order.billingaddress || '',
          userId: ObjectId(userId.toString()),
          PaymentMethod: order['PaymentMethod'],
          products: products,
          totalAmount: total,
          status: status,
          date: new Date()
        };
  
        db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
          for (let i = 0; i < products.length; i++) {
            const productId = products[i].item;
            const productQuantity = products[i].quantity;
  
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({
              _id: ObjectId(productId)
            }, {
              $inc: {
                Quantity: -parseInt(productQuantity)
              }
            });
          }
          db.get().collection(collection.CART_COLLECTION).deleteOne({
            user: ObjectId(userId)
          });
          resolve(response.insertedId);
        }).catch((error) => {
          
          reject(error);
        });
      } catch (error) {
        
        reject(error);
      }
    });
  }
  
  ,
  cancelOrders: async (userId, products) => {
    return new Promise(async (resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({
        _id: ObjectId(userId)
      }, {
        $set: {
          is_Cancelled: true,
          status: 'canceled'
        }
      }).then(() => {
        for (let i = 0; i < products.length; i++) {
          const productId = products[i].item;
          const productQuantity = products[i].quantity;
          


          db.get().collection(collection.PRODUCT_COLLECTION).updateOne({
              _id: ObjectId(productId)
            }, {
              $inc: {
                Quantity: productQuantity
              }
            }

          )
        }
        resolve()
      }).catch((error) => {
        
      })

    }).catch((error) => {
      
    })

  },

  returnOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({
        _id: ObjectId(orderId)
      })
      db.get().collection(collection.USER_COLLECTION).updateOne({
        _id: ObjectId(order.userId)
      }, {
        $inc: {
          wallet: order.totalAmount
        }
      }).then(() => {
        db.get().collection(collection.ORDER_COLLECTION).updateOne({
          _id: ObjectId(orderId)
        }, {
          $set: {
            is_returned: true,
            status: 'returned',
            returnedDate: new Date()
          }
        }).then(() => {
          resolve()
        })
      }).catch((error) => {
        
      })
    })
  },
  getNeedtoCancelPrds: async (OrderId) => {
    return new Promise(async (resolve, reject) => {
      let order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([{
          $match: {
            _id: ObjectId(OrderId)
          }
        },
        {
          $unwind: "$products"

        },
        {
          $project: {
            _id: '$products.item',
            quantity: "$products.quantity"
          }
        }
      ]).toArray()
      resolve(order)
      
    }).catch((error) => {
      
    })
  },
  getAllOrders: async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const allProducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([{
            $lookup: {
              from: "user",
              localField: "userId",
              foreignField: "_id",
              as: "user"
            },
          },
          {
            $unwind: "$user",
          },
          {
            $lookup: {
              from: "product",
              localField: "products.item",
              foreignField: "_id",
              as: "product"
            },
          },
          {
            $unwind: "$product"
          },
          {
            $project: {
              _id: 1,
              userId: 1,
              "user.Name": 1,
              "user.Email": 1,
              "user.Number": 1,
              "product.Name": 1,
              "product.Price": 1,
              "products.quantity": 1,
              deliveryDetails: 1,
              billingaddress: 1, // Include billingaddress field
              totalAmount: 1,
              PaymentMethod: 1,
              status: 1,
              date: 1,
              deliveredDate: 1,
              is_delivered: 1,
            }
          },
          {
            $sort: {
              date: -1
            }
          },
          {
            $group: {
              _id: "$_id",
              userId: {
                $first: "$userId"
              },
              user: {
                $first: "$user"
              },
              product: {
                $push: "$product"
              },
              products: {
                $first: "$products"
              },
              totalAmount: {
                $first: "$totalAmount"
              },
              PaymentMethod: {
                $first: "$PaymentMethod"
              },
              status: {
                $first: "$status"
              },
              date: {
                $first: "$date"
              },
              deliveredDate: {
                $first: "$deliveredDate"
              },
              is_delivered: {
                $first: "$is_delivered"
              },
              deliveryDetails: {
                $first: "$deliveryDetails"
              }, // Include deliveryDetails field
              billingaddress: {
                $first: "$billingaddress"
              }, // Include billingaddress field
            }
          },
        ]).toArray();

        if (allProducts) {
          for (let index = 0; index < allProducts.length; index++) {
            allProducts[index].date = moment(allProducts[index].date).format('DD-MM-YYYY');
            allProducts[index].deliveredDate = moment(allProducts[index].deliveredDate).format('DD-MM-YYYY');
          }
          resolve(allProducts);
        } else {
          resolve([]);
        }
      } catch (error) {
        
        reject(error);
      }
    });
  }


}