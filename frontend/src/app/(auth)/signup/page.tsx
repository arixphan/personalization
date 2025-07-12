import { AuthContainer } from "../ui/AuthContainer";
import { SignUpForm } from "../ui/SignUpForm";

export default function RegisterPage() {
  return (
    <AuthContainer
      title="Create Account"
      subtitle="Join us and start managing your productivity"
    >
      <SignUpForm />
    </AuthContainer>
  );
}
