'use client'
import Navbar from '../components/Navbar'
import ContactForm from '../components/ContactForm'

export default function Form() {

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center p-6">
      <Navbar />

      <main className="w-full max-w-3xl mt-10 text-center">
        <ContactForm/>
      </main>
    </div>
  );

}