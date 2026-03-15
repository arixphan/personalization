import { AuthContainer } from "../_ui/auth-container";
import { SignUpForm } from "../_ui/sign-up-form";

export default function SignUpPage() {
  return (
    <AuthContainer
      title="Create Account"
      subtitle="Join us and start managing your productivity"
    >
      <SignUpForm />
    </AuthContainer>
  );
}
