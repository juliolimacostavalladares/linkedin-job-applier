import * as fs from 'fs';

async function testPdf() {
  const fetch = (await import('node-fetch')).default;
  console.log("Not testing directly due to credentials, but let's test what type of response we usually get.");
}
testPdf();
