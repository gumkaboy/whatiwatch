import Link from "next/link";
import { loginAction } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Неверный email или пароль.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const { error, reset } = await searchParams;

  return (
    <div className="auth-page">
      <h1>Вход</h1>
      {reset && <p className="auth-success">Пароль изменён, теперь можно войти.</p>}
      {error && <p className="auth-error">{ERROR_MESSAGES[error] ?? "Что-то пошло не так."}</p>}
      <form className="auth-form" action={loginAction}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="password">Пароль</label>
          <input id="password" name="password" type="password" required />
        </div>
        <button type="submit">Войти</button>
      </form>
      <p>
        <Link href="/forgot-password">Забыли пароль?</Link>
      </p>
      <p>
        Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
      </p>
    </div>
  );
}
