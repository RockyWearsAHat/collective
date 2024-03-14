import path from "path";
import fs from "fs";

export function copyFile(from, to, overwrite = false) {
  return {
    name: "copy-file",
    generateBundle() {
      const log = msg => console.log("\x1b[36m%s\x1b[0m", msg);
      log(`copy file: ${from} → ${to}`);
      const fromFile = `${process.cwd()}/${from}`;
      const toFile = `${process.cwd()}/${to}`;
      if (fs.existsSync(toFile) && !overwrite) return;
      log(`• ${fromFile} → ${toFile}`);
      fs.copyFileSync(path.resolve(fromFile), path.resolve(toFile));
    }
  };
}

export function copyIndexFile(from, to, overwrite = false) {
  //This may be the worst function I have ever written
  let html = fs.readFileSync(`${process.cwd()}/${from}`, "utf8");
  let parsedHTML = "";

  //Must start at import RefreshRuntime, <script type="module"> is probably descript enough but unable to verify if this is really the first
  //script included
  let scriptStartIndex =
    html.indexOf(`import RefreshRuntime from "/@react-refresh";`) - 30; //Hence the -30, this is disgusting
  let reactScriptEndIndex = html.indexOf(`</script>`, scriptStartIndex); //This is the end of the react script
  let scriptEndIndex = html.indexOf(`</script>`, reactScriptEndIndex + 10); //This is the end of the next vite client script, another random
  //number out my ass

  console.log(scriptStartIndex, scriptEndIndex); //Check start and end indexes

  parsedHTML =
    html.substring(0, scriptStartIndex) + html.substring(scriptEndIndex + 12); //Parse the html, idek why this is +12, I think because the
  //end index will parse to the begining of the </script> tag and it must parse past the </script>, there has surely got to be a better
  //way to do this

  console.log(parsedHTML);

  return {
    name: "copy-index-file",
    generateBundle() {
      const log = msg => console.log("\x1b[36m%s\x1b[0m", msg);
      log(`copy file: ${from} → ${to}`);
      const fromFile = `${process.cwd()}/${from}`;
      const toFile = `${process.cwd()}/${to}`;
      if (fs.existsSync(toFile) && !overwrite) return;
      log(`• ${fromFile} → ${toFile}`);
      fs.writeFileSync(path.resolve(toFile), parsedHTML);
    }
  };
}
