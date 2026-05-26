import express from "express"

const {createOrder, verifyPayment} = require("../controller/payementscontroller");
const router = express.Router();

router.post("/createOrder", createOrder);
router.post("/verifyPayment", verifyPayment);

module.exports=router;