"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { loginAction } from "@/app/login/actions";
import { registerAction } from "@/app/register/actions";

type Mode = "login" | "register" | null;

export function AuthButtons() {
  const [mode, setMode] = useState<Mode>(null);

  return (
    <>
      <div className="landing-auth-buttons">
        <button type="button" onClick={() => setMode("login")}>
          Войти
        </button>
        <button type="button" className="primary" onClick={() => setMode("register")}>
          Зарегистрироваться бесплатно
        </button>
      </div>

      {mode && createPortal(
        <div className="auth-modal-overlay" onClick={() => setMode(null)}>
          <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="auth-modal-close"
              onClick={() => setMode(null)}
              aria-label="Закрыть"
            >
              ×
            </button>

            {mode === "login" ? (
              <>
                <h2>Вход</h2>
                <form className="auth-form" action={loginAction}>
                  <div className="field">
                    <label htmlFor="modal-email">Email</label>
                    <input id="modal-email" name="email" type="email" required autoFocus />
                  </div>
                  <div className="field">
                    <label htmlFor="modal-password">Пароль</label>
                    <input id="modal-password" name="password" type="password" required />
                  </div>
                  <button type="submit">Войти</button>
                </form>
                <p>
                  <Link href="/forgot-password">Забыли пароль?</Link>
                </p>
                <p>
                  Нет аккаунта?{" "}
                  <button type="button" className="auth-modal-switch" onClick={() => setMode("register")}>
                    Зарегистрироваться
                  </button>
                </p>
              </>
            ) : (
              <>
                <h2>Регистрация</h2>
                <form className="auth-form" action={registerAction}>
                  <div className="field">
                    <label htmlFor="modal-firstName">Имя</label>
                    <input id="modal-firstName" name="firstName" type="text" required autoFocus />
                  </div>
                  <div className="field">
                    <label htmlFor="modal-lastName">Фамилия</label>
                    <input id="modal-lastName" name="lastName" type="text" required />
                  </div>
                  <div className="field">
                    <label htmlFor="modal-reg-email">Email</label>
                    <input id="modal-reg-email" name="email" type="email" required />
                  </div>
                  <div className="field">
                    <label htmlFor="modal-reg-password">Пароль</label>
                    <input
                      id="modal-reg-password"
                      name="password"
                      type="password"
                      minLength={8}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="modal-confirmPassword">Подтвердите пароль</label>
                    <input
                      id="modal-confirmPassword"
                      name="confirmPassword"
                      type="password"
                      minLength={8}
                      required
                    />
                  </div>
                  <button type="submit">Зарегистрироваться</button>
                </form>
                <p>
                  Уже есть аккаунт?{" "}
                  <button type="button" className="auth-modal-switch" onClick={() => setMode("login")}>
                    Войти
                  </button>
                </p>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
