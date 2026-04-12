import { signIn } from "next-auth/react"
import { FaGoogle, FaYoutube, FaInstagram, FaTelegram, FaWhatsapp, FaQuestionCircle } from "react-icons/fa"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border-gray-100 p-8">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full border-4 border-gray-100 shadow-sm overflow-hidden">
            <Image 
              src="/logo.png" // Troca pelo caminho da sua logo
              alt="Logo"
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-medium text-center text-gray-800 mb-8">
          Faça login
        </h1>

        {/* Botão Google */}
        <button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 transition"
        >
          <FaGoogle className="text-blue-500 text-xl" />
          Entrar com Google
        </button>

        {/* Divisor */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Ícones sociais */}
        <div className="flex justify-center gap-5 mb-8">
          <a href="#" target="_blank" className="text-red-600 text-2xl hover:scale-110 transition">
            <FaYoutube />
          </a>
          <a href="#" target="_blank" className="text-pink-600 text-2xl hover:scale-110 transition">
            <FaInstagram />
          </a>
          <a href="#" target="_blank" className="text-sky-500 text-2xl hover:scale-110 transition">
            <FaTelegram />
          </a>
          <a href="#" target="_blank" className="text-green-500 text-2xl hover:scale-110 transition">
            <FaWhatsapp />
          </a>
          <a href="#" target="_blank" className="text-blue-600 text-2xl hover:scale-110 transition">
            <FaQuestionCircle />
          </a>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm">
          © 2025
        </p>
      </div>
    </div>
  )
}
