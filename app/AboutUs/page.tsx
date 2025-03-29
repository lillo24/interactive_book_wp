"use client";
import Menu from "../components/Menu";
import { Heart, Users, Book } from "react-feather";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-rose-50 pt-16">
      <Menu />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-stone-800 mb-4">
            La nostra storia
          </h1>
          <div className="w-24 h-1 bg-rose-400 mx-auto"></div>
        </div>

        <div className="bg-white/90 p-8 rounded-2xl shadow-sm border border-stone-200">
          <div className="flex flex-col items-center text-center mb-8">
            <Book className="text-rose-500 mb-4" size={40} />
            <p className="text-stone-600 text-lg mb-6">
              Creiamo libri interattivi che trasformano i vostri momenti speciali in storie indimenticabili.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-rose-50/50 p-6 rounded-xl border border-rose-100">
              <div className="flex items-center gap-4 mb-3">
                <Heart className="text-rose-500" size={24} />
                <h3 className="font-semibold text-stone-800">Per coppie</h3>
              </div>
              <p className="text-stone-600 text-sm">
                Conservate la vostra storia d'amore in un formato unico e personale.
              </p>
            </div>

            <div className="bg-amber-50/50 p-6 rounded-xl border border-amber-100">
              <div className="flex items-center gap-4 mb-3">
                <Users className="text-amber-500" size={24} />
                <h3 className="font-semibold text-stone-800">Per famiglie</h3>
              </div>
              <p className="text-stone-600 text-sm">
                Create album di famiglia interattivi dove ognuno può contribuire.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center text-stone-500 text-sm">
            <p>Un progetto nato dalla passione per le storie e le connessioni umane.</p>
          </div>
        </div>
      </div>
    </div>
  );
}