import fs from "fs";
let listOfStrings = [];
for (let i = 0; i <= 100.01; i += 0.01) {
  if (Number.isInteger(Number.parseInt(i * 100) / 100))
    listOfStrings.push(`"after:content-['Sale:_${Number.parseInt(i)}%_Off']"`);
  else listOfStrings.push(`"after:content-['Sale:_${i.toFixed(2)}%_Off']"`);
}

fs.writeFileSync("listOfStrings.txt", listOfStrings.join(",\n"));
