const fs = require('fs');
const path = require('path');

const SOURCE_DIR = '/Users/mmrz/Downloads/English '; // Note the space
const DEST_DIR = path.join(process.cwd(), 'public/books');
const MANIFEST_PATH = path.join(DEST_DIR, 'books-manifest.json');

// Ensure destination exists
if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

// Helper to slugify
function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
}

// Read Manifest
let manifest = { books: [] };
if (fs.existsSync(MANIFEST_PATH)) {
    try {
        manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    } catch (e) {
        console.error("Error reading manifest:", e);
    }
}

// Read Source Files
try {
    const files = fs.readdirSync(SOURCE_DIR);
    console.log(`Found ${files.length} files in source.`);

    files.forEach(file => {
        if (file.endsWith('.apkg')) {
            const displayName = file.replace('.apkg', '').trim();
            const name = slugify(displayName);
            const destFileName = `${name}.apkg`;
            const destPath = path.join(DEST_DIR, destFileName);
            const sourcePath = path.join(SOURCE_DIR, file);

            // Copy File
            console.log(`Copying "${file}" to "${destFileName}"...`);
            fs.copyFileSync(sourcePath, destPath);

            // Update Manifest
            const existingIndex = manifest.books.findIndex(b => b.name === name);
            const bookEntry = {
                name: name,
                displayName: displayName,
                icon: "📚", // Default icon
                format: "apkg",
                fileName: destFileName,
                sessions: ["Full"] // Single session for apkg
            };

            if (existingIndex >= 0) {
                manifest.books[existingIndex] = bookEntry;
            } else {
                manifest.books.push(bookEntry);
            }
        }
    });

    // Write Manifest
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log("Manifest updated successfully.");

} catch (e) {
    console.error("Error processing files:", e);
}
