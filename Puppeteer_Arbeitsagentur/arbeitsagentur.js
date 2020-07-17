const puppeteer = require("puppeteer");
const moment = require("moment");
const Papa = require("papaparse");
var fs = require("fs");
var table = "#grdRetraction";

dataarray = [];

async function berufsrun(beruf) {
  const browser = await puppeteer.launch({
    headless: true
  });
  try{

  const page = await browser.newPage();

    await page.goto(
      "https://berufenet.arbeitsagentur.de/berufenet/faces/index?path=null"
    );

    
    await page.click('input[placeholder="Beruf"]');

    await page.keyboard.type(beruf);
    await page.waitFor(3 * 1000)
    
    const elements = await page.$$('.AFAutoSuggestItem');
    
    //[0].getElementsByTagName("li").innerHTML
    let result=await page.evaluate(function () {

      let elements = document.getElementsByClassName('AFAutoSuggestItem');

      return(elements[0].innerHTML)
    });


    await page.waitForSelector('.AFAutoSuggestItem')[0]
    await page.click('.AFAutoSuggestItem')[0]
  
    await page.waitFor(2 * 1000)

  
    await page.click('nobr');
    await page.waitFor(1 * 1000)


    let bezeichnung=await page.evaluate(function () {

      let element = document.getElementById('tk_sys');

      return(element.innerHTML)
    });
    let nummer=bezeichnung.toString().slice(-9,-1)
  
    await page.goBack();
    browser.close()
    let resultsobject=[beruf,result,nummer]
    return(resultsobject)

}catch(error) {
  console.log(error);
  browser.close();
  let resultsobject=[beruf,"",error]
  return(resultsobject)

};}


const csvFilePath = 'jobs_deepl_3.csv'

const readCSV = async (filePath) => {
  const csvFile = fs.readFileSync(filePath)
  const csvData = csvFile.toString()  
  return new Promise(resolve => {
    Papa.parse(csvData, {
      header: true,
      complete: results => {
        console.log('Complete', results.data.length, 'records.'); 
        resolve(results.data);
      }
    });
  });
};

const test = async() => {
  let parsedData = await readCSV(csvFilePath); 
  console.log(parsedData)
  let dataarray=[["Berufsübersetzung","Resultatsberuf","Nummer"]]
  // parsedData.length
  for (let a = 0; a <parsedData.length; a++) {
    let beruf=parsedData[a]["'jobs'"]
    beruf=beruf.replace('"',"")
    beruf=beruf.replace("'",'')
    beruf=beruf.replace("'",'')
    beruf=beruf.split("-")
    beruf=beruf.slice(0)[0]
    beruf=beruf.slice(0,-3)

    beruf="Online-Händler"
    console.log(beruf)
    await new Promise((resolve, reject) => setTimeout(resolve, 3000));
    let resultsobject=await berufsrun(beruf)
    console.log(resultsobject)
    dataarray.push(resultsobject)
    console.log(dataarray)
  }
  var testcsv = await Papa.unparse(dataarray);
  fs.writeFile(
    "/Users/halukamaier-borst/Documents/halukaschreibt_2.csv",
    testcsv,
    function (err) {}
  );
}
test()

  
