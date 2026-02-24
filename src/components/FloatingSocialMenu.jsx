import { useState } from "react"
import { Share2, X } from "lucide-react"
import { FaWhatsapp, FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa"

export default function FloatingSocialMenu({
  whatsapp,
  facebook,
  instagram,
  tiktok,
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      
      {/* Redes */}
      {open && (
        <div className="flex flex-col items-end gap-3 transition-all duration-300">
          
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition"
              aria-label="WhatsApp"
            >
              <FaWhatsapp size={20} />
            </a>
          )}

          {facebook && (
            <a
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:scale-110 transition"
              aria-label="Facebook"
            >
              <FaFacebookF size={20} />
            </a>
          )}

          {instagram && (
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-pink-600 text-white p-3 rounded-full shadow-lg hover:scale-110 transition"
              aria-label="Instagram"
            >
              <FaInstagram size={20} />
            </a>
          )}

          {tiktok && (
            <a
              href={tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white p-3 rounded-full shadow-lg hover:scale-110 transition"
              aria-label="TikTok"
            >
              <FaTiktok size={20} />
            </a>
          )}
        </div>
      )}

      {/* Botón principal */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-coffee text-white p-4 rounded-full shadow-xl hover:scale-110 transition"
        aria-label="Redes sociales"
      >
        {open ? <X size={22} /> : <Share2 size={22} />}
      </button>
    </div>
  )
}
