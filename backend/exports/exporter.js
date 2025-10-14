const { parse } = require('json2csv');
const ExcelJS = require('exceljs');

function toCSV(data) {
  const fields = ['op_name', 'labor'];
  const csv = parse(data, { fields });
  return csv;
}

function toXLSX(data, res) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Cost Breakdown');
  sheet.columns = [
    { header: 'Operation', key: 'op_name' },
    { header: 'Labor Cost', key: 'labor' }
  ];
  sheet.addRows(data);
  workbook.xlsx.write(res).then(() => {
    res.end();
  });
}

module.exports = { toCSV, toXLSX };
