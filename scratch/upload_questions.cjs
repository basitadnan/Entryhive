const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fnrrxofmvyamgbspypok.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucnJ4b2ZtdnlhbWdic3B5cG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzU2ODIsImV4cCI6MjA5MzQ1MTY4Mn0.Dyn05z0kZnjaCaWao1lMXcNuUXcl3W-4yGzg9qb0Ik4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function upload() {
    console.log('Reading parsed questions...');
    const data = JSON.parse(fs.readFileSync('parsed_questions_flat.json', 'utf8'));
    console.log(`Found ${data.length} questions. Starting upload...`);

    const batchSize = 50;
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const { error } = await supabase.from('questions').insert(batch);
        
        if (error) {
            console.error(`Error uploading batch ${i/batchSize + 1}:`, error.message);
        } else {
            console.log(`Uploaded batch ${i/batchSize + 1}/${Math.ceil(data.length/batchSize)}`);
        }
    }

    console.log('Upload complete!');
}

upload();
