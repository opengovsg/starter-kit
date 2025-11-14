export const FeatureItem = ({
  title,
  description,
}: {
  title: string
  description: string
}) => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="prose-h4 text-base-content-strong">{title}</h3>
      <p className="prose-body-1">{description}</p>
    </div>
  )
}
