let db = require("../config/connection");
let collection = require("../config/collection");
// const { response } = require("../app");
let objectId = require("mongodb").ObjectId;

module.exports = {
  getUserCount: async () => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let users = await db.get().collection(collection.USER_COLLECTION).find().toArray();
      if (users) {
        count = users.length;
        resolve(count);
      } else {
        resolve(count);
      }
    }).catch((error) => {});
  },

  totalOrders: async () => {
    return new Promise(async (resolve, reject) => {
      let totalOrders = await db.get().collection(collection.ORDER_COLLECTION).countDocuments();
      resolve(totalOrders);
    }).catch((error) => {});
  },

  totalProducts: () => {
    return new Promise(async (resolve, reject) => {
      let totalProducts = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments();
      resolve(totalProducts);
    }).catch((error) => {});
  },

  canelTotal: async () => {
    return new Promise(async (resolve, reject) => {
      let orderCanceled = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({ status: "canceled" });
      resolve(orderCanceled);
    }).catch((error) => {});
  },

  dailyRevenue: async () => {
    return new Promise(async (resolve, reject) => {
      let dailyRevenue = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              date: {
                $gte: new Date(new Date() - 1000 * 60 * 60 * 24),
              },
            },
          },
          {
            $match: {
              status: "Delivered",
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$totalAmount" },
            },
          },
        ])
        .toArray();
      resolve(dailyRevenue[0].totalAmount);
    }).catch((error) => {});
  },

  totalRevenue: async () => {
    return new Promise(async (resolve, reject) => {
      let totalRevenue = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              status: "Delivered",
            },
          },
          {
            $project: {
              totalAmount: "$totalAmount",
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$totalAmount" },
            },
          },
        ])
        .toArray();
      if (totalRevenue && totalRevenue.length > 0 && totalRevenue[0].totalAmount) {
        resolve(totalRevenue[0].totalAmount);
      } else {
        resolve(0);
      }
    }).catch((error) => {});
  },

  weeklyRevenue: async () => {
    return new Promise(async (resolve, reject) => {
      let weeklyRevenue = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              date: {
                $gte: new Date(new Date() - 1000 * 60 * 60 * 24 * 7),
              },
            },
          },
          {
            $match: {
              status: "Delivered",
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$totalAmount" },
            },
          },
        ])
        .toArray();
      resolve(weeklyRevenue[0].totalAmount);
    }).catch((error) => {});
  },

  getChartData: () => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { status: "Delivered" },
          },
          {
            $project: {
              date: { $convert: { input: "$_id", to: "date" } },
              total: "$totalAmount",
            },
          },
          {
            $match: {
              date: {
                $lt: new Date(),
                $gt: new Date(new Date().getTime() - 34 * 60 * 60 * 1000 * 365),
              },
            },
          },
          {
            $group: {
              _id: { $month: "$date" },
              total: { $sum: "$total" },
            },
          },
          {
            $project: {
              month: "$_id",
              total: "$total",
              _id: 0,
            },
          },
        ])
        .toArray()
        .then((result) => {
          db.get()
            .collection(collection.ORDER_COLLECTION)
            .aggregate([
              {
                $match: { status: "Delivered" },
              },
              {
                $project: {
                  date: {
                    $convert: {
                      input: "$_id",
                      to: "date",
                    },
                  },
                  total: "$totalAmount",
                },
              },
              {
                $match: {
                  date: {
                    $lt: new Date(new Date().getTime() - 24 * 60 * 60 * 100 * 7),
                  },
                },
              },
              {
                $group: {
                  _id: { $dayOfWeek: "$date" },
                  total: { $sum: "$total" },
                },
              },
              {
                $project: {
                  date: "$_id",
                  total: "$total",
                  _id: 0,
                },
              },
              {
                $sort: { date: 1 },
              },
            ])
            .toArray()
            .then((weeklyReport) => {
              let obj = {
                result,
                weeklyReport,
              };
              resolve(obj);
            });
        })
        .catch((error) => {});
    });
  },

  catData: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { status: "Delivered" },
          },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "products.item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $unwind: "$product",
          },
          {
            $group: {
              _id: "$product.category",
              total: { $sum: "$products.quantity" },
            },
          },
          {
            $lookup: {
              from: collection.CAT_COLLECTION,
              localField: "_id",
              foreignField: "_id",
              as: "category",
            },
          },
        ])
        .toArray()
        .then((catData) => {
          resolve(catData);
        });
    });
  },

  paymentData: () => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { status: "Delivered" },
          },
          {
            $unwind: "$products",
          },
          {
            $group: {
              _id: "$PaymentMethod",
              total: { $sum: "$products.quantity" },
            },
          },
          {
            $project: {
              _id: 0,
              PaymentMethod: "$_id",
              total: 1,
            },
          },
          {
            $sort: { paymentMethod: 1 },
          },
        ])
        .toArray()
        .then((paymentData) => {
          resolve(paymentData);
        });
    });
  },

  dailySales: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { status: "Delivered" },
          },
          {
            $project: {
              deliveredDate: 1,
            },
          },
        ])
        .toArray()
        .then((response) => {
          if (response.length > 0 && response[0].deliveredDate) {
            resolve(response[0].deliveredDate);
          } else {
            resolve(0);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
};
