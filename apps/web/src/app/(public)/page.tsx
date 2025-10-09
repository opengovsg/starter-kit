import { Button } from '@opengovsg/oui'

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        Create <span className="text-primary">T3</span> Turbo
      </h1>
      <Button>Test</Button>
    </div>
  )
}
