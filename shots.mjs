import fs from 'fs'; import { chromium } from 'playwright';
fs.mkdirSync('shots',{recursive:true});
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const jobs = [
  ['dist/index.html', 1440, 'home-desk', 0, 1700],
  ['dist/index.html', 1440, 'home-desk2', 1700, 3300],
  ['dist/services.html', 1440, 'svc-desk', 300, 1700],
  ['dist/services/tax-reporting/corporate-tax-processing.html', 1440, 'detail-desk', 0, 1500],
  ['dist/index.html', 390, 'home-mob', 0, 1600],
  ['dist/contact.html', 1440, 'contact-desk', 300, 1800]
];
for (const [p, w, name, from, to] of jobs) {
  const page = await b.newPage({viewport:{width:w,height:900},deviceScaleFactor:1});
  await page.goto('file://'+process.cwd()+'/'+p);
  await page.waitForTimeout(900);
  await page.screenshot({path:`shots/${name}.png`, fullPage:true});
  await page.close();
}
await b.close();
console.log('shots done');
