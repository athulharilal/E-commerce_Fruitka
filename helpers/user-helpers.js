const bcrypt = require("bcrypt");
const { USER_COLLECTION } = require("../config/collection");
const { response } = require("../app");
const { ObjectID } = require("bson");
const moment = require('moment')
const Razorpay = require('razorpay')
const referralCodeGenerator = require('referral-code-generator')
let db = require("../config/connection");
let collection = require("../config/collection");
let ObjectId = require("mongodb").ObjectId;
const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid');
const { assert } = require("console");
var instance = new Razorpay({
  key_id: 'rzp_test_AF9BQ131vX5VfH',
  key_secret: 'P7Je61iOLRMcWxUajiJcwhL4',
});

module.exports = {
  //creating new user
  doSignup: (userData) => {
      return new Promise(async (resolve, reject) => {
        
        let response = {}
        let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
        let user1 = await db.get().collection(collection.USER_COLLECTION).findOne({ Number: userData.Number })
        if (user || user1) {
            resolve(response.status = false)
        }else{
          let referUser = userData.referalCode
          if (referUser) 
            {
              let referUser = await db.get().collection(collection.USER_COLLECTION).findOne({ referalCode: userData.referalCode })
              
              
              if (referUser) {
                  
                  userData.Password = await bcrypt.hash(userData.Password, 10)
                  let referalCode = userData.Name.slice(0, 3) + referralCodeGenerator.alpha('lowercase', 6)
                  userData.referalCode = referalCode
                  userData.wallet = parseInt(50)
                  db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(() => {
                      let walletAmount = parseInt(referUser.wallet)
                      
                      
                      if (referUser.wallet){
                          
    
                          db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(referUser._id) },
                              {
                                  $set: {
                                      wallet: parseInt(100) + walletAmount
                                  }
                              }).then(() => {
                                  
                                  resolve({ status: true })
                              }).catch(()=>{
                                res.render('user/404',{user:true})

                              })
                      } else {
                          db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(referUser._id) },
                              {
                                  $set: {
                                      wallet: parseInt(100)
                                  }
                              }).then(() => {
                                  
                                  resolve({ status: true })
                              }).catch(()=>{
                                res.render('user/404',{user:true})

                              })
                      }
                  }).catch(()=>{
                    res.render('user/404',{user:true})

                  })
              } else {
                reject()          
              }
    
          }
          else {
     
              userData.Password = await bcrypt.hash(userData.Password, 10)
              userData.wallet = parseInt(0)
              let referalCode = userData.Name.slice(0, 3) + referralCodeGenerator.alpha('lowercase', 6)
              userData.referalCode = referalCode
              userData.isBlocked = false; // Set the isBlocked field to true
              db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((response) => {
                  resolve(response)
              }).catch(()=>{
                res.render('user/404',{user:true})
              })
          }
          
        }
    
        
    })
      

  },
  // already existing user
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
        userData.Password = await bcrypt.hash(userData.Password, 10);
        db.get()
          .collection(collections.USER_COLLECTION)
          .insertOne(userData)
          .then((data) => {
            
            resolve(data.insertedId);
          }).catch(()=>{
            res.render('user/404',{user:true})
          })
      });
  },
  getAllUsers:async () => {
      return new Promise(async (resolve, reject) => {
        let product = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .find()
          .toArray(); //product is just a variable
        resolve(product); // returning the data i.e product
      }).catch((error)=>{
        
      })
  },
  getOneUser: async(proId) => {
  
      return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.USER_COLLECTION)
          .findOne({ _id: ObjectId(proId) })
          .then((users) => {
            
            resolve(users);
          });
      }).catch(()=>{
        res.render('user/404',{user:true})

      })
      
    
  },
  getOneUserDetails: (userId) => {
      return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.USER_COLLECTION)
          .findOne({ _id: ObjectId(userId) })
          .then((users) => {
            
            resolve(users);
          }).catch((error)=>{
            res.render('user/404',{user:true})

          })
      });
  },
 
