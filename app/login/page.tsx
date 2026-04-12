"use client"
import { signIn } from "next-auth/react"
import { FaGoogle, FaYoutube, FaInstagram, FaTelegram, FaWhatsapp, FaQuestionCircle } from "react-icons/fa"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        
        {/* Logo Dispara Link */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full border-4 border-gray-100 shadow-sm overflow-hidden bg-white">
            <Image 
              src="/logo.png"
              alt="Dispara Link"
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
        </div>

        <h1 className="text-2xl font-medium text-center text-gray-800 mb-2">
          Faça login
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">Dispara Link</p>

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
          <a href="https://youtube.com/@seucanal" target="_blank" className="text-red-600 text-2xl hover:scale-110 transition">
            <FaYoutube />
          </a>
          <a href="https://instagram.com/seuuser" target="_blank" className="text-pink-600 text-2xl hover:scale-110 transition">
            <FaInstagram />
          </a>
          <a href="https://t.me/seuuser" target="_blank" className="text-sky-500 text-2xl hover:scale-110 transition">
            <FaTelegram />
          </a>
          <a href="https://wa.me/5599999999999" target="_blank" className="text-green-500 text-2xl hover:scale-110 transition">
            <FaWhatsapp />
          </a>
          <a href="https://disparalink.com/ajuda" target="_blank" className="text-blue-600 text-2xl hover:scale-110 transition">
            <FaQuestionCircle />
          </a>
        </div>

        <p className="text-center text-gray-500 text-sm">
          © 2025 Dispara Link
        </p>
      </div>
    </div>
  )
}
