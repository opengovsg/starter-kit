export const FeatureItem = ({
  title,
  description,
}: {
  title: string
  description: string
}) => {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="prose-h4 text-base-content-strong">{title}</h4>
      <p className="prose-body-1">{description}</p>
    </div>
  )
}
