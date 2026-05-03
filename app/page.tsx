"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaBook } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Home() {
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState("");
  const [editText, setEditText] = useState("");

  const [aiPlan, setAiPlan] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const [savedPlans, setSavedPlans] = useState<string[][]>([]);
  const [darkMode, setDarkMode] = useState(false);

  // ---------------- FETCH ----------------
  const fetchSubjects = async () => {
    const res = await axios.get("/api/subjects");
    setSubjects(res.data);
  };

  useEffect(() => {
    fetchSubjects();

    const saved = localStorage.getItem("savedPlans");
    if (saved) setSavedPlans(JSON.parse(saved));

    const current = localStorage.getItem("currentPlan");
    if (current) setAiPlan(JSON.parse(current));
  }, []);

  // ---------------- CLEAR PLAN IF NO SUBJECTS ----------------
  useEffect(() => {
    if (subjects.length === 0) {
      setAiPlan([]);
      localStorage.removeItem("currentPlan");
    }
  }, [subjects]);

  
  // ---------------- SAVE CURRENT PLAN ----------------
  useEffect(() => {
    if (aiPlan.length > 0) {
      localStorage.setItem("currentPlan", JSON.stringify(aiPlan));
    }
  }, [aiPlan]);

  // ---------------- ADD ----------------
  const addSubject = async () => {
    if (!subject) return;

    const exists = subjects.some(
      (s) => s.name.toLowerCase() === subject.toLowerCase()
    );

    if (exists) {
      toast.error("Subject already exists ⚠️");
      return;
    }

    setLoading(true);
    await axios.post("/api/subjects", { name: subject });
    setSubject("");
    setLoading(false);

    toast.success("Subject Added 🎉");
    fetchSubjects();
  };

  // ---------------- DELETE ----------------
  const deleteSubject = async (id: string) => {
    await axios.delete(`/api/subjects?id=${id}`);
    toast.success("Deleted ❌");
    fetchSubjects();
  };

  // ---------------- EDIT ----------------
  const startEdit = (sub: any) => {
    setEditingId(sub._id);
    setEditText(sub.name);
  };

  const updateSubject = async () => {
    await axios.put("/api/subjects", {
      id: editingId,
      name: editText,
    });

    toast.success("Updated ✏️");
    setEditingId("");
    setEditText("");
    fetchSubjects();
  };

  // ---------------- MANUAL AI BUTTON ----------------
  const generateAIPlan = async () => {
    if (subjects.length === 0) {
      toast.error("Add subjects first");
      return;
    }

    try {
      setAiLoading(true);

      const res = await axios.post("/api/ai", {
        subjects: subjects.map((s) => s.name),
      });

      const plans = res.data.result
        .split("\n")
        .filter((line: string) => line.trim() !== "")
        .map((line: string) => line.replace(/^\d+\.\s*/, ""));

      setAiPlan(plans);

      toast.success("AI Plan Ready 🤖");
    } catch {
      const fallback = subjects.map(
        (s, i) => `${s.name}: Study ${i + 1} hours daily`
      );
      setAiPlan(fallback);

      toast("Using basic plan ⚡");
    } finally {
      setAiLoading(false);
    }
  };

  // ---------------- SAVE FULL PLAN ----------------
  const saveFullPlan = () => {
    if (aiPlan.length === 0) return;

    const updated = [...savedPlans, aiPlan];
    setSavedPlans(updated);
    localStorage.setItem("savedPlans", JSON.stringify(updated));

    toast.success("Plan Saved 📌");
  };

  const deleteSavedPlan = (index: number) => {
    const updated = savedPlans.filter((_, i) => i !== index);
    setSavedPlans(updated);
    localStorage.setItem("savedPlans", JSON.stringify(updated));
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center p-6 transition ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-blue-100 to-purple-200 text-black"
      }`}
    >
      {/* DARK MODE BUTTON */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-6 right-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg"
      >
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

      {/* TITLE */}
      <h1 className="text-5xl font-extrabold mb-6 text-center">
        AI Smart Study Planner 🚀
      </h1>

      {/* INPUT */}
      <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <input
          type="text"
          placeholder="Enter subject..."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-3 border rounded mb-4 text-black"
        />

        <button
          onClick={addSubject}
          className="w-full bg-blue-600 text-white p-3 rounded-lg"
        >
          {loading ? "Adding..." : "Add Subject"}
        </button>

        <button
          onClick={generateAIPlan}
          className="w-full mt-3 bg-purple-600 text-white p-3 rounded-lg"
        >
          {aiLoading ? "Generating..." : "Generate AI Plan 🤖"}
        </button>
      </div>

      {/* SUBJECT LIST */}
      <div className="mt-8 w-full max-w-md">
        {subjects.map((sub: any) => (
          <motion.div
            key={sub._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded-xl shadow mb-3 flex justify-between items-center"
          >
            {editingId === sub._id ? (
              <>
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="border p-2 rounded mr-2 w-full text-black"
                />
                <button
                  onClick={updateSubject}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <span className="flex items-center gap-2">
                  <FaBook /> {sub.name}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(sub)}
                    className="bg-yellow-400 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteSubject(sub._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* AI PLAN */}
      {aiPlan.length > 0 && (
        <div className="mt-10 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-purple-400">
            🤖 Smart Study Plan
          </h2>

          <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded-lg shadow">
            {aiPlan.map((item, index) => (
              <div key={index} className="mb-2">
                • {item}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={saveFullPlan}
              className="bg-green-600 text-white px-4 py-2 rounded w-full"
            >
              Save Full Plan 📌
            </button>

            <button
              onClick={() => {
                setAiPlan([]);
                localStorage.removeItem("currentPlan");
              }}
              className="bg-red-500 text-white px-4 py-2 rounded w-full"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* SAVED PLANS */}
      {savedPlans.length > 0 && (
        <div className="mt-10 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-green-400">
            📌 Saved Plans
          </h2>

          {savedPlans.map((plan, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded-lg shadow mb-4"
            >
              {plan.map((item, i) => (
                <div key={i} className="mb-1">
                  • {item}
                </div>
              ))}

              <button
                onClick={() => deleteSavedPlan(index)}
                className="mt-2 bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <footer className="mt-10 text-sm">
        Built by <b>Bhavana Seelam | https://github.com/bhavanaseelam | https://www.linkedin.com/in/bhavana-seelam</b>
      </footer>
    </div>
  );
}