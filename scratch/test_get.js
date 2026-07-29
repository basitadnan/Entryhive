import { getQuestions } from '../src/lib/questionBank.js';

async function test() {
    try {
        const qs = await getQuestions('fast_advance_maths', 'all', 10);
        console.log("Success! Questions:", qs.length);
        console.log("First question:", JSON.stringify(qs[0], null, 2));
    } catch(e) {
        console.error("Error:", e);
    }
}
test();
