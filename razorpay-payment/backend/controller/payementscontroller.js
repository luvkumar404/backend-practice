const { createRazorpayInstance } = require("../config/razorpay.config");
require('dotenv').config();
const crypto = require('crypto')

exports.createOrder = async(req,res) => {

    const razorpayInstance = createRazorpayInstance();
    
    //Don't accept amount from client
    const {courseId, amount} = req.body;

    //course id se fetch krenge course ka data including its price

    //create an order
    const options = {
        amount: amount*100,
        currency: "INR",
        receipt: `receipt_order_1`,
    };

    try {
        razorpayInstance.orders.create(options, (err, order) => {
            if(err) {
                return req.status(500).json({
                    success: false,
                    message: "Something went wrong",
                })
            }
        })

    } catch(err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        })
    }
}

exports.verifyPayment = async(req, res) => {
    const {order_id, payment_id, signature} = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    //create hmac object
    const hmac = crypto.createHmac('sha256', secret);

    hmac.update(order_id+ " | "+payment_id);
    const generateSignature = hmac.digest("hex");

    if(generateSignature === signature) {
        return res.status(200).json({
            success: true,
            message: "Payment verified",
        });
    } else {
        return res.status(400).json({
            success: false,
            message: "Payment not verified",
        })
    }
}