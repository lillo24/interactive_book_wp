"use client";
import Image from "next/image";
import Link from "next/link";
import Menu from "./components/Menu";
import { Heart, BookOpen, Users } from "react-feather";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-rose-100 text-rose-900">
      <Menu />

      <main className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <section className="text-center mb-24">
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="w-20 h-20 bg-rose-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <BookOpen className="text-rose-700" size={32} />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif text-rose-900">
              Crea storie che <span className="text-rose-700">uniscono</span>
            </h1>
            <p className="text-xl text-rose-800 mb-8 max-w-2xl mx-auto">
              Trasforma i vostri momenti speciali in libri interattivi,
              dove ogni pagina è un ricordo da vivere insieme.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/CreateBook" 
                className="px-8 py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-full font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-rose-300"
              >
                <Heart size={18} /> Crea il tuo libro
              </Link>
              <Link
                href="/book/demo"
                className="px-8 py-3 bg-white/80 border-2 border-rose-300 hover:border-rose-400 text-rose-800 rounded-full font-medium transition-all hover:bg-white"
              >
                Prova demo
              </Link>
              <Link 
                href="/gallery" 
                className="px-8 py-3 border-2 border-rose-300 hover:border-rose-400 text-rose-800 rounded-full font-medium transition-all hover:bg-white/50"
              >
                Vedi esempi
              </Link>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {[
            {
              icon: <Heart className="text-rose-600" size={28} />,
              title: "Per Coppie",
              desc: "Costruisci la vostra storia d'amore attraverso ricordi interattivi"
            },
            {
              icon: <Users className="text-amber-500" size={28} />,
              title: "Per Famiglie",
              desc: "Crea album di famiglia dove ognuno può contribuire"
            },
            {
              icon: <BookOpen className="text-purple-500" size={28} />,
              title: "Tradizione Digitale",
              desc: "Il fascino della carta unito alla magia dell'interattività"
            }
          ].map((item, index) => (
            <div key={index} className="bg-white/80 p-8 rounded-2xl border border-rose-200 hover:border-rose-300 transition-all shadow-sm hover:shadow-md backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-rose-900">{item.title}</h3>
              <p className="text-rose-800">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* Book Preview */}
        <section className="bg-white/90 rounded-3xl overflow-hidden border border-rose-200 p-8 md:p-12 mb-24 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 font-serif text-rose-900">Come funziona?</h2>
              <ul className="space-y-4">
                {[
                  "Scegli un modello o parti da zero",
                  "Aggiungi foto, video e messaggi",
                  "Personalizza con il vostro stile",
                  "Condividi e interagisci insieme"
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-rose-600 mr-3">✓</span>
                    <span className="text-rose-900">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-80 bg-gradient-to-br from-rose-100 to-rose-200 rounded-xl shadow-inner flex items-center justify-center border border-rose-300">
              <div className="absolute inset-4 border-2 border-dashed border-rose-300 rounded-lg flex items-center justify-center">
                <BookOpen className="text-rose-400" size={64} />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="text-center max-w-3xl mx-auto bg-rose-100/50 rounded-2xl p-8 border border-rose-200">
          <blockquote className="text-2xl italic text-rose-900 mb-6 font-serif">
            "Finalmente un modo per conservare i nostri viaggi e le nostre storie d'amore in qualcosa di più vivo di un semplice album fotografico"
          </blockquote>
          <div className="text-rose-700">— Maria e Luca, insieme da 5 anni</div>
        </section>
      </main>
    </div>
  );
}


function PagesContainer(){

  let pages = [
    {id: 1, title: 'Page 1'},
    {id: 2, title: 'Page 2'},
    {id: 3, title: 'Page 3'},
  ]

  const on_click = (id: number) => {
    console.log(id) 
  }

  const listItems = pages.map(element =>
    <Page content={element.title} on_click={() => on_click(element.id)}/>  
  );

  return (
    <div>
      {listItems}
    </div>
  )
}

type PageProps = {
  content: string,
  on_click: () => void,
}

function Page({content, on_click}: PageProps){
  return (
    <div onClick={on_click}>
      <p>{content}</p>
    </div>
  )
}
