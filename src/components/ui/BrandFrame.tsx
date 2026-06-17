import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  rightSlot?: ReactNode
}

export function BrandFrame({ children, rightSlot }: Props) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <img className="logo" src="/brand/logo-horiz-white.svg" alt="Salesforce" />
        {rightSlot}
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}
