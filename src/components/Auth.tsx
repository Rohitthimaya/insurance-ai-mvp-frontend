import { useState } from "react";
import axios from "axios";

interface AuthProps {
  onLogin: () => void; // callback to notify App
}

export default function Auth({ onLogin }: AuthProps) {
  const [isRegister, setIsRegister] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    try {
      if (isRegister) {
        await axios.post("http://localhost:3000/api/register", { name, email, password });
        setMessage("Registered successfully! You can now log in.");
        setIsRegister(false);
      } else {
        const res = await axios.post("http://localhost:3000/api/login", { email, password });
        localStorage.setItem("token", res.data.token);
        setMessage("Login successful!");

        // ✅ Notify parent that login succeeded
        onLogin();
      }
    } catch (err) {
      setMessage("Error: " + (err|| "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{isRegister ? "Register" : "Login"}</h2>

      {isRegister && (
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition"
      >
        {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
      </button>

      {message && <p className="mt-3 text-center text-red-500">{message}</p>}

      <p className="mt-4 text-center text-sm text-gray-600">
        {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
        <span
          onClick={() => setIsRegister(!isRegister)}
          className="text-indigo-600 cursor-pointer font-medium"
        >
          {isRegister ? "Login" : "Register"}
        </span>
      </p>
    </div>
  );
}
