export default async function handler(req, res) {
    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");  // Allow all origins
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();  // Handle CORS preflight request
    }

    if (req.method !== 'POST') {
        return res.status(400).json({ error: "Only POST requests are allowed" });
    }

    try {
        const { message } = req.body;

        // Fetch JSON files directly from GitHub (Fixed URLs)
        const projects = await fetch("https://raw.githubusercontent.com/Rokesh28/rokesh28.github.io/refs/heads/main/projects/projects.json").then(res => res.json());
        const skills = await fetch("https://raw.githubusercontent.com/Rokesh28/rokesh28.github.io/refs/heads/main/skills.json").then(res => res.json());
        const experiences = await fetch("https://raw.githubusercontent.com/Rokesh28/rokesh28.github.io/refs/heads/main/workexperience.json").then(res => res.json());
        const info = await fetch("https://raw.githubusercontent.com/Rokesh28/rokesh28.github.io/refs/heads/main/information.json").then(res => res.json());

        let context = `Projects: ${JSON.stringify(projects)}, Skills: ${JSON.stringify(skills)}, workexperience: ${JSON.stringify(experiences)}, Information: ${JSON.stringify(info)}`;

        let chatHistory = [
            { role: "system", content: `You are an AI assistant for Rokesh Prakash's website and your name is Jarvis. Answer the questions very polite and respectful based on the following information:\n\n${context}` },
            { role: "user", content: message }
        ];

        // Call OpenAI API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4-turbo",
                messages: chatHistory
            })
        });

        const data = await response.json();
        if (!data.choices) throw new Error(`OpenAI API Error: ${JSON.stringify(data)}`);

        return res.status(200).json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error("Chatbot Error:", error);
        return res.status(500).json({ error: `Error: ${error.message}` });
    }
}
