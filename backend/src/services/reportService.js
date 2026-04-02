const reportRepo = require('../repositories/reportRepository')
/*
Dashboard summary
Used by POS home screen
*/
exports.getDashboard = async () => {
  const todaySales = await reportRepo.getTodaySales()
  const todayTransactions = await reportRepo.getTodayTransactions()
  const inventoryValue = await reportRepo.getInventoryValue()
  const lowStock = await reportRepo.getLowStock()
  const receivables = await reportRepo.getReceivableSummary()
  return {
    today_sales: todaySales.total_sales,
    transactions: todayTransactions.transactions,
    inventory_value: inventoryValue.stock_value,
    low_stock: lowStock,
    receivables: receivables
  }
}

exports.getSalesReport = async (from, to) => {
  if (!from || !to) {
    throw new Error("Date range required")
  }
  return reportRepo.getSalesReport(from, to)
}

exports.getTopProducts = async () => {
  return reportRepo.getTopProducts()
}

exports.getInventoryValue = async () => {
  return reportRepo.getInventoryValue()
}

exports.getReceivables = async () => {
  return reportRepo.getReceivableSummary()
}

exports.getLowStock = async () => {
  return reportRepo.getLowStock()
}