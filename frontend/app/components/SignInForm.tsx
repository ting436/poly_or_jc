"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function SignInForm() {
  const router = useRouter() 
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear the error message when the user starts typing
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      email: formData.email ? (validateEmail(formData.email) ? "" : "Invalid email format") : "Email is required",
      password: formData.password ? "" : "Password is required",
    };
  
    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/signin", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            email: formData.email,
            password: formData.password,
          }),
      });

      if (response.ok) {
          const data = await response.json();
          alert(data.message); // Show success message
          router.push("/dashboard");
      } else {
          const error = await response.json();
          // Check for specific error messages
          if (response.status === 401) {
              setErrors({ ...errors, form: error.detail }); // Display "Invalid email or password"
          } else {
              setErrors({ ...errors, form: "An unexpected error occurred. Please try again." });
          }
      }
  } catch (err) {
      console.error("Error signing in:", err);
      setErrors({ ...errors, form: "An unexpected error occurred. Please try again." });
  }
  };

  return (
    <div className="flex justify-center bg-rose-50 py-12">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-pink-400"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {errors.form && <p className="text-red-500 text-sm mt-1">{errors.form}</p>}

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
          >
            Sign In
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-700">
            Don't have an account? 
            <button 
              onClick={() => router.push('/register')}
              className="text-blue-500 hover:underline ml-1"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
