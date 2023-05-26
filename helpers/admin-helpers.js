//admin login verification
let admindetails = require("../config/admin-details");
let db = require("../config/connection");
let collection = require("../config/collection");
const bcrypt = require("bcrypt");
const {
  response
} = require("../app");
const {
  ObjectId,
  ReturnDocument
} = require("mongodb");
let objectId = require("mongodb").ObjectId;
const moment = require('moment')


// var data = connection.userId

module.exports = {
  doLogin: async (userData) => {
    //data entered in browser
    return new Promise(async (resolve, reject) => {
      if (admindetails.Email == userData.Email) {
        bcrypt
          .compare(userData.Password, admindetails.Password)
          .then((loginTrue) => {
            //comparing user password with stored password as bcrypt
            let response = {};
            if (loginTrue) {
              
              response.admin = admindetails; //response after login success
              response.status = true;
              //  response.time=new Date;
              resolve(response); //response has both status and data
            } else {
              
              resolve({
                status: false
              });
            }
          });
      } else {
        
        resolve({
          status: false
        });
      }
    }).catch(() => {
      
    })
  },
  blockUser: async (userId) => {
    const response = await new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          {
            _id: objectId(userId)
          },
          {
            $set: {
              isBlocked: true
            }
          }
        )
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  
    return response;
  },
  unblockUser: async(userId) => {
    console.log(userId," userId");
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne({
          _id: objectId(userId)
        }, {
          $set: {
            isBlocked: false,
          },
        });
    }).then((response) => {
      resolve(response);
    }).catch((error) => {
      console.log(" an error occured ",error)
    })
  },
  changeOrderStatus: (data, OrderId) => {
    return new Promise((resolve, reject) => {
      if (data.status == 'Shipped') {
        db.get().collection(collection.ORDER_COLLECTION).updateOne({
          _id: objectId(data.OrderId)
        }, {
          $set: {
            status: data.status,
            is_shipped: true
          }
        }).then((response) => {
          resolve()
        }).catch((error) => {
          
        })
      } else if (data.status == 'Delivered') {
        db.get().collection(collection.ORDER_COLLECTION).updateOne({
          _id: objectId(data.OrderId)
        }, {
          $set: {
            status: data.status,
            is_delivered: true,
            deliveredDate: new Date()
          }
        }).then((response) => {
          resolve()
          
        }).catch((error) => {
          
        })
      } else if (data.status == 'Cancelled') {
        db.get().collection(collection.ORDER_COLLECTION).updateOne({
          _id: objectId(data.OrderId)
        }, {
          $set: {
            status: data.status,
            is_Cancelled: true
          }
        }).then((response) => {
          resolve()
        }).catch((error) => {
          
        })
      } else {
        db.get().collection(collection.ORDER_COLLECTION).updateOne({
          _id: objectId(data.OrderId)
        }, {
          $set: {
            status: data.status
          }
        }).then((response) => {

          resolve()
        }).catch((error) => {
          
        })
      }

    });
  },
  userOrderDetails: async (userID) => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([{
          $match: {
            userId: objectId(userID)
          }
        },
        {
          $unwind: "$products"
        },
        {
          $project: {
            item: '$products.item',
            quantity: "$products.quantity"
          }
        }, {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        }, {
          $project: {
            item: 1,
            quantity: 1,
            product: {
              $arrayElemAt: ['$product', 0]
            }
          }
        }
      ]).toArray()
      resolve(orderItems)
      

    }).catch((error) => {
      
    });



  },
  getSalesReport: async () => {

    return new Promise(async (resolve, reject) => {
      let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([{
          $lookup: {
            from: "user",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          },
        },
        {
          $unwind: '$user',
        },
        {
          $lookup: {
            from: 'product',
            localField: 'products.item',
            foreignField: '_id',
            as: 'product'
          },
        },
        {
          $unwind: "$product"
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            'user.Name': 1,
            'user.Email': 1,
            'product.Name': 1,
            'product.Price': 1,
            'products.quantity': 1,
            totalAmount: 1,
            PaymentMethod: 1,
            status: 1,
            date: 1,
            deliveredDate: 1,
            is_delivered: 1,
          }
        }
      ]).sort({
        date: -1
      }).toArray()
      if (orders) {
        for (let index = 0; index < orders.length; index++) {
          orders[index].date = moment(orders[index].date).format('DD-MM-YYYY')
        }
        resolve(orders)
      } else {
        resolve(0)
      }
    }).catch((error) => {
      
    });


  },
  salesReport: (searchCriterias) => {
    return new Promise(async (resolve, reject) => {
      let startDate, endDate, orders;
      if (searchCriterias.fromDate) {
        startDate = new Date(searchCriterias.fromDate)
        endDate = new Date(searchCriterias.toDate)
        if (searchCriterias.modeOfPayment == 'Show all') {
          orders = await db.get().collection(collection.ORDER_COLLECTION).find({
            orderStatus: 'Delivered',
            dated: {
              $gte: startDate,
              $lte: endDate
            }
          }).sort({
            dated: -1
          }).toArray()
        } else {
          orders = await db.get().collection(collection.ORDER_COLLECTION).find({
            orderStatus: 'Delivered',
            modeOfPayment: (searchCriterias.modeOfPayment),
            dated: {
              $gte: startDate,
              $lte: endDate
            }
          }).sort({
            dated: -1
          }).toArray()
        }
      } else {
        orders = await db.get().collection(collection.ORDER_COLLECTION).find({
          orderStatus: 'Delivered'
        }).sort({
          dated: -1
        }).toArray()
      }
      for (let i = 0; i < orders.length; i++) {
        orders[i].dated = moment(orders[i].dated).format('Do MMM YYYY')
      }
      resolve(orders)
    })
  },
  getSalesFilter: async (startDate, endDate) => {
    return new Promise(async (resolve, reject) => {
      startDate = new Date(startDate)
      endDate = new Date(endDate)
      
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([{
            $match: {
              date: {
                $gte: startDate,
                $lte: endDate,
              },
            },
          },
          {
            $lookup: {
              from: "user",
              localField: "userId",
              foreignField: "_id",
              as: "user"
            }
          },
          {
            $unwind: "$user"
          },
          {
            $lookup: {
              from: "product",
              localField: "products.item",
              foreignField: "_id",
              as: "product"
            }
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
              "product.Name": 1,
              "product.Price": 1,
              "products.quantity": 1,
              totalAmount: 1,
              PaymentMethod: 1,
              status: 1,
              date: 1,
              deliveredDate: 1,
              is_delivered: 1,
            }
          }

        ]).sort({
          date: -1
        }).toArray()
      if (orders) {
        for (let index = 0; index < orders.length; index++) {
          orders[index].date = moment(orders[index].date).format('DD-MM-YYYY')
        }
        resolve(orders)
        
      } else {
        resolve(0)
      }
    }).catch((error) => {
      
    });

  }
};