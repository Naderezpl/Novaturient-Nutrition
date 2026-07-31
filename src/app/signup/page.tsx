"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/auth-store";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const signupClient = useAuthStore((state) => state.signupClient);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    signupClient(values.fullName, values.email);
    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardDescription>Client account</CardDescription>
          <CardTitle className="font-[family-name:var(--font-display)] text-4xl">
            Create account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="text-sm text-slate-500">Full name</label>
              <Input {...form.register("fullName")} />
              <p className="text-xs text-rose-500">{form.formState.errors.fullName?.message}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-500">Email</label>
              <Input {...form.register("email")} />
              <p className="text-xs text-rose-500">{form.formState.errors.email?.message}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-500">Password</label>
              <Input type="password" {...form.register("password")} />
              <p className="text-xs text-rose-500">{form.formState.errors.password?.message}</p>
            </div>

            <Button className="w-full" size="lg" type="submit">
              Create client account
            </Button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-slate-900 underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
