import { AuthContainer } from "../ui/AuthContainer";
import { SignInForm } from "../ui/SignInForm";

export default function RegisterPage() {
  return (
    <AuthContainer
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      <SignInForm />
    </AuthContainer>
  );
}
