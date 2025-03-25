"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation'

export default function SignInForm() {
  const router = useRouter() 
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    school: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    router.push("/dashboard");
  };

  return (
    <div className="flex justify-center bg-rose-50 py-12">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Let’s get to know you!</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">School</label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              placeholder="School"
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
}
