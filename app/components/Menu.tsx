"use client";
import { useState } from "react";
import Link from "next/link";

export default function Menu() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="w-full fixed top-0 left-0 z-50">
      {/* Barra superiore */}
      <div className="bg-white border-b border-stone-200 shadow-sm w-full h-16 flex items-center justify-between px-6">
        {/* Bottone menu a sinistra */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="bg-rose-500 text-white px-4 py-2 hover:bg-rose-600 rounded-md transition-colors"
        >
          Menu
        </button>

        {/* Nome del sito centrato */}
        <h1 className="text-2xl font-serif font-bold text-rose-800 absolute left-1/2 transform -translate-x-1/2">
          InteractiveBook
        </h1>

        {/* Spazio vuoto a destra per bilanciare */}
        <div className="w-20"></div>
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="absolute top-16 left-4 bg-white shadow-lg rounded-md w-48 border border-stone-200">
          <ul className="flex flex-col">
            <li>
              <Link 
                href="/" 
                className="block px-4 py-3 hover:bg-rose-50 text-stone-700 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                href="/SignUp" 
                className="block px-4 py-3 hover:bg-rose-50 text-stone-700 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            </li>
            <li>
              <Link 
                href="/AboutUs" 
                className="block px-4 py-3 hover:bg-rose-50 text-stone-700 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                About Us
              </Link>
            </li>
            <li>
              <Link 
                href="/CreateBook" 
                className="block px-4 py-3 hover:bg-rose-50 text-stone-700 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Create Book
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}