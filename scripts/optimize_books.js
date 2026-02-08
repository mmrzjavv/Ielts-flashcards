const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const BOOKS_DIR = path.join(__dirname, '../public/books');

async function optimizeBooks() {
  const files = fs.readdirSync(BOOKS_DIR).filter(f => f.endsWith('.apkg'));
  
  let totalSaved = 0;

  for (const file of files) {
    const filePath = path.join(BOOKS_DIR, file);
    const originalSize = fs.statSync(filePath).size;
    
    try {
      const zip = new AdmZip(filePath);
      const zipEntries = zip.getEntries();
      
      let dbEntry = zipEntries.find(entry => entry.entryName === 'collection.anki21');
      if (!dbEntry) {
        dbEntry = zipEntries.find(entry => entry.entryName === 'collection.anki2');
      }

      if (dbEntry) {
        // Create a new zip
        const newZip = new AdmZip();
        newZip.addFile(dbEntry.entryName, dbEntry.getData());
        
        // Write back
        newZip.writeZip(filePath);
        
        const newSize = fs.statSync(filePath).size;
        const saved = originalSize - newSize;
        totalSaved += saved;
        
        console.log(`Optimized ${file}: ${(originalSize / 1024 / 1024).toFixed(2)}MB -> ${(newSize / 1024 / 1024).toFixed(2)}MB`);
      } else {
        console.warn(`Skipping ${file}: No collection.anki2 database found.`);
      }
    } catch (e) {
      console.error(`Error processing ${file}:`, e);
    }
  }

  console.log(`\nTotal space saved: ${(totalSaved / 1024 / 1024).toFixed(2)}MB`);
}

optimizeBooks();