getUserData: (id) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collection.USER_COLLECTION).findOne({ _id:ObjectId(id) }).then((response) => {
            resolve(response)
        }).catch ((error)=>{

          res.render('user/404',{user:true})
        })
    })
    
  },
  changeProductQuantity:(details)=>{
    details.quantity = parseInt(details.quantity)
    details.count = parseInt(details.count)
        return new Promise((resolve, reject) => {
            try {
                if(details.count == -1 && details.quantity == 1){
                   db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(details.cart) },
                        {
                            $pull: { products: { item: ObjectId(details.product) } }
                        }).then((response) => {
                            resolve({ itemRemoved: true })
                        })
                }
                else{
                db.get().collection(collection.CART_COLLECTION)
                 .updateOne({ _id: ObjectId(details.cart), 'products.item': ObjectId(details.product) },
                {
                    $inc: { 'products.$.quantity': details.count }
                }).then((response) => {
                  
                    resolve({ status: true })
                })
                } 
            } catch (error) {
                resolve(0)
            }
           
            
        });
  },
  
        generateRazorpay:async(orderId,total)=>{
            
            return new Promise((resolve, reject) => {
              var options = {
                amount: total *100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: ""+orderId  
              };
              instance.orders.create(options, function(err, order) {
                if (err) {
                  
                
                }else{
                
                resolve(order)
                }
              });
            }).catch(()=>{
              res.render('user/404',{user:true})
            })
            
        },
        verifyPayment:async(details)=>{
            return new Promise((resolve, reject) => {
              let hmac = crypto.createHmac('sha256', 'P7Je61iOLRMcWxUajiJcwhL4')
               
              hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
              hmac = hmac.digest('hex')
              
              if (hmac === details['payment[razorpay_signature]']) {
                
                resolve()
              }else{
                reject()
              }
            }).catch(()=>{
              res.render('user/404',{user:true})

            })
        },
        changePaymentStatus:(orderID)=>{
            return new Promise((resolve, reject) => {
              
               db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderID)},
               {
                  $set:{
                    status:'placed'
                  }
               }).then(()=>{
                
                resolve()
               }).catch((error)=>{
                res.render('user/404',{user:true})
               })      
            });
        },
        
        editMyprofile:(userDetails,userId)=>{
          
            return new Promise((resolve, reject) => {
              db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},
              {
                $set:{
                  Name:userDetails.Name,
                  Email:userDetails.Email,
                  Number:userDetails.Number,
                }
              }).then((response)=>{
                
                resolve()
              }).catch(()=>{
                res.render('user/404',{user:true})

              })
            });
            
          
          // 
        },
        addAddress:(newAddrress,userId)=>{
          const addressId = uuidv4(); // Generate a unique address id using uuid
          //Add the addressId to the newAddress object
          newAddrress._id = addressId;
          
          return new Promise(async(resolve, reject) => {
            
           await db.get().collection(collection.USER_COLLECTION).updateOne(
              { _id: ObjectId(userId) },
              {
                $addToSet: {
                  address: newAddrress
                }
              }
            ).then(() => {
              resolve();
            }).catch((error) => {
              reject(error);
            });
          });
            
  
        },
        deleteAddress: (addressId, userId) => {
          return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne(
              { _id: ObjectId(userId) },
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
        editAddress:(data,userId)=>{    
            if (data.id !='' && data.name !='' &&data.address!='' && data.town !='' && data.district !='' && data.state !='' && data.pincode !='' &&data.phone !='') {
              let uniqueId =data.id
              return new Promise(async(resolve, reject) => {
                db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId),'address.id':uniqueId},
                {
                  $set:{
                    'address.$':data
                  }
                }).then(()=>{
                  resolve()
                }).catch(()=>{
                  res.render('user/404',{user:true})
                })
              })
          }
          
        },
        getUserAddrress:(userID,res)=>{    
            return new Promise(async(resolve, reject) => {
              let address = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match:{_id:ObjectId(userID)}
                },
                {
                   $unwind:'$address'
                },
                {
                   $project:{
                    name:'$address.name',
                    address:'$address.address',
                    town:'$address.town',
                    district:'$address.district',
                    state:'$address.state',
                    pincode:'$address.pincode',
                    phone:'$address.phone',
                   }
                },
  
              ]).toArray()
                resolve(address)    
                   
              }).catch(()=>{
                res.render('user/404',{user:true})
              })
        },
        
       
        getUserOrderProducts: async (orderId) => {
          return new Promise(async (resolve, reject) => {
            
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
                  CouponName: 1,  // Add CouponName field
                  couponTotal: 1, // Add couponTotal field
                  discountValue: 1 // Add discountValue field
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
                  CouponName: 1,  // Add CouponName field
                  couponTotal: 1, // Add couponTotal field
                  discountValue: 1 // Add discountValue field
                }
              }
            ]).toArray();
        
            resolve(orderItems);
            
          }).catch((error) => {
            res.render("user/404", { user: true });
          });
        },
        
        
        
        changePassword:async(userId,data)=>{
            
            return new Promise(async(resolve, reject) => {
              data.newPassword = await bcrypt.hash(data.newPassword,10)
              let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)})
              
              if (user) {
                bcrypt.compare(data.newPassword,user.Password).then((response)=>{
                  if (response) {
                    
                    db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) },
                              {
                                  $set: {
                                      Password: data.newPassword
                                  }
                              }).then(() => {
                                  resolve({ status: false })
                              })
                  }else{
                    resolve({status:true})
                  }
                })
              }else{
                resolve({status:true})
              }
            }).catch((error)=>{
              res.render('user/404',{user:true})
            })
          
        },
        findWallet:async(userID)=>{          
            
            return new Promise((resolve, reject) => {
              db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userID)}).then((response)=>{
                resolve(response)
              })
            }).catch((error)=>{
              res.render('user/404',{user:true})
            })         
        },
        findWalletAmount:(userID)=>{     
            return new Promise(async(resolve, reject) => {
              await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userID)}).then((response)=>{
                resolve(response)
              }).catch((error)=>{
                res.render('user/404',{user:true})
              })
            });
        },
        findRefundAmunt:(userID)=>{
          
            return new Promise(async(resolve, reject) => {
              await db.get().collection(collection.ORDER_COLLECTION).findOne({userId:ObjectId(userID)},{totalAmount:1}).then((response)=>{
                resolve(response.totalAmount)
              }).catch((error)=>{

                res.render('user/404',{user:true})
              })
            });
        },
        toWallet:(userID,orderID,amount)=>{
          
            return new Promise(async(resolve, reject) => {
              db.get().collection(collections.USER_COLLECTION).updateOne({_id:ObjectId(userID)},{$set:{wallet:parseInt(amount)}}).then(()=>{
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderID)},
                resolve()
                )
              }).catch(()=>{
                res.render('user/404',{user:true})

              })
            });
        },
        setWallet:(amount,orderID,userID)=>{
            return new Promise(async(resolve, reject) => {
              db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userID)},
              {
                $set:{
                  wallet:parseInt(amount)
                }
              }
              ).then(()=>{
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderID)},
                {
                  $set:{
                    status:"Refund has Been Initiated"
                  }
                }
                )
              }).then(()=>{
                resolve()
              }).catch((error)=>{
                res.render('user/404',{user:true})

              })
            });
            
        
        },

      reduceWallet:async(user,amount,walletAmount)=>{
          let userId = user._id
          
          return new Promise(async(resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},
            {
              $set:{
                wallet:(walletAmount-amount)
              }
            }
            )
             resolve()
          }).catch((error)=>{
            
          })
          
        

      },
      getUserInvoice:(orderId)=>{    
          return new Promise(async(resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({_id:ObjectId(orderId)},
            
            {
              sort:{
                date:-1
              }
            }).toArray()
      
            for (let index = 0; index < orders.length; index++) {
              orders[index].date = moment(orders[index].date).format('DD-MM-YYYY')     
            }
            for (let index = 0; index < orders.length; index++) {
              orders[index].deliveredDate = moment(orders[index].deliveredDate).format('DD-MM-YYYY')            
            }
            resolve(orders)
          }).catch((error)=>{
            res.render('user/404',{user:true})

          })
      },
      findProCount:async(userId,proId)=>{        
          return new Promise(async(resolve, reject) => {
              let count = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                  $match:{
                    user:ObjectId(userId)
                  }
                },
                {
                  $project:{
                    _id:0,
                    products:'$products'
                  }
                },
                {
                  $unwind:'$products'
                },
                {
                  $match:{
                    'products.item':ObjectId(proId)
                  }
                },
                {
                  $project:{
                    quantity:'$products.quantity'
                  }
                }
              ]).toArray()
              if (count > 0)  {
                
                resolve(count[0].quantity)
              }else{
                resolve(0)
              }
          }).catch((error)=>{
            res.render('user/404',{user:true})

          })
      },
      findStock:async(proId)=>{
      
          return new Promise(async(resolve, reject) => {
            let count = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(proId)})
            resolve(count.Quantity)
          }).catch((error)=>{
            
          })  
        
      },
      deleteCartItem: (proId, cartId) => {
        return new Promise(async(resolve, reject) => {
          await  db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(cartId), 'products.item': ObjectId(proId) },
                {
                    $pull: { products: { item: ObjectId(proId) } }
                }).then((response) => {
                    resolve()
                })
        })
        },
    
      
};
