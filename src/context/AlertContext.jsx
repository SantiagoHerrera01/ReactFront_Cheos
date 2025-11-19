import { createContext, useContext } from "react";
import Swal from "sweetalert2";

const AlertContext = createContext();

export function AlertProvider({ children }) {

  // 🔥 Siempre mismo formato de alerta
  const confirmDelete = async (resourceName = "elemento") => {
    const name =
      typeof resourceName === "string"
        ? resourceName
        : resourceName?.name || "elemento";

    const result = await Swal.fire({
      title: `¿Eliminar ${name}?`,
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      iconColor: "rgba(255, 0, 0, 1)",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "rgba(255, 0, 0, 1)",
    });

    return result.isConfirmed;
  };

  const successToast = (message = "Acción completada") => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: message,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const errorAlert = (message = "Ocurrió un error") => {
    Swal.fire("Error", message, "error");
  };

  return (
    <AlertContext.Provider value={{ confirmDelete, successToast, errorAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);
