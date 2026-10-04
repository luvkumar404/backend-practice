import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { getApiError } from "../api/axios";
import { registerUser } from "../api/authApi";

const registerSchema = z.object({
  name: z.string().min(2, "Enter your name."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("Account created. Please log in.");
      navigate("/login");
    },
    onError: (error) => toast.error(getApiError(error, "Registration failed.")),
  });

  return (
    <main className="page-shell flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <section className="surface w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-slate-950">Create your account</h1>
        <p className="mt-2 text-sm text-slate-500">Start uploading and sharing files securely.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <div>
            <label className="field-label" htmlFor="name">
              Name
            </label>
            <div className="relative mt-2">
              <UserRound className="pointer-events-none absolute left-3 top-3 text-slate-400" size={17} />
              <input id="name" className="input-field pl-10" {...register("name")} />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

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
            <input id="password" type="password" className="input-field mt-2" {...register("password")} />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-slate-950 hover:underline">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
