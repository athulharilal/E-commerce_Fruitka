const db = require('../config/connection');
const collection = require('../config/collection');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
  getAllBanners: async () => {
    try {
      const allBanners = await db.get().collection(collection.BANNER_COLLECTION).find().toArray();
      return allBanners;
    } catch (error) {
      return 0;
    }
  },

  addBanner: async (data) => {
    try {
      const banner = await db.get().collection(collection.BANNER_COLLECTION).findOne({ name: data.name });
      if (banner) {
        throw new Error('Banner already exists');
      } else {
        const response = await db.get().collection(collection.BANNER_COLLECTION).insertOne(data);
        return response;
      }
    } catch (error) {
      throw error;
    }
  },

  getBannerDetails: async (id) => {
    try {
      const bannerDetails = await db.get().collection(collection.BANNER_COLLECTION).findOne({ _id: ObjectId(id) });
      return bannerDetails;
    } catch (error) {
      throw error;
    }
  },

  editBanner: async (data) => {
    try {
      await db.get().collection(collection.BANNER_COLLECTION).updateOne(
        { _id: ObjectId(data._id) },
        {
          $set: {
            name: data.name,
            subname: data.subname,
            offer: data.offer,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },

  deleteBanner: async (id) => {
    try {
      await db.get().collection(collection.BANNER_COLLECTION).deleteOne({ _id: ObjectId(id) });
    } catch (error) {
      throw error;
    }
  },
};
