const fs = require('fs');

async function enrich() {
    const questions = JSON.parse(fs.readFileSync('parsed_questions_flat.json', 'utf8'));
    const apiKey = 'AIzaSyByH8GjT1-fH2cXai_SbC_rPNDKuCY3kUQ';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const toProcess = questions.filter(q => q.correct_answer_index === null);
    console.log(`Enriching ${toProcess.length} questions...`);

    // Limit to 5 for now to test and avoid hanging
    const limit = 5;
    let count = 0;

    for (let i = 0; i < questions.length && count < limit; i++) {
        const q = questions[i];
        if (q.correct_answer_index !== null) continue;

        console.log(`Solving [${count + 1}/${limit}]: ${q.question_text.substring(0, 50)}...`);

        const prompt = `
        Solve this NAT (National Aptitude Test) question.
        Question: ${q.question_text}
        Options: ${q.options.map((o, idx) => String.fromCharCode(65 + idx) + ') ' + o).join(', ')}
        
        Return ONLY a JSON object in this format:
        {
          "correct_answer_index": <0 for A, 1 for B, etc>,
          "explanation": "<short explanation>"
        }
        `;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await response.json();
            
            if (data.error) {
                console.error(`API Error: ${data.error.message}`);
                continue;
            }

            if (data.candidates && data.candidates[0]) {
                const text = data.candidates[0].content.parts[0].text;
                const jsonMatch = text.match(/\{.*\}/s);
                if (jsonMatch) {
                    const result = JSON.parse(jsonMatch[0]);
                    q.correct_answer_index = result.correct_answer_index;
                    q.explanation = result.explanation;
                    count++;
                }
            } else {
                console.error(`Unexpected response structure:`, JSON.stringify(data));
            }
        } catch (e) {
            console.error(`Error solving question ${i}:`, e.message);
        }
    }

    fs.writeFileSync('parsed_questions_enriched_sample.json', JSON.stringify(questions.filter(q => q.correct_answer_index !== null), null, 2));
    console.log(`Enrichment complete for ${count} questions. Results in parsed_questions_enriched_sample.json`);
}

enrich();
