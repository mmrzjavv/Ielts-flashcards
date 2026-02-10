# Adding Books to the Study Flashcards App

## Automatic Book Discovery

The app automatically discovers books and their sessions. You have two options:

### Option 1: Using the Manifest File (Recommended - FASTEST)

1. Edit `books-manifest.json`
2. Add your new book entry with session numbers:

```json
{
  "books": [
    {
      "name": "cambridge-vocabulary-for-ielts",
      "displayName": "Cambridge Vocabulary for IELTS",
      "icon": "📚",
      "sessions": [16, 17, 18, 19, 20, 21, 22]
    },
    {
      "name": "your-new-book-folder",
      "displayName": "Your New Book Name",
      "icon": "📖",
      "sessions": [1, 2, 3, 4, 5]
    }
  ]
}
```

3. Create a folder with the same name as `"name"` in this directory
4. Add JSON session files matching the numbers in `"sessions"` array
5. **That's it!** The app loads instantly because it doesn't need to check 100 files!

**Important:** Including `"sessions"` in the manifest makes loading **much faster** because the app doesn't need to check which files exist. If you don't include sessions, the app will discover them automatically (but slower).

### Option 2: Automatic Discovery (No Manifest Needed)

If you don't want to edit the manifest file:

1. Create a folder in this directory (e.g., `my-vocabulary-book/`)
2. Add JSON session files numbered starting from 1 (e.g., `1.json`, `2.json`, `3.json`, etc.)
3. The app will try to discover it automatically

**Note:** For best results, use the manifest file method as it gives you control over the display name and icon.

## Session File Format

Each session JSON file should contain an array of vocabulary items:

```json
[
  {
    "id": "unique-id",
    "word": "example",
    "persian": "مثال",
    "definition": "A thing characteristic of its kind...",
    "exampleA": "This is an example sentence.",
    "exampleB": "Another example here.",
    "exampleC": "Third example.",
    "status": "seen"
  }
]
```

## Session Numbering

- Sessions are automatically discovered by checking for numbered JSON files (1.json, 2.json, etc.)
- You can number them however you like (1, 2, 3... or 17, 18, 19...)
- The app will find all JSON files in the range 1-100
- Sessions are displayed in numerical order

## Examples

### Adding a New Book

1. Create folder: `toefl-vocabulary/` (inside `public/books/`)
2. Add sessions: `1.json`, `2.json`, `3.json`
3. Update `books-manifest.json`:
```json
{
  "books": [
    {
      "name": "cambridge-vocabulary-for-ielts",
      "displayName": "Cambridge Vocabulary for IELTS",
      "icon": "📚"
    },
    {
      "name": "toefl-vocabulary",
      "displayName": "TOEFL Vocabulary",
      "icon": "📘"
    }
  ]
}
```

That's it! The app will automatically show your new book with all its sessions.


