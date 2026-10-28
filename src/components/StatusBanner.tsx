import { Icon } from "./Icons";
import type { ApiStatus } from "../types";

interface Props {
  status: ApiStatus;
  onRecheck: () => void;
}

export function StatusBanner({ status, onRecheck }: Props) {
  if (status !== "unconfigured" && status !== "offline") return null;

  return (
    <div className="notice notice--warn" role="alert">
      <Icon name="alert" />
      <div>
        <strong>{status === "unconfigured" ? "Professor de IA não configurado" : "Servidor indisponível"}</strong>
        <p>
          {status === "unconfigured"
            ? "Defina a variável GROQ_API_KEY no servidor (backend/.env) e reinicie o back-end. Veja o README."
            : "Não foi possível conectar ao back-end FastAPI. Inicie o servidor na porta 8000 (veja o README)."}
        </p>
      </div>
      <button type="button" className="btn btn--ghost" onClick={onRecheck}>
        <Icon name="refresh" size={16} /> Verificar novamente
      </button>
    </div>
  );
}
