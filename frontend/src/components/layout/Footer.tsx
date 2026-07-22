import { Link } from "react-router-dom";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr]">
          <div>
            <div className="flex items-center gap-2 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 text-sm font-semibold text-white">
                AE
              </div>
              <div>
                <p className="font-semibold">Angola Express</p>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  e-commerce premium
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
              A sua loja online de confiança em Angola, com produtos
              cuidadosamente selecionados e uma experiência de compra mais
              fluida.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Links Rápidos</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="transition hover:text-white">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/produtos" className="transition hover:text-white">
                  Produtos
                </Link>
              </li>
              <li>
                <Link to="/categorias" className="transition hover:text-white">
                  Categorias
                </Link>
              </li>
              <li>
                <Link to="/promocoes" className="transition hover:text-white">
                  Promoções
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Ajuda</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/contacto" className="transition hover:text-white">
                  Contacto
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="transition hover:text-white">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/termos" className="transition hover:text-white">
                  Termos e Condições
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="transition hover:text-white">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Contacto</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-400" /> +244 900 000 000
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-400" />{" "}
                contato@angolaexpress.co.ao
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-400" /> Luanda, Angola
              </li>
            </ul>
            <Link
              to="/produtos"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Explorar produtos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} Angola Express. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
