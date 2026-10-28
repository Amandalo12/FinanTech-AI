import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Icon } from "./Icons";

interface Props {
  onSubmit: (text: string) => boolean | void;
  disabled: boolean;
  loading: boolean;
  autoFocus?: boolean;
}

const MAX_LENGTH = 2000;

export function Composer({ onSubmit, disabled, loading, autoFocus }: Props) {
  const [value, setValue] = useState("");
  const [notice, setNotice] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value]);

  useEffect(() => {
    if (autoFocus && !disabled) ref.current?.focus();
  }, [autoFocus, disabled]);

  const submit = () => {
    if (disabled || loading) return;
    if (!value.trim()) {
      setNotice("Digite uma pergunta para começar.");
      ref.current?.focus();
      return;
    }
    if (onSubmit(value) !== false) {
      setValue("");
      setNotice("");
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  return (
    <form className={`composer glass${disabled ? " is-disabled" : ""}`} onSubmit={onFormSubmit}>
      <label htmlFor="composer-input" className="sr-only">
        Pergunte ao professor
      </label>
      <textarea
        id="composer-input"
        ref={ref}
        rows={1}
        value={value}
        maxLength={MAX_LENGTH}
        disabled={disabled}
        placeholder="O que você quer aprender sobre o mercado financeiro?"
        onChange={(e) => {
          setValue(e.target.value);
          if (notice) setNotice("");
        }}
        onKeyDown={onKeyDown}
        aria-describedby="composer-help"
      />
      <button
        type="submit"
        className={`send-btn${loading ? " is-loading" : ""}`}
        disabled={disabled || loading}
        aria-label={loading ? "Aguardando resposta" : "Enviar pergunta"}
      >
        {loading ? <span className="spinner" aria-hidden="true" /> : <Icon name="send" size={20} />}
      </button>
      <p id="composer-help" className="composer-help" role="status">
        {notice ? (
          <span className="composer-notice">{notice}</span>
        ) : (
          <>
            <kbd>Enter</kbd> envia · <kbd>Shift</kbd> + <kbd>Enter</kbd> quebra a linha
            {value.length > MAX_LENGTH - 300 && (
              <span className="counter">
                {" "}
                · {value.length}/{MAX_LENGTH}
              </span>
            )}
          </>
        )}
      </p>
    </form>
  );
}
