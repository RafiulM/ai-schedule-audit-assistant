import { SiteHeader } from "@/components/site-header"

export default function APIKeysLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader title="API Keys" />
      {children}
    </>
  )
}