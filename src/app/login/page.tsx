import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/shared/logo";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LoginPage() {
  const loginBg = PlaceHolderImages.find((img) => img.id === "login-background");

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <Logo className="mb-4 justify-center" />
            <h1 className="text-3xl font-bold font-headline">Welcome Back</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
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
