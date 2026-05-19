import { SignUp } from '@clerk/nextjs';

export default function SignUpPage(): React.JSX.Element {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <SignUp />
    </div>
  );
}
