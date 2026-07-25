import Link from "next/link";
import { requestPasswordResetAction } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_email: "Введите email.",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  return (
    <div className="auth-page">
      <h1>Восстановление пароля</h1>

      {sent ? (
        <p>
          Если такой email зарегистрирован — на него отправлено письмо со ссылкой для
          сброса пароля. Проверьте почту.
        </p>
      ) : (
        <>
          {error && (
            <p className="auth-error">{ERROR_MESSAGES[error] ?? "Что-то пошло не так."}</p>
          )}
          <form className="auth-form" action={requestPasswordResetAction}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required autoFocus />
            </div>
            <button type="submit">Отправить ссылку для сброса</button>
          </form>
        </>
      )}

      <p>
        Вспомнили пароль? <Link href="/login">Войти</Link>
      </p>
    </div>
  );
}
