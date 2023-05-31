const admindetails = require("../config/admin-details");
const db = require("../config/connection");
const collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const moment = require('moment');

module.exports = {
  doLogin: async (userData) => {
    return new Promise(async (resolve, reject) => {
      if (admindetails.Email === userData.Email) {
        bcrypt.compare(userData.Password, admindetails.Password)
          .then((loginTrue) => {
            let response = {};
            if (loginTrue) {
              response.admin = admindetails;
              response.status = true;
              resolve(response);
            } else {
              resolve({ status: false });
            }
          });
      } else {
        resolve({ status: false });
      }
    }).catch((error) => {});
  },
  
  blockUser: async (userId) => {
    const response = await db.get().collection(collection.USER_COLLECTION).updateOne(
      { _id: ObjectId(userId) },
      { $set: { isBlocked: true } }
    );
    return response;
  },

  unblockUser: async (userId) => {
    const response = await db.get().collection(collection.USER_COLLECTION).updateOne(
      { _id: ObjectId(userId) },
      { $set: { isBlocked: false } }
    );
    return response;
  },

  changeOrderStatus: (data, orderId) => {
    return new Promise((resolve, reject) => {
      if (data.status === 'Shipped') {
        db.get().collection(collection.ORDER_COLLECTION).updateOne(
          { _id: ObjectId(data.OrderId) },
          { $set: { status: data.status, is_shipped: true } }
        ).then(() => {
          resolve();
        }).catch((error) => {});
      } else if (data.status === 'Delivered') {
        db.get().collection(collection.ORDER_COLLECTION).updateOne(
          { _id: ObjectId(data.OrderId) },
          { $set: { status: data.status, is_delivered: true, deliveredDate: new Date() } }
        ).then(() => {
          resolve();
        }).catch((error) => {});
      } else if (data.status === 'Cancelled') {
        db.get().collection(collection.ORDER_COLLECTION).updateOne(
          { _id: ObjectId(data.OrderId) },
          { $set: { status: data.status, is_Cancelled: true } }
        ).then(() => {
          resolve();
        }).catch((error) => {});
      } else {
        db.get().collection(collection.ORDER_COLLECTION).updateOne(
          { _id: ObjectId(data.OrderId) },
          { $set: { status: data.status } }
        ).then(() => {
          resolve();
        }).catch((error) => {});
      }
    });
  },

  userOrderDetails: async (userId) => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        { $match: { userId: ObjectId(userId) } },
        { $unwind: "$products" },
        { $project: { item: '$products.item', quantity: "$products.quantity" } },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            product: { $arrayElemAt: ['$product', 0] }
          }
        }
      ]).toArray();
      resolve(orderItems);
    }).catch((error) => {});
  },

  getSalesReport: async () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $lookup: {
            from: "user",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: '$user' },
        {
          $lookup: {
            from: 'product',
            localField: 'products.item',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: "$product" },
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
      ]).sort({ date: -1 }).toArray();
      if (orders) {
        for (let index = 0; index < orders.length; index++) {
          orders[index].date = moment(orders[index].date).format('DD-MM-YYYY');
        }
        resolve(orders);
      } else {
        resolve(0);
      }
    }).catch((error) => {});
  },

  salesReport: (searchCriterias) => {
    return new Promise(async (resolve, reject) => {
      let startDate, endDate, orders;
      if (searchCriterias.fromDate) {
        startDate = new Date(searchCriterias.fromDate);
        endDate = new Date(searchCriterias.toDate);
        if (searchCriterias.modeOfPayment === 'Show all') {
          orders = await db.get().collection(collection.ORDER_COLLECTION).find({
            orderStatus: 'Delivered',
            dated: { $gte: startDate, $lte: endDate }
          }).sort({ dated: -1 }).toArray();
        } else {
          orders = await db.get().collection(collection.ORDER_COLLECTION).find({
            orderStatus: 'Delivered',
            modeOfPayment: (searchCriterias.modeOfPayment),
            dated: { $gte: startDate, $lte: endDate }
          }).sort({ dated: -1 }).toArray();
        }
      } else {
        orders = await db.get().collection(collection.ORDER_COLLECTION).find({
          orderStatus: 'Delivered'
        }).sort({ dated: -1 }).toArray();
      }
      for (let i = 0; i < orders.length; i++) {
        orders[i].dated = moment(orders[i].dated).format('Do MMM YYYY');
      }
      resolve(orders);
    });
  },

  getSalesFilter: async (startDate, endDate) => {
    return new Promise(async (resolve, reject) => {
      startDate = new Date(startDate);
      endDate = new Date(endDate);
      let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            date: {
              $gte: endDate,
              $lte: startDate
            }
          }
        },
        {
          $lookup: {
            from: "user",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "product",
            localField: "products.item",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" },
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
            is_delivered: 1
          }
        }
      ]).sort({ date: -1 }).toArray();
      if (orders) {
        for (let index = 0; index < orders.length; index++) {
          orders[index].date = moment(orders[index].date).format('DD-MM-YYYY');
        }
        resolve(orders);
      } else {
        resolve(0);
      }
    }).catch((error) => {});
  }
};
