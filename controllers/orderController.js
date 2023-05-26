
let userHelpers= require('../helpers/user-helpers')
let orderHelpers= require('../helpers/order-Helpers')
let cartHelpers = require('../helpers/cart-helpers')


module.exports={
    getOrders:async(req,res)=>{
        try {
            let user = req.session.user
            let userDetails = await userHelpers.getOneUserDetails(user._id)
            let orderData = await orderHelpers.getUserOrders(user._id)            
            res.render('user/orders',{user:true,orderData,userDetails,user})
            
        } catch (error) {
            res.render('user/404',{user:true})
        }
    },
    getReturnOrder:(req,res)=>{
            
            
            orderHelpers.returnOrder(req.params.id).then(()=>{
                res.redirect('/orders')
            }).catch((error)=>{
                res.render('user/404',{user:true})

            })
            
        
    },
    getCancelOrder:async(req,res)=>{
        
            
            
            let products = await orderHelpers.getNeedtoCancelPrds(req.params.id)
            
            orderHelpers.cancelOrders(req.params.id,products).then(()=>{
                
              res.redirect('/orders')
            }).catch((error)=>{
                res.render('user/404',{user:true})

            })
            
        
    },
    
}