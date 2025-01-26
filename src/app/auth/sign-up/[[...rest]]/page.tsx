import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white dark:bg-gray-800",
            formButtonPrimary: 'bg-black hover:bg-gray-800 text-sm normal-case',
          }
        }}
        path="/auth/sign-up"
        routing="path"
        signInUrl="/auth/sign-in"
      />
    </div>
  );
} 