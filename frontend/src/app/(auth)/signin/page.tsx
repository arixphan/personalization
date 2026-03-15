import { AuthContainer } from "../_ui/AuthContainer";
import { SignInForm } from "../_ui/SignInForm";

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
