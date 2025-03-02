import { useState, useEffect, FormEvent } from "react";
import axios from "axios";

interface Expense {
  text: string;
  category: string;
  amount: number;
}

const ExpenseCategorizer = () => {

    const [text, setText] = useState<string>("");
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    return JSON.parse(localStorage.getItem("expenses") || "[]");
  });

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    try {
      const response = await axios.post<{ amount: number; category: string }>(
        "https://expensecategorizer.onrender.com/categorize", 
        { text }
      );
      setExpenses([...expenses, { text, ...response.data }]);
      setText("");
    } catch (error) {
      console.error("Error categorizing expense", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Expense Categorizer</h1>
      <form onSubmit={handleSubmit} className="mb-6 flex gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border p-3 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-500"
          placeholder="Enter expense description..."
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow">Submit</button>
      </form>
      <div className="overflow-hidden rounded-lg shadow-lg">
        <table className="w-full border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="border p-4 text-left">Description</th>
              <th className="border p-4 text-left">Category</th>
              <th className="border p-4 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, index) => (
              <tr key={index} className="border even:bg-gray-100 hover:bg-gray-200 transition">
                <td className="p-4 border">{expense.text}</td>
                <td className="p-4 border">{expense.category}</td>
                <td className="p-4 border font-semibold text-gray-700">{expense.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExpenseCategorizer