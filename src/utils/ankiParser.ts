import JSZip from 'jszip';
// import initSqlJs from 'sql.js'; // Dynamically imported
import { Card } from '@/types';

export async function parseAnkiFile(file: File | Blob): Promise<Card[]> {
  console.log("Starting Anki parsing...");
  // Dynamically import sql.js to avoid SSR/build issues with fs module
  const initSqlJs = (await import('sql.js')).default;
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);

  const fileNames = Object.keys(contents.files);
  console.log("Files in .apkg:", fileNames);

  // Anki 2.1.50+ stores the real DB in collection.anki21 (standard SQLite) 
  // or collection.anki21b (Zstd compressed).
  // collection.anki2 might be a stub.
  
  let dbEntry = contents.file('collection.anki21');
  
  if (!dbEntry) {
      // Fallback to .anki2 if .anki21 is not found
      // Note: If .anki2 is a stub, we might still be stuck, but we'll try.
      dbEntry = contents.file('collection.anki2');
  }

  if (!dbEntry) {
      throw new Error('No valid Anki collection found (.anki2 or .anki21)');
  }

  console.log("Reading database from:", dbEntry.name);
  const dbArrayBuffer = await dbEntry.async('uint8array');

  const SQL = await initSqlJs({
    locateFile: (file) => `/${file}`,
  });

  let db;
  try {
    db = new SQL.Database(dbArrayBuffer);
  } catch (e) {
    console.error("Failed to load SQLite DB", e);
    throw new Error("Invalid SQLite database format");
  }
  
  // Get Models (Field Definitions)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let models: any = {};
  try {
      const colResult = db.exec("SELECT models FROM col");
      if (colResult.length > 0 && colResult[0].values.length > 0) {
          const modelsJson = colResult[0].values[0][0] as string;
          models = JSON.parse(modelsJson);
      }
  } catch (e) {
      console.warn("Could not read models from col table, falling back to simple indexing", e);
  }

  // Check for notes table
  let result;
  try {
      result = db.exec("SELECT flds, mid FROM notes");
  } catch (e) {
      console.error("Error executing SQL query", e);
      // If the table doesn't exist, it might be a weird schema or encrypted
      throw new Error("Could not read notes from Anki database");
  }
  
  if (result.length === 0 || !result[0].values) {
      console.warn("No notes found in database");
      return [];
  }
  
  const rows = result[0].values;
  const cards: Card[] = [];

  rows.forEach((row) => {
      const flds = row[0] as string;
      const mid = row[1] as number;
      const fields = flds.split('\x1f');
      
      // Strip HTML function
      const clean = (str: string) => {
          if (!str) return '';
          return str
            .replace(/\[sound:[^\]]*\]/g, '') // Remove Anki sound tags
            .replace(/<[^>]*>/g, '')           // Remove HTML tags
            .replace(/&nbsp;/g, ' ')           // Replace &nbsp; with space
            .trim();
      };

      let word = '';
      let meaning = '';
      let phonetic = '';
      const synonyms: string[] = [];
      const examples: { english: string, persian: string } = { english: '', persian: '' };

      const model = models[mid];

      if (model && model.flds) {
          // Dynamic Mapping
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fieldMap = model.flds.map((f: any) => ({ name: f.name.toLowerCase(), value: clean(fields[f.ord]) }));
          
          // Helper to find value by field name regex
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const findField = (regex: RegExp) => fieldMap.find((f: any) => regex.test(f.name))?.value || '';

          word = findField(/^(word|front|term|expression|vocab)/i) || clean(fields[0]);
          
          // Meaning strategies
          // 1. Look for Persian/Meaning/Definition
          meaning = findField(/^(persian|meaning|definition|back|answer|translation|farsi)/i);
          
          // 2. Fallback: Look for "Synonyms" if meaning is empty (common in some decks)
          if (!meaning) {
              const syn = findField(/synonym/i);
              if (syn) meaning = syn;
          }

          // 3. Fallback: If still empty, try field 1 or 2 (heuristic)
          if (!meaning) {
             // If field 1 is phonetic (starts with / or [), try field 2
             if (clean(fields[1]).match(/^[\/\[].*[\/\]]$/)) {
                 meaning = clean(fields[2]);
             } else {
                 meaning = clean(fields[1]);
             }
          }

          phonetic = findField(/^(phonetic|pronunciation|ipa|audio)/i) || '';
          // If phonetic is empty, check if meaning looks like phonetic
          if (!phonetic && meaning && meaning.match(/^[\/\[].*[\/\]]$/)) {
              phonetic = meaning;
              meaning = clean(fields[2]); // Shift meaning to next field
          }
          
          // Examples
          const exEng = findField(/^(example|sentence|context)(?!.*persian)(?!.*farsi)/i);
          const exFa = findField(/^(example|sentence|context).*(persian|farsi)/i) || findField(/^(persian|farsi).*(example|sentence)/i);
          
          if (exEng) examples.english = exEng;
          if (exFa) examples.persian = exFa;

      } else {
          // Fallback to Legacy Simple Indexing
          if (fields.length >= 2) {
            word = clean(fields[0]);
            meaning = clean(fields[1]);
            phonetic = fields.length > 2 ? clean(fields[2]) : '';
            
            // Fix for 504 deck pattern (Word, Phonetic, Meaning)
            if (phonetic && (meaning.startsWith('/') || meaning.startsWith('['))) {
                const temp = meaning;
                meaning = phonetic;
                phonetic = temp;
            }
          }
      }
      
      // Explicitly filter out the "Please update" message if it appears
      if (word.includes("Please update to the latest Anki version") || 
          meaning.includes("Please update to the latest Anki version")) {
          console.warn("Skipping 'Update Anki' stub card");
          return;
      }
      
      if (word && meaning) {
          cards.push({
              word,
              meaning,
              phonetic,
              synonyms: synonyms.length > 0 ? synonyms : undefined,
              examples: (examples.english || examples.persian) ? examples : undefined
          });
      }
  });

  db.close();
  console.log(`Parsed ${cards.length} cards`);
  return cards;
}
