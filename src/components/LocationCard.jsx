import { Pencil, Trash2 } from "lucide-react"

export default function LocationCard({
  location,
  isAdmin,
  onEdit,
  onDelete,
  desktop,
}) {
  const isOpen = location.is_active === true

  return (
    <div
      className={`
        relative w-full 
        ${desktop ? "md:w-[260px] md:h-[400px]" : ""}
        bg-white rounded-2xl shadow-lg border border-gray-100 
        flex-shrink-0 hover:shadow-xl transition overflow-hidden
      `}
    >
      {/* 🗺️ MAPA 70% */}
      <div
        className={`
          relative w-full overflow-hidden
          ${desktop ? "md:h-[270px]" : "h-56"}
        `}
      >
        {location.map_iframe ? (
          <div
            className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
            dangerouslySetInnerHTML={{ __html: location.map_iframe }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Sin mapa
          </div>
        )}

        {/* 🟢 Estado */}
        <div className="absolute bottom-2 left-2">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full shadow 
              ${
                isOpen
                  ? "bg-green-600 text-white"
                  : "bg-red-500 text-white"
              }`}
          >
            {isOpen ? "Abierta" : "Cerrada"}
          </span>
        </div>

        {isAdmin && (
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={onEdit}
              className="bg-white/90 hover:bg-coffee hover:text-white 
                         p-1.5 rounded-lg shadow transition-colors"
              title="Editar ubicación"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={onDelete}
              className="bg-white/90 hover:bg-red-500 hover:text-white 
                         p-1.5 rounded-lg shadow transition-colors"
              title="Eliminar ubicación"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* 📝 CONTENIDO 30% */}
      <div
        className={`
          p-4 -mt-2 flex flex-col justify-center
          ${desktop ? "md:h-[130px]" : ""}
        `}
      >
        <div className="overflow-hidden">
          {/* 🔥 Título más grande + mayúscula inicial */}
          <h3 className="font-semibold text-coffee text-lg capitalize line-clamp-1">
            {location.name}
          </h3>

          {/* Campos secundarios */}
          <div className="text-sm text-gray-600 space-y-1 mt-1 leading-tight">
            <p className="truncate capitalize">
              {location.address}
            </p>
            <p className="truncate capitalize">
              {location.city}, {location.department}
            </p>
            <p className="text-gray-500 truncate">
              📞 {location.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
