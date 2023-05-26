// here the functions for login, signups, product adding are written
let db = require("../config/connection");
let collection = require("../config/collection");
const {
  response
} = require("../app");
const {
  Collection
} = require("mongodb");
let objectId = require("mongodb").ObjectId;

module.exports = {

  addProduct: async (product) => {
    return new Promise(async (resolve, reject) => {

      await db.get().collection("product").insertOne(product).then(() => {
        resolve()
      });
    }).catch((error) => {

    })
  },
  getAllProducts: async () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray(); //calling from ../config/collections
      // await - wait till data is fetched from database
      resolve(products); //retuning
    }).catch((error) => {

    })

  },
  deleteProduct: async (proId) => {
    return new Promise((resolve, reject) => {

      console.log(objectId(proId));
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({
          _id: objectId(proId)
        })
        .then((response) => {
          resolve(response);
        });
    }).catch((error) => {

    })


  },
  deleteProductImage: (proId, newValues) => {
    return new Promise(async (resolve, reject) => {

      let index = newValues.delete
      const updateQuery = {};
      updateQuery[`images.${index}`] = 1

      await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({
        _id: objectId(proId)
      }, {
        $unset: updateQuery
      }).then(() => {

        resolve()
      })

    });
  },
  getOneProduct: async (proId) => {
    return new Promise(async (resolve, reject) => {

      console.log(objectId(proId));
      await db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({
          _id: objectId(proId)
        })
        .then((response) => {
          resolve(response);
        });
    }).catch((error) => {

    })
  },
  updateProductImage: async (proId, newValues) => {
    return new Promise(async (resolve, reject) => {

      let index = newValues.index
      const updateQuery = {};
      updateQuery[`images.${index}`] = newValues.images;

      await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({
        _id: objectId(proId)
      }, {
        $set: updateQuery
      }).then(() => {

        resolve()
      }).catch((error) => {

      })

    });
  },
  updateproduct: async (proId, productDetails) => {
    return new Promise(async (resolve, reject) => {
      productDetails.Quantity = parseInt(productDetails.Quantity)

      await db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne({
            _id: objectId(proId)
          }, {
            $set: {
              Name: productDetails.Name,
              Price: productDetails.Price,
              Description: productDetails.Description,
              category: productDetails.category,
              Offerprice: productDetails.Offerprice,
              Quantity: productDetails.Quantity

            },

          }

        )
        .then(() => {

          resolve();
        }).catch((error) => {

        })
    }).catch((error) => {

    })

  },
  search: async (query) => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find({
            $or: [
              { Name: { $regex: query, $options: 'i' } }, // Match product name
              { category: { $regex: query, $options: 'i' } }, // Match product category
              // Add more fields to search here, if necessary
            ],
          })
          .toArray();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  },
  sortProducts: (value) => {

    return new Promise(async (resolve, reject) => {
      if (value === "price-low-to-high") {
        await db.get().collection(collection.PRODUCT_COLLECTION).find()
          .sort({
            Price: 1
          })
          .toArray()
          .then((response) => {
            //
            resolve(response)
          }).catch((error) => {

          })
      } else if (value === "price-high-to-low") {
        await db.get().collection(collection.PRODUCT_COLLECTION).find()
          .sort({
            Price: -1
          })
          .toArray()
          .then((response) => {
            //
            resolve(response)
          }).catch((error) => {

          })
      } else if (value === "Names (A-Z) ") {
        await db.get().collection(collection.PRODUCT_COLLECTION).find()
          .sort({
            Name: 1
          }) // or sort({name:-1}) for descending order
          .toArray()
          .then((response) => {
            //
            resolve(response)
          }).catch((error) => {

          })
      } else {
        await db.get().collection(collection.PRODUCT_COLLECTION).find()
          .sort({
            Name: -1
          }) // or sort({name:-1}) for descending order
          .toArray()
          .then((response) => {
            //
            resolve(response)
          }).catch((error) => {

          })
      }
    });
  },
  filterProducts: async (query) => {
    return new Promise(async (resolve, reject) => {

      if (query === "Winter") {
        await db.get().collection(collection.PRODUCT_COLLECTION).find({
            category: {
              $regex: query,
              $options: 'i'
            }
          })
          .sort({
            Name: 1
          })
          .toArray()
          .then((response) => {
            //
            resolve(response)
          }).catch((error) => {

          })

      } else if (query === "Summer") {
        await db.get().collection(collection.PRODUCT_COLLECTION).find({
            category: {
              $regex: query,
              $options: 'i'
            }
          })
          .sort({
            Name: 1
          })
          .toArray()
          .then((response) => {
            //
            resolve(response)
          }).catch((error) => {

          })

      } else if (query === "Monsoon") {
        await db.get().collection(collection.PRODUCT_COLLECTION).find({
            category: {
              $regex: query,
              $options: 'i'
            }
          })
          .sort({
            Name: 1
          })
          .toArray()
          .then((response) => {
            //
            resolve(response)
          }).catch((error) => {

          })

      } else if (query === "Spring") {
        await db.get().collection(collection.PRODUCT_COLLECTION).find({
            category: {
              $regex: query,
              $options: 'i'
            }
          })
          .sort({
            Name: 1
          })
          .toArray()
          .then((response) => {
            //
            resolve(response)
          }).catch((error) => {

          })
      } else if(query === "All"){
        db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find()
          .toArray() //calling from ../config/collections
        .then((response) => {
          resolve(response)
        }).catch((error) => {
        })
      }
    });
  },
  paginateData: async (data, pageNumber, perPage) => {
    return new Promise((resolve, reject) => {
        const startIndex = (pageNumber - 1) * perPage;
        const endIndex = pageNumber * perPage;
        const result = {};

        if (startIndex >= data.length) {
          reject(new Error('Page number out of range'));
        } else {
          result.data = data.slice(startIndex, endIndex);
          result.totalCount = data.length;
          resolve(result);
        }
      })
      .catch((error) => {
        console.log(error);
        throw error; // Rethrow the error for proper error handling in the caller function
      });
  }
};