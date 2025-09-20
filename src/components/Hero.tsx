import { Mic, AudioLines } from "lucide-react";
import { useState } from "react";
import axios from "axios";

export default function Hero() {
  const [question, setQuestion] = useState("");
  const [, setLoading] = useState(false);

  const handleSend = async () => {
    if (!question.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/api/insurance/ask", {
        question,
      });
      console.log(response)
      // setAnswer(response.data.answer);
    } catch (error) {
      console.error("Failed to get answer", error);
      // setAnswer("Sorry, something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setQuestion(""); // Clear input
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <section className="flex flex-col items-center justify-center text-center py-28 bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 text-white">
      {/* Heading */}
      <h2 className="text-4xl md:text-5xl font-bold mb-10">
        Buy insurance as easily as ordering food
      </h2>

      {/* Ask AI Box */}
      <div className="flex items-center w-full max-w-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-full px-5 py-4 shadow-2xl border border-white/10 backdrop-blur-md mb-4">
        <span className="text-white/80 pr-3 text-xl">+</span>
        <input
          type="text"
          placeholder="Ask anything"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 bg-transparent outline-none text-white placeholder-white/60 text-lg"
        />
        <button
          onClick={handleSend}
          className="p-2 text-white/80 hover:text-white transition font-medium"
        >
          Send
        </button>
        <button className="p-2 text-white/80 hover:text-white transition">
          <Mic size={22} />
        </button>
        <button className="p-2 text-white/80 hover:text-white transition">
          <AudioLines size={22} />
        </button>
      </div>

    </section>
  );
}
