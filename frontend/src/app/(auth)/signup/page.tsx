import { AuthContainer } from "../_ui/AuthContainer";
import { SignUpForm } from "../_ui/SignUpForm";

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
