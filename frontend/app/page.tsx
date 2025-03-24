'use client'
import { useEffect } from 'react'
import { useState } from "react";
import { useRouter } from 'next/navigation'
import Image from "next/image";
import reddit from "./images/reddit.png"
import math from "./images/math.png"
import Navbar from './components/Navbar'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    localStorage.clear()
  }, [])

  const images = [reddit, math]; // Array of images
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };


  return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center p-6">
      <Navbar />
      {/* <header className="w-full flex justify-between items-center py-4 px-8">
        <h1 className="text-xl font-bold">Educational Pathway Advisor</h1>
        <nav className="space-x-6">
          <a href="/" className="text-gray-700 hover:text-black">Home</a>
          <a href="/dashboard" className="text-gray-700 hover:text-black">Services</a>
          <a href="#" className="text-gray-700 hover:text-black">Contact Us</a>
        </nav>
      </header> */}

      <main className="w-full max-w-3xl mt-10 text-center">
        <h2 className="text-3xl py-10 font-semibold">Poly or JC?</h2>
        <div className="relative w-full max-w-full mx-auto">
          {/* Display Current Image */}
          <Image
            src={images[currentIndex]}
            alt="Slider Image"
            className="w-full h-auto rounded-lg object-cover"
            priority
          />

          {/* Left Arrow Button */}
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-80 transition sm:p-2"
          >
            ⬅
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-80 transition sm:p-2"
          >
            ➡
          </button>
        </div>
      </main>

      <div className="mt-6 text-center">
        <p className="text-gray-700">
          Familiar with these articles? If you've spent countless hours racking your brains, chat with us!
        </p>
        <button className="mt-4 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
          Chat
        </button>
      </div>
    </div>
  );

}