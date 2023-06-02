const db = require('../config/connection');
const collection = require('../config/collection');
const ObjectId = require('mongodb').ObjectId;
const moment = require('moment');

module.exports = {
  getAllCoupons: async () => {
    try {
      const coupons = await db.get().collection(collection.COUPON_COLLECTION).find().toArray();
      return coupons;
    } catch (error) {
      throw error;
    }
  },

  addCoupon: async (data) => {
    try {
      const coupon = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .findOne({ coupon: data.coupon.toLowerCase() });

      if (coupon) {
        throw new Error('Coupon already exists');
      } else {
        const startDateIso = new Date(data.starting);
        const endDateIso = new Date(data.expiry);
        const expiry = moment(data.expiry).format('YYYY-MM-DD');
        const starting = moment(data.starting).format('YYYY-MM-DD');
        const couponObj = {
          coupon: data.coupon.toLowerCase(),
          offer: parseInt(data.offer),
          minPurchase: parseInt(data.minPurchase),
          maxDiscountValue: parseInt(data.maxDiscountValue),
          starting: starting,
          expiry: expiry,
          startDateIso: startDateIso,
          endDateIso: endDateIso,
          isAvailable: true,
          users: [],
        };

        await db
          .get()
          .collection(collection.COUPON_COLLECTION)
          .insertOne(couponObj);

        return;
      }
    } catch (error) {
      throw error;
    }
  },

  editCoupon: async (data) => {
    try {
      const startDateIso = new Date(data.starting);
      const endDateIso = new Date(data.expiry);

      await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .updateOne(
          { _id: ObjectId(data.id) },
          {
            $set: {
              coupon: data.coupon,
              starting: data.starting,
              expiry: data.expiry,
              offer: data.offer,
              startDateIso: startDateIso,
              endDateIso: endDateIso,
            },
          }
        );

      return;
    } catch (error) {
      throw error;
    }
  },

  deleteCoupon: async (couponId) => {
    try {
      await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .deleteOne({ _id: ObjectId(couponId) });

      return;
    } catch (error) {
      throw error;
    }
  },

  getCoupon: async (couponId) => {
    try {
      const coupon = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .findOne({ _id: ObjectId(couponId) });

      return coupon;
    } catch (error) {
      throw error;
    }
  },

  validateCoupon: async (data, userID, totalAmount) => {
    try {
      const obj = {};
      const date = new Date();
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const coupon = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .findOne({ coupon: data.coupon, Available: true });

      if (coupon) {
        const users = coupon.users;
        const userCheck = users.includes(userID);

        if (userCheck) {
          obj.couponUsed = true;
        } else {
          let discountValue;
          const total = parseInt(totalAmount);

          if (formattedDate <= coupon.expiry) {
            if (total >= coupon?.minPurchase) {
              const percentage = parseInt(coupon.offer);
              discountValue = ((total * percentage) / 100).toFixed();

              if (discountValue > coupon?.maxDiscountValue) {
                discountValue = coupon?.maxDiscountValue;
              }
            }

            obj.CouponName = coupon.coupon;
            obj.total = parseInt(total - discountValue);
            obj.success = true;
            obj.discountValue = discountValue;
          } else if (formattedDate > coupon.expiry) {
            obj.couponExpired = true;
          }
        }
      } else {
        obj.invalidCoupon = true;
      }

      return obj;
    } catch (error) {
      throw error;
    }
  },

  startCouponOffer: async (date) => {
    try {
      const couponStartDate = new Date(date);
      const data = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .find({ startDateIso: { $lte: couponStartDate } })
        .toArray();

      if (data) {
        data.forEach(async (coupon) => {
          await db
            .get()
            .collection(collection.COUPON_COLLECTION)
            .updateOne(
              { _id: ObjectId(coupon._id) },
              {
                $set: {
                  Available: true,
                },
              }
            );
        });
      }

      return;
    } catch (error) {
      throw error;
    }
  },

  upDateCoupon: async (data, userID) => {
    try {
      await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .updateOne(
          { coupon: data.coupon, Available: true },
          { $push: { users: { $each: [userID] } } }
        );
    } catch (error) {
      throw error;
    }
  },

  couponOrderUpdate: async (orderID, CouponName, discountValue, couponTotal) => {
    try {
      const collection = db.get().collection('order');
      await collection.updateOne(
        { _id: ObjectId(orderID) },
        {
          $set: {
            CouponName: CouponName,
            discountValue: discountValue,
            couponTotal: couponTotal,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
};
