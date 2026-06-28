import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputPath = "data/Training_PowerBI_First_Report.xlsx";
const previewDir = "docs/workbook-preview";

const workbook = Workbook.create();

const colors = {
  header: "#0F766E",
  headerText: "#FFFFFF",
  soft: "#DFF5F1",
  border: "#D9E1EC",
  title: "#172033",
};

function addSheet(name, rows, tableName, formats = {}) {
  const sheet = workbook.worksheets.add(name);
  sheet.showGridLines = false;
  const rowCount = rows.length;
  const colCount = rows[0].length;
  const range = sheet.getRangeByIndexes(0, 0, rowCount, colCount);
  range.values = rows;
  sheet.getRangeByIndexes(0, 0, 1, colCount).format = {
    fill: colors.header,
    font: { bold: true, color: colors.headerText },
  };
  range.format.borders = { preset: "all", style: "thin", color: colors.border };
  sheet.freezePanes.freezeRows(1);
  const lastColumn = String.fromCharCode("A".charCodeAt(0) + colCount - 1);
  const table = sheet.tables.add(`A1:${lastColumn}${rowCount}`, true, tableName);
  table.showFilterButton = true;
  table.style = "TableStyleMedium2";

  Object.entries(formats).forEach(([colLetter, numberFormat]) => {
    sheet.getRange(`${colLetter}2:${colLetter}${rowCount}`).format.numberFormat = numberFormat;
  });
  sheet.getUsedRange().format.autofitColumns();
  sheet.getUsedRange().format.autofitRows();
  return sheet;
}

const plants = [
  ["PlantID", "PlantName", "Country", "Division"],
  ["PL01", "Sao Paulo Plant", "Brazil", "Ceramics"],
  ["PL02", "Monterrey Plant", "Mexico", "Packaging"],
  ["PL03", "Austin Plant", "United States", "Components"],
  ["PL04", "Cordoba Plant", "Argentina", "Ceramics"],
];

const products = [
  ["ProductID", "ProductName", "ProductFamily"],
  ["PR01", "Standard Tile", "Tiles"],
  ["PR02", "Premium Tile", "Tiles"],
  ["PR03", "Industrial Filter", "Filters"],
  ["PR04", "Glazed Panel", "Panels"],
  ["PR05", "Compact Module", "Modules"],
];

const defects = [
  ["DefectID", "DefectType", "DefectCategory"],
  ["DF01", "Crack", "Quality"],
  ["DF02", "Color variation", "Quality"],
  ["DF03", "Packaging damage", "Logistics"],
  ["DF04", "Wrong label", "Logistics"],
  ["DF05", "Dimension issue", "Quality"],
];

const monthNames = ["January", "February", "March", "April", "May", "June"];
const dates = [["Date", "Year", "Month", "MonthName", "Quarter"]];
for (let month = 0; month < 6; month += 1) {
  for (const day of [1, 8, 15, 22]) {
    const date = new Date(Date.UTC(2026, month, day));
    dates.push([date, 2026, month + 1, monthNames[month], `Q${Math.floor(month / 3) + 1}`]);
  }
}

const fact = [["ProductionID", "Date", "PlantID", "ProductID", "QuantityProduced", "QuantityRejected", "ProductionHours", "Cost", "Revenue"]];
let id = 1001;
const plantIds = plants.slice(1).map((row) => row[0]);
const productIds = products.slice(1).map((row) => row[0]);
for (let i = 1; i < dates.length; i += 1) {
  for (let j = 0; j < plantIds.length; j += 1) {
    const product = productIds[(i + j) % productIds.length];
    const produced = 420 + ((i * 37 + j * 53) % 360);
    const rejected = 8 + ((i * 5 + j * 7) % 38);
    const hours = 18 + ((i + j) % 9);
    const cost = Math.round(produced * (8.2 + j * 0.8));
    const revenue = Math.round(produced * (13.5 + ((i + j) % 4)));
    fact.push([`P${id}`, dates[i][0], plantIds[j], product, produced, rejected, hours, cost, revenue]);
    id += 1;
  }
}

addSheet("Fact_Production", fact, "FactProduction", {
  B: "yyyy-mm-dd",
  E: "#,##0",
  F: "#,##0",
  G: "0.0",
  H: "$#,##0",
  I: "$#,##0",
});
addSheet("Dim_Date", dates, "DimDate", { A: "yyyy-mm-dd", B: "0", C: "0" });
addSheet("Dim_Plant", plants, "DimPlant");
addSheet("Dim_Product", products, "DimProduct");
addSheet("Dim_Defect", defects, "DimDefect");

const summary = workbook.worksheets.add("Read_Me");
summary.showGridLines = false;
summary.getRange("A1:E1").merge();
summary.getRange("A1").values = [["Power BI - First Report Path"]];
summary.getRange("A1").format = {
  fill: colors.soft,
  font: { bold: true, color: colors.title, size: 16 },
};
summary.getRange("A3:B9").values = [
  ["Purpose", "Fictitious dataset for a beginner Power BI report."],
  ["Main fact table", "Fact_Production"],
  ["Date relationship", "Fact_Production[Date] -> Dim_Date[Date]"],
  ["Plant relationship", "Fact_Production[PlantID] -> Dim_Plant[PlantID]"],
  ["Product relationship", "Fact_Production[ProductID] -> Dim_Product[ProductID]"],
  ["Suggested report", "My First Power BI Report"],
  ["Note", "All data is fictional and safe for practice."],
];
summary.getRange("A3:A9").format = {
  fill: colors.header,
  font: { bold: true, color: colors.headerText },
};
summary.getRange("A3:B9").format.borders = { preset: "all", style: "thin", color: colors.border };
summary.getUsedRange().format.autofitColumns();
summary.getUsedRange().format.autofitRows();

await fs.mkdir("data", { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

for (const sheetName of ["Read_Me", "Fact_Production", "Dim_Date", "Dim_Plant", "Dim_Product", "Dim_Defect"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(`${previewDir}/${sheetName}.png`, new Uint8Array(await preview.arrayBuffer()));
}

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan",
});
console.log(errors.ndjson);

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(`Saved ${outputPath}`);
