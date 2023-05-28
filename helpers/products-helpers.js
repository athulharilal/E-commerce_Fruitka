const db = require("../config/connection");
const collection = require("../config/collection");
const { ObjectId } = require("mongodb");

module.exports = {
  addProduct: async (product) => {
    try {
      await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product);
    } catch (error) {
      throw error;
    }
  },

  getAllProducts: async () => {
    try {
      const products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      return products;
    } catch (error) {
      throw error;
    }
  },

  deleteProduct: async (proId) => {
    try {
      await db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: ObjectId(proId) });
    } catch (error) {
      throw error;
    }
  },

  deleteProductImage: async (proId, newValues) => {
    try {
      const index = newValues.delete;
      const updateQuery = {};
      updateQuery[`images.${index}`] = 1;

      await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
        { _id: ObjectId(proId) },
        { $unset: updateQuery }
      );
    } catch (error) {
      throw error;
    }
  },

  getOneProduct: async (proId) => {
    try {
      const response = await db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: ObjectId(proId) });
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateProductImage: async (proId, newValues) => {
    try {
      const index = newValues.index;
      const updateQuery = {};
      updateQuery[`images.${index}`] = newValues.images;

      await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
        { _id: ObjectId(proId) },
        { $set: updateQuery }
      );
    } catch (error) {
      throw error;
    }
  },

  updateProduct: async (proId, productDetails) => {
    try {
      productDetails.Quantity = parseInt(productDetails.Quantity);

      await db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: ObjectId(proId) },
          {
            $set: {
              Name: productDetails.Name,
              Price: productDetails.Price,
              Description: productDetails.Description,
              category: productDetails.category,
              Offerprice: productDetails.Offerprice,
              Quantity: productDetails.Quantity
            }
          }
        );
    } catch (error) {
      throw error;
    }
  },

  search: async (query) => {
    try {
      const result = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({
          $or: [
            { Name: { $regex: query, $options: "i" } },
            { category: { $regex: query, $options: "i" } }
          ]
        })
        .toArray();
      return result;
    } catch (error) {
      throw error;
    }
  },

  sortProducts: async (value) => {
    try {
      let sortQuery = {};

      if (value === "price-low-to-high") {
        sortQuery = { Price: 1 };
      } else if (value === "price-high-to-low") {
        sortQuery = { Price: -1 };
      } else if (value === "Names (A-Z)") {
        sortQuery = { Name: 1 };
      } else {
        sortQuery = { Name: -1 };
      }

      const response = await db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .sort(sortQuery)
        .toArray();

      return response;
    } catch (error) {
      throw error;
    }
  },

  filterProducts: async (query) => {
    try {
      if (query === "Winter" || query === "Summer" || query === "Monsoon" || query === "Spring") {
        const response = await db.get()
          .collection(collection.PRODUCT_COLLECTION)
          .find({ category: { $regex: query, $options: "i" } })
          .sort({ Name: 1 })
          .toArray();

        return response;
      } else if (query === "All") {
        const response = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find()
          .toArray();

        return response;
      }
    } catch (error) {
      throw error;
    }
  },

  paginateData: async (data, pageNumber, perPage) => {
    try {
      const startIndex = (pageNumber - 1) * perPage;
      const endIndex = pageNumber * perPage;
      const result = {};

      if (startIndex >= data.length) {
        throw new Error("Page number out of range");
      }

      result.data = data.slice(startIndex, endIndex);
      result.totalCount = data.length;
      return result;
    } catch (error) {
      throw error;
    }
  },
  refundSuccess:(userID,orderID)=>{
    return new Promise((resolve, reject) => {
        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderID)},
        {
            $set: {
                refundStatus: 'Refunded'
            }
        }).then(() => {
            resolve()
        }).catch(()=>{
            res.render('user/404',{user:true})
        })
    })
  }
};

// Other helper functions
