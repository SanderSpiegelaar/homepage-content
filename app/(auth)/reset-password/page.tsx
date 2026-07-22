import { ResetPasswordForm } from "@/components/auth/password-forms"

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string | string[]
    error?: string | string[]
  }>
}) {
  const { token, error } = await searchParams

  return (
    <ResetPasswordForm
      token={typeof token === "string" ? token : undefined}
      invalid={error === "INVALID_TOKEN"}
    />
  )
}
