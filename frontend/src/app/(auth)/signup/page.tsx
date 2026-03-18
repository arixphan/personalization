"use client";

import { AuthContainer } from "../_ui/auth-container";
import { SignUpForm } from "../_ui/sign-up-form";
import { useTranslations } from "next-intl";

export default function SignUpPage() {
  const t = useTranslations("Auth");

  return (
    <AuthContainer
      title={t("signUp.title")}
      subtitle={t("signUp.subtitle")}
    >
      <SignUpForm />
    </AuthContainer>
  );
}
