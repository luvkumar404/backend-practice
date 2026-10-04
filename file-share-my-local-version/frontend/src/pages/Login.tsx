import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { getApiError } from "../api/axios";
import { loginUser } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { saveLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from?.pathname || "/dashboard";

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      saveLogin(data.access_token);
      toast.success("Logged in successfully.");
      navigate(returnTo, { replace: true });
    },
    onError: (error) => toast.error(getApiError(error, "Login failed.")),
  });

  return (
    <main className="page-shell flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <section className="surface w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-slate-950">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Log in to manage your secure files.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-3 top-3 text-slate-400" size={17} />
              <input id="email" type="email" className="input-field pl-10" {...register("email")} />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <div className="relative mt-2">
              <LockKeyhole className="pointer-events-none absolute left-3 top-3 text-slate-400" size={17} />
              <input
                id="password"
                type="password"
                className="input-field pl-10"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          New here?{" "}
          <Link to="/register" className="font-semibold text-slate-950 hover:underline">
            Create account
          </Link>
        </p>
      </section>
    </main>
  );
}
