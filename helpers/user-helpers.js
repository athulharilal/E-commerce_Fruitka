const bcrypt = require("bcrypt");
const { USER_COLLECTION } = require("../config/collection");
const { ObjectID } = require("bson");
const moment = require('moment');
const Razorpay = require('razorpay');
const referralCodeGenerator = require('referral-code-generator');
const db = require("../config/connection");
const collection = require("../config/collection");
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const instance = new Razorpay({
  key_id: 'rzp_test_AF9BQ131vX5VfH',
  key_secret: 'P7Je61iOLRMcWxUajiJcwhL4',
});

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = {};
        let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email });
        let user1 = await db.get().collection(collection.USER_COLLECTION).findOne({ Number: userData.Number });

        if (user || user1) {
          resolve({ status: false });
        } else {
          let referUser = userData.referalCode;

          if (referUser) {
            let referUser = await db.get().collection(collection.USER_COLLECTION).findOne({ referalCode: userData.referalCode });

            if (referUser) {
              userData.Password = await bcrypt.hash(userData.Password, 10);
              let referalCode = userData.Name.slice(0, 3) + referralCodeGenerator.alpha('lowercase', 6);
              userData.referalCode = referalCode;
              userData.wallet = parseInt(50);

              let walletAmount = parseInt(referUser.wallet) || 0;

              await db.get().collection(collection.USER_COLLECTION).insertOne(userData);
              await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectID(referUser._id) },
                {
                  $set: {
                    wallet: parseInt(100) + walletAmount
                  }
                });

              resolve({ status: true });
            } else {
              reject();
            }
          } else {
            userData.Password = await bcrypt.hash(userData.Password, 10);
            userData.wallet = parseInt(0);
            let referalCode = userData.Name.slice(0, 3) + referralCodeGenerator.alpha('lowercase', 6);
            userData.referalCode = referalCode;
            userData.isBlocked = false;

            await db.get().collection(collection.USER_COLLECTION).insertOne(userData);

            resolve({ status: true });
          }
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  doLogin: async (userData) => {
    try {
      const user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email });

      if (user) {
        const passwordMatch = await bcrypt.compare(userData.Password, user.Password);

        if (passwordMatch) {
          if (user.isBlocked) {
            return { status: false, message: "Your account is blocked. Please contact the administrator." };
          } else {
            return { status: true, user };
          }
        } else {
          return { status: false, message: "Invalid password." };
        }
      } else {
        return { status: false, message: "User not found." };
      }
    } catch (error) {
      console.log("An error occurred:", error);
      throw error;
    }
  },

  addUser: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        userData.Password = await bcrypt.hash(userData.Password, 10);
        const data = await db.get().collection(collection.USER_COLLECTION).insertOne(userData);

        resolve(data.insertedId);
      } catch (error) {
        reject(error);
      }
    });
  },

  getAllUsers: async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const users = await db.get().collection(collection.USER_COLLECTION).find().toArray();

        resolve(users);
      } catch (error) {
        reject(error);
      }
    });
  },

  getOneUser: (proId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectID(proId) })
        .then((user) => {
          resolve(user);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  getOneUserDetails: (userId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectID(userId) })
        .then((user) => {
          resolve(user);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  getUserData: (id) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectID(id) })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  changeProductQuantity: (details) => {
    details.quantity = parseInt(details.quantity);
    details.count = parseInt(details.count);

    return new Promise((resolve, reject) => {
      try {
        if (details.count == -1 && details.quantity == 1) {
          db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectID(details.cart) },
            {
              $pull: { products: { item: ObjectID(details.product) } }
            }).then((response) => {
              resolve({ itemRemoved: true });
            });
        } else {
          db.get().collection(collection.CART_COLLECTION)
            .updateOne({ _id: ObjectID(details.cart), 'products.item': ObjectID(details.product) },
              {
                $inc: { 'products.$.quantity': details.count }
              }).then((response) => {
                resolve({ status: true });
              });
        }
      } catch (error) {
        resolve(0);
      }
    });
  },

  generateRazorpay: async (orderId, total) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: total * 100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          reject(err);
        } else {
          resolve(order);
        }
      });
    });
  },

  verifyPayment: async (details) => {
    return new Promise((resolve, reject) => {
      let hmac = crypto.createHmac('sha256', 'P7Je61iOLRMcWxUajiJcwhL4');
      hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
      hmac = hmac.digest('hex');

      if (hmac === details['payment[razorpay_signature]']) {
        resolve();
      } else {
        reject();
      }
    });
  },

  changePaymentStatus: (orderID) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectID(orderID) },
        {
          $set: {
            status: 'placed'
          }
        }).then(() => {
          resolve();
        }).catch((error) => {
          reject(error);
        });
    });
  },

  editMyProfile: (userDetails, userId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectID(userId) },
        {
          $set: {
            Name: userDetails.Name,
            Email: userDetails.Email,
            Number: userDetails.Number,
          }
        }).then(() => {
          resolve();
        }).catch((error) => {
          reject(error);
        });
    });
  },

  addAddress: (newAddress, userId) => {
    const addressId = uuidv4(); // Generate a unique address id using uuid
    // Add the addressId to the newAddress object
    newAddress._id = addressId;

    return new Promise(async (resolve, reject) => {
      try {
        await db.get().collection(collection.USER_COLLECTION).updateOne(
          { _id: ObjectID(userId) },
          {
            $addToSet: {
              address: newAddress
            }
          }
        );

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  deleteAddress: (addressId, userId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).updateOne(
        { _id: ObjectID(userId) },
        {
          $pull: {
            address: { _id: addressId }
          }
        }
      ).then(() => {
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  },

     
  editAddress: (data, userId) => {
    if (data.id != '' && data.name != '' && data.address != '' && data.town != '' && data.district != '' && data.state != '' && data.pincode != '' && data.phone != '') {
      let uniqueId = data.id;
      return new Promise(async (resolve, reject) => {
        try {
          await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId), 'address.id': uniqueId },
            {
              $set: {
                'address.$': data
              }
            });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }
  },

  getUserAddress: (userID) => {
    return new Promise(async (resolve, reject) => {
      try {
        let address = await db.get().collection(collection.USER_COLLECTION).aggregate([
          {
            $match: { _id: ObjectId(userID) }
          },
          {
            $unwind: '$address'
          },
          {
            $project: {
              name: '$address.name',
              address: '$address.address',
              town: '$address.town',
              district: '$address.district',
              state: '$address.state',
              pincode: '$address.pincode',
              phone: '$address.phone'
            }
          },
        ]).toArray();
        resolve(address);
      } catch (error) {
        reject(error);
      }
    });
  },

  getUserOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            $match: { _id: ObjectId(orderId) }
          },
          {
            $unwind: "$products"
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
              CouponName: 1,
              couponTotal: 1,
              discountValue: 1
            }
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product"
            }
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
              CouponName: 1,
              couponTotal: 1,
              discountValue: 1
            }
          }
        ]).toArray();

        resolve(orderItems);
      } catch (error) {
        reject(error);
      }
    });
  },

  changePassword: async (userId, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        data.newPassword = await bcrypt.hash(data.newPassword, 10);
        let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) });

        if (user) {
          bcrypt.compare(data.newPassword, user.Password).then((response) => {
            if (response) {
              db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) },
                {
                  $set: {
                    Password: data.newPassword
                  }
                }).then(() => {
                resolve({ status: false });
              });
            } else {
              resolve({ status: true });
            }
          });
        } else {
          resolve({ status: true });
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  findWallet: (userID) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userID) }).then((response) => {
        resolve(response);
      }).catch((error) => {
        reject(error);
      });
    });
  },

  findWalletAmount: (userID) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userID) });
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  },

  findRefundAmount: (userID) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await db.get().collection(collection.ORDER_COLLECTION).findOne({ userId: ObjectId(userID) }, { totalAmount: 1 });
        resolve(response.totalAmount);
      } catch (error) {
        reject(error);
      }
    });
  },

  toWallet: (userID, orderID, amount) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userID) }, { $set: { wallet: parseInt(amount) } });
        await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderID) }, { $set: { status: "Refund has Been Initiated" } });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  setWallet: (amount, orderID, userID) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userID) }, { $set: { wallet: parseInt(amount) } });
        await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderID) }, { $set: { status: "Refund has Been Initiated" } });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  reduceWallet: (user, amount, walletAmount) => {
    let userId = user._id;

    return new Promise(async (resolve, reject) => {
      try {
        await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, { $set: { wallet: (walletAmount - amount) } });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  getUserInvoice: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ _id: ObjectId(orderId) },
          {
            sort: {
              date: -1
            }
          }).toArray();

        for (let index = 0; index < orders.length; index++) {
          orders[index].date = moment(orders[index].date).format('DD-MM-YYYY');
        }
        for (let index = 0; index < orders.length; index++) {
          orders[index].deliveredDate = moment(orders[index].deliveredDate).format('DD-MM-YYYY');
        }

        resolve(orders);
      } catch (error) {
        reject(error);
      }
    });
  },

  findProCount: (userId, proId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = await db.get().collection(collection.CART_COLLECTION).aggregate([
          {
            $match: {
              user: ObjectId(userId)
            }
          },
          {
            $project: {
              _id: 0,
              products: '$products'
            }
          },
          {
            $unwind: '$products'
          },
          {
            $match: {
              'products.item': ObjectId(proId)
            }
          },
          {
            $project: {
              quantity: '$products.quantity'
            }
          }
        ]).toArray();

        if (count.length > 0) {
          resolve(count[0].quantity);
        } else {
          resolve(0);
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  findStock: (proId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(proId) });
        resolve(product.Quantity);
      } catch (error) {
        reject(error);
      }
    });
  },

  deleteCartItem: (proId, cartId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(cartId), 'products.item': ObjectId(proId) },
          {
            $pull: { products: { item: ObjectId(proId) } }
          });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};
