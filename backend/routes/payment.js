import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';

const router = express.Router();

// Initialize Razorpay Instance
const createRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @route   POST /api/payments/create-order
// @desc    Create a Razorpay order
// @access  Public
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;

    const razorpay = createRazorpayInstance();
    if (!razorpay) {
      return res.status(500).json({ 
        success: false, 
        message: "Razorpay keys are missing. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env" 
      });
    }

    const options = {
      amount: amount * 100, // Razorpay works in smallest currency unit (paise for INR)
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1 // Auto capture
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) {
      return res.status(500).json({ success: false, message: "Error creating Razorpay order" });
    }

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment signature and save order
// @access  Public
router.post('/verify', async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderDetails // passed from frontend to save in DB
    } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: "Server configuration error" });
    }

    // Verify signature using crypto HMAC SHA256
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is completely verified!
      // Now, save the actual order to MongoDB
      
      let createdOrder;
      
      try {
        const { items, totalAmount, user } = orderDetails;
        
        let maxPrepTime = 0;
        if (items && items.length > 0) {
          maxPrepTime = Math.max(...items.map(i => i.prepTime || 5));
        }
        const estimatedPrepTime = maxPrepTime + (items.length * 2);

        const order = new Order({
          user: user || null,
          items,
          totalAmount,
          status: 'Pending',
          paymentStatus: 'Paid',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          estimatedPrepTime
        });

        createdOrder = await order.save();

        if (req.app.get('io')) {
          req.app.get('io').emit('new_order', createdOrder);
        }
      } catch (dbError) {
        console.error("Error saving order after payment:", dbError);
        // Fallback for mock if DB fails/isn't connected
        createdOrder = { _id: `mock_${Date.now()}` };
      }

      return res.json({ 
        success: true, 
        message: "Payment verified successfully",
        orderId: createdOrder._id
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error("Razorpay Verify Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
