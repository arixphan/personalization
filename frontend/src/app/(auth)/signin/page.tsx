import { AuthContainer } from "../_ui/auth-container";
import { SignInForm } from "../_ui/sign-in-form";

export default function SignInPage() {
  return (
    <AuthContainer
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      <SignInForm />
    </AuthContainer>
  );
}
