import Link from "next/link";
import { resetPasswordAction } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  weak_password: "Пароль должен быть не короче 8 символов.",
  password_mismatch: "Пароли не совпадают.",
  invalid_token: "Ссылка недействительна или устарела. Запросите новую.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  if (!token) {
    return (
      <div className="auth-page">
        <h1>Восстановление пароля</h1>
        <p className="auth-error">Ссылка недействительна.</p>
        <p>
          <Link href="/forgot-password">Запросить новую ссылку</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <h1>Новый пароль</h1>
      {error && <p className="auth-error">{ERROR_MESSAGES[error] ?? "Что-то пошло не так."}</p>}
      <form className="auth-form" action={resetPasswordAction}>
        <input type="hidden" name="token" value={token} />
        <div className="field">
          <label htmlFor="password">Новый пароль</label>
          <input id="password" name="password" type="password" required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="confirmPassword">Подтвердите пароль</label>
          <input id="confirmPassword" name="confirmPassword" type="password" required />
        </div>
        <button type="submit">Сохранить новый пароль</button>
      </form>
    </div>
  );
}
