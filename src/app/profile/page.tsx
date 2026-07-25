import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileAction, changePasswordAction } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  missing_name: "Укажите имя и фамилию.",
  weak_password: "Новый пароль должен быть не короче 8 символов.",
  password_mismatch: "Новые пароли не совпадают.",
  wrong_current_password: "Текущий пароль указан неверно.",
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    saved?: string;
    passwordChanged?: string;
  }>;
}) {
  const { error, saved, passwordChanged } = await searchParams;

  const session = await auth();
  const userId = Number(session!.user.id);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const dateOfBirthValue = user.dateOfBirth
    ? user.dateOfBirth.toISOString().slice(0, 10)
    : "";

  return (
    <div className="profile-page">
      <h1>Профиль</h1>

      {saved && <p className="auth-success">Данные сохранены.</p>}
      {passwordChanged && <p className="auth-success">Пароль изменён.</p>}
      {error && <p className="auth-error">{ERROR_MESSAGES[error] ?? "Что-то пошло не так."}</p>}

      <section className="profile-section">
        <h2>Личные данные</h2>
        <form className="auth-form" action={updateProfileAction}>
          <div className="field">
            <label htmlFor="firstName">Имя</label>
            <input id="firstName" name="firstName" type="text" defaultValue={user.firstName} required />
          </div>
          <div className="field">
            <label htmlFor="lastName">Фамилия</label>
            <input id="lastName" name="lastName" type="text" defaultValue={user.lastName} required />
          </div>
          <div className="field">
            <label htmlFor="city">Город</label>
            <input id="city" name="city" type="text" defaultValue={user.city ?? ""} />
          </div>
          <div className="field">
            <label htmlFor="dateOfBirth">Дата рождения</label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              defaultValue={dateOfBirthValue}
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={user.email} disabled />
          </div>
          <button type="submit">Сохранить</button>
        </form>
      </section>

      <section className="profile-section">
        <h2>Сменить пароль</h2>
        <form className="auth-form" action={changePasswordAction}>
          <div className="field">
            <label htmlFor="currentPassword">Текущий пароль</label>
            <input id="currentPassword" name="currentPassword" type="password" required />
          </div>
          <div className="field">
            <label htmlFor="newPassword">Новый пароль</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              minLength={8}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="confirmNewPassword">Подтвердите новый пароль</label>
            <input
              id="confirmNewPassword"
              name="confirmNewPassword"
              type="password"
              minLength={8}
              required
            />
          </div>
          <button type="submit">Сменить пароль</button>
        </form>
      </section>
    </div>
  );
}
