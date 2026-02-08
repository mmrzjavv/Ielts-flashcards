const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(process.cwd(), 'public/books/books-manifest.json');

// Helper to clean display name
function cleanDisplayName(name) {
    let clean = name;
    
    // Remove specific spam/tags
    clean = clean.replace(/_Tel_/gi, ' ');
    clean = clean.replace(/@AlienAnkiDecks/gi, ' ');
    clean = clean.replace(/AlienAnkiDecks/gi, ' ');
    
    // Remove file extensions if present
    clean = clean.replace(/\.apkg$/i, '');
    
    // Replace underscores with spaces
    clean = clean.replace(/_/g, ' ');
    
    // Normalize spaces (collapse multiple spaces)
    clean = clean.replace(/\s+/g, ' ').trim();
    
    return clean;
}

try {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    let updated = false;

    manifest.books = manifest.books.map(book => {
        const originalName = book.displayName;
        const cleanedName = cleanDisplayName(originalName);

        if (originalName !== cleanedName) {
            console.log(`Renaming: "${originalName}" -> "${cleanedName}"`);
            updated = true;
            return {
                ...book,
                displayName: cleanedName
            };
        }
        return book;
    });

    if (updated) {
        fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
        console.log("Manifest updated successfully.");
    } else {
        console.log("No changes needed.");
    }

} catch (e) {
    console.error("Error processing manifest:", e);
}
