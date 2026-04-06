const functions = require("firebase-functions");
const { WebhookClient } = require("dialogflow-fulfillment");
const fetch = require("node-fetch");

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(async (req, res) => {

  const agent = new WebhookClient({ request: req, response: res });

  function courseDetails(agent) {
    const course = agent.parameters.course;

    if (course === "btech") {
      agent.add("BTech is a 4-year engineering program with branches like CSE, Mechanical, Civil, etc.");
    } else if (course === "bca") {
      agent.add("BCA is a 3-year course focused on programming and software development.");
    } else if (course === "mba") {
    agent.add("MBA is a 2-year postgraduate program focused on business management, marketing, finance, and leadership skills.");
  }else {
      agent.add("Please specify a valid course.");
    }
  }
  function specialization(agent) {
  const course = agent.parameters.course;

  if (course === "btech") {
    agent.add("BTech offers specializations like Cyber Security, AI/ML, Full Stack Development, Computer Science, Mechanical, Civil, Electrical, and Electronics.");
  } 
  else if (course === "mba") {
    agent.add("MBA offers specializations like Marketing, Finance, Human Resources, Operations, and Business Analytics.");
  } 
  else {
    agent.add("Please specify the course like BTech or MBA.");
  }
}

  // 💰 Course Fees (YOUR OWN ANSWER)
  function courseFees(agent) {
    const course = agent.parameters.course;

    if (course === "btech") {
      agent.add("BTech fees are around ₹1–3 lakh per year.");
    } else if (course === "bca") {
      agent.add("BCA fees are around ₹50,000–₹1,50,000 per year.");
    } else if (course === "mba") {
    agent.add("MBA fees are around ₹80,000–₹2 lakh per year.");
  }else {
      agent.add("Please specify a valid course.");
    }
  }

  async function aiResponse(agent) {
    const userQuery = req.body.queryResult.queryText;

    try { // ✅ FIXED (added try)

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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", // 🔑 PUT YOUR KEY
          "Content-Type": "application/json",
          "HTTP-Referer": "https://yourapp.com",
          "X-Title": "UniversityBot"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct",
          messages: [
            {
              role: "system",
              content: "You are a university chatbot. Answer in 3-5 bullet points only. Avoid long paragraphs."
            },
            {
              role: "user",
              content: userQuery
            }
          ]
        })
      });

      const data = await response.json();

      console.log("API RESPONSE:", JSON.stringify(data));

      if (!data.choices || !data.choices[0]) {
        agent.add("AI not responding properly.");
        return;
      }

      const reply = data.choices[0].message.content;
      agent.add(reply);

    } catch (error) {
      console.error("❌ ERROR:", error);
      agent.add("AI error. Try again.");
    }
  }


  let intentMap = new Map();

  // 🔥 YOUR ANSWERS
  intentMap.set("Course Details Intent", courseDetails);
  intentMap.set("Course Fees Intent", courseFees);
 intentMap.set("Specialization Intent", specialization);


  // 🤖 AI fallback
  intentMap.set("Default Fallback Intent", aiResponse);
  intentMap.set("Default Welcome Intent", aiResponse);

  agent.handleRequest(intentMap);
});