import Link from "next/link";
import { registerAction } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_email: "Введите корректный email.",
  weak_password: "Пароль должен быть не короче 8 символов.",
  email_taken: "Этот email уже зарегистрирован.",
  missing_name: "Укажите имя и фамилию.",
  password_mismatch: "Пароли не совпадают.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="auth-page">
      <h1>Регистрация</h1>
      {error && <p className="auth-error">{ERROR_MESSAGES[error] ?? "Что-то пошло не так."}</p>}
      <form className="auth-form" action={registerAction}>
        <div className="field">
          <label htmlFor="firstName">Имя</label>
          <input id="firstName" name="firstName" type="text" required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="lastName">Фамилия</label>
          <input id="lastName" name="lastName" type="text" required />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div className="field">
          <label htmlFor="password">Пароль</label>
          <input id="password" name="password" type="password" minLength={8} required />
        </div>
        <div className="field">
          <label htmlFor="confirmPassword">Подтвердите пароль</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            minLength={8}
            required
          />
        </div>
        <button type="submit">Зарегистрироваться</button>
      </form>
      <p>
        Уже есть аккаунт? <Link href="/login">Войти</Link>
      </p>
    </div>
  );
}
