import fs from "fs";

let fileContent = "";
for (let i = 0; i <= 1000; i++) {
  fileContent += `\"ml-[${i}px]\",\n`;
}

fs.writeFileSync("listOfStrings.txt", fileContent);
