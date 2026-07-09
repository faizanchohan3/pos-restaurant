const { prisma } = require("../config/database");
const createHttpError = require("http-errors");

const addTable = async (req, res, next) => {
  try {
    const { tableNo, seats } = req.body;
    if (!tableNo) {
      const error = createHttpError(400, "Please provide table No!");
      return next(error);
    }
    const isTablePresent = await prisma.table.findUnique({
      where: { tableNo }
    });

    if (isTablePresent) {
      const error = createHttpError(400, "Table already exist!");
      return next(error);
    }

    const newTable = await prisma.table.create({
      data: { tableNo, seats }
    });
    res
      .status(201)
      .json({ success: true, message: "Table added!", data: newTable });
  } catch (error) {
    next(error);
  }
};

const getTables = async (req, res, next) => {
  try {
    const tables = await prisma.table.findMany({
      include: {
        orders: {
          select: { customerDetails: true }
        }
      }
    });
    res.status(200).json({ success: true, data: tables });
  } catch (error) {
    next(error);
  }
};

const updateTable = async (req, res, next) => {
  try {
    const { status, orderId } = req.body;
    const { id } = req.params;

    const table = await prisma.table.update({
      where: { id: parseInt(id) },
      data: { status, currentOrder: orderId }
    });

    if (!table) {
      const error = createHttpError(404, "Table not found!");
      return error;
    }

    res.status(200).json({success: true, message: "Table updated!", data: table});

  } catch (error) {
    next(error);
  }
};

module.exports = { addTable, getTables, updateTable };
