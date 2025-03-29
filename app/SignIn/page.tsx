"use client";
import Menu from "../components/Menu";
import { useState } from "react";
import { mockSignIn } from "../lib/mockDb";
import Link from "next/link";
import { BookOpen } from "react-feather";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isLoggedIn = mockSignIn(email, password);
    if (isLoggedIn) {
      alert("Accesso riuscito!");
    } else {
      alert("Email o password sbagliate!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-rose-50 pt-16">
      <Menu />

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-stone-200">
          <div className="text-center mb-6">
            <BookOpen className="mx-auto text-rose-500" size={32} />
            <h1 className="text-3xl font-serif font-bold text-stone-800 mt-2">Accedi</h1>
            <p className="text-stone-600 mt-2">Accedi al tuo account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="la.tua@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-stone-400 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition bg-white/90 text-gray-600 placeholder:text-stone-300"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-stone-400 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition bg-white/90 text-gray-600 placeholder:text-stone-300"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-rose-200"
            >
              Accedi
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-600">
            Non hai un account?{" "}
            <Link 
              href="/SignUp" 
              className="font-medium text-rose-600 hover:text-rose-700 transition-colors"
            >
              Registrati ora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}