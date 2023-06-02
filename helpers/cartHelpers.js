const db = require('../config/connection');
const collection = require('../config/collection');
const {
  ObjectId
} = require('mongodb');

module.exports = {
  getAllBanners: async () => {
    try {
      const allBanners = await db.get().collection(collection.BANNER_COLLECTION).find().toArray();
      return allBanners;
    } catch (error) {
      return [];
    }
  },

  addBanner: async (data) => {
    try {
      const existingBanner = await db
        .get()
        .collection(collection.BANNER_COLLECTION)
        .findOne({
          name: data.name
        });
      if (existingBanner) {
        throw new Error('Banner already exists');
      }
      const response = await db.get().collection(collection.BANNER_COLLECTION).insertOne(data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getBannerDetails: async (id) => {
    try {
      const banner = await db
        .get()
        .collection(collection.BANNER_COLLECTION)
        .findOne({
          _id: ObjectId(id)
        });
      return banner;
    } catch (error) {
      throw error;
    }
  },

  editBanner: async (data) => {
    try {
      await db.get().collection(collection.BANNER_COLLECTION).updateOne({
        _id: ObjectId(data._id)
      }, {
        $set: {
          name: data.name,
          subname: data.subname,
          offer: data.offer,
        },
      });
      return;
    } catch (error) {
      throw error;
    }
  },

  deleteBanner: async (id) => {
    try {
      await db.get().collection(collection.BANNER_COLLECTION).deleteOne({
        _id: ObjectId(id),
      });
      return;
    } catch (error) {
      throw error;
    }
  },

  addToCart: async (proId, userId) => {
    try {
      const user = await db.get().collection(collection.USER_COLLECTION).findOne({
        _id: ObjectId(userId),
      });
      if (user.isblocked) {
        return {
          status: 'blocked'
        };
      }

      const proObj = {
        item: ObjectId(proId),
        quantity: 1,
      };

      let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({
        user: ObjectId(userId),
      });

      if (userCart) {
        const productExist = userCart.products.findIndex(
          (product) => product.item.toString() === proId
        );
        if (productExist !== -1) {
          await db.get().collection(collection.CART_COLLECTION).updateOne({
            user: ObjectId(userId),
            'products.item': ObjectId(proId),
          }, {
            $inc: {
              'products.$.quantity': 1,
            },
          });
        } else {
          await db.get().collection(collection.CART_COLLECTION).updateOne({
            user: ObjectId(userId)
          }, {
            $push: {
              products: proObj,
            },
          });
        }
      } else {
        const cartObj = {
          user: ObjectId(userId),
          products: [proObj],
        };
        await db.get().collection(collection.CART_COLLECTION).insertOne(cartObj);
      }
      return {
        status: 'success'
      };
    } catch (error) {
      console.log(error);
      return {
        status: 'error'
      };
    }
  },

  getCartProducts: async (userId) => {
    try {
      const cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([{
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
              quantity: '$products.quantity',
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: 'item',
              foreignField: '_id',
              as: 'product',
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
        ])
        .toArray();

      return cartItems;
    } catch (error) {
      throw error;
    }
  },

  getCartCount: async (userId) => {
    try {
      const count = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({
          user: ObjectId(userId)
        });

      if (count) {
        return count.products.length;
      } else {
        return 0;
      }
    } catch (error) {
      throw error;
    }
  },

  changeProductQuantity: async (details) => {
    const {
      cartId,
      productId,
      quantity
    } = details;
    try {
      await db.get().collection(collection.CART_COLLECTION).updateOne({
        _id: ObjectId(cartId),
        'products.item': ObjectId(productId)
      }, {
        $set: {
          'products.$.quantity': parseInt(quantity),
        },
      });
      return;
    } catch (error) {
      throw error;
    }
  },

  deleteCartItem: async (cartId, productId) => {
    try {
      await db.get().collection(collection.CART_COLLECTION).updateOne({
        _id: ObjectId(cartId)
      }, {
        $pull: {
          products: {
            item: ObjectId(productId)
          }
        },
      });
      return;
    } catch (error) {
      throw error;
    }
  },



getTotalAmount: async (userId) => {
  try {
    const cart = await db.get().collection(collection.CART_COLLECTION).findOne({
      user: ObjectId(userId),
    });
    if (cart) {
      let total = 0;
      for (let product of cart.products) {
        const prodPrice = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .findOne({
            _id: ObjectId(product.item)
          });
        total += parseInt(prodPrice.Price) * product.quantity; // Convert Price to number before multiplication
      }
      console.log(total + " total");
      return total;
    } else {
      return 0;
    }
  } catch (error) {
    throw error;
  }
},

  placeOrder: async (order, products, total) => {
    try {
      order.total = total;
      order.date = new Date();

      const response = await db.get().collection(collection.ORDER_COLLECTION).insertOne(order);

      const orderObj = {
        orderId: response.insertedId,
        products: products,
        total: total,
        status: 'placed',
        date: order.date,
      };

      await db.get().collection(collection.CART_COLLECTION).updateOne({
        user: ObjectId(order.userId)
      }, {
        $pull: {
          products: {}
        },
      });

      await db.get().collection(collection.ORDER_COLLECTION).updateOne({
        _id: response.insertedId
      }, {
        $set: {
          order: orderObj
        },
      });
      return response.insertedId;
    } catch (error) {
      throw error;
    }
  },
  getCartProductList: async (userId) => {
    try {
      const cart = await db.get().collection(collection.CART_COLLECTION).findOne({
        user: ObjectId(userId),
      });

      if (cart && cart.products) {
        return cart.products;
      } else {
        return []; // Return an empty array if the cart or products are null
      }
    } catch (error) {
      console.error('An error occurred:', error);
      throw error; // Rethrow the error to be handled by the caller
    }
  },

  findCartQuantity: async (userId, productId) => {
    try {
      const cart = await db.get().collection(collection.CART_COLLECTION).findOne({
        user: ObjectId(userId),
      });
      if (cart) {
        const productExist = cart.products.findIndex(
          (product) => product.item.toString() === productId
        );
        if (productExist !== -1) {
          return cart.products[productExist].quantity;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    } catch (error) {
      throw error;
    }
  },
};