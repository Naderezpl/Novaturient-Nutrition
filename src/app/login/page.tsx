"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getDefaultRedirect, useAuthStore } from "@/lib/auth-store";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  role: z.enum(["client", "dietitian"]),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
          <div className="rounded-full border border-white/60 bg-white/70 px-6 py-3 text-sm text-slate-500 backdrop-blur-xl">
            Loading...
          </div>
        </main>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useAuthStore((state) => state.login);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      role: params.get("role") === "dietitian" ? "dietitian" : "client",
    },
  });
  const selectedRole = useWatch({ control: form.control, name: "role" });

  const onSubmit = (values: FormValues) => {
    const result = login(values.role, values.email, values.password);

    if (!result.success) {
      form.setError("root", {
        message: result.error ?? "Unable to sign in.",
      });
      return;
    }

    router.push(getDefaultRedirect(result.role));
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardDescription>Welcome back</CardDescription>
          <CardTitle className="font-[family-name:var(--font-display)] text-4xl">Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-3 rounded-[24px] bg-white/70 p-2">
              {(["client", "dietitian"] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => form.setValue("role", role)}
                  className={`rounded-[18px] px-3 py-3 text-sm capitalize transition ${
                    selectedRole === role ? "bg-[#ede8f5] text-slate-900" : "text-slate-500"
                  }`}
                >
                  {role}
                </button>
              ))}
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
              Enter workspace
            </Button>
            <p className="text-xs text-rose-500">{form.formState.errors.root?.message}</p>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            New client?{" "}
            <Link href="/signup" className="font-medium text-slate-900 underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
