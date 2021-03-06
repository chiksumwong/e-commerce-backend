const Order = require('./../models/order.model');
const userController = require('./user.controller');

module.exports = {
    addOrder,
    updateOrder,
    getOrderByUserId,
    getOrderBySellerId
};

async function addOrder(req, res, next) {
    const order = new Order(req.body);

    await order.save((err, order) => {
        if (err) return res.status(500).json({error_message:err});

        // Find seller and buyer by id then update order list
        let products = order.products
        products.forEach(product => {
            userController.updateOrderListByUserId(product.seller, order.buyer, order);
        });

        return res.status(200).json(order);
    });
}

// update states of products in order
async function updateOrder(req, res, next) {
    let order_states = req.body.order_states
    await Order.findOneAndUpdate({'products._id':req.params.product_id}, {$set:{'products.$.order_states': order_states}}, (err, order) => {
        if (err) return res.status(500).json({error_message:err});
        return res.status(200).json(order);
    });
}

// for buyer to get the order of product which buyer bought
async function getOrderByUserId(req, res, next){
    await Order.find({buyer:req.params.user_id},(err, order) => {
        if (err) return res.status(500).json({error_message:err});
        return res.status(200).json(order);
    });
}

// for seller to get the order of product which someone bought
async function getOrderBySellerId(req, res, next){
    await Order.find({},(err, order) => {
        if (err) return res.status(500).json({error_message:err});

        let productsOrders = [];
        order.forEach(e => {
            let obj = {};
            obj.order_id = e._id;
            obj.addressee = e.addressee;
            obj.address = e.address;
            obj.phone_number = e.phone_number;
            obj.products = []

            let products = e.products;
            products.forEach(product => {
                let seller = product.seller
                if(seller == req.params.seller_id){

                    let product_obj = {}
                    product_obj._id = product._id;
                    product_obj.product_id = product.product_id;
                    product_obj.product_name = product.product_name;
                    product_obj.quantity = product.quantity;
                    product_obj.order_states = product.order_states
                    obj.products.push(product_obj);
                }
            });
            productsOrders.push(obj);
        });
        return res.status(200).json(productsOrders);
    });
}