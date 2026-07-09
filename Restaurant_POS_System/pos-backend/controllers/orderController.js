const createHttpError = require("http-errors");
const { prisma } = require("../config/database");

const addOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.create({
      data: {
        customerDetails: req.body.customerDetails,
        orderStatus: req.body.orderStatus,
        bills: req.body.bills,
        items: req.body.items,
        tableId: req.body.tableId,
        paymentMethod: req.body.paymentMethod,
        paymentData: req.body.paymentData
      },
      include: { table: true }
    });
    res
      .status(201)
      .json({ success: true, message: "Order created!", data: order });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { table: true }
    });

    if (!order) {
      const error = createHttpError(404, "Order not found!");
      return next(error);
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: { table: true }
    });
    res.status(200).json({ data: orders });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const { id } = req.params;

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { orderStatus },
      include: { table: true }
    });

    if (!order) {
      const error = createHttpError(404, "Order not found!");
      return next(error);
    }

    res
      .status(200)
      .json({ success: true, message: "Order updated", data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { addOrder, getOrderById, getOrders, updateOrder };
