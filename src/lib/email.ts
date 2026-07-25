export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // нет ключа Resend — скорее всего локальная разработка. Печатаем ссылку
    // в консоль, чтобы можно было проверить весь флоу без настоящей почты.
    console.log(`[email] Ссылка для сброса пароля для ${to}: ${resetUrl}`);
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "whatiwatch <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Восстановление пароля — whatiwatch",
      html: `
        <p>Вы запросили сброс пароля на whatiwatch.</p>
        <p><a href="${resetUrl}">Нажмите здесь, чтобы задать новый пароль</a></p>
        <p>Ссылка действует 1 час. Если вы не запрашивали сброс пароля — просто проигнорируйте это письмо.</p>
      `,
    }),
  });

  if (!res.ok) {
    throw new Error(`Не удалось отправить письмо: ${res.status} ${await res.text()}`);
  }
}
