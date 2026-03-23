import jsPDF from 'jspdf'

export function downloadStatement(transactions: any[]) {
  const doc = new jsPDF()
  doc.setFontSize(14)
  doc.text('Smart Bank - Account Statement', 14, 16)
  doc.setFontSize(10)
  let y = 26
  doc.text('Date', 14, y)
  doc.text('Type', 54, y)
  doc.text('Amount', 94, y)
  doc.text('Balance', 134, y)
  doc.text('Description', 174, y)
  y += 6
  transactions.forEach(t => {
    if (y > 280) { doc.addPage(); y = 16 }
    doc.text(new Date(t.date).toLocaleDateString(), 14, y)
    doc.text(t.type, 54, y)
    doc.text(String(t.amount), 94, y)
    doc.text(String(t.balanceAfterTransaction), 134, y)
    doc.text((t.description || '').slice(0, 20), 174, y)
    y += 6
  })
  doc.save('statement.pdf')
}
