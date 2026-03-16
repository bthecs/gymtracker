import { redirect } from "next/navigation";

/**
 * La raíz redirige a la vista de actividades (resumen semanal).
 */
export default function HomePage() {
  redirect("/actividades");
}
