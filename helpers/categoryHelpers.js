const db = require("../config/connection");
const collection = require("../config/collection");
const ObjectId = require("mongodb").ObjectId;

module.exports = {
  addCategory: async (catData) => {
    try {
      catData.category = catData.category.toUpperCase();
      const category = await db
        .get()
        .collection(collection.CAT_COLLECTION)
        .findOne({ category: catData.category });

      if (category) {
        throw new Error("Category already exists");
      } else {
        const response = await db
          .get()
          .collection(collection.CAT_COLLECTION)
          .insertOne({ category: catData.category });
        return response;
      }
    } catch (error) {
      throw error;
    }
  },

  getAllCategoriesForChart: async () => {
    try {
      const categories = await db
        .get()
        .collection(collection.CAT_COLLECTION)
        .find()
        .toArray();
      return categories;
    } catch (error) {
      throw error;
    }
  },

  getAllCategories: async () => {
    try {
      const categories = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      return categories;
    } catch (error) {
      throw error;
    }
  },

  viewCategory: async () => {
    try {
      const category = await db
        .get()
        .collection(collection.CAT_COLLECTION)
        .find()
        .toArray();
      return category;
    } catch (error) {
      throw error;
    }
  },

  getOneCategory: async (catId) => {
    try {
      const category = await db
        .get()
        .collection(collection.CAT_COLLECTION)
        .findOne({ _id: ObjectId(catId) });
      return category;
    } catch (error) {
      throw error;
    }
  },

  updateCategory: async (categoryDetails) => {
    try {
      await db
        .get()
        .collection(collection.CAT_COLLECTION)
        .updateOne(
          { _id: ObjectId(categoryDetails.id) },
          { $set: { category: categoryDetails.category } }
        );
      return;
    } catch (error) {
      throw error;
    }
  },

  deleteCategory: async (catId) => {
    try {
      const category = await db
        .get()
        .collection(collection.CAT_COLLECTION)
        .findOne({ _id: ObjectId(catId) });
      const productsCount = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .countDocuments({ category: category.category });
  
      if (productsCount > 0) {
        return null; // Return null instead of an error message
      }
  
      await db
        .get()
        .collection(collection.CAT_COLLECTION)
        .deleteOne({ _id: ObjectId(catId) });
      
      return true; // Return true to indicate successful deletion
    } catch (error) {
      throw error;
    }
  },
};
