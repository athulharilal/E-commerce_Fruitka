// here the functions for login, signups, product adding are written
let db = require("../config/connection");
const collection = require("../config/collection");
let ObjectId = require("mongodb").ObjectId;


module.exports = {
  addcategories: async (catData) => {
    
    return new Promise(async (resolve, reject) => {
      catData.category = catData.category.toUpperCase()
      let category = await db.get().collection(collection.CAT_COLLECTION).findOne({
        category: catData.category
      })
      
      if (category) {
        reject()
      } else {
        db.get().collection(collection.CAT_COLLECTION).insertOne({
          category: catData.category
        }).then((response) => {
          resolve(response)
        })
      }
    })

  },
  getAllCategoriesforchart: () => {
    return new Promise(async (resolve, reject) => {
      let categories = await db
        .get()
        .collection(collection.CAT_COLLECTION)
        .find()
        .toArray(); //calling from ../config/collection
      // await - wait till data is fetched from database
      resolve(categories); //retuning
    }).catch((error) => {
      
    })
  },
  getAllCategories: () => {
    return new Promise(async (resolve, reject) => {
      let categories = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray(); //calling from ../config/collection
      // await - wait till data is fetched from database
      resolve(categories); //retuning
    }).catch((error) => {
      
    })
  },
  viewCategory: () => {
    return new Promise(async (resolve, reject) => {
      let category = await db
        .get()
        .collection(collection.CAT_COLLECTION)
        .find()
        .toArray();
      resolve(category);
    }).catch(() => {
      
    })

  },
  getOneCategory: async(catId) => {


    return new Promise(async(resolve, reject) => {
      
      console.log(ObjectId(catId));
      await db.get()
        .collection(collection.CAT_COLLECTION)
        .findOne({
          _id: ObjectId(catId)
        })
        .then((response) => {
          resolve(response);
        });
    }).catch((error) => {
      
    })

  },
  updateCategory: (catgeoryDetails) => {
    return new Promise((resolve, reject) => {
      
      db.get()
        .collection(collection.CAT_COLLECTION)
        .updateOne({
          _id: ObjectId(catgeoryDetails.id)
        }, {
          $set: {
            category: catgeoryDetails.category,
          },
        })
        .then(() => {
          
          resolve();
        }).catch((error) => {
          
        })
    });

  },
  deleteCategory: (catId) => {
    return new Promise(async (resolve, reject) => {
      const category = await db.get().collection(collection.CAT_COLLECTION).findOne({_id:ObjectId(catId)})
      const productsCount = await db.get().collection(collection.PRODUCT_COLLECTION)
        .countDocuments({ category: category.category });
      if (productsCount > 0) {
        // There are products under this category
        return resolve({ message: "There are products under this category" });
      }
  
      await db.get().collection(collection.CAT_COLLECTION)
        .deleteOne({ _id: ObjectId(catId) })
        .then(() => {
          resolve({ message: "Category deleted successfully" });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  ,
};