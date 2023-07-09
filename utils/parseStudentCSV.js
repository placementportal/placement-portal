const fs = require("fs").promises;
const path = require("path");

const readCSVFile = async () => {
  const filePath = path.resolve(__dirname, "./StudentData.csv");
  const data = await fs.readFile(filePath, { encoding: "utf-8" });
  const rows = data.split("\n");

  const info = rows.slice(1);

  for (let rows of info) {
    const row = rows.split(",");
    const [roll_no, name, email, contactNumber, fatherName] = row.slice(1, 6);
    console.log({
      roll_no,
      name,
      email,
      contactNumber,
      fatherName,
    });
  }
};

readCSVFile();
