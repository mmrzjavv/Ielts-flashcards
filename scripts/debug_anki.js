const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const initSqlJs = require('sql.js');

async function debugAnki(fileName) {
    const filePath = path.join(process.cwd(), 'public/books', fileName);
    const fileBuffer = fs.readFileSync(filePath);
    const zip = new JSZip();
    const contents = await zip.loadAsync(fileBuffer);

    let dbEntry = contents.file('collection.anki21');
    if (!dbEntry) dbEntry = contents.file('collection.anki2');

    if (!dbEntry) {
        console.error("No database found");
        return;
    }

    const dbData = await dbEntry.async('uint8array');
    const SQL = await initSqlJs();
    const db = new SQL.Database(dbData);

    // Get Models (Field Definitions)
    const colResult = db.exec("SELECT models FROM col");
    const models = JSON.parse(colResult[0].values[0][0]);

    console.log("\n=== Field Definitions ===");
    Object.values(models).forEach(model => {
        console.log(`Model: ${model.name}`);
        model.flds.forEach((f, i) => {
            console.log(`  Field ${i}: ${f.name}`);
        });
    });

    // Get Sample Notes
    console.log("\n=== Sample Notes ===");
    const notes = db.exec("SELECT flds, mid FROM notes LIMIT 5");
    
    notes[0].values.forEach((row, i) => {
        const flds = row[0].split('\x1f');
        const mid = row[1];
        const model = models[mid];
        
        console.log(`\nNote ${i + 1} (Model: ${model.name}):`);
        flds.forEach((val, idx) => {
            const fieldName = model.flds[idx] ? model.flds[idx].name : `Field ${idx}`;
            // Strip HTML for cleaner log
            const cleanVal = val.replace(/<[^>]*>/g, '').trim().substring(0, 50); 
            console.log(`  ${fieldName}: ${cleanVal}`);
        });
    });
}

// Check the file passed as argument or first file found
const dir = path.join(process.cwd(), 'public/books');
const targetFile = process.argv[2];

if (targetFile) {
    console.log(`Debugging ${targetFile}...`);
    debugAnki(targetFile);
} else {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.apkg'));
    if (files.length > 0) {
        console.log(`Debugging ${files[0]}...`);
        debugAnki(files[0]);
    } else {
        console.log("No .apkg files found");
    }
}
