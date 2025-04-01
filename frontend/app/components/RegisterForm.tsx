"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    school: ""

  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    school: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePasswordStrength = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      name: formData.name ? "" : "Name is required",
      email: formData.email ? (validateEmail(formData.email) ? "" : "Invalid email format") : "Email is required",
      password: formData.password ? "" : "Password is required",
      confirmPassword: formData.confirmPassword ? "" : "Confirm Password is required",
      school: formData.school ? "" : "School Name is required",
    };

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (formData.password && !validatePasswordStrength(formData.password)) {
      newErrors.password = "Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character.";
    }

    if (newErrors.name || newErrors.email || newErrors.password || newErrors.confirmPassword || newErrors.school) {
      setErrors(newErrors);
      return;
    }

    try {
        const response = await fetch("http://localhost:8000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                school: formData.school,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            alert(data.message); // Show success message

            // Automatically sign in the user after successful registration
            const signInResult = await signIn("credentials", {
                redirect: false, // Prevent automatic redirection
                email: formData.email,
                password: formData.password,
            });
            
            if (signInResult?.error) {
                alert("Sign-in failed: " + signInResult.error);
              } else {
                router.push("/dashboard"); // Redirect to dashboard on successful sign-in
              }
        } else {
            const error = await response.json();
            if (error.detail.includes("An account already exists")) {
                setErrors({ ...errors, email: error.detail }); // Set email-specific error
            } else {
                alert(`Error: ${error.detail}`); // Show generic error message
            }
        }
    } catch (err) {
        console.error("Error submitting form:", err);
        alert("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex justify-center bg-rose-50 py-6">
      <div className="bg-white pt-8 pb-4 px-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Register</h1>

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
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold">School Name</label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              placeholder="School Name"
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-pink-400"
            />
            {errors.school && <p className="text-red-500 text-sm mt-1">{errors.school}</p>}
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

          <div>
            <label className="block text-sm font-semibold">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-pink-400"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          {errors.form && <p className="text-red-500 text-sm mt-1">{errors.form}</p>}
          <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
          >
            Register
          </button>
          </div>
          <div className="text-center">
            <p className="text-sm">
              Already have an account?{" "}
              <a
                href="/sign-in"
                className="text-pink-500 hover:underline"
              >
                Sign in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}