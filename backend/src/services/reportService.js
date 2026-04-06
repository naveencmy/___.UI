const reportRepo = require('../repositories/reportRepository')
/*
Dashboard summary
Used by POS home screen
*/
exports.getDashboard = async () => {
  const [
    todaySales,
    todayPurchase,
    lowStock,
    receivablesRow,
    payablesRow,
    recent
  ] = await Promise.all([
    reportRepo.getTodaySales(),
    reportRepo.getTodayPurchase(),
    reportRepo.getLowStock(),
    reportRepo.getTotalReceivables(),
    reportRepo.getPayablesSummary(),
    reportRepo.getRecentTransactions()
  ])
  return {
    today_sales: Number(todaySales.total_sales) || 0,
    today_purchase: Number(todayPurchase.total_purchase) || 0,
    receivables: Number(receivablesRow.total_receivables) || 0,
    payables: Number(payablesRow.total_payables) || 0,
    low_stock: lowStock,
    recent
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