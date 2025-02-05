
    require("dotenv").config();
    const multer = require("multer");
    const pdfParse = require("pdf-parse");
    const fs = require("fs");
    const axios = require("axios");
    
    const upload = multer({ dest: "uploads/" });
    
    const parseResume = async (req, res, next) => {
        try {
            if (!req.file) return res.status(400).json({ error: "No file uploaded." });
    
            const filePath = req.file.path;
            const fileType = req.file.mimetype;
    
            if (fileType !== "application/pdf") {
                fs.unlinkSync(filePath);
                return res.status(400).json({ error: "Only PDF files are supported." });
            }
    
            const data = await pdfParse(fs.readFileSync(filePath));
            const extractedText = data.text;
    
            fs.unlinkSync(filePath);
            req.resumeData = await generateJsonFromText(extractedText);
    
            next();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error processing the file." });
        }
    };
    
    async function generateJsonFromText(resumeText) {
        const prompt = `
        You are an expert at extracting structured data from resumes. Analyze the following resume and return a JSON object containing all relevant details.
    
        ### **Instructions:**
        1. **Ensure Completeness**:
           - If a field is missing, return "unknown" instead of skipping it.
           - If a URL is missing, return "N/A".
    
        2. **Strict JSON Format**:
           - Return only a valid JSON object without additional explanation.
           - Maintain correct JSON syntax.
    
        3. **Extract the following fields**:
           - Personal details (name, email, phone, LinkedIn, GitHub, other links).
           - Languages and proficiency levels.
           - Education (degree, institution, location, expected graduation).
           - Technical skills (grouped into programming languages, technologies, development methods, AI/data, simulation, low-code).
           - Work experience (role, company, duration, responsibilities).
           - Projects (name, description, technologies used, key highlights).
           - Soft skills, certifications, and achievements.
    
        ### **Resume Content:**
        ---
        ${resumeText}
        ---
    
        ### **Expected JSON Format:**
        {
          "name": "Full Name",
          "contact": {
            "email": "Email Address",
            "phone": "Phone Number",
            "linkedin": "LinkedIn URL",
            "github": "GitHub URL",
            "other_links": ["Other relevant links"]
          },
          "languages": [
            { "language": "Language", "proficiency": "Proficiency level" }
          ],
          "education": [
            {
              "degree": "Degree Name",
              "institution": "University/Institution",
              "location": "City, Country",
              "expected_graduation": "Graduation Year"
            }
          ],
          "technical_skills": {
            "programming_languages": ["List of programming languages"],
            "technologies_tools": ["List of technologies and tools"],
            "software_development": ["Development methodologies"],
            "data_ai": ["Data analysis, AI, machine learning expertise"],
            "simulation_vr": ["Simulations, VR experience"],
            "low_code": ["Low-code platforms used"]
          },
          "experience": [
            {
              "position": "Job Title",
              "company": "Company Name",
              "duration": "Work Period",
              "description": "Brief description of responsibilities"
            }
          ],
          "projects": [
            {
              "title": "Project Name",
              "description": "Brief project description",
              "technologies_used": ["List of technologies used"],
              "highlights": "Notable achievements"
            }
          ],
          "soft_skills": ["List of soft skills"],
          "awards_achievements": ["List of awards, recognitions"],
          "certifications": ["List of certifications"]
        }
    
        **Return only the JSON object, without any additional text.**
        `;
    
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo", 
                messages: [
                    { role: "system", content: "You are an expert in structuring resume data." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.2
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
                }
            }
        );
    
        return JSON.parse(response.data.choices[0].message.content);
    }
    
    module.exports = {
        upload,
        parseResume
    };