interface CustomerInfoProps {
  customer: {
    name: string
    email: string
  }
}

export function CustomerInfo({ customer }: CustomerInfoProps) {
  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <p className="font-medium">{customer.name}</p>
      <div className="h-[1px] bg-border/60 my-2 border-t border-border" />
      <p className="text-sm text-muted-foreground">{customer.email}</p>
    </div>
  )
} 