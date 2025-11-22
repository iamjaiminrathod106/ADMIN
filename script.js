const downloadCSVBtn = document.getElementById("downloadCSVBtn");
const downloadWordBtn = document.getElementById("downloadWordBtn");

downloadCSVBtn.addEventListener("click", () => {
  if(!allLawyers || allLawyers.length===0){ alert("No data to download!"); return; }

  let csvContent = "Enrolment,Name\n";
  allLawyers.forEach(l => {
    csvContent += `${l.Enrolment.replace(/,/g,"")},${l.Name.replace(/,/g,"")}\n`;
  });

  const blob = new Blob([csvContent], {type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "lawyers.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

downloadWordBtn.addEventListener("click", () => {
  if(!allLawyers || allLawyers.length===0){ alert("No data to download!"); return; }

  let htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Lawyers</title>
    <style>
      table { border-collapse: collapse; font-family: Calibri, sans-serif; width: 100%; }
      th, td { border: 1px solid #000; padding: 6px 10px; }
      th { font-weight: bold; background-color: #f0f0f0; }
    </style>
    </head>
    <body>
      <table>
        <tr><th>Enrolment</th><th>Name</th></tr>
  `;

  allLawyers.forEach(l => {
    htmlContent += `<tr><td>${l.Enrolment.replace(/,/g,"")}</td><td>${l.Name.replace(/,/g,"")}</td></tr>`;
  });

  htmlContent += `</table></body></html>`;

  const blob = new Blob(["\ufeff", htmlContent], {type:"application/msword"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "lawyers.doc";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});