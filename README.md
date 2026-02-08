# 📚 Ieltsflashcards - Intensive Vocabulary Trainer

**Ieltsflashcards** is a professional-grade vocabulary learning application designed to help students master complex English vocabulary through a rigorous **"No Escape"** spaced repetition algorithm. Built with modern web technologies, it offers a seamless, app-like experience on all devices.

## 🚀 Key Features

- **🧠 "No Escape" Algorithm**: A three-stage learning process ensuring total mastery:
  1.  **Assessment**: Quick check to separate known words from unknown ones.
  2.  **Drill**: Intensive practice where you must answer correctly **twice in a row** to advance.
  3.  **Final Review**: One last pass to cement the memory before completing the session.
- **📂 Universal Format Support**:
  - **Anki Decks (.apkg)**: Native support for Anki files using WASM-based parsing (no server required).
  - **Excel/CSV**: Drag-and-drop support for custom vocabulary lists.
  - **JSON**: Structured support for curated book series.
- **📚 Integrated Library**: Comes pre-loaded with essential IELTS/TOEFL/GRE resources.
- **🔒 Local-First Architecture**: 
  - **Zero Privacy Risk**: All progress is stored locally in your browser (LocalStorage/IndexedDB).
  - **No Server Costs**: The app runs entirely client-side after initial load.
- **🌍 SEO & Localization**: 
  - Optimized for Iranian market with Persian (Farsi) metadata and JSON-LD structured data.
  - Bilingual interface support.
- **📱 PWA Ready**: Installable as a native app on iOS, Android, and Desktop.
- **🎨 Responsive Design**: Optimized for Mobile, Tablet, Desktop, and Smart TVs.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Core Logic**: Custom React Hooks for session state management.
- **Data Processing**:
  - `sql.js` (WebAssembly) for parsing SQLite Anki databases in the browser.
  - `jszip` for handling archive formats.
  - `xlsx` for spreadsheet parsing.

## 🏁 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ieltsflashcards.git
   cd ieltsflashcards/V2
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Visit [http://localhost:3000](http://localhost:3000).

## 📚 Managing Books

The application supports a "Library" system where books can be dynamically loaded.

### Adding Anki Books (.apkg)
1. Place your `.apkg` files in `public/books/`.
2. Run the import script to update the manifest:
   ```bash
   node scripts/import_books.js
   ```
3. (Optional) Run the cleanup script to fix messy filenames:
   ```bash
   node scripts/clean_manifest.js
   ```

### Adding JSON Books
1. Create a folder in `public/books/` (e.g., `my-book`).
2. Add numbered JSON files (e.g., `1.json`, `2.json`) representing chapters/sessions.
3. Update `public/books/books-manifest.json` to include the new book.

## 🧠 "No Escape" Methodology Explained

Unlike standard flashcard apps that just show a card and ask "Did you know it?", **Ieltsflashcards** forces active recall:

1. **The Pile**: Unknown cards form a "Learning Pile".
2. **The Loop**: You review the pile until it is empty.
3. **The Rule**: If you get a card wrong, it stays in the pile. If you get it right, it gains a "streak". It only leaves the pile after **2 consecutive correct answers**.
4. **The Result**: You cannot finish a session until you have proven mastery of every single word.

## 📄 License

This project is proprietary software developed for **Ieltsflashcards.ir**. All rights reserved.
