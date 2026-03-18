import { AuthContainer } from "../_ui/auth-container";
import { SignInForm } from "../_ui/sign-in-form";
import { useTranslations } from "next-intl";

export default function SignInPage() {
  const t = useTranslations("Auth");

  return (
    <AuthContainer
      title={t("signIn.title")}
      subtitle={t("signIn.subtitle")}
    >
      <SignInForm />
    </AuthContainer>
  );
}
