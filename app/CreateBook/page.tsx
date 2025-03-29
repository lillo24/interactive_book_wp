"use client";
import { Plus, Image, Type, Settings } from "react-feather"; // Icone corrette
import Link from "next/link";
import Menu from "../components/Menu";

export default function CreateBook() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <Menu />

      <header className="bg-white border-b border-stone-200 p-4 mt-16">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">Crea il tuo libro</h1>
          <div className="flex gap-2">
            <button className="p-2 rounded-full hover:bg-stone-100">
              <Settings className="text-stone-500" size={20} />
            </button>
            <button className="px-4 py-2 bg-rose-500 text-white rounded-md text-sm hover:bg-rose-600">
              Salva bozza
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 mt-6">
        <div className="bg-white border border-stone-300 rounded-lg shadow-sm p-8 mb-8 max-w-3xl mx-auto">
          <div className="aspect-[3/4] bg-stone-100 rounded flex items-center justify-center">
            <p className="text-stone-400">Anteprima del libro</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg font-medium mb-4">Aggiungi elementi</h2>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: <Type size={18} />, label: "Testo" }, // Icona Type invece di Text
              { icon: <Image size={18} />, label: "Immagine" },
              { icon: <Plus size={18} />, label: "Pagina" }
            ].map((item, index) => (
              <button 
                key={index}
                className="flex flex-col items-center gap-2 p-4 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <span className="text-stone-600">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-between border-t border-stone-200 pt-4">
            <Link href="/" className="text-stone-500 hover:text-stone-700 text-sm">
              ← Torna alla home
            </Link>
            <button className="px-6 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors">
              Anteprima libro
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-stone-200 p-4 mt-8">
        <div className="container mx-auto text-center text-stone-500 text-sm">
          <p>Libri interattivi per coppie e famiglie</p>
        </div>
      </footer>
    </div>
  );
}