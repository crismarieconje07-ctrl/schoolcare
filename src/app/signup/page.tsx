import Image from "next/image";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/signup-form";
import { Logo } from "@/components/shared/logo";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function SignUpPage() {
  const loginBg = PlaceHolderImages.find((img) => img.id === "login-background");

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
       <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <Logo className="mb-4 justify-center" />
            <h1 className="text-3xl font-bold font-headline">Create an Account</h1>
            <p className="text-balance text-muted-foreground">
              Enter your details below to create your account
            </p>
          </div>
          <SignUpForm />
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        {loginBg && (
          <Image
            src={loginBg.imageUrl}
            alt={loginBg.description}
            fill
            className="object-cover dark:brightness-[0.2] dark:grayscale"
            data-ai-hint={loginBg.imageHint}
          />
        )}
      </div>
    </div>
  );
}
