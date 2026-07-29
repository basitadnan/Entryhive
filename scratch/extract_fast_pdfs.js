import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Using the API key you provided
const API_KEY = "AQ.Ab8RN6L3cNP6XYxEFryp1jqJefd9gGOXiqQuIaPh5ZnXg6XCrg";
const genAI = new GoogleGenerativeAI(API_KEY);
const fileManager = new GoogleAIFileManager(API_KEY);

const PDF_DIR = 'C:\\Users\\lenovo\\Music\\Mock Tests-20260703T183125Z-3-001\\Mock Tests';
const OUTPUT_DIR = path.join(__dirname, 'fast_outputs');

// Delay function to avoid hitting the 15 Requests Per Minute free tier limit
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function processPdf(filePath, fileName) {
    console.log(`\n===========================================`);
    console.log(`Uploading ${fileName} to Gemini...`);
    
    try {
        const uploadResult = await fileManager.uploadFile(filePath, {
            mimeType: "application/pdf",
            displayName: fileName,
        });
        
        console.log(`Uploaded successfully! Uri: ${uploadResult.file.uri}`);
        console.log(`Analyzing PDF and extracting questions (this takes a moment)...`);

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        You are an expert data extractor and test prep engineer. I have uploaded a past paper PDF for a university entry test.
        The questions are usually at the beginning of the PDF, and the answer key is usually at the very end of the document.
        
        Your task:
        1. Read the document entirely.
        2. Extract every single question and its options.
        3. Match the question with its correct answer from the answer key at the end of the PDF.
        4. Categorize each question into one of these subjects based on its content: "english", "basic_maths", "advance_maths", "physics", or "iq".
        5. Output the result as a pure JSON array.
        
        Required JSON format for each question:
        [
            {
                "id": "fast_test_unique_id",
                "text": "The text of the question...",
                "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
                "correctAnswer": "The exact text of the correct option",
                "explanation": "A short explanation of why this is correct (if the PDF provides one, otherwise leave blank)",
                "subject": "physics"
            }
        ]
        
        CRITICAL: 
        - Return ONLY valid JSON.
        - Do NOT wrap the JSON in markdown blocks (e.g., no \`\`\`json). Just the raw array.
        - Make sure "correctAnswer" exactly matches one of the strings in the "options" array.
        `;

        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: uploadResult.file.mimeType,
                    fileUri: uploadResult.file.uri
                }
            },
            { text: prompt }
        ]);

        const text = result.response.text();
        // Clean up markdown just in case the model returns it
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR);
        }
        
        const outPath = path.join(OUTPUT_DIR, fileName + '.json');
        fs.writeFileSync(outPath, cleanText);
        console.log(`✅ Success! Saved extracted JSON to ${outPath}`);
        
    } catch (e) {
        console.error(`❌ Error processing ${fileName}:`, e.message);
    }
}

async function main() {
    console.log(`Looking for PDFs in: ${PDF_DIR}`);
    if (!fs.existsSync(PDF_DIR)) {
        console.error(`Directory not found!`);
        return;
    }

    const files = fs.readdirSync(PDF_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
    console.log(`Found ${files.length} PDFs to process.`);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await processPdf(path.join(PDF_DIR, file), file);
        
        // Wait 15 seconds between files to respect the free tier rate limits
        if (i < files.length - 1) {
            console.log(`Waiting 15 seconds to respect API rate limits...`);
            await delay(15000);
        }
    }
    
    console.log(`\n🎉 All PDFs processed! Check the 'scratch/fast_outputs' folder for the JSON files.`);
}

main();
