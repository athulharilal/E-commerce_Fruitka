let db = require('../config/connection')
let collection = require('../config/collection');
let ObjectId = require('mongodb').ObjectId
let moment = require('moment');
const { COUPON_COLLECTION } = require('../config/collection');
const { response } = require('../app');

module.exports={
    getAllCoupons:async()=>{
            return new Promise(async(resolve, reject) => {
                let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
                resolve(coupon)
            }).catch((error)=>{
                
            })
    },
    addCoupon:async (data)=> {       
        try {
            return new Promise(async (resolve, reject) => {
              let coupon = await db
                .get()
                .collection(collection.COUPON_COLLECTION)
                .findOne({ coupon: data.coupon.toLowerCase() }); // Convert coupon to lowercase for case-insensitive comparison
              if (coupon) {
                // Coupon already exists
                reject("Coupon already exists");
              } else {
                let startDateIso = new Date(data.starting);
                let endDateIso = new Date(data.expiry);
                let expiry = moment(data.expiry).format("YYYY-MM-DD");
                let starting = moment(data.starting).format("YYYY-MM-DD");
                let couponObj = {
                  coupon: data.coupon.toLowerCase(), // Convert coupon to lowercase before saving
                  offer: parseInt(data.offer),
                  minPurchase: parseInt(data.minPurchase),
                  maxDiscountValue: parseInt(data.maxDiscountValue),
                  starting: starting,
                  expiry: expiry,
                  startDateIso: startDateIso,
                  endDateIso: endDateIso,
                  users: [],
                };
                db.get()
                  .collection(collection.COUPON_COLLECTION)
                  .insertOne(couponObj)
                  .then(() => {
                    resolve();
                  })
                  .catch(() => {
                    reject();
                  });
              }
            });
          } catch (error) {}
       
    },
    editCoupon:(data)=>{     
            return new Promise(async(resolve, reject) => {
            
                    let startDateIso = new Date(data.starting)
                    let endDateIso = new Date(data.expiry)
                    db.get().collection(collection.COUPON_COLLECTION).updateOne({_id:ObjectId(data.id)},{
                        $set:{
                            coupon:data.coupon,
                            starting:data.starting,
                            expiry:data.expiry,
                            offer:data.offer,
                            startDateIso:startDateIso,
                            endDateIso:endDateIso,
                        }
                    }).then(()=>{
                        resolve()
                    }).catch((error)=>{
                        
                    })
            });
    },
    deleteCoupon:(couponId)=>{
        
            return new Promise(async(resolve, reject) => {
                db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:ObjectId(couponId)}).then(()=>{
                    resolve()
                }).catch((error)=>{
                    
                })
            });
            
       
    },
    getCoupon:(couponId)=>{  
            
            return new Promise(async(resolve, reject) => {
                db.get().collection(collection.COUPON_COLLECTION).findOne({_id:ObjectId(couponId)}).then((response)=>{
                    resolve(response)
                }).catch((error)=>{
                    
                })
            });
       
    },
    validateCoupon:async(data,userID,totalAmount)=>{
            return new Promise(async(resolve, reject) => {
                    
                    obj={}
                    let date = new Date()
                    date = moment(date).format('YYYY-MM-DD')
                    let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({coupon:data.coupon,Available:true})
                    
                    if (coupon) {
                        let users = coupon.users
                        let userCheck = users.includes(userID)
                        
                        if (userCheck) {
                            
                            obj.couponUsed = true
                            resolve(obj)
                        }else{   
                            let discountValue,total 
                            total =parseInt(totalAmount)    
                                        
                            if (date <= coupon.expiry) {
                                if (total >= coupon?.minPurchase) {
                                    
                                    let percentage = parseInt(coupon.offer)
                                    discountValue = ((total*percentage)/100).toFixed()
                                    
        
                                    if (discountValue > coupon?.maxDiscountValue ) {
                                        discountValue = coupon?.maxDiscountValue
                                        
                                    }
                                }
                                obj.CouponName = coupon.coupon
                                obj.total = parseInt(total-discountValue)
                                obj.success = true
                                obj.discountValue=discountValue
                                
                                
                                resolve(obj)
                            }else if(date > coupon.expiry){
                                
                                obj.couponExpired = true
                                resolve(obj)
                            }
                        }
                    }else{
                        
                        obj.invalidCoupon=true
                        resolve(obj)
                    }
            }).catch((error)=>{
                
            })
            
    
    },
    startCouponOffer:async(date)=>{
        
            let couponStartDate = new Date(date)
            
            return new Promise(async(resolve, reject) => {
                    let data = await db.get().collection(collection.COUPON_COLLECTION).find({startDateIso:{$lte:couponStartDate}}).toArray()
                    if (data) {
                        
                        
                        await data.map(async(data)=>{
                           await db.get().collection(collection.COUPON_COLLECTION).updateOne({_id:ObjectId(data._id)},
                            {
                                $set:{
                                    Available:true
                                }
                            }).then((response)=>{
                                resolve(response)
                            }).catch((error)=>{
                                
                            })
                        })
                    }else{
                        
                        resolve(0)
                    }
                
            }).catch((error)=>{
                
            })

    },
    upDateCoupon:async(data,userID,coupon)=>{    
            return new Promise(async(resolve, reject) => {
                
                db.get().collection(collection.COUPON_COLLECTION).updateOne({coupon:data.coupon,Available:true},
                {
                     $push: { users: { $each: [userID] } }
                }
                )
            }).catch((error)=>{
                
            })
            
        
    },
    couponOrderUpdate: async (orderID, CouponName, discountValue,couponTotal) => {
        return new Promise(async (resolve, reject) => {
          try {
            const collection = db.get().collection('order'); // Assuming the collection name is 'order'
            const result = await collection.updateOne(
              { _id: ObjectId(orderID) },
              {
                $set: {
                  CouponName: CouponName,
                  discountValue: discountValue,
                  couponTotal:couponTotal
                }
              }
            );
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      }
      
}
